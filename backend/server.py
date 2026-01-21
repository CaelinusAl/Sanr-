from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import json
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="CineCursor API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    thumbnail: str = ""
    style_guide: str = "cinematic"
    resolution: Dict[str, int] = {"width": 1920, "height": 1080}
    fps: int = 30
    total_duration: float = 0.0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    style_guide: str = "cinematic"

class Scene(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    name: str
    description: str = ""
    prompt: str = ""
    video_url: str = ""
    thumbnail: str = ""
    duration: float = 5.0
    start_time: float = 0.0
    track_index: int = 0
    order: int = 0
    status: str = "draft"  # draft, generating, ready, error
    render_progress: float = 0.0
    characters: List[str] = []
    effects: List[Dict[str, Any]] = []
    transitions: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SceneCreate(BaseModel):
    project_id: str
    name: str
    description: str = ""
    prompt: str = ""
    duration: float = 5.0
    start_time: float = 0.0
    track_index: int = 0
    characters: List[str] = []

class SceneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt: Optional[str] = None
    duration: Optional[float] = None
    start_time: Optional[float] = None
    track_index: Optional[int] = None
    order: Optional[int] = None
    status: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail: Optional[str] = None
    characters: Optional[List[str]] = None
    effects: Optional[List[Dict[str, Any]]] = None
    transitions: Optional[Dict[str, Any]] = None

class Character(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    name: str
    description: str = ""
    reference_images: List[str] = []
    costume: Dict[str, str] = {"default": "casual"}
    voice_profile: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CharacterCreate(BaseModel):
    project_id: str
    name: str
    description: str = ""
    reference_images: List[str] = []

class Asset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    type: str  # scene, character, audio, effect, image
    name: str
    path: str = ""
    thumbnail: str = ""
    duration: Optional[float] = None
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AssetCreate(BaseModel):
    project_id: str
    type: str
    name: str
    path: str = ""
    thumbnail: str = ""
    tags: List[str] = []

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    role: str  # user, assistant
    content: str
    scene_plan: Optional[Dict[str, Any]] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ChatRequest(BaseModel):
    project_id: str
    message: str

class TimelineExport(BaseModel):
    project_id: str
    format: str = "json"  # json, xml, edl

# ============ PROJECT ENDPOINTS ============

@api_router.get("/")
async def root():
    return {"message": "CineCursor API v1.0", "status": "operational"}

@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate):
    project = Project(
        name=input.name,
        description=input.description,
        style_guide=input.style_guide
    )
    doc = project.model_dump()
    await db.projects.insert_one(doc)
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, updates: Dict[str, Any]):
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.projects.update_one(
        {"id": project_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return project

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.scenes.delete_many({"project_id": project_id})
    await db.characters.delete_many({"project_id": project_id})
    await db.assets.delete_many({"project_id": project_id})
    await db.chat_messages.delete_many({"project_id": project_id})
    return {"status": "deleted"}

# ============ SCENE ENDPOINTS ============

@api_router.post("/scenes", response_model=Scene)
async def create_scene(input: SceneCreate):
    existing = await db.scenes.find({"project_id": input.project_id}).to_list(1000)
    max_order = max([s.get("order", 0) for s in existing], default=-1)
    
    scene = Scene(
        project_id=input.project_id,
        name=input.name,
        description=input.description,
        prompt=input.prompt,
        duration=input.duration,
        start_time=input.start_time,
        track_index=input.track_index,
        characters=input.characters,
        order=max_order + 1
    )
    doc = scene.model_dump()
    await db.scenes.insert_one(doc)
    
    await update_project_duration(input.project_id)
    return scene

@api_router.get("/projects/{project_id}/scenes", response_model=List[Scene])
async def get_project_scenes(project_id: str):
    scenes = await db.scenes.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("order", 1).to_list(1000)
    return scenes

@api_router.get("/scenes/{scene_id}", response_model=Scene)
async def get_scene(scene_id: str):
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    return scene

@api_router.put("/scenes/{scene_id}", response_model=Scene)
async def update_scene(scene_id: str, updates: SceneUpdate):
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.scenes.update_one(
        {"id": scene_id},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    await update_project_duration(scene["project_id"])
    return scene

@api_router.delete("/scenes/{scene_id}")
async def delete_scene(scene_id: str):
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    project_id = scene["project_id"]
    await db.scenes.delete_one({"id": scene_id})
    await update_project_duration(project_id)
    return {"status": "deleted"}

@api_router.post("/scenes/reorder")
async def reorder_scenes(scene_orders: List[Dict[str, Any]]):
    for item in scene_orders:
        await db.scenes.update_one(
            {"id": item["id"]},
            {"$set": {
                "order": item["order"],
                "start_time": item.get("start_time", 0),
                "track_index": item.get("track_index", 0),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    return {"status": "reordered"}

async def update_project_duration(project_id: str):
    scenes = await db.scenes.find({"project_id": project_id}).to_list(1000)
    if scenes:
        max_end = max([s.get("start_time", 0) + s.get("duration", 0) for s in scenes])
    else:
        max_end = 0
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"total_duration": max_end, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

# ============ CHARACTER ENDPOINTS ============

@api_router.post("/characters", response_model=Character)
async def create_character(input: CharacterCreate):
    character = Character(
        project_id=input.project_id,
        name=input.name,
        description=input.description,
        reference_images=input.reference_images
    )
    doc = character.model_dump()
    await db.characters.insert_one(doc)
    return character

@api_router.get("/projects/{project_id}/characters", response_model=List[Character])
async def get_project_characters(project_id: str):
    characters = await db.characters.find(
        {"project_id": project_id},
        {"_id": 0}
    ).to_list(100)
    return characters

@api_router.get("/characters/{character_id}", response_model=Character)
async def get_character(character_id: str):
    character = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character

@api_router.put("/characters/{character_id}", response_model=Character)
async def update_character(character_id: str, updates: Dict[str, Any]):
    result = await db.characters.update_one(
        {"id": character_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Character not found")
    character = await db.characters.find_one({"id": character_id}, {"_id": 0})
    return character

@api_router.delete("/characters/{character_id}")
async def delete_character(character_id: str):
    result = await db.characters.delete_one({"id": character_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Character not found")
    return {"status": "deleted"}

# ============ ASSET ENDPOINTS ============

@api_router.post("/assets", response_model=Asset)
async def create_asset(input: AssetCreate):
    asset = Asset(
        project_id=input.project_id,
        type=input.type,
        name=input.name,
        path=input.path,
        thumbnail=input.thumbnail,
        tags=input.tags
    )
    doc = asset.model_dump()
    await db.assets.insert_one(doc)
    return asset

@api_router.get("/projects/{project_id}/assets", response_model=List[Asset])
async def get_project_assets(project_id: str, asset_type: Optional[str] = None):
    query = {"project_id": project_id}
    if asset_type:
        query["type"] = asset_type
    assets = await db.assets.find(query, {"_id": 0}).to_list(500)
    return assets

@api_router.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str):
    result = await db.assets.delete_one({"id": asset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"status": "deleted"}

# ============ AI DIRECTOR CHAT ============

def get_ai_system_prompt(project: dict, characters: list, scenes: list) -> str:
    char_list = "\n".join([f"- {c['name']}: {c['description']}" for c in characters]) if characters else "No characters defined yet."
    scene_list = "\n".join([f"Scene {i+1}: {s['name']} ({s['duration']}s) - {s.get('description', 'No description')}" for i, s in enumerate(scenes)]) if scenes else "No scenes yet."
    
    return f"""You are the AI Director for CineCursor, a professional video production platform.

PROJECT: {project.get('name', 'Untitled')}
STYLE: {project.get('style_guide', 'cinematic')}

CHARACTERS:
{char_list}

EXISTING SCENES:
{scene_list}

YOUR ROLE:
- Help users plan and create professional video scenes
- Translate natural language into detailed scene generation prompts
- Ensure visual and narrative consistency across scenes
- Suggest improvements for pacing, composition, and storytelling

When user wants to create a scene, respond with a JSON scene plan:
```json
{{
  "action": "create_scene",
  "scene_plan": {{
    "name": "Scene Name",
    "description": "Brief description",
    "visual_prompt": "Detailed visual prompt for AI video generation",
    "audio_prompt": "Audio/music description",
    "camera_movement": "static|pan|tilt|dolly|zoom|handheld",
    "characters": ["character_id1"],
    "lighting": "natural_day|natural_night|indoor_soft|indoor_dramatic|golden_hour",
    "duration": 8,
    "continuity_notes": "How this connects to previous scenes"
  }}
}}
```

Be creative, professional, and helpful. Provide actionable suggestions."""

@api_router.post("/chat")
async def chat_with_director(request: ChatRequest):
    project = await db.projects.find_one({"id": request.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    characters = await db.characters.find({"project_id": request.project_id}, {"_id": 0}).to_list(100)
    scenes = await db.scenes.find({"project_id": request.project_id}, {"_id": 0}).sort("order", 1).to_list(100)
    
    system_prompt = get_ai_system_prompt(project, characters, scenes)
    
    history = await db.chat_messages.find(
        {"project_id": request.project_id}
    ).sort("created_at", 1).to_list(20)
    
    user_msg = ChatMessage(
        project_id=request.project_id,
        role="user",
        content=request.message
    )
    await db.chat_messages.insert_one(user_msg.model_dump())
    
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"cinecursor-{request.project_id}",
            system_message=system_prompt
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        scene_plan = None
        if "```json" in response:
            try:
                json_str = response.split("```json")[1].split("```")[0].strip()
                parsed = json.loads(json_str)
                if parsed.get("action") == "create_scene":
                    scene_plan = parsed.get("scene_plan")
            except:
                pass
        
        assistant_msg = ChatMessage(
            project_id=request.project_id,
            role="assistant",
            content=response,
            scene_plan=scene_plan
        )
        await db.chat_messages.insert_one(assistant_msg.model_dump())
        
        return {
            "message": response,
            "scene_plan": scene_plan,
            "id": assistant_msg.id
        }
        
    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@api_router.get("/projects/{project_id}/chat-history", response_model=List[ChatMessage])
async def get_chat_history(project_id: str):
    messages = await db.chat_messages.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return messages

@api_router.delete("/projects/{project_id}/chat-history")
async def clear_chat_history(project_id: str):
    await db.chat_messages.delete_many({"project_id": project_id})
    return {"status": "cleared"}

# ============ TIMELINE EXPORT ============

@api_router.post("/projects/{project_id}/export")
async def export_timeline(project_id: str, export_config: TimelineExport):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    scenes = await db.scenes.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("order", 1).to_list(1000)
    
    export_data = {
        "project": project,
        "scenes": scenes,
        "total_duration": project.get("total_duration", 0),
        "resolution": project.get("resolution", {"width": 1920, "height": 1080}),
        "fps": project.get("fps", 30),
        "exported_at": datetime.now(timezone.utc).isoformat()
    }
    
    if export_config.format == "json":
        return export_data
    else:
        return export_data

# ============ MOCK VIDEO GENERATION ============

@api_router.post("/scenes/{scene_id}/generate")
async def generate_scene_video(scene_id: str):
    """Mock video generation - simulates AI video generation process"""
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    await db.scenes.update_one(
        {"id": scene_id},
        {"$set": {"status": "generating", "render_progress": 0}}
    )
    
    mock_videos = [
        "https://images.pexels.com/photos/13812458/pexels-photo-13812458.jpeg",
        "https://images.pexels.com/photos/13226337/pexels-photo-13226337.jpeg",
        "https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg",
        "https://images.pexels.com/photos/13812380/pexels-photo-13812380.jpeg"
    ]
    
    import random
    video_url = random.choice(mock_videos)
    
    await db.scenes.update_one(
        {"id": scene_id},
        {"$set": {
            "status": "ready",
            "render_progress": 100,
            "video_url": video_url,
            "thumbnail": video_url,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "status": "ready",
        "video_url": video_url,
        "message": "Scene generated successfully (MOCKED - Real video generation requires Runway/Sora API)"
    }

# ============ CONTINUITY CHECK ============

@api_router.get("/projects/{project_id}/continuity-check")
async def check_continuity(project_id: str):
    """Check for continuity issues across scenes"""
    scenes = await db.scenes.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("order", 1).to_list(1000)
    
    issues = []
    
    for i in range(len(scenes) - 1):
        scene1 = scenes[i]
        scene2 = scenes[i + 1]
        
        chars1 = set(scene1.get("characters", []))
        chars2 = set(scene2.get("characters", []))
        appearing = chars2 - chars1
        disappearing = chars1 - chars2
        
        if appearing:
            issues.append({
                "type": "character_appears",
                "severity": "info",
                "scene1_id": scene1["id"],
                "scene2_id": scene2["id"],
                "message": f"Character(s) appear without introduction between Scene {i+1} and {i+2}",
                "characters": list(appearing)
            })
        
        if disappearing:
            issues.append({
                "type": "character_disappears",
                "severity": "warning",
                "scene1_id": scene1["id"],
                "scene2_id": scene2["id"],
                "message": f"Character(s) disappear without explanation between Scene {i+1} and {i+2}",
                "characters": list(disappearing)
            })
        
        gap = scene2.get("start_time", 0) - (scene1.get("start_time", 0) + scene1.get("duration", 0))
        if gap > 1:
            issues.append({
                "type": "timeline_gap",
                "severity": "warning",
                "scene1_id": scene1["id"],
                "scene2_id": scene2["id"],
                "message": f"Gap of {gap:.1f}s detected in timeline"
            })
        elif gap < -0.1:
            issues.append({
                "type": "timeline_overlap",
                "severity": "error",
                "scene1_id": scene1["id"],
                "scene2_id": scene2["id"],
                "message": f"Scenes overlap by {abs(gap):.1f}s"
            })
    
    return {
        "project_id": project_id,
        "total_issues": len(issues),
        "issues": issues
    }

# ============ APP SETUP ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
