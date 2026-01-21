import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Square,
  Plus, ZoomIn, ZoomOut, Settings, Download,
  Clapperboard, ChevronLeft, Film, Users,
  Folder, AlertTriangle, Sparkles, Send,
  Trash2, MoreVertical, Wand2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PIXELS_PER_SECOND = 50;

export default function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Project State
  const [project, setProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Timeline State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedScene, setSelectedScene] = useState(null);
  const [draggingScene, setDraggingScene] = useState(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  // Modal State
  const [showCreateScene, setShowCreateScene] = useState(false);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [continuityIssues, setContinuityIssues] = useState([]);
  
  // New Scene Form
  const [newScene, setNewScene] = useState({
    name: "",
    description: "",
    prompt: "",
    duration: 5,
    characters: [],
  });
  
  // New Character Form
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    reference_images: [],
  });
  
  // Refs
  const timelineRef = useRef(null);
  const chatEndRef = useRef(null);
  const playbackRef = useRef(null);

  // Load project data
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, scenesRes, charsRes, assetsRes, chatRes] = await Promise.all([
        axios.get(`${API}/projects/${projectId}`),
        axios.get(`${API}/projects/${projectId}/scenes`),
        axios.get(`${API}/projects/${projectId}/characters`),
        axios.get(`${API}/projects/${projectId}/assets`),
        axios.get(`${API}/projects/${projectId}/chat-history`),
      ]);
      
      setProject(projectRes.data);
      setScenes(scenesRes.data);
      setCharacters(charsRes.data);
      setAssets(assetsRes.data);
      setChatMessages(chatRes.data);
      
      // Check continuity
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
        prev.map((s) =>
          s.id === sceneId ? { ...s, start_time: newStartTime } : s
        )
      );
    };
    
    const handleMouseUp = async () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setDraggingScene(null);
      
      // Save new position
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        try {
          await axios.put(`${API}/scenes/${sceneId}`, {
            start_time: scene.start_time,
          });
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
      const maxEndTime = scenes.reduce(
        (max, s) => Math.max(max, s.start_time + s.duration),
        0
      );

      const response = await axios.post(`${API}/scenes`, {
        project_id: projectId,
        name: newScene.name,
        description: newScene.description,
        prompt: newScene.prompt,
        duration: newScene.duration,
        start_time: maxEndTime,
        characters: newScene.characters,
      });

      setScenes([...scenes, response.data]);
      setShowCreateScene(false);
      setNewScene({ name: "", description: "", prompt: "", duration: 5, characters: [] });
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

  const handleGenerateScene = async (sceneId) => {
    try {
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId ? { ...s, status: "generating", render_progress: 0 } : s
        )
      );

      const response = await axios.post(`${API}/scenes/${sceneId}/generate`);

      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId
            ? { ...s, status: "ready", render_progress: 100, thumbnail: response.data.video_url }
            : s
        )
      );

      toast.success("Scene generated (MOCKED)");
    } catch (error) {
      console.error("Error generating scene:", error);
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, status: "error" } : s))
      );
      toast.error("Failed to generate scene");
    }
  };

  // Character functions
  const handleCreateCharacter = async () => {
    if (!newCharacter.name.trim()) {
      toast.error("Character name is required");
      return;
    }

    try {
      const response = await axios.post(`${API}/characters`, {
        project_id: projectId,
        ...newCharacter,
      });

      setCharacters([...characters, response.data]);
      setShowCreateCharacter(false);
      setNewCharacter({ name: "", description: "", reference_images: [] });
      toast.success("Character created");
    } catch (error) {
      console.error("Error creating character:", error);
      toast.error("Failed to create character");
    }
  };

  // Chat functions
  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    // Optimistic update
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: userMessage },
    ]);

    try {
      const response = await axios.post(`${API}/chat`, {
        project_id: projectId,
        message: userMessage,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: response.data.id,
          role: "assistant",
          content: response.data.message,
          scene_plan: response.data.scene_plan,
        },
      ]);

      // If AI suggested a scene plan, offer to create it
      if (response.data.scene_plan) {
        toast.info("AI Director suggested a scene! Click 'Create Scene' to add it.");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response");
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateFromPlan = (scenePlan) => {
    setNewScene({
      name: scenePlan.name || "New Scene",
      description: scenePlan.description || "",
      prompt: scenePlan.visual_prompt || "",
      duration: scenePlan.duration || 5,
      characters: scenePlan.characters || [],
    });
    setShowCreateScene(true);
  };

  // Export
  const handleExport = async () => {
    try {
      const response = await axios.post(`${API}/projects/${projectId}/export`, {
        project_id: projectId,
        format: "json",
      });

      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.name || "project"}-export.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Timeline exported");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export timeline");
    }
  };

  const getPreviewImage = () => {
    const currentScene = scenes.find(
      (s) => currentTime >= s.start_time && currentTime < s.start_time + s.duration
    );
    return currentScene?.thumbnail || null;
  };

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
            <button
              data-testid="back-to-projects-btn"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
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
                  <Button
                    data-testid="continuity-issues-btn"
                    variant="ghost"
                    size="sm"
                    className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {continuityIssues.length}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{continuityIssues.length} continuity issues detected</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              data-testid="export-btn"
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-zinc-400 hover:text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              data-testid="settings-btn"
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Assets */}
          <div className="w-64 bg-[#09090B] border-r border-zinc-800 flex flex-col flex-shrink-0">
            <Tabs defaultValue="scenes" className="flex-1 flex flex-col">
              <TabsList className="mx-3 mt-3 bg-zinc-900">
                <TabsTrigger value="scenes" className="flex-1 data-[state=active]:bg-zinc-800">
                  <Film className="w-4 h-4 mr-1" />
                  Scenes
                </TabsTrigger>
                <TabsTrigger value="characters" className="flex-1 data-[state=active]:bg-zinc-800">
                  <Users className="w-4 h-4 mr-1" />
                  Characters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scenes" className="flex-1 mt-0 overflow-hidden">
                <div className="p-3">
                  <Button
                    data-testid="add-scene-btn"
                    onClick={() => setShowCreateScene(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Scene
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-2 pb-4">
                    {scenes.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-sm">
                        No scenes yet. Create one or ask the AI Director.
                      </div>
                    ) : (
                      scenes.map((scene) => (
                        <div
                          key={scene.id}
                          data-testid={`scene-card-${scene.id}`}
                          className={`scene-card p-3 rounded-lg border cursor-pointer ${
                            selectedScene?.id === scene.id
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                          }`}
                          onClick={() => {
                            setSelectedScene(scene);
                            setCurrentTime(scene.start_time);
                          }}
                        >
                          <div className="relative aspect-video rounded overflow-hidden mb-2 bg-zinc-800">
                            {scene.thumbnail ? (
                              <img
                                src={scene.thumbnail}
                                alt={scene.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <Film className="w-6 h-6" />
                              </div>
                            )}
                            {scene.status === "generating" && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 timecode text-[10px] bg-black/60 px-1 rounded">
                              {scene.duration.toFixed(1)}s
                            </div>
                          </div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-white truncate">
                                {scene.name}
                              </h4>
                              <span className="text-xs text-zinc-500 capitalize">
                                {scene.status}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    data-testid={`generate-scene-${scene.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGenerateScene(scene.id);
                                    }}
                                    className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
                                    disabled={scene.status === "generating"}
                                  >
                                    <Wand2 className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Generate Video</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    data-testid={`delete-scene-${scene.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteScene(scene.id);
                                    }}
                                    className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Scene</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="characters" className="flex-1 mt-0 overflow-hidden">
                <div className="p-3">
                  <Button
                    data-testid="add-character-btn"
                    onClick={() => setShowCreateCharacter(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Character
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-2 pb-4">
                    {characters.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-sm">
                        No characters yet. Create one to ensure consistency.
                      </div>
                    ) : (
                      characters.map((char) => (
                        <div
                          key={char.id}
                          data-testid={`character-card-${char.id}`}
                          className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-lg font-medium">
                              {char.name[0]}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white">{char.name}</h4>
                              <p className="text-xs text-zinc-500 truncate max-w-[140px]">
                                {char.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Preview & Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview Area */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px]">
              {getPreviewImage() ? (
                <img
                  src={getPreviewImage()}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                  data-testid="preview-image"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-zinc-600">
                  <Film className="w-16 h-16" />
                  <span className="text-sm">Select a scene to preview</span>
                </div>
              )}
              {/* Timecode Overlay */}
              <div className="absolute bottom-4 left-4 timecode text-lg bg-black/60 px-3 py-1 rounded">
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Timeline */}
            <div className="h-[280px] bg-[#09090B] border-t border-zinc-800 flex flex-col flex-shrink-0">
              {/* Timeline Toolbar */}
              <div className="h-10 bg-[#18181B] border-b border-zinc-800 flex items-center justify-between px-3">
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        data-testid="skip-back-btn"
                        onClick={() => setCurrentTime(0)}
                        className="transport-btn"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Go to Start</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        data-testid="play-pause-btn"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`transport-btn ${isPlaying ? "active" : ""}`}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{isPlaying ? "Pause" : "Play"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        data-testid="stop-btn"
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentTime(0);
                        }}
                        className="transport-btn"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Stop</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        data-testid="skip-forward-btn"
                        onClick={() => setCurrentTime(project?.total_duration || 60)}
                        className="transport-btn"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Go to End</TooltipContent>
                  </Tooltip>
                </div>

                <div className="timecode text-sm">
                  {formatTime(currentTime)} / {formatTime(project?.total_duration || 0)}
                </div>

                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        data-testid="zoom-out-btn"
                        onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                        className="transport-btn"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                  </Tooltip>
                  <span className="text-xs text-zinc-500 w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        data-testid="zoom-in-btn"
                        onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                        className="transport-btn"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                  </Tooltip>
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
                <div
                  ref={timelineRef}
                  className="flex-1 overflow-x-auto overflow-y-hidden relative"
                  onClick={handleTimelineClick}
                  data-testid="timeline-area"
                >
                  {/* Ruler */}
                  <div className="h-6 bg-[#18181B] border-b border-zinc-800 sticky top-0 z-10">
                    <div
                      className="h-full relative"
                      style={{ width: `${Math.max(1000, (project?.total_duration || 60) * PIXELS_PER_SECOND * zoom + 200)}px` }}
                    >
                      {Array.from({ length: Math.ceil((project?.total_duration || 60) / 5) + 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 h-full flex flex-col justify-end items-start"
                          style={{ left: `${i * 5 * PIXELS_PER_SECOND * zoom}px` }}
                        >
                          <span className="text-[10px] font-mono text-zinc-500 ml-1 mb-0.5">
                            {Math.floor((i * 5) / 60)}:{((i * 5) % 60).toString().padStart(2, "0")}
                          </span>
                          <div className="w-px h-2 bg-zinc-600" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Track */}
                  <div
                    className="track-row h-20 relative timeline-track"
                    style={{ width: `${Math.max(1000, (project?.total_duration || 60) * PIXELS_PER_SECOND * zoom + 200)}px` }}
                  >
                    {scenes
                      .filter((s) => s.track_index === 0)
                      .map((scene) => (
                        <div
                          key={scene.id}
                          data-testid={`timeline-clip-${scene.id}`}
                          className={`scene-clip absolute top-2 h-16 rounded-md border overflow-hidden ${
                            scene.status === "generating"
                              ? "border-blue-500 rendering"
                              : selectedScene?.id === scene.id
                              ? "border-blue-500 bg-blue-600"
                              : "border-blue-600/50 bg-blue-500/80"
                          } ${draggingScene === scene.id ? "dragging" : ""}`}
                          style={{
                            left: `${scene.start_time * PIXELS_PER_SECOND * zoom}px`,
                            width: `${Math.max(40, scene.duration * PIXELS_PER_SECOND * zoom)}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScene(scene);
                          }}
                          onMouseDown={(e) => handleSceneDrag(scene.id, e)}
                        >
                          <div className="h-full flex items-center px-2 gap-2">
                            {scene.thumbnail && (
                              <img
                                src={scene.thumbnail}
                                alt=""
                                className="h-12 w-16 object-cover rounded-sm flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-white truncate">
                                {scene.name}
                              </div>
                              <div className="text-[10px] text-white/70">
                                {scene.duration.toFixed(1)}s
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Audio Track */}
                  <div
                    className="track-row h-16 relative timeline-track border-t border-zinc-800"
                    style={{ width: `${Math.max(1000, (project?.total_duration || 60) * PIXELS_PER_SECOND * zoom + 200)}px` }}
                  >
                    {scenes
                      .filter((s) => s.track_index === 1)
                      .map((scene) => (
                        <div
                          key={scene.id}
                          data-testid={`audio-clip-${scene.id}`}
                          className={`scene-clip absolute top-2 h-12 rounded-md border bg-emerald-500/80 border-emerald-600/50 ${
                            draggingScene === scene.id ? "dragging" : ""
                          }`}
                          style={{
                            left: `${scene.start_time * PIXELS_PER_SECOND * zoom}px`,
                            width: `${Math.max(40, scene.duration * PIXELS_PER_SECOND * zoom)}px`,
                          }}
                          onMouseDown={(e) => handleSceneDrag(scene.id, e)}
                        >
                          <div className="h-full flex items-center px-2">
                            <span className="text-xs text-white truncate">{scene.name}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Playhead */}
                  <div
                    className="playhead"
                    style={{
                      left: `${currentTime * PIXELS_PER_SECOND * zoom}px`,
                      top: 0,
                      bottom: 0,
                    }}
                    data-testid="playhead"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - AI Director Chat */}
          <div className="w-[380px] bg-[#09090B] border-l border-zinc-800 flex flex-col flex-shrink-0">
            <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                <span className="font-chivo font-semibold text-white">AI Director</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await axios.delete(`${API}/projects/${projectId}/chat-history`);
                  setChatMessages([]);
                  toast.success("Chat cleared");
                }}
                className="text-zinc-400 hover:text-white text-xs"
                data-testid="clear-chat-btn"
              >
                Clear
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-[#8B5CF6] mx-auto mb-4 opacity-50" />
                    <p className="text-zinc-400 text-sm mb-2">
                      Start a conversation with your AI Director
                    </p>
                    <p className="text-zinc-500 text-xs">
                      Ask for scene ideas, script help, or creative direction
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      data-testid={`chat-message-${idx}`}
                      className={`p-3 rounded-lg ${
                        msg.role === "assistant"
                          ? "ai-message"
                          : "user-message"
                      } animate-fade-in`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === "assistant" ? (
                          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-zinc-600" />
                        )}
                        <span className="text-xs font-medium text-zinc-400">
                          {msg.role === "assistant" ? "AI Director" : "You"}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      {msg.scene_plan && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                          <Button
                            data-testid={`create-from-plan-${idx}`}
                            size="sm"
                            onClick={() => handleCreateFromPlan(msg.scene_plan)}
                            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Create This Scene
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="ai-message p-3 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#8B5CF6] animate-spin" />
                      <span className="text-xs text-zinc-400">AI Director is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <Textarea
                  data-testid="chat-input"
                  placeholder="Ask the AI Director..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-zinc-900/50 border-zinc-700 focus:border-zinc-500 text-white resize-none h-20 text-sm"
                />
              </div>
              <Button
                data-testid="send-chat-btn"
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || chatLoading}
                className="w-full mt-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
              >
                {chatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Create Scene Modal */}
        <Dialog open={showCreateScene} onOpenChange={setShowCreateScene}>
          <DialogContent className="bg-[#18181B] border-zinc-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-chivo text-xl">Create New Scene</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Scene Name</Label>
                <Input
                  data-testid="scene-name-input"
                  placeholder="Opening Shot"
                  value={newScene.name}
                  onChange={(e) => setNewScene({ ...newScene, name: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Description</Label>
                <Textarea
                  data-testid="scene-description-input"
                  placeholder="Brief description of the scene..."
                  value={newScene.description}
                  onChange={(e) => setNewScene({ ...newScene, description: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-700 text-white resize-none h-20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">AI Generation Prompt</Label>
                <Textarea
                  data-testid="scene-prompt-input"
                  placeholder="Detailed prompt for AI video generation..."
                  value={newScene.prompt}
                  onChange={(e) => setNewScene({ ...newScene, prompt: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-700 text-white resize-none h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Duration (seconds)</Label>
                  <Input
                    data-testid="scene-duration-input"
                    type="number"
                    min={1}
                    max={60}
                    value={newScene.duration}
                    onChange={(e) =>
                      setNewScene({ ...newScene, duration: parseFloat(e.target.value) || 5 })
                    }
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Characters</Label>
                  <select
                    data-testid="scene-characters-select"
                    multiple
                    value={newScene.characters}
                    onChange={(e) =>
                      setNewScene({
                        ...newScene,
                        characters: Array.from(e.target.selectedOptions, (o) => o.value),
                      })
                    }
                    className="w-full h-20 px-2 py-1 rounded-md bg-zinc-900/50 border border-zinc-700 text-white text-sm"
                  >
                    {characters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowCreateScene(false)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                data-testid="create-scene-submit-btn"
                onClick={handleCreateScene}
                className="bg-white text-black hover:bg-zinc-200"
              >
                Create Scene
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Character Modal */}
        <Dialog open={showCreateCharacter} onOpenChange={setShowCreateCharacter}>
          <DialogContent className="bg-[#18181B] border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="font-chivo text-xl">Create Character</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Character Name</Label>
                <Input
                  data-testid="character-name-input"
                  placeholder="John Doe"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Description</Label>
                <Textarea
                  data-testid="character-description-input"
                  placeholder="Physical appearance, personality traits..."
                  value={newCharacter.description}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, description: e.target.value })
                  }
                  className="bg-zinc-900/50 border-zinc-700 text-white resize-none h-24"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowCreateCharacter(false)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                data-testid="create-character-submit-btn"
                onClick={handleCreateCharacter}
                className="bg-white text-black hover:bg-zinc-200"
              >
                Create Character
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
