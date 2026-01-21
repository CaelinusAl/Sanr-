# CineCursor - AI-Powered Video Production Platform
## Product Requirements Document

**Version:** 2.0  
**Last Updated:** January 21, 2026  
**Status:** In Development

---

## 1. Overview

CineCursor is a comprehensive AI-powered video production platform inspired by Cursor IDE, designed for filmmakers and content creators. The platform enables users to create professional videos using natural language prompts and AI-powered tools.

### Core Value Proposition
- Create professional videos using natural language
- AI Director powered by Claude for scene planning
- Video generation using Sora 2 AI
- Character consistency across scenes
- Professional timeline editing

---

## 2. Target Users

- **Content Creators**: YouTubers, TikTokers, social media influencers
- **Indie Filmmakers**: Independent filmmakers and video artists
- **Marketing Agencies**: Creating promotional content
- **Education**: Tutorial and educational video creators

---

## 3. Technical Stack

- **Frontend**: React.js, TailwindCSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: 
  - Claude Sonnet 4.5 (AI Director)
  - Sora 2 (Video Generation)
- **Video Processing**: FFmpeg

---

## 4. Features Implemented

### 4.1 Core MVP (v1.0) ✅
- [x] Project Management (CRUD)
- [x] Scene Management (CRUD)
- [x] Character Management
- [x] AI Director Chat (Claude)
- [x] Basic Timeline Editor
- [x] Video Preview Player

### 4.2 Professional UI (v2.0) ✅
- [x] VS Code-themed dark UI
- [x] ChatPanel with AI Director integration
- [x] AssetExplorer with tree view
- [x] VideoPreview component
- [x] SceneProperties panel with tabs (General, Analysis, Effects)
- [x] RenderingConsole with filtering
- [x] ContextMenu (right-click)
- [x] Keyboard Shortcuts Manager
- [x] Theme CSS styling

### 4.3 Services (v2.0) ✅
- [x] Project Manager Service (auto-save, recent projects)
- [x] Version Control Service (undo/redo)
- [x] Search Index Service (Fuse.js)
- [x] Virtual Timeline Renderer (performance)
- [x] Export Service (FFmpeg-based)

### 4.4 User Experience (v2.0) ✅
- [x] Onboarding Flow (5-step tutorial)
- [x] Project Templates (6 templates)
- [x] Keyboard shortcuts modal
- [x] Context menus for timeline

---

## 5. API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Scenes
- `GET /api/projects/{id}/scenes` - List project scenes
- `POST /api/projects/{id}/scenes` - Create scene
- `PUT /api/scenes/{id}` - Update scene
- `DELETE /api/scenes/{id}` - Delete scene
- `POST /api/scenes/{id}/generate` - Generate video with Sora 2

### Characters
- `POST /api/characters` - Create character
- `GET /api/projects/{id}/characters` - List characters

### AI Director
- `POST /api/chat` - Send message to AI Director
- `DELETE /api/projects/{id}/chat-history` - Clear chat

### Export
- `POST /api/projects/{id}/export` - Export project video

---

## 6. Database Schema

### Projects Collection
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "style_guide": "string",
  "total_duration": "number",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Scenes Collection
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "string",
  "prompt": "string",
  "duration": "number",
  "start_time": "number",
  "track_index": "number",
  "status": "draft|generating|ready|error",
  "video_path": "string",
  "thumbnail": "string"
}
```

### Characters Collection
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "string",
  "description": "string",
  "reference_images": ["string"]
}
```

---

## 7. Keyboard Shortcuts

### Playback
- `Space` - Play/Pause
- `←` / `→` - Previous/Next frame
- `Esc` - Stop playback
- `Home` / `End` - Go to start/end

### Timeline
- `⌘ +` / `⌘ -` - Zoom in/out
- `⌘ 0` - Fit to view
- `⌘ B` - Split clip
- `Delete` - Delete selected

### General
- `⌘ S` - Save project
- `⌘ Z` / `⌘ ⇧ Z` - Undo/Redo
- `⌘ N` - New scene
- `⌘ E` - Export

### AI & Editing
- `⌘ I` - Focus AI chat
- `⌘ G` - Generate scene
- `⌘ C` / `⌘ V` / `⌘ D` - Copy/Paste/Duplicate

---

## 8. Project Templates

1. **Blank Project** - Start from scratch
2. **Short Film** - 5 scenes, narrative structure
3. **Commercial** - 4 scenes, marketing focus
4. **Music Video** - 8 scenes, visual storytelling
5. **Documentary** - 6 scenes, interview format
6. **Social Media** - 3 scenes, quick content

---

## 9. Current Status

### Working Features ✅
- Project creation and management
- Scene creation and timeline display
- AI Director chat with Claude
- Video generation with Sora 2 (async)
- Professional UI components
- Keyboard shortcuts
- Context menus
- Onboarding flow
- Project templates

### In Progress 🔄
- Real video playback in VideoPreview when scene status is 'ready'

### MOCKED Features ⚠️
- **Scene Analysis**: Returns mock analysis data for composition and lighting

### ✅ Fixed Issues (January 21, 2026)
- **Video Generation Resolution Fix**: Removed invalid resolutions (1920x1080, 3840x2160) from UI. Now only shows Sora 2 supported sizes: 1280x720, 1792x1024, 1024x1792, 1024x1024
- **Video Generation Completion**: Render-status endpoint working correctly, videos complete successfully with valid resolutions
- **Video Playback**: VideoPreview component now correctly shows videos for selected scenes with video_url. Green scenes in timeline indicate ready videos.

### ✅ CineCursor V2.0 - AI Director Mode (January 21, 2026)
- **NEW: AI Director Panel** - Story input UI with duration/quality options
- **NEW: Production Dashboard** - Real-time progress tracking with stage indicators
- **NEW: Film Plan Generator** - Claude Sonnet 4 creates detailed JSON film plans
- **NEW: Parallel Worker System** - Multiple scenes can be generated simultaneously
- **NEW: Film Generation API** - /api/film/generate, /api/film/{id}/status endpoints
- **NEW: Sora 2 Video Generation** - text_to_video method working, scenes generated successfully
- **NEW: FFmpeg Assembly** - Multiple scene videos combined into final film

---

## 10. Upcoming Features (Backlog)

### P1 - High Priority
- [ ] Real video playback in VideoPreview (when scene has video_url)
- [ ] Asset upload functionality (images, audio)
- [ ] Timeline drag-drop reordering

### P2 - Medium Priority
- [ ] Character face consistency (IP-Adapter)
- [ ] Scene transitions implementation with FFmpeg
- [ ] Continuity checking (VAP) with AI analysis
- [ ] Multi-track timeline editing
- [ ] Audio track support

### P3 - Future
- [ ] Cloud sync (S3)
- [ ] Team collaboration
- [ ] Plugin system
- [ ] Desktop app (Electron)

---

## 11. File Structure

```
/app/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── services/
│       └── export_service.py
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AssetExplorer.jsx
    │   │   ├── ChatPanel.jsx
    │   │   ├── ContextMenu.jsx
    │   │   ├── OnboardingFlow.jsx
    │   │   ├── ProjectTemplates.jsx
    │   │   ├── RenderingConsole.jsx
    │   │   ├── SceneProperties.jsx
    │   │   └── VideoPreview.jsx
    │   ├── pages/
    │   │   ├── EditorPage.jsx
    │   │   └── ProjectsPage.jsx
    │   ├── services/
    │   │   ├── eventEmitter.js
    │   │   ├── keyboardShortcuts.js
    │   │   ├── projectManager.js
    │   │   ├── searchIndex.js
    │   │   ├── versionControl.js
    │   │   └── virtualTimeline.js
    │   └── styles/
    │       └── theme.css
    └── package.json
```

---

## 12. Change Log

### January 21, 2026 - v2.1 (Resolution Fix)
- **FIXED**: Video generation resolution options - removed unsupported 1920x1080 and 3840x2160
- Updated VIDEO_SIZES in EditorPage.jsx to only show Sora 2 supported resolutions
- Updated RESOLUTIONS in SceneProperties.jsx to match valid sizes
- Backend render-status endpoint verified working for video generation progress
- All 24 backend API tests passing
- Video generation end-to-end flow working correctly

### January 21, 2026 - v2.0
- Implemented Part 2 & 3 of blueprint
- Added SceneProperties panel with tabs
- Added RenderingConsole with filtering
- Added ContextMenu for timeline clips
- Added Keyboard Shortcuts system
- Added Project Manager service
- Added Version Control service
- Added Search Index service
- Added Virtual Timeline renderer
- Added Export Service backend
- Added Onboarding Flow
- Added Project Templates (6 templates)
- Updated EditorPage with all new components
- Fixed timeline scene display issues

### January 21, 2026 - v1.0
- Initial MVP release
- Project, Scene, Character CRUD
- AI Director with Claude
- Basic timeline editor
- Video generation with Sora 2

---

**Document maintained by CineCursor Development Team**
