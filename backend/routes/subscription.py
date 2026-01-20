# CAELINUS AI - Premium Subscription & Monetization System
# 4-Tier Consciousness Initiation Architecture
# Tiers: FREE (Awaken) | SOUL | INITIATION | ORACLE

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import Optional, Literal, List, Dict, Any
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscription", tags=["subscription"])

# Database reference
db: AsyncIOMotorDatabase = None

def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database

# ============== PLAN DEFINITIONS ==============

PlanType = Literal["free", "soul", "initiation", "oracle"]

# Plan configuration - prices and features
PLAN_CONFIG = {
    "free": {
        "id": "free",
        "name": {
            "tr": "Başlangıç",
            "en": "Observer"
        },
        "display_name": {
            "tr": "Başlangıç Kapısı",
            "en": "Begin Journey"
        },
        "description": {
            "tr": "İlk kapıdan geçtin. Keşfet ve hisset.",
            "en": "You have entered the first gate."
        },
        "price": {
            "tr": {"amount": 0, "currency": "TRY", "period": "month"},
            "en": {"amount": 0, "currency": "EUR", "period": "month"}
        },
        "features": {
            "sanri_daily_limit": 3,
            "sanri_preview_only": True,
            "sanri_deep_analysis": False,
            "sanri_visual_analysis": False,
            "sanri_fate_layer": False,
            "consciousness_cards_limit": 6,
            "frequency_items_limit": 5,
            "ritual_preview_only": True,
            "ritual_micro": True,
            "ritual_deep": False,
            "ritual_neural_ecstasy": False,
            "book_112_full": False,
            "cities_preview_only": True,
            "cities_full": False,
            "cities_sanri": False,
            "profile_mirror": False,
            "voice_sanri": False,
            "watermark": True
        },
        "order": 0
    },
    "initiation": {
        "id": "initiation",
        "name": {
            "tr": "İnisiye",
            "en": "Initiate"
        },
        "display_name": {
            "tr": "İnisiye – Hatırlayan",
            "en": "Initiate – The Remembering"
        },
        "description": {
            "tr": "Artık aramıyorsun. Hatırlıyorsun.",
            "en": "You are no longer searching. You are remembering."
        },
        "price": {
            "tr": {"amount": 149, "currency": "TRY", "period": "month"},
            "en": {"amount": 9.99, "currency": "EUR", "period": "month"}
        },
        "yearly_price": {
            "tr": {"amount": 1490, "currency": "TRY", "period": "year"},
            "en": {"amount": 99, "currency": "EUR", "period": "year"}
        },
        "features": {
            "sanri_daily_limit": -1,  # unlimited
            "sanri_preview_only": False,
            "sanri_deep_analysis": True,
            "sanri_visual_analysis": False,
            "sanri_fate_layer": False,
            "consciousness_cards_limit": -1,
            "frequency_items_limit": -1,
            "ritual_preview_only": False,
            "ritual_micro": True,
            "ritual_deep": True,
            "ritual_neural_ecstasy": False,
            "book_112_full": False,
            "cities_preview_only": False,
            "cities_full": True,
            "cities_sanri": False,
            "profile_mirror": True,
            "profile_history": True,
            "voice_sanri": False,
            "watermark": False
        },
        "order": 1,
        "highlight": True,
        "badge": {
            "tr": "Ana Katman",
            "en": "Core Tier"
        }
    },
    "soul": {
        "id": "soul",
        "name": {
            "tr": "Soul",
            "en": "Soul"
        },
        "display_name": {
            "tr": "Soul – Derin Bilinç",
            "en": "Soul Layer – Deep Work"
        },
        "description": {
            "tr": "Zaman, hafıza ve anlam artık birleşiyor.",
            "en": "Time, memory and meaning are now connected."
        },
        "price": {
            "tr": {"amount": 299, "currency": "TRY", "period": "month"},
            "en": {"amount": 24.99, "currency": "EUR", "period": "month"}
        },
        "yearly_price": {
            "tr": {"amount": 2990, "currency": "TRY", "period": "year"},
            "en": {"amount": 249, "currency": "EUR", "period": "year"}
        },
        "features": {
            "sanri_daily_limit": -1,
            "sanri_preview_only": False,
            "sanri_deep_analysis": True,
            "sanri_visual_analysis": True,
            "sanri_fate_layer": True,
            "sanri_timeline": True,
            "consciousness_cards_limit": -1,
            "frequency_items_limit": -1,
            "ritual_preview_only": False,
            "ritual_micro": True,
            "ritual_deep": True,
            "ritual_neural_ecstasy": True,
            "ritual_advanced": True,
            "book_112_full": True,
            "cities_preview_only": False,
            "cities_full": True,
            "cities_sanri": True,
            "cities_cycle_role": True,
            "profile_mirror": True,
            "profile_history": True,
            "profile_consciousness_map": True,
            "profile_growth_graph": True,
            "voice_sanri": True,
            "soul_weekly_message": True,
            "watermark": False
        },
        "order": 2,
        "badge": {
            "tr": "Derin Katman",
            "en": "Deep Layer"
        }
    },
    "oracle": {
        "id": "oracle",
        "name": {
            "tr": "Oracle",
            "en": "Oracle"
        },
        "display_name": {
            "tr": "Oracle – Sessiz Kapı",
            "en": "Oracle Access – Inner Circle"
        },
        "description": {
            "tr": "Bu kapı herkese açılmaz. Hazır olanlara açılır.",
            "en": "This layer is protected by invitation only. Some doors open only when you are seen."
        },
        "price": {
            "tr": {"amount": 6660, "currency": "TRY", "period": "access"},  # One-time access fee
            "en": {"amount": 333, "currency": "EUR", "period": "access"}
        },
        "maintenance_price": {
            "tr": {"amount": 699, "currency": "TRY", "period": "month"},
            "en": {"amount": 29, "currency": "EUR", "period": "month"}
        },
        "features": {
            "sanri_daily_limit": -1,
            "sanri_preview_only": False,
            "sanri_deep_analysis": True,
            "sanri_visual_analysis": True,
            "sanri_fate_layer": True,
            "sanri_timeline": True,
            "sanri_oracle_mode": True,
            "sanri_karmic_analysis": True,
            "sanri_collective_reading": True,
            "consciousness_cards_limit": -1,
            "frequency_items_limit": -1,
            "ritual_preview_only": False,
            "ritual_micro": True,
            "ritual_deep": True,
            "ritual_neural_ecstasy": True,
            "ritual_advanced": True,
            "ritual_high_frequency": True,
            "ritual_hidden": True,
            "book_112_full": True,
            "hidden_layer": True,
            "cities_preview_only": False,
            "cities_full": True,
            "cities_sanri": True,
            "cities_cycle_role": True,
            "cities_collective_mission": True,
            "profile_mirror": True,
            "profile_history": True,
            "profile_consciousness_map": True,
            "profile_growth_graph": True,
            "profile_fate_line": True,
            "voice_sanri": True,
            "voice_personalized": True,
            "oracle_weekly_message": True,
            "oracle_exclusive_texts": True,
            "watermark": False
        },
        "order": 3,
        "invite_only": True,
        "badge": {
            "tr": "Davetlilere Özel",
            "en": "Invitation Only"
        }
    }
}

# Upgrade flow configuration (admin-configurable)
DEFAULT_UPGRADE_FLOW = {
    "soft_teaser_day": 3,
    "main_offer_day": 7,
    "soul_preview_day": 10,  # Days after becoming Initiate
    "oracle_teaser_day": 14,  # Days after becoming Soul (never auto-offered)
    "messages": {
        "tr": {
            "soft_teaser": "Bazı katmanlar hâlâ senden gizli...",
            "main_offer": "İlk kapıya ulaştın. Bu noktanın ötesinde, hatırlama başlıyor.",
            "soul_preview": "Bilincin evrim geçiriyor. Daha derin bir katmana erişim açılıyor.",
            "oracle_teaser": "Bu katman yalnızca davet ile açılır. Bazı kapılar ancak görüldüğünde açılır."
        },
        "en": {
            "soft_teaser": "Some layers are still hidden from you...",
            "main_offer": "You have reached the first gate. Beyond this point, memory begins.",
            "soul_preview": "Your consciousness is evolving. A deeper layer is now accessible.",
            "oracle_teaser": "This layer is protected by invitation only. Some doors open only when you are seen."
        }
    },
    "popup_content": {
        "tr": {
            "initiate_title": "Gizli Katmanları Aç",
            "initiate_text": "Yalnızca yüzeyi gördün. Semboller düşündüğünden daha fazla hafıza taşıyor.",
            "initiate_button": "İnisiyasyona Gir",
            "soul_title": "Soul Katmanına Yüksel",
            "soul_text": "Yolculuğun artık doğrusal değil. Zaman, hafıza ve anlam artık bağlı.",
            "soul_button": "Soul Katmanına Gir",
            "oracle_title": "Oracle – Korunan Katman",
            "oracle_text": "Bu katman yalnızca davet ile korunur. Bazı kapılar ancak görüldüğünde açılır.",
            "oracle_button": "Davet Gerekli"
        },
        "en": {
            "initiate_title": "Unlock the Hidden Layers",
            "initiate_text": "You have only seen the surface. The symbols carry more memory than you think.",
            "initiate_button": "Enter Initiation",
            "soul_title": "Ascend to Soul Layer",
            "soul_text": "Your journey is no longer linear. Time, memory and meaning are now connected.",
            "soul_button": "Enter Soul Layer",
            "oracle_title": "Oracle – Protected Layer",
            "oracle_text": "This layer is protected by invitation only. Some doors open only when you are seen.",
            "oracle_button": "Invitation Required"
        }
    }
}


# ============== MODELS ==============

class SubscriptionStatus(BaseModel):
    user_id: str
    plan_type: PlanType = "free"
    plan_name: str
    premium_until: Optional[str] = None
    is_active: bool = True
    oracle_invited: bool = False
    oracle_invite_code: Optional[str] = None
    trial_started_at: Optional[str] = None
    days_since_signup: int = 0
    features: Dict[str, Any]
    upgrade_prompt: Optional[Dict[str, str]] = None

class PlanInfo(BaseModel):
    id: str
    name: Dict[str, str]
    display_name: Dict[str, str]
    description: Dict[str, str]
    price: Dict[str, Dict[str, Any]]
    features: Dict[str, Any]
    order: int
    highlight: bool = False
    invite_only: bool = False
    badge: Optional[Dict[str, str]] = None

class UpgradeRequest(BaseModel):
    target_plan: PlanType
    payment_method: Optional[str] = None  # For future: stripe, apple, google
    receipt_data: Optional[str] = None    # For store verification

class InviteCodeRequest(BaseModel):
    code: str

class AdminInviteRequest(BaseModel):
    user_id: str
    plan: Literal["initiation", "oracle"] = "oracle"
    duration_days: int = 365

class AdminCreateInviteCode(BaseModel):
    plan: Literal["initiation", "oracle"] = "oracle"
    max_uses: int = 1
    expires_in_days: int = 30
    note: Optional[str] = None

class FeatureGateResponse(BaseModel):
    allowed: bool
    current_plan: PlanType
    required_plan: PlanType
    feature: str
    usage_count: Optional[int] = None
    usage_limit: Optional[int] = None
    upgrade_message: Optional[Dict[str, str]] = None


# ============== HELPER FUNCTIONS ==============

def get_plan_features(plan_type: PlanType) -> Dict[str, Any]:
    """Get features for a plan type"""
    return PLAN_CONFIG.get(plan_type, PLAN_CONFIG["free"])["features"]

def check_feature_access(user_plan: PlanType, feature: str, required_plan: PlanType = None) -> bool:
    """Check if a plan has access to a specific feature"""
    features = get_plan_features(user_plan)
    
    # For boolean features
    if feature in features:
        value = features[feature]
        if isinstance(value, bool):
            return value
        if isinstance(value, int):
            return value != 0  # -1 means unlimited, >0 means has limit
    
    # For plan-level check
    if required_plan:
        plan_order = {"free": 0, "soul": 1, "initiation": 2, "oracle": 3}
        return plan_order.get(user_plan, 0) >= plan_order.get(required_plan, 0)
    
    return False

def get_feature_limit(user_plan: PlanType, feature: str) -> int:
    """Get numeric limit for a feature (-1 = unlimited)"""
    features = get_plan_features(user_plan)
    return features.get(feature, 0)

async def get_user_subscription(user_id: str) -> dict:
    """Get user's subscription data from database"""
    if db is None:
        return None
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return None
    
    return {
        "plan_type": user.get("plan_type", "free"),
        "premium_until": user.get("premium_until"),
        "oracle_invited": user.get("oracle_invited", False),
        "oracle_invite_code": user.get("oracle_invite_code"),
        "trial_started_at": user.get("trial_started_at"),
        "created_at": user.get("created_at")
    }

async def calculate_upgrade_prompt(user_id: str, user_data: dict, language: str = "tr") -> Optional[Dict[str, str]]:
    """Calculate if user should see upgrade prompt based on flow config"""
    if db is None:
        return None
    
    # Get upgrade flow config (from admin settings or default)
    settings = await db.settings.find_one({"key": "upgrade_flow"}, {"_id": 0})
    flow_config = settings.get("value", DEFAULT_UPGRADE_FLOW) if settings else DEFAULT_UPGRADE_FLOW
    
    plan_type = user_data.get("plan_type", "free")
    created_at_str = user_data.get("created_at")
    
    if not created_at_str:
        return None
    
    try:
        created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        days_since_signup = (datetime.now(timezone.utc) - created_at).days
    except:
        return None
    
    messages = flow_config.get("messages", DEFAULT_UPGRADE_FLOW["messages"])
    
    # Free user upgrade prompts
    if plan_type == "free":
        if days_since_signup >= flow_config.get("main_offer_day", 7):
            return {
                "type": "main_offer",
                "target_plan": "initiate",
                "message": messages.get(language, messages["tr"]).get("main_offer"),
                "blocking": False  # Non-blocking by default
            }
        elif days_since_signup >= flow_config.get("soft_teaser_day", 3):
            return {
                "type": "soft_teaser",
                "target_plan": "initiate",
                "message": messages.get(language, messages["tr"]).get("soft_teaser"),
                "blocking": False  # Soft hint only
            }
    
    # Initiate user -> Soul preview
    elif plan_type == "initiate":
        initiate_started = user_data.get("plan_upgraded_at")
        if initiate_started:
            try:
                start_date = datetime.fromisoformat(initiate_started.replace("Z", "+00:00"))
                days_as_initiate = (datetime.now(timezone.utc) - start_date).days
                if days_as_initiate >= flow_config.get("soul_preview_day", 10):
                    return {
                        "type": "soul_preview",
                        "target_plan": "soul",
                        "message": messages.get(language, messages["tr"]).get("soul_preview"),
                        "blocking": False
                    }
            except:
                pass
    
    # Soul user -> Oracle teaser (never auto-offered, just shown in UI)
    elif plan_type == "soul":
        soul_started = user_data.get("plan_upgraded_at")
        if soul_started:
            try:
                start_date = datetime.fromisoformat(soul_started.replace("Z", "+00:00"))
                days_as_soul = (datetime.now(timezone.utc) - start_date).days
                if days_as_soul >= flow_config.get("oracle_teaser_day", 14):
                    return {
                        "type": "oracle_teaser",
                        "target_plan": "oracle",
                        "message": messages.get(language, messages["tr"]).get("oracle_teaser"),
                        "blocking": False,
                        "invite_only": True  # Cannot upgrade without invite
                    }
            except:
                pass
    
    return None


# ============== ENDPOINTS ==============

@router.get("/plans", response_model=List[PlanInfo])
async def get_plans(language: str = "tr"):
    """Get all available subscription plans"""
    plans = []
    for plan_id, config in PLAN_CONFIG.items():
        plans.append(PlanInfo(
            id=config["id"],
            name=config["name"],
            display_name=config["display_name"],
            description=config["description"],
            price=config["price"],
            features=config["features"],
            order=config["order"],
            highlight=config.get("highlight", False),
            invite_only=config.get("invite_only", False),
            badge=config.get("badge")
        ))
    
    return sorted(plans, key=lambda x: x.order)

@router.get("/status")
async def get_subscription_status(request: Request, language: str = "tr"):
    """Get current user's subscription status"""
    # Get user from session/token
    user_id = request.cookies.get("user_id")
    if not user_id:
        # Return free plan status for anonymous users
        return SubscriptionStatus(
            user_id="anonymous",
            plan_type="free",
            plan_name=PLAN_CONFIG["free"]["display_name"].get(language, "Free – Awaken"),
            is_active=True,
            oracle_invited=False,
            days_since_signup=0,
            features=get_plan_features("free"),
            upgrade_prompt=None
        )
    
    # Get user subscription data
    sub_data = await get_user_subscription(user_id)
    if not sub_data:
        return SubscriptionStatus(
            user_id=user_id,
            plan_type="free",
            plan_name=PLAN_CONFIG["free"]["display_name"].get(language, "Free – Awaken"),
            is_active=True,
            oracle_invited=False,
            days_since_signup=0,
            features=get_plan_features("free"),
            upgrade_prompt=None
        )
    
    plan_type = sub_data.get("plan_type", "free")
    plan_config = PLAN_CONFIG.get(plan_type, PLAN_CONFIG["free"])
    
    # Check if premium is still active
    is_active = True
    premium_until = sub_data.get("premium_until")
    if premium_until and plan_type != "free":
        try:
            expiry = datetime.fromisoformat(premium_until.replace("Z", "+00:00"))
            is_active = expiry > datetime.now(timezone.utc)
            if not is_active:
                plan_type = "free"  # Expired, revert to free
        except:
            pass
    
    # Calculate days since signup
    days_since_signup = 0
    created_at = sub_data.get("created_at")
    if created_at:
        try:
            created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            days_since_signup = (datetime.now(timezone.utc) - created).days
        except:
            pass
    
    # Get upgrade prompt
    upgrade_prompt = await calculate_upgrade_prompt(user_id, sub_data, language)
    
    return SubscriptionStatus(
        user_id=user_id,
        plan_type=plan_type,
        plan_name=plan_config["display_name"].get(language, plan_config["display_name"]["en"]),
        premium_until=premium_until,
        is_active=is_active,
        oracle_invited=sub_data.get("oracle_invited", False),
        oracle_invite_code=sub_data.get("oracle_invite_code"),
        trial_started_at=sub_data.get("trial_started_at"),
        days_since_signup=days_since_signup,
        features=get_plan_features(plan_type),
        upgrade_prompt=upgrade_prompt
    )

@router.post("/upgrade")
async def upgrade_plan(request: Request, data: UpgradeRequest):
    """
    Upgrade user's subscription plan.
    NOTE: This is currently a MOCK implementation.
    Real payment verification will be added with Stripe/IAP integration.
    """
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    target_plan = data.target_plan
    
    # Oracle requires invitation
    if target_plan == "oracle":
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user or not user.get("oracle_invited"):
            raise HTTPException(status_code=403, detail="Oracle tier requires invitation")
    
    # Calculate premium expiry (1 month for soul/initiation, 1 year for oracle)
    if target_plan in ["soul", "initiation"]:
        expiry = datetime.now(timezone.utc) + timedelta(days=30)
    elif target_plan == "oracle":
        expiry = datetime.now(timezone.utc) + timedelta(days=365)
    else:
        expiry = None
    
    # Update user subscription
    update_data = {
        "plan_type": target_plan,
        "plan_upgraded_at": datetime.now(timezone.utc).isoformat(),
        "is_premium": target_plan != "free"
    }
    
    if expiry:
        update_data["premium_until"] = expiry.isoformat()
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    # Log subscription change
    await db.subscription_logs.insert_one({
        "user_id": user_id,
        "action": "upgrade",
        "from_plan": "free",  # Could track previous plan
        "to_plan": target_plan,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mock": True  # Flag as mock transaction
    })
    
    return {
        "success": True,
        "plan_type": target_plan,
        "premium_until": expiry.isoformat() if expiry else None,
        "message": {
            "tr": f"{PLAN_CONFIG[target_plan]['display_name']['tr']} planına yükseltildin!",
            "en": f"Upgraded to {PLAN_CONFIG[target_plan]['display_name']['en']}!"
        }
    }

@router.post("/redeem-invite")
async def redeem_invite_code(request: Request, data: InviteCodeRequest):
    """Redeem an invite code for Oracle or Initiation access"""
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    code = data.code.upper().strip()
    
    # Find invite code
    invite = await db.invite_codes.find_one({"code": code}, {"_id": 0})
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    # Check if expired
    if invite.get("expires_at"):
        try:
            expires = datetime.fromisoformat(invite["expires_at"].replace("Z", "+00:00"))
            if expires < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Invite code has expired")
        except ValueError:
            pass
    
    # Check uses remaining
    uses = invite.get("uses", 0)
    max_uses = invite.get("max_uses", 1)
    if uses >= max_uses:
        raise HTTPException(status_code=400, detail="Invite code has been fully used")
    
    # Check if user already used this code
    if user_id in invite.get("used_by", []):
        raise HTTPException(status_code=400, detail="You have already used this code")
    
    target_plan = invite.get("plan", "oracle")
    duration_days = invite.get("duration_days", 365)
    
    # Apply the invite
    expiry = datetime.now(timezone.utc) + timedelta(days=duration_days)
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "plan_type": target_plan,
            "premium_until": expiry.isoformat(),
            "is_premium": True,
            "oracle_invited": target_plan == "oracle",
            "oracle_invite_code": code if target_plan == "oracle" else None,
            "plan_upgraded_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update invite code usage
    await db.invite_codes.update_one(
        {"code": code},
        {
            "$inc": {"uses": 1},
            "$push": {"used_by": user_id}
        }
    )
    
    # Log
    await db.subscription_logs.insert_one({
        "user_id": user_id,
        "action": "redeem_invite",
        "to_plan": target_plan,
        "invite_code": code,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "plan_type": target_plan,
        "premium_until": expiry.isoformat(),
        "message": {
            "tr": f"Davet kodu kullanıldı! {PLAN_CONFIG[target_plan]['display_name']['tr']} aktif.",
            "en": f"Invite code redeemed! {PLAN_CONFIG[target_plan]['display_name']['en']} activated."
        }
    }

@router.post("/check-feature")
async def check_feature(request: Request, feature: str, required_plan: str = None):
    """Check if user has access to a specific feature"""
    user_id = request.cookies.get("user_id")
    user_plan = "free"
    usage_count = None
    usage_limit = None
    
    if user_id:
        sub_data = await get_user_subscription(user_id)
        if sub_data:
            user_plan = sub_data.get("plan_type", "free")
    
    # Get feature access
    allowed = check_feature_access(user_plan, feature, required_plan)
    
    # For limited features, get usage count
    if feature == "sanri_daily_limit":
        limit = get_feature_limit(user_plan, feature)
        if limit > 0 and user_id:
            # Count today's SANRI usage
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            count = await db.sanri_interactions.count_documents({
                "user_id": user_id,
                "timestamp": {"$gte": today_start.isoformat()}
            })
            usage_count = count
            usage_limit = limit
            allowed = count < limit
    
    # Determine required plan for upgrade message
    req_plan = required_plan or "soul"
    if feature in ["sanri_visual_analysis", "sanri_fate_layer", "ritual_neural_ecstasy", "book_112_full"]:
        req_plan = "initiation"
    elif feature in ["sanri_high_consciousness", "ritual_private_weekly", "profile_consciousness_report"]:
        req_plan = "oracle"
    
    upgrade_message = None
    if not allowed:
        upgrade_message = {
            "tr": f"Bu özellik için {PLAN_CONFIG[req_plan]['display_name']['tr']} gerekli.",
            "en": f"This feature requires {PLAN_CONFIG[req_plan]['display_name']['en']}."
        }
    
    return FeatureGateResponse(
        allowed=allowed,
        current_plan=user_plan,
        required_plan=req_plan,
        feature=feature,
        usage_count=usage_count,
        usage_limit=usage_limit,
        upgrade_message=upgrade_message
    )


# ============== ADMIN ENDPOINTS ==============

@router.post("/admin/invite-user")
async def admin_invite_user(request: Request, data: AdminInviteRequest):
    """Admin: Manually invite a user to a premium tier"""
    # Simple admin check (should use proper admin auth middleware in production)
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user_id = data.user_id
    plan = data.plan
    duration_days = data.duration_days
    
    # Check if user exists
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    expiry = datetime.now(timezone.utc) + timedelta(days=duration_days)
    
    # Update user
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "plan_type": plan,
            "premium_until": expiry.isoformat(),
            "is_premium": True,
            "oracle_invited": plan == "oracle",
            "plan_upgraded_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log
    await db.subscription_logs.insert_one({
        "user_id": user_id,
        "action": "admin_invite",
        "to_plan": plan,
        "duration_days": duration_days,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "user_id": user_id,
        "plan": plan,
        "premium_until": expiry.isoformat()
    }

@router.post("/admin/create-invite-code")
async def admin_create_invite_code(request: Request, data: AdminCreateInviteCode):
    """Admin: Create a new invite code"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Generate unique code
    code = f"CAELINUS-{secrets.token_hex(4).upper()}"
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=data.expires_in_days)
    
    invite_doc = {
        "code": code,
        "plan": data.plan,
        "max_uses": data.max_uses,
        "uses": 0,
        "used_by": [],
        "expires_at": expires_at.isoformat(),
        "note": data.note,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.invite_codes.insert_one(invite_doc)
    
    return {
        "success": True,
        "code": code,
        "plan": data.plan,
        "max_uses": data.max_uses,
        "expires_at": expires_at.isoformat()
    }

@router.get("/admin/invite-codes")
async def admin_list_invite_codes(request: Request):
    """Admin: List all invite codes"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    codes = await db.invite_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"codes": codes}

@router.put("/admin/upgrade-flow")
async def admin_update_upgrade_flow(request: Request, flow_config: dict):
    """Admin: Update upgrade flow configuration"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.settings.update_one(
        {"key": "upgrade_flow"},
        {"$set": {"key": "upgrade_flow", "value": flow_config}},
        upsert=True
    )
    
    return {"success": True, "flow_config": flow_config}

@router.get("/admin/upgrade-flow")
async def admin_get_upgrade_flow(request: Request):
    """Admin: Get current upgrade flow configuration"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    settings = await db.settings.find_one({"key": "upgrade_flow"}, {"_id": 0})
    return settings.get("value", DEFAULT_UPGRADE_FLOW) if settings else DEFAULT_UPGRADE_FLOW



@router.get("/admin/users-subscriptions")
async def admin_get_users_subscriptions(request: Request, skip: int = 0, limit: int = 50):
    """Admin: Get all users with their subscription status"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get users with subscription info
    pipeline = [
        {"$project": {
            "_id": 0,
            "user_id": 1,
            "email": 1,
            "name": 1,
            "plan_type": {"$ifNull": ["$plan_type", "free"]},
            "premium_until": 1,
            "oracle_invited": {"$ifNull": ["$oracle_invited", False]},
            "oracle_invite_code": 1,
            "plan_upgraded_at": 1,
            "created_at": 1,
            "is_premium": {"$ifNull": ["$is_premium", False]}
        }},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": limit}
    ]
    
    users = await db.users.aggregate(pipeline).to_list(limit)
    total = await db.users.count_documents({})
    
    # Count by plan
    plan_counts = {}
    for plan_id in PLAN_CONFIG.keys():
        count = await db.users.count_documents({"plan_type": plan_id})
        plan_counts[plan_id] = count
    
    # Free users (no plan_type field)
    free_count = await db.users.count_documents({"$or": [
        {"plan_type": {"$exists": False}},
        {"plan_type": "free"}
    ]})
    plan_counts["free"] = free_count
    
    return {
        "users": users,
        "total": total,
        "skip": skip,
        "limit": limit,
        "plan_counts": plan_counts
    }

@router.post("/admin/set-user-plan")
async def admin_set_user_plan(request: Request, user_id: str, plan_type: str, duration_days: int = 30):
    """Admin: Manually set a user's plan (upgrade or downgrade)"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if plan_type not in PLAN_CONFIG:
        raise HTTPException(status_code=400, detail=f"Invalid plan type: {plan_type}")
    
    # Check if user exists
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_plan = user.get("plan_type", "free")
    
    # Calculate expiry
    if plan_type == "free":
        expiry = None
        is_premium = False
    else:
        expiry = datetime.now(timezone.utc) + timedelta(days=duration_days)
        is_premium = True
    
    # Update user
    update_data = {
        "plan_type": plan_type,
        "is_premium": is_premium,
        "plan_upgraded_at": datetime.now(timezone.utc).isoformat()
    }
    
    if expiry:
        update_data["premium_until"] = expiry.isoformat()
    else:
        update_data["premium_until"] = None
    
    # Oracle-specific
    if plan_type == "oracle":
        update_data["oracle_invited"] = True
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    # Log the action
    await db.subscription_logs.insert_one({
        "user_id": user_id,
        "action": "admin_set_plan",
        "from_plan": old_plan,
        "to_plan": plan_type,
        "duration_days": duration_days,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "admin_action": True
    })
    
    return {
        "success": True,
        "user_id": user_id,
        "old_plan": old_plan,
        "new_plan": plan_type,
        "premium_until": expiry.isoformat() if expiry else None
    }

@router.post("/admin/activate-oracle")
async def admin_activate_oracle(request: Request, user_id: str, duration_days: int = 365):
    """Admin: Activate Oracle tier for a user (with invitation)"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if user exists
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    expiry = datetime.now(timezone.utc) + timedelta(days=duration_days)
    
    # Generate special Oracle invite code for this user
    oracle_code = f"ORACLE-{secrets.token_hex(4).upper()}"
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "plan_type": "oracle",
            "premium_until": expiry.isoformat(),
            "is_premium": True,
            "oracle_invited": True,
            "oracle_invite_code": oracle_code,
            "oracle_activated_at": datetime.now(timezone.utc).isoformat(),
            "plan_upgraded_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log
    await db.subscription_logs.insert_one({
        "user_id": user_id,
        "action": "admin_activate_oracle",
        "oracle_code": oracle_code,
        "duration_days": duration_days,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "user_id": user_id,
        "plan_type": "oracle",
        "oracle_code": oracle_code,
        "premium_until": expiry.isoformat()
    }

@router.delete("/admin/invite-code/{code}")
async def admin_delete_invite_code(request: Request, code: str):
    """Admin: Delete an invite code"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.invite_codes.delete_one({"code": code.upper()})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invite code not found")
    
    return {"success": True, "deleted_code": code}

@router.get("/admin/subscription-logs")
async def admin_get_subscription_logs(request: Request, user_id: str = None, limit: int = 100):
    """Admin: Get subscription activity logs"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    logs = await db.subscription_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    
    return {"logs": logs, "count": len(logs)}

@router.get("/admin/subscription-stats")
async def admin_get_subscription_stats(request: Request):
    """Admin: Get overall subscription statistics"""
    admin_token = request.cookies.get("admin_token")
    if not admin_token:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    
    # Count by plan
    plan_stats = {}
    for plan_id in PLAN_CONFIG.keys():
        if plan_id == "free":
            count = await db.users.count_documents({"$or": [
                {"plan_type": {"$exists": False}},
                {"plan_type": "free"}
            ]})
        else:
            count = await db.users.count_documents({"plan_type": plan_id})
        plan_stats[plan_id] = count
    
    # Active premium users (not expired)
    now = datetime.now(timezone.utc).isoformat()
    active_premium = await db.users.count_documents({
        "plan_type": {"$ne": "free"},
        "premium_until": {"$gt": now}
    })
    
    # Oracle invites
    oracle_invited = await db.users.count_documents({"oracle_invited": True})
    
    # Invite codes stats
    total_codes = await db.invite_codes.count_documents({})
    active_codes = await db.invite_codes.count_documents({
        "expires_at": {"$gt": now},
        "$expr": {"$lt": ["$uses", "$max_uses"]}
    })
    
    # Recent upgrades (last 7 days)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    recent_upgrades = await db.subscription_logs.count_documents({
        "action": {"$in": ["upgrade", "admin_set_plan", "redeem_invite"]},
        "timestamp": {"$gte": week_ago}
    })
    
    return {
        "total_users": total_users,
        "plan_distribution": plan_stats,
        "active_premium": active_premium,
        "oracle_invited": oracle_invited,
        "invite_codes": {
            "total": total_codes,
            "active": active_codes
        },
        "recent_upgrades_7d": recent_upgrades
    }
