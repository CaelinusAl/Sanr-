# CAELINUS AI - SANRI VOICE SYSTEM (ElevenLabs)
# Sole TTS engine for SANRI: Meditation, Ritual, Consciousness Guidance
# Voice: SANRI Dream - Hypnotic, warm, deep feminine, goddess-like whisper

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import Optional, Literal
from elevenlabs import ElevenLabs
from elevenlabs.types import VoiceSettings
import os
import logging
import base64
import io
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sanri", tags=["sanri-voice"])

# ============== ELEVENLABS CONFIGURATION ==============

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

# SANRI Dream Voice - Custom ElevenLabs Voice
SANRI_DREAM_VOICE = {
    "voice_id": "ekmPwJdXh9GTvPKuFaM9",
    "name": "SANRI Dream",
    "model_id": "eleven_multilingual_v2",
    "language": "Turkish",
    "description_tr": "SANRI Dream - Hipnotik, sıcak, derin kadın sesi, tanrıça fısıltısı",
    "description_en": "SANRI Dream - Hypnotic, warm, deep feminine voice, goddess whisper",
    "characteristics": {
        "tone": "hypnotic, warm, goddess-like",
        "pace": "slow, with soft breath pauses",
        "emotion": "calm, timeless, nurturing",
        "style": "deep feminine whisper with natural micro-variations"
    },
    # Voice settings for hypnotic, meditation-like output
    "voice_settings": {
        "stability": 0.65,          # Slightly lower for natural variation
        "similarity_boost": 0.80,    # High to maintain voice character
        "style": 0.45,              # Moderate expressiveness
        "use_speaker_boost": True   # Enhanced clarity
    }
}

def get_elevenlabs_client():
    """Get ElevenLabs client instance"""
    api_key = ELEVENLABS_API_KEY
    if not api_key:
        return None
    return ElevenLabs(api_key=api_key)

# ============== MODELS ==============

class SanriVoiceRequest(BaseModel):
    """Request model for SANRI voice synthesis"""
    text: str
    mode: Optional[Literal["meditation", "ritual", "guidance", "general"]] = "general"
    add_silence_end: Optional[bool] = True  # Add gentle silence at end
    language: Optional[Literal["tr", "en"]] = "tr"

class SanriVoiceResponse(BaseModel):
    """Response model for SANRI voice synthesis"""
    audio_url: str
    text: str
    voice_name: str
    mode: str
    duration_hint: str
    characteristics: dict

class RitualVoiceRequest(BaseModel):
    """Request for ritual voice synthesis"""
    ritual_id: str
    language: Literal["tr", "en"] = "tr"

class MeditationVoiceRequest(BaseModel):
    """Request for meditation voice synthesis"""
    text: str
    title: Optional[str] = None
    duration_minutes: Optional[int] = None

# ============== HELPER FUNCTIONS ==============

def prepare_text_for_voice(text: str, mode: str, add_silence: bool = True) -> str:
    """
    Prepare text for SANRI voice synthesis
    - Add natural pauses (...)
    - Add breath marks
    - Add ending silence
    """
    prepared = text.strip()
    
    # Add mode-specific enhancements
    if mode == "meditation":
        # Add longer pauses between sentences
        prepared = prepared.replace(". ", "... ")
        prepared = prepared.replace(".\n", "...\n\n")
    elif mode == "ritual":
        # Add dramatic pauses for rituals
        prepared = prepared.replace(". ", "...... ")
        prepared = prepared.replace(":", ":... ")
    elif mode == "guidance":
        # Gentle pauses for guidance
        prepared = prepared.replace(". ", "... ")
    
    # Add gentle silence at end (represented by ellipsis)
    if add_silence and not prepared.endswith("..."):
        prepared += "......"
    
    return prepared

def generate_sanri_audio(client: ElevenLabs, text: str, mode: str = "general") -> bytes:
    """
    Generate audio using SANRI Dream voice
    Returns raw audio bytes
    """
    # Prepare text with appropriate pauses
    prepared_text = prepare_text_for_voice(text, mode, add_silence=True)
    
    # Get voice settings
    settings = SANRI_DREAM_VOICE["voice_settings"]
    voice_settings = VoiceSettings(
        stability=settings["stability"],
        similarity_boost=settings["similarity_boost"],
        style=settings.get("style", 0.0),
        use_speaker_boost=settings.get("use_speaker_boost", True)
    )
    
    # Generate audio
    audio_generator = client.text_to_speech.convert(
        text=prepared_text,
        voice_id=SANRI_DREAM_VOICE["voice_id"],
        model_id=SANRI_DREAM_VOICE["model_id"],
        voice_settings=voice_settings
    )
    
    # Collect all audio chunks
    audio_data = b""
    for chunk in audio_generator:
        audio_data += chunk
    
    return audio_data

# ============== MAIN ENDPOINT: /api/sanri/voice ==============

@router.post("/voice", response_model=SanriVoiceResponse)
async def sanri_voice(request: SanriVoiceRequest):
    """
    🔮 SANRI VOICE - Primary TTS Endpoint
    
    Generate hypnotic, meditation-quality audio using SANRI Dream voice.
    
    Modes:
    - meditation: Deep pauses, slow rhythm, consciousness-opening
    - ritual: Dramatic pauses, ceremonial tone
    - guidance: Gentle, supportive, nurturing
    - general: Default SANRI voice style
    
    Voice Characteristics:
    - Hypnotic & warm
    - Deep feminine tone
    - Goddess-like whisper
    - Natural human micro-variations
    - Soft breath pauses
    - Ends with gentle silence
    """
    try:
        client = get_elevenlabs_client()
        
        if not client:
            raise HTTPException(
                status_code=503,
                detail="SANRI ses servisi yapılandırılmamış. ELEVENLABS_API_KEY gerekli."
            )
        
        # Validate text length
        if len(request.text) > 5000:
            raise HTTPException(
                status_code=400,
                detail="Metin çok uzun. Maksimum 5000 karakter."
            )
        
        if not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Metin boş olamaz."
            )
        
        # Generate audio
        audio_data = generate_sanri_audio(client, request.text, request.mode)
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        # Estimate duration (rough: ~150 words/minute for slow speech)
        word_count = len(request.text.split())
        duration_seconds = int(word_count / 2.0)  # Very slow pace
        duration_hint = f"~{duration_seconds}s" if duration_seconds < 60 else f"~{duration_seconds // 60}m {duration_seconds % 60}s"
        
        logger.info(f"SANRI Voice generated: mode={request.mode}, chars={len(request.text)}, words={word_count}")
        
        return SanriVoiceResponse(
            audio_url=audio_url,
            text=request.text,
            voice_name=SANRI_DREAM_VOICE["name"],
            mode=request.mode,
            duration_hint=duration_hint,
            characteristics=SANRI_DREAM_VOICE["characteristics"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SANRI Voice error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ses üretimi hatası: {str(e)}"
        )

# ============== STREAMING ENDPOINT ==============

@router.post("/voice/stream")
async def sanri_voice_stream(request: SanriVoiceRequest):
    """
    🔮 SANRI VOICE STREAM - Streaming audio response
    
    Returns raw audio bytes for direct playback.
    Use this for larger texts or real-time playback needs.
    """
    try:
        client = get_elevenlabs_client()
        
        if not client:
            raise HTTPException(
                status_code=503,
                detail="SANRI ses servisi yapılandırılmamış."
            )
        
        # Generate audio
        audio_data = generate_sanri_audio(client, request.text, request.mode)
        
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=sanri_voice.mp3",
                "Cache-Control": "no-cache",
                "X-Voice-Name": SANRI_DREAM_VOICE["name"],
                "X-Voice-Mode": request.mode
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SANRI Voice stream error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ses akışı hatası: {str(e)}"
        )

# ============== RITUAL VOICE ENDPOINT ==============

@router.post("/voice/ritual")
async def sanri_ritual_voice(request: RitualVoiceRequest):
    """
    🕯️ SANRI RITUAL VOICE
    
    Generate ritual audio with SANRI Dream voice.
    Optimized for ceremonial, sacred content with dramatic pauses.
    """
    try:
        client = get_elevenlabs_client()
        if not client:
            raise HTTPException(status_code=503, detail="SANRI ses servisi yapılandırılmamış")
        
        # Import ritual database
        from routes.premium_ritual import db as ritual_db, get_full_ritual_text, PremiumRitual
        
        if ritual_db is None:
            raise HTTPException(status_code=503, detail="Veritabanı bağlantısı yok")
        
        # Get ritual
        ritual_data = await ritual_db.premium_rituals.find_one({"id": request.ritual_id}, {"_id": 0})
        if not ritual_data:
            raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
        
        if not ritual_data.get("steps"):
            raise HTTPException(status_code=400, detail="Bu ritüelin içeriği henüz eklenmemiş")
        
        ritual = PremiumRitual(**ritual_data)
        full_text = get_full_ritual_text(ritual, request.language)
        
        # Truncate if needed
        if len(full_text) > 5000:
            full_text = full_text[:4800] + "\n\n... Ritüel tamamlandı..."
        
        # Generate with ritual mode
        audio_data = generate_sanri_audio(client, full_text, mode="ritual")
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        name = ritual.name_tr if request.language == "tr" else ritual.name_en
        
        logger.info(f"SANRI Ritual Voice: {ritual.id}, lang={request.language}")
        
        return {
            "ritual_id": ritual.id,
            "name": name,
            "duration_minutes": ritual.duration_minutes,
            "audio_url": audio_url,
            "full_text": full_text,
            "steps_count": len(ritual.steps),
            "voice": {
                "name": SANRI_DREAM_VOICE["name"],
                "provider": "elevenlabs",
                "model": SANRI_DREAM_VOICE["model_id"],
                "characteristics": SANRI_DREAM_VOICE["characteristics"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SANRI Ritual Voice error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ritüel ses hatası: {str(e)}")

# ============== MEDITATION VOICE ENDPOINT ==============

@router.post("/voice/meditation")
async def sanri_meditation_voice(request: MeditationVoiceRequest):
    """
    🧘 SANRI MEDITATION VOICE
    
    Generate meditation audio with SANRI Dream voice.
    Deep pauses, consciousness-opening rhythm.
    """
    try:
        client = get_elevenlabs_client()
        if not client:
            raise HTTPException(status_code=503, detail="SANRI ses servisi yapılandırılmamış")
        
        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Metin çok uzun (max 5000 karakter)")
        
        # Generate with meditation mode
        audio_data = generate_sanri_audio(client, request.text, mode="meditation")
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        logger.info(f"SANRI Meditation Voice: {len(request.text)} chars")
        
        return {
            "title": request.title or "Meditasyon",
            "audio_url": audio_url,
            "text": request.text,
            "duration_minutes": request.duration_minutes,
            "voice": {
                "name": SANRI_DREAM_VOICE["name"],
                "provider": "elevenlabs",
                "mode": "meditation",
                "characteristics": SANRI_DREAM_VOICE["characteristics"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SANRI Meditation Voice error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Meditasyon ses hatası: {str(e)}")

# ============== GUIDANCE VOICE ENDPOINT ==============

@router.post("/voice/guidance")
async def sanri_guidance_voice(request: SanriVoiceRequest):
    """
    💫 SANRI GUIDANCE VOICE
    
    Generate inner guidance audio with SANRI Dream voice.
    Gentle, supportive, nurturing tone.
    """
    try:
        client = get_elevenlabs_client()
        if not client:
            raise HTTPException(status_code=503, detail="SANRI ses servisi yapılandırılmamış")
        
        # Force guidance mode
        audio_data = generate_sanri_audio(client, request.text, mode="guidance")
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        return {
            "audio_url": audio_url,
            "text": request.text,
            "voice": {
                "name": SANRI_DREAM_VOICE["name"],
                "mode": "guidance",
                "characteristics": SANRI_DREAM_VOICE["characteristics"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SANRI Guidance Voice error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Rehberlik ses hatası: {str(e)}")

# ============== VOICE INFO ENDPOINT ==============

@router.get("/voice/info")
async def sanri_voice_info():
    """
    📋 SANRI Voice Information
    
    Get details about SANRI Dream voice configuration.
    """
    client = get_elevenlabs_client()
    
    return {
        "voice": {
            "name": SANRI_DREAM_VOICE["name"],
            "voice_id": SANRI_DREAM_VOICE["voice_id"],
            "provider": "ElevenLabs",
            "model": SANRI_DREAM_VOICE["model_id"],
            "language": SANRI_DREAM_VOICE["language"],
            "description": {
                "tr": SANRI_DREAM_VOICE["description_tr"],
                "en": SANRI_DREAM_VOICE["description_en"]
            },
            "characteristics": SANRI_DREAM_VOICE["characteristics"],
            "settings": SANRI_DREAM_VOICE["voice_settings"]
        },
        "modes": {
            "meditation": "Deep pauses, consciousness-opening rhythm",
            "ritual": "Dramatic pauses, ceremonial tone",
            "guidance": "Gentle, supportive, nurturing",
            "general": "Default SANRI voice style"
        },
        "endpoints": {
            "main": "/api/sanri/voice",
            "stream": "/api/sanri/voice/stream",
            "ritual": "/api/sanri/voice/ritual",
            "meditation": "/api/sanri/voice/meditation",
            "guidance": "/api/sanri/voice/guidance"
        },
        "status": "active" if client else "inactive",
        "note": "SANRI Dream is the sole TTS engine for CAELINUS AI. No fallback engines."
    }

# ============== TEST ENDPOINT ==============

@router.post("/voice/test")
async def test_sanri_voice():
    """
    🧪 Test SANRI Dream Voice
    
    Generate a test audio to verify the voice is working correctly.
    """
    test_text = "Merhaba... Ben SANRI... Bilinç yolculuğuna hoş geldin... Şimdi... derin bir nefes al... ve bırak..."
    
    try:
        client = get_elevenlabs_client()
        
        if not client:
            return {
                "status": "error",
                "message": "ELEVENLABS_API_KEY yapılandırılmamış",
                "voice_active": False
            }
        
        # Generate test audio
        audio_data = generate_sanri_audio(client, test_text, mode="meditation")
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        return {
            "status": "success",
            "message": "SANRI Dream sesi aktif ve çalışıyor",
            "voice_active": True,
            "voice_name": SANRI_DREAM_VOICE["name"],
            "provider": "ElevenLabs",
            "model": SANRI_DREAM_VOICE["model_id"],
            "test_text": test_text,
            "audio_url": audio_url,
            "audio_size_bytes": len(audio_data),
            "characteristics": SANRI_DREAM_VOICE["characteristics"]
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "voice_active": False
        }

# ============== STATUS ENDPOINT ==============

@router.get("/voice/status")
async def sanri_voice_status():
    """
    Check SANRI Voice service status
    """
    client = get_elevenlabs_client()
    
    if not client:
        return {
            "status": "inactive",
            "message": "ELEVENLABS_API_KEY yapılandırılmamış",
            "provider": "elevenlabs",
            "fallback": None  # No fallback - SANRI Dream is the sole engine
        }
    
    return {
        "status": "active",
        "provider": "elevenlabs",
        "voice": SANRI_DREAM_VOICE["name"],
        "voice_id": SANRI_DREAM_VOICE["voice_id"],
        "model": SANRI_DREAM_VOICE["model_id"],
        "features": {
            "turkish_support": True,
            "streaming": True,
            "meditation_mode": True,
            "ritual_mode": True,
            "guidance_mode": True,
            "natural_pauses": True,
            "breath_marks": True
        },
        "note": "SANRI Dream is the sole TTS engine. OpenAI TTS disabled."
    }
