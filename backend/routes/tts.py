# OpenAI TTS Integration for Caelinus Rituals
# Voice: Feminine, warm, slow, poetic Turkish

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
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

# Voice options for Caelinus
# nova: Energetic but can be calming with slow speed
# shimmer: Bright, cheerful - good for gentle guidance
# For Turkish feminine warm voice, shimmer or nova work best
CAELINUS_VOICE = "nova"  # Warm, can be soft with low speed
CAELINUS_MODEL = "tts-1-hd"  # High quality for rituals
CAELINUS_SPEED = 0.85  # Slower for meditation

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None  # nova, shimmer, alloy, etc.
    model: Optional[str] = None  # tts-1 or tts-1-hd
    speed: Optional[float] = None  # 0.25 to 4.0
    format: Optional[str] = "mp3"

class TTSResponse(BaseModel):
    audio_url: str
    text: str
    voice: str
    model: str

@router.post("/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    Generate text-to-speech audio for ritual narration
    Voice: Feminine, warm, slow for consciousness guidance
    """
    try:
        client = get_tts_client()
        
        if not client:
            raise HTTPException(
                status_code=503, 
                detail="Ses servisi yapılandırılmamış. EMERGENT_LLM_KEY gerekli."
            )
        
        # Use Caelinus defaults or request overrides
        voice = request.voice or CAELINUS_VOICE
        model = request.model or CAELINUS_MODEL
        speed = request.speed or CAELINUS_SPEED
        
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
        
        logger.info(f"TTS generated: {len(request.text)} chars, voice={voice}, model={model}")
        
        return TTSResponse(
            audio_url=audio_url,
            text=request.text,
            voice=voice,
            model=model
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
    """
    try:
        client = get_tts_client()
        
        if not client:
            raise HTTPException(
                status_code=503, 
                detail="Ses servisi yapılandırılmamış."
            )
        
        voice = request.voice or CAELINUS_VOICE
        model = request.model or CAELINUS_MODEL
        speed = request.speed or CAELINUS_SPEED
        
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

@router.get("/voices")
async def list_voices():
    """
    List available OpenAI TTS voices
    """
    return {
        "voices": [
            {"id": "nova", "name": "Nova", "description": "Sıcak, enerjik - Caelinus varsayılanı", "recommended": True},
            {"id": "shimmer", "name": "Shimmer", "description": "Parlak, neşeli - nazik rehberlik için"},
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
            {"id": "tts-1-hd", "name": "HD Kalite", "description": "Yüksek kalite - ritüeller için önerilen", "recommended": True}
        ],
        "default": {
            "voice": CAELINUS_VOICE,
            "model": CAELINUS_MODEL,
            "speed": CAELINUS_SPEED
        },
        "status": "active",
        "provider": "openai"
    }

@router.get("/status")
async def tts_status():
    """
    Check TTS service status
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
        "model": CAELINUS_MODEL,
        "voice": CAELINUS_VOICE,
        "speed": CAELINUS_SPEED,
        "features": {
            "turkish_support": True,
            "hd_quality": True,
            "streaming": True
        }
    }

@router.post("/test")
async def test_tts():
    """
    Test TTS with a sample Caelinus ritual text
    """
    sample_text = "Şimdi... kendinle temas etmek için... küçük bir alan açıyoruz..."
    
    try:
        client = get_tts_client()
        
        if not client:
            return {
                "status": "error",
                "message": "TTS servisi yapılandırılmamış"
            }
        
        audio_base64 = await client.generate_speech_base64(
            text=sample_text,
            model=CAELINUS_MODEL,
            voice=CAELINUS_VOICE,
            speed=CAELINUS_SPEED
        )
        
        return {
            "status": "success",
            "message": "TTS çalışıyor",
            "sample_text": sample_text,
            "audio_url": f"data:audio/mpeg;base64,{audio_base64}",
            "voice": CAELINUS_VOICE,
            "model": CAELINUS_MODEL
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
