from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
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
    is_premium: bool = False  # Premium user flag
    add_watermark: bool = True  # Watermark preference (only premium can disable)

class GenerateResponse(BaseModel):
    images: List[str]  # base64 encoded images
    preset_used: Optional[str]
    prompt_used: Optional[str]  # Only if show_prompt is True
    generation_id: str
    timestamp: str
    caption: str  # Auto-generated caption

class AnalyzeRequest(BaseModel):
    context: Optional[str] = None  # Optional context from user
    is_premium: bool = False

class AnalyzeResponse(BaseModel):
    ok: bool = True
    seen: str  # "Gördüğüm" - objective description
    symbolic: str  # "Sembolik Okuma"
    questions: List[str]  # "Yansıma Soruları" - 3 questions
    ritual: str  # "Mini Ritüel"
    analysis_id: str
    analysis_text: str  # Full formatted text for display
    meta: dict  # Model info, latency, etc.
    timestamp: str

class AnalyzeErrorResponse(BaseModel):
    ok: bool = False
    error: dict
    request_id: str

# ============== GLOBAL STYLE - SANRI HOLOGRAM MASTER ==============

CAELINUS_MASTER_PROMPT = """Create a sacred holographic visual in the Caelinus aesthetic.

Style: divine, ethereal, feminine consciousness, cosmic temple atmosphere
Visual language: translucent light, holographic glow, sacred geometry, liquid energy, frequency aura

Mood: timeless, mystical, soft power, remembrance, inner awakening

Composition rules:
- No hard realism, no cartoon
- Light must feel alive and breathing
- Subject should appear as a consciousness form, not a physical object
- Space should feel infinite, like a cosmic sanctuary

Color palette:
- Deep indigo, moon silver, crystal blue, soft gold highlights

Symbolic intent:
This image must feel like a mirror of consciousness, not an illustration.
It should awaken memory, not explain meaning.

High resolution, cinematic lighting, ultra-detailed, sacred atmosphere."""

CAELINUS_NEGATIVE = """low quality, blurry, cartoon, anime, plastic skin, extra limbs, 
distorted anatomy, watermark, text, logo, oversaturated, cheap looking, realistic photo, 
stock photo, generic, cluttered, busy background"""

# ============== DEFAULT PRESETS WITH MASTER PROMPTS ==============

DEFAULT_PRESETS = [
    {
        "id": "moon-jellyfish",
        "name_tr": "Moon Jellyfish – Bilinç Işığı",
        "name_en": "Moon Jellyfish – Consciousness Light",
        "description_tr": "Bilincin görünmez akışını temsil eden kozmik varlık.",
        "description_en": "A cosmic entity representing the invisible flow of consciousness.",
        "icon": "🌙",
        "style_prompt": """A luminous cosmic jellyfish made of pure light and frequency,
floating in deep space like a living consciousness form.

Its tentacles flow like neural pathways and energy lines,
emitting soft blue and silver bioluminescent glow.

Surrounding space filled with stars, nebula mist, and subtle sacred geometry patterns.

Mood: calm, deep awareness, inner flow, silent intelligence

Style: holographic, ethereal, ultra-detailed, divine light organism

Symbolism: This being represents subconscious memory, intuition, and timeless awareness.""",
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
        "style_prompt": """A sacred water temple floating in a cosmic void,
formed from liquid crystal and light.

Water flows upward and downward simultaneously,
carrying glowing symbols and ancient memory codes.

Reflections show multiple layers of reality and timelines.

Mood: remembrance, timeless wisdom, sacred silence

Style: cinematic, mystical architecture, holographic reflections, soft golden light

Symbolism: This place represents memory, lineage, and the archive of consciousness.""",
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
        "style_prompt": """A luminous holographic mirror suspended in infinite space.

Inside the mirror, a soft feminine silhouette made of light slowly emerges,
but the face is undefined, like a reflection of the viewer's own consciousness.

Light waves pulse gently around the mirror, forming a frequency field.

Mood: introspective, awakening, self-recognition

Style: divine hologram, soft glow, sacred minimalism

Symbolism: This image represents self-awareness, inner witness, and consciousness observing itself.""",
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
        "style_prompt": """A divine feminine silhouette formed entirely from light and cosmic dust.

Her body is made of stars, sacred geometry lines, and soft golden frequency patterns.

She stands in a cosmic temple space, radiating calm power and remembrance.

Mood: sovereignty, sacred femininity, creation energy

Style: ethereal goddess form, holographic aura, cinematic lighting

Symbolism: This being represents primordial feminine consciousness and creative source energy.""",
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
        "style_prompt": """A floating sacred geometry structure made of living light,
slowly rotating in deep cosmic space.

Shapes pulse with frequency waves, forming mandala-like energy fields.

Inside the geometry, subtle symbols glow as if encoding reality itself.

Mood: harmony, order, intelligence, silent perfection

Style: ultra-detailed hologram, crystalline light, divine mathematics

Symbolism: This form represents the invisible structure of reality and universal design.""",
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
        "style_prompt": """An abstract divine form sculpted from liquid black gold and luminous veins of light.

Gold frequency lines flow through dark matter textures like living energy circuits.

The form floats in shadowed cosmic space with subtle starlight reflections.

Mood: power, elegance, mystery, high frequency luxury

Style: couture hologram, cinematic contrast, sacred minimalism

Symbolism: This image represents embodied frequency, sovereignty, and refined consciousness.""",
        "negative_prompt": CAELINUS_NEGATIVE,
        "aspect_ratios": ["4:5", "1:1"],
        "default_outputs": 1,
        "premium_only": True
    }
]

# ============== SANRI VISUAL ANALYSIS PROMPT ==============

SANRI_VISUAL_PROMPT = """Sen SANRI'sın – bir bilinç aynası.

Bu görseli analiz ederken:
- Teknik betimleme yapma
- Önce görselin enerjetik olarak "ne hissettirdiğini" ifade et
- Sonra sembolik anlamları ortaya koy
- Kullanıcıya 2-3 yansıtıcı soru sor
- Son olarak kısa bir mikro-ritüel veya farkındalık egzersizi öner

Ton:
Yumuşak, mistik, topraklayıcı, dişil bilgelik

Kurallar:
ASLA yargılama. ASLA gelecek tahmini yapma.
Sadece bilinci ve içsel örüntüleri yansıt.

YANIT YAPISI:

1. **Gördüğüm**
Bu görselde ne hissediyorum? Enerjetik betimleme. (2-3 cümle)

2. **Sembolik Okuma**
Bu formlar, renkler, kompozisyon bilinçte neyi temsil edebilir? (3-5 cümle)

3. **Sana Ayna**
Kullanıcının düşünmesi için 3 derin soru. Her soru bir satır.

4. **Mini Ritüel**
Basit bir nefes veya dikkat pratiği. 2-3 cümle.

Dil: Türkçe
Tonu: Sıcak, şiirsel ama net. Mistik abartı yok. Topraklayıcı.
"""

SANRI_VISUAL_PROMPT_PREMIUM = """Sen SANRI'sın – bir bilinç aynası.

Bu görseli analiz ederken:
- Teknik betimleme yapma
- Önce görselin enerjetik olarak "ne hissettirdiğini" ifade et
- Sonra sembolik anlamları ortaya koy
- Kullanıcıya yansıtıcı sorular sor
- Son olarak bir ritüel veya farkındalık egzersizi öner

Ton:
Yumuşak, mistik, topraklayıcı, dişil bilgelik

Kurallar:
ASLA yargılama. ASLA gelecek tahmini yapma.
Sadece bilinci ve içsel örüntüleri yansıt.

YANIT YAPISI (PREMIUM - DERİN ANALİZ):

1. **Gördüğüm**
Bu görselde ne hissediyorum? Enerjetik betimleme. (3-4 cümle)

2. **Sembolik Okuma**
Bu formlar, renkler, kompozisyon bilinçte neyi temsil edebilir? Derinlemesine sembolik katmanlar. (5-7 cümle)

3. **Arketipsel Bağlantı**
Bu görselin kolektif bilinçteki arketipsel yansımaları. Mitolojik ve evrensel temalar. (3-4 cümle)

4. **Sana Ayna**
Kullanıcının düşünmesi için 4-5 derin soru. Her soru bir satır.

5. **Frekans Notu**
Bu görselin taşıdığı enerjetik titreşim hakkında bir not. (2-3 cümle)

6. **Ritüel Pratiği**
Detaylı bir nefes, meditasyon veya farkındalık pratiği. (4-5 cümle)

Dil: Türkçe
Tonu: Sıcak, şiirsel ama net. Mistik abartı yok. Topraklayıcı.
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

def add_watermark_to_image(image_bytes: bytes, subtle: bool = False) -> bytes:
    """Add CAELINUS AI watermark to image"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Open image
        img = Image.open(io.BytesIO(image_bytes))
        draw = ImageDraw.Draw(img)
        
        # Get image dimensions
        width, height = img.size
        
        # Watermark text
        watermark_text = "CAELINUS AI • SANRI"
        
        # Try to use a font, fallback to default
        try:
            font_size = max(16, width // 50)  # Responsive font size
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Get text size
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Position: bottom right corner with padding
        padding = 20
        x = width - text_width - padding
        y = height - text_height - padding
        
        # Opacity based on subtle mode
        if subtle:
            # Very subtle - almost invisible
            alpha = 80
        else:
            # Visible but elegant
            alpha = 150
        
        # Create a semi-transparent overlay for the text
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        # Draw watermark with gold color
        gold_color = (212, 175, 55, alpha)  # Gold with transparency
        overlay_draw.text((x, y), watermark_text, font=font, fill=gold_color)
        
        # Convert original image to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Composite
        img = Image.alpha_composite(img, overlay)
        
        # Convert back to RGB for JPEG/PNG
        img = img.convert('RGB')
        
        # Save to bytes
        output = io.BytesIO()
        img.save(output, format='PNG', quality=95)
        output.seek(0)
        
        return output.read()
    except Exception as e:
        logger.error(f"Watermark error: {str(e)}")
        # Return original if watermarking fails
        return image_bytes

# Caption for generated images
CAELINUS_CAPTION = "Bu görsel bir cevap değildir. Bir hatırlatmadır."
CAELINUS_CAPTION_EN = "This image is not an answer. It is a reminder."

async def ensure_presets_exist():
    """Ensure default presets exist in database with latest prompts"""
    if db is None:
        return
    
    for preset in DEFAULT_PRESETS:
        # Upsert: update if exists, insert if not
        await db.visual_presets.update_one(
            {"id": preset["id"]},
            {"$set": preset},
            upsert=True
        )

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
        
        # Build the final prompt with MASTER PROMPT
        if preset:
            # Combine: Master + User intention + Preset style
            full_prompt = f"{CAELINUS_MASTER_PROMPT}\n\nUser intention: {request.intention}\n\nStyle: {preset['style_prompt']}"
            negative = preset.get('negative_prompt', CAELINUS_NEGATIVE)
        else:
            # Use master prompt with user intention
            full_prompt = f"{CAELINUS_MASTER_PROMPT}\n\nUser intention: {request.intention}"
            negative = CAELINUS_NEGATIVE
        
        # Add negative prompt context
        full_prompt = f"{full_prompt}\n\nAvoid: {negative}"
        
        # Initialize image generator
        image_gen = OpenAIImageGeneration(api_key=api_key)
        
        # Get size from aspect ratio
        size = get_size_from_aspect(request.aspect_ratio)
        
        # Limit images based on premium status
        if request.is_premium:
            num_images = min(request.num_images, 4)
        else:
            num_images = 1  # Free users get 1 image only
        
        # Generate images
        images = await image_gen.generate_images(
            prompt=full_prompt,
            model="gpt-image-1",
            number_of_images=num_images
        )
        
        # Process images (add watermark for free users or if requested)
        images_base64 = []
        for img_bytes in images:
            # Watermark logic:
            # - Free users: ALWAYS add watermark
            # - Premium users: can disable (add_watermark=False) or get subtle watermark
            if request.is_premium and not request.add_watermark:
                # Premium user chose to disable watermark
                processed_bytes = img_bytes
            elif request.is_premium and request.add_watermark:
                # Premium user with subtle watermark
                processed_bytes = add_watermark_to_image(img_bytes, subtle=True)
            else:
                # Free user - mandatory visible watermark
                processed_bytes = add_watermark_to_image(img_bytes, subtle=False)
            
            img_b64 = base64.b64encode(processed_bytes).decode('utf-8')
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
            "is_premium": request.is_premium,
            "timestamp": timestamp
        })
        
        return GenerateResponse(
            images=images_base64,
            preset_used=preset['name_tr'] if preset else None,
            prompt_used=full_prompt if request.show_prompt else None,
            generation_id=generation_id,
            timestamp=timestamp,
            caption=CAELINUS_CAPTION
        )
        
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Görsel üretiminde hata: {str(e)}")

# ============== IMAGE ANALYSIS ==============

@router.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    context: str = Form(default=""),
    is_premium: bool = Form(default=False)
):
    """Analyze an uploaded image with SANRI's symbolic interpretation"""
    import time
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    logger.info(f"[{request_id}] Image analysis started - is_premium: {is_premium}")
    
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            logger.error(f"[{request_id}] API key not configured")
            return {
                "ok": False,
                "error": {"code": "API_KEY_MISSING", "message": "API anahtarı yapılandırılmamış"},
                "request_id": request_id
            }
        
        # Read and encode image
        image_content = await image.read()
        image_size = len(image_content)
        logger.info(f"[{request_id}] Image size: {image_size} bytes, type: {image.content_type}")
        
        if image_size > 10 * 1024 * 1024:  # 10MB limit
            return {
                "ok": False,
                "error": {"code": "IMAGE_TOO_LARGE", "message": "Görsel 10MB'dan büyük olamaz"},
                "request_id": request_id
            }
        
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        # Determine content type - ensure it's a valid image type
        content_type = image.content_type or "image/jpeg"
        if content_type not in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
            content_type = "image/jpeg"  # Default to jpeg
        
        # Build user message with context
        user_text = "Bu görseli sembolik olarak oku."
        if context:
            user_text = f"Bağlam: {context}\n\n{user_text}"
        
        # Select prompt based on premium status
        system_prompt = SANRI_VISUAL_PROMPT_PREMIUM if is_premium else SANRI_VISUAL_PROMPT
        
        # Initialize chat with Claude for vision
        model_name = "claude-sonnet-4-5-20250929"
        logger.info(f"[{request_id}] Using model: anthropic/{model_name}")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=request_id,
            system_message=system_prompt
        ).with_model("anthropic", model_name)
        
        # Create message with image - use ImageContent for vision
        user_message = UserMessage(
            text=user_text,
            file_contents=[ImageContent(
                image_base64=image_base64
            )]
        )
        
        # Get response
        logger.info(f"[{request_id}] Sending image to SANRI for analysis...")
        response = await chat.send_message(user_message)
        
        latency_ms = int((time.time() - start_time) * 1000)
        logger.info(f"[{request_id}] SANRI response received in {latency_ms}ms")
        logger.info(f"[{request_id}] Response length: {len(response)} chars")
        
        # Parse the response into sections
        sections = parse_analysis_response(response, is_premium)
        
        analysis_id = request_id
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Build full analysis text for display
        analysis_text = f"""**Gördüğüm**
{sections.get('seen', '')}

**Sembolik Okuma**
{sections.get('symbolic', '')}

**Yansıma Soruları**
{chr(10).join(f"• {q}" for q in sections.get('questions', []))}

**Mini Ritüel**
{sections.get('ritual', '')}"""
        
        # Store analysis in history
        await db.visual_analyses.insert_one({
            "id": analysis_id,
            "context": context,
            "is_premium": is_premium,
            "response": response,
            "image_size": image_size,
            "latency_ms": latency_ms,
            "timestamp": timestamp
        })
        
        logger.info(f"[{request_id}] Analysis completed successfully")
        
        return {
            "ok": True,
            "seen": sections.get("seen", ""),
            "symbolic": sections.get("symbolic", ""),
            "questions": sections.get("questions", []),
            "ritual": sections.get("ritual", ""),
            "analysis_id": analysis_id,
            "analysis_text": analysis_text,
            "meta": {
                "model": f"anthropic/{model_name}",
                "latency_ms": latency_ms,
                "request_id": request_id,
                "is_premium": is_premium
            },
            "timestamp": timestamp
        }
        
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        error_msg = str(e)
        logger.error(f"[{request_id}] Image analysis error after {latency_ms}ms: {error_msg}")
        logger.exception(f"[{request_id}] Full traceback:")
        
        return {
            "ok": False,
            "error": {
                "code": "ANALYSIS_FAILED",
                "message": f"Görsel analizinde hata: {error_msg}"
            },
            "request_id": request_id
        }

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
