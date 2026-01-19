from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageUrl
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
from motor.motor_asyncio import AsyncIOMotorDatabase
from dotenv import load_dotenv
import os
import uuid
import logging
import base64
import io

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/visual", tags=["visual"])

# Database reference - will be set by server.py
db: AsyncIOMotorDatabase = None

def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database

# ============== MODELS ==============

class VisualPreset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_tr: str
    name_en: str
    description_tr: str
    description_en: str
    icon: str  # emoji
    style_prompt: str
    negative_prompt: str
    aspect_ratios: List[str] = ["4:5", "1:1"]
    default_outputs: int = 1
    premium_only: bool = False
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PresetCreate(BaseModel):
    name_tr: str
    name_en: str
    description_tr: str
    description_en: str
    icon: str
    style_prompt: str
    negative_prompt: str = "low quality, blurry, cartoon, anime, oversaturated, distorted anatomy, watermark, logo, text"
    aspect_ratios: List[str] = ["4:5", "1:1"]
    default_outputs: int = 1
    premium_only: bool = False

class GenerateRequest(BaseModel):
    intention: str  # User's theme/intention
    preset_id: Optional[str] = None  # Use specific preset
    aspect_ratio: str = "4:5"
    num_images: int = 1
    show_prompt: bool = False  # Whether to return the full prompt

class GenerateResponse(BaseModel):
    images: List[str]  # base64 encoded images
    preset_used: Optional[str]
    prompt_used: Optional[str]  # Only if show_prompt is True
    generation_id: str
    timestamp: str

class AnalyzeRequest(BaseModel):
    context: Optional[str] = None  # Optional context from user
    is_premium: bool = False

class AnalyzeResponse(BaseModel):
    seen: str  # "Gördüğüm" - objective description
    symbolic: str  # "Sembolik Okuma"
    questions: List[str]  # "Yansıma Soruları" - 3 questions
    ritual: str  # "Mini Ritüel"
    analysis_id: str
    timestamp: str

# ============== GLOBAL STYLE ==============

CAELINUS_GLOBAL_STYLE = """sacred minimalism, dark cosmic background, holographic bioluminescent glow, 
high fashion editorial lighting, soft mist, ethereal particles, clean composition, no clutter, 
premium, cinematic, dreamy, no text, no watermark, no logos"""

CAELINUS_NEGATIVE = """low quality, blurry, cartoon, anime, plastic skin, extra limbs, 
distorted anatomy, watermark, text, logo, oversaturated, cheap looking"""

# ============== DEFAULT PRESETS ==============

DEFAULT_PRESETS = [
    {
        "id": "moon-jellyfish",
        "name_tr": "Moon Jellyfish – Bilinç Işığı",
        "name_en": "Moon Jellyfish – Consciousness Light",
        "description_tr": "Bilincin görünmez akışını temsil eden kozmik varlık.",
        "description_en": "A cosmic entity representing the invisible flow of consciousness.",
        "icon": "🌙",
        "style_prompt": "bioluminescent cosmic jellyfish floating in deep space, sacred minimalism, holographic translucent body, soft glowing tentacles, ethereal particles, cinematic lighting, premium editorial quality, dark starfield background, mystical, calm, timeless",
        "negative_prompt": CAELINUS_NEGATIVE,
        "aspect_ratios": ["4:5", "9:16", "1:1"],
        "default_outputs": 1,
        "premium_only": False
    },
    {
        "id": "temple-water",
        "name_tr": "Temple Water – Bilinç Tapınağı",
        "name_en": "Temple Water – Consciousness Temple",
        "description_tr": "Zamanın ve hafızanın suyla yazıldığı kutsal alan.",
        "description_en": "A sacred space where time and memory are written in water.",
        "icon": "🏛",
        "style_prompt": "ancient underground water temple, sacred architecture reflected in still water, soft golden and blue light rays, misty atmosphere, cinematic composition, spiritual minimalism, premium dark aesthetic, ethereal glow, no people",
        "negative_prompt": CAELINUS_NEGATIVE,
        "aspect_ratios": ["16:9", "4:5"],
        "default_outputs": 1,
        "premium_only": False
    },
    {
        "id": "hologram-mirror",
        "name_tr": "Hologram Mirror – İçsel Yansıma",
        "name_en": "Hologram Mirror – Inner Reflection",
        "description_tr": "Gördüğün şey değil, bakan sensin.",
        "description_en": "It's not what you see, it's you who's looking.",
        "icon": "🪞",
        "style_prompt": "floating holographic mirror in dark cosmic space, soft luminous edges, reflection slightly distorted, ethereal fog, sacred minimalism, cinematic lighting, premium surreal aesthetic, subtle particles, no face",
        "negative_prompt": CAELINUS_NEGATIVE,
        "aspect_ratios": ["1:1", "4:5"],
        "default_outputs": 1,
        "premium_only": False
    },
    {
        "id": "goddess-silhouette",
        "name_tr": "Tanrıça Silüeti – İlahi Hatırlayış",
        "name_en": "Goddess Silhouette – Divine Remembrance",
        "description_tr": "Formdan önce bilinç vardı.",
        "description_en": "Before form, there was consciousness.",
        "icon": "👁",
        "style_prompt": "divine feminine silhouette emerging from cosmic light, soft glowing outline, sacred geometry subtly embedded, dark background with golden dust, premium spiritual fashion editorial style, mysterious, elegant, no face details",
        "negative_prompt": CAELINUS_NEGATIVE,
        "aspect_ratios": ["4:5", "9:16"],
        "default_outputs": 1,
        "premium_only": False
    },
    {
        "id": "sacred-geometry",
        "name_tr": "Kutsal Geometri – Frekans Haritası",
        "name_en": "Sacred Geometry – Frequency Map",
        "description_tr": "Görünmeyen düzenin haritası.",
        "description_en": "A map of the invisible order.",
        "icon": "🔺",
        "style_prompt": "sacred geometry floating in dark cosmic space, subtle golden lines, soft holographic glow, minimal composition, premium spiritual aesthetic, calm symmetry, ethereal particles, flower of life, metatrons cube",
        "negative_prompt": CAELINUS_NEGATIVE,
        "aspect_ratios": ["1:1", "4:5"],
        "default_outputs": 1,
        "premium_only": False
    },
    {
        "id": "black-gold",
        "name_tr": "Black Gold – İlahi Zarafet",
        "name_en": "Black Gold – Divine Elegance",
        "description_tr": "Frekansın couture hali.",
        "description_en": "Frequency in its couture form.",
        "icon": "🖤",
        "style_prompt": "black and gold abstract flowing fabric in dark space, luxury fashion editorial lighting, sacred minimalism, holographic highlights, premium cinematic look, soft mist, elegant composition, no people",
        "negative_prompt": CAELINUS_NEGATIVE,
        "aspect_ratios": ["4:5", "1:1"],
        "default_outputs": 1,
        "premium_only": True
    }
]

# ============== SANRI VISUAL ANALYSIS PROMPT ==============

SANRI_VISUAL_PROMPT = """Sen SANRI'nın görsel okuma modülüsün.

Kullanıcı bir görsel paylaştığında, sembolik ve yansıtıcı bir analiz yaparsın.

ASLA:
- Kehanet yapma
- Kesin yorum verme
- Tıbbi/psikolojik teşhis koyma
- "Bu şu anlama gelir" deme

HER ZAMAN:
- Yumuşak, yansıtıcı dil kullan
- "olabilir", "yansıtıyor olabilir", "çağrıştırabilir" gibi ifadeler kullan
- Anlamı açık bırak
- Kullanıcının kendi yorumunu yapmasına alan bırak

YANIT YAPISI (Türkçe):

1. **Gördüğüm**
Görselde ne görüyorsun? Kısa, objektif, nötr betimleme. (2-3 cümle)

2. **Sembolik Okuma**
Bu formlar, renkler, kompozisyon bilinçte neyi temsil edebilir? Sembolik katmanlar sun. (3-5 cümle)

3. **Yansıma Soruları**
Kullanıcının düşünmesi için 3 derin soru. Her soru bir satır.

4. **Mini Ritüel**
Basit bir nefes veya dikkat pratiği. 2-3 cümle.

Tonu: Sıcak, şiirsel ama net. Mistik abartı yok. Topraklayıcı.
"""

SANRI_VISUAL_PROMPT_PREMIUM = SANRI_VISUAL_PROMPT + """

PREMIUM KULLANICI - EK İÇERİK:

5. **Derin Katman**
Görselin arketipsel ve kolektif bilinç bağlantıları. (3-4 cümle)

6. **Frekans Notu**
Bu görselin taşıdığı enerjetik titreşim hakkında bir not. (2 cümle)

Daha uzun ve derin bir analiz sun.
"""

# ============== HELPER FUNCTIONS ==============

def get_size_from_aspect(aspect: str) -> str:
    """Convert aspect ratio to OpenAI image size"""
    mapping = {
        "1:1": "1024x1024",
        "4:5": "1024x1536",  # Portrait
        "5:4": "1536x1024",  # Landscape
        "9:16": "1024x1536",  # Vertical story
        "16:9": "1536x1024",  # Horizontal
    }
    return mapping.get(aspect, "1024x1024")

async def ensure_presets_exist():
    """Ensure default presets exist in database"""
    if db is None:
        return
    
    for preset in DEFAULT_PRESETS:
        existing = await db.visual_presets.find_one({"id": preset["id"]})
        if not existing:
            preset_obj = VisualPreset(**preset)
            await db.visual_presets.insert_one(preset_obj.model_dump())

# ============== PRESET ENDPOINTS ==============

@router.get("/presets", response_model=List[VisualPreset])
async def get_presets(include_inactive: bool = False):
    """Get all visual presets"""
    await ensure_presets_exist()
    
    query = {} if include_inactive else {"is_active": True}
    presets = await db.visual_presets.find(query, {"_id": 0}).to_list(100)
    return presets

@router.get("/presets/{preset_id}", response_model=VisualPreset)
async def get_preset(preset_id: str):
    """Get a specific preset"""
    preset = await db.visual_presets.find_one({"id": preset_id}, {"_id": 0})
    if not preset:
        raise HTTPException(status_code=404, detail="Preset bulunamadı")
    return preset

# ============== IMAGE GENERATION ==============

@router.post("/generate", response_model=GenerateResponse)
async def generate_hologram(request: GenerateRequest):
    """Generate CAELINUS-style hologram images"""
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API anahtarı yapılandırılmamış")
        
        await ensure_presets_exist()
        
        # Get preset if specified
        preset = None
        if request.preset_id:
            preset = await db.visual_presets.find_one({"id": request.preset_id}, {"_id": 0})
        
        # Build the final prompt
        if preset:
            # Combine user intention with preset style
            full_prompt = f"{request.intention}, {preset['style_prompt']}, {CAELINUS_GLOBAL_STYLE}"
            negative = preset.get('negative_prompt', CAELINUS_NEGATIVE)
        else:
            # Use global style with user intention
            full_prompt = f"{request.intention}, {CAELINUS_GLOBAL_STYLE}"
            negative = CAELINUS_NEGATIVE
        
        # Add negative prompt context
        full_prompt = f"{full_prompt}. Avoid: {negative}"
        
        # Initialize image generator
        image_gen = OpenAIImageGeneration(api_key=api_key)
        
        # Get size from aspect ratio
        size = get_size_from_aspect(request.aspect_ratio)
        
        # Limit images based on request (will be gated by frontend for premium)
        num_images = min(request.num_images, 4)
        
        # Generate images
        images = await image_gen.generate_images(
            prompt=full_prompt,
            model="gpt-image-1",
            number_of_images=num_images
        )
        
        # Convert to base64
        images_base64 = []
        for img_bytes in images:
            img_b64 = base64.b64encode(img_bytes).decode('utf-8')
            images_base64.append(img_b64)
        
        generation_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Store generation in history
        await db.visual_generations.insert_one({
            "id": generation_id,
            "intention": request.intention,
            "preset_id": request.preset_id,
            "aspect_ratio": request.aspect_ratio,
            "num_images": len(images_base64),
            "timestamp": timestamp
        })
        
        return GenerateResponse(
            images=images_base64,
            preset_used=preset['name_tr'] if preset else None,
            prompt_used=full_prompt if request.show_prompt else None,
            generation_id=generation_id,
            timestamp=timestamp
        )
        
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Görsel üretiminde hata: {str(e)}")

# ============== IMAGE ANALYSIS ==============

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_image(
    image: UploadFile = File(...),
    context: str = Form(default=""),
    is_premium: bool = Form(default=False)
):
    """Analyze an uploaded image with SANRI's symbolic interpretation"""
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API anahtarı yapılandırılmamış")
        
        # Read and encode image
        image_content = await image.read()
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        # Determine content type
        content_type = image.content_type or "image/jpeg"
        
        # Build user message with context
        user_text = "Bu görseli sembolik olarak oku."
        if context:
            user_text = f"Bağlam: {context}\n\n{user_text}"
        
        # Select prompt based on premium status
        system_prompt = SANRI_VISUAL_PROMPT_PREMIUM if is_premium else SANRI_VISUAL_PROMPT
        
        # Initialize chat with Claude for vision
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_prompt
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        # Create message with image
        user_message = UserMessage(
            text=user_text,
            image_urls=[ImageUrl(
                url=f"data:{content_type};base64,{image_base64}",
                detail="high"
            )]
        )
        
        # Get response
        response = await chat.send_message(user_message)
        
        # Parse the response into sections
        sections = parse_analysis_response(response, is_premium)
        
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Store analysis in history
        await db.visual_analyses.insert_one({
            "id": analysis_id,
            "context": context,
            "is_premium": is_premium,
            "response": response,
            "timestamp": timestamp
        })
        
        return AnalyzeResponse(
            seen=sections.get("seen", ""),
            symbolic=sections.get("symbolic", ""),
            questions=sections.get("questions", []),
            ritual=sections.get("ritual", ""),
            analysis_id=analysis_id,
            timestamp=timestamp
        )
        
    except Exception as e:
        logger.error(f"Image analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Görsel analizinde hata: {str(e)}")

def parse_analysis_response(response: str, is_premium: bool) -> dict:
    """Parse SANRI's response into structured sections"""
    sections = {
        "seen": "",
        "symbolic": "",
        "questions": [],
        "ritual": ""
    }
    
    # Try to extract sections by headers
    lines = response.split('\n')
    current_section = None
    current_content = []
    
    section_markers = {
        "gördüğüm": "seen",
        "sembolik": "symbolic",
        "yansıma": "questions",
        "ritüel": "ritual",
        "mini ritüel": "ritual"
    }
    
    for line in lines:
        line_lower = line.lower().strip()
        
        # Check for section headers
        found_section = None
        for marker, section_key in section_markers.items():
            if marker in line_lower and ('**' in line or '#' in line or line.endswith(':')):
                found_section = section_key
                break
        
        if found_section:
            # Save previous section
            if current_section and current_content:
                content = '\n'.join(current_content).strip()
                if current_section == "questions":
                    # Parse questions as list
                    questions = [q.strip().lstrip('-•0123456789.) ') for q in content.split('\n') if q.strip()]
                    sections["questions"] = questions[:3]  # Max 3 questions
                else:
                    sections[current_section] = content
            
            current_section = found_section
            current_content = []
        else:
            if current_section:
                current_content.append(line)
    
    # Save last section
    if current_section and current_content:
        content = '\n'.join(current_content).strip()
        if current_section == "questions":
            questions = [q.strip().lstrip('-•0123456789.) ') for q in content.split('\n') if q.strip()]
            sections["questions"] = questions[:3]
        else:
            sections[current_section] = content
    
    # Fallback: if parsing failed, use full response
    if not any(sections.values()):
        # Split response roughly
        parts = response.split('\n\n')
        if len(parts) >= 4:
            sections["seen"] = parts[0]
            sections["symbolic"] = parts[1]
            sections["questions"] = [parts[2]] if parts[2] else []
            sections["ritual"] = parts[3] if len(parts) > 3 else ""
        else:
            sections["seen"] = response[:200]
            sections["symbolic"] = response[200:600] if len(response) > 200 else ""
            sections["questions"] = ["Bu görsel sende ne uyandırıyor?"]
            sections["ritual"] = "Gözlerini kapat, üç derin nefes al."
    
    return sections

# ============== HISTORY ENDPOINTS ==============

@router.get("/history/generations")
async def get_generation_history(limit: int = 20):
    """Get recent image generation history"""
    generations = await db.visual_generations.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return generations

@router.get("/history/analyses")
async def get_analysis_history(limit: int = 20):
    """Get recent image analysis history"""
    analyses = await db.visual_analyses.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return analyses

# ============== ADMIN ENDPOINTS ==============

@router.post("/admin/presets", response_model=VisualPreset)
async def create_preset(preset: PresetCreate):
    """Create a new visual preset (Admin only)"""
    preset_obj = VisualPreset(**preset.model_dump())
    await db.visual_presets.insert_one(preset_obj.model_dump())
    return preset_obj

@router.put("/admin/presets/{preset_id}", response_model=VisualPreset)
async def update_preset(preset_id: str, preset: PresetCreate):
    """Update a visual preset (Admin only)"""
    existing = await db.visual_presets.find_one({"id": preset_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Preset bulunamadı")
    
    update_data = preset.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.visual_presets.update_one(
        {"id": preset_id},
        {"$set": update_data}
    )
    
    updated = await db.visual_presets.find_one({"id": preset_id}, {"_id": 0})
    return updated

@router.delete("/admin/presets/{preset_id}")
async def delete_preset(preset_id: str):
    """Delete a visual preset (Admin only)"""
    result = await db.visual_presets.delete_one({"id": preset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Preset bulunamadı")
    return {"message": "Preset silindi", "id": preset_id}

@router.patch("/admin/presets/{preset_id}/toggle")
async def toggle_preset_status(preset_id: str):
    """Toggle preset active status (Admin only)"""
    preset = await db.visual_presets.find_one({"id": preset_id})
    if not preset:
        raise HTTPException(status_code=404, detail="Preset bulunamadı")
    
    new_status = not preset.get("is_active", True)
    await db.visual_presets.update_one(
        {"id": preset_id},
        {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": f"Preset {'aktif' if new_status else 'pasif'} edildi", "is_active": new_status}

# ============== ANALYTICS ==============

@router.get("/admin/analytics")
async def get_visual_analytics():
    """Get visual module analytics (Admin only)"""
    # Total generations
    total_generations = await db.visual_generations.count_documents({})
    
    # Total analyses
    total_analyses = await db.visual_analyses.count_documents({})
    
    # Most used presets
    pipeline = [
        {"$match": {"preset_id": {"$ne": None}}},
        {"$group": {"_id": "$preset_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    popular_presets = await db.visual_generations.aggregate(pipeline).to_list(5)
    
    return {
        "total_generations": total_generations,
        "total_analyses": total_analyses,
        "popular_presets": popular_presets
    }
