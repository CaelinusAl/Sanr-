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
            "tr": "Uyanış",
            "en": "Awaken"
        },
        "display_name": {
            "tr": "Ücretsiz – Uyanış",
            "en": "Free – Awaken"
        },
        "description": {
            "tr": "Keşif ve bağlanma modu. Bilinç yolculuğuna ilk adım.",
            "en": "Discovery and bonding mode. First step to consciousness journey."
        },
        "price": {
            "tr": {"amount": 0, "currency": "TRY", "period": "month"},
            "en": {"amount": 0, "currency": "USD", "period": "month"}
        },
        "features": {
            "sanri_daily_limit": 3,
            "sanri_deep_analysis": False,
            "sanri_visual_analysis": False,
            "sanri_fate_layer": False,
            "consciousness_cards_limit": 6,
            "frequency_items_limit": 5,
            "ritual_micro": True,
            "ritual_deep": False,
            "ritual_neural_ecstasy": False,
            "book_112_full": False,
            "cities_full": False,
            "cities_sanri": False,
            "profile_mirror": False,
            "voice_sanri": False,
            "watermark": True
        },
        "order": 0
    },
    "soul": {
        "id": "soul",
        "name": {
            "tr": "Premium Ruh",
            "en": "Premium Soul"
        },
        "display_name": {
            "tr": "Premium Ruh",
            "en": "Premium Soul"
        },
        "description": {
            "tr": "Derin sembolik analiz. Bilinç ve frekans alanlarına tam erişim.",
            "en": "Deep symbolic analysis. Full access to consciousness and frequency fields."
        },
        "price": {
            "tr": {"amount": 199, "currency": "TRY", "period": "month"},
            "en": {"amount": 9.99, "currency": "USD", "period": "month"}
        },
        "features": {
            "sanri_daily_limit": -1,  # unlimited
            "sanri_deep_analysis": True,
            "sanri_visual_analysis": False,
            "sanri_fate_layer": False,
            "consciousness_cards_limit": -1,
            "frequency_items_limit": -1,
            "ritual_micro": True,
            "ritual_deep": True,
            "ritual_neural_ecstasy": False,
            "book_112_full": False,
            "cities_full": True,
            "cities_sanri": False,  # limited integration
            "profile_mirror": False,
            "voice_sanri": False,
            "watermark": False
        },
        "order": 1,
        "highlight": True,  # Main revenue tier
        "badge": {
            "tr": "En Popüler",
            "en": "Most Popular"
        }
    },
    "initiation": {
        "id": "initiation",
        "name": {
            "tr": "Premium İnisiyasyon",
            "en": "Premium Initiation"
        },
        "display_name": {
            "tr": "Premium İnisiyasyon",
            "en": "Premium Initiation"
        },
        "description": {
            "tr": "Kader katmanı ve matris okuması. Tam bilinç sistemi erişimi.",
            "en": "Fate layer and matrix reading. Full consciousness system access."
        },
        "price": {
            "tr": {"amount": 499, "currency": "TRY", "period": "month"},
            "en": {"amount": 24.99, "currency": "USD", "period": "month"}
        },
        "features": {
            "sanri_daily_limit": -1,
            "sanri_deep_analysis": True,
            "sanri_visual_analysis": True,
            "sanri_fate_layer": True,
            "consciousness_cards_limit": -1,
            "frequency_items_limit": -1,
            "ritual_micro": True,
            "ritual_deep": True,
            "ritual_neural_ecstasy": True,
            "book_112_full": True,
            "cities_full": True,
            "cities_sanri": True,
            "profile_mirror": True,
            "voice_sanri": True,
            "watermark": False
        },
        "order": 2
    },
    "oracle": {
        "id": "oracle",
        "name": {
            "tr": "Oracle Çemberi",
            "en": "Oracle Circle"
        },
        "display_name": {
            "tr": "Oracle / Master Modu",
            "en": "Oracle / Master Mode"
        },
        "description": {
            "tr": "Yalnızca davetlilere özel. Yüksek bilinç SANRI deneyimi.",
            "en": "Invitation only. High-consciousness SANRI experience."
        },
        "price": {
            "tr": {"amount": 9000, "currency": "TRY", "period": "year"},
            "en": {"amount": 499, "currency": "USD", "period": "year"}
        },
        "features": {
            "sanri_daily_limit": -1,
            "sanri_deep_analysis": True,
            "sanri_visual_analysis": True,
            "sanri_fate_layer": True,
            "sanri_high_consciousness": True,  # Special Oracle-only mode
            "sanri_timeline_analysis": True,
            "consciousness_cards_limit": -1,
            "frequency_items_limit": -1,
            "ritual_micro": True,
            "ritual_deep": True,
            "ritual_neural_ecstasy": True,
            "ritual_private_weekly": True,
            "book_112_full": True,
            "cities_full": True,
            "cities_sanri": True,
            "profile_mirror": True,
            "profile_consciousness_report": True,
            "voice_sanri": True,
            "voice_personalized": True,
            "watermark": False
        },
        "order": 3,
        "invite_only": True,
        "badge": {
            "tr": "Sadece Davetlilere",
            "en": "Invitation Only"
        }
    }
}

# Upgrade flow configuration (admin-configurable)
DEFAULT_UPGRADE_FLOW = {
    "soft_teaser_day": 3,
    "main_offer_day": 7,
    "initiation_preview_day": 3,  # After becoming Soul
    "oracle_teaser_day": 14,      # After becoming Initiation
    "messages": {
        "tr": {
            "soft_teaser": "Bilincin daha derin katmanlara açılmak istiyor...",
            "main_offer": "Bilincin daha derin katmanlara açılmaya hazır.",
            "initiation_preview": "İnisiyasyon kapısı senin için aralanıyor...",
            "oracle_teaser": "Bazı kapılar yalnızca davetle açılır."
        },
        "en": {
            "soft_teaser": "Your consciousness wants to open to deeper layers...",
            "main_offer": "Your consciousness is ready to open deeper layers.",
            "initiation_preview": "The initiation door is opening for you...",
            "oracle_teaser": "Some doors only open by invitation."
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
                "target_plan": "soul",
                "message": messages.get(language, messages["tr"]).get("main_offer")
            }
        elif days_since_signup >= flow_config.get("soft_teaser_day", 3):
            return {
                "type": "soft_teaser",
                "target_plan": "soul",
                "message": messages.get(language, messages["tr"]).get("soft_teaser")
            }
    
    # Soul user -> Initiation preview
    elif plan_type == "soul":
        # Calculate days since becoming Soul
        soul_started = user_data.get("plan_upgraded_at")
        if soul_started:
            try:
                soul_date = datetime.fromisoformat(soul_started.replace("Z", "+00:00"))
                days_as_soul = (datetime.now(timezone.utc) - soul_date).days
                if days_as_soul >= flow_config.get("initiation_preview_day", 3):
                    return {
                        "type": "initiation_preview",
                        "target_plan": "initiation",
                        "message": messages.get(language, messages["tr"]).get("initiation_preview")
                    }
            except:
                pass
    
    # Initiation user -> Oracle teaser
    elif plan_type == "initiation":
        init_started = user_data.get("plan_upgraded_at")
        if init_started:
            try:
                init_date = datetime.fromisoformat(init_started.replace("Z", "+00:00"))
                days_as_init = (datetime.now(timezone.utc) - init_date).days
                if days_as_init >= flow_config.get("oracle_teaser_day", 14):
                    return {
                        "type": "oracle_teaser",
                        "target_plan": "oracle",
                        "message": messages.get(language, messages["tr"]).get("oracle_teaser")
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
