# CAELINUS AI - Feature Gating Middleware
# Centralized access control for premium features

from fastapi import Request, HTTPException
from typing import Optional, Dict, Any, Callable
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Plan hierarchy (higher number = more access)
PLAN_HIERARCHY = {
    "free": 0,
    "soul": 1,
    "initiation": 2,
    "oracle": 3
}

# Feature to minimum plan mapping
FEATURE_REQUIREMENTS = {
    # SANRI Features
    "sanri_basic": "free",
    "sanri_unlimited": "soul",
    "sanri_deep_analysis": "soul",
    "sanri_visual_analysis": "initiation",
    "sanri_fate_layer": "initiation",
    "sanri_matrix_reading": "initiation",
    "sanri_high_consciousness": "oracle",
    "sanri_timeline_analysis": "oracle",
    
    # Consciousness Field
    "consciousness_basic": "free",  # First 6 cards
    "consciousness_full": "soul",
    
    # Frequency Field
    "frequency_basic": "free",  # First 5 items
    "frequency_full": "soul",
    
    # Ritual Space
    "ritual_micro": "free",
    "ritual_deep": "soul",
    "ritual_neural_ecstasy": "initiation",
    "ritual_book_112": "initiation",
    "ritual_private_weekly": "oracle",
    
    # Book 112
    "book_112_preview": "free",
    "book_112_full": "initiation",
    
    # Cities
    "cities_basic": "free",  # Limited list
    "cities_full": "soul",
    "cities_sanri_integration": "initiation",
    
    # Visual/Gorselin
    "visual_generate": "free",
    "visual_analyze": "initiation",
    "visual_no_watermark": "soul",
    
    # Profile & History
    "profile_mirror": "initiation",
    "profile_history": "initiation",
    "profile_consciousness_report": "oracle",
    
    # Voice
    "voice_sanri": "initiation",
    "voice_personalized": "oracle"
}

# Daily limits per plan
DAILY_LIMITS = {
    "free": {
        "sanri_questions": 3,
        "visual_generations": 1,
        "rituals": 2
    },
    "soul": {
        "sanri_questions": -1,  # unlimited
        "visual_generations": 5,
        "rituals": -1
    },
    "initiation": {
        "sanri_questions": -1,
        "visual_generations": -1,
        "rituals": -1
    },
    "oracle": {
        "sanri_questions": -1,
        "visual_generations": -1,
        "rituals": -1
    }
}

# Content limits per plan
CONTENT_LIMITS = {
    "free": {
        "consciousness_cards": 6,
        "frequency_items": 5,
        "cities_list": 20,  # Show first 20 cities
        "book_chapters": 2
    },
    "soul": {
        "consciousness_cards": -1,
        "frequency_items": -1,
        "cities_list": -1,
        "book_chapters": 5
    },
    "initiation": {
        "consciousness_cards": -1,
        "frequency_items": -1,
        "cities_list": -1,
        "book_chapters": -1
    },
    "oracle": {
        "consciousness_cards": -1,
        "frequency_items": -1,
        "cities_list": -1,
        "book_chapters": -1
    }
}


class FeatureGate:
    """
    Feature gating utility class for checking access permissions
    """
    
    @staticmethod
    def has_access(user_plan: str, feature: str) -> bool:
        """Check if a plan has access to a feature"""
        required_plan = FEATURE_REQUIREMENTS.get(feature)
        if not required_plan:
            return True  # Feature not in requirements = allowed
        
        user_level = PLAN_HIERARCHY.get(user_plan, 0)
        required_level = PLAN_HIERARCHY.get(required_plan, 0)
        
        return user_level >= required_level
    
    @staticmethod
    def get_required_plan(feature: str) -> str:
        """Get the minimum required plan for a feature"""
        return FEATURE_REQUIREMENTS.get(feature, "free")
    
    @staticmethod
    def get_daily_limit(user_plan: str, limit_type: str) -> int:
        """Get daily limit for a specific action (-1 = unlimited)"""
        plan_limits = DAILY_LIMITS.get(user_plan, DAILY_LIMITS["free"])
        return plan_limits.get(limit_type, 0)
    
    @staticmethod
    def get_content_limit(user_plan: str, content_type: str) -> int:
        """Get content limit for a specific type (-1 = unlimited)"""
        plan_limits = CONTENT_LIMITS.get(user_plan, CONTENT_LIMITS["free"])
        return plan_limits.get(content_type, 0)
    
    @staticmethod
    def check_and_respond(user_plan: str, feature: str, language: str = "tr") -> Dict[str, Any]:
        """
        Check access and return a standardized response
        Returns: {allowed, feature, current_plan, required_plan, upgrade_message}
        """
        allowed = FeatureGate.has_access(user_plan, feature)
        required_plan = FeatureGate.get_required_plan(feature)
        
        # Import here to avoid circular dependency
        from routes.subscription import PLAN_CONFIG
        
        upgrade_message = None
        if not allowed:
            plan_name_tr = PLAN_CONFIG.get(required_plan, {}).get("display_name", {}).get("tr", required_plan)
            plan_name_en = PLAN_CONFIG.get(required_plan, {}).get("display_name", {}).get("en", required_plan)
            
            upgrade_message = {
                "tr": f"Bu özellik için {plan_name_tr} gerekli.",
                "en": f"This feature requires {plan_name_en}."
            }
        
        return {
            "allowed": allowed,
            "feature": feature,
            "current_plan": user_plan,
            "required_plan": required_plan,
            "upgrade_message": upgrade_message
        }
    
    @staticmethod
    def apply_content_limit(items: list, user_plan: str, content_type: str) -> Dict[str, Any]:
        """
        Apply content limit to a list of items
        Returns: {items, total, shown, is_limited, upgrade_for_more}
        """
        limit = FeatureGate.get_content_limit(user_plan, content_type)
        total = len(items)
        
        if limit == -1 or limit >= total:
            return {
                "items": items,
                "total": total,
                "shown": total,
                "is_limited": False,
                "upgrade_for_more": False
            }
        
        return {
            "items": items[:limit],
            "total": total,
            "shown": limit,
            "is_limited": True,
            "upgrade_for_more": True,
            "locked_count": total - limit
        }


def require_feature(feature: str):
    """
    Decorator for FastAPI routes that require a specific feature.
    Usage: @require_feature("sanri_visual_analysis")
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, request: Request = None, **kwargs):
            # Get request from args if not in kwargs
            if request is None:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            if request is None:
                raise HTTPException(status_code=500, detail="Request object not found")
            
            # Get user plan from request
            user_plan = await get_user_plan_from_request(request)
            
            # Check access
            if not FeatureGate.has_access(user_plan, feature):
                required_plan = FeatureGate.get_required_plan(feature)
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "feature_locked",
                        "feature": feature,
                        "current_plan": user_plan,
                        "required_plan": required_plan,
                        "message": {
                            "tr": f"Bu özellik {required_plan} planı gerektirir.",
                            "en": f"This feature requires {required_plan} plan."
                        }
                    }
                )
            
            return await func(*args, request=request, **kwargs)
        
        return wrapper
    return decorator


def require_plan(min_plan: str):
    """
    Decorator for FastAPI routes that require a minimum plan level.
    Usage: @require_plan("initiation")
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, request: Request = None, **kwargs):
            if request is None:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            if request is None:
                raise HTTPException(status_code=500, detail="Request object not found")
            
            user_plan = await get_user_plan_from_request(request)
            user_level = PLAN_HIERARCHY.get(user_plan, 0)
            required_level = PLAN_HIERARCHY.get(min_plan, 0)
            
            if user_level < required_level:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "plan_required",
                        "current_plan": user_plan,
                        "required_plan": min_plan,
                        "message": {
                            "tr": f"Bu özellik için en az {min_plan} planı gerekli.",
                            "en": f"This feature requires at least {min_plan} plan."
                        }
                    }
                )
            
            return await func(*args, request=request, **kwargs)
        
        return wrapper
    return decorator


async def get_user_plan_from_request(request: Request) -> str:
    """
    Extract user's current plan from request.
    Checks cookies/session for user_id, then queries database.
    """
    user_id = request.cookies.get("user_id")
    
    if not user_id:
        return "free"
    
    # Get database from app state
    try:
        from server import db
        user = await db.users.find_one({"user_id": user_id}, {"plan_type": 1, "premium_until": 1})
        
        if not user:
            return "free"
        
        plan_type = user.get("plan_type", "free")
        
        # Check if premium is still active
        premium_until = user.get("premium_until")
        if premium_until and plan_type != "free":
            from datetime import datetime, timezone
            try:
                expiry = datetime.fromisoformat(premium_until.replace("Z", "+00:00"))
                if expiry < datetime.now(timezone.utc):
                    return "free"  # Expired
            except:
                pass
        
        return plan_type
        
    except Exception as e:
        logger.error(f"Error getting user plan: {e}")
        return "free"


# Export utilities
__all__ = [
    "FeatureGate",
    "require_feature",
    "require_plan",
    "get_user_plan_from_request",
    "PLAN_HIERARCHY",
    "FEATURE_REQUIREMENTS",
    "DAILY_LIMITS",
    "CONTENT_LIMITS"
]
