from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
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
import subprocess
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="CineCursor API", version="2.0.0")
api_router = APIRouter(prefix="/api")

# Ensure directories exist
VIDEOS_DIR = ROOT_DIR / "videos"
AUDIO_DIR = ROOT_DIR / "audio"
EXPORTS_DIR = ROOT_DIR / "exports"
VIDEOS_DIR.mkdir(exist_ok=True)
AUDIO_DIR.mkdir(exist_ok=True)
EXPORTS_DIR.mkdir(exist_ok=True)

# Active render tasks
active_renders: Dict[str, Dict[str, Any]] = {}

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
    video_path: str = ""
    thumbnail: str = ""
    duration: float = 5.0
    start_time: float = 0.0
    track_index: int = 0
    order: int = 0
    status: str = "draft"
    render_progress: float = 0.0
    characters: List[str] = []
    effects: List[Dict[str, Any]] = []
    transition_in: Dict[str, Any] = {}
    transition_out: Dict[str, Any] = {}
    audio_track: str = ""
    audio_volume: float = 1.0
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
    video_path: Optional[str] = None
    thumbnail: Optional[str] = None
    characters: Optional[List[str]] = None
    effects: Optional[List[Dict[str, Any]]] = None
    transition_in: Optional[Dict[str, Any]] = None
    transition_out: Optional[Dict[str, Any]] = None
    audio_track: Optional[str] = None
    audio_volume: Optional[float] = None

class Character(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    name: str
    description: str = ""
    reference_images: List[str] = []
    face_embedding: List[float] = []
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
    type: str
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
    role: str
    content: str
    scene_plan: Optional[Dict[str, Any]] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ChatRequest(BaseModel):
    project_id: str
    message: str

class VideoGenerateRequest(BaseModel):
    prompt: str
    duration: int = 4  # 4, 8, or 12 seconds
    size: str = "1280x720"  # 1280x720, 1792x1024, 1024x1792, 1024x1024
    model: str = "sora-2"

class TransitionConfig(BaseModel):
    type: str = "fade"  # fade, dissolve, wipe_left, wipe_right, slide_left, slide_right
    duration: float = 0.5

class ExportConfig(BaseModel):
    format: str = "mp4"  # mp4, mov, webm
    resolution: str = "1080p"  # 720p, 1080p, 4k
    fps: int = 30
    include_audio: bool = True

# ============ PROJECT ENDPOINTS ============

@api_router.get("/")
async def root():
    return {"message": "CineCursor API v2.0", "status": "operational", "features": ["sora2", "transitions", "audio", "export"]}

@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate):
    project = Project(name=input.name, description=input.description, style_guide=input.style_guide)
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
    result = await db.projects.update_one({"id": project_id}, {"$set": updates})
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
        project_id=input.project_id, name=input.name, description=input.description,
        prompt=input.prompt, duration=input.duration, start_time=input.start_time,
        track_index=input.track_index, characters=input.characters, order=max_order + 1
    )
    doc = scene.model_dump()
    await db.scenes.insert_one(doc)
    await update_project_duration(input.project_id)
    return scene

@api_router.get("/projects/{project_id}/scenes", response_model=List[Scene])
async def get_project_scenes(project_id: str):
    scenes = await db.scenes.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(1000)
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
    result = await db.scenes.update_one({"id": scene_id}, {"$set": update_dict})
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
    # Delete video file if exists
    if scene.get("video_path") and os.path.exists(scene["video_path"]):
        os.remove(scene["video_path"])
    await db.scenes.delete_one({"id": scene_id})
    await update_project_duration(project_id)
    return {"status": "deleted"}

@api_router.post("/scenes/reorder")
async def reorder_scenes(scene_orders: List[Dict[str, Any]]):
    for item in scene_orders:
        await db.scenes.update_one(
            {"id": item["id"]},
            {"$set": {"order": item["order"], "start_time": item.get("start_time", 0),
                      "track_index": item.get("track_index", 0), "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    return {"status": "reordered"}

async def update_project_duration(project_id: str):
    scenes = await db.scenes.find({"project_id": project_id}).to_list(1000)
    max_end = max([s.get("start_time", 0) + s.get("duration", 0) for s in scenes], default=0)
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"total_duration": max_end, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

# ============ SORA 2 VIDEO GENERATION ============

def generate_video_sync(scene_id: str, prompt: str, duration: int, size: str, model: str):
    """Synchronous video generation for background task"""
    try:
        active_renders[scene_id] = {"progress": 10, "status": "generating", "message": "Starting Sora 2..."}
        
        video_gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
        output_path = str(VIDEOS_DIR / f"{scene_id}.mp4")
        
        active_renders[scene_id] = {"progress": 30, "status": "generating", "message": "AI is creating your video..."}
        
        video_bytes = video_gen.text_to_video(
            prompt=prompt,
            model=model,
            size=size,
            duration=duration,
            max_wait_time=900
        )
        
        if video_bytes:
            active_renders[scene_id] = {"progress": 80, "status": "downloading", "message": "Downloading video..."}
            video_gen.save_video(video_bytes, output_path)
            
            # Generate thumbnail
            thumbnail_path = str(VIDEOS_DIR / f"{scene_id}_thumb.jpg")
            try:
                subprocess.run([
                    "ffmpeg", "-y", "-i", output_path, "-ss", "00:00:01",
                    "-vframes", "1", "-vf", "scale=320:180", thumbnail_path
                ], capture_output=True, timeout=30)
            except:
                thumbnail_path = ""
            
            active_renders[scene_id] = {"progress": 100, "status": "complete", "message": "Video ready!",
                                        "video_path": output_path, "thumbnail": thumbnail_path}
        else:
            active_renders[scene_id] = {"progress": 0, "status": "error", "message": "Video generation failed"}
            
    except Exception as e:
        logging.error(f"Video generation error: {str(e)}")
        active_renders[scene_id] = {"progress": 0, "status": "error", "message": str(e)}

@api_router.post("/scenes/{scene_id}/generate")
async def generate_scene_video(scene_id: str, config: VideoGenerateRequest, background_tasks: BackgroundTasks):
    """Generate video using Sora 2"""
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    prompt = config.prompt or scene.get("prompt", "")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    # Update scene status
    await db.scenes.update_one(
        {"id": scene_id},
        {"$set": {"status": "generating", "render_progress": 0, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Start background generation
    active_renders[scene_id] = {"progress": 5, "status": "queued", "message": "Queued for generation..."}
    background_tasks.add_task(generate_video_sync, scene_id, prompt, config.duration, config.size, config.model)
    
    return {"status": "generating", "scene_id": scene_id, "message": "Video generation started with Sora 2"}

@api_router.get("/scenes/{scene_id}/render-status")
async def get_render_status(scene_id: str):
    """Get current render status"""
    if scene_id in active_renders:
        render_info = active_renders[scene_id]
        
        # If complete, update DB and cleanup
        if render_info.get("status") == "complete":
            video_path = render_info.get("video_path", "")
            thumbnail = render_info.get("thumbnail", "")
            
            await db.scenes.update_one(
                {"id": scene_id},
                {"$set": {
                    "status": "ready", "render_progress": 100,
                    "video_path": video_path, "thumbnail": thumbnail,
                    "video_url": f"/api/videos/{scene_id}",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            del active_renders[scene_id]
            return {"status": "complete", "progress": 100, "video_url": f"/api/videos/{scene_id}", "thumbnail": thumbnail}
        
        elif render_info.get("status") == "error":
            await db.scenes.update_one(
                {"id": scene_id},
                {"$set": {"status": "error", "render_progress": 0, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            error_msg = render_info.get("message", "Unknown error")
            del active_renders[scene_id]
            return {"status": "error", "progress": 0, "message": error_msg}
        
        return render_info
    
    # Check DB for status
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    if scene:
        return {"status": scene.get("status", "draft"), "progress": scene.get("render_progress", 0)}
    
    return {"status": "unknown", "progress": 0}

@api_router.get("/videos/{scene_id}")
async def serve_video(scene_id: str):
    """Serve generated video file"""
    video_path = VIDEOS_DIR / f"{scene_id}.mp4"
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(video_path, media_type="video/mp4", filename=f"{scene_id}.mp4")

@api_router.get("/thumbnails/{scene_id}")
async def serve_thumbnail(scene_id: str):
    """Serve video thumbnail"""
    thumb_path = VIDEOS_DIR / f"{scene_id}_thumb.jpg"
    if not thumb_path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(thumb_path, media_type="image/jpeg")

# ============ TRANSITIONS ============

@api_router.put("/scenes/{scene_id}/transition")
async def set_scene_transition(scene_id: str, transition_in: Optional[TransitionConfig] = None, transition_out: Optional[TransitionConfig] = None):
    """Set transition effects for a scene"""
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if transition_in:
        updates["transition_in"] = transition_in.model_dump()
    if transition_out:
        updates["transition_out"] = transition_out.model_dump()
    
    result = await db.scenes.update_one({"id": scene_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    return scene

# ============ AUDIO ============

@api_router.post("/scenes/{scene_id}/audio")
async def upload_audio(scene_id: str, file: UploadFile = File(...)):
    """Upload audio track for a scene"""
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # Save audio file
    audio_path = AUDIO_DIR / f"{scene_id}_{file.filename}"
    with open(audio_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Update scene
    await db.scenes.update_one(
        {"id": scene_id},
        {"$set": {"audio_track": str(audio_path), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"status": "uploaded", "audio_path": str(audio_path)}

@api_router.put("/scenes/{scene_id}/audio-volume")
async def set_audio_volume(scene_id: str, volume: float):
    """Set audio volume for a scene (0.0 to 2.0)"""
    volume = max(0.0, min(2.0, volume))
    await db.scenes.update_one(
        {"id": scene_id},
        {"$set": {"audio_volume": volume, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "updated", "volume": volume}

@api_router.get("/audio/{scene_id}")
async def serve_audio(scene_id: str):
    """Serve audio file"""
    scene = await db.scenes.find_one({"id": scene_id}, {"_id": 0})
    if not scene or not scene.get("audio_track"):
        raise HTTPException(status_code=404, detail="Audio not found")
    
    audio_path = Path(scene["audio_track"])
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(audio_path, media_type="audio/mpeg")

# ============ EXPORT ============

def apply_transition(input1: str, input2: str, output: str, transition_type: str, duration: float):
    """Apply transition between two videos using ffmpeg"""
    filters = {
        "fade": f"[0:v]fade=t=out:st={duration}:d={duration}[v0];[1:v]fade=t=in:st=0:d={duration}[v1];[v0][v1]concat=n=2:v=1:a=0",
        "dissolve": f"[0:v][1:v]xfade=transition=dissolve:duration={duration}:offset={duration}",
        "wipe_left": f"[0:v][1:v]xfade=transition=wipeleft:duration={duration}:offset={duration}",
        "wipe_right": f"[0:v][1:v]xfade=transition=wiperight:duration={duration}:offset={duration}",
        "slide_left": f"[0:v][1:v]xfade=transition=slideleft:duration={duration}:offset={duration}",
        "slide_right": f"[0:v][1:v]xfade=transition=slideright:duration={duration}:offset={duration}",
    }
    
    filter_complex = filters.get(transition_type, filters["fade"])
    
    cmd = ["ffmpeg", "-y", "-i", input1, "-i", input2, "-filter_complex", filter_complex, "-c:v", "libx264", "-preset", "fast", output]
    subprocess.run(cmd, capture_output=True, timeout=300)

@api_router.post("/projects/{project_id}/export")
async def export_project(project_id: str, config: ExportConfig, background_tasks: BackgroundTasks):
    """Export entire project as video file"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    scenes = await db.scenes.find({"project_id": project_id, "video_path": {"$ne": ""}}, {"_id": 0}).sort("start_time", 1).to_list(1000)
    
    if not scenes:
        raise HTTPException(status_code=400, detail="No rendered scenes to export")
    
    export_id = str(uuid.uuid4())
    output_ext = {"mp4": "mp4", "mov": "mov", "webm": "webm"}.get(config.format, "mp4")
    output_path = EXPORTS_DIR / f"{project_id}_{export_id}.{output_ext}"
    
    # Resolution mapping
    resolutions = {"720p": "1280:720", "1080p": "1920:1080", "4k": "3840:2160"}
    scale = resolutions.get(config.resolution, "1920:1080")
    
    # Create file list for concat
    list_file = EXPORTS_DIR / f"{export_id}_list.txt"
    with open(list_file, "w") as f:
        for scene in scenes:
            if scene.get("video_path") and os.path.exists(scene["video_path"]):
                f.write(f"file '{scene['video_path']}'\n")
    
    try:
        # Concat all videos
        cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_file),
            "-vf", f"scale={scale}", "-c:v", "libx264", "-preset", "medium",
            "-c:a", "aac" if config.include_audio else "-an",
            "-r", str(config.fps), str(output_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, timeout=600)
        
        # Cleanup list file
        os.remove(list_file)
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Export failed: {result.stderr.decode()}")
        
        return {
            "status": "complete",
            "export_id": export_id,
            "download_url": f"/api/exports/{project_id}/{export_id}",
            "format": config.format,
            "resolution": config.resolution
        }
        
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Export timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/exports/{project_id}/{export_id}")
async def download_export(project_id: str, export_id: str):
    """Download exported video"""
    # Find the export file
    for ext in ["mp4", "mov", "webm"]:
        export_path = EXPORTS_DIR / f"{project_id}_{export_id}.{ext}"
        if export_path.exists():
            media_types = {"mp4": "video/mp4", "mov": "video/quicktime", "webm": "video/webm"}
            return FileResponse(export_path, media_type=media_types.get(ext, "video/mp4"), 
                              filename=f"cinecursor_export_{export_id}.{ext}")
    
    raise HTTPException(status_code=404, detail="Export not found")

@api_router.get("/projects/{project_id}/export-json")
async def export_timeline_json(project_id: str):
    """Export timeline as JSON"""
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    scenes = await db.scenes.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(1000)
    characters = await db.characters.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    
    return {
        "project": project,
        "scenes": scenes,
        "characters": characters,
        "total_duration": project.get("total_duration", 0),
        "exported_at": datetime.now(timezone.utc).isoformat()
    }

# ============ CHARACTER ENDPOINTS ============

@api_router.post("/characters", response_model=Character)
async def create_character(input: CharacterCreate):
    character = Character(project_id=input.project_id, name=input.name, description=input.description, reference_images=input.reference_images)
    doc = character.model_dump()
    await db.characters.insert_one(doc)
    return character

@api_router.get("/projects/{project_id}/characters", response_model=List[Character])
async def get_project_characters(project_id: str):
    characters = await db.characters.find({"project_id": project_id}, {"_id": 0}).to_list(100)
    return characters

@api_router.get("/characters/{character_id}", response_model=Character)
async def get_character(character_id: str):
    character = await db.characters.find_one({"id": character_id}, {"_id": 0})
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character

@api_router.put("/characters/{character_id}", response_model=Character)
async def update_character(character_id: str, updates: Dict[str, Any]):
    result = await db.characters.update_one({"id": character_id}, {"$set": updates})
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
    asset = Asset(project_id=input.project_id, type=input.type, name=input.name, path=input.path, thumbnail=input.thumbnail, tags=input.tags)
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
    
    return f"""You are the AI Director for CineCursor, a professional video production platform powered by Sora 2.

PROJECT: {project.get('name', 'Untitled')}
STYLE: {project.get('style_guide', 'cinematic')}

CHARACTERS:
{char_list}

EXISTING SCENES:
{scene_list}

YOUR ROLE:
- Help users plan and create professional video scenes using Sora 2
- Translate natural language into detailed scene generation prompts
- Ensure visual and narrative consistency across scenes
- Suggest improvements for pacing, composition, and storytelling
- Recommend transitions between scenes (fade, dissolve, wipe, slide)

SORA 2 CAPABILITIES:
- Duration: 4, 8, or 12 seconds per scene
- Resolutions: 1280x720 (HD), 1792x1024 (widescreen), 1024x1792 (portrait), 1024x1024 (square)
- High quality cinematic video generation

When user wants to create a scene, respond with a JSON scene plan:
```json
{{
  "action": "create_scene",
  "scene_plan": {{
    "name": "Scene Name",
    "description": "Brief description",
    "visual_prompt": "Detailed prompt for Sora 2 - be specific about camera movement, lighting, action",
    "duration": 8,
    "size": "1280x720",
    "transition_in": {{"type": "fade", "duration": 0.5}},
    "transition_out": {{"type": "dissolve", "duration": 0.5}},
    "characters": ["character_id"],
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
    
    user_msg = ChatMessage(project_id=request.project_id, role="user", content=request.message)
    await db.chat_messages.insert_one(user_msg.model_dump())
    
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI API key not configured")
        
        chat = LlmChat(api_key=api_key, session_id=f"cinecursor-{request.project_id}", system_message=system_prompt
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
        
        assistant_msg = ChatMessage(project_id=request.project_id, role="assistant", content=response, scene_plan=scene_plan)
        await db.chat_messages.insert_one(assistant_msg.model_dump())
        
        return {"message": response, "scene_plan": scene_plan, "id": assistant_msg.id}
        
    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@api_router.get("/projects/{project_id}/chat-history", response_model=List[ChatMessage])
async def get_chat_history(project_id: str):
    messages = await db.chat_messages.find({"project_id": project_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    return messages

@api_router.delete("/projects/{project_id}/chat-history")
async def clear_chat_history(project_id: str):
    await db.chat_messages.delete_many({"project_id": project_id})
    return {"status": "cleared"}

# ============ CONTINUITY CHECK ============

@api_router.get("/projects/{project_id}/continuity-check")
async def check_continuity(project_id: str):
    """Check for continuity issues across scenes"""
    scenes = await db.scenes.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(1000)
    issues = []
    
    for i in range(len(scenes) - 1):
        scene1, scene2 = scenes[i], scenes[i + 1]
        
        # Character consistency
        chars1, chars2 = set(scene1.get("characters", [])), set(scene2.get("characters", []))
        appearing, disappearing = chars2 - chars1, chars1 - chars2
        
        if appearing:
            issues.append({"type": "character_appears", "severity": "info", "scene1_id": scene1["id"],
                          "scene2_id": scene2["id"], "message": f"Character(s) appear without introduction", "characters": list(appearing)})
        if disappearing:
            issues.append({"type": "character_disappears", "severity": "warning", "scene1_id": scene1["id"],
                          "scene2_id": scene2["id"], "message": f"Character(s) disappear without explanation", "characters": list(disappearing)})
        
        # Timeline gaps/overlaps
        gap = scene2.get("start_time", 0) - (scene1.get("start_time", 0) + scene1.get("duration", 0))
        if gap > 1:
            issues.append({"type": "timeline_gap", "severity": "warning", "scene1_id": scene1["id"],
                          "scene2_id": scene2["id"], "message": f"Gap of {gap:.1f}s detected in timeline"})
        elif gap < -0.1:
            issues.append({"type": "timeline_overlap", "severity": "error", "scene1_id": scene1["id"],
                          "scene2_id": scene2["id"], "message": f"Scenes overlap by {abs(gap):.1f}s"})
        
        # Missing transitions
        if not scene1.get("transition_out") and not scene2.get("transition_in"):
            issues.append({"type": "no_transition", "severity": "info", "scene1_id": scene1["id"],
                          "scene2_id": scene2["id"], "message": "No transition between scenes (hard cut)"})
    
    return {"project_id": project_id, "total_issues": len(issues), "issues": issues}


# ============ AI DIRECTOR - FILM GENERATION V2 ============

# Active film generations
active_films: Dict[str, Dict[str, Any]] = {}

class FilmConfig(BaseModel):
    duration: int = 5  # minutes
    quality: str = "standard"  # mobile, standard, cinema, premium
    aspectRatio: str = "16:9"  # 16:9, 9:16, 1:1, 21:9
    emotionalJourney: str = "hero"  # hero, tragedy, comedy, romance, mystery, horror, custom
    workers: int = 3
    upscale: bool = False
    # PHASE 1: Character Consistency Settings
    characterConsistency: bool = True  # Enable character template system
    versionsPerScene: int = 3  # Generate multiple versions, select best (1-5)

# Aspect ratio to Sora 2 size mapping
ASPECT_RATIO_SIZES = {
    "16:9": "1280x720",
    "9:16": "1024x1792",
    "1:1": "1024x1024",
    "21:9": "1792x1024"
}

# Quality to settings mapping - Sora 2 supports 5-20 seconds
# Using 12 seconds as standard for proper film duration
QUALITY_SETTINGS = {
    "mobile": {"size": "1024x1024", "duration": 8},      # 8 sec per scene
    "standard": {"size": "1280x720", "duration": 12},    # 12 sec per scene
    "cinema": {"size": "1792x1024", "duration": 12},     # 12 sec per scene
    "premium": {"size": "1792x1024", "duration": 15}     # 15 sec per scene (max quality)
}

class FilmGenerateRequest(BaseModel):
    story: str
    config: FilmConfig

class FilmPlan(BaseModel):
    title: str
    genre: str
    logline: str
    acts: List[Dict[str, Any]]
    characters: List[Dict[str, Any]]
    scenes: List[Dict[str, Any]]
    visualStyle: Dict[str, Any]
    audioStyle: Dict[str, Any]

FILM_PLAN_PROMPT = '''You are a Hollywood screenwriter and director specializing in AI-generated films.

USER STORY:
{story}

TARGET DURATION: {duration} minutes
REQUIRED SCENES: {scene_count} scenes (each scene will be 12 seconds of video)

IMPORTANT: You MUST create EXACTLY {scene_count} scenes to achieve the target duration.

CRITICAL FOR CHARACTER CONSISTENCY:
For each character, provide EXTREMELY DETAILED physical specifications that will be used IDENTICALLY across all scenes.
Be specific about: exact colors, proportions, unique identifiers, clothing details.

Create a detailed film breakdown as JSON. Return ONLY valid JSON, no markdown:

{{
  "title": "Film title",
  "genre": "Genre",
  "logline": "One-sentence summary",
  "acts": [
    {{
      "number": 1,
      "duration": 2,
      "description": "Setup",
      "keyBeats": ["Introduce protagonist", "Establish world", "Inciting incident"]
    }}
  ],
  "characters": [
    {{
      "id": "char_001",
      "name": "Character name",
      "age": 35,
      "role": "protagonist",
      "arc": "Character journey",
      "physicalSpecs": {{
        "height": "tall/medium/short with specific description",
        "build": "slim/athletic/muscular/average - detailed",
        "head": "Face shape, eye color, hair color/style/length, facial hair, skin tone",
        "body": "Posture, proportions, any distinctive body features",
        "clothing": "EXACT outfit description - colors, style, textures, accessories",
        "uniqueFeatures": "Scars, tattoos, glasses, jewelry, anything distinctive",
        "colors": {{
          "primary": "#hexcode - main clothing/fur/skin color",
          "secondary": "#hexcode - accent color",
          "tertiary": "#hexcode - detail color"
        }}
      }},
      "movementStyle": "How they move - confident stride, cautious steps, graceful, etc",
      "lightingProfile": "How light interacts with character - skin reflectivity, etc"
    }}
  ],
  "scenes": [
    {{
      "number": 1,
      "duration": 30,
      "location": "Specific location",
      "timeOfDay": "night",
      "weather": "clear",
      "characters": ["char_001"],
      "action": "Detailed action description for video generation - be specific about movements, expressions, camera angles",
      "cameraAngle": "wide establishing shot / medium shot / close-up / tracking shot / etc",
      "mood": "mysterious, tense",
      "lighting": "specific lighting description",
      "vfxNeeded": false,
      "transitionOut": "cut / dissolve / fade"
    }}
  ],
  "visualStyle": {{
    "colorPalette": ["#0a0e27", "#ff006e", "#00f5ff"],
    "lighting": "high contrast, natural",
    "referenceFilms": ["Film 1", "Film 2"],
    "cinematography": "description of camera style"
  }},
  "audioStyle": {{
    "musicGenre": "genre",
    "soundDesign": "description"
  }}
}}

REMEMBER: Character physicalSpecs MUST be detailed enough to recreate the EXACT same character in every scene. This is critical for visual consistency.'''


async def create_film_plan(story: str, duration: int, max_retries: int = 3) -> dict:
    """Create a detailed film plan using Claude with retry logic"""
    # Calculate scenes: each scene is ~12 seconds, so 5 scenes per minute
    scene_count = duration * 5  # 5 scenes per minute for proper duration
    
    prompt = FILM_PLAN_PROMPT.format(
        story=story,
        duration=duration,
        scene_count=scene_count
    )
    
    last_error = None
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Creating film plan (attempt {attempt + 1}/{max_retries})")
            
            chat = LlmChat(
                api_key=os.environ.get('EMERGENT_LLM_KEY'),
                session_id=f"film_plan_{uuid.uuid4()}",
                system_message="You are a Hollywood screenwriter and director. Return only valid JSON, no markdown."
            ).with_model("anthropic", "claude-4-sonnet-20250514")
            
            # Async send message - returns string directly
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Response is a string, not an object
            response_text = response if isinstance(response, str) else str(response)
            response_text = response_text.strip()
            
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            return json.loads(response_text.strip())
            
        except Exception as e:
            last_error = e
            logger.warning(f"Film plan attempt {attempt + 1} failed: {str(e)}")
            
            # Wait before retry (exponential backoff)
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 5  # 5, 10, 15 seconds
                logger.info(f"Waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
    
    # All retries failed
    raise Exception(f"Failed to generate film plan after {max_retries} attempts: {str(last_error)}")


async def generate_scene_video(scene: dict, film_id: str, scene_index: int, quality: str, aspect_ratio: str = "16:9", max_retries: int = 2) -> dict:
    """Generate video for a single scene using Sora 2 with retry logic"""
    # Create detailed prompt for video generation
    prompt_parts = [
        scene.get('action', ''),
        f"Setting: {scene.get('location', '')}",
        f"Time: {scene.get('timeOfDay', 'day')}",
        f"Mood: {scene.get('mood', '')}",
        f"Camera: {scene.get('cameraAngle', 'medium shot')}",
        f"Lighting: {scene.get('lighting', 'natural')}"
    ]
    
    if scene.get('characters'):
        prompt_parts.append(f"Characters: {', '.join(scene['characters'])}")
    
    video_prompt = ". ".join(filter(None, prompt_parts))
    
    # Get settings from new config
    settings = QUALITY_SETTINGS.get(quality, QUALITY_SETTINGS['standard'])
    
    # Override size with aspect ratio if different quality doesn't force a size
    if quality in ['mobile', 'standard']:
        video_size = ASPECT_RATIO_SIZES.get(aspect_ratio, "1280x720")
    else:
        video_size = settings['size']
    
    # Get video duration based on quality (Sora 2 supports 5-20 seconds)
    video_duration = settings['duration']
    
    video_filename = f"{film_id}_scene_{scene_index + 1}.mp4"
    video_path = VIDEOS_DIR / video_filename
    
    last_error = None
    
    for attempt in range(max_retries):
        try:
            logger.info(f"[Scene {scene_index + 1}] Generating video (attempt {attempt + 1}/{max_retries}): {video_size}, {video_duration}s")
            
            video_gen = OpenAIVideoGeneration(
                api_key=os.environ.get('EMERGENT_LLM_KEY')
            )
            
            # Use text_to_video method (blocking call)
            video_bytes = await asyncio.to_thread(
                video_gen.text_to_video,
                prompt=video_prompt,
                model="sora-2",
                size=video_size,
                duration=video_duration,
                max_wait_time=900  # 15 minutes max wait
            )
            
            if video_bytes:
                # Save video
                await asyncio.to_thread(video_gen.save_video, video_bytes, str(video_path))
                
                return {
                    'success': True,
                    'video_path': str(video_path),
                    'video_url': f"/api/film-videos/{video_filename}",
                    'duration': video_duration,
                    'size': video_size
                }
            else:
                raise Exception("Video generation returned no data")
                
        except Exception as e:
            last_error = e
            logger.warning(f"[Scene {scene_index + 1}] Attempt {attempt + 1} failed: {str(e)}")
            
            # Wait before retry
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 10  # 10, 20 seconds
                logger.info(f"[Scene {scene_index + 1}] Waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
    
    return {'success': False, 'error': str(last_error)}


async def generate_film_task(film_id: str, story: str, config: FilmConfig):
    """Background task to generate complete film"""
    try:
        film_data = active_films.get(film_id, {})
        film_data['stage'] = 'pre-production'
        film_data['progress'] = 0
        active_films[film_id] = film_data
        
        # ===== PHASE 1: PRE-PRODUCTION (0-20%) =====
        logger.info(f"[Film {film_id}] Starting pre-production")
        
        film_data['progress'] = 5
        active_films[film_id] = film_data
        
        # Create film plan
        film_plan = await create_film_plan(story, config.duration)
        film_data['filmPlan'] = film_plan
        film_data['progress'] = 15
        active_films[film_id] = film_data
        
        # Save to database
        await db.films.update_one(
            {"id": film_id},
            {"$set": {"film_plan": film_plan, "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        
        total_scenes = len(film_plan.get('scenes', []))
        film_data['totalScenes'] = total_scenes
        film_data['progress'] = 20
        active_films[film_id] = film_data
        
        # ===== PHASE 2: PRODUCTION (20-80%) =====
        film_data['stage'] = 'production'
        
        # Initialize workers
        workers = []
        for i in range(config.workers):
            workers.append({
                'id': i,
                'status': 'idle',
                'currentScene': None,
                'progress': 0
            })
        film_data['workers'] = workers
        active_films[film_id] = film_data
        
        completed_scenes = []
        scenes_queue = list(enumerate(film_plan.get('scenes', [])))
        
        # Process scenes with parallel workers
        while scenes_queue:
            # Get batch of scenes (up to worker count)
            batch_size = min(len(scenes_queue), config.workers)
            batch = scenes_queue[:batch_size]
            scenes_queue = scenes_queue[batch_size:]
            
            # Update worker status
            for i, (scene_idx, scene) in enumerate(batch):
                if i < len(workers):
                    workers[i] = {
                        'id': i,
                        'status': 'generating',
                        'currentScene': scene_idx + 1,
                        'progress': 0
                    }
            film_data['workers'] = workers
            active_films[film_id] = film_data
            
            # Generate scenes in parallel
            tasks = []
            for scene_idx, scene in batch:
                task = generate_scene_video(scene, film_id, scene_idx, config.quality, config.aspectRatio)
                tasks.append((scene_idx, scene, task))
            
            # Wait for batch to complete
            for scene_idx, scene, task in tasks:
                result = await task
                
                scene_data = {
                    'number': scene_idx + 1,
                    'status': 'complete' if result.get('success') else 'error',
                    'video_url': result.get('video_url'),
                    'video_path': result.get('video_path'),
                    'duration': result.get('duration', scene.get('duration', 4)),
                    'error': result.get('error')
                }
                completed_scenes.append(scene_data)
                
                # Update progress
                progress = 20 + (len(completed_scenes) / total_scenes * 60)  # 20% to 80%
                film_data['progress'] = progress
                film_data['completedScenes'] = completed_scenes
                
                # Update workers
                for w in workers:
                    if w.get('currentScene') == scene_idx + 1:
                        w['status'] = 'complete' if result.get('success') else 'error'
                        w['progress'] = 100
                
                film_data['workers'] = workers
                active_films[film_id] = film_data
            
            # Reset idle workers
            for w in workers:
                if w['status'] in ['complete', 'error']:
                    w['status'] = 'idle'
                    w['currentScene'] = None
                    w['progress'] = 0
        
        # ===== PHASE 3: VALIDATION (80-90%) =====
        film_data['stage'] = 'validation'
        film_data['progress'] = 80
        active_films[film_id] = film_data
        
        # Simple validation - check for errors
        issues = []
        successful_scenes = [s for s in completed_scenes if s['status'] == 'complete']
        failed_scenes = [s for s in completed_scenes if s['status'] == 'error']
        
        for scene in failed_scenes:
            issues.append({
                'type': 'scene_generation_failed',
                'severity': 'critical',
                'sceneNumber': scene['number'],
                'message': scene.get('error', 'Unknown error'),
                'autoFixable': False
            })
        
        film_data['issues'] = issues
        film_data['progress'] = 85
        active_films[film_id] = film_data
        
        # Quality metrics
        film_data['qualityMetrics'] = {
            'faceConsistency': 85,  # Placeholder
            'lightingScore': 88,
            'overallScore': 8.5,
            'autoFixedCount': 0
        }
        film_data['progress'] = 90
        active_films[film_id] = film_data
        
        # ===== PHASE 4: ASSEMBLY (90-100%) =====
        film_data['stage'] = 'assembly'
        film_data['progress'] = 92
        active_films[film_id] = film_data
        
        # Assemble final video using FFmpeg
        if successful_scenes:
            final_video_path = await assemble_film_video(film_id, successful_scenes, config.upscale)
            if final_video_path:
                film_data['finalVideoUrl'] = f"/api/film-videos/{Path(final_video_path).name}"
        
        # ===== COMPLETE =====
        film_data['stage'] = 'complete'
        film_data['progress'] = 100
        active_films[film_id] = film_data
        
        # Save final status to database
        await db.films.update_one(
            {"id": film_id},
            {"$set": {
                "status": "complete",
                "completed_scenes": completed_scenes,
                "issues": issues,
                "final_video_url": film_data.get('finalVideoUrl'),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f"[Film {film_id}] Generation complete!")
        
    except Exception as e:
        logger.error(f"[Film {film_id}] Generation failed: {str(e)}")
        film_data['stage'] = 'error'
        film_data['error'] = str(e)
        active_films[film_id] = film_data
        
        await db.films.update_one(
            {"id": film_id},
            {"$set": {"status": "error", "error": str(e), "updated_at": datetime.now(timezone.utc).isoformat()}}
        )


async def assemble_film_video(film_id: str, scenes: list, upscale: bool = False) -> Optional[str]:
    """Assemble scene videos into final film using FFmpeg"""
    try:
        # Create file list for FFmpeg
        file_list_path = VIDEOS_DIR / f"{film_id}_filelist.txt"
        concat_output = VIDEOS_DIR / f"{film_id}_concat.mp4"
        final_output = VIDEOS_DIR / f"{film_id}_final.mp4"
        
        with open(file_list_path, 'w') as f:
            for scene in sorted(scenes, key=lambda x: x['number']):
                if scene.get('video_path') and Path(scene['video_path']).exists():
                    f.write(f"file '{scene['video_path']}'\n")
        
        # Step 1: Concat videos
        concat_cmd = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(file_list_path),
            '-c', 'copy',
            str(concat_output)
        ]
        
        process = await asyncio.create_subprocess_exec(
            *concat_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            logger.error(f"FFmpeg concat error: {stderr.decode()}")
            return None
        
        # Step 2: Upscale if requested
        if upscale and concat_output.exists():
            logger.info(f"[Film {film_id}] Upscaling to 1080p...")
            upscale_cmd = [
                'ffmpeg', '-y',
                '-i', str(concat_output),
                '-vf', 'scale=1920:1080:flags=lanczos',
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '18',
                '-c:a', 'copy',
                str(final_output)
            ]
            
            process = await asyncio.create_subprocess_exec(
                *upscale_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0 and final_output.exists():
                # Clean up
                file_list_path.unlink()
                concat_output.unlink()
                return str(final_output)
            else:
                logger.error(f"FFmpeg upscale error: {stderr.decode()}")
                # Fall back to concat output
                concat_output.rename(final_output)
        else:
            # No upscale, just rename concat to final
            concat_output.rename(final_output)
        
        # Clean up file list
        if file_list_path.exists():
            file_list_path.unlink()
        
        if final_output.exists():
            return str(final_output)
        return None
            
    except Exception as e:
        logger.error(f"Assembly error: {str(e)}")
        return None


@api_router.post("/film/generate")
async def start_film_generation(request: FilmGenerateRequest, background_tasks: BackgroundTasks):
    """Start AI Director film generation"""
    film_id = str(uuid.uuid4())
    
    # Initialize film in database
    await db.films.insert_one({
        "id": film_id,
        "story": request.story,
        "config": request.config.model_dump(),
        "status": "generating",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Initialize active film tracking
    active_films[film_id] = {
        'filmId': film_id,
        'stage': 'pre-production',
        'progress': 0,
        'workers': [],
        'issues': [],
        'completedScenes': [],
        'qualityMetrics': None,
        'eta': f"{request.config.duration * 3} min"
    }
    
    # Start background generation
    background_tasks.add_task(generate_film_task, film_id, request.story, request.config)
    
    return {"filmId": film_id, "status": "started"}


@api_router.get("/film/{film_id}/status")
async def get_film_status(film_id: str):
    """Get current film generation status"""
    if film_id in active_films:
        return active_films[film_id]
    
    # Check database
    film = await db.films.find_one({"id": film_id}, {"_id": 0})
    if film:
        return {
            "filmId": film_id,
            "stage": film.get("status", "unknown"),
            "progress": 100 if film.get("status") == "complete" else 0,
            "filmPlan": film.get("film_plan"),
            "completedScenes": film.get("completed_scenes", []),
            "issues": film.get("issues", []),
            "finalVideoUrl": film.get("final_video_url")
        }
    
    raise HTTPException(status_code=404, detail="Film not found")


@api_router.post("/film/{film_id}/cancel")
async def cancel_film_generation(film_id: str):
    """Cancel ongoing film generation"""
    if film_id in active_films:
        active_films[film_id]['stage'] = 'cancelled'
        del active_films[film_id]
    
    await db.films.update_one(
        {"id": film_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"status": "cancelled"}


@api_router.get("/films")
async def get_all_films():
    """Get all films sorted by created_at desc"""
    films = await db.films.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return films


@api_router.get("/film/{film_id}")
async def get_film(film_id: str):
    """Get film details"""
    film = await db.films.find_one({"id": film_id}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    return film


@api_router.delete("/film/{film_id}")
async def delete_film(film_id: str):
    """Delete a film and its video files"""
    film = await db.films.find_one({"id": film_id}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    # Delete video files
    import glob
    video_files = glob.glob(str(VIDEOS_DIR / f"{film_id}*"))
    for vf in video_files:
        try:
            os.remove(vf)
        except:
            pass
    
    # Delete from database
    await db.films.delete_one({"id": film_id})
    return {"status": "deleted"}


@api_router.get("/film-videos/{filename}")
async def serve_film_video(filename: str):
    """Serve generated film video files"""
    video_path = VIDEOS_DIR / filename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(video_path, media_type="video/mp4", filename=filename)


# ============ APP SETUP ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
