# CAELINUS AI - User Management & Privacy Routes
# Profile CRUD, Data Export, Account Deletion

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import hashlib
import uuid
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["user"])

# Database reference
db: AsyncIOMotorDatabase = None

def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database

# Import auth helpers
from routes.user_auth import get_current_user, build_sanri_context

# ============== MODELS ==============

class ProfileUpdateRequest(BaseModel):
    reason: Optional[Literal["dreams", "self_discovery", "turning_point", "curiosity"]] = None
    dominant_emotion: Optional[Literal["seeking", "confused", "calm", "tired", "curious", "love"]] = None
    style_preference: Optional[Literal["soft", "wise", "direct", "symbolic"]] = None
    purpose: Optional[Literal["dreams", "rituals", "frequencies", "self_knowledge", "all"]] = None
    language: Optional[Literal["tr", "en"]] = None

class UpdateNameRequest(BaseModel):
    name: str

# ============== PROFILE ENDPOINTS ==============

@router.get("/profile")
async def get_user_profile(request: Request):
    """Get current user's profile"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Oturum gerekli")
    
    profile = await db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    # Get activity stats
    ritual_plays = await db.ritual_plays.count_documents({"user_id": user["user_id"]})
    sanri_questions = await db.sanri_conversations.count_documents({"user_id": user["user_id"]})
    
    return {
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user.get("name"),
            "picture": user.get("picture"),
            "is_premium": user.get("is_premium", False),
            "premium_plan": user.get("premium_plan"),
            "premium_expiry": user.get("premium_expiry"),
            "created_at": user.get("created_at"),
            "last_login": user.get("last_login")
        },
        "profile": profile,
        "stats": {
            "ritual_plays": ritual_plays,
            "sanri_questions": sanri_questions
        }
    }

@router.put("/profile")
async def update_user_profile(request: Request, update: ProfileUpdateRequest):
    """Update user's consciousness profile"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Oturum gerekli")
    
    now = datetime.now(timezone.utc)
    
    # Build update dict with only provided fields
    update_dict = {"updated_at": now.isoformat()}
    for field, value in update.model_dump().items():
        if value is not None:
            update_dict[field] = value
    
    # Upsert profile
    await db.user_profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": update_dict},
        upsert=True
    )
    
    # Get updated profile
    profile = await db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    return {
        "success": True,
        "message": "Profil güncellendi",
        "profile": profile
    }

@router.put("/name")
async def update_user_name(request: Request, update: UpdateNameRequest):
    """Update user's display name"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Oturum gerekli")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"name": update.name}}
    )
    
    return {"success": True, "name": update.name}

# ============== PRIVACY / GDPR ENDPOINTS ==============

@router.get("/export")
async def export_user_data(request: Request):
    """Export all user data (GDPR/KVKK compliance)"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Oturum gerekli")
    
    user_id = user["user_id"]
    
    # Gather all user data
    profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    # Get ritual plays (without full content)
    ritual_plays = await db.ritual_plays.find(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0}
    ).to_list(1000)
    
    # Get events (anonymized)
    events = await db.events.find(
        {"user_id": user_id},
        {"_id": 0, "user_id": 0}
    ).to_list(1000)
    
    # DO NOT include SANRI conversation content - only metadata
    sanri_count = await db.sanri_conversations.count_documents({"user_id": user_id})
    
    export_data = {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user.get("name"),
            "auth_type": user.get("auth_type"),
            "is_premium": user.get("is_premium", False),
            "premium_plan": user.get("premium_plan"),
            "created_at": user.get("created_at"),
            "last_login": user.get("last_login")
        },
        "consciousness_profile": profile,
        "activity_summary": {
            "ritual_plays": len(ritual_plays),
            "sanri_conversations": sanri_count,
            "events": len(events)
        },
        "ritual_plays": ritual_plays,
        "events": events
    }
    
    return export_data

@router.delete("/delete")
async def delete_user_account(request: Request):
    """Delete user account and all associated data (GDPR/KVKK compliance)"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Oturum gerekli")
    
    user_id = user["user_id"]
    
    # Delete all user data
    await db.users.delete_one({"user_id": user_id})
    await db.user_profiles.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.ritual_plays.delete_many({"user_id": user_id})
    await db.sanri_conversations.delete_many({"user_id": user_id})
    await db.events.delete_many({"user_id": user_id})
    await db.errors.delete_many({"user_id": user_id})
    
    logger.info(f"User account deleted: {user_id}")
    
    return {
        "success": True,
        "message": "Hesabınız ve tüm verileriniz silindi"
    }

# ============== EVENT TRACKING ==============

class EventRequest(BaseModel):
    event_type: str  # page_view, ritual_play_started, etc.
    event_value: Optional[dict] = None

@router.post("/event")
async def track_event(request: Request, event: EventRequest):
    """Track user event (anonymized, no sensitive content)"""
    user = await get_current_user(request)
    user_id = user["user_id"] if user else None
    
    now = datetime.now(timezone.utc)
    
    # Sanitize event_value - remove any potential sensitive content
    safe_value = {}
    if event.event_value:
        allowed_keys = ["module", "ritual_id", "duration", "reason", "page"]
        for key in allowed_keys:
            if key in event.event_value:
                safe_value[key] = event.event_value[key]
    
    event_doc = {
        "event_id": f"evt_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,  # nullable for anonymous
        "event_type": event.event_type,
        "event_value": safe_value,
        "created_at": now.isoformat()
    }
    
    await db.events.insert_one(event_doc)
    
    return {"success": True}

@router.post("/error")
async def log_error(request: Request, source: str, message: str, stack: Optional[str] = None):
    """Log frontend/backend error"""
    user = await get_current_user(request)
    user_id = user["user_id"] if user else None
    
    now = datetime.now(timezone.utc)
    
    error_doc = {
        "error_id": f"err_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "source": source,  # frontend or backend
        "message": message[:500],  # Truncate for safety
        "stack": stack[:2000] if stack else None,  # Truncate
        "created_at": now.isoformat()
    }
    
    await db.errors.insert_one(error_doc)
    
    return {"success": True}
