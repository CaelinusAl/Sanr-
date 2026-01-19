# Admin Panel Routes for Caelinus
# Temple System: Content, Engine, Collective

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import os
import re
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

# MongoDB connection (imported from server.py)
from server import db

# Collections
rituals_collection = db.rituals
chapters_collection = db.chapters
bilinc_cards_collection = db.bilinc_cards
frekans_cards_collection = db.frekans_cards
sanri_prompts_collection = db.sanri_prompts
audit_logs_collection = db.audit_logs
admin_settings_collection = db.admin_settings

# Simple Auth (for now - single admin user)
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "caelinus2026")

def verify_admin(x_admin_token: str = Header(None)):
    """Simple admin verification"""
    if x_admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Yetkisiz erişim")
    return True

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[ğ]', 'g', slug)
    slug = re.sub(r'[ü]', 'u', slug)
    slug = re.sub(r'[ş]', 's', slug)
    slug = re.sub(r'[ı]', 'i', slug)
    slug = re.sub(r'[ö]', 'o', slug)
    slug = re.sub(r'[ç]', 'c', slug)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

def log_audit(user: str, action: str, entity_type: str, entity_id: str, entity_name: str, changes: dict = None):
    """Log admin action to audit log"""
    audit_logs_collection.insert_one({
        "timestamp": datetime.now(timezone.utc),
        "user": user,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "entity_name": entity_name,
        "changes": changes
    })

# === AUTH ===

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    message: str

@router.post("/login", response_model=LoginResponse)
async def admin_login(request: LoginRequest):
    """Admin login"""
    if request.password == ADMIN_PASSWORD:
        return LoginResponse(
            success=True,
            token=ADMIN_PASSWORD,
            message="Giriş başarılı"
        )
    raise HTTPException(status_code=401, detail="Şifre hatalı")

@router.get("/verify")
async def verify_token(authorized: bool = Depends(verify_admin)):
    """Verify admin token"""
    return {"valid": True, "role": "owner"}

# === DASHBOARD ===

@router.get("/dashboard/stats")
async def get_dashboard_stats(authorized: bool = Depends(verify_admin)):
    """Get dashboard statistics"""
    # Count rituals
    total_rituals = rituals_collection.count_documents({})
    published_rituals = rituals_collection.count_documents({"status": "published"})
    
    # Count chapters
    total_chapters = chapters_collection.count_documents({})
    published_chapters = chapters_collection.count_documents({"status": "published"})
    
    # Count cards
    total_bilinc = bilinc_cards_collection.count_documents({})
    total_frekans = frekans_cards_collection.count_documents({})
    
    # Count prompts
    total_prompts = sanri_prompts_collection.count_documents({})
    active_prompts = sanri_prompts_collection.count_documents({"is_active": True})
    
    # Recent audit logs
    recent_logs = list(audit_logs_collection.find().sort("timestamp", -1).limit(10))
    for log in recent_logs:
        log["_id"] = str(log["_id"])
        if log.get("timestamp"):
            log["timestamp"] = log["timestamp"].isoformat()
    
    return {
        "content": {
            "rituals": {"total": total_rituals, "published": published_rituals},
            "chapters": {"total": total_chapters, "published": published_chapters},
            "bilinc_cards": {"total": total_bilinc},
            "frekans_cards": {"total": total_frekans}
        },
        "engine": {
            "prompts": {"total": total_prompts, "active": active_prompts}
        },
        "recent_activity": recent_logs,
        "system_status": {
            "tts": "active",
            "sanri": "active",
            "database": "active"
        }
    }

# === RITUALS CRUD ===

class RitualStepInput(BaseModel):
    order: int
    phase: str
    text: str
    duration: int = 6
    breath_count: Optional[int] = None
    tts_script: Optional[str] = None

class RitualInput(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    ritual_type: str = "custom"
    duration_minutes: int = 8
    difficulty: str = "orta"
    intention: Optional[str] = None
    steps: List[RitualStepInput] = []
    opening_text: Optional[str] = None
    closing_text: Optional[str] = None
    tts_enabled: bool = True
    background_audio: Optional[str] = None
    tags: List[str] = []
    status: str = "draft"
    visibility: str = "free"

@router.get("/rituals")
async def list_rituals(
    status: Optional[str] = None,
    authorized: bool = Depends(verify_admin)
):
    """List all rituals"""
    query = {}
    if status:
        query["status"] = status
    
    rituals = list(rituals_collection.find(query).sort("created_at", -1))
    
    for ritual in rituals:
        ritual["id"] = str(ritual["_id"])
        del ritual["_id"]
        if ritual.get("created_at"):
            ritual["created_at"] = ritual["created_at"].isoformat()
        if ritual.get("updated_at"):
            ritual["updated_at"] = ritual["updated_at"].isoformat()
    
    return {"rituals": rituals, "total": len(rituals)}

@router.get("/rituals/{ritual_id}")
async def get_ritual(ritual_id: str, authorized: bool = Depends(verify_admin)):
    """Get single ritual"""
    try:
        ritual = rituals_collection.find_one({"_id": ObjectId(ritual_id)})
    except:
        ritual = rituals_collection.find_one({"slug": ritual_id})
    
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    
    ritual["id"] = str(ritual["_id"])
    del ritual["_id"]
    if ritual.get("created_at"):
        ritual["created_at"] = ritual["created_at"].isoformat()
    if ritual.get("updated_at"):
        ritual["updated_at"] = ritual["updated_at"].isoformat()
    
    return ritual

@router.post("/rituals")
async def create_ritual(ritual: RitualInput, authorized: bool = Depends(verify_admin)):
    """Create new ritual"""
    now = datetime.now(timezone.utc)
    slug = generate_slug(ritual.title)
    
    # Check unique slug
    existing = rituals_collection.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{int(now.timestamp())}"
    
    ritual_doc = {
        **ritual.dict(),
        "slug": slug,
        "version": 1,
        "created_at": now,
        "updated_at": now,
        "created_by": "owner"
    }
    
    result = rituals_collection.insert_one(ritual_doc)
    ritual_id = str(result.inserted_id)
    
    log_audit("owner", "create", "ritual", ritual_id, ritual.title)
    
    return {
        "success": True,
        "id": ritual_id,
        "slug": slug,
        "message": "Ritüel oluşturuldu"
    }

@router.put("/rituals/{ritual_id}")
async def update_ritual(ritual_id: str, ritual: RitualInput, authorized: bool = Depends(verify_admin)):
    """Update ritual"""
    try:
        existing = rituals_collection.find_one({"_id": ObjectId(ritual_id)})
    except:
        existing = rituals_collection.find_one({"slug": ritual_id})
    
    if not existing:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    
    update_data = {
        **ritual.dict(),
        "updated_at": datetime.now(timezone.utc),
        "version": existing.get("version", 1) + 1
    }
    
    rituals_collection.update_one(
        {"_id": existing["_id"]},
        {"$set": update_data}
    )
    
    log_audit("owner", "update", "ritual", str(existing["_id"]), ritual.title)
    
    return {"success": True, "message": "Ritüel güncellendi"}

@router.post("/rituals/{ritual_id}/publish")
async def publish_ritual(ritual_id: str, authorized: bool = Depends(verify_admin)):
    """Publish ritual (make it available on frontend)"""
    try:
        existing = rituals_collection.find_one({"_id": ObjectId(ritual_id)})
    except:
        existing = rituals_collection.find_one({"slug": ritual_id})
    
    if not existing:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    
    rituals_collection.update_one(
        {"_id": existing["_id"]},
        {"$set": {
            "status": "published",
            "published_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    log_audit("owner", "publish", "ritual", str(existing["_id"]), existing.get("title", ""))
    
    return {"success": True, "message": "Ritüel yayınlandı"}

@router.delete("/rituals/{ritual_id}")
async def delete_ritual(ritual_id: str, authorized: bool = Depends(verify_admin)):
    """Delete ritual"""
    try:
        existing = rituals_collection.find_one({"_id": ObjectId(ritual_id)})
    except:
        existing = rituals_collection.find_one({"slug": ritual_id})
    
    if not existing:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    
    rituals_collection.delete_one({"_id": existing["_id"]})
    
    log_audit("owner", "delete", "ritual", str(existing["_id"]), existing.get("title", ""))
    
    return {"success": True, "message": "Ritüel silindi"}

# === CHAPTERS CRUD ===

class ChapterInput(BaseModel):
    chapter_number: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    content: str
    bilinc_note: Optional[str] = None
    tts_script: Optional[str] = None
    cover_image: Optional[str] = None
    tags: List[str] = []
    status: str = "draft"
    visibility: str = "premium"

@router.get("/chapters")
async def list_chapters(authorized: bool = Depends(verify_admin)):
    """List all chapters"""
    chapters = list(chapters_collection.find().sort("chapter_number", 1))
    
    for chapter in chapters:
        chapter["id"] = str(chapter["_id"])
        del chapter["_id"]
        if chapter.get("created_at"):
            chapter["created_at"] = chapter["created_at"].isoformat()
    
    return {"chapters": chapters, "total": len(chapters)}

@router.post("/chapters")
async def create_chapter(chapter: ChapterInput, authorized: bool = Depends(verify_admin)):
    """Create new chapter"""
    now = datetime.now(timezone.utc)
    slug = generate_slug(f"{chapter.chapter_number}-{chapter.title}")
    
    chapter_doc = {
        **chapter.dict(),
        "slug": slug,
        "version": 1,
        "created_at": now,
        "updated_at": now,
        "created_by": "owner"
    }
    
    result = chapters_collection.insert_one(chapter_doc)
    
    log_audit("owner", "create", "chapter", str(result.inserted_id), chapter.title)
    
    return {"success": True, "id": str(result.inserted_id), "slug": slug}

@router.put("/chapters/{chapter_id}")
async def update_chapter(chapter_id: str, chapter: ChapterInput, authorized: bool = Depends(verify_admin)):
    """Update chapter"""
    try:
        existing = chapters_collection.find_one({"_id": ObjectId(chapter_id)})
    except:
        raise HTTPException(status_code=404, detail="Bölüm bulunamadı")
    
    if not existing:
        raise HTTPException(status_code=404, detail="Bölüm bulunamadı")
    
    chapters_collection.update_one(
        {"_id": existing["_id"]},
        {"$set": {
            **chapter.dict(),
            "updated_at": datetime.now(timezone.utc),
            "version": existing.get("version", 1) + 1
        }}
    )
    
    log_audit("owner", "update", "chapter", chapter_id, chapter.title)
    
    return {"success": True, "message": "Bölüm güncellendi"}

@router.post("/chapters/{chapter_id}/publish")
async def publish_chapter(chapter_id: str, authorized: bool = Depends(verify_admin)):
    """Publish chapter"""
    try:
        existing = chapters_collection.find_one({"_id": ObjectId(chapter_id)})
    except:
        raise HTTPException(status_code=404, detail="Bölüm bulunamadı")
    
    if not existing:
        raise HTTPException(status_code=404, detail="Bölüm bulunamadı")
    
    chapters_collection.update_one(
        {"_id": existing["_id"]},
        {"$set": {
            "status": "published",
            "published_at": datetime.now(timezone.utc)
        }}
    )
    
    log_audit("owner", "publish", "chapter", chapter_id, existing.get("title", ""))
    
    return {"success": True, "message": "Bölüm yayınlandı"}

# === BILINC CARDS CRUD ===

class BilincCardInput(BaseModel):
    title: str
    micro_text: str
    reflection_question: Optional[str] = None
    reading_duration: int = 30
    series: str = "default"
    order_in_series: int = 1
    tags: List[str] = []
    status: str = "draft"
    visibility: str = "free"

@router.get("/bilinc-cards")
async def list_bilinc_cards(authorized: bool = Depends(verify_admin)):
    """List all bilinc cards"""
    cards = list(bilinc_cards_collection.find().sort("series", 1))
    
    for card in cards:
        card["id"] = str(card["_id"])
        del card["_id"]
    
    return {"cards": cards, "total": len(cards)}

@router.post("/bilinc-cards")
async def create_bilinc_card(card: BilincCardInput, authorized: bool = Depends(verify_admin)):
    """Create bilinc card"""
    now = datetime.now(timezone.utc)
    slug = generate_slug(card.title)
    
    card_doc = {
        **card.dict(),
        "slug": slug,
        "created_at": now,
        "updated_at": now
    }
    
    result = bilinc_cards_collection.insert_one(card_doc)
    
    log_audit("owner", "create", "bilinc_card", str(result.inserted_id), card.title)
    
    return {"success": True, "id": str(result.inserted_id)}

# === FREKANS CARDS CRUD ===

class FrekansCardInput(BaseModel):
    frequency_name: str
    title: str
    description: str
    when_to_use: Optional[str] = None
    caution: Optional[str] = None
    tempo: str = "yavaş"
    softness: str = "yumuşak"
    tags: List[str] = []
    status: str = "draft"
    visibility: str = "free"

@router.get("/frekans-cards")
async def list_frekans_cards(authorized: bool = Depends(verify_admin)):
    """List all frekans cards"""
    cards = list(frekans_cards_collection.find().sort("frequency_name", 1))
    
    for card in cards:
        card["id"] = str(card["_id"])
        del card["_id"]
    
    return {"cards": cards, "total": len(cards)}

@router.post("/frekans-cards")
async def create_frekans_card(card: FrekansCardInput, authorized: bool = Depends(verify_admin)):
    """Create frekans card"""
    now = datetime.now(timezone.utc)
    slug = generate_slug(f"frekans-{card.frequency_name}")
    
    card_doc = {
        **card.dict(),
        "slug": slug,
        "created_at": now,
        "updated_at": now
    }
    
    result = frekans_cards_collection.insert_one(card_doc)
    
    log_audit("owner", "create", "frekans_card", str(result.inserted_id), card.title)
    
    return {"success": True, "id": str(result.inserted_id)}

# === SANRI PROMPTS ===

class SanriPromptInput(BaseModel):
    name: str
    display_name: str
    system_prompt: str
    style_prompt: Optional[str] = None
    safety_prompt: Optional[str] = None
    response_format: Optional[str] = None
    is_active: bool = True
    is_production: bool = False

@router.get("/sanri-prompts")
async def list_sanri_prompts(authorized: bool = Depends(verify_admin)):
    """List all SANRI prompts"""
    prompts = list(sanri_prompts_collection.find().sort("name", 1))
    
    for prompt in prompts:
        prompt["id"] = str(prompt["_id"])
        del prompt["_id"]
        if prompt.get("created_at"):
            prompt["created_at"] = prompt["created_at"].isoformat()
    
    return {"prompts": prompts, "total": len(prompts)}

@router.post("/sanri-prompts")
async def create_sanri_prompt(prompt: SanriPromptInput, authorized: bool = Depends(verify_admin)):
    """Create SANRI prompt"""
    now = datetime.now(timezone.utc)
    
    prompt_doc = {
        **prompt.dict(),
        "version": 1,
        "created_at": now,
        "updated_at": now
    }
    
    result = sanri_prompts_collection.insert_one(prompt_doc)
    
    log_audit("owner", "create", "sanri_prompt", str(result.inserted_id), prompt.name)
    
    return {"success": True, "id": str(result.inserted_id)}

@router.post("/sanri-prompts/{prompt_id}/deploy")
async def deploy_sanri_prompt(prompt_id: str, authorized: bool = Depends(verify_admin)):
    """Deploy prompt to production"""
    try:
        existing = sanri_prompts_collection.find_one({"_id": ObjectId(prompt_id)})
    except:
        raise HTTPException(status_code=404, detail="Prompt bulunamadı")
    
    if not existing:
        raise HTTPException(status_code=404, detail="Prompt bulunamadı")
    
    # Set all other prompts with same name to non-production
    sanri_prompts_collection.update_many(
        {"name": existing["name"], "_id": {"$ne": existing["_id"]}},
        {"$set": {"is_production": False}}
    )
    
    # Set this one to production
    sanri_prompts_collection.update_one(
        {"_id": existing["_id"]},
        {"$set": {
            "is_production": True,
            "deployed_at": datetime.now(timezone.utc)
        }}
    )
    
    log_audit("owner", "deploy", "sanri_prompt", prompt_id, existing.get("name", ""))
    
    return {"success": True, "message": "Prompt üretime alındı"}

# === AUDIT LOG ===

@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = 50,
    entity_type: Optional[str] = None,
    authorized: bool = Depends(verify_admin)
):
    """List audit logs"""
    query = {}
    if entity_type:
        query["entity_type"] = entity_type
    
    logs = list(audit_logs_collection.find(query).sort("timestamp", -1).limit(limit))
    
    for log in logs:
        log["id"] = str(log["_id"])
        del log["_id"]
        if log.get("timestamp"):
            log["timestamp"] = log["timestamp"].isoformat()
    
    return {"logs": logs, "total": len(logs)}

# === SETTINGS ===

@router.get("/settings")
async def get_settings(authorized: bool = Depends(verify_admin)):
    """Get admin settings"""
    settings = admin_settings_collection.find_one({"_id": "main"})
    
    if not settings:
        # Return defaults
        return {
            "maintenance_mode": False,
            "premium_enabled": True,
            "image_upload_enabled": True,
            "news_reading_enabled": True,
            "default_tts_voice": "nova",
            "default_tts_model": "tts-1-hd",
            "default_tts_speed": 0.85
        }
    
    del settings["_id"]
    return settings

@router.put("/settings")
async def update_settings(settings: dict, authorized: bool = Depends(verify_admin)):
    """Update admin settings"""
    admin_settings_collection.update_one(
        {"_id": "main"},
        {"$set": settings},
        upsert=True
    )
    
    log_audit("owner", "update", "settings", "main", "Admin Settings", settings)
    
    return {"success": True, "message": "Ayarlar güncellendi"}

# === PUBLIC RITUAL ENDPOINT (for frontend) ===

@router.get("/public/rituals")
async def get_public_rituals():
    """Get published rituals for frontend (no auth required)"""
    rituals = list(rituals_collection.find({"status": "published"}).sort("created_at", -1))
    
    result = []
    for ritual in rituals:
        result.append({
            "id": str(ritual["_id"]),
            "slug": ritual.get("slug"),
            "title": ritual.get("title"),
            "subtitle": ritual.get("subtitle"),
            "description": ritual.get("description"),
            "ritual_type": ritual.get("ritual_type"),
            "duration_minutes": ritual.get("duration_minutes"),
            "difficulty": ritual.get("difficulty"),
            "intention": ritual.get("intention"),
            "steps": ritual.get("steps", []),
            "opening_text": ritual.get("opening_text"),
            "closing_text": ritual.get("closing_text"),
            "tts_enabled": ritual.get("tts_enabled", True),
            "visibility": ritual.get("visibility", "free"),
            "tags": ritual.get("tags", [])
        })
    
    return {"rituals": result}

@router.get("/public/rituals/{ritual_id}")
async def get_public_ritual(ritual_id: str):
    """Get single published ritual for frontend"""
    try:
        ritual = rituals_collection.find_one({
            "_id": ObjectId(ritual_id),
            "status": "published"
        })
    except:
        ritual = rituals_collection.find_one({
            "slug": ritual_id,
            "status": "published"
        })
    
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritüel bulunamadı")
    
    return {
        "id": str(ritual["_id"]),
        "slug": ritual.get("slug"),
        "title": ritual.get("title"),
        "subtitle": ritual.get("subtitle"),
        "description": ritual.get("description"),
        "ritual_type": ritual.get("ritual_type"),
        "duration_minutes": ritual.get("duration_minutes"),
        "difficulty": ritual.get("difficulty"),
        "intention": ritual.get("intention"),
        "steps": ritual.get("steps", []),
        "opening_text": ritual.get("opening_text"),
        "closing_text": ritual.get("closing_text"),
        "tts_enabled": ritual.get("tts_enabled", True),
        "visibility": ritual.get("visibility", "free"),
        "tags": ritual.get("tags", [])
    }
