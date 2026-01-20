# CAELINUS AI - SANRI VOICE SYSTEM
# Ana rehber ses sistemi: Ritüel, Bilinç ve Meditasyon deneyimleri için
# İki ana ses profili: SANRI_VOICE ve CAELINUS_BOOK_VOICE

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Literal
from emergentintegrations.llm.openai import OpenAITextToSpeech
import os
import logging
import base64
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tts", tags=["tts"])

# OpenAI TTS Client
def get_tts_client():
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return None
    return OpenAITextToSpeech(api_key=api_key)

# ============== SANRI VOICE PROFILES ==============
# CAELINUS AI'nin iki ana ses kimliği

# SANRI_VOICE: Ana rehber sesi - Ritüeller ve bilinç deneyimleri için
# Karakteristik: Kadın sesi, yumuşak, sakin, derin, güven veren, hipnotik
# Amaç: Kullanıcının zihnini yavaşlatan, güven veren, içe döndüren ses
SANRI_VOICE_CONFIG = {
    "voice": "nova",           # Sıcak, derin kadın sesi
    "model": "tts-1-hd",       # Yüksek kalite - ritüeller için şart
    "speed": 0.78,             # Çok yavaş - hipnotik etki için
    "description_tr": "SANRI - Rehber, bilge, bilinç açıcı kadın sesi",
    "description_en": "SANRI - Guide, wise, consciousness-opening female voice",
    "characteristics": {
        "tone": "warm, deep, hypnotic",
        "pace": "very slow, rhythmic",
        "emotion": "calm, nurturing, confident",
        "purpose": "rituals, consciousness guidance, inner work"
    }
}

# CAELINUS_BOOK_VOICE: Anlatıcı sesi - Kitap ve meditasyon okumaları için
# Karakteristik: Daha nötr, akıcı, uzun dinlemelerde yormayan
# Amaç: Kitap okumalarına ve meditasyonlara uygun, sıcak anlatıcı
CAELINUS_BOOK_VOICE_CONFIG = {
    "voice": "shimmer",        # Daha hafif, akıcı ses
    "model": "tts-1-hd",       # Yüksek kalite
    "speed": 0.85,             # Biraz daha hızlı ama yine yavaş
    "description_tr": "CAELINUS - Kitap ve meditasyon anlatıcısı",
    "description_en": "CAELINUS - Book and meditation narrator",
    "characteristics": {
        "tone": "neutral, warm, flowing",
        "pace": "moderate, steady",
        "emotion": "gentle, non-tiring",
        "purpose": "book readings, long meditations, narration"
    }
}

# Varsayılan (genel kullanım) - SANRI sesi
DEFAULT_VOICE_CONFIG = SANRI_VOICE_CONFIG

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None  # nova, shimmer, alloy, etc.
    model: Optional[str] = None  # tts-1 or tts-1-hd
    speed: Optional[float] = None  # 0.25 to 4.0
    format: Optional[str] = "mp3"
    voice_profile: Optional[Literal["sanri", "book", "custom"]] = "sanri"

class TTSResponse(BaseModel):
    audio_url: str
    text: str
    voice: str
    model: str
    voice_profile: str

class RitualVoiceRequest(BaseModel):
    ritual_id: str
    language: Literal["tr", "en"] = "tr"

class BookVoiceRequest(BaseModel):
    chapter_id: str
    language: Literal["tr", "en"] = "tr"
    section: Optional[str] = None  # Optional section within chapter

@router.post("/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    Generate text-to-speech audio with SANRI or BOOK voice profile
    SANRI: Hipnotik, rehber, bilinç açıcı - Ritüeller için
    BOOK: Akıcı, sıcak anlatıcı - Kitap okumaları için
    """
    try:
        client = get_tts_client()
        
        if not client:
            raise HTTPException(
                status_code=503, 
                detail="Ses servisi yapılandırılmamış. EMERGENT_LLM_KEY gerekli."
            )
        
        # Select voice profile configuration
        if request.voice_profile == "book":
            config = CAELINUS_BOOK_VOICE_CONFIG
        elif request.voice_profile == "custom" and request.voice:
            config = {"voice": request.voice, "model": "tts-1-hd", "speed": 0.85}
        else:
            config = SANRI_VOICE_CONFIG
        
        # Use config defaults or request overrides
        voice = request.voice or config["voice"]
        model = request.model or config["model"]
        speed = request.speed or config["speed"]
        
        # Validate text length (OpenAI limit: 4096 chars)
        if len(request.text) > 4096:
            raise HTTPException(
                status_code=400,
                detail="Metin çok uzun. Maksimum 4096 karakter."
            )
        
        # Generate speech with base64 output
        audio_base64 = await client.generate_speech_base64(
            text=request.text,
            model=model,
            voice=voice,
            speed=speed,
            response_format=request.format or "mp3"
        )
        
        # Create data URL for audio
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        logger.info(f"TTS generated: {len(request.text)} chars, voice={voice}, profile={request.voice_profile}")
        
        return TTSResponse(
            audio_url=audio_url,
            text=request.text,
            voice=voice,
            model=model,
            voice_profile=request.voice_profile or "sanri"
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"TTS validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Geçersiz istek: {str(e)}")
    except Exception as e:
        logger.error(f"TTS generation error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Ses üretimi sırasında hata: {str(e)}"
        )

@router.post("/stream")
async def stream_tts(request: TTSRequest):
    """
    Stream text-to-speech audio (returns raw audio bytes)
    Supports both SANRI and BOOK voice profiles
    """
    try:
        client = get_tts_client()
        
        if not client:
            raise HTTPException(
                status_code=503, 
                detail="Ses servisi yapılandırılmamış."
            )
        
        # Select voice profile
        if request.voice_profile == "book":
            config = CAELINUS_BOOK_VOICE_CONFIG
        else:
            config = SANRI_VOICE_CONFIG
        
        voice = request.voice or config["voice"]
        model = request.model or config["model"]
        speed = request.speed or config["speed"]
        
        # Generate audio bytes
        audio_bytes = await client.generate_speech(
            text=request.text,
            model=model,
            voice=voice,
            speed=speed,
            response_format=request.format or "mp3"
        )
        
        return StreamingResponse(
            iter([audio_bytes]),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline",
                "Cache-Control": "no-cache"
            }
        )
        
    except Exception as e:
        logger.error(f"TTS streaming error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Ses akışı sırasında hata: {str(e)}"
        )

# ============== SANRI VOICE - RITUAL ENDPOINT ==============

@router.post("/ritual/play")
async def play_ritual_voice(request: RitualVoiceRequest):
    """
    SANRI VOICE ile ritüel seslendir
    - Hipnotik, derin, rehber ses
    - Ritüel adımlarını tek sese birleştirir
    - Premium özellik
    """
    try:
        client = get_tts_client()
        if not client:
            raise HTTPException(status_code=503, detail="Ses servisi yapılandırılmamış")
        
        # Import here to avoid circular dependency
        from routes.premium_ritual import db as ritual_db, get_full_ritual_text, PremiumRitual
        
        if ritual_db is None:
            raise HTTPException(status_code=503, detail="Veritabanı bağlantısı yok")
        
        # Get ritual from database
        ritual_data = await ritual_db.premium_rituals.find_one({"id": request.ritual_id}, {"_id": 0})
        if not ritual_data:
            raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
        
        # Check if ritual has content
        if not ritual_data.get("steps") or len(ritual_data.get("steps", [])) == 0:
            raise HTTPException(status_code=400, detail="Bu ritüelin içeriği henüz eklenmemiş")
        
        ritual = PremiumRitual(**ritual_data)
        
        # Generate full text with proper pauses
        full_text = get_full_ritual_text(ritual, request.language)
        
        # Truncate if too long
        if len(full_text) > 4096:
            full_text = full_text[:4000] + "\n\n... Ritüel devam ediyor..."
        
        # Generate with SANRI voice
        audio_base64 = await client.generate_speech_base64(
            text=full_text,
            model=SANRI_VOICE_CONFIG["model"],
            voice=SANRI_VOICE_CONFIG["voice"],
            speed=SANRI_VOICE_CONFIG["speed"],
            response_format="mp3"
        )
        
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        name = ritual.name_tr if request.language == "tr" else ritual.name_en
        
        logger.info(f"SANRI VOICE ritual played: {ritual.id}, lang={request.language}")
        
        return {
            "ritual_id": ritual.id,
            "name": name,
            "duration_minutes": ritual.duration_minutes,
            "audio_url": audio_url,
            "full_text": full_text,
            "steps_count": len(ritual.steps),
            "voice_profile": "sanri",
            "voice_config": {
                "voice": SANRI_VOICE_CONFIG["voice"],
                "speed": SANRI_VOICE_CONFIG["speed"],
                "description": SANRI_VOICE_CONFIG["description_tr"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ritual voice error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ritüel ses hatası: {str(e)}")

# ============== CAELINUS BOOK VOICE - BOOK/MEDITATION ENDPOINT ==============

@router.post("/book/play")
async def play_book_voice(request: BookVoiceRequest):
    """
    CAELINUS BOOK VOICE ile kitap/meditasyon seslendir
    - Akıcı, sıcak anlatıcı ses
    - Uzun dinlemelerde yormayan
    """
    try:
        client = get_tts_client()
        if not client:
            raise HTTPException(status_code=503, detail="Ses servisi yapılandırılmamış")
        
        # For now, use sample content (can be connected to book database later)
        # This is a placeholder that can be extended
        sample_book_text = """
        Bilinç, sadece düşüncelerden ibaret değildir.
        O, varlığın kendisidir.
        Her an, her nefes, bilinç alanının bir parçasıdır.
        
        Şimdi bu alana gir.
        Zihin durulsun.
        Beden gevşesin.
        Ve hatırla...
        Sen, bu deneyimin tanığısın.
        """
        
        # Generate with BOOK voice
        audio_base64 = await client.generate_speech_base64(
            text=sample_book_text,
            model=CAELINUS_BOOK_VOICE_CONFIG["model"],
            voice=CAELINUS_BOOK_VOICE_CONFIG["voice"],
            speed=CAELINUS_BOOK_VOICE_CONFIG["speed"],
            response_format="mp3"
        )
        
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        logger.info(f"CAELINUS BOOK VOICE played: chapter={request.chapter_id}")
        
        return {
            "chapter_id": request.chapter_id,
            "audio_url": audio_url,
            "text": sample_book_text,
            "voice_profile": "book",
            "voice_config": {
                "voice": CAELINUS_BOOK_VOICE_CONFIG["voice"],
                "speed": CAELINUS_BOOK_VOICE_CONFIG["speed"],
                "description": CAELINUS_BOOK_VOICE_CONFIG["description_tr"]
            }
        }
        
    except Exception as e:
        logger.error(f"Book voice error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kitap ses hatası: {str(e)}")

@router.get("/voices")
async def list_voices():
    """
    List available voice profiles and OpenAI TTS voices
    """
    return {
        "profiles": {
            "sanri": {
                **SANRI_VOICE_CONFIG,
                "recommended_for": ["rituals", "consciousness", "guidance"]
            },
            "book": {
                **CAELINUS_BOOK_VOICE_CONFIG,
                "recommended_for": ["books", "meditations", "long_listening"]
            }
        },
        "available_voices": [
            {"id": "nova", "name": "Nova", "description": "Sıcak, derin - SANRI varsayılanı", "recommended": True},
            {"id": "shimmer", "name": "Shimmer", "description": "Akıcı, hafif - Kitap anlatıcısı", "recommended": True},
            {"id": "alloy", "name": "Alloy", "description": "Nötr, dengeli"},
            {"id": "echo", "name": "Echo", "description": "Pürüzsüz, sakin"},
            {"id": "fable", "name": "Fable", "description": "İfadeli, hikaye anlatıcı"},
            {"id": "onyx", "name": "Onyx", "description": "Derin, otoriter"},
            {"id": "sage", "name": "Sage", "description": "Bilge, ölçülü"},
            {"id": "coral", "name": "Coral", "description": "Sıcak, arkadaşça"},
            {"id": "ash", "name": "Ash", "description": "Net, açık"}
        ],
        "models": [
            {"id": "tts-1", "name": "Standart", "description": "Hızlı, ekonomik"},
            {"id": "tts-1-hd", "name": "HD Kalite", "description": "Yüksek kalite - tüm CAELINUS deneyimleri için", "recommended": True}
        ],
        "default_profile": "sanri",
        "status": "active",
        "provider": "openai"
    }

@router.get("/status")
async def tts_status():
    """
    Check TTS service status with voice profiles
    """
    client = get_tts_client()
    
    if not client:
        return {
            "status": "inactive",
            "message": "EMERGENT_LLM_KEY yapılandırılmamış",
            "fallback": "web_speech_api"
        }
    
    return {
        "status": "active",
        "provider": "openai",
        "voice_profiles": {
            "sanri": {
                "voice": SANRI_VOICE_CONFIG["voice"],
                "speed": SANRI_VOICE_CONFIG["speed"],
                "description": SANRI_VOICE_CONFIG["description_tr"]
            },
            "book": {
                "voice": CAELINUS_BOOK_VOICE_CONFIG["voice"],
                "speed": CAELINUS_BOOK_VOICE_CONFIG["speed"],
                "description": CAELINUS_BOOK_VOICE_CONFIG["description_tr"]
            }
        },
        "features": {
            "turkish_support": True,
            "hd_quality": True,
            "streaming": True,
            "ritual_voice": True,
            "book_voice": True
        },
        "endpoints": {
            "ritual": "/api/tts/ritual/play",
            "book": "/api/tts/book/play",
            "general": "/api/tts/generate"
        }
    }

@router.post("/test")
async def test_tts():
    """
    Test both SANRI and BOOK voice profiles with sample texts
    """
    sanri_text = "Şimdi... kendinle temas etmek için... küçük bir alan açıyoruz..."
    book_text = "Bilinç, düşüncenin ötesinde var olan bir alandır."
    
    try:
        client = get_tts_client()
        
        if not client:
            return {
                "status": "error",
                "message": "TTS servisi yapılandırılmamış"
            }
        
        # Test SANRI voice
        sanri_audio = await client.generate_speech_base64(
            text=sanri_text,
            model=SANRI_VOICE_CONFIG["model"],
            voice=SANRI_VOICE_CONFIG["voice"],
            speed=SANRI_VOICE_CONFIG["speed"]
        )
        
        # Test BOOK voice
        book_audio = await client.generate_speech_base64(
            text=book_text,
            model=CAELINUS_BOOK_VOICE_CONFIG["model"],
            voice=CAELINUS_BOOK_VOICE_CONFIG["voice"],
            speed=CAELINUS_BOOK_VOICE_CONFIG["speed"]
        )
        
        return {
            "status": "success",
            "message": "Her iki ses profili de çalışıyor",
            "sanri_voice": {
                "sample_text": sanri_text,
                "audio_url": f"data:audio/mpeg;base64,{sanri_audio}",
                "config": SANRI_VOICE_CONFIG
            },
            "book_voice": {
                "sample_text": book_text,
                "audio_url": f"data:audio/mpeg;base64,{book_audio}",
                "config": CAELINUS_BOOK_VOICE_CONFIG
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# ============== VOICE PROFILE INFO ==============

@router.get("/profiles")
async def get_voice_profiles():
    """
    Get detailed info about SANRI and CAELINUS voice profiles
    """
    return {
        "sanri": {
            **SANRI_VOICE_CONFIG,
            "use_cases": [
                "Premium ritüeller",
                "Bilinç deneyimleri", 
                "İç alan çalışmaları",
                "Hipnotik rehberlik"
            ],
            "turkish_name": "SANRI SESİ",
            "character": "Rehber • Bilge • Bilinç Açıcı"
        },
        "book": {
            **CAELINUS_BOOK_VOICE_CONFIG,
            "use_cases": [
                "Kitap okumaları",
                "Uzun meditasyonlar",
                "Anlatım içerikleri",
                "Bilinç Alanı bölümleri"
            ],
            "turkish_name": "CAELINUS KİTAP SESİ",
            "character": "Anlatıcı • Akıcı • Sıcak"
        },
        "platform": "CAELINUS AI",
        "language": "Turkish (Primary)",
        "note": "Ses, CAELINUS AI'nin kimliğinin temel parçasıdır."
    }
