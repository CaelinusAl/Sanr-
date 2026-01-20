# CAELINUS AI - Bilinç Aynası (Consciousness Mirror) Profile API
# User journey statistics, SANRI interactions, frequency progress

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile", tags=["profile"])

# Database reference
db = None

def set_database(database):
    global db
    db = database

# ============== MODELS ==============

class ProfileStats(BaseModel):
    total_sanri_sessions: int = 0
    total_rituals_completed: int = 0
    cities_explored: int = 0
    days_active: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    favorite_mode: Optional[str] = None
    consciousness_level: int = 1
    total_reflections: int = 0

class JourneyMilestone(BaseModel):
    id: str
    title_tr: str
    title_en: str
    description_tr: str
    description_en: str
    icon: str
    unlocked: bool
    unlocked_at: Optional[str] = None

class ProfileResponse(BaseModel):
    user_id: str
    display_name: str
    avatar_symbol: str
    member_since: str
    plan_type: str
    stats: ProfileStats
    milestones: List[JourneyMilestone]
    recent_activity: List[dict]
    consciousness_map: dict

# ============== MILESTONES ==============

MILESTONES = [
    {
        "id": "first_question",
        "title_tr": "İlk Soru",
        "title_en": "First Question",
        "description_tr": "SANRI'ya ilk sorunuzu sordunuz",
        "description_en": "You asked SANRI your first question",
        "icon": "🌙",
        "threshold": {"sanri_sessions": 1}
    },
    {
        "id": "mirror_seeker",
        "title_tr": "Ayna Arayıcısı",
        "title_en": "Mirror Seeker",
        "description_tr": "10 SANRI oturumu tamamladınız",
        "description_en": "You completed 10 SANRI sessions",
        "icon": "🪞",
        "threshold": {"sanri_sessions": 10}
    },
    {
        "id": "city_explorer",
        "title_tr": "Şehir Kaşifi",
        "title_en": "City Explorer",
        "description_tr": "10 farklı şehri keşfettiniz",
        "description_en": "You explored 10 different cities",
        "icon": "🏛️",
        "threshold": {"cities_explored": 10}
    },
    {
        "id": "ritual_initiate",
        "title_tr": "Ritüel İnisiyesi",
        "title_en": "Ritual Initiate",
        "description_tr": "İlk ritüelinizi tamamladınız",
        "description_en": "You completed your first ritual",
        "icon": "🕯️",
        "threshold": {"rituals_completed": 1}
    },
    {
        "id": "seven_days",
        "title_tr": "7 Günlük Yolculuk",
        "title_en": "7 Day Journey",
        "description_tr": "7 gün üst üste aktif kaldınız",
        "description_en": "You stayed active for 7 consecutive days",
        "icon": "✨",
        "threshold": {"streak": 7}
    },
    {
        "id": "consciousness_rising",
        "title_tr": "Yükselen Bilinç",
        "title_en": "Rising Consciousness",
        "description_tr": "Bilinç seviyesi 5'e ulaştınız",
        "description_en": "You reached consciousness level 5",
        "icon": "🌟",
        "threshold": {"consciousness_level": 5}
    },
    {
        "id": "all_modes",
        "title_tr": "5 Mod Ustası",
        "title_en": "5 Mode Master",
        "description_tr": "Tüm SANRI modlarını deneyimlediniz",
        "description_en": "You experienced all SANRI modes",
        "icon": "🔮",
        "threshold": {"modes_used": 5}
    },
    {
        "id": "deep_reflection",
        "title_tr": "Derin Yansıma",
        "title_en": "Deep Reflection",
        "description_tr": "50 yansıma tamamladınız",
        "description_en": "You completed 50 reflections",
        "icon": "💫",
        "threshold": {"reflections": 50}
    }
]

# ============== HELPER FUNCTIONS ==============

async def get_user_stats(user_id: str) -> ProfileStats:
    """Calculate user statistics from activity data"""
    try:
        # Get SANRI sessions count
        sanri_count = await db.sanri_sessions.count_documents({"user_id": user_id})
        
        # Get rituals completed
        rituals_count = await db.completed_rituals.count_documents({"user_id": user_id})
        
        # Get cities explored
        cities_cursor = db.city_views.find({"user_id": user_id}).distinct("city_id")
        cities_explored = len(await cities_cursor.to_list(length=100)) if cities_cursor else 0
        
        # Calculate days active and streaks
        activity_cursor = db.user_activity.find(
            {"user_id": user_id},
            {"date": 1}
        ).sort("date", -1)
        activities = await activity_cursor.to_list(length=365)
        
        days_active = len(set([a.get("date", "")[:10] for a in activities if a.get("date")]))
        
        # Calculate streak
        current_streak = 0
        longest_streak = 0
        if activities:
            today = datetime.now(timezone.utc).date()
            dates = sorted(set([datetime.fromisoformat(a["date"][:10]).date() for a in activities if a.get("date")]), reverse=True)
            
            # Current streak
            for i, d in enumerate(dates):
                if (today - d).days == i:
                    current_streak += 1
                else:
                    break
            
            # Longest streak
            streak = 1
            for i in range(1, len(dates)):
                if (dates[i-1] - dates[i]).days == 1:
                    streak += 1
                else:
                    longest_streak = max(longest_streak, streak)
                    streak = 1
            longest_streak = max(longest_streak, streak)
        
        # Get favorite mode
        mode_cursor = db.sanri_sessions.aggregate([
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": "$mode", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ])
        mode_result = await mode_cursor.to_list(length=1)
        favorite_mode = mode_result[0]["_id"] if mode_result else None
        
        # Calculate consciousness level (based on total activity)
        total_activity = sanri_count + rituals_count + cities_explored
        consciousness_level = min(10, max(1, total_activity // 10 + 1))
        
        return ProfileStats(
            total_sanri_sessions=sanri_count,
            total_rituals_completed=rituals_count,
            cities_explored=cities_explored,
            days_active=days_active,
            current_streak=current_streak,
            longest_streak=longest_streak,
            favorite_mode=favorite_mode,
            consciousness_level=consciousness_level,
            total_reflections=sanri_count + rituals_count
        )
    except Exception as e:
        logger.error(f"Error calculating user stats: {e}")
        return ProfileStats()

async def check_milestones(user_id: str, stats: ProfileStats) -> List[JourneyMilestone]:
    """Check which milestones user has unlocked"""
    milestones = []
    
    # Get user's unlocked milestones from DB
    user_milestones = await db.user_milestones.find({"user_id": user_id}).to_list(length=100)
    unlocked_ids = {m["milestone_id"]: m.get("unlocked_at") for m in user_milestones}
    
    # Get modes used
    modes_cursor = db.sanri_sessions.find({"user_id": user_id}).distinct("mode")
    modes_used = len(await modes_cursor.to_list(length=10)) if modes_cursor else 0
    
    for m in MILESTONES:
        threshold = m["threshold"]
        unlocked = False
        
        if "sanri_sessions" in threshold:
            unlocked = stats.total_sanri_sessions >= threshold["sanri_sessions"]
        elif "rituals_completed" in threshold:
            unlocked = stats.total_rituals_completed >= threshold["rituals_completed"]
        elif "cities_explored" in threshold:
            unlocked = stats.cities_explored >= threshold["cities_explored"]
        elif "streak" in threshold:
            unlocked = stats.longest_streak >= threshold["streak"]
        elif "consciousness_level" in threshold:
            unlocked = stats.consciousness_level >= threshold["consciousness_level"]
        elif "modes_used" in threshold:
            unlocked = modes_used >= threshold["modes_used"]
        elif "reflections" in threshold:
            unlocked = stats.total_reflections >= threshold["reflections"]
        
        # Save newly unlocked milestones
        if unlocked and m["id"] not in unlocked_ids:
            await db.user_milestones.insert_one({
                "user_id": user_id,
                "milestone_id": m["id"],
                "unlocked_at": datetime.now(timezone.utc).isoformat()
            })
            unlocked_ids[m["id"]] = datetime.now(timezone.utc).isoformat()
        
        milestones.append(JourneyMilestone(
            id=m["id"],
            title_tr=m["title_tr"],
            title_en=m["title_en"],
            description_tr=m["description_tr"],
            description_en=m["description_en"],
            icon=m["icon"],
            unlocked=unlocked,
            unlocked_at=unlocked_ids.get(m["id"])
        ))
    
    return milestones

async def get_recent_activity(user_id: str, limit: int = 10) -> List[dict]:
    """Get user's recent activity"""
    activities = []
    
    # Get recent SANRI sessions
    sanri_cursor = db.sanri_sessions.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit)
    
    async for session in sanri_cursor:
        activities.append({
            "type": "sanri",
            "mode": session.get("mode", "mirror"),
            "timestamp": session.get("created_at", ""),
            "preview": session.get("question", "")[:50] + "..." if session.get("question") else ""
        })
    
    # Get recent ritual completions
    ritual_cursor = db.completed_rituals.find(
        {"user_id": user_id}
    ).sort("completed_at", -1).limit(limit)
    
    async for ritual in ritual_cursor:
        activities.append({
            "type": "ritual",
            "ritual_name": ritual.get("ritual_name", ""),
            "timestamp": ritual.get("completed_at", "")
        })
    
    # Sort by timestamp and return top items
    activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return activities[:limit]

def generate_consciousness_map(stats: ProfileStats) -> dict:
    """Generate consciousness map data for visualization"""
    return {
        "level": stats.consciousness_level,
        "dimensions": {
            "reflection": min(100, stats.total_sanri_sessions * 5),
            "ritual": min(100, stats.total_rituals_completed * 10),
            "exploration": min(100, stats.cities_explored * 3),
            "consistency": min(100, stats.current_streak * 10),
            "depth": min(100, stats.total_reflections * 2)
        },
        "next_level_progress": (stats.consciousness_level * 10) % 100
    }

# ============== ENDPOINTS ==============

@router.get("/me")
async def get_my_profile(request: Request):
    """Get current user's consciousness mirror profile"""
    # Get user from auth (simplified - in production use proper auth middleware)
    user_id = request.headers.get("X-User-Id")
    
    if not user_id:
        # Return demo profile for unauthenticated users
        return {
            "user_id": "demo",
            "display_name": "Arayıcı",
            "avatar_symbol": "∞",
            "member_since": datetime.now(timezone.utc).isoformat(),
            "plan_type": "free",
            "stats": ProfileStats().model_dump(),
            "milestones": [
                JourneyMilestone(
                    id=m["id"],
                    title_tr=m["title_tr"],
                    title_en=m["title_en"],
                    description_tr=m["description_tr"],
                    description_en=m["description_en"],
                    icon=m["icon"],
                    unlocked=False
                ).model_dump() for m in MILESTONES
            ],
            "recent_activity": [],
            "consciousness_map": {
                "level": 1,
                "dimensions": {
                    "reflection": 0,
                    "ritual": 0,
                    "exploration": 0,
                    "consistency": 0,
                    "depth": 0
                },
                "next_level_progress": 0
            }
        }
    
    try:
        # Get user data
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate stats
        stats = await get_user_stats(user_id)
        
        # Check milestones
        milestones = await check_milestones(user_id, stats)
        
        # Get recent activity
        recent_activity = await get_recent_activity(user_id)
        
        # Generate consciousness map
        consciousness_map = generate_consciousness_map(stats)
        
        return {
            "user_id": user_id,
            "display_name": user.get("name", "Arayıcı"),
            "avatar_symbol": user.get("avatar_symbol", "∞"),
            "member_since": user.get("created_at", datetime.now(timezone.utc).isoformat()),
            "plan_type": user.get("plan_type", "free"),
            "stats": stats.model_dump(),
            "milestones": [m.model_dump() for m in milestones],
            "recent_activity": recent_activity,
            "consciousness_map": consciousness_map
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to load profile")

@router.post("/track-activity")
async def track_activity(request: Request):
    """Track user activity for stats"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return {"status": "skipped", "reason": "no user"}
    
    try:
        body = await request.json()
        activity_type = body.get("type")
        
        await db.user_activity.insert_one({
            "user_id": user_id,
            "type": activity_type,
            "date": datetime.now(timezone.utc).isoformat(),
            "metadata": body.get("metadata", {})
        })
        
        return {"status": "tracked"}
    except Exception as e:
        logger.error(f"Error tracking activity: {e}")
        return {"status": "error"}

@router.put("/avatar")
async def update_avatar(request: Request):
    """Update user's avatar symbol"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        body = await request.json()
        symbol = body.get("symbol", "∞")
        
        # Validate symbol (must be single character or emoji)
        if len(symbol) > 2:
            raise HTTPException(status_code=400, detail="Symbol must be a single character")
        
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"avatar_symbol": symbol}}
        )
        
        return {"status": "updated", "symbol": symbol}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating avatar: {e}")
        raise HTTPException(status_code=500, detail="Failed to update avatar")
