# CAELINUS Premium Ritual System
# 3 Ana Hat: Zihin & Sinir Sistemi, Bilinç & Sezgi, Yaratım & Frekans

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from emergentintegrations.llm.openai import OpenAITextToSpeech
from dotenv import load_dotenv
import os
import uuid
import logging

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/premium-ritual", tags=["premium-ritual"])

# Database reference
db: AsyncIOMotorDatabase = None

def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database

# ============== MODELS ==============

class RitualLine(BaseModel):
    """Ritüel Hattı - 3 Ana Hat"""
    id: str
    name_tr: str
    name_en: str
    description_tr: str
    description_en: str
    icon: str
    tone_tr: str
    tone_en: str
    color: str  # Tailwind color class

class RitualStep(BaseModel):
    """Ritüel Adımı"""
    order: int
    title_tr: Optional[str] = None
    title_en: Optional[str] = None
    text_tr: str
    text_en: str
    pause_seconds: int = 2  # Duraklama süresi
    breath_cue: bool = False  # Nefes işareti var mı

class PremiumRitual(BaseModel):
    """Premium Ritüel"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    line_id: str  # Hat ID (zihin, bilinc, yaratim)
    name_tr: str
    name_en: str
    description_tr: str
    description_en: str
    duration_minutes: int
    level: Literal["Başlangıç", "Orta", "İleri", "Usta"]
    level_en: Literal["Beginner", "Intermediate", "Advanced", "Master"]
    icon: str
    tags: List[str] = []
    steps: List[RitualStep] = []
    audio_url: Optional[str] = None  # Pre-generated audio URL
    is_active: bool = True
    is_featured: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PlayRitualRequest(BaseModel):
    ritual_id: str
    language: Literal["tr", "en"] = "tr"

class PlayRitualResponse(BaseModel):
    ritual_id: str
    name: str
    duration_minutes: int
    audio_url: str
    full_text: str
    steps_count: int

# ============== SANRI VOICE CONFIG ==============

SANRI_VOICE_PROMPT = """
Voice Profile (SANRI):
- female voice
- warm and deep hypnotic tone
- slow speaking pace
- soft pauses between sentences
- very calm, confident and nurturing presence
- intimate and guiding
- divine feminine energy
- modern, grounded
- not theatrical, not robotic
- suitable for meditation and hypnosis
- Turkish language (primary)
- gentle breath, low pitch
- emotional warmth without exaggeration
"""

# OpenAI TTS Settings for SANRI Voice
SANRI_TTS_CONFIG = {
    "voice": "nova",  # Warm feminine voice
    "model": "tts-1-hd",  # High quality
    "speed": 0.80  # Slow for meditation
}

# ============== 3 RITUAL LINES ==============

RITUAL_LINES: List[RitualLine] = [
    RitualLine(
        id="zihin",
        name_tr="Zihin & Sinir Sistemi",
        name_en="Mind & Nervous System",
        description_tr="Sessizlik yarat. Gürültüyü söndür.",
        description_en="Create silence. Quiet the noise.",
        icon="🧠",
        tone_tr="Yumuşak, yavaş, güven veren",
        tone_en="Soft, slow, reassuring",
        color="indigo"
    ),
    RitualLine(
        id="bilinc",
        name_tr="Bilinç & Sezgi",
        name_en="Consciousness & Intuition",
        description_tr="Hatırla. Yönünü bul.",
        description_en="Remember. Find your direction.",
        icon="👁️",
        tone_tr="Gizemli, rehber gibi, derin ama sakin",
        tone_en="Mysterious, guiding, deep but calm",
        color="violet"
    ),
    RitualLine(
        id="yaratim",
        name_tr="Yaratım & Frekans",
        name_en="Creation & Frequency",
        description_tr="Niyet koy. Alanı kodla.",
        description_en="Set intention. Code the field.",
        icon="✨",
        tone_tr="Karizmatik, telkin gücü yüksek, ama yumuşak",
        tone_en="Charismatic, suggestive, yet soft",
        color="amber"
    )
]

# ============== FIRST PREMIUM RITUAL: ZİHİN SESSİZLİĞİ ==============

ZIHIN_SESSIZLIGI_RITUAL = PremiumRitual(
    id="zihin-sessizligi",
    line_id="zihin",
    name_tr="Zihin Sessizliği – İç Alanı Açma Ritüeli",
    name_en="Mind Silence – Opening the Inner Space Ritual",
    description_tr="Düşünce döngüsünü durdurmak, bedeni gevşetmek, bilinç alanına giriş kapısı açmak.",
    description_en="Stop the thought cycle, relax the body, open the gateway to consciousness.",
    duration_minutes=7,
    level="Başlangıç",
    level_en="Beginner",
    icon="🌙",
    tags=["sessizlik", "gevşeme", "bilinç", "başlangıç"],
    is_featured=True,
    steps=[
        RitualStep(
            order=1,
            title_tr="Başlangıç",
            title_en="Beginning",
            text_tr="""Şimdi…
bulunduğun yerde kal.
Hiçbir şey yapman gerekmiyor.
Sadece… burada olman yeterli.""",
            text_en="""Now…
stay where you are.
You don't need to do anything.
Just… being here is enough.""",
            pause_seconds=3
        ),
        RitualStep(
            order=2,
            text_tr="""Gözlerin açıksa, yumuşakça kapat.
Nefesinin doğal akışını hisset.""",
            text_en="""If your eyes are open, gently close them.
Feel the natural flow of your breath.""",
            pause_seconds=2,
            breath_cue=True
        ),
        RitualStep(
            order=3,
            title_tr="Beden Gevşemesi",
            title_en="Body Relaxation",
            text_tr="""Nefes al…
ve yavaşça ver.
Omuzlarının gevşediğini hisset.
Çenenin…
alnının…
gözlerinin…""",
            text_en="""Breathe in…
and slowly release.
Feel your shoulders relax.
Your jaw…
your forehead…
your eyes…""",
            pause_seconds=3,
            breath_cue=True
        ),
        RitualStep(
            order=4,
            text_tr="""Şu anda bedenin,
güvende.""",
            text_en="""Right now your body
is safe.""",
            pause_seconds=2
        ),
        RitualStep(
            order=5,
            title_tr="Zihin Sessizliği Kapısı",
            title_en="Gateway to Mental Silence",
            text_tr="""Zihninden geçen düşünceler…
durmak zorunda değil.
Sadece…
uzaktan geçen bulutlar gibi
gelip gitmelerine izin ver.""",
            text_en="""The thoughts passing through your mind…
don't have to stop.
Just…
like clouds passing in the distance
let them come and go.""",
            pause_seconds=3
        ),
        RitualStep(
            order=6,
            text_tr="""Onları takip etme.
Onlarla savaşma.
Sadece…
fark et.""",
            text_en="""Don't follow them.
Don't fight them.
Just…
notice.""",
            pause_seconds=2
        ),
        RitualStep(
            order=7,
            title_tr="İç Alan Açılımı",
            title_en="Inner Space Opening",
            text_tr="""Şimdi dikkatini
göğsünün ortasına getir.
Orada…
çok sakin bir alan var.
Bu alan…
senin gerçek merkezindir.""",
            text_en="""Now bring your attention
to the center of your chest.
There…
is a very calm space.
This space…
is your true center.""",
            pause_seconds=4
        ),
        RitualStep(
            order=8,
            text_tr="""Burada zaman yok.
Baskı yok.
Zorunluluk yok.
Sadece…
var olma hali.""",
            text_en="""Here there is no time.
No pressure.
No obligation.
Just…
a state of being.""",
            pause_seconds=3
        ),
        RitualStep(
            order=9,
            title_tr="Hatırlama",
            title_en="Remembrance",
            text_tr="""Bilincin…
düşündüğünden çok daha derin.
Ve sen…
bu derinliğe her zaman erişebilirsin.
Şu anda yaptığın tek şey…
hatırlamak.""",
            text_en="""Your consciousness…
is much deeper than you think.
And you…
can always access this depth.
The only thing you're doing now…
is remembering.""",
            pause_seconds=3
        ),
        RitualStep(
            order=10,
            title_tr="Kapanış",
            title_en="Closing",
            text_tr="""Birkaç nefes daha al…
ve yavaşça ver.
Hazır olduğunda…
bedenine geri dön.""",
            text_en="""Take a few more breaths…
and slowly release.
When you're ready…
return to your body.""",
            pause_seconds=3,
            breath_cue=True
        ),
        RitualStep(
            order=11,
            text_tr="""Gözlerini açtığında…
daha sakin…
daha net…
daha merkezde olacaksın.
Çünkü…
bu alan…
her zaman seninle.""",
            text_en="""When you open your eyes…
you will be calmer…
clearer…
more centered.
Because…
this space…
is always with you.""",
            pause_seconds=2
        )
    ]
)

# ============== SEED RITUALS (All 3 Lines) ==============

SEED_RITUALS = [
    # HAT I: Zihin & Sinir Sistemi
    ZIHIN_SESSIZLIGI_RITUAL,
    PremiumRitual(
        id="sinir-sistemi-reset",
        line_id="zihin",
        name_tr="Sinir Sistemi Reset",
        name_en="Nervous System Reset",
        description_tr="Stres tepkisini sıfırla, parasempatik sistemi aktive et.",
        description_en="Reset stress response, activate parasympathetic system.",
        duration_minutes=10,
        level="Orta",
        level_en="Intermediate",
        icon="⚡",
        tags=["stres", "reset", "sinir sistemi"],
        steps=[]
    ),
    PremiumRitual(
        id="geceye-hazirlik",
        line_id="zihin",
        name_tr="Geceye Hazırlık",
        name_en="Preparing for Night",
        description_tr="Günü bırak, derin uykuya hazırlan.",
        description_en="Release the day, prepare for deep sleep.",
        duration_minutes=12,
        level="Başlangıç",
        level_en="Beginner",
        icon="🌙",
        tags=["uyku", "gece", "dinlenme"],
        steps=[]
    ),
    
    # HAT II: Bilinç & Sezgi
    PremiumRitual(
        id="sezgi-kapisi",
        line_id="bilinc",
        name_tr="Sezgi Kapısı",
        name_en="Intuition Gateway",
        description_tr="İçsel bilgi kanalını aç, sezgisel rehberliğe bağlan.",
        description_en="Open the inner knowledge channel, connect to intuitive guidance.",
        duration_minutes=15,
        level="Orta",
        level_en="Intermediate",
        icon="👁️",
        tags=["sezgi", "içgörü", "rehberlik"],
        steps=[]
    ),
    PremiumRitual(
        id="ruya-acilimi",
        line_id="bilinc",
        name_tr="Rüya Açılımı",
        name_en="Dream Opening",
        description_tr="Rüya alanına bilinçli giriş, sembol diliyle bağlantı.",
        description_en="Conscious entry to dream space, connection with symbolic language.",
        duration_minutes=18,
        level="İleri",
        level_en="Advanced",
        icon="🔮",
        tags=["rüya", "sembol", "bilinçaltı"],
        steps=[]
    ),
    PremiumRitual(
        id="ic-rehber-baglantisi",
        line_id="bilinc",
        name_tr="İç Rehber Bağlantısı",
        name_en="Inner Guide Connection",
        description_tr="Yüksek benlikle iletişim kur, içsel rehberini dinle.",
        description_en="Communicate with higher self, listen to your inner guide.",
        duration_minutes=20,
        level="İleri",
        level_en="Advanced",
        icon="✨",
        tags=["rehber", "yüksek benlik", "bağlantı"],
        steps=[]
    ),
    
    # HAT III: Yaratım & Frekans
    PremiumRitual(
        id="niyet-kodlama",
        line_id="yaratim",
        name_tr="Niyet Kodlama",
        name_en="Intention Coding",
        description_tr="Niyetini netleştir, bilinç alanına kodla.",
        description_en="Clarify your intention, code it into the consciousness field.",
        duration_minutes=12,
        level="Başlangıç",
        level_en="Beginner",
        icon="🎯",
        tags=["niyet", "hedef", "kodlama"],
        steps=[]
    ),
    PremiumRitual(
        id="frekans-dengeleme",
        line_id="yaratim",
        name_tr="Frekans Dengeleme",
        name_en="Frequency Balancing",
        description_tr="Enerji merkezlerini dengele, titreşimini yükselt.",
        description_en="Balance energy centers, raise your vibration.",
        duration_minutes=15,
        level="Orta",
        level_en="Intermediate",
        icon="🎵",
        tags=["frekans", "denge", "enerji"],
        steps=[]
    ),
    PremiumRitual(
        id="yeni-donem-baslatma",
        line_id="yaratim",
        name_tr="Yeni Dönem Başlatma",
        name_en="New Cycle Initiation",
        description_tr="Eski döngüyü kapat, yeni başlangıç için alan aç.",
        description_en="Close old cycle, open space for new beginning.",
        duration_minutes=20,
        level="Usta",
        level_en="Master",
        icon="🌅",
        tags=["yeni dönem", "başlangıç", "dönüşüm"],
        is_featured=True,
        steps=[]
    )
]

# ============== HELPER FUNCTIONS ==============

async def ensure_rituals_exist():
    """Ensure seed rituals exist in database"""
    if db is None:
        return
    
    for ritual in SEED_RITUALS:
        await db.premium_rituals.update_one(
            {"id": ritual.id},
            {"$set": ritual.model_dump()},
            upsert=True
        )

def get_full_ritual_text(ritual: PremiumRitual, language: str = "tr") -> str:
    """Combine all ritual steps into single text for TTS"""
    texts = []
    for step in ritual.steps:
        if language == "tr":
            if step.title_tr:
                texts.append(f"... {step.title_tr} ...")
            texts.append(step.text_tr)
        else:
            if step.title_en:
                texts.append(f"... {step.title_en} ...")
            texts.append(step.text_en)
        # Add pause marker
        texts.append("...")
    
    return "\n\n".join(texts)

# ============== ENDPOINTS ==============

@router.get("/lines")
async def get_ritual_lines():
    """Get all 3 ritual lines (Hatlar)"""
    return {
        "lines": [line.model_dump() for line in RITUAL_LINES],
        "count": len(RITUAL_LINES)
    }

@router.get("/rituals")
async def get_all_rituals(line_id: Optional[str] = None, featured_only: bool = False):
    """Get all premium rituals, optionally filtered by line"""
    await ensure_rituals_exist()
    
    query = {"is_active": True}
    if line_id:
        query["line_id"] = line_id
    if featured_only:
        query["is_featured"] = True
    
    rituals = await db.premium_rituals.find(query, {"_id": 0}).to_list(100)
    
    # Group by line
    grouped = {}
    for ritual in rituals:
        lid = ritual.get("line_id", "other")
        if lid not in grouped:
            grouped[lid] = []
        grouped[lid].append(ritual)
    
    return {
        "rituals": rituals,
        "grouped": grouped,
        "count": len(rituals)
    }

@router.get("/rituals/{ritual_id}")
async def get_ritual(ritual_id: str):
    """Get a specific ritual by ID"""
    await ensure_rituals_exist()
    
    ritual = await db.premium_rituals.find_one({"id": ritual_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    
    # Get line info
    line = next((l for l in RITUAL_LINES if l.id == ritual.get("line_id")), None)
    
    return {
        "ritual": ritual,
        "line": line.model_dump() if line else None
    }

@router.post("/play", response_model=PlayRitualResponse)
async def play_ritual(request: PlayRitualRequest):
    """Generate audio for a ritual and return playable URL"""
    await ensure_rituals_exist()
    
    ritual = await db.premium_rituals.find_one({"id": request.ritual_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    
    # Check if ritual has steps
    if not ritual.get("steps") or len(ritual.get("steps", [])) == 0:
        raise HTTPException(status_code=400, detail="Bu ritüelin adımları henüz eklenmemiş")
    
    # Get ritual object
    ritual_obj = PremiumRitual(**ritual)
    
    # Generate full text
    full_text = get_full_ritual_text(ritual_obj, request.language)
    
    # Check if text is too long (OpenAI limit: 4096)
    if len(full_text) > 4096:
        # Truncate with note
        full_text = full_text[:4000] + "\n\n... Ritüel devam ediyor..."
    
    try:
        # Get TTS client
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=503, detail="Ses servisi yapılandırılmamış")
        
        tts_client = OpenAITextToSpeech(api_key=api_key)
        
        # Generate audio with SANRI voice settings
        audio_base64 = await tts_client.generate_speech_base64(
            text=full_text,
            model=SANRI_TTS_CONFIG["model"],
            voice=SANRI_TTS_CONFIG["voice"],
            speed=SANRI_TTS_CONFIG["speed"],
            response_format="mp3"
        )
        
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        # Log play event
        await db.ritual_plays.insert_one({
            "ritual_id": request.ritual_id,
            "language": request.language,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        name = ritual_obj.name_tr if request.language == "tr" else ritual_obj.name_en
        
        return PlayRitualResponse(
            ritual_id=ritual_obj.id,
            name=name,
            duration_minutes=ritual_obj.duration_minutes,
            audio_url=audio_url,
            full_text=full_text,
            steps_count=len(ritual_obj.steps)
        )
        
    except Exception as e:
        logger.error(f"Ritual play error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ses üretimi hatası: {str(e)}")

@router.get("/featured")
async def get_featured_rituals():
    """Get featured rituals for homepage showcase"""
    await ensure_rituals_exist()
    
    rituals = await db.premium_rituals.find(
        {"is_active": True, "is_featured": True}, 
        {"_id": 0}
    ).to_list(10)
    
    return {
        "featured": rituals,
        "count": len(rituals)
    }

@router.get("/sanri-voice")
async def get_sanri_voice_info():
    """Get SANRI voice configuration info"""
    return {
        "voice_prompt": SANRI_VOICE_PROMPT,
        "tts_config": SANRI_TTS_CONFIG,
        "description": {
            "tr": "SANRI sesi - sıcak, derin, hipnotik kadın sesi",
            "en": "SANRI voice - warm, deep, hypnotic female voice"
        }
    }

# ============== ADMIN ENDPOINTS ==============

@router.post("/admin/rituals")
async def create_ritual(ritual: PremiumRitual):
    """Create a new premium ritual (Admin)"""
    await db.premium_rituals.insert_one(ritual.model_dump())
    return {"message": "Ritüel oluşturuldu", "id": ritual.id}

@router.put("/admin/rituals/{ritual_id}")
async def update_ritual(ritual_id: str, ritual: PremiumRitual):
    """Update a premium ritual (Admin)"""
    result = await db.premium_rituals.update_one(
        {"id": ritual_id},
        {"$set": ritual.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    return {"message": "Ritüel güncellendi"}

@router.delete("/admin/rituals/{ritual_id}")
async def delete_ritual(ritual_id: str):
    """Delete a premium ritual (Admin)"""
    result = await db.premium_rituals.delete_one({"id": ritual_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    return {"message": "Ritüel silindi"}

@router.get("/admin/analytics")
async def get_ritual_analytics():
    """Get ritual play analytics (Admin)"""
    total_plays = await db.ritual_plays.count_documents({})
    
    # Most played rituals
    pipeline = [
        {"$group": {"_id": "$ritual_id", "plays": {"$sum": 1}}},
        {"$sort": {"plays": -1}},
        {"$limit": 5}
    ]
    popular = await db.ritual_plays.aggregate(pipeline).to_list(5)
    
    return {
        "total_plays": total_plays,
        "popular_rituals": popular
    }
