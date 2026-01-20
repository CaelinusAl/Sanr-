# CAELINUS AI - Admin User Management
# Dashboard Analytics, User List, Premium Management, Data Compliance

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import hashlib
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/users", tags=["admin-users"])

# Database reference
db: AsyncIOMotorDatabase = None

def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database

# Import admin auth
from routes.admin import verify_admin

# ============== MODELS ==============

class SetPremiumRequest(BaseModel):
    is_premium: bool
    premium_plan: Optional[str] = None  # "monthly", "yearly", "lifetime"
    premium_expiry: Optional[str] = None  # ISO date string

class AnonymizeUserRequest(BaseModel):
    confirm: bool = False

# ============== DASHBOARD ANALYTICS ==============

@router.get("/dashboard")
async def get_users_dashboard(authorized: bool = Depends(verify_admin)):
    """Get user analytics dashboard data"""
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)
    
    # Total users
    total_users = await db.users.count_documents({})
    
    # New users last 7 days
    new_users_7d = await db.users.count_documents({
        "created_at": {"$gte": seven_days_ago.isoformat()}
    })
    
    # New users last 30 days
    new_users_30d = await db.users.count_documents({
        "created_at": {"$gte": thirty_days_ago.isoformat()}
    })
    
    # Premium users
    premium_users = await db.users.count_documents({"is_premium": True})
    conversion_rate = (premium_users / total_users * 100) if total_users > 0 else 0
    
    # Users by auth type
    google_users = await db.users.count_documents({"auth_type": "google"})
    email_users = await db.users.count_documents({"auth_type": "email"})
    
    # Profile completion rate
    profiles_with_consent = await db.user_profiles.count_documents({"consent_given": True})
    profile_completion_rate = (profiles_with_consent / total_users * 100) if total_users > 0 else 0
    
    # Top reasons (aggregation)
    reason_pipeline = [
        {"$match": {"reason": {"$ne": None}}},
        {"$group": {"_id": "$reason", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_reasons = await db.user_profiles.aggregate(reason_pipeline).to_list(5)
    
    # Top purposes
    purpose_pipeline = [
        {"$match": {"purpose": {"$ne": None}}},
        {"$group": {"_id": "$purpose", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_purposes = await db.user_profiles.aggregate(purpose_pipeline).to_list(5)
    
    # Top style preferences
    style_pipeline = [
        {"$match": {"style_preference": {"$ne": None}}},
        {"$group": {"_id": "$style_preference", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_styles = await db.user_profiles.aggregate(style_pipeline).to_list(5)
    
    # Language distribution
    lang_pipeline = [
        {"$group": {"_id": "$language", "count": {"$sum": 1}}}
    ]
    languages = await db.user_profiles.aggregate(lang_pipeline).to_list(10)
    
    # Event stats (last 7 days)
    total_events = await db.events.count_documents({
        "created_at": {"$gte": seven_days_ago.isoformat()}
    })
    
    # Audio stats
    audio_success = await db.events.count_documents({
        "event_type": "audio_play_started",
        "created_at": {"$gte": seven_days_ago.isoformat()}
    })
    audio_failed = await db.events.count_documents({
        "event_type": "audio_play_failed",
        "created_at": {"$gte": seven_days_ago.isoformat()}
    })
    audio_success_rate = (audio_success / (audio_success + audio_failed) * 100) if (audio_success + audio_failed) > 0 else 100
    
    # Recent errors
    recent_errors = await db.errors.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "users": {
            "total": total_users,
            "new_7d": new_users_7d,
            "new_30d": new_users_30d,
            "premium": premium_users,
            "conversion_rate": round(conversion_rate, 2),
            "by_auth": {
                "google": google_users,
                "email": email_users
            }
        },
        "profiles": {
            "completed": profiles_with_consent,
            "completion_rate": round(profile_completion_rate, 2),
            "top_reasons": [{"reason": r["_id"], "count": r["count"]} for r in top_reasons],
            "top_purposes": [{"purpose": p["_id"], "count": p["count"]} for p in top_purposes],
            "top_styles": [{"style": s["_id"], "count": s["count"]} for s in top_styles],
            "languages": [{"lang": l["_id"], "count": l["count"]} for l in languages]
        },
        "activity": {
            "events_7d": total_events,
            "audio_success_rate": round(audio_success_rate, 2)
        },
        "errors": {
            "recent": recent_errors,
            "count_7d": await db.errors.count_documents({"created_at": {"$gte": seven_days_ago.isoformat()}})
        }
    }

# ============== USER LIST ==============

@router.get("/list")
async def list_users(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    is_premium: Optional[bool] = None,
    auth_type: Optional[str] = None,
    reason: Optional[str] = None,
    language: Optional[str] = None,
    authorized: bool = Depends(verify_admin)
):
    """List all users with filters"""
    query = {}
    
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
            {"user_id": {"$regex": search, "$options": "i"}}
        ]
    
    if is_premium is not None:
        query["is_premium"] = is_premium
    
    if auth_type:
        query["auth_type"] = auth_type
    
    # Total count
    total = await db.users.count_documents(query)
    
    # Get users
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with profile data
    for user in users:
        profile = await db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
        user["profile"] = profile
        
        # Apply reason/language filters if profile exists
        if reason and (not profile or profile.get("reason") != reason):
            users.remove(user)
            continue
        if language and (not profile or profile.get("language") != language):
            users.remove(user)
            continue
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{user_id}")
async def get_user_detail(user_id: str, authorized: bool = Depends(verify_admin)):
    """Get detailed user information"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Get profile
    profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    # Get activity counts
    ritual_plays = await db.ritual_plays.count_documents({"user_id": user_id})
    sanri_questions = await db.sanri_conversations.count_documents({"user_id": user_id})
    events_count = await db.events.count_documents({"user_id": user_id})
    
    # Recent activity
    recent_events = await db.events.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "user": user,
        "profile": profile,
        "activity": {
            "ritual_plays": ritual_plays,
            "sanri_questions": sanri_questions,
            "total_events": events_count,
            "recent_events": recent_events
        }
    }

# ============== PREMIUM MANAGEMENT ==============

@router.put("/{user_id}/premium")
async def set_user_premium(user_id: str, request: SetPremiumRequest, authorized: bool = Depends(verify_admin)):
    """Set user premium status (manual admin control)"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    update_data = {
        "is_premium": request.is_premium,
        "premium_plan": request.premium_plan if request.is_premium else None,
        "premium_expiry": request.premium_expiry if request.is_premium else None
    }
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    # Log audit
    await db.audit_logs.insert_one({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user": "admin",
        "action": "set_premium" if request.is_premium else "remove_premium",
        "entity_type": "user",
        "entity_id": user_id,
        "entity_name": user.get("email"),
        "changes": update_data
    })
    
    logger.info(f"Premium status updated for {user_id}: {request.is_premium}")
    
    return {
        "success": True,
        "message": "Premium durumu güncellendi",
        "is_premium": request.is_premium
    }

# ============== DATA MANAGEMENT (GDPR/KVKK) ==============

@router.delete("/{user_id}")
async def delete_user(user_id: str, authorized: bool = Depends(verify_admin)):
    """Hard delete user and all data"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Delete all user data
    await db.users.delete_one({"user_id": user_id})
    await db.user_profiles.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.ritual_plays.delete_many({"user_id": user_id})
    await db.sanri_conversations.delete_many({"user_id": user_id})
    await db.events.delete_many({"user_id": user_id})
    await db.errors.delete_many({"user_id": user_id})
    
    # Log audit
    await db.audit_logs.insert_one({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user": "admin",
        "action": "delete_user",
        "entity_type": "user",
        "entity_id": user_id,
        "entity_name": user.get("email"),
        "changes": {"deleted": True}
    })
    
    logger.info(f"User deleted by admin: {user_id}")
    
    return {"success": True, "message": "Kullanıcı ve tüm verileri silindi"}

@router.post("/{user_id}/anonymize")
async def anonymize_user(user_id: str, request: AnonymizeUserRequest, authorized: bool = Depends(verify_admin)):
    """Anonymize user (keep aggregate data, hash PII)"""
    if not request.confirm:
        raise HTTPException(status_code=400, detail="Onay gerekli")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Hash email for anonymization
    email_hash = hashlib.sha256(user["email"].encode()).hexdigest()[:16]
    
    # Anonymize user
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "email": f"anon_{email_hash}@deleted.local",
            "name": "Anonim Kullanıcı",
            "picture": None,
            "is_anonymized": True,
            "anonymized_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Keep profile but mark as anonymized
    await db.user_profiles.update_one(
        {"user_id": user_id},
        {"$set": {"is_anonymized": True}}
    )
    
    # Delete sessions
    await db.user_sessions.delete_many({"user_id": user_id})
    
    # Log audit
    await db.audit_logs.insert_one({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user": "admin",
        "action": "anonymize_user",
        "entity_type": "user",
        "entity_id": user_id,
        "entity_name": f"anon_{email_hash}",
        "changes": {"anonymized": True}
    })
    
    logger.info(f"User anonymized: {user_id}")
    
    return {"success": True, "message": "Kullanıcı anonimleştirildi"}
