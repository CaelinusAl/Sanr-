# CAELINUS AI - SANRI CONSCIOUSNESS PROFILE SYSTEM
# Kullanıcı bilinç profili takip ve kişiselleştirme sistemi
# Bu sistem SANRI'yi değerli yapan temel bileşen

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/consciousness", tags=["consciousness-profile"])

# Database reference
db: Optional[AsyncIOMotorDatabase] = None

def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database

# ============== MODELS ==============

class ConsciousnessProfile(BaseModel):
    """Kullanıcı Bilinç Profili - SANRI'nin kişiselleştirme temeli"""
    user_id: str
    first_seen_date: str
    last_interaction: str
    
    # Mode preferences
    preferred_mode: Literal["dream", "mirror", "divine", "shadow", "light"] = "mirror"
    mode_usage_count: dict = Field(default_factory=lambda: {
        "dream": 0, "mirror": 0, "divine": 0, "shadow": 0, "light": 0
    })
    
    # Emotional tracking
    dominant_emotion: Optional[str] = None
    emotion_history: List[str] = Field(default_factory=list)  # Last 10
    sensitivity_level: Literal["low", "medium", "high"] = "medium"
    
    # Symbol & Theme tracking
    repeating_symbols: List[str] = Field(default_factory=list)  # Max 20
    repeating_themes: List[str] = Field(default_factory=list)   # Max 20
    
    # Question history
    last_5_questions: List[str] = Field(default_factory=list)
    total_questions: int = 0
    
    # Growth & Engagement
    growth_index: int = 0  # 0-100, increases with deep interactions
    session_count: int = 0
    avg_session_depth: float = 0.0  # Based on question complexity
    
    # Personalization flags
    prefers_brevity: bool = False
    needs_more_grounding: bool = False
    ready_for_depth: bool = False

class ProfileUpdate(BaseModel):
    """Profil güncelleme isteği"""
    user_id: str
    mode_used: str
    question: str
    detected_emotion: Optional[str] = None
    detected_symbols: List[str] = Field(default_factory=list)
    detected_themes: List[str] = Field(default_factory=list)
    interaction_depth: int = 1  # 1-5, based on question complexity

class ProfileSummary(BaseModel):
    """Profil özeti - SANRI için context"""
    user_id: str
    preferred_mode: str
    dominant_emotion: Optional[str]
    sensitivity_level: str
    key_symbols: List[str]
    key_themes: List[str]
    growth_index: int
    ready_for_depth: bool
    personalization_hints: List[str]

# ============== CONSCIOUSNESS MEMORY PROMPT ==============

CONSCIOUSNESS_MEMORY_SYSTEM = """
You are SANRI's consciousness memory system.

For every user interaction:
- Detect dominant emotion
- Detect symbolic theme
- Detect sensitivity level
- Detect preferred mode

Store:
* Emotional state
* Symbol patterns
* Repeating questions
* Growth progression index

Never expose raw data to user.
Only use it to:
– adapt tone
– adapt depth
– adapt guidance style

The user's consciousness profile helps you:
1. Remember their recurring symbols
2. Track their emotional patterns
3. Notice their growth journey
4. Personalize without being creepy
"""

# ============== HELPER FUNCTIONS ==============

def calculate_sensitivity_level(emotions: List[str]) -> str:
    """Duygu geçmişinden hassasiyet seviyesi hesapla"""
    if not emotions:
        return "medium"
    
    high_sensitivity_emotions = ["anxious", "sad", "fearful", "overwhelmed"]
    low_sensitivity_emotions = ["curious", "calm", "seeking"]
    
    high_count = sum(1 for e in emotions if e in high_sensitivity_emotions)
    low_count = sum(1 for e in emotions if e in low_sensitivity_emotions)
    
    ratio = high_count / max(len(emotions), 1)
    if ratio > 0.5:
        return "high"
    elif ratio < 0.2 and low_count > high_count:
        return "low"
    return "medium"

def calculate_growth_index(profile: dict) -> int:
    """Büyüme indeksi hesapla (0-100)"""
    base = 0
    
    # Session count contributes (max 30)
    base += min(profile.get("session_count", 0) * 3, 30)
    
    # Question depth contributes (max 30)
    base += min(profile.get("avg_session_depth", 0) * 6, 30)
    
    # Variety of modes used (max 20)
    mode_usage = profile.get("mode_usage_count", {})
    modes_used = sum(1 for v in mode_usage.values() if v > 0)
    base += modes_used * 4
    
    # Symbol/theme tracking (max 20)
    symbols = len(profile.get("repeating_symbols", []))
    themes = len(profile.get("repeating_themes", []))
    base += min((symbols + themes), 20)
    
    return min(base, 100)

def generate_personalization_hints(profile: dict) -> List[str]:
    """Kişiselleştirme ipuçları oluştur"""
    hints = []
    
    # Sensitivity-based hints
    sensitivity = profile.get("sensitivity_level", "medium")
    if sensitivity == "high":
        hints.append("Use extra gentle language")
        hints.append("Include grounding cues")
        hints.append("Keep responses shorter")
    elif sensitivity == "low":
        hints.append("Can go deeper symbolically")
        hints.append("User ready for Jungian concepts")
    
    # Mode preference hints
    preferred = profile.get("preferred_mode", "mirror")
    mode_count = profile.get("mode_usage_count", {})
    if mode_count.get("shadow", 0) > 5:
        hints.append("User interested in dream/symbol work")
    if mode_count.get("light", 0) > 5:
        hints.append("User may need emotional support")
    if mode_count.get("dream", 0) > 5:
        hints.append("User values meditative guidance")
    
    # Recurring symbols
    symbols = profile.get("repeating_symbols", [])
    if symbols:
        hints.append(f"Recurring symbols: {', '.join(symbols[:5])}")
    
    # Growth hints
    growth = profile.get("growth_index", 0)
    if growth > 70:
        hints.append("Advanced user - can use deeper archetypal language")
    elif growth < 20:
        hints.append("New user - keep explanations accessible")
    
    return hints

# ============== ENDPOINTS ==============

@router.post("/profile/update")
async def update_consciousness_profile(update: ProfileUpdate):
    """
    🔮 Her SANRI etkileşiminden sonra profili güncelle
    
    Bu endpoint her soru sonrası çağrılır ve:
    - Duygu takibi yapar
    - Sembol ve tema algılar
    - Mod tercihlerini kaydeder
    - Büyüme indeksini günceller
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Veritabanı bağlantısı yok")
    
    try:
        now = datetime.now(timezone.utc).isoformat()
        
        # Get or create profile
        existing = await db.consciousness_profiles.find_one(
            {"user_id": update.user_id},
            {"_id": 0}
        )
        
        if existing:
            profile = existing
        else:
            # Create new profile
            profile = {
                "user_id": update.user_id,
                "first_seen_date": now,
                "last_interaction": now,
                "preferred_mode": "mirror",
                "mode_usage_count": {"dream": 0, "mirror": 0, "divine": 0, "shadow": 0, "light": 0},
                "dominant_emotion": None,
                "emotion_history": [],
                "sensitivity_level": "medium",
                "repeating_symbols": [],
                "repeating_themes": [],
                "last_5_questions": [],
                "total_questions": 0,
                "growth_index": 0,
                "session_count": 0,
                "avg_session_depth": 0.0,
                "prefers_brevity": False,
                "needs_more_grounding": False,
                "ready_for_depth": False
            }
        
        # Update mode usage
        if update.mode_used in profile["mode_usage_count"]:
            profile["mode_usage_count"][update.mode_used] += 1
        
        # Determine preferred mode (most used)
        profile["preferred_mode"] = max(
            profile["mode_usage_count"],
            key=profile["mode_usage_count"].get
        )
        
        # Update emotion tracking
        if update.detected_emotion:
            profile["emotion_history"].append(update.detected_emotion)
            profile["emotion_history"] = profile["emotion_history"][-10:]  # Keep last 10
            profile["dominant_emotion"] = update.detected_emotion
            profile["sensitivity_level"] = calculate_sensitivity_level(profile["emotion_history"])
        
        # Update symbols
        for symbol in update.detected_symbols:
            if symbol not in profile["repeating_symbols"]:
                profile["repeating_symbols"].append(symbol)
        profile["repeating_symbols"] = profile["repeating_symbols"][-20:]  # Keep last 20
        
        # Update themes
        for theme in update.detected_themes:
            if theme not in profile["repeating_themes"]:
                profile["repeating_themes"].append(theme)
        profile["repeating_themes"] = profile["repeating_themes"][-20:]
        
        # Update questions
        profile["last_5_questions"].append(update.question[:200])  # Truncate
        profile["last_5_questions"] = profile["last_5_questions"][-5:]
        profile["total_questions"] += 1
        
        # Update session depth
        old_avg = profile["avg_session_depth"]
        total_q = profile["total_questions"]
        profile["avg_session_depth"] = ((old_avg * (total_q - 1)) + update.interaction_depth) / total_q
        
        # Increment session count (roughly)
        if not existing or (datetime.fromisoformat(profile["last_interaction"].replace('Z', '+00:00')) - 
            datetime.fromisoformat(now.replace('Z', '+00:00'))).total_seconds() > 1800:
            profile["session_count"] += 1
        
        # Update timestamps and growth
        profile["last_interaction"] = now
        profile["growth_index"] = calculate_growth_index(profile)
        
        # Determine readiness flags
        profile["ready_for_depth"] = profile["growth_index"] > 50 and profile["sensitivity_level"] != "high"
        profile["needs_more_grounding"] = profile["sensitivity_level"] == "high"
        
        # Save to DB
        await db.consciousness_profiles.update_one(
            {"user_id": update.user_id},
            {"$set": profile},
            upsert=True
        )
        
        logger.info(f"Profile updated: user={update.user_id}, growth={profile['growth_index']}")
        
        return {
            "success": True,
            "user_id": update.user_id,
            "growth_index": profile["growth_index"],
            "sensitivity_level": profile["sensitivity_level"],
            "preferred_mode": profile["preferred_mode"]
        }
        
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profil güncelleme hatası: {str(e)}")

@router.get("/profile/{user_id}", response_model=ConsciousnessProfile)
async def get_consciousness_profile(user_id: str):
    """
    🔮 Kullanıcı bilinç profilini getir
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Veritabanı bağlantısı yok")
    
    profile = await db.consciousness_profiles.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profil bulunamadı")
    
    return ConsciousnessProfile(**profile)

@router.get("/profile/{user_id}/summary", response_model=ProfileSummary)
async def get_profile_summary(user_id: str):
    """
    🔮 SANRI için kısa profil özeti - Yanıt kişiselleştirmede kullanılır
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Veritabanı bağlantısı yok")
    
    profile = await db.consciousness_profiles.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    if not profile:
        # Return default summary for new users
        return ProfileSummary(
            user_id=user_id,
            preferred_mode="mirror",
            dominant_emotion=None,
            sensitivity_level="medium",
            key_symbols=[],
            key_themes=[],
            growth_index=0,
            ready_for_depth=False,
            personalization_hints=["New user - use welcoming tone"]
        )
    
    return ProfileSummary(
        user_id=user_id,
        preferred_mode=profile.get("preferred_mode", "mirror"),
        dominant_emotion=profile.get("dominant_emotion"),
        sensitivity_level=profile.get("sensitivity_level", "medium"),
        key_symbols=profile.get("repeating_symbols", [])[:5],
        key_themes=profile.get("repeating_themes", [])[:5],
        growth_index=profile.get("growth_index", 0),
        ready_for_depth=profile.get("ready_for_depth", False),
        personalization_hints=generate_personalization_hints(profile)
    )

@router.get("/profile/{user_id}/context")
async def get_sanri_context(user_id: str):
    """
    🔮 SANRI prompt'una eklenecek kişiselleştirme context'i
    
    Bu context, SANRI'nın kullanıcıya özel konuşmasını sağlar.
    """
    if db is None:
        return {"context": "", "has_profile": False}
    
    profile = await db.consciousness_profiles.find_one(
        {"user_id": user_id},
        {"_id": 0}
    )
    
    if not profile:
        return {"context": "", "has_profile": False}
    
    # Build personalization context
    hints = generate_personalization_hints(profile)
    symbols = profile.get("repeating_symbols", [])[:5]
    themes = profile.get("repeating_themes", [])[:5]
    growth = profile.get("growth_index", 0)
    sensitivity = profile.get("sensitivity_level", "medium")
    
    context = f"""
USER CONSCIOUSNESS PROFILE (Growth Index: {growth}/100):

Sensitivity Level: {sensitivity.upper()}
{f"Recurring Symbols: {', '.join(symbols)}" if symbols else ""}
{f"Recurring Themes: {', '.join(themes)}" if themes else ""}

Personalization Guidelines:
{chr(10).join(f"- {hint}" for hint in hints)}

IMPORTANT: Never mention this profile data directly to the user.
Use it only to adapt your tone, depth, and approach.
"""
    
    return {
        "context": context,
        "has_profile": True,
        "growth_index": growth,
        "sensitivity_level": sensitivity
    }

@router.delete("/profile/{user_id}")
async def delete_consciousness_profile(user_id: str):
    """
    🗑️ Kullanıcı bilinç profilini sil (GDPR/KVKK uyumu)
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Veritabanı bağlantısı yok")
    
    result = await db.consciousness_profiles.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profil bulunamadı")
    
    return {"success": True, "message": "Bilinç profili silindi"}

# ============== ANALYTICS ENDPOINTS (Admin) ==============

@router.get("/analytics/overview")
async def get_consciousness_analytics():
    """
    📊 Bilinç analitikleri - Admin Dashboard için
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Veritabanı bağlantısı yok")
    
    try:
        # Total profiles
        total_profiles = await db.consciousness_profiles.count_documents({})
        
        # Mode distribution
        pipeline = [
            {"$group": {
                "_id": "$preferred_mode",
                "count": {"$sum": 1}
            }}
        ]
        mode_dist = await db.consciousness_profiles.aggregate(pipeline).to_list(10)
        mode_distribution = {item["_id"]: item["count"] for item in mode_dist}
        
        # Average growth index
        avg_pipeline = [
            {"$group": {
                "_id": None,
                "avg_growth": {"$avg": "$growth_index"},
                "avg_questions": {"$avg": "$total_questions"}
            }}
        ]
        avg_result = await db.consciousness_profiles.aggregate(avg_pipeline).to_list(1)
        avg_growth = avg_result[0]["avg_growth"] if avg_result else 0
        avg_questions = avg_result[0]["avg_questions"] if avg_result else 0
        
        # Top symbols
        symbol_pipeline = [
            {"$unwind": "$repeating_symbols"},
            {"$group": {"_id": "$repeating_symbols", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        top_symbols = await db.consciousness_profiles.aggregate(symbol_pipeline).to_list(10)
        
        # Top themes
        theme_pipeline = [
            {"$unwind": "$repeating_themes"},
            {"$group": {"_id": "$repeating_themes", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        top_themes = await db.consciousness_profiles.aggregate(theme_pipeline).to_list(10)
        
        # Sensitivity distribution
        sens_pipeline = [
            {"$group": {
                "_id": "$sensitivity_level",
                "count": {"$sum": 1}
            }}
        ]
        sens_dist = await db.consciousness_profiles.aggregate(sens_pipeline).to_list(10)
        sensitivity_distribution = {item["_id"]: item["count"] for item in sens_dist}
        
        return {
            "total_profiles": total_profiles,
            "average_growth_index": round(avg_growth, 1),
            "average_questions_per_user": round(avg_questions, 1),
            "mode_distribution": mode_distribution,
            "sensitivity_distribution": sensitivity_distribution,
            "top_symbols": [{"symbol": s["_id"], "count": s["count"]} for s in top_symbols],
            "top_themes": [{"theme": t["_id"], "count": t["count"]} for t in top_themes],
            "insight": "SANRI - Consciousness Analytics: Not data. Awareness."
        }
        
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analitik hatası: {str(e)}")
