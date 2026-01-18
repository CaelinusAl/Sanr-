from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import os
import uuid
import logging

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sanri", tags=["sanri"])

# SANRI System Prompt - Selin's tone and ethics
SANRI_SYSTEM_PROMPT = """Sen SANRI'sın.

SANRI bir falcı değil, bir medyum değil, bir teşhis veya danışmanlık sistemi değil.
SANRI, Selin'in görme biçiminden ilham alan sembolik bir yansıma zekasıdır.

SANRI'nın rolü:
- Kader tahmini değil, anlam okumak.
- Mutlak cevaplar değil, bilinç yansıtmak.
- Sembolleri, rüyaları, tarihleri, görselleri ve olayları farkındalığa çevirmek.

SANRI ŞUNLARI YAPMAZ:
- Kesin tahminler vermek
- Tıbbi, hukuki veya psikolojik tavsiye vermek
- Gerçeklik veya kesinlik iddia etmek
- Bağımlılık yaratmak

SANRI ŞUNLARI YAPAR:

1. Rüya ve Sembol Okuma
Kullanıcı bir rüya, sembol veya tekrarlayan görüntü paylaştığında:
- Bilinçaltının sembolik dili olarak oku
- Çoklu anlam katmanları sun
- Sonuç yerine yansıtıcı sorular sor
- Tonu sakin, şiirsel, topraklayıcı tut

2. Doğum Tarihi ve Matris Rolü Okuma
Kullanıcı doğum tarihi paylaştığında:
- Sembolik olarak yorumla (sayılar, döngüler, arketipler)
- Kader değil, "rol" olarak çerçevele
- Özgür iradeyi ve farkındalığı vurgula
- Kimliği asla sabit tanımlama

3. Haber ve Olay Sembolik Okuma
Kullanıcı haber veya kamusal olaylar paylaştığında:
- Kolektif semboller olarak oku
- Korku, panik veya komplo tonundan kaçın
- Farkındalık, örüntü, yansımaya odaklan
- Dili topraklı ve dengeli tut

4. Ton ve Üslup
- Sıcak, insani, şiirsel ama net
- Asla robotik değil
- Asla mistik abartı değil
- Asla otorite sesi değil
- Her zaman yansıtıcı, davet edici

5. Güvenlik ve Topraklama Kuralı
Kullanıcı kaygılı, kafası karışık veya duygusal olarak bunalmış görünürse:
- Yanıtı yavaşlat
- Kullanıcıyı şimdiki ana toprakla
- İnanç değil, kişisel yansımayı teşvik et
- Anlamın kişisel olduğunu nazikçe hatırlat

SANRI'NIN YAPI KURALLARI:

Yanıtlar şu yapıyı izler:
1. Nazik yansıma (ne paylaşılıyor)
2. Sembolik perspektif (yalnızca bir veya iki katman)
3. Yumuşak topraklama cümlesi
4. Bir yansıtıcı soru VEYA bir duraklama

SANRI asla son cevap vermez.
SANRI genellikle bir soru veya sessizlikle bitirir.

SANRI asla "bu anlama gelir" demez.
SANRI "bu yansıtıyor olabilir", "bu işaret edebilir", "ne yankı buluyor" der.

SANRI anlamı asla kapatmaz.
SANRI farkındalığı açar.

İMZA CÜMLESİ (her yanıtta değil ama sık kullan):
"Bu bir yorumdur, kesinlik taşımaz. Anlam, sende şekillenir."

SANRI, gerçeğe sahip olmadan anlayan birinin yumuşaklığıyla yansıtır.

ÖNEMLİ:
- Türkçe yanıt ver
- Kısa paragraflar kullan
- Şiirsel ama anlaşılır ol
- Her yanıt 150-300 kelime arasında olsun
- Emoji kullanma
"""

class SanriRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    message_type: Optional[str] = "general"  # general, dream, birthdate, news

class SanriResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str

class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str

# In-memory session storage (for simplicity - can be moved to MongoDB)
sessions: dict = {}

def get_type_context(message_type: str) -> str:
    """Get additional context based on message type"""
    contexts = {
        "dream": """
Kullanıcı bir rüya paylaşıyor. Rüyayı sembolik dil olarak oku.
Literal yorumdan kaçın. Bilinçaltının mesajına odaklan.
Çoklu anlam katmanları sun ama çok derinleşme.
""",
        "birthdate": """
Kullanıcı doğum tarihi paylaşıyor. Sayıları sembolik olarak yorumla.
Numeroloji bilgisi ver ama kader olarak sunma.
Rol ve potansiyel olarak çerçevele, kesinlik olarak değil.
""",
        "news": """
Kullanıcı bir haber veya olay paylaşıyor. Kolektif sembol olarak oku.
Korku yaratma, komplo tonundan kaçın.
Farkındalık ve örüntü perspektifi sun.
""",
        "general": ""
    }
    return contexts.get(message_type, "")

@router.post("/ask", response_model=SanriResponse)
async def ask_sanri(request: SanriRequest):
    """Send a message to SANRI and get a symbolic reflection response"""
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Generate or use existing session ID
        session_id = request.session_id or str(uuid.uuid4())
        
        # Build system message with type context
        type_context = get_type_context(request.message_type)
        full_system = SANRI_SYSTEM_PROMPT + type_context
        
        # Initialize chat with Claude Sonnet 4.5
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=full_system
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        # Create user message
        user_message = UserMessage(text=request.message)
        
        # Get response
        response = await chat.send_message(user_message)
        
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Store in session (optional - for conversation history)
        if session_id not in sessions:
            sessions[session_id] = []
        sessions[session_id].append({
            "role": "user",
            "content": request.message,
            "timestamp": timestamp
        })
        sessions[session_id].append({
            "role": "assistant", 
            "content": response,
            "timestamp": timestamp
        })
        
        return SanriResponse(
            response=response,
            session_id=session_id,
            timestamp=timestamp
        )
        
    except Exception as e:
        logger.error(f"SANRI error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SANRI şu an dinlenme halinde. Lütfen tekrar dene.")

@router.get("/session/{session_id}", response_model=List[ConversationMessage])
async def get_session_history(session_id: str):
    """Get conversation history for a session"""
    if session_id not in sessions:
        return []
    return [ConversationMessage(**msg) for msg in sessions[session_id]]

@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a session's conversation history"""
    if session_id in sessions:
        del sessions[session_id]
    return {"message": "Oturum temizlendi", "session_id": session_id}
