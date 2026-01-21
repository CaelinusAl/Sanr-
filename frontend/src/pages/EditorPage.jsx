import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Square,
  Plus, ZoomIn, ZoomOut, Settings, Download,
  Clapperboard, ChevronLeft, Film, Users,
  AlertTriangle, Wand2, Loader2,
  FileVideo, Music, Clock, Keyboard
} from "lucide-react";
import { ChatPanel } from "../components/ChatPanel";
import { AssetExplorer } from "../components/AssetExplorer";
import { VideoPreview } from "../components/VideoPreview";
import { SceneProperties } from "../components/SceneProperties";
import { RenderingConsole } from "../components/RenderingConsole";
import { useContextMenu } from "../components/ContextMenu";
import { getKeyboardShortcuts } from "../services/keyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

// Import theme styles
import "../styles/theme.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PIXELS_PER_SECOND = 50;

// Transition types
const TRANSITIONS = [
  { value: "none", label: "None (Hard Cut)" },
  { value: "fade", label: "Fade" },
  { value: "dissolve", label: "Dissolve" },
  { value: "wipe_left", label: "Wipe Left" },
  { value: "wipe_right", label: "Wipe Right" },
  { value: "slide_left", label: "Slide Left" },
  { value: "slide_right", label: "Slide Right" },
];

// Video sizes for Sora 2
const VIDEO_SIZES = [
  { value: "1920x1080", label: "Full HD (1920×1080)" },
  { value: "3840x2160", label: "4K Ultra HD (3840×2160)" },
  { value: "1280x720", label: "HD (1280×720)" },
  { value: "1792x1024", label: "Widescreen (1792×1024)" },
  { value: "1024x1792", label: "Portrait (1024×1792)" },
  { value: "1024x1024", label: "Square (1024×1024)" },
];

// Video durations
const VIDEO_DURATIONS = [
  { value: 4, label: "4 seconds" },
  { value: 8, label: "8 seconds" },
  { value: 12, label: "12 seconds" },
];

export default function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Project State
  const [project, setProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Timeline State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedScene, setSelectedScene] = useState(null);
  const [draggingScene, setDraggingScene] = useState(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Modal State
  const [showCreateScene, setShowCreateScene] = useState(false);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [continuityIssues, setContinuityIssues] = useState([]);
  
  // Generate Modal State
  const [generateConfig, setGenerateConfig] = useState({
    prompt: "",
    duration: 4,
    size: "1280x720",
    model: "sora-2"
  });
  const [generatingSceneId, setGeneratingSceneId] = useState(null);
  const [renderProgress, setRenderProgress] = useState(null);
  
  // Rendering Console State
  const [renders, setRenders] = useState([]);
  const [sceneAnalysis, setSceneAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Export State
  const [exportConfig, setExportConfig] = useState({
    format: "mp4",
    resolution: "1080p",
    fps: 30,
    include_audio: true
  });
  const [exporting, setExporting] = useState(false);
  
  // New Scene Form
  const [newScene, setNewScene] = useState({
    name: "", description: "", prompt: "", duration: 5, characters: [],
    transition_in: { type: "fade", duration: 0.5 },
    transition_out: { type: "fade", duration: 0.5 }
  });
  
  // New Character Form
  const [newCharacter, setNewCharacter] = useState({ name: "", description: "", reference_images: [] });
  
  // Context Menu
  const { openContextMenu, ContextMenuComponent } = useContextMenu();
  
  // Refs
  const timelineRef = useRef(null);
  const playbackRef = useRef(null);

  // Keyboard Shortcuts Setup
  useEffect(() => {
    const shortcuts = getKeyboardShortcuts();
    
    const handlers = {
      play_pause: () => setIsPlaying(prev => !prev),
      stop: () => { setIsPlaying(false); setCurrentTime(0); },
      frame_forward: () => setCurrentTime(prev => Math.min(prev + 0.1, project?.total_duration || 60)),
      frame_backward: () => setCurrentTime(prev => Math.max(prev - 0.1, 0)),
      go_to_start: () => setCurrentTime(0),
      go_to_end: () => setCurrentTime(project?.total_duration || 0),
      zoom_in: () => setZoom(prev => Math.min(4, prev + 0.25)),
      zoom_out: () => setZoom(prev => Math.max(0.25, prev - 0.25)),
      new_scene: () => setShowCreateScene(true),
      export: () => setShowExportModal(true),
      delete_clip: () => selectedScene && handleDeleteScene(selectedScene.id),
      generate_scene: () => selectedScene && openGenerateModal(selectedScene),
      save: () => toast.success("Project auto-saved"),
    };
    
    const unsubscribes = Object.entries(handlers).map(([event, handler]) => 
      shortcuts.on(event, handler)
    );
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [project, selectedScene]);

  // Load project data
  useEffect(() => {
    if (projectId) loadProjectData();
  }, [projectId]);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const maxTime = project?.total_duration || 60;
          if (prev >= maxTime) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(playbackRef.current);
  }, [isPlaying, project?.total_duration]);

  // Poll render status when generating
  useEffect(() => {
    if (generatingSceneId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`${API}/scenes/${generatingSceneId}/render-status`);
          setRenderProgress(response.data);
          
          if (response.data.status === "complete") {
            clearInterval(pollInterval);
            setGeneratingSceneId(null);
            setShowGenerateModal(false);
            toast.success("Video generated successfully!");
            loadProjectData();
          } else if (response.data.status === "error") {
            clearInterval(pollInterval);
            setGeneratingSceneId(null);
            toast.error(response.data.message || "Generation failed");
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 2000);
      
      return () => clearInterval(pollInterval);
    }
  }, [generatingSceneId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, scenesRes, charsRes, chatRes] = await Promise.all([
        axios.get(`${API}/projects/${projectId}`),
        axios.get(`${API}/projects/${projectId}/scenes`),
        axios.get(`${API}/projects/${projectId}/characters`),
        axios.get(`${API}/projects/${projectId}/chat-history`),
      ]);
      
      setProject(projectRes.data);
      setScenes(scenesRes.data);
      setCharacters(charsRes.data);
      setChatMessages(chatRes.data);
      checkContinuity();
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Failed to load project");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const checkContinuity = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/continuity-check`);
      setContinuityIssues(response.data.issues || []);
    } catch (error) {
      console.error("Continuity check error:", error);
    }
  };

  // Timeline functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / (PIXELS_PER_SECOND * zoom);
    setCurrentTime(Math.max(0, time));
  };

  const handleSceneDrag = (sceneId, e) => {
    e.preventDefault();
    setDraggingScene(sceneId);
    
    const handleMouseMove = (moveEvent) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const newStartTime = Math.max(0, x / (PIXELS_PER_SECOND * zoom));
      
      setScenes((prev) =>
        prev.map((s) => s.id === sceneId ? { ...s, start_time: newStartTime } : s)
      );
    };
    
    const handleMouseUp = async () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setDraggingScene(null);
      
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        try {
          await axios.put(`${API}/scenes/${sceneId}`, { start_time: scene.start_time });
        } catch (error) {
          console.error("Error updating scene position:", error);
        }
      }
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Scene functions
  const handleCreateScene = async () => {
    if (!newScene.name.trim()) {
      toast.error("Scene name is required");
      return;
    }

    try {
      const maxEndTime = scenes.reduce((max, s) => Math.max(max, s.start_time + s.duration), 0);

      const response = await axios.post(`${API}/scenes`, {
        project_id: projectId, name: newScene.name, description: newScene.description,
        prompt: newScene.prompt, duration: newScene.duration, start_time: maxEndTime,
        characters: newScene.characters,
      });

      // Set transitions
      if (newScene.transition_in.type !== "none" || newScene.transition_out.type !== "none") {
        await axios.put(`${API}/scenes/${response.data.id}/transition`, {
          transition_in: newScene.transition_in.type !== "none" ? newScene.transition_in : null,
          transition_out: newScene.transition_out.type !== "none" ? newScene.transition_out : null,
        });
      }

      setScenes([...scenes, response.data]);
      setShowCreateScene(false);
      setNewScene({ name: "", description: "", prompt: "", duration: 5, characters: [],
                   transition_in: { type: "fade", duration: 0.5 }, transition_out: { type: "fade", duration: 0.5 } });
      toast.success("Scene created");
      checkContinuity();
    } catch (error) {
      console.error("Error creating scene:", error);
      toast.error("Failed to create scene");
    }
  };

  const handleDeleteScene = async (sceneId) => {
    try {
      await axios.delete(`${API}/scenes/${sceneId}`);
      setScenes(scenes.filter((s) => s.id !== sceneId));
      if (selectedScene?.id === sceneId) setSelectedScene(null);
      toast.success("Scene deleted");
      checkContinuity();
    } catch (error) {
      console.error("Error deleting scene:", error);
      toast.error("Failed to delete scene");
    }
  };

  const handleSceneUpdate = async (updatedScene) => {
    try {
      setScenes(prev => prev.map(s => s.id === updatedScene.id ? updatedScene : s));
      await axios.put(`${API}/scenes/${updatedScene.id}`, updatedScene);
    } catch (error) {
      console.error("Error updating scene:", error);
    }
  };

  const handleAnalyzeScene = async () => {
    if (!selectedScene) return;
    
    setIsAnalyzing(true);
    try {
      // Simulated analysis - in production, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSceneAnalysis({
        characters: [
          { name: "Main Character", emotion: "neutral", pose: "standing" }
        ],
        lighting: {
          brightness: 0.7,
          contrast: 0.6,
        },
        composition: {
          ruleOfThirds: 0.85,
          balance: 0.72,
        },
        quality: {
          overall: 85,
          sharpness: 90,
          noise: 15,
        }
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze scene");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openGenerateModal = (scene) => {
    setSelectedScene(scene);
    setGenerateConfig({
      prompt: scene.prompt || "",
      duration: Math.min(20, Math.max(4, Math.round(scene.duration / 4) * 4)) || 8,
      size: "1920x1080",
      model: "sora-2"
    });
    setShowGenerateModal(true);
  };

  // Poll for render status
  const pollRenderStatus = async (sceneId, renderId) => {
    const maxPolls = 180; // Max 15 minutes (180 * 5 seconds)
    let pollCount = 0;
    
    const poll = async () => {
      try {
        const response = await axios.get(`${API}/scenes/${sceneId}/render-status`);
        const status = response.data;
        
        // Update render progress
        setRenderProgress({
          progress: status.progress || 0,
          status: status.status,
          message: status.message || "Processing..."
        });
        
        // Update renders list
        setRenders(prev => prev.map(r => 
          r.sceneId === sceneId 
            ? { 
                ...r, 
                stage: status.status === "complete" ? "complete" : 
                       status.status === "error" ? "failed" : "generating",
                progress: status.progress || 0,
                message: status.message || "Processing...",
                videoUrl: status.video_url,
                error: status.status === "error" ? status.message : null
              }
            : r
        ));
        
        // Update scene status
        if (status.status === "complete") {
          setScenes(prev => prev.map(s => 
            s.id === sceneId 
              ? { ...s, status: "ready", video_path: status.video_path, video_url: status.video_url, thumbnail: status.thumbnail }
              : s
          ));
          setShowGenerateModal(false);
          setGeneratingSceneId(null);
          toast.success("Video generated successfully!");
          loadProjectData(); // Reload to get updated data
          return; // Stop polling
        }
        
        if (status.status === "error") {
          setGeneratingSceneId(null);
          setShowGenerateModal(false);
          toast.error(`Generation failed: ${status.message}`);
          return; // Stop polling
        }
        
        // Continue polling
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          toast.warning("Generation is taking longer than expected. Check back later.");
          setShowGenerateModal(false);
        }
        
      } catch (error) {
        console.error("Poll error:", error);
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(poll, 5000);
        }
      }
    };
    
    // Start polling after a short delay
    setTimeout(poll, 2000);
  };

  const handleGenerateVideo = async () => {
    if (!selectedScene) return;
    if (!generateConfig.prompt.trim()) {
      toast.error("Prompt is required");
      return;
    }

    try {
      setGeneratingSceneId(selectedScene.id);
      setRenderProgress({ progress: 0, status: "queued", message: "Starting..." });

      // Add to renders list
      const renderId = `render_${Date.now()}`;
      const newRender = {
        renderId,
        sceneId: selectedScene.id,
        sceneName: selectedScene.name,
        stage: "queued",
        progress: 0,
        message: "Initializing Sora 2...",
        estimatedTimeRemaining: generateConfig.duration * 15, // Rough estimate
      };
      setRenders(prev => [...prev, newRender]);

      // Start generation
      await axios.post(`${API}/scenes/${selectedScene.id}/generate`, generateConfig);
      
      // Update render status
      setRenders(prev => prev.map(r => 
        r.sceneId === selectedScene.id 
          ? { ...r, stage: "generating", message: "AI is creating your video...", progress: 5 }
          : r
      ));
      
      // Update scene status locally
      setScenes((prev) =>
        prev.map((s) => s.id === selectedScene.id ? { ...s, status: "generating", render_progress: 0 } : s)
      );

      toast.info("Video generation started! This may take 2-5 minutes.");
      
      // Start polling for status
      pollRenderStatus(selectedScene.id, renderId);
      
    } catch (error) {
      console.error("Error starting generation:", error);
      toast.error("Failed to start generation: " + (error.response?.data?.detail || error.message));
      setGeneratingSceneId(null);
      setShowGenerateModal(false);
      
      // Update render as failed
      setRenders(prev => prev.map(r => 
        r.sceneId === selectedScene?.id 
          ? { ...r, stage: "failed", message: "Failed to start generation", error: error.message }
          : r
      ));
    }
  };

  const handleCancelRender = (renderId) => {
    setRenders(prev => prev.map(r => 
      r.renderId === renderId 
        ? { ...r, stage: "cancelled", message: "Cancelled by user" }
        : r
    ));
    toast.info("Render cancelled");
  };

  const handleRetryRender = (renderId) => {
    const render = renders.find(r => r.renderId === renderId);
    if (render) {
      const scene = scenes.find(s => s.id === render.sceneId);
      if (scene) {
        openGenerateModal(scene);
      }
    }
  };

  const handleClearCompletedRenders = () => {
    setRenders(prev => prev.filter(r => !["complete", "cancelled"].includes(r.stage)));
  };

  // Timeline context menu
  const handleTimelineContextMenu = (e, scene) => {
    openContextMenu(e, [
      { label: "Scene Actions", type: "label" },
      { icon: "🎬", label: "Generate Video", onClick: () => openGenerateModal(scene) },
      { icon: "✏️", label: "Edit Properties", onClick: () => setSelectedScene(scene) },
      { icon: "📋", label: "Duplicate", onClick: () => toast.info("Duplicate coming soon") },
      { type: "separator" },
      { icon: "🗑️", label: "Delete", onClick: () => handleDeleteScene(scene.id), danger: true },
    ]);
  };

  // Character functions
  const handleCreateCharacter = async () => {
    if (!newCharacter.name.trim()) {
      toast.error("Character name is required");
      return;
    }

    try {
      const response = await axios.post(`${API}/characters`, { project_id: projectId, ...newCharacter });
      setCharacters([...characters, response.data]);
      setShowCreateCharacter(false);
      setNewCharacter({ name: "", description: "", reference_images: [] });
      toast.success("Character created");
    } catch (error) {
      console.error("Error creating character:", error);
      toast.error("Failed to create character");
    }
  };

  const handleCreateFromPlan = (scenePlan) => {
    setNewScene({
      name: scenePlan.name || "New Scene",
      description: scenePlan.description || "",
      prompt: scenePlan.visual_prompt || "",
      duration: scenePlan.duration || 5,
      characters: scenePlan.characters || [],
      transition_in: scenePlan.transition_in || { type: "fade", duration: 0.5 },
      transition_out: scenePlan.transition_out || { type: "fade", duration: 0.5 },
    });
    setShowCreateScene(true);
  };

  // Export functions
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axios.post(`${API}/projects/${projectId}/export`, exportConfig);
      
      if (response.data.status === "complete") {
        toast.success("Export complete!");
        // Download file
        window.open(`${API}/exports/${projectId}/${response.data.export_id}`, "_blank");
      }
      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.detail || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/export-json`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.name || "project"}-timeline.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Timeline exported as JSON");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export timeline");
    }
  };

  // Get current scene for preview
  const getCurrentScene = () => {
    return scenes.find((s) => currentTime >= s.start_time && currentTime < s.start_time + s.duration);
  };

  const currentScene = getCurrentScene();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#09090B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-zinc-400">Loading project...</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen w-screen bg-[#09090B] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-12 bg-[#18181B] border-b border-zinc-800 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button data-testid="back-to-projects-btn" onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-[#E11D48]" />
              <span className="font-chivo font-bold text-white">{project?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {continuityIssues.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button data-testid="continuity-issues-btn" variant="ghost" size="sm"
                          className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {continuityIssues.length}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{continuityIssues.length} continuity issues detected</p></TooltipContent>
              </Tooltip>
            )}
            <Button data-testid="export-json-btn" variant="ghost" size="sm" onClick={handleExportJSON}
                    className="text-zinc-400 hover:text-white">
              <FileVideo className="w-4 h-4 mr-1" /> JSON
            </Button>
            <Button data-testid="export-btn" variant="ghost" size="sm" onClick={() => setShowExportModal(true)}
                    className="text-zinc-400 hover:text-white">
              <Download className="w-4 h-4 mr-1" /> Export Video
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button data-testid="shortcuts-btn" variant="ghost" size="icon" 
                        onClick={() => setShowShortcutsModal(true)}
                        className="text-zinc-400 hover:text-white">
                  <Keyboard className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Keyboard Shortcuts</p></TooltipContent>
            </Tooltip>
            <Button data-testid="settings-btn" variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Asset Explorer */}
          <div className="w-72 bg-[#1e1e1e] border-r border-[#3c3c3c] flex-shrink-0">
            <AssetExplorer
              scenes={scenes}
              characters={characters}
              assets={[]}
              onAssetSelect={(asset) => {
                if (asset.duration !== undefined) {
                  setSelectedScene(asset);
                  setCurrentTime(asset.start_time || 0);
                }
              }}
              onAssetDoubleClick={(asset) => {
                if (asset.duration !== undefined) {
                  openGenerateModal(asset);
                }
              }}
              onAssetDelete={(assetId) => handleDeleteScene(assetId)}
              onRefresh={loadProjectData}
              selectedAssetId={selectedScene?.id}
              projectName={project?.name || "Untitled Project"}
            />
            
            {/* Quick Action Buttons */}
            <div className="p-3 border-t border-[#3c3c3c] space-y-2">
              <Button data-testid="add-scene-btn" onClick={() => setShowCreateScene(true)}
                      className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Scene
              </Button>
              <Button data-testid="add-character-btn" onClick={() => setShowCreateCharacter(true)}
                      variant="outline" className="w-full border-[#3c3c3c] text-[#cccccc] hover:bg-[#2d2d30]" size="sm">
                <Users className="w-4 h-4 mr-1" /> Add Character
              </Button>
            </div>
          </div>

          {/* Center - Preview & Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Video Preview Area */}
            <div className="flex-1 min-h-[300px]">
              <VideoPreview
                videoUrl={currentScene?.video_url ? `${API.replace('/api', '')}${currentScene.video_url}` : null}
                thumbnailUrl={currentScene?.thumbnail}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onTimeUpdate={(time) => setCurrentTime(time)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onSeek={(time) => setCurrentTime(time)}
                sceneName={currentScene?.name}
                sceneStatus={currentScene?.status}
              />
            </div>

            {/* Timeline */}
            <div className="h-[280px] bg-[#09090B] border-t border-zinc-800 flex flex-col flex-shrink-0">
              {/* Timeline Toolbar */}
              <div className="h-10 bg-[#18181B] border-b border-zinc-800 flex items-center justify-between px-3">
                <div className="flex items-center gap-1">
                  <Tooltip><TooltipTrigger asChild>
                    <button data-testid="skip-back-btn" onClick={() => setCurrentTime(0)} className="transport-btn">
                      <SkipBack className="w-4 h-4" />
                    </button>
                  </TooltipTrigger><TooltipContent>Go to Start</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild>
                    <button data-testid="play-pause-btn" onClick={() => setIsPlaying(!isPlaying)}
                            className={`transport-btn ${isPlaying ? "active" : ""}`}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </TooltipTrigger><TooltipContent>{isPlaying ? "Pause" : "Play"}</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild>
                    <button data-testid="stop-btn" onClick={() => { setIsPlaying(false); setCurrentTime(0); }} className="transport-btn">
                      <Square className="w-4 h-4" />
                    </button>
                  </TooltipTrigger><TooltipContent>Stop</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild>
                    <button data-testid="skip-forward-btn" onClick={() => setCurrentTime(project?.total_duration || 60)} className="transport-btn">
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </TooltipTrigger><TooltipContent>Go to End</TooltipContent></Tooltip>
                </div>

                <div className="timecode text-sm">{formatTime(currentTime)} / {formatTime(project?.total_duration || 0)}</div>

                <div className="flex items-center gap-1">
                  <Tooltip><TooltipTrigger asChild>
                    <button data-testid="zoom-out-btn" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="transport-btn">
                      <ZoomOut className="w-4 h-4" />
                    </button>
                  </TooltipTrigger><TooltipContent>Zoom Out</TooltipContent></Tooltip>
                  <span className="text-xs text-zinc-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Tooltip><TooltipTrigger asChild>
                    <button data-testid="zoom-in-btn" onClick={() => setZoom(Math.min(4, zoom + 0.25))} className="transport-btn">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </TooltipTrigger><TooltipContent>Zoom In</TooltipContent></Tooltip>
                </div>
              </div>

              {/* Timeline Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Track Labels */}
                <div className="w-28 bg-[#18181B] border-r border-zinc-800 flex-shrink-0">
                  <div className="h-6 border-b border-zinc-800" />
                  <div className="track-header h-20 flex flex-col justify-center px-3">
                    <span className="text-xs font-medium text-zinc-300">Video</span>
                    <span className="text-[10px] text-zinc-500">Track 1</span>
                  </div>
                  <div className="track-header h-16 flex flex-col justify-center px-3 border-t border-zinc-800">
                    <span className="text-xs font-medium text-zinc-300">Audio</span>
                    <span className="text-[10px] text-zinc-500">Track 2</span>
                  </div>
                </div>

                {/* Timeline Tracks */}
                <div ref={timelineRef} className="flex-1 overflow-x-auto overflow-y-hidden relative"
                     onClick={handleTimelineClick} data-testid="timeline-area">
                  {/* Ruler */}
                  <div className="h-6 bg-[#18181B] border-b border-zinc-800 sticky top-0 z-10">
                    <div className="h-full relative"
                         style={{ width: `${Math.max(1000, (project?.total_duration || 60) * PIXELS_PER_SECOND * zoom + 200)}px` }}>
                      {Array.from({ length: Math.ceil((project?.total_duration || 60) / 5) + 5 }).map((_, i) => (
                        <div key={i} className="absolute top-0 h-full flex flex-col justify-end items-start"
                             style={{ left: `${i * 5 * PIXELS_PER_SECOND * zoom}px` }}>
                          <span className="text-[10px] font-mono text-zinc-500 ml-1 mb-0.5">
                            {Math.floor((i * 5) / 60)}:{((i * 5) % 60).toString().padStart(2, "0")}
                          </span>
                          <div className="w-px h-2 bg-zinc-600" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Track */}
                  <div className="track-row h-20 relative timeline-track"
                       style={{ width: `${Math.max(1000, (project?.total_duration || 60) * PIXELS_PER_SECOND * zoom + 200)}px` }}>
                    {scenes.filter((s) => s.track_index === 0).map((scene) => (
                      <div key={scene.id} data-testid={`timeline-clip-${scene.id}`}
                           className={`scene-clip absolute top-2 h-16 rounded-md border overflow-hidden ${
                             scene.status === "generating" ? "border-blue-500 rendering" :
                             scene.status === "ready" ? "border-green-500 bg-green-600/80" :
                             selectedScene?.id === scene.id ? "border-blue-500 bg-blue-600" : "border-blue-600/50 bg-blue-500/80"
                           } ${draggingScene === scene.id ? "dragging" : ""}`}
                           style={{ left: `${scene.start_time * PIXELS_PER_SECOND * zoom}px`,
                                    width: `${Math.max(40, scene.duration * PIXELS_PER_SECOND * zoom)}px` }}
                           onClick={(e) => { e.stopPropagation(); setSelectedScene(scene); }}
                           onContextMenu={(e) => handleTimelineContextMenu(e, scene)}
                           onMouseDown={(e) => { if (e.button === 0) handleSceneDrag(scene.id, e); }}>
                        <div className="h-full flex items-center px-2 gap-2">
                          {scene.thumbnail && (
                            <img src={scene.thumbnail.startsWith('http') ? scene.thumbnail : `${API}/thumbnails/${scene.id}`}
                                 alt="" className="h-12 w-16 object-cover rounded-sm flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">{scene.name}</div>
                            <div className="text-[10px] text-white/70">{scene.duration.toFixed(1)}s</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audio Track */}
                  <div className="track-row h-16 relative timeline-track border-t border-zinc-800"
                       style={{ width: `${Math.max(1000, (project?.total_duration || 60) * PIXELS_PER_SECOND * zoom + 200)}px` }}>
                    {scenes.filter((s) => s.audio_track).map((scene) => (
                      <div key={`audio-${scene.id}`} data-testid={`audio-clip-${scene.id}`}
                           className="scene-clip absolute top-2 h-12 rounded-md border bg-emerald-500/80 border-emerald-600/50"
                           style={{ left: `${scene.start_time * PIXELS_PER_SECOND * zoom}px`,
                                    width: `${Math.max(40, scene.duration * PIXELS_PER_SECOND * zoom)}px` }}>
                        <div className="h-full flex items-center px-2">
                          <Music className="w-3 h-3 mr-1 text-white" />
                          <span className="text-xs text-white truncate">{scene.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Playhead */}
                  <div className="playhead" style={{ left: `${currentTime * PIXELS_PER_SECOND * zoom}px`, top: 0, bottom: 0 }}
                       data-testid="playhead" />
                </div>
              </div>
            </div>
            
            {/* Rendering Console */}
            <RenderingConsole
              renders={renders}
              onCancelRender={handleCancelRender}
              onRetryRender={handleRetryRender}
              onClearCompleted={handleClearCompletedRenders}
            />
          </div>

          {/* Right Sidebar - Two Panels */}
          <div className="w-[400px] bg-[#1e1e1e] border-l border-[#3c3c3c] flex-shrink-0 flex flex-col">
            {/* Scene Properties - Top Half */}
            <div className="h-1/2 border-b border-[#3c3c3c] overflow-hidden">
              <SceneProperties
                scene={selectedScene}
                onSceneUpdate={handleSceneUpdate}
                onAnalyze={handleAnalyzeScene}
                isAnalyzing={isAnalyzing}
                analysis={sceneAnalysis}
              />
            </div>
            
            {/* AI Director Chat - Bottom Half */}
            <div className="h-1/2 overflow-hidden">
              <ChatPanel
                messages={chatMessages}
                onSendMessage={async (message) => {
                  setChatLoading(true);
                  setChatMessages((prev) => [...prev, { id: Date.now(), role: "user", content: message }]);
                  try {
                    const response = await axios.post(`${API}/chat`, { project_id: projectId, message });
                    setChatMessages((prev) => [
                      ...prev,
                      { id: response.data.id, role: "assistant", content: response.data.message, scene_plan: response.data.scene_plan },
                    ]);
                    if (response.data.scene_plan) {
                      toast.info("AI Director suggested a scene! Click 'Create This Scene' to add it.");
                    }
                  } catch (error) {
                    console.error("Chat error:", error);
                    toast.error("Failed to get AI response");
                  } finally {
                    setChatLoading(false);
                  }
                }}
                onClearChat={async () => {
                  await axios.delete(`${API}/projects/${projectId}/chat-history`);
                  setChatMessages([]);
                  toast.success("Chat cleared");
                }}
                isLoading={chatLoading}
                onCreateFromPlan={handleCreateFromPlan}
                modelName="Claude + Sora 2"
              />
            </div>
          </div>
        </div>
        
        {/* Context Menu */}
        {ContextMenuComponent}

        {/* Create Scene Modal */}
        <Dialog open={showCreateScene} onOpenChange={setShowCreateScene}>
          <DialogContent className="bg-[#18181B] border-zinc-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-chivo text-xl">Create New Scene</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Scene Name</Label>
                <Input data-testid="scene-name-input" placeholder="Opening Shot" value={newScene.name}
                       onChange={(e) => setNewScene({ ...newScene, name: e.target.value })}
                       className="bg-zinc-900/50 border-zinc-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Description</Label>
                <Textarea data-testid="scene-description-input" placeholder="Brief description..."
                          value={newScene.description} onChange={(e) => setNewScene({ ...newScene, description: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-700 text-white resize-none h-16" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Sora 2 Prompt</Label>
                <Textarea data-testid="scene-prompt-input" placeholder="Detailed visual prompt for AI video generation..."
                          value={newScene.prompt} onChange={(e) => setNewScene({ ...newScene, prompt: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-700 text-white resize-none h-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Duration (sec)</Label>
                  <Input data-testid="scene-duration-input" type="number" min={1} max={60} value={newScene.duration}
                         onChange={(e) => setNewScene({ ...newScene, duration: parseFloat(e.target.value) || 5 })}
                         className="bg-zinc-900/50 border-zinc-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Characters</Label>
                  <select data-testid="scene-characters-select" multiple value={newScene.characters}
                          onChange={(e) => setNewScene({ ...newScene, characters: Array.from(e.target.selectedOptions, (o) => o.value) })}
                          className="w-full h-20 px-2 py-1 rounded-md bg-zinc-900/50 border border-zinc-700 text-white text-sm">
                    {characters.map((char) => (<option key={char.id} value={char.id}>{char.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Transition In</Label>
                  <Select value={newScene.transition_in.type}
                          onValueChange={(v) => setNewScene({ ...newScene, transition_in: { ...newScene.transition_in, type: v } })}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {TRANSITIONS.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Transition Out</Label>
                  <Select value={newScene.transition_out.type}
                          onValueChange={(v) => setNewScene({ ...newScene, transition_out: { ...newScene.transition_out, type: v } })}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {TRANSITIONS.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowCreateScene(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
              <Button data-testid="create-scene-submit-btn" onClick={handleCreateScene} className="bg-white text-black hover:bg-zinc-200">Create Scene</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Character Modal */}
        <Dialog open={showCreateCharacter} onOpenChange={setShowCreateCharacter}>
          <DialogContent className="bg-[#18181B] border-zinc-800 text-white">
            <DialogHeader><DialogTitle className="font-chivo text-xl">Create Character</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Character Name</Label>
                <Input data-testid="character-name-input" placeholder="John Doe" value={newCharacter.name}
                       onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                       className="bg-zinc-900/50 border-zinc-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Description</Label>
                <Textarea data-testid="character-description-input" placeholder="Physical appearance, personality..."
                          value={newCharacter.description} onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                          className="bg-zinc-900/50 border-zinc-700 text-white resize-none h-24" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowCreateCharacter(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
              <Button data-testid="create-character-submit-btn" onClick={handleCreateCharacter} className="bg-white text-black hover:bg-zinc-200">Create Character</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generate Video Modal */}
        <Dialog open={showGenerateModal} onOpenChange={(open) => { if (!generatingSceneId) setShowGenerateModal(open); }}>
          <DialogContent className="bg-[#18181B] border-zinc-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-chivo text-xl flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#8B5CF6]" /> Generate with Sora 2
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {generatingSceneId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <div>
                      <p className="text-white font-medium">{renderProgress?.message || "Generating..."}</p>
                      <p className="text-sm text-zinc-400">
                        {renderProgress?.status === "queued" && "Waiting in queue..."}
                        {renderProgress?.status === "generating" && "AI is creating your video - this may take 2-8 minutes"}
                        {renderProgress?.status === "downloading" && "Downloading generated video..."}
                        {renderProgress?.status === "complete" && "Video ready!"}
                        {renderProgress?.status === "error" && "An error occurred"}
                      </p>
                    </div>
                  </div>
                  <Progress value={renderProgress?.progress || 0} className="h-3" />
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>{renderProgress?.progress || 0}% complete</span>
                    <span>
                      {renderProgress?.status === "generating" && "~3-5 min remaining"}
                      {renderProgress?.status === "downloading" && "Almost done..."}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 mt-4">
                    <p className="text-xs text-zinc-500 text-center">
                      ⚠️ Do not close this window. The video is being generated on Sora 2 servers.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Prompt</Label>
                    <Textarea data-testid="generate-prompt-input" placeholder="Describe the video you want to generate..."
                              value={generateConfig.prompt} onChange={(e) => setGenerateConfig({ ...generateConfig, prompt: e.target.value })}
                              className="bg-zinc-900/50 border-zinc-700 text-white resize-none h-32" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Duration</Label>
                      <Select value={generateConfig.duration.toString()}
                              onValueChange={(v) => setGenerateConfig({ ...generateConfig, duration: parseInt(v) })}>
                        <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700">
                          {VIDEO_DURATIONS.map((d) => (<SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Resolution</Label>
                      <Select value={generateConfig.size}
                              onValueChange={(v) => setGenerateConfig({ ...generateConfig, size: v })}>
                        <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700">
                          {VIDEO_SIZES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span>Estimated time: {generateConfig.size.includes("3840") ? "5-10" : "2-5"} minutes</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {generateConfig.size.includes("3840") && "⚠️ 4K videos take longer to generate"}
                    </p>
                  </div>
                </>
              )}
            </div>
            {!generatingSceneId && (
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowGenerateModal(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
                <Button data-testid="start-generate-btn" onClick={handleGenerateVideo}
                        className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
                  <Wand2 className="w-4 h-4 mr-2" /> Generate Video
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Export Modal */}
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent className="bg-[#18181B] border-zinc-800 text-white">
            <DialogHeader><DialogTitle className="font-chivo text-xl">Export Project</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Format</Label>
                  <Select value={exportConfig.format} onValueChange={(v) => setExportConfig({ ...exportConfig, format: v })}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                      <SelectItem value="mov">MOV (QuickTime)</SelectItem>
                      <SelectItem value="webm">WebM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Resolution</Label>
                  <Select value={exportConfig.resolution} onValueChange={(v) => setExportConfig({ ...exportConfig, resolution: v })}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Frame Rate</Label>
                  <Select value={exportConfig.fps.toString()} onValueChange={(v) => setExportConfig({ ...exportConfig, fps: parseInt(v) })}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="24">24 fps (Cinema)</SelectItem>
                      <SelectItem value="30">30 fps (Standard)</SelectItem>
                      <SelectItem value="60">60 fps (Smooth)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Audio</Label>
                  <Select value={exportConfig.include_audio.toString()}
                          onValueChange={(v) => setExportConfig({ ...exportConfig, include_audio: v === "true" })}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="true">Include Audio</SelectItem>
                      <SelectItem value="false">Video Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-sm text-zinc-400">
                  {scenes.filter(s => s.video_path || s.video_url).length} of {scenes.length} scenes have video ready for export.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowExportModal(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
              <Button data-testid="export-submit-btn" onClick={handleExport} disabled={exporting}
                      className="bg-white text-black hover:bg-zinc-200">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Keyboard Shortcuts Modal */}
        <Dialog open={showShortcutsModal} onOpenChange={setShowShortcutsModal}>
          <DialogContent className="bg-[#18181B] border-zinc-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-chivo text-xl flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#4ec9b0]" /> Keyboard Shortcuts
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Playback */}
              <div>
                <h4 className="text-sm font-semibold text-[#4ec9b0] mb-3">Playback</h4>
                <div className="space-y-2">
                  <ShortcutRow keys="Space" description="Play / Pause" />
                  <ShortcutRow keys="←" description="Previous frame" />
                  <ShortcutRow keys="→" description="Next frame" />
                  <ShortcutRow keys="Esc" description="Stop playback" />
                  <ShortcutRow keys="Home" description="Go to start" />
                  <ShortcutRow keys="End" description="Go to end" />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-[#4ec9b0] mb-3">Timeline</h4>
                <div className="space-y-2">
                  <ShortcutRow keys="⌘ +" description="Zoom in" />
                  <ShortcutRow keys="⌘ -" description="Zoom out" />
                  <ShortcutRow keys="⌘ 0" description="Fit to view" />
                  <ShortcutRow keys="⌘ B" description="Split clip" />
                  <ShortcutRow keys="Delete" description="Delete selected" />
                </div>
              </div>

              {/* General */}
              <div>
                <h4 className="text-sm font-semibold text-[#4ec9b0] mb-3">General</h4>
                <div className="space-y-2">
                  <ShortcutRow keys="⌘ S" description="Save project" />
                  <ShortcutRow keys="⌘ Z" description="Undo" />
                  <ShortcutRow keys="⌘ ⇧ Z" description="Redo" />
                  <ShortcutRow keys="⌘ N" description="New scene" />
                  <ShortcutRow keys="⌘ E" description="Export" />
                </div>
              </div>

              {/* AI & Editing */}
              <div>
                <h4 className="text-sm font-semibold text-[#4ec9b0] mb-3">AI & Editing</h4>
                <div className="space-y-2">
                  <ShortcutRow keys="⌘ I" description="Focus AI chat" />
                  <ShortcutRow keys="⌘ G" description="Generate scene" />
                  <ShortcutRow keys="⌘ C" description="Copy" />
                  <ShortcutRow keys="⌘ V" description="Paste" />
                  <ShortcutRow keys="⌘ D" description="Duplicate" />
                </div>
              </div>
            </div>
            <div className="text-xs text-zinc-500 text-center pt-2 border-t border-zinc-800">
              Use Ctrl instead of ⌘ on Windows/Linux
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Shortcut Row Component
function ShortcutRow({ keys, description }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">{description}</span>
      <div className="flex gap-1">
        {keys.split(' ').map((key, idx) => (
          <span key={idx} className="shortcut-key">{key}</span>
        ))}
      </div>
    </div>
  );
}
