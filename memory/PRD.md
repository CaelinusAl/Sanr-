# CineCursor - AI-Powered Video Production Platform
## Product Requirements Document (PRD)

### Project Overview
**Name:** CineCursor  
**Tagline:** "Cursor for Film" - AI-powered video production platform  
**Vision:** Enable anyone to create professional films through natural language

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
| Asset Library | P1 | ✅ Implemented |
| Continuity Checking | P1 | ✅ Implemented |
| Export Timeline | P1 | ✅ Implemented |
| Video Generation | P0 | 🔶 MOCKED |
| Audio Generation | P1 | 🔶 MOCKED |
| Character Consistency AI | P1 | 📋 Planned |

---

### What's Been Implemented (Jan 21, 2026)

#### Backend (FastAPI + MongoDB)
- ✅ Project CRUD endpoints
- ✅ Scene CRUD with timeline positioning
- ✅ Character CRUD for consistency tracking
- ✅ Asset management endpoints
- ✅ AI Director chat with Claude Sonnet 4.5 (via Emergent LLM Key)
- ✅ Continuity checking algorithm
- ✅ Timeline export (JSON format)
- ✅ MOCKED video generation endpoint

#### Frontend (React + Tailwind)
- ✅ Projects Dashboard with search, create, delete
- ✅ Professional Editor Layout (3-panel design)
- ✅ Timeline with drag-drop scene positioning
- ✅ Transport controls (play/pause/stop/skip)
- ✅ Timeline zoom
- ✅ AI Director Chat Panel with streaming-like UX
- ✅ Scene cards with thumbnails
- ✅ Character management
- ✅ Scene/Character create modals
- ✅ Dark theme (Obsidian Suite)
- ✅ Custom fonts (Chivo, Manrope, JetBrains Mono)

---

### Prioritized Backlog

#### P0 - Critical (Next Sprint)
1. **Real Video Generation** - Integrate Runway Gen-3 or Sora 2 API
2. **Video Playback** - Replace image preview with actual video player
3. **Audio Integration** - Add audio track generation

#### P1 - High Priority
1. **Character Consistency** - Face embedding + IP-Adapter integration
2. **Scene Transitions** - Fade, dissolve, wipe effects
3. **Color Grading** - Post-processing filters
4. **Voice-over** - Text-to-speech for narration

#### P2 - Medium Priority
1. **Multi-user Collaboration** - Real-time editing
2. **Version History** - Git-like versioning for projects
3. **Cloud Storage** - S3 integration for assets
4. **Advanced Export** - MP4, MOV, ProRes formats

#### P3 - Nice to Have
1. **Electron App** - Desktop version
2. **Mobile Preview** - Responsive editor
3. **AI Script Writer** - Full screenplay generation
4. **Stock Integration** - Getty, Shutterstock for assets

---

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Tailwind CSS, Shadcn/UI |
| Backend | FastAPI, Python 3.x |
| Database | MongoDB |
| AI Chat | Claude Sonnet 4.5 (Emergent LLM Key) |
| Video Gen | **MOCKED** (Runway/Sora planned) |

---

### API Endpoints

```
GET    /api/                          - Health check
POST   /api/projects                  - Create project
GET    /api/projects                  - List projects
GET    /api/projects/{id}             - Get project
PUT    /api/projects/{id}             - Update project
DELETE /api/projects/{id}             - Delete project

POST   /api/scenes                    - Create scene
GET    /api/projects/{id}/scenes      - List project scenes
GET    /api/scenes/{id}               - Get scene
PUT    /api/scenes/{id}               - Update scene
DELETE /api/scenes/{id}               - Delete scene
POST   /api/scenes/reorder            - Reorder scenes
POST   /api/scenes/{id}/generate      - Generate video (MOCKED)

POST   /api/characters                - Create character
GET    /api/projects/{id}/characters  - List characters
GET    /api/characters/{id}           - Get character
PUT    /api/characters/{id}           - Update character
DELETE /api/characters/{id}           - Delete character

POST   /api/assets                    - Create asset
GET    /api/projects/{id}/assets      - List assets
DELETE /api/assets/{id}               - Delete asset

POST   /api/chat                      - AI Director chat
GET    /api/projects/{id}/chat-history - Get chat history
DELETE /api/projects/{id}/chat-history - Clear chat

POST   /api/projects/{id}/export      - Export timeline
GET    /api/projects/{id}/continuity-check - Check continuity
```

---

### Testing Results

| Category | Score |
|----------|-------|
| Backend | 96.2% |
| Frontend | 100% |
| Integration | 100% |
| **Overall** | **98.7%** |

---

### Next Tasks

1. Integrate real video generation API (Runway Gen-3)
2. Implement video playback in preview area
3. Add character face embedding for consistency
4. Implement scene transitions
5. Add audio track support

---

*Last Updated: January 21, 2026*
