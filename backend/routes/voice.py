# CAELINUS Voice Identity System
# SANRI_VOICE: Ritual guidance voice
# CAELINUS_BOOK_VOICE: Book meditation voice

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Literal, AsyncGenerator
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from emergentintegrations.llm.openai import OpenAITextToSpeech
from dotenv import load_dotenv
import os
import uuid
import logging
import asyncio
import io

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice", tags=["voice"])

# Database reference
db: AsyncIOMotorDatabase = None

def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database

# ============================================================
# SANRI_VOICE - RITUAL GUIDANCE VOICE IDENTITY
# ============================================================

SANRI_VOICE = {
    "id": "sanri_voice",
    "name": "SANRI",
    "description_tr": "Hipnotik, sıcak, derin kadın sesi - ritüel rehberliği için",
    "description_en": "Hypnotic, warm, deep female voice - for ritual guidance",
    
    # OpenAI TTS Configuration
    "voice": "nova",           # Warm feminine voice
    "model": "tts-1-hd",       # High quality
    "speed": 0.75,             # Slow for meditation/hypnosis
    "response_format": "mp3",
    
    # Voice Characteristics
    "profile": {
        "language_primary": "Turkish",
        "language_secondary": "English",
        "gender": "female",
        "tone": "deep, warm, hypnotic",
        "pace": "slow",
        "pitch": "low-mid",
        "emotion": "calm, nurturing, divine feminine",
        "style": "modern, grounded, intimate, not theatrical, not robotic",
        "suitable_for": ["meditation", "hypnosis", "ritual guidance"]
    },
    
    # Audio Behavior
    "behavior": {
        "sentence_pause_seconds": 1.5,
        "paragraph_pause_seconds": 2.5,
        "natural_breathing": True,
        "sharp_intonation": False,
        "synthetic_emphasis": False,
        "always_soothing": True
    },
    
    # Brand Signature
    "signature_tr": "Şimdi… kendi yaratıcı bilincini hatırla.",
    "signature_en": "Now… remember your own creative consciousness."
}

# ============================================================
# CAELINUS_BOOK_VOICE - BOOK MEDITATION VOICE
# ============================================================

CAELINUS_BOOK_VOICE = {
    "id": "book_voice",
    "name": "CAELINUS Book",
    "description_tr": "Rüya gibi, fısıltılı, kutsal ses - kitap meditasyonları için",
    "description_en": "Dream-like, whispery, sacred voice - for book meditations",
    
    # OpenAI TTS Configuration
    "voice": "shimmer",        # Softer, more ethereal
    "model": "tts-1-hd",       # High quality
    "speed": 0.70,             # Even slower than SANRI
    "response_format": "mp3",
    
    # Voice Characteristics
    "profile": {
        "language_primary": "Turkish",
        "language_secondary": "English",
        "gender": "female",
        "tone": "very soft, slight whisper quality",
        "pace": "extremely slow",
        "emotion": "emotional but stable, sacred without religiosity",
        "style": "dream-like, sacred"
    },
    
    # Audio Behavior
    "behavior": {
        "sentence_pause_seconds": 1.5,
        "paragraph_pause_seconds": 3.0,
        "background_music": False,
        "sound_effects": False
    }
}

# Fallback voice if primary fails
FALLBACK_VOICE = {
    "voice": "alloy",
    "model": "tts-1",
    "speed": 0.80
}

# ============================================================
# MODELS
# ============================================================

class VoicePlayRequest(BaseModel):
    ritual_id: str
    language: Literal["tr", "en"] = "tr"
    include_signature: bool = True
    preload_seconds: int = 3

class BookVoiceRequest(BaseModel):
    chapter_id: str
    language: Literal["tr", "en"] = "tr"
    section: Optional[str] = None  # specific section within chapter

class VoiceResponse(BaseModel):
    audio_url: str
    duration_estimate: float
    voice_id: str
    text_preview: str

class VoiceIdentity(BaseModel):
    id: str
    name: str
    description_tr: str
    description_en: str
    profile: dict
    behavior: dict

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_tts_client():
    """Get OpenAI TTS client with Emergent key"""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return None
    return OpenAITextToSpeech(api_key=api_key)

def prepare_text_with_pauses(text: str, voice_config: dict) -> str:
    """Add SSML-like pauses to text for natural speech"""
    # OpenAI TTS doesn't support SSML, but we can use punctuation and spacing
    # Add extra periods for longer pauses
    behavior = voice_config.get("behavior", {})
    
    # Replace paragraph breaks with extra pause markers
    text = text.replace("\n\n", "\n\n... ")
    
    # Add breathing room after sentences
    text = text.replace(".\n", "...\n")
    text = text.replace(".\r", "...\r")
    
    return text

def add_signature(text: str, language: str) -> str:
    """Add SANRI brand signature to beginning of text"""
    signature = SANRI_VOICE["signature_tr"] if language == "tr" else SANRI_VOICE["signature_en"]
    return f"{signature}\n\n...\n\n{text}"

async def generate_audio_with_fallback(
    client: OpenAITextToSpeech,
    text: str,
    voice_config: dict
) -> str:
    """Generate audio with fallback if primary voice fails"""
    try:
        # Try primary voice
        audio_base64 = await client.generate_speech_base64(
            text=text,
            model=voice_config["model"],
            voice=voice_config["voice"],
            speed=voice_config["speed"],
            response_format=voice_config.get("response_format", "mp3")
        )
        return audio_base64
    except Exception as e:
        logger.warning(f"Primary voice failed, using fallback: {str(e)}")
        # Try fallback voice
        audio_base64 = await client.generate_speech_base64(
            text=text,
            model=FALLBACK_VOICE["model"],
            voice=FALLBACK_VOICE["voice"],
            speed=FALLBACK_VOICE["speed"],
            response_format="mp3"
        )
        return audio_base64

# ============================================================
# VOICE IDENTITY ENDPOINTS
# ============================================================

@router.get("/identities")
async def get_voice_identities():
    """Get all available voice identities"""
    return {
        "voices": [
            {
                "id": SANRI_VOICE["id"],
                "name": SANRI_VOICE["name"],
                "description_tr": SANRI_VOICE["description_tr"],
                "description_en": SANRI_VOICE["description_en"],
                "profile": SANRI_VOICE["profile"],
                "behavior": SANRI_VOICE["behavior"],
                "signature_tr": SANRI_VOICE["signature_tr"],
                "signature_en": SANRI_VOICE["signature_en"]
            },
            {
                "id": CAELINUS_BOOK_VOICE["id"],
                "name": CAELINUS_BOOK_VOICE["name"],
                "description_tr": CAELINUS_BOOK_VOICE["description_tr"],
                "description_en": CAELINUS_BOOK_VOICE["description_en"],
                "profile": CAELINUS_BOOK_VOICE["profile"],
                "behavior": CAELINUS_BOOK_VOICE["behavior"]
            }
        ]
    }

@router.get("/sanri")
async def get_sanri_voice():
    """Get SANRI voice identity details"""
    return {
        "voice": SANRI_VOICE,
        "status": "active",
        "supported_content": ["rituals", "meditations", "guidance"]
    }

@router.get("/book")
async def get_book_voice():
    """Get Book voice identity details"""
    return {
        "voice": CAELINUS_BOOK_VOICE,
        "status": "active",
        "supported_content": ["book_chapters", "consciousness_texts", "premium_sessions"]
    }

# ============================================================
# RITUAL VOICE PLAY ENDPOINT
# ============================================================

@router.post("/ritual/play")
async def play_ritual_voice(request: VoicePlayRequest):
    """
    Generate and stream ritual audio with SANRI_VOICE
    
    Features:
    - Brand signature at start
    - Slow, hypnotic pace
    - Natural pauses
    - Fallback voice support
    """
    try:
        client = get_tts_client()
        if not client:
            raise HTTPException(status_code=503, detail="Ses servisi yapılandırılmamış")
        
        # Get ritual from database
        ritual = await db.premium_rituals.find_one({"id": request.ritual_id}, {"_id": 0})
        if not ritual:
            raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
        
        # Build full text from ritual steps
        steps = ritual.get("steps", [])
        if not steps:
            raise HTTPException(status_code=400, detail="Bu ritüelin adımları henüz eklenmemiş")
        
        # Combine all steps into single text
        text_parts = []
        for step in steps:
            if request.language == "tr":
                if step.get("title_tr"):
                    text_parts.append(f"... {step['title_tr']} ...")
                text_parts.append(step.get("text_tr", ""))
            else:
                if step.get("title_en"):
                    text_parts.append(f"... {step['title_en']} ...")
                text_parts.append(step.get("text_en", ""))
            text_parts.append("...")  # Pause between steps
        
        full_text = "\n\n".join(text_parts)
        
        # Add signature if requested
        if request.include_signature:
            full_text = add_signature(full_text, request.language)
        
        # Prepare text with natural pauses
        full_text = prepare_text_with_pauses(full_text, SANRI_VOICE)
        
        # Truncate if too long (OpenAI limit: 4096)
        if len(full_text) > 4096:
            full_text = full_text[:4000] + "\n\n... Ritüel devam ediyor..."
        
        # Generate audio with fallback support
        audio_base64 = await generate_audio_with_fallback(client, full_text, SANRI_VOICE)
        
        # Create data URL for audio
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        # Estimate duration (rough: ~150 chars per minute at slow speed)
        duration_estimate = len(full_text) / 100  # minutes
        
        # Log play event
        if db:
            await db.voice_plays.insert_one({
                "ritual_id": request.ritual_id,
                "voice_id": SANRI_VOICE["id"],
                "language": request.language,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        ritual_name = ritual.get("name_tr" if request.language == "tr" else "name_en", "")
        
        return {
            "audio_url": audio_url,
            "duration_estimate": duration_estimate,
            "voice_id": SANRI_VOICE["id"],
            "voice_name": SANRI_VOICE["name"],
            "ritual_name": ritual_name,
            "text_preview": full_text[:200] + "...",
            "steps_count": len(steps),
            "signature_included": request.include_signature
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ritual voice play error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ses üretiminde hata: {str(e)}")

# ============================================================
# BOOK VOICE PLAY ENDPOINT
# ============================================================

@router.post("/book/play")
async def play_book_voice(request: BookVoiceRequest):
    """
    Generate and stream book meditation audio with CAELINUS_BOOK_VOICE
    
    Features:
    - Dream-like, whispery tone
    - Extra slow pace
    - Long pauses between paragraphs
    """
    try:
        client = get_tts_client()
        if not client:
            raise HTTPException(status_code=503, detail="Ses servisi yapılandırılmamış")
        
        # Get chapter from database or static data
        # For now, using a placeholder - integrate with bilinc-alani-data
        chapter_text = ""
        
        # Try to get from database first
        chapter = await db.book_chapters.find_one({"id": request.chapter_id}, {"_id": 0}) if db else None
        
        if chapter:
            chapter_text = chapter.get(f"content_{request.language}", chapter.get("content_tr", ""))
        else:
            # Placeholder for demo
            chapter_text = """
Bu bölümde…
zihnin derinliklerine yolculuk ediyoruz.

Her düşünce…
bir kapıdır.

Her his…
bir anahtar.

Şimdi…
sadece burada ol.
Sadece şu anda.

Bedenin gevşiyor.
Nefes akıyor.
Bilinç genişliyor.
            """
        
        if not chapter_text:
            raise HTTPException(status_code=404, detail="Bölüm içeriği bulunamadı")
        
        # Prepare text with extra pauses for book voice
        full_text = prepare_text_with_pauses(chapter_text, CAELINUS_BOOK_VOICE)
        
        # Truncate if too long
        if len(full_text) > 4096:
            full_text = full_text[:4000] + "\n\n... Bölüm devam ediyor..."
        
        # Generate audio with fallback support
        audio_base64 = await generate_audio_with_fallback(client, full_text, CAELINUS_BOOK_VOICE)
        
        # Create data URL
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        # Estimate duration (even slower for book voice)
        duration_estimate = len(full_text) / 80  # minutes
        
        # Log play event
        if db:
            await db.voice_plays.insert_one({
                "chapter_id": request.chapter_id,
                "voice_id": CAELINUS_BOOK_VOICE["id"],
                "language": request.language,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        return {
            "audio_url": audio_url,
            "duration_estimate": duration_estimate,
            "voice_id": CAELINUS_BOOK_VOICE["id"],
            "voice_name": CAELINUS_BOOK_VOICE["name"],
            "chapter_id": request.chapter_id,
            "text_preview": full_text[:200] + "..."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Book voice play error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ses üretiminde hata: {str(e)}")

# ============================================================
# CUSTOM TEXT TO SPEECH
# ============================================================

@router.post("/generate")
async def generate_custom_voice(
    text: str,
    voice_type: Literal["sanri", "book"] = "sanri",
    language: Literal["tr", "en"] = "tr",
    include_signature: bool = False
):
    """Generate custom text with selected voice identity"""
    try:
        client = get_tts_client()
        if not client:
            raise HTTPException(status_code=503, detail="Ses servisi yapılandırılmamış")
        
        voice_config = SANRI_VOICE if voice_type == "sanri" else CAELINUS_BOOK_VOICE
        
        # Prepare text
        if include_signature and voice_type == "sanri":
            text = add_signature(text, language)
        
        text = prepare_text_with_pauses(text, voice_config)
        
        # Truncate if needed
        if len(text) > 4096:
            text = text[:4000] + "..."
        
        # Generate audio
        audio_base64 = await generate_audio_with_fallback(client, text, voice_config)
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        return {
            "audio_url": audio_url,
            "voice_id": voice_config["id"],
            "text_length": len(text),
            "duration_estimate": len(text) / (100 if voice_type == "sanri" else 80)
        }
        
    except Exception as e:
        logger.error(f"Custom voice generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ses üretiminde hata: {str(e)}")

# ============================================================
# ANALYTICS
# ============================================================

@router.get("/analytics")
async def get_voice_analytics():
    """Get voice usage analytics"""
    if not db:
        return {"total_plays": 0, "by_voice": {}}
    
    total_plays = await db.voice_plays.count_documents({})
    
    # Group by voice
    pipeline = [
        {"$group": {"_id": "$voice_id", "plays": {"$sum": 1}}},
        {"$sort": {"plays": -1}}
    ]
    by_voice = await db.voice_plays.aggregate(pipeline).to_list(10)
    
    return {
        "total_plays": total_plays,
        "by_voice": {item["_id"]: item["plays"] for item in by_voice}
    }
