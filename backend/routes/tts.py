# ElevenLabs TTS Integration for Caelinus Rituals
# Voice: Feminine, warm, slow, poetic Turkish

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from elevenlabs import ElevenLabs, VoiceSettings
import os
import logging
import io
import base64

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tts", tags=["tts"])

# ElevenLabs Client
def get_eleven_client():
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        return None
    return ElevenLabs(api_key=api_key)

# Turkish feminine voices in ElevenLabs
# You can find voice IDs at https://elevenlabs.io/voice-library
TURKISH_FEMININE_VOICES = {
    "default": "EXAVITQu4vr4xnSDxMaL",  # Bella - warm feminine
    "sarah": "EXAVITQu4vr4xnSDxMaL",    # Sarah - soft
    "rachel": "21m00Tcm4TlvDq8ikWAM",   # Rachel - calm
}

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    stability: float = 0.7  # Higher = more stable, calmer
    similarity_boost: float = 0.8
    style: float = 0.5
    speed: float = 0.85  # Slower for ritual

class TTSResponse(BaseModel):
    audio_url: str
    text: str
    voice_id: str

@router.post("/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    Generate text-to-speech audio for ritual narration
    Voice characteristics: Feminine, warm, slow, Turkish
    """
    try:
        client = get_eleven_client()
        
        if not client:
            raise HTTPException(
                status_code=503, 
                detail="Ses servisi şu an aktif değil. Lütfen daha sonra tekrar deneyin."
            )
        
        voice_id = request.voice_id or TURKISH_FEMININE_VOICES["default"]
        
        # Voice settings for calm, slow ritual narration
        voice_settings = VoiceSettings(
            stability=request.stability,
            similarity_boost=request.similarity_boost,
            style=request.style,
            use_speaker_boost=True
        )
        
        # Generate audio
        audio_generator = client.text_to_speech.convert(
            text=request.text,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",  # Best for Turkish
            voice_settings=voice_settings
        )
        
        # Collect audio data
        audio_data = b""
        for chunk in audio_generator:
            audio_data += chunk
        
        # Convert to base64
        audio_b64 = base64.b64encode(audio_data).decode()
        
        return TTSResponse(
            audio_url=f"data:audio/mpeg;base64,{audio_b64}",
            text=request.text,
            voice_id=voice_id
        )
        
    except Exception as e:
        logger.error(f"TTS generation error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Ses üretimi sırasında hata: {str(e)}"
        )

@router.post("/stream")
async def stream_tts(request: TTSRequest):
    """
    Stream text-to-speech audio for real-time playback
    """
    try:
        client = get_eleven_client()
        
        if not client:
            raise HTTPException(
                status_code=503, 
                detail="Ses servisi şu an aktif değil."
            )
        
        voice_id = request.voice_id or TURKISH_FEMININE_VOICES["default"]
        
        voice_settings = VoiceSettings(
            stability=request.stability,
            similarity_boost=request.similarity_boost,
            style=request.style,
            use_speaker_boost=True
        )
        
        # Stream audio
        audio_stream = client.text_to_speech.convert(
            text=request.text,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=voice_settings
        )
        
        def generate():
            for chunk in audio_stream:
                yield chunk
        
        return StreamingResponse(
            generate(),
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
    List available voices
    """
    try:
        client = get_eleven_client()
        
        if not client:
            # Return default voices if no API key
            return {
                "voices": [
                    {"voice_id": "default", "name": "Varsayılan", "available": False}
                ],
                "status": "api_key_required"
            }
        
        voices_response = client.voices.get_all()
        
        return {
            "voices": [
                {
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": getattr(voice, 'category', 'custom'),
                    "labels": getattr(voice, 'labels', {})
                }
                for voice in voices_response.voices
            ],
            "status": "active"
        }
        
    except Exception as e:
        logger.error(f"Voice list error: {str(e)}")
        return {
            "voices": [],
            "status": "error",
            "message": str(e)
        }

@router.get("/status")
async def tts_status():
    """
    Check TTS service status
    """
    client = get_eleven_client()
    
    if not client:
        return {
            "status": "inactive",
            "message": "ElevenLabs API anahtarı yapılandırılmamış",
            "fallback": "web_speech_api"
        }
    
    try:
        # Test API connection
        client.voices.get_all()
        return {
            "status": "active",
            "provider": "elevenlabs",
            "model": "eleven_multilingual_v2"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "fallback": "web_speech_api"
        }
