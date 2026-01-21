# CineCursor v2.0 - AI-Powered Video Production Platform
## Product Requirements Document (PRD)

### Project Overview
**Name:** CineCursor  
**Tagline:** "Cursor for Film" - AI-powered video production platform  
**Vision:** Enable anyone to create professional films through natural language  
**Version:** 2.0

---

### User Personas

1. **Content Creators** - YouTubers, social media influencers needing quick video production
2. **Indie Filmmakers** - Low-budget filmmakers wanting AI assistance
3. **Marketing Agencies** - Teams creating commercial video content
4. **Hobbyists** - People exploring video creation with AI tools

---

### Core Requirements (Static)

| Requirement | Priority | Status |
|-------------|----------|--------|
| Project Management (CRUD) | P0 | ✅ Implemented |
| Scene Management | P0 | ✅ Implemented |
| Character Management | P0 | ✅ Implemented |
| Timeline Editor | P0 | ✅ Implemented |
| AI Director Chat | P0 | ✅ Implemented |
| Video Preview | P0 | ✅ Implemented |
| **Sora 2 Video Generation** | P0 | ✅ **NEW in v2.0** |
| **Scene Transitions** | P1 | ✅ **NEW in v2.0** |
| **Audio Track Support** | P1 | ✅ **NEW in v2.0** |
| **Video Export (MP4/MOV/WebM)** | P1 | ✅ **NEW in v2.0** |
| Continuity Checking | P1 | ✅ Implemented |
| Export Timeline JSON | P1 | ✅ Implemented |
| Character Consistency AI | P1 | 📋 Planned |

---

### What's Been Implemented

#### Version 2.0 (Jan 21, 2026) - CURRENT

**NEW Backend Features:**
- ✅ **Sora 2 Integration** - Real AI video generation via OpenAI
  - Durations: 4, 8, or 12 seconds
  - Resolutions: 1280x720, 1792x1024, 1024x1792, 1024x1024
  - Background task with progress polling
- ✅ **Scene Transitions** - Fade, dissolve, wipe, slide effects
- ✅ **Audio Track Support** - Upload audio per scene, volume control
- ✅ **Video Export** - MP4, MOV, WebM with resolution/fps options
- ✅ Video file serving endpoints
- ✅ Thumbnail generation with ffmpeg
- ✅ Render status polling endpoint

**NEW Frontend Features:**
- ✅ **Generate Video Modal** - Sora 2 configuration UI
  - Duration selector (4/8/12 seconds)
  - Resolution selector (HD/Widescreen/Portrait/Square)
  - Progress indicator with percentage
- ✅ **Export Video Modal** - Full export configuration
  - Format: MP4, MOV, WebM
  - Resolution: 720p, 1080p, 4K
  - Frame rate: 24, 30, 60 fps
  - Audio inclusion toggle
- ✅ **Transition Selectors** in scene creation
- ✅ **Video Player** in preview area
- ✅ **Volume Control** with mute button
- ✅ **Scene Status Indicators** (draft/generating/ready)
- ✅ "Sora 2" badge in AI Director panel
- ✅ JSON export button in header

#### Version 1.0 (Jan 21, 2026) - Initial Release

- ✅ Project CRUD endpoints
- ✅ Scene CRUD with timeline positioning
- ✅ Character CRUD for consistency tracking
- ✅ AI Director chat with Claude Sonnet 4.5
- ✅ Continuity checking algorithm
- ✅ Professional 3-panel editor layout
- ✅ Timeline with drag-drop scene positioning
- ✅ Transport controls (play/pause/stop/skip)
- ✅ Timeline zoom
- ✅ Dark theme (Obsidian Suite)

---

### API Endpoints (v2.0)

```
# Core
GET    /api/                              - Health check (v2.0)

# Projects
POST   /api/projects                      - Create project
GET    /api/projects                      - List projects
GET    /api/projects/{id}                 - Get project
PUT    /api/projects/{id}                 - Update project
DELETE /api/projects/{id}                 - Delete project

# Scenes
POST   /api/scenes                        - Create scene
GET    /api/projects/{id}/scenes          - List project scenes
GET    /api/scenes/{id}                   - Get scene
PUT    /api/scenes/{id}                   - Update scene
DELETE /api/scenes/{id}                   - Delete scene
POST   /api/scenes/reorder                - Reorder scenes

# Video Generation (NEW)
POST   /api/scenes/{id}/generate          - Start Sora 2 generation
GET    /api/scenes/{id}/render-status     - Poll render progress
GET    /api/videos/{scene_id}             - Serve video file
GET    /api/thumbnails/{scene_id}         - Serve thumbnail

# Transitions (NEW)
PUT    /api/scenes/{id}/transition        - Set transitions

# Audio (NEW)
POST   /api/scenes/{id}/audio             - Upload audio track
PUT    /api/scenes/{id}/audio-volume      - Set volume
GET    /api/audio/{scene_id}              - Serve audio file

# Export (NEW)
POST   /api/projects/{id}/export          - Export as video file
GET    /api/exports/{project_id}/{id}     - Download export
GET    /api/projects/{id}/export-json     - Export as JSON

# Characters
POST   /api/characters                    - Create character
GET    /api/projects/{id}/characters      - List characters
GET    /api/characters/{id}               - Get character
PUT    /api/characters/{id}               - Update character
DELETE /api/characters/{id}               - Delete character

# AI Director
POST   /api/chat                          - Chat with AI Director
GET    /api/projects/{id}/chat-history    - Get chat history
DELETE /api/projects/{id}/chat-history    - Clear chat

# Continuity
GET    /api/projects/{id}/continuity-check - Check continuity issues
```

---

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Tailwind CSS, Shadcn/UI |
| Backend | FastAPI, Python 3.x |
| Database | MongoDB |
| AI Chat | Claude Sonnet 4.5 (Emergent LLM Key) |
| Video Gen | **OpenAI Sora 2** (Emergent LLM Key) |
| Video Processing | FFmpeg |

---

### Prioritized Backlog

#### P0 - Critical (Next Sprint)
1. **Real-time Video Playback** - Sync timeline playhead with video
2. **Audio Waveform Display** - Show audio visualization in timeline

#### P1 - High Priority
1. **Character Face Embedding** - InsightFace integration for consistency
2. **Batch Video Generation** - Generate all scenes sequentially
3. **Project Templates** - Pre-built scene sequences

#### P2 - Medium Priority
1. **Multi-user Collaboration** - Real-time editing
2. **Version History** - Git-like versioning for projects
3. **Cloud Storage** - S3 integration for assets

#### P3 - Nice to Have
1. **Electron App** - Desktop version
2. **Mobile Preview** - Responsive editor
3. **AI Script Writer** - Full screenplay generation

---

### Testing Results

| Version | Backend | Frontend | Integration | Overall |
|---------|---------|----------|-------------|---------|
| v1.0 | 96.2% | 100% | 100% | 98.7% |
| v2.0 | TBD | TBD | TBD | TBD |

---

### Next Tasks

1. Test Sora 2 generation end-to-end
2. Implement video playback sync with timeline
3. Add audio waveform visualization
4. Implement batch export for all scenes
5. Add project duplication feature

---

*Last Updated: January 21, 2026*
*Version: 2.0*
