# CAELINUS AI - User Authentication System
# Google OAuth (Emergent) + JWT Email/Password + Bilinç Profili

from fastapi import APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx
import uuid
import hashlib
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Database reference
db: AsyncIOMotorDatabase = None

def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database

# ============== MODELS ==============

# Onboarding Enums - NEW 4-question consciousness profile
TimePerceptionType = Literal["present_aware", "past_affected", "non_linear", "time_worker"]
IdentityType = Literal["seeker", "transforming", "pathmaker", "silence_finder"]
StyleType = Literal["soft", "wise", "direct", "symbolic"]
PurposeType = Literal["dreams", "rituals", "frequencies", "self_knowledge", "all"]

# Legacy enums for backwards compatibility
ReasonType = Literal["dreams", "self_discovery", "turning_point", "curiosity"]
EmotionType = Literal["seeking", "confused", "calm", "tired", "curious", "love"]

class UserProfile(BaseModel):
    """Bilinç Profili - Yeni 4 sorulu sistem"""
    # New consciousness profile fields
    time_perception: Optional[TimePerceptionType] = None  # Zaman algısı (bilinç seviyesi)
    identity: Optional[IdentityType] = None               # Kimlik algısı (ego/öz ayrımı)
    style_preference: Optional[StyleType] = None
    purpose: Optional[PurposeType] = None
    # Legacy fields for backwards compatibility
    reason: Optional[ReasonType] = None
    dominant_emotion: Optional[EmotionType] = None
    # Common fields
    language: Literal["tr", "en"] = "tr"
    consent_given: bool = False
    consent_timestamp: Optional[str] = None

class User(BaseModel):
    """Kullanıcı modeli"""
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    auth_type: Literal["google", "email"] = "google"
    is_premium: bool = False
    premium_plan: Optional[str] = None
    premium_expiry: Optional[str] = None
    created_at: str
    last_login: Optional[str] = None
    profile: Optional[UserProfile] = None

class GoogleSessionRequest(BaseModel):
    session_id: str

class EmailRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    profile: Optional[UserProfile] = None

class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: str

class OnboardingRequest(BaseModel):
    """Bilinç profili güncelleme - NEW 4-question system"""
    time_perception: TimePerceptionType
    identity: IdentityType
    style_preference: StyleType
    purpose: PurposeType
    language: Literal["tr", "en"] = "tr"
    consent_given: bool = True

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: Optional[str]
    picture: Optional[str]
    is_premium: bool
    has_profile: bool
    profile: Optional[UserProfile]

# ============== HELPERS ==============

def generate_user_id() -> str:
    """Generate unique user ID"""
    return f"user_{uuid.uuid4().hex[:12]}"

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = os.environ.get("PASSWORD_SALT", "caelinus_salt_2026")
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

async def get_current_user(request: Request) -> Optional[dict]:
    """Get current user from session token (cookie or header)"""
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    # Find session
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    return user

def require_auth(request: Request):
    """Dependency for protected routes"""
    async def _require_auth():
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Oturum gerekli")
        return user
    return _require_auth

# ============== SANRI PROFILE CONTEXT ==============

def build_sanri_context(profile: dict) -> str:
    """
    Kullanıcı profiline göre dinamik SANRI context oluştur.
    Bu prompt DB'de saklanmaz, her istekte dinamik olarak oluşturulur.
    """
    if not profile:
        return ""
    
    reason_map = {
        "dreams": "Rüyalarını anlamak için geldi",
        "self_discovery": "Kendini tanımak istiyor",
        "turning_point": "Hayatında bir dönüm noktasında",
        "curiosity": "Merak ediyor, keşfetmek istiyor"
    }
    
    emotion_map = {
        "seeking": "Arayış içinde",
        "confused": "Kafa karışıklığı yaşıyor",
        "calm": "Huzurlu bir dönemde",
        "tired": "Yorgun hissediyor",
        "curious": "Meraklı ve açık",
        "love": "Aşk ve bağ arayışında"
    }
    
    style_map = {
        "soft": "Yumuşak ve şefkatli bir yaklaşım tercih ediyor",
        "wise": "Bilge ve derin konuşmayı tercih ediyor",
        "direct": "Sade ve net iletişim istiyor",
        "symbolic": "Spiritüel ve sembolik dil tercih ediyor"
    }
    
    purpose_map = {
        "dreams": "Rüya yorumları için burada",
        "rituals": "Ritüeller deneyimlemek istiyor",
        "frequencies": "Frekans çalışmaları yapacak",
        "self_knowledge": "Kendini tanımak için burada",
        "all": "Tüm deneyimlere açık"
    }
    
    context_parts = []
    
    if profile.get("reason"):
        context_parts.append(reason_map.get(profile["reason"], ""))
    if profile.get("dominant_emotion"):
        context_parts.append(emotion_map.get(profile["dominant_emotion"], ""))
    if profile.get("style_preference"):
        context_parts.append(style_map.get(profile["style_preference"], ""))
    if profile.get("purpose"):
        context_parts.append(purpose_map.get(profile["purpose"], ""))
    
    if not context_parts:
        return ""
    
    context = f"""
USER CONSCIOUSNESS PROFILE:
{chr(10).join(f"- {part}" for part in context_parts if part)}

SANRI ADAPTATION RULES:
- Match emotional sensitivity level to user's current state
- Use preferred communication style
- Never overwhelm, never give absolute truths
- Always guide with questions, reflect rather than dictate
- Protect emotional safety at all times
- Act as inner mirror, not teacher or authority
"""
    return context

# ============== ENDPOINTS ==============

@router.post("/google/session")
async def process_google_session(request: GoogleSessionRequest, response: Response):
    """
    Process Google OAuth session from Emergent Auth.
    Frontend sends session_id, we exchange it for user data.
    """
    try:
        # Exchange session_id for user data from Emergent Auth
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id},
                timeout=10.0
            )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Geçersiz oturum")
        
        auth_data = auth_response.json()
        email = auth_data.get("email")
        name = auth_data.get("name")
        picture = auth_data.get("picture")
        session_token = auth_data.get("session_token")
        
        if not email or not session_token:
            raise HTTPException(status_code=400, detail="Eksik kullanıcı bilgisi")
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": email}, {"_id": 0})
        
        now = datetime.now(timezone.utc)
        is_new_user = False
        
        if existing_user:
            user_id = existing_user["user_id"]
            # Update last login
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "last_login": now.isoformat(),
                    "name": name,
                    "picture": picture
                }}
            )
        else:
            # Create new user
            is_new_user = True
            user_id = generate_user_id()
            user_doc = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "auth_type": "google",
                "is_premium": False,
                "premium_plan": None,
                "premium_expiry": None,
                "created_at": now.isoformat(),
                "last_login": now.isoformat()
            }
            await db.users.insert_one(user_doc)
            logger.info(f"New user created: {email}")
        
        # Create/update session
        expires_at = now + timedelta(days=7)
        await db.user_sessions.update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": now.isoformat()
            }},
            upsert=True
        )
        
        # Get user profile if exists
        profile = await db.user_profiles.find_one({"user_id": user_id}, {"_id": 0})
        has_profile = profile is not None and profile.get("consent_given", False)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        return {
            "success": True,
            "is_new_user": is_new_user,
            "has_profile": has_profile,
            "user": {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "is_premium": existing_user.get("is_premium", False) if existing_user else False
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google session error: {str(e)}")
        raise HTTPException(status_code=500, detail="Oturum işleme hatası")

@router.post("/email/register")
async def register_with_email(request: EmailRegisterRequest, response: Response):
    """Register new user with email/password"""
    # Check if email exists
    existing = await db.users.find_one({"email": request.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")
    
    now = datetime.now(timezone.utc)
    user_id = generate_user_id()
    
    # Create user
    user_doc = {
        "user_id": user_id,
        "email": request.email,
        "name": request.name,
        "picture": None,
        "auth_type": "email",
        "password_hash": hash_password(request.password),
        "is_premium": False,
        "premium_plan": None,
        "premium_expiry": None,
        "created_at": now.isoformat(),
        "last_login": now.isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = now + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": now.isoformat()
    })
    
    # Save profile if provided
    has_profile = False
    if request.profile and request.profile.consent_given:
        profile_doc = {
            "user_id": user_id,
            **request.profile.model_dump(),
            "consent_timestamp": now.isoformat(),
            "created_at": now.isoformat()
        }
        await db.user_profiles.insert_one(profile_doc)
        has_profile = True
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    logger.info(f"New email user registered: {request.email}")
    
    return {
        "success": True,
        "is_new_user": True,
        "has_profile": has_profile,
        "user": {
            "user_id": user_id,
            "email": request.email,
            "name": request.name,
            "is_premium": False
        }
    }

@router.post("/email/login")
async def login_with_email(request: EmailLoginRequest, response: Response):
    """Login with email/password"""
    user = await db.users.find_one(
        {"email": request.email, "auth_type": "email"},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    
    if user.get("password_hash") != hash_password(request.password):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    
    now = datetime.now(timezone.utc)
    
    # Update last login
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"last_login": now.isoformat()}}
    )
    
    # Create new session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = now + timedelta(days=7)
    
    await db.user_sessions.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": now.isoformat()
        }},
        upsert=True
    )
    
    # Get profile
    profile = await db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    has_profile = profile is not None and profile.get("consent_given", False)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "success": True,
        "has_profile": has_profile,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user.get("name"),
            "picture": user.get("picture"),
            "is_premium": user.get("is_premium", False)
        }
    }

@router.get("/me")
async def get_current_user_info(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    
    if not user:
        raise HTTPException(status_code=401, detail="Oturum gerekli")
    
    # Get profile
    profile = await db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user.get("name"),
        "picture": user.get("picture"),
        "is_premium": user.get("is_premium", False),
        "premium_plan": user.get("premium_plan"),
        "has_profile": profile is not None and profile.get("consent_given", False),
        "profile": profile
    }

@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"success": True, "message": "Çıkış yapıldı"}

@router.post("/onboarding")
async def complete_onboarding(request: Request, onboarding: OnboardingRequest):
    """Complete user onboarding with consciousness profile"""
    user = await get_current_user(request)
    
    if not user:
        raise HTTPException(status_code=401, detail="Oturum gerekli")
    
    now = datetime.now(timezone.utc)
    
    profile_doc = {
        "user_id": user["user_id"],
        "reason": onboarding.reason,
        "dominant_emotion": onboarding.dominant_emotion,
        "style_preference": onboarding.style_preference,
        "purpose": onboarding.purpose,
        "language": onboarding.language,
        "consent_given": onboarding.consent_given,
        "consent_timestamp": now.isoformat() if onboarding.consent_given else None,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    # Upsert profile
    await db.user_profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": profile_doc},
        upsert=True
    )
    
    logger.info(f"User onboarding completed: {user['user_id']}")
    
    return {
        "success": True,
        "message": "Bilinç profilin oluşturuldu",
        "profile": profile_doc
    }

@router.get("/sanri-context")
async def get_sanri_context(request: Request):
    """Get SANRI context for current user (used by SANRI endpoint)"""
    user = await get_current_user(request)
    
    if not user:
        return {"context": "", "has_profile": False}
    
    profile = await db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if not profile:
        return {"context": "", "has_profile": False}
    
    context = build_sanri_context(profile)
    
    return {
        "context": context,
        "has_profile": True,
        "user_id": user["user_id"],
        "style_preference": profile.get("style_preference"),
        "language": profile.get("language", "tr")
    }

# ============== SANRI WELCOME MESSAGE ==============

SANRI_WELCOME_TR = """Hoş geldin.
Buraya bir cevap için değil,
kendini hatırlamak için geldin.
Sorunu sormadan önce,
bir nefes al…"""

SANRI_WELCOME_EN = """Welcome.
You did not come for answers,
you came to remember yourself.
Before asking…
take one breath."""

@router.get("/sanri-welcome")
async def get_sanri_welcome(request: Request):
    """Get SANRI welcome message for new users"""
    user = await get_current_user(request)
    language = "tr"
    
    if user:
        profile = await db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
        if profile:
            language = profile.get("language", "tr")
    
    return {
        "message": SANRI_WELCOME_TR if language == "tr" else SANRI_WELCOME_EN,
        "language": language
    }
