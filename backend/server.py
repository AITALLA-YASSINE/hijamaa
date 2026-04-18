from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import html
import time
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Email config
PRACTITIONER_EMAIL = "elorffatiha1189@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

# Supabase config
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
supabase_client = None

try:
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logging.info("Supabase connected successfully")
except Exception as e:
    logging.warning(f"Supabase connection failed: {e}")
    supabase_client = None

def sync_to_supabase(appointment_data: dict):
    """Sync appointment to Supabase table"""
    if not supabase_client:
        return
    try:
        supabase_data = {
            "nom": f"{appointment_data.get('first_name', '')} {appointment_data.get('last_name', '')}",
            "telephone": appointment_data.get('phone', ''),
            "date": appointment_data.get('date', ''),
            "email": appointment_data.get('email', '')
        }
        supabase_client.table("rendez_vous").insert(supabase_data).execute()
        logging.info(f"Synced appointment to Supabase for {supabase_data['nom']}")
    except Exception as e:
        logging.error(f"Supabase sync error: {e}")

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

from fastapi.responses import FileResponse

@app.get("/download-zip")
def download_zip():
    return FileResponse(
        path="/root/hijama-sunnah-complete.zip",
        filename="hijama-sunnah-complete.zip",
        media_type="application/zip"
    )

# --- SECURITY: Rate limiting ---
rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 30  # max requests per window

def check_rate_limit(client_ip: str):
    now = time.time()
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store[client_ip] if now - t < RATE_LIMIT_WINDOW
    ]
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Trop de requêtes. Veuillez réessayer dans une minute.")
    rate_limit_store[client_ip].append(now)

# --- SECURITY: Input sanitization ---
def sanitize_input(text: str, max_length: int = 60) -> str:
    if not text:
        return text
    text = html.escape(text.strip())
    text = re.sub(r'[<>{}|\\^`]', '', text)
    # Remove SQL injection patterns
    sql_patterns = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)",
        r"(--|;|/\*|\*/|xp_|sp_)",
        r"(\bOR\b\s+\d+\s*=\s*\d+)",
        r"(\bAND\b\s+\d+\s*=\s*\d+)",
    ]
    for pattern in sql_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    return text[:max_length]

def sanitize_phone(phone: str) -> str:
    return re.sub(r'[^\d+\s\-()]', '', phone)[:20]

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email)) and len(email) <= 60

def validate_date(date_str: str) -> bool:
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

def validate_time(time_str: str) -> bool:
    return bool(re.match(r'^\d{2}:\d{2}$', time_str))

# Hijama knowledge base for chatbot
HIJAMA_SYSTEM_PROMPT = """Tu es l'assistante virtuelle bienveillante de Fatiha ELORF, infirmière diplômée d'état et praticienne certifiée en hijama (ventousothérapie). 
Tu réponds TOUJOURS en français, de manière simple, rassurante et chaleureuse.

IMPORTANT: Tu dois comprendre les questions peu importe comment elles sont formulées (fautes d'orthographe, langage familier, abréviations, verlan, etc.).
Si quelqu'un dit "bjr", "slt", "cc", "wsh" etc., tu comprends que c'est un salut et tu réponds chaleureusement.
Si quelqu'un pose une question de manière informelle, tu réponds quand même de façon professionnelle.

INFORMATION CLÉ: La hijama chez Fatiha est EXCLUSIVEMENT RÉSERVÉE AUX FEMMES.

Voici les informations EXACTES:

**Services et Tarifs:**
- Hijama sèche: 45€ (ventouses fournies)
- Hijama humide: 45€ (ventouses fournies)
- Hijama sportive: 45€ (ventouses fournies)  
- Hijama bien-être: 45€ (ventouses fournies)
- Hijama visage (sèche): 35€ - anti-âge, acné, rides, drainage lymphatique
- Hijama corps entier: 70€ (ventouses fournies)

**Hijama du visage:**
La hijama du visage est une forme de hijama sèche (sans incision). Elle consiste à appliquer de petites ventouses sur la peau pour créer une légère aspiration, souvent accompagnée de mouvements type massage.
Bienfaits: améliore la circulation sanguine (teint lumineux), effet anti-âge (raffermit la peau, lisse les rides), stimule le drainage lymphatique (réduit poches et cernes), purifie la peau (diminue acné et imperfections), détend les muscles du visage (effet relaxant).

**Consultation et Adaptation**
- Cela dépend de l'état de santé, des symptômes et des traitements. Un avis personnalisé est nécessaire.

**Bienfaits et Pathologies traitées**
- Fatigue, stress, douleurs musculaires, migraines, troubles circulatoires, règles douloureuses, SOPK et infertilité.
- Maladies chroniques: diabète, hypertension, troubles thyroïdiens, arthrose, arthrite, anémie.

**Contre-indications**
- Personnes sous anticoagulants, début de grossesse, infections, chimiothérapie/radiothérapie, femmes en période de règles.
- Fatigue légère: la Hijama est conseillée car elle aide à atténuer l'anxiété.

**Préparation**
- Être à jeun: manger très léger 2 à 3h avant la séance.
- Ne pas arrêter ses traitements médicaux. Contre-indiquée pour personnes sous anticoagulants.

**Déroulement de la séance**
- Fonctionnement: ventouses aspirent la peau pour stimuler la circulation + extraction des toxines.
- Méthode: combinaison Hijama sèche et humide (thérapeutique).
- Fréquence: dépend du cas de chaque personne.
- Douleur: PAS douloureux. Incisions très superficielles, légers picotements.
- Durée: 30 à 45 minutes.
- Matériel STÉRILE et à USAGE UNIQUE. Peau désinfectée avec antiseptique et compresses stériles. Praticienne CERTIFIÉE et INFIRMIÈRE DIPLÔMÉE D'ÉTAT.

**Après la séance**
- Marques: normal d'avoir des marques circulaires ou bleus. Disparaissent entre 3 jours et 1 semaine.
- Effets secondaires possibles: léger étourdissement les premières minutes. Tensiomètre et dattes disponibles.
- Repos le jour même, boire beaucoup d'eau, éviter de manger gras, éviter le sport 24h-48h. Douche autorisée.

**Horaires:**
- Samedi et Dimanche: 9h à 18h
- Lundi à Vendredi: 18h à 20h

**Contact:** WhatsApp 07 43 56 51 89

**Règles STRICTES:**
1. Toujours répondre de manière rassurante, professionnelle et bienveillante
2. Si une question dépasse tes connaissances: "Je préfère vous mettre en relation avec Fatiha pour une réponse personnalisée. N'hésitez pas à la contacter sur WhatsApp au 07 43 56 51 89"
3. N'invente JAMAIS de conseils médicaux
4. Propose toujours la prise de rendez-vous ou le contact WhatsApp
5. Rappelle que c'est réservé aux femmes si pertinent
6. Sois concise mais complète
"""

# Models with validation
class AppointmentCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str
    service_type: str
    date: str
    time_slot: str
    comment: Optional[str] = None

    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_names(cls, v):
        v = sanitize_input(v, 40)
        if not v or len(v) < 1:
            raise ValueError('Le nom est requis')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        return sanitize_phone(v)

    @field_validator('email')
    @classmethod
    def validate_email_field(cls, v):
        if not validate_email(v):
            raise ValueError('Email invalide')
        return v.strip()[:60]

    @field_validator('service_type')
    @classmethod
    def validate_service(cls, v):
        allowed = ["Hijama sèche", "Hijama humide", "Hijama sportive", "Hijama bien-être", "Hijama visage", "Hijama corps entier"]
        if v not in allowed:
            raise ValueError('Type de prestation invalide')
        return v

    @field_validator('date')
    @classmethod
    def validate_date_field(cls, v):
        if not validate_date(v):
            raise ValueError('Date invalide')
        return v

    @field_validator('time_slot')
    @classmethod
    def validate_time_field(cls, v):
        if not validate_time(v):
            raise ValueError('Créneau horaire invalide')
        return v

    @field_validator('comment')
    @classmethod
    def validate_comment(cls, v):
        if v:
            return sanitize_input(v, 200)
        return v

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    phone: str
    email: str
    service_type: str
    date: str
    time_slot: str
    comment: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    session_id: str
    message: str

    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        v = v.strip()
        if len(v) > 500:
            v = v[:500]
        return v

    @field_validator('session_id')
    @classmethod
    def validate_session(cls, v):
        return sanitize_input(v, 60)

class ChatResponse(BaseModel):
    response: str

class ChatHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TimeSlot(BaseModel):
    time: str
    available: bool

class AvailableSlotsResponse(BaseModel):
    date: str
    slots: List[TimeSlot]

class ContactMessage(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    message: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        return sanitize_input(v, 60)

    @field_validator('phone')
    @classmethod
    def validate_phone_field(cls, v):
        return sanitize_phone(v)

    @field_validator('message')
    @classmethod
    def validate_msg(cls, v):
        return sanitize_input(v, 500)

class ContactResponse(BaseModel):
    success: bool
    message: str

# Email sending functions
def send_confirmation_email(appointment_data: dict):
    """Send confirmation email to client and notification to practitioner"""
    try:
        if not GMAIL_APP_PASSWORD:
            logging.warning("Gmail App Password not configured, skipping email")
            return False

        client_email = appointment_data.get('email', '')
        if not client_email:
            return False

        # Client email
        client_subject = "Confirmation de votre rendez-vous - Hijama Sunnah"
        client_html = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF9F6; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #2D312E; font-size: 24px;">Hijama Sunnah</h1>
                <div style="height: 2px; background: linear-gradient(90deg, #C5A059, transparent); margin: 16px 0;"></div>
                
                <h2 style="color: #A8B5A2;">Votre rendez-vous est confirmé !</h2>
                
                <div style="background: #F3EFE9; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p><strong>Date:</strong> {appointment_data.get('date', '')}</p>
                    <p><strong>Heure:</strong> {appointment_data.get('time_slot', '')}</p>
                    <p><strong>Prestation:</strong> {appointment_data.get('service_type', '')}</p>
                    <p><strong>Nom:</strong> {appointment_data.get('first_name', '')} {appointment_data.get('last_name', '')}</p>
                </div>
                
                <div style="background: #FFF8E7; border-left: 4px solid #C5A059; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold; color: #2D312E;">Adresse du rendez-vous :</p>
                    <p style="margin: 4px 0; color: #6C706B;">80 ter route de Bondy, 93600 Aulnay-sous-Bois</p>
                    <p style="margin: 4px 0; color: #6C706B; font-size: 13px;">Le stationnement est possible devant chez moi.</p>
                </div>
                
                <div style="background: #FFF0F0; border-radius: 8px; padding: 12px; margin: 16px 0;">
                    <p style="margin: 0; color: #c0392b; font-size: 13px;"><strong>Important :</strong> Je n'accepte pas les accompagnements. Merci de prévoir l'appoint.</p>
                </div>
                
                <h3 style="color: #2D312E;">Recommandations avant la séance :</h3>
                <ul style="color: #6C706B;">
                    <li>Être à jeun 2 à 3h avant (l'eau est autorisée)</li>
                    <li>Prévoir des vêtements confortables</li>
                </ul>
                
                <p style="color: #6C706B; margin-top: 24px; font-style: italic;">
                    Merci de votre confiance. Prenez soin de vous !<br>
                    <strong>Fatiha ELORF</strong> - Infirmière diplômée d'état
                </p>
                
                <div style="text-align: center; margin-top: 24px;">
                    <a href="https://wa.me/33743565189" style="background: #25D366; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold;">WhatsApp: 07 43 56 51 89</a>
                </div>
            </div>
        </body>
        </html>
        """

        _send_email(client_email, client_subject, client_html)

        # Practitioner notification
        practitioner_subject = f"Nouveau RDV - {appointment_data.get('first_name', '')} {appointment_data.get('last_name', '')}"
        practitioner_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Nouveau rendez-vous</h2>
            <p><strong>Client:</strong> {appointment_data.get('first_name', '')} {appointment_data.get('last_name', '')}</p>
            <p><strong>Email:</strong> {appointment_data.get('email', '')}</p>
            <p><strong>Téléphone:</strong> {appointment_data.get('phone', '')}</p>
            <p><strong>Date:</strong> {appointment_data.get('date', '')}</p>
            <p><strong>Heure:</strong> {appointment_data.get('time_slot', '')}</p>
            <p><strong>Prestation:</strong> {appointment_data.get('service_type', '')}</p>
            <p><strong>Commentaire:</strong> {appointment_data.get('comment', 'Aucun')}</p>
        </body>
        </html>
        """

        _send_email(PRACTITIONER_EMAIL, practitioner_subject, practitioner_html)
        return True

    except Exception as e:
        logging.error(f"Email sending error: {str(e)}")
        return False

def _send_email(to_email: str, subject: str, html_content: str):
    """Send email via Gmail SMTP"""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = PRACTITIONER_EMAIL
    msg['To'] = to_email
    msg.attach(MIMEText(html_content, 'html'))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(PRACTITIONER_EMAIL, GMAIL_APP_PASSWORD)
        server.sendmail(PRACTITIONER_EMAIL, to_email, msg.as_string())

# Routes
@api_router.get("/")
async def root():
    return {"message": "Hijama Sunnah API"}

# Chatbot endpoint
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_input: ChatMessage, request: Request):
    check_rate_limit(request.client.host)
    try:
        session_id = chat_input.session_id

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=HIJAMA_SYSTEM_PROMPT
        ).with_model("openai", "gpt-4o")

        history = await db.chat_history.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", 1).to_list(50)

        for msg in history:
            if msg['role'] == 'user':
                chat.messages.append({"role": "user", "content": msg['content']})
            else:
                chat.messages.append({"role": "assistant", "content": msg['content']})

        user_msg = ChatHistory(
            session_id=session_id,
            role="user",
            content=chat_input.message
        )
        user_doc = user_msg.model_dump()
        user_doc['timestamp'] = user_doc['timestamp'].isoformat()
        await db.chat_history.insert_one(user_doc)

        user_message = UserMessage(text=chat_input.message)
        response = await chat.send_message(user_message)

        assistant_msg = ChatHistory(
            session_id=session_id,
            role="assistant",
            content=response
        )
        assistant_doc = assistant_msg.model_dump()
        assistant_doc['timestamp'] = assistant_doc['timestamp'].isoformat()
        await db.chat_history.insert_one(assistant_doc)

        return ChatResponse(response=response)

    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        return ChatResponse(
            response="Je suis désolée, je rencontre un problème technique. Veuillez contacter Fatiha directement sur WhatsApp au 07 43 56 51 89."
        )

# Appointment endpoints
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment: AppointmentCreate, request: Request):
    check_rate_limit(request.client.host)
    try:
        existing = await db.appointments.find_one({
            "date": appointment.date,
            "time_slot": appointment.time_slot,
            "status": {"$ne": "cancelled"}
        }, {"_id": 0})

        if existing:
            raise HTTPException(status_code=400, detail="Ce créneau est déjà réservé. Veuillez en choisir un autre.")

        appointment_obj = Appointment(**appointment.model_dump())
        doc = appointment_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()

        await db.appointments.insert_one(doc)

        # Send confirmation emails (non-blocking)
        try:
            send_confirmation_email(doc)
        except Exception as e:
            logging.error(f"Email sending failed: {str(e)}")

        # Sync to Supabase
        try:
            sync_to_supabase(doc)
        except Exception as e:
            logging.error(f"Supabase sync failed: {str(e)}")

        return appointment_obj

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Appointment creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création du rendez-vous")

@api_router.get("/appointments/slots/{date}", response_model=AvailableSlotsResponse)
async def get_available_slots(date: str):
    if not validate_date(date):
        raise HTTPException(status_code=400, detail="Format de date invalide")

    # Determine day of week
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    day_of_week = date_obj.weekday()  # 0=Monday, 6=Sunday

    # Determine slots based on day
    if day_of_week in [5, 6]:  # Saturday=5, Sunday=6
        all_slots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
            "17:00", "17:30"
        ]
    elif day_of_week in [0, 1, 2, 3, 4]:  # Monday-Friday
        all_slots = ["18:00", "18:30", "19:00", "19:30"]
    else:
        all_slots = []

    booked = await db.appointments.find(
        {"date": date, "status": {"$ne": "cancelled"}},
        {"_id": 0, "time_slot": 1}
    ).to_list(100)

    booked_times = [b['time_slot'] for b in booked]

    slots = [
        TimeSlot(time=slot, available=slot not in booked_times)
        for slot in all_slots
    ]

    return AvailableSlotsResponse(date=date, slots=slots)

# Contact form
@api_router.post("/contact", response_model=ContactResponse)
async def submit_contact(contact: ContactMessage, request: Request):
    check_rate_limit(request.client.host)
    try:
        doc = {
            "id": str(uuid.uuid4()),
            "name": contact.name,
            "phone": contact.phone,
            "email": contact.email or "",
            "message": contact.message,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.contacts.insert_one(doc)
        return ContactResponse(success=True, message="Message envoyé avec succès")
    except Exception as e:
        logging.error(f"Contact error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi du message")

# Admin data export endpoint
@api_router.get("/admin/appointments")
async def get_all_appointments():
    appointments = await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"appointments": appointments, "total": len(appointments)}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
