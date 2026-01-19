# Admin Panel Models for Caelinus
# MongoDB Collections: rituals, chapters, bilinc_cards, frekans_cards, audit_logs, admin_settings

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# === ENUMS ===

class ContentStatus(str, Enum):
    DRAFT = "draft"
    REVIEW = "review"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Visibility(str, Enum):
    FREE = "free"
    PREMIUM = "premium"

class RitualType(str, Enum):
    BEYIN_KALP = "beyin-kalp"
    HIS = "his"
    KUNDALINI = "kundalini"
    YARATIM = "yaratim"
    EPIFIZ = "epifiz"
    KAPALI = "kapali"
    CUSTOM = "custom"

class AdminRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    MODERATOR = "moderator"
    ANALYST = "analyst"
    SUPPORT = "support"

# === RITUAL MODELS ===

class RitualStep(BaseModel):
    order: int
    phase: str  # açılış, nefes, ana, kapanış
    text: str
    duration: int = 6  # seconds
    breath_count: Optional[int] = None
    tts_script: Optional[str] = None  # Custom TTS text if different

class RitualCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    ritual_type: RitualType = RitualType.CUSTOM
    duration_minutes: int = 8
    difficulty: str = "orta"  # kolay, orta, derin
    intention: Optional[str] = None
    steps: List[RitualStep] = []
    opening_text: Optional[str] = None
    closing_text: Optional[str] = None
    tts_enabled: bool = True
    background_audio: Optional[str] = None
    tags: List[str] = []
    status: ContentStatus = ContentStatus.DRAFT
    visibility: Visibility = Visibility.FREE
    scheduled_publish: Optional[datetime] = None

class RitualUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    ritual_type: Optional[RitualType] = None
    duration_minutes: Optional[int] = None
    difficulty: Optional[str] = None
    intention: Optional[str] = None
    steps: Optional[List[RitualStep]] = None
    opening_text: Optional[str] = None
    closing_text: Optional[str] = None
    tts_enabled: Optional[bool] = None
    background_audio: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[ContentStatus] = None
    visibility: Optional[Visibility] = None
    scheduled_publish: Optional[datetime] = None

class RitualInDB(RitualCreate):
    id: str
    slug: str
    version: int = 1
    created_at: datetime
    updated_at: datetime
    created_by: str = "owner"
    published_at: Optional[datetime] = None

# === CHAPTER MODELS (Kitap Bölümleri) ===

class ChapterCreate(BaseModel):
    chapter_number: str  # XI, XII, etc.
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    content: str  # Markdown
    bilinc_note: Optional[str] = None  # Micro-text
    tts_script: Optional[str] = None
    cover_image: Optional[str] = None
    tags: List[str] = []
    status: ContentStatus = ContentStatus.DRAFT
    visibility: Visibility = Visibility.PREMIUM
    scheduled_publish: Optional[datetime] = None

class ChapterUpdate(BaseModel):
    chapter_number: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    bilinc_note: Optional[str] = None
    tts_script: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[ContentStatus] = None
    visibility: Optional[Visibility] = None
    scheduled_publish: Optional[datetime] = None

class ChapterInDB(ChapterCreate):
    id: str
    slug: str
    version: int = 1
    created_at: datetime
    updated_at: datetime
    created_by: str = "owner"
    published_at: Optional[datetime] = None

# === BILINC CARD MODELS ===

class BilincCardCreate(BaseModel):
    title: str
    micro_text: str  # 2-3 satır aktivasyon metni
    reflection_question: Optional[str] = None  # Kullanıcıya soru
    reading_duration: int = 30  # seconds
    series: str = "default"  # 12'li set adı
    order_in_series: int = 1
    tags: List[str] = []
    status: ContentStatus = ContentStatus.DRAFT
    visibility: Visibility = Visibility.FREE

class BilincCardUpdate(BaseModel):
    title: Optional[str] = None
    micro_text: Optional[str] = None
    reflection_question: Optional[str] = None
    reading_duration: Optional[int] = None
    series: Optional[str] = None
    order_in_series: Optional[int] = None
    tags: Optional[List[str]] = None
    status: Optional[ContentStatus] = None
    visibility: Optional[Visibility] = None

class BilincCardInDB(BilincCardCreate):
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime

# === FREKANS CARD MODELS ===

class FrekansCardCreate(BaseModel):
    frequency_name: str  # 963, 369, 47, etc.
    title: str
    description: str  # Ne işe yarar
    when_to_use: Optional[str] = None  # Ne zaman dinlenir
    caution: Optional[str] = None  # Dikkat uyarısı
    tempo: str = "yavaş"  # yavaş, orta, hızlı
    softness: str = "yumuşak"  # yumuşak, orta, güçlü
    tags: List[str] = []
    status: ContentStatus = ContentStatus.DRAFT
    visibility: Visibility = Visibility.FREE

class FrekansCardUpdate(BaseModel):
    frequency_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    when_to_use: Optional[str] = None
    caution: Optional[str] = None
    tempo: Optional[str] = None
    softness: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[ContentStatus] = None
    visibility: Optional[Visibility] = None

class FrekansCardInDB(FrekansCardCreate):
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime

# === SANRI PROMPT MODELS ===

class SanriPromptCreate(BaseModel):
    name: str  # dream, birthdate, news, symbol, mirror, ritual
    display_name: str
    system_prompt: str
    style_prompt: Optional[str] = None
    safety_prompt: Optional[str] = None
    response_format: Optional[str] = None
    is_active: bool = True
    is_production: bool = False  # staging vs prod

class SanriPromptUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    system_prompt: Optional[str] = None
    style_prompt: Optional[str] = None
    safety_prompt: Optional[str] = None
    response_format: Optional[str] = None
    is_active: Optional[bool] = None
    is_production: Optional[bool] = None

class SanriPromptInDB(SanriPromptCreate):
    id: str
    version: int = 1
    created_at: datetime
    updated_at: datetime
    deployed_at: Optional[datetime] = None

# === AUDIT LOG ===

class AuditLogEntry(BaseModel):
    id: str
    timestamp: datetime
    user: str
    action: str  # create, update, delete, publish, deploy
    entity_type: str  # ritual, chapter, bilinc_card, prompt
    entity_id: str
    entity_name: str
    changes: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None

# === ADMIN SETTINGS ===

class AdminSettings(BaseModel):
    maintenance_mode: bool = False
    premium_enabled: bool = True
    image_upload_enabled: bool = True
    news_reading_enabled: bool = True
    default_tts_voice: str = "nova"
    default_tts_model: str = "tts-1-hd"
    default_tts_speed: float = 0.85
    max_free_sanri_questions: int = 5
    max_premium_sanri_questions: int = 100

# === DASHBOARD STATS ===

class DashboardStats(BaseModel):
    active_users_today: int = 0
    premium_users: int = 0
    rituals_started_today: int = 0
    rituals_completed_today: int = 0
    sanri_questions_today: int = 0
    tts_minutes_today: float = 0
    error_rate: float = 0
    popular_content: List[Dict[str, Any]] = []
    trending_themes: List[str] = []
