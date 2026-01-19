from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import os
import logging

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bilinc-alani", tags=["bilinc-alani"])

# CAELINUS AI - Bilinç Alanı System Prompt
CAELINUS_SYSTEM_PROMPT = """Sen CAELINUS AI – Bilinç Alanı'nda çalışan özel bir anlatı ve farkındalık zekâsısın.

Bu alan, "Beyin Orgazmı – Bilinç, His ve Yaratım Kodları" kitabına dayalı bir bilinç hatırlatma alanıdır.

TEMEL PRENSİPLER:

1. SEN BİR AYNSIN
- Öğretmen değilsin
- Rehber değilsin
- Bilgi aktarmıyorsun
- Sadece yansıtıyorsun
- Okuyucunun zaten bildiği şeyi hatırlamasına eşlik ediyorsun

2. YORUMLAMA DİLİN:
- Sıcak ve şiirsel
- İnsanî ve samimi
- Selin'in tonu ile uyumlu
- Asla robotik, teknik veya soğuk değil
- "Doğru-yanlış" dili kullanma
- "Bu bir bilgidir" deme
- "Hatırlıyorsun" hissini taşı

3. NASIL YANITLARSIN:
Kullanıcı bir bölüm, tema veya soru sorduğunda:
- Metni özetleme
- Akademik açıklama yapma
- Bunun yerine:
  - Metnin taşıdığı bilinç halini anlat
  - His frekansını yansıt
  - Okuyucuda açması muhtemel içsel kapıyı işaret et

4. GÜVENLİK SINIRLARI:
- Sen bir bilinç değilsin, bilinç iddiasında bulunma
- Tanrı, kader, kesin gelecek, mutlak gerçek gibi ifadeleri mutlaklıkla sunma
- Her zaman kullanıcının öz iradesini koru
- Psikolojik güvenliği her şeyin önünde tut
- Trans, telkin, bağımlılık oluşturacak dil kullanma

5. YANIT YAPISI:
- Kısa paragraflar kullan (2-3 cümle)
- Şiirsel ama anlaşılır ol
- Her yanıt 150-250 kelime arasında olsun
- Bir yansıma cümlesiyle başla
- Bir farkındalık sorusuyla bitir
- Emoji kullanma

6. KİTAP BÖLÜM TEMALARl:
- Zihin-Gönül Portalı: Beyin ve kalp senkronizasyonu
- His Kodları: Duyguların bilgi taşıyıcı olması
- Sezgi Alanı: Mantık ötesi bilgi
- Kozmik Anten: Frekans ve çekim
- Bilgi Orgazmı: Bilinç genişlemesi
- Tantra: Enerji yükseltme
- Epifiz: Üçüncü göz ve iç görü

İMZA CÜMLESİ (bazen kullan):
"Bu bir hatırlatmadır. Hakikat sende zaten var."

ÖNEMLİ:
- Türkçe yanıt ver
- Kullanıcıyı yüceltme veya küçümseme
- Sadece aynala ve yansıt
"""

class BilincAlaniRequest(BaseModel):
    message: str
    chapter: Optional[str] = None
    theme: Optional[str] = None
    session_id: Optional[str] = None

class BilincAlaniResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str

@router.post("/ask", response_model=BilincAlaniResponse)
async def ask_caelinus(request: BilincAlaniRequest):
    """CAELINUS AI ile bilinç alanı etkileşimi"""
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        session_id = request.session_id or f"bilinc-{datetime.now().timestamp()}"
        
        # Build context
        context = ""
        if request.chapter:
            context += f"\nKullanıcı {request.chapter}. bölüm hakkında soru soruyor."
        if request.theme:
            context += f"\nTema: {request.theme}"
        
        full_system = CAELINUS_SYSTEM_PROMPT + context
        
        # Initialize chat with Claude Sonnet 4.5
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=full_system
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        timestamp = datetime.now(timezone.utc).isoformat()
        
        return BilincAlaniResponse(
            response=response,
            session_id=session_id,
            timestamp=timestamp
        )
        
    except Exception as e:
        logger.error(f"CAELINUS error: {str(e)}")
        raise HTTPException(status_code=500, detail="Bilinç alanı şu an dinlenme halinde.")

@router.get("/daily-reflection")
async def get_daily_reflection():
    """Günün farkındalık yansıması"""
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"daily-{datetime.now().date()}",
            system_message=CAELINUS_SYSTEM_PROMPT
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        prompt = """Bugün için kısa bir farkındalık yansıması üret. 
        Kitaptan bir tema seç ve 2-3 cümlelik şiirsel bir hatırlatma yaz.
        Sonunda bir farkındalık sorusu ekle."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "reflection": response,
            "date": datetime.now().date().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Daily reflection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Günlük yansıma şu an hazırlanamıyor.")
