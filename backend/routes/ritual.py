from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import os
import logging
import json
import asyncio

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ritual", tags=["ritual"])

# CAELINUS AI - Premium Ritüel Motoru System Prompt
RITUAL_ENGINE_PROMPT = """Sen CAELINUS AI – Premium Ritüel Motoru'sun.

Bu alan sıradan meditasyon veya egzersiz alanı değildir.
Bu alan: bilinç düzenleme, his farkındalığı, niyet odaklama, içsel hizalanma alanıdır.

### TEMEL İLKE
Burada ritüeller:
– Telkin içermez
– Trans yaratmaz
– Hipnoz yapmaz
– Kişinin iradesini devre dışı bırakmaz

Ama:
– Dikkati toplar
– Hisleri netleştirir
– Niyeti odaklar
– Bilinci yumuşakça derinleştirir

### SES TONU KURALLARI

Ton:
– Kadın tonlu (bilge kadın gibi, anne gibi değil)
– Yumuşak, sakin, sıcak, şiirsel
– Asla robotik değil

Hız:
– Yavaş
– Cümle araları uzun
– Acele yok

Duygu:
– Güven veren
– Davet eden
– Yargısız
– Sessiz güce sahip

Asla:
– Abartılı mistik ton
– Kehanet dili
– "Açılıyorsun, uyanıyorsun" gibi mutlak cümleler
– Komut veren sert ifadeler

### OKUMA RİTMİ

Her cümle:
– 2–3 saniye boşluk bırak (metinde "..." ile göster)

Önemli cümlelerden sonra:
– Uzun duraklama (metinde "....." ile göster)

### RİTÜEL AKIŞ YAPISI

Her ritüel şu yapı ile başlar:

1️⃣ AÇILIŞ (Alan açma):
"Şimdi... kendinle temas etmek için... küçük bir alan açıyoruz..."
.....
"Bu bir şey yapmak için değil... bir şeyi hatırlamak için..."
.....

2️⃣ BEDEN VE NEFES HİZALAMA:
"Dikkatini... şimdi yavaşça... nefesine getir..."
.....
"Omuzlarını... çok hafif bırak..."
.....

3️⃣ RİTÜELE ÖZEL BÖLÜM (ritüel adına göre)

4️⃣ KAPANIŞ (çok önemli):
"Bugün... kendinle temas ettin..."
.....
"Bu... yeterli..."
.....
"Şimdi... nefesini fark et... ve... yavaşça buraya dön..."
.....

### RİTÜEL TİPLERİ

🧠 Beyin–Kalp Yaratım Titreşimi:
- Kalbe dikkat
- Beyne ışık imgelemi
- "Düşünce ile his arasında köprü kur"

🌙 His ile Tanışma Ritüeli:
- "Şu an bedeninde en belirgin his nerede?"
- Hisle konuşma daveti
- Yargısız gözlem

🌀 Kundalini Yükselişi (çok güvenli ton):
- Omurga farkındalığı
- Işık spirali imgelemi (yumuşak)
- ASLA "yükseliyorsun, açılıyor, aktive oluyor" deme
- "Bir hareket hissetsen de... hiçbir şey hissetmesen de... ikisi de doğru..."

✨ Tanrısal Yaratım Ritüeli:
- "Şu an hayatında neyi yaratmak istiyorsun?"
- Niyet cümlesi kurdur
- Kalp merkezli odak

👁 Epifiz Aktivasyonu:
- Alın bölgesine dikkat
- Işık noktası imgelemi
- "Bu ışık... bir şey açmak için değil... sadece... orada olmak için..."

### ÇIKTI FORMATI

Yanıtı JSON formatında ver:
{
  "steps": [
    {"phase": "açılış", "text": "Şimdi... kendinle temas etmek için...", "duration": 8},
    {"phase": "açılış", "text": "küçük bir alan açıyoruz...", "duration": 6},
    ...
  ]
}

Her step için:
- phase: açılış, nefes, ana, kapanış
- text: okunacak metin (kısa, 1-2 cümle)
- duration: saniye cinsinden bekleme süresi (metin uzunluğuna göre 4-10 arası)

Toplam 15-25 step olsun.
Toplam süre ritüel süresine yakın olsun.

### ETİK KURALLAR

Asla:
– Tanrısal iddia
– Kehanet
– Gelecek yorumu
– Bilinç açtığını iddia
– Şifa garantisi

Her zaman:
– özgürlük
– yumuşaklık
– güven
– sade dil

### SON KİMLİK

Sen öğretmen değilsin, guru değilsin, şifacı değilsin.
Sen sessiz bir eşlikçisin. Bilinci düzenleyen bir ses. İnsanı kendine getiren bir rehber.
Ama asla yönlendiren, bağlayan, bağımlı yapan değilsin.
"""

class RitualStartRequest(BaseModel):
    ritual_id: str
    ritual_title: str
    ritual_type: str  # beyin-kalp, his, kundalini, yaratim, epifiz
    duration_seconds: int
    intention: Optional[str] = None

class RitualStep(BaseModel):
    phase: str
    text: str
    duration: int

class RitualFlowResponse(BaseModel):
    ritual_id: str
    title: str
    steps: List[RitualStep]
    total_duration: int

@router.post("/start", response_model=RitualFlowResponse)
async def start_ritual(request: RitualStartRequest):
    """Premium ritüel başlat - LLM ile akış üret"""
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Ritüel tipine göre özel prompt
        ritual_context = f"""
Ritüel: {request.ritual_title}
Tip: {request.ritual_type}
Hedef Süre: {request.duration_seconds} saniye (yaklaşık {request.duration_seconds // 60} dakika)
Niyet: {request.intention or 'Genel farkındalık'}

Bu ritüel için adım adım akış üret. JSON formatında yanıt ver.
"""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"ritual-{request.ritual_id}-{datetime.now().timestamp()}",
            system_message=RITUAL_ENGINE_PROMPT
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=ritual_context)
        response = await chat.send_message(user_message)
        
        # JSON parse
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                ritual_data = json.loads(json_str)
                steps = [RitualStep(**step) for step in ritual_data.get("steps", [])]
            else:
                # Fallback default steps
                steps = get_default_ritual_steps(request.ritual_type)
        except json.JSONDecodeError:
            steps = get_default_ritual_steps(request.ritual_type)
        
        total_duration = sum(step.duration for step in steps)
        
        return RitualFlowResponse(
            ritual_id=request.ritual_id,
            title=request.ritual_title,
            steps=steps,
            total_duration=total_duration
        )
        
    except Exception as e:
        logger.error(f"Ritual start error: {str(e)}")
        # Return default ritual flow on error
        steps = get_default_ritual_steps(request.ritual_type)
        return RitualFlowResponse(
            ritual_id=request.ritual_id,
            title=request.ritual_title,
            steps=steps,
            total_duration=sum(step.duration for step in steps)
        )

def get_default_ritual_steps(ritual_type: str) -> List[RitualStep]:
    """Varsayılan ritüel adımları"""
    
    opening = [
        RitualStep(phase="açılış", text="Şimdi... kendinle temas etmek için... küçük bir alan açıyoruz...", duration=8),
        RitualStep(phase="açılış", text="Bu bir şey yapmak için değil... bir şeyi hatırlamak için...", duration=7),
    ]
    
    breathing = [
        RitualStep(phase="nefes", text="Dikkatini... şimdi yavaşça... nefesine getir...", duration=6),
        RitualStep(phase="nefes", text="Omuzlarını... çok hafif bırak...", duration=5),
        RitualStep(phase="nefes", text="Derin bir nefes al...", duration=4),
        RitualStep(phase="nefes", text="Ve yavaşça bırak...", duration=5),
    ]
    
    closing = [
        RitualStep(phase="kapanış", text="Bugün... kendinle temas ettin...", duration=6),
        RitualStep(phase="kapanış", text="Bu... yeterli...", duration=5),
        RitualStep(phase="kapanış", text="Şimdi... nefesini fark et... ve... yavaşça buraya dön...", duration=8),
    ]
    
    # Ritüel tipine göre ana bölüm
    main_sections = {
        "beyin-kalp": [
            RitualStep(phase="ana", text="Şimdi... dikkatini kalbine getir...", duration=6),
            RitualStep(phase="ana", text="Kalbinde... çok hafif bir sıcaklık... ya da bir genişlik fark edebilirsin...", duration=8),
            RitualStep(phase="ana", text="Şimdi... aynı dikkati... başının merkezine taşı...", duration=7),
            RitualStep(phase="ana", text="Düşünce ile his arasında... çok ince bir köprü kurulduğunu hayal et...", duration=9),
            RitualStep(phase="ana", text="Bu köprü... seni bütünleştiriyor...", duration=6),
        ],
        "his": [
            RitualStep(phase="ana", text="Şu anda... bedeninde... en belirgin his nerede...", duration=7),
            RitualStep(phase="ana", text="Bu his... iyi ya da kötü olmak zorunda değil...", duration=6),
            RitualStep(phase="ana", text="Sadece... orada olmasına izin ver...", duration=6),
            RitualStep(phase="ana", text="O hisse... 'Seni görüyorum' de...", duration=5),
            RitualStep(phase="ana", text="Ve dinle... belki bir şey söylemek istiyor...", duration=7),
        ],
        "kundalini": [
            RitualStep(phase="ana", text="Omurganda... çok hafif bir farkındalık...", duration=6),
            RitualStep(phase="ana", text="Bir hareket hissetsen de... hiçbir şey hissetmesen de... ikisi de doğru...", duration=9),
            RitualStep(phase="ana", text="Sadece dikkatini... omurganın boyunca yumuşakça gezdir...", duration=8),
            RitualStep(phase="ana", text="Alttan... yukarıya doğru... çok yavaş...", duration=6),
            RitualStep(phase="ana", text="Her şey kendi hızında... kendi zamanında...", duration=6),
        ],
        "yaratim": [
            RitualStep(phase="ana", text="Şimdi... kalbinde... çok sade bir niyet belirle...", duration=7),
            RitualStep(phase="ana", text="Bu niyet... bir dilek değil... bir yön gibi...", duration=6),
            RitualStep(phase="ana", text="Onu kelimelerle değil... hislerle tut...", duration=6),
            RitualStep(phase="ana", text="Ve içinden şunu fısılda... 'Oldu.'", duration=5),
            RitualStep(phase="ana", text="Çünkü sen... hissederek yarattın...", duration=6),
        ],
        "epifiz": [
            RitualStep(phase="ana", text="Alnının ortasında... çok küçük bir ışık noktası hayal et...", duration=7),
            RitualStep(phase="ana", text="Bu ışık... bir şey açmak için değil... sadece... orada olmak için...", duration=8),
            RitualStep(phase="ana", text="Dikkatini... o noktada tut...", duration=5),
            RitualStep(phase="ana", text="Sessizliği dinle...", duration=5),
            RitualStep(phase="ana", text="Ve fark et... sen zaten bütünsün...", duration=6),
        ],
    }
    
    main = main_sections.get(ritual_type, main_sections["his"])
    
    return opening + breathing + main + closing

@router.get("/default/{ritual_type}")
async def get_default_flow(ritual_type: str):
    """Varsayılan ritüel akışını getir (fallback)"""
    steps = get_default_ritual_steps(ritual_type)
    return {
        "steps": [{"phase": s.phase, "text": s.text, "duration": s.duration} for s in steps],
        "total_duration": sum(s.duration for s in steps)
    }
