import React, { useState, useEffect, useRef } from "react";
import "@/App.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MessageCircle, X, Send, Phone, Clock, Heart, Sparkles, Leaf,
  Activity, ChevronDown, Check, Droplets, Zap, Shield, Award,
  ArrowRight, Menu, User, Star, Play, Pause, Volume2,
  ChevronLeft, ChevronRight, Quote, GraduationCap, Mail
} from "lucide-react";

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const isDateDisabled = (date) => {
  const today = getTodayStart();
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
};

const API = "/api";
const WHATSAPP_NUMBER = "33743565189";
const WHATSAPP_DISPLAY = "07 43 56 51 89";

// Logo
const LOGO_URL = "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/wv6q8njv_image.png";

// Testimonial images
const testimonialImages = [
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/aigog9tj_WhatsApp%20Image%202kll026-04-14%20at%2019.51.28.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/4a5a4deo_WhatsApp%20Image%202026-04-14%20at%2011.15.07.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/9m1c32td_WhatsApp%20Image%202026-04-14%20at%2019.5kkk1.29.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/xxid3c7t_WhatsApp%20Image%202026-04-14%20at%2019.51.28.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/ganwwuwa_WhatsApp%20Image%202026-04-14%20at%2019.51.29.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/m8ah0bzd_WhatsApp%20Image%202026-04-14%20at%2019.51.219.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/dgtg6lyb_WhatsApp%20Image%202026-04-12%20at%2021.4888995.40.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/kdwdr4iy_WhatsApp%20Image%202026-04-14%20at%2019.51.2944.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/o7lryqwq_WhatsApp%20Image%202026444-04-14%20at%2019.51.29.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/brjvnuyl_WhatsApp%20Image%202044426-04-14%20at%2019.51.28.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/6ew3ywe6_WhatsApp%20Image%2020278886-04-14%20at%2019.51.28.jpeg"
];

const audioTestimonials = [
  { url: "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/2z8766jr_WhatsApp%20Audio%202026-04-14%20at%2011.19.22.mp4", title: "Témoignage 1" },
  { url: "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/eqviah5o_WhatsApp%20Audio%202026-04-14%20at%2016.34.53.ogg", title: "Témoignage 2" },
  { url: "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/eoxwg4ql_WhatsApp%20Audio%202026-04-14%20at%2019.34.57.ogg", title: "Témoignage 3" },
  { url: "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/mecdalyy_WhatsApp%20Audio%202026-04-14%20at%2023.04.11.mp4", title: "Témoignage 4" },
  { url: "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/4309dd9o_WhatsApp-Ptt-2026-04-12-at-22.20.43.mp3", title: "Témoignage 5" }
];

const diplomaImage = "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/ubl5uoz2_WhatsApp%20Image%202026-04-14%20at%2000.54.05.jpeg";
const bookImages = [
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/f1txo1ew_WhatsApp%20Image%202026-04-14%20444at%2000.59.19.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/gt6bf0ny_WhatsApp%20Image%202026-04-14%20a44444t%2000.59.19.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/z0e2pwhr_WhatsApp%20Image%202026-04-14%20at%2000.59.197888.jpeg",
  "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/c40cqfz2_WhatsApp%20Image%20202478886-04-14%20at%2000.59.19.jpeg"
];
const practiceLocationVideo = "https://customer-assets.emergentagent.com/job_hijama-wellness-1/artifacts/5odruogi_WhatsApp%20Video%202026-04-14%20at%2001.06.46.mp4";

// Navigation
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "#bienfaits", label: "Bienfaits" },
    { href: "#avis", label: "Avis" },
    { href: "#services", label: "Services" },
    { href: "#recommandations", label: "Conseils" },
    { href: "#contact", label: "Contact" }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm py-2" : "py-4"}`} data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="font-serif text-xl text-[#2D312E]">Hijama <span className="text-[#C5A059]">Sunnah</span></span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => <a key={l.href} href={l.href} className="nav-link text-sm">{l.label}</a>)}
          <a href="#reservation"><Button className="bg-[#A8B5A2] hover:bg-[#8FA389] text-white rounded-full px-5 text-sm" data-testid="nav-book-btn">Réserverrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr</Button></a>
        </div>
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-btn">
          <Menu className="w-6 h-6 text-[#2D312E]" />
        </button>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-[rgba(45,49,46,0.08)]">
            <div className="px-6 py-4 space-y-3">
              {links.map(l => <a key={l.href} href={l.href} className="block py-2 text-[#6C706B]" onClick={() => setMobileMenuOpen(false)}>{l.label}</a>)}
              <a href="#reservation" onClick={() => setMobileMenuOpen(false)}><Button className="w-full bg-[#A8B5A2] hover:bg-[#8FA389] text-white rounded-full">Réserver</Button></a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
console.log("API URL:", API);

// Hero
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
    <div className="absolute inset-0 bg-gradient-to-br from-[#FAF9F6] via-[#F3EFE9] to-[#FAF9F6]" />
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1617995815236-7f06f6e53180?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBzcGElMjBtYXNzYWdlJTIwd2VsbG5lc3MlMjByZWxheGF0aW9ufGVufDB8fHx8MTc3NjAzNzc5M3ww&ixlib=rb-4.1.0&q=85')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 py-32 lg:py-40">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 px-4 py-2 rounded-full mb-6">
            <span className="text-xs tracking-[0.15em] uppercase font-semibold text-[#C5A059]">Cupping Therapy - Réservé aux femmes</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#2D312E] mb-6 leading-tight tracking-tight">
            Retrouvez votre <span className="gold-text">équilibre naturel</span> grâce à la hijama
          </h1>
          <p className="text-base md:text-lg text-[#6C706B] mb-10 max-w-xl leading-relaxed">
            Bien-être, détox et soulagement des tensions du corps. Ventousothérapie dans un cadre professionnel et bienveillant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#reservation"><Button data-testid="book-appointment-btn" className="bg-[#A8B5A2] hover:bg-[#8FA389] text-white px-8 py-6 rounded-full text-base font-medium btn-lift w-full sm:w-auto">Réserver un rendez-vous <ArrowRight className="ml-2 w-4 h-4" /></Button></a>
            <Button data-testid="whatsapp-hero-btn" variant="outline" className="border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 px-8 py-6 rounded-full text-base font-medium w-full sm:w-auto" asChild>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour, je souhaite prendre rendez-vous pour une séance de hijama`} target="_blank" rel="noopener noreferrer"><Phone className="mr-2 w-4 h-4" />WhatsApp</a>
            </Button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1630595632518-8217c0bceb8f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBzcGElMjBtYXNzYWdlJTIwd2VsbG5lc3MlMjByZWxheGF0aW9ufGVufDB8fHx8MTc3NjAzNzc5M3ww&ixlib=rb-4.1.0&q=85" alt="Hijama therapy" className="w-full h-[500px] object-cover" />
          </div>
          <motion.div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#A8B5A2]/20 rounded-full flex items-center justify-center"><Award className="w-5 h-5 text-[#A8B5A2]" /></div>
              <div><p className="font-semibold text-[#2D312E] text-sm">Infirmière certifiée</p><p className="text-xs text-[#6C706B]">Matériel stérile</p></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <ChevronDown className="w-6 h-6 text-[#A8B5A2]" />
      </motion.div>
    </div>
  </section>
);

// Certification
const CertificationSection = () => (
  <section id="certification" className="py-20 lg:py-28 bg-[#F3EFE9]" data-testid="certification-section">
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Votre praticienne</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D312E] mb-4">ELORF Fatiha</h2>
          <h3 className="font-serif text-lg md:text-xl text-[#A8B5A2] mb-4">Infirmière diplômée d'état</h3>
          <p className="text-[#6C706B] mb-6 leading-relaxed text-sm md:text-base">Praticienne certifiée en hijama, je vous accueille dans un cadre professionnel et bienveillant. Mon expérience en tant qu'infirmière me permet de vous garantir une hygiène irréprochable et des soins de qualité.</p>
          <div className="bg-[#C5A059]/10 rounded-xl p-4 mb-6">
            <p className="text-[#C5A059] font-semibold text-sm">Exclusivement réservé aux femmes</p>
          </div>
          <blockquote className="border-l-4 border-[#C5A059] pl-4 italic text-[#6C706B] text-sm">"La persévérance, c'est ce qui rend l'impossible possible, le possible probable et le probable réalisable."</blockquote>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <div className="rounded-3xl overflow-hidden shadow-2xl"><img src={diplomaImage} alt="Diplôme ELORF Fatiha" className="w-full h-auto object-cover" /></div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Practice Location Video
const PracticeLocationSection = () => (
  <section id="lieu" className="py-20 lg:py-28 bg-white" data-testid="practice-location-section">
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Découvrez le lieu</span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#2D312E] mb-4">Un cadre apaisant</h2>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-[#F3EFE9]">
          <video controls className="w-full h-auto rounded-3xl" poster={bookImages[3]} data-testid="practice-video">
            <source src={practiceLocationVideo} type="video/mp4" />
          </video>
        </div>
      </motion.div>
    </div>
  </section>
);

// Benefits
const BenefitsSection = () => {
  const benefits = [
    { icon: Activity, title: "Douleurs musculaires", desc: "Dos, nuque, épaules, tensions et contractures" },
    { icon: Droplets, title: "Détoxification", desc: "Élimination des toxines et purification du corps" },
    { icon: Heart, title: "Bien-être général", desc: "Fatigue, stress, anxiété et qualité du sommeil" },
    { icon: Zap, title: "Circulation sanguine", desc: "Amélioration de l'oxygénation et de la circulation" },
    { icon: Shield, title: "Récupération sportive", desc: "Réduction des courbatures et performances" },
    { icon: Sparkles, title: "Hijama visage", desc: "Anti-âge, acné, rides, drainage lymphatique, teint lumineux" },
  ];
  return (
    <section id="bienfaits" className="py-20 lg:py-28 bg-white" data-testid="benefits-section">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Les bienfaits</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D312E] mb-4">Les vertus de la Hijama</h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {benefits.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="benefit-card group">
              <div className="w-12 h-12 bg-[#A8B5A2]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#A8B5A2]/20 transition-colors">
                <b.icon className="w-6 h-6 text-[#A8B5A2]" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg text-[#2D312E] mb-2">{b.title}</h3>
              <p className="text-[#6C706B] text-sm">{b.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 bg-[#F3EFE9] rounded-3xl p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Pour les sportives</span>
              <h3 className="font-serif text-2xl text-[#2D312E] mb-4">Optimisez vos performances</h3>
              <ul className="space-y-3">
                {["Récupération musculaire améliorée", "Réduction des courbatures", "Meilleure oxygénation du sang", "Sensation de légèreté"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#2D312E] text-sm"><Check className="w-4 h-4 text-[#A8B5A2] flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </div>
            <img src="https://images.pexels.com/photos/4599392/pexels-photo-4599392.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Massage therapy" className="rounded-2xl w-full h-[250px] object-cover" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials
const TestimonialsSection = () => {
  const [cur, setCur] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRefs = useRef([]);
  const next = () => setCur(p => (p + 1) % testimonialImages.length);
  const prev = () => setCur(p => (p - 1 + testimonialImages.length) % testimonialImages.length);
  const toggleAudio = (i) => {
    if (playingAudio === i) { audioRefs.current[i]?.pause(); setPlayingAudio(null); }
    else { audioRefs.current.forEach((a, j) => { if (a && j !== i) a.pause(); }); audioRefs.current[i]?.play().catch(() => {}); setPlayingAudio(i); }
  };
  return (
    <section id="avis" className="py-20 lg:py-28 bg-white" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Témoignages</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D312E] mb-4">Avis de nos clientes</h2>
        </motion.div>
        <div className="bg-[#F3EFE9] rounded-3xl p-4 md:p-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Quote className="w-5 h-5 text-[#C5A059]" /><h3 className="font-serif text-lg text-[#2D312E]">Messages WhatsApp</h3></div>
            <div className="flex gap-2">
              <button onClick={prev} className="p-2 rounded-full bg-white shadow-md" data-testid="prev-testimonial"><ChevronLeft className="w-4 h-4 text-[#2D312E]" /></button>
              <button onClick={next} className="p-2 rounded-full bg-white shadow-md" data-testid="next-testimonial"><ChevronRight className="w-4 h-4 text-[#2D312E]" /></button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.img key={cur} src={testimonialImages[cur]} alt={`Témoignage ${cur + 1}`} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }} className="w-full max-w-md mx-auto rounded-2xl shadow-lg" />
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-1.5 mt-4">{testimonialImages.map((_, i) => <button key={i} onClick={() => setCur(i)} className={`w-2 h-2 rounded-full ${i === cur ? "bg-[#C5A059]" : "bg-[#2D312E]/20"}`} />)}</div>
        </div>
        <div className="flex items-center gap-2 mb-4"><Volume2 className="w-5 h-5 text-[#C5A059]" /><h3 className="font-serif text-lg text-[#2D312E]">Témoignages audio</h3></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {audioTestimonials.map((a, i) => (
            <div key={i} className="bg-[#F3EFE9] rounded-xl p-3 flex items-center gap-3">
              <button onClick={() => toggleAudio(i)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${playingAudio === i ? "bg-[#C5A059] text-white" : "bg-white text-[#A8B5A2] hover:bg-[#A8B5A2] hover:text-white"}`} data-testid={`audio-${i}`}>
                {playingAudio === i ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div><p className="font-medium text-[#2D312E] text-sm">{a.title}</p><p className="text-xs text-[#6C706B]">Écouter</p></div>
              <audio ref={el => (audioRefs.current[i] = el)} src={a.url} onEnded={() => setPlayingAudio(null)} preload="none" />
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2"><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />)}</div><span className="text-[#6C706B] text-sm">100% satisfaites</span></div>
        </div>
      </div>
    </section>
  );
};

// Services
const ServicesSection = () => {
  const services = [
    { name: "Hijama sèche", desc: "Technique douce sans incision", price: "45€" },
    { name: "Hijama humide", desc: "Technique thérapeutique traditionnelle", price: "45€" },
    { name: "Hijama sportive", desc: "Optimiser la récupération sportive", price: "45€" },
    { name: "Hijama bien-être", desc: "Détente et bien-être général", price: "45€" },
    { name: "Hijama visage", desc: "Anti-âge, acné, rides, drainage", price: "35€" },
    { name: "Hijama corps entier", desc: "Séance complète tout le corps", price: "70€" }
  ];
  return (
    <section id="services" className="py-20 lg:py-28 bg-[#FAF9F6]" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Nos prestations</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D312E] mb-4">Types de Hijama</h2>
          <p className="text-[#6C706B] text-sm">Ventouses fournies avec chaque prestation</p>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl p-5 border border-[rgba(45,49,46,0.06)] hover:shadow-lg transition-all">
              <div className="w-10 h-10 bg-[#C5A059]/10 rounded-xl flex items-center justify-center mb-3"><Leaf className="w-5 h-5 text-[#C5A059]" strokeWidth={1.5} /></div>
              <h3 className="font-serif text-lg text-[#2D312E] mb-1">{s.name}</h3>
              <p className="text-[#6C706B] text-xs mb-3">{s.desc}</p>
              <p className="font-serif text-xl text-[#C5A059]">{s.price}</p>
              <p className="text-xs text-[#6C706B] mt-1">Ventouses fournies</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Booking
const BookingSection = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", email: "", comment: "" });

  const services = ["Hijama sèche", "Hijama humide", "Hijama sportive", "Hijama bien-être", "Hijama visage", "Hijama corps entier"];
  const servicePrices = { "Hijama sèche": "45€", "Hijama humide": "45€", "Hijama sportive": "45€", "Hijama bien-être": "45€", "Hijama visage": "35€", "Hijama corps entier": "70€" };

 const fetchSlots = async (date) => {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      console.log("Fetching slots for:", dateStr);
      const res = await axios.get(`${API}/appointments/slots/${dateStr}`);
      console.log("Slots received:", res.data.slots?.length);
      setAvailableSlots(res.data.slots || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      setAvailableSlots([]);
      setSelectedTime(null);
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedService) { toast.error("Veuillez sélectionner date, créneau et prestation"); return; }
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) { toast.error("Veuillez remplir tous les champs obligatoires"); return; }
    if (formData.firstName.length > 60 || formData.lastName.length > 60) { toast.error("Le nom ne doit pas dépasser 60 caractères"); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/appointments`, {
        first_name: formData.firstName.slice(0, 60),
        last_name: formData.lastName.slice(0, 60),
        phone: formData.phone.slice(0, 20),
        email: formData.email.slice(0, 60),
        service_type: selectedService,
        date: format(selectedDate, "yyyy-MM-dd"),
        time_slot: selectedTime,
        comment: formData.comment?.slice(0, 200)
      });
      toast.success("Rendez-vous confirmé ! Vous recevrez un email de confirmation.");
      const msg = `Bonjour,\nJe viens de réserver :\n📅 ${format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}\n🕐 ${selectedTime}\n💆 ${selectedService}\n👤 ${formData.firstName} ${formData.lastName}\n📱 ${formData.phone}\n📧 ${formData.email}\nMerci !`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
      setSelectedDate(null); setSelectedTime(null); setSelectedService(null);
      setFormData({ firstName: "", lastName: "", phone: "", email: "", comment: "" });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la réservation");
      if (selectedDate) fetchSlots(selectedDate);
    } finally { setLoading(false); }
  };

  return (
    <section id="reservation" className="py-20 lg:py-28 bg-white" data-testid="booking-section">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Réservation</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D312E] mb-4">Prenez rendez-vous</h2>
          <p className="text-[#6C706B] text-sm">Choisissez votre créneau et réservez en quelques clics</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-[#FAF9F6] rounded-2xl p-4 md:p-8">
              <h3 className="font-serif text-lg text-[#2D312E] mb-4">1. Choisissez une date</h3>
              <div className="flex justify-center">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={fr} disabled={isDateDisabled} fromDate={getTodayStart()} className="rounded-xl border-0 bg-white p-3 shadow-sm" data-testid="booking-calendar" />
              </div>
              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                  <h3 className="font-serif text-lg text-[#2D312E] mb-3">2. Choisissez un créneau</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map(s => (
                      <button key={s.time} onClick={() => s.available && setSelectedTime(s.time)} className={`time-slot ${selectedTime === s.time ? "selected" : ""} ${!s.available ? "unavailable" : ""}`} disabled={!s.available} data-testid={`time-slot-${s.time}`}>{s.time}</button>
                    ))}
                  </div>
                  {availableSlots.length === 0 && <p className="text-[#6C706B] text-sm text-center mt-2">Chargement des créneaux...</p>}
                </motion.div>
              )}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-serif text-lg text-[#2D312E] mb-3">3. Type de prestation</h3>
                <div className="grid grid-cols-2 gap-2">
                  {services.map(s => (
                    <button key={s} type="button" onClick={() => setSelectedService(s)} className={`service-option text-left ${selectedService === s ? "selected" : ""}`} data-testid={`service-${s.replace(/\s/g, "-").toLowerCase()}`}>
                      <span className="flex items-center gap-1 text-sm">{selectedService === s && <Check className="w-3 h-3 text-[#A8B5A2]" />}{s}</span>
                      <span className="text-xs text-[#C5A059] font-medium">{servicePrices[s]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#2D312E] mb-3">4. Vos informations</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Prénom *" maxLength={60} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="form-input" data-testid="input-firstname" />
                    <Input placeholder="Nom *" maxLength={60} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="form-input" data-testid="input-lastname" />
                  </div>
                  <Input placeholder="Numéro WhatsApp *" maxLength={20} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-input" data-testid="input-phone" />
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C706B]" />
                    <Input type="email" placeholder="Email * (pour confirmation)" maxLength={60} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input pl-10" data-testid="input-email" />
                  </div>
                  <Textarea placeholder="Commentaire (optionnel, max 200 car.)" maxLength={200} value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} className="form-input min-h-[80px]" data-testid="input-comment" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#A8B5A2] hover:bg-[#8FA389] text-white py-5 rounded-xl text-base font-medium btn-lift" data-testid="submit-booking-btn">
                {loading ? "Réservation en cours..." : "Confirmer le rendez-vous"}
              </Button>
              {selectedDate && selectedTime && selectedService && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#A8B5A2]/10 rounded-xl p-3 text-center">
                  <p className="text-[#2D312E] font-medium text-sm">📅 {format(selectedDate, "EEEE d MMMM", { locale: fr })} à {selectedTime}</p>
                  <p className="text-[#6C706B] text-xs">{selectedService} - {servicePrices[selectedService]}</p>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Recommendations
const RecommendationsSection = () => (
  <section id="recommandations" className="py-20 lg:py-28 bg-[#F3EFE9]" data-testid="recommendations-section">
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Conseils</span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#2D312E] mb-4">Avant et après la séance</h2>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="recommendation-card"><div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-[#C5A059]/20 rounded-full flex items-center justify-center"><Clock className="w-4 h-4 text-[#C5A059]" /></div><h3 className="font-serif text-lg text-[#2D312E]">Avant</h3></div>
          <ul className="space-y-3">{["Être à jeun 2 à 3h avant (eau autorisée)", "Prévoir des vêtements confortables"].map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-[#6C706B]"><Check className="w-4 h-4 text-[#A8B5A2] mt-0.5 flex-shrink-0" />{t}</li>)}</ul>
        </div>
        <div className="recommendation-card"><div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-[#A8B5A2]/20 rounded-full flex items-center justify-center"><Heart className="w-4 h-4 text-[#A8B5A2]" /></div><h3 className="font-serif text-lg text-[#2D312E]">Après</h3></div>
          <ul className="space-y-3">{["Se reposer, éviter les efforts 24h", "Privilégier le calme et le repos", "Pas de douche chaude immédiatement"].map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-[#6C706B]"><Check className="w-4 h-4 text-[#A8B5A2] mt-0.5 flex-shrink-0" />{t}</li>)}</ul>
        </div>
        <div className="recommendation-card md:col-span-2"><div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 bg-[#C5A059]/20 rounded-full flex items-center justify-center"><Leaf className="w-4 h-4 text-[#C5A059]" /></div><h3 className="font-serif text-lg text-[#2D312E]">Alimentation & hydratation</h3></div>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">{["Bien s'hydrater (eau, tisane, soupe)", "Alimentation légère (fruits, légumes)"].map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-[#6C706B]"><Check className="w-4 h-4 text-[#A8B5A2] mt-0.5 flex-shrink-0" />{t}</li>)}</ul>
            <ul className="space-y-2">{["Marques disparaissent en quelques jours", "Éviter les aliments gras après"].map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-[#6C706B]"><Check className="w-4 h-4 text-[#A8B5A2] mt-0.5 flex-shrink-0" />{t}</li>)}</ul>
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-10 text-center">
        <p className="text-[#2D312E] font-serif text-lg italic">"Merci de votre confiance. Prenez soin de vous."</p>
      </motion.div>
    </div>
  </section>
);

// Contact
const ContactSection = () => (
  <section id="contact" className="py-20 lg:py-28 bg-white" data-testid="contact-section">
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C5A059] mb-4 block">Contact</span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D312E] mb-6">Me contacter</h2>
          <div className="space-y-5">
            <div className="flex items-start gap-4"><div className="w-10 h-10 bg-[#A8B5A2]/10 rounded-xl flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-[#A8B5A2]" /></div><div><h4 className="font-semibold text-[#2D312E] text-sm">WhatsApp</h4><p className="text-[#6C706B] text-sm">{WHATSAPP_DISPLAY}</p></div></div>
            <div className="flex items-start gap-4"><div className="w-10 h-10 bg-[#A8B5A2]/10 rounded-xl flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 text-[#A8B5A2]" /></div><div><h4 className="font-semibold text-[#2D312E] text-sm">Email</h4><p className="text-[#6C706B] text-sm">elorffatiha1189@gmail.com</p></div></div>
            <div className="flex items-start gap-4"><div className="w-10 h-10 bg-[#A8B5A2]/10 rounded-xl flex items-center justify-center flex-shrink-0"><Clock className="w-4 h-4 text-[#A8B5A2]" /></div><div><h4 className="font-semibold text-[#2D312E] text-sm">Horaires</h4><p className="text-[#6C706B] text-sm">Sam - Dim : 9h - 18h<br />Lun - Ven : 18h - 20h</p></div></div>
          </div>
          <div className="mt-6 p-3 bg-[#C5A059]/10 rounded-xl"><p className="text-sm text-[#C5A059] font-medium text-center">Exclusivement réservé aux femmes</p></div>
          <div className="mt-4 p-3 bg-[#F3EFE9] rounded-xl"><p className="text-xs text-[#6C706B]"><strong>Important :</strong> Je n'accepte pas les accompagnements. Merci de prévoir l'appoint.</p></div>
          <Button className="bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-5 rounded-full text-sm font-medium btn-lift mt-6" data-testid="contact-whatsapp-btn" asChild>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour, je souhaite prendre rendez-vous pour une séance de hijama`} target="_blank" rel="noopener noreferrer"><Phone className="mr-2 w-4 h-4" />Contacter sur WhatsApp</a>
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <img src="https://images.unsplash.com/photo-1752769041878-f24e37fd6aea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtaW5pbWFsaXN0JTIwc3BhJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzc2MDM3NjUwfDA&ixlib=rb-4.1.0&q=85" alt="Spa" className="rounded-3xl w-full h-[350px] object-cover" />
        </motion.div>
      </div>
    </div>
  </section>
);

// Chatbot
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", content: "Salam ! Je suis l'assistante de Fatiha. Comment puis-je vous aider ?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim().slice(0, 500);
    setInput("");
    setMessages(p => [...p, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat`, { session_id: sessionId, message: msg });
      setMessages(p => [...p, { role: "bot", content: res.data.response }]);
    } catch { setMessages(p => [...p, { role: "bot", content: "Problème technique. Contactez Fatiha sur WhatsApp au 07 43 56 51 89." }]); }
    finally { setLoading(false); }
  };

  return (
    <>
      <AnimatePresence>{!isOpen && <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="chat-toggle" onClick={() => setIsOpen(true)} data-testid="chatbot-toggle"><MessageCircle className="w-6 h-6 text-white" /></motion.button>}</AnimatePresence>
      <AnimatePresence>{isOpen && (
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="chatbot-container" data-testid="chatbot-container">
          <div className="chatbot-header">
            <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><User className="w-4 h-4" /></div><div><h4 className="font-semibold text-sm">Hijama Sunnah</h4><p className="text-xs opacity-80">En ligne</p></div></div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full" data-testid="chatbot-close"><X className="w-4 h-4" /></button>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => <div key={i} className={`chat-message ${m.role}`}><div className={`message-bubble ${m.role}`}>{m.content}</div></div>)}
            {loading && <div className="chat-message bot"><div className="message-bubble bot"><span className="flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span><span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span></span></div></div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="chatbot-input"><input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Votre question..." disabled={loading} maxLength={500} data-testid="chatbot-input" /><button type="submit" disabled={loading} data-testid="chatbot-send"><Send className="w-4 h-4" /></button></form>
          <div className="p-2 border-t border-[rgba(45,49,46,0.08)]"><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 rounded-xl text-xs font-medium hover:bg-[#20BD5A]" data-testid="chatbot-whatsapp"><Phone className="w-3 h-3" />{WHATSAPP_DISPLAY}</a></div>
        </motion.div>
      )}</AnimatePresence>
    </>
  );
};

// WhatsApp Float
const WhatsAppFloat = () => (
  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour, je souhaite prendre rendez-vous`} target="_blank" rel="noopener noreferrer" className="whatsapp-float" data-testid="whatsapp-cta">
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
  </a>
);

// Footer
const Footer = () => (
  <footer className="bg-[#2D312E] text-white py-12" data-testid="footer">
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div><h3 className="font-serif text-xl mb-3">Hijama <span className="text-[#C5A059]">Sunnah</span></h3><p className="text-gray-400 text-xs">ELORF Fatiha - Infirmière diplômée d'état. Exclusivement réservé aux femmes.</p></div>
        <div><h4 className="font-semibold text-sm mb-3">Navigation</h4><ul className="space-y-1 text-gray-400 text-xs">{["Bienfaits", "Avis", "Services", "Réservation", "Contact"].map(l => <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-white">{l}</a></li>)}</ul></div>
        <div><h4 className="font-semibold text-sm mb-3">Contact</h4><ul className="space-y-1 text-gray-400 text-xs"><li>{WHATSAPP_DISPLAY}</li><li>elorffatiha1189@gmail.com</li><li>Sam-Dim: 9h-18h | Lun-Ven: 18h-20h</li></ul></div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-xs"><p>© {new Date().getFullYear()} Hijama Sunnah - ELORF Fatiha</p></div>
    </div>
  </footer>
);

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <Navigation />
      <HeroSection />
      <CertificationSection />
      <PracticeLocationSection />
      <BenefitsSection />
      <TestimonialsSection />
      <ServicesSection />
      <BookingSection />
      <RecommendationsSection />
      <ContactSection />
      <Footer />
      <Chatbot />
      <WhatsAppFloat />
    </div>
  );
}

export default App;
