from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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
from supabase import create_client, Client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Email config
PRACTITIONER_EMAIL = "elorffatiha1189@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

# Supabase config
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Supabase credentials missing!")
    supabase: Client = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Utilitaires de validation (Gardés de ton code) ---
def sanitize_input(text: str, max_length: int = 60) -> str:
    if not text: return text
    text = html.escape(text.strip())
    return text[:max_length]

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_date(date_str: str) -> bool:
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError: return False

# --- Modèles ---
class AppointmentCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str
    service_type: str
    date: str
    time_slot: str
    comment: Optional[str] = None

class TimeSlot(BaseModel):
    time: str
    available: bool

class AvailableSlotsResponse(BaseModel):
    date: str
    slots: List[TimeSlot]

# --- Fonctions Email ---
def send_confirmation_email(data: dict):
    if not GMAIL_APP_PASSWORD: return
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Confirmation de RDV - Hijama Sunnah"
        msg['From'] = PRACTITIONER_EMAIL
        msg['To'] = data['email']
        
        body = f"Bonjour {data['first_name']}, votre RDV est confirmé pour le {data['date']} à {data['time_slot']}."
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(PRACTITIONER_EMAIL, GMAIL_APP_PASSWORD)
            server.sendmail(PRACTITIONER_EMAIL, data['email'], msg.as_string())
    except Exception as e:
        logging.error(f"Email error: {e}")

# --- Routes API ---

@api_router.get("/appointments/slots/{date}", response_model=AvailableSlotsResponse)
async def get_available_slots(date: str):
    if not validate_date(date):
        raise HTTPException(status_code=400, detail="Date invalide")

    # Définir les créneaux selon le jour (Sam/Dim vs Semaine)
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    if date_obj.weekday() in [5, 6]:
        all_times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
    else:
        all_times = ["18:00", "18:30", "19:00", "19:30"]

    # LIRE DANS SUPABASE pour voir ce qui est déjà pris
    response = supabase.table("rendez_vous").select("time_slot").eq("date", date).execute()
    booked_times = [item['time_slot'] for item in response.data]

    slots = [
        TimeSlot(time=t, available=(t not in booked_times))
        for t in all_times
    ]
    return AvailableSlotsResponse(date=date, slots=slots)

@api_router.post("/appointments")
async def create_appointment(appointment: AppointmentCreate):
    # Vérifier si déjà pris
    check = supabase.table("rendez_vous").select("*").eq("date", appointment.date).eq("time_slot", appointment.time_slot).execute()
    if check.data:
        raise HTTPException(status_code=400, detail="Déjà réservé")

    # INSÉRER DANS SUPABASE
    data = appointment.model_dump()
    # On adapte les clés pour ta table Supabase "rendez_vous"
    supabase_data = {
        "nom": f"{data['first_name']} {data['last_name']}",
        "telephone": data['phone'],
        "date": data['date'],
        "time_slot": data['time_slot'],
        "email": data['email'],
        "prestation": data['service_type']
    }
    
    result = supabase.table("rendez_vous").insert(supabase_data).execute()
    
    # Envoyer l'email
    send_confirmation_email(data)
    
    return {"status": "success", "data": result.data}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
