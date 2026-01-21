import React, { useState } from "react";
import {
  Film, Sparkles, Play, Clock, Users, Music,
  Clapperboard, Video, Camera, Palette, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PROJECT_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Project",
    description: "Start from scratch with a clean canvas",
    icon: Film,
    color: "from-zinc-600 to-zinc-800",
    scenes: 0,
    duration: 0,
    style: "custom"
  },
  {
    id: "short-film",
    name: "Short Film",
    description: "Perfect for narrative storytelling (3-10 minutes)",
    icon: Clapperboard,
    color: "from-purple-600 to-purple-800",
    scenes: 5,
    duration: 300,
    style: "cinematic",
    template: {
      scenes: [
        { name: "Opening", duration: 10, prompt: "Establishing shot to set the scene" },
        { name: "Act 1 - Setup", duration: 60, prompt: "Introduce characters and setting" },
        { name: "Act 2 - Conflict", duration: 120, prompt: "Build tension and conflict" },
        { name: "Climax", duration: 60, prompt: "Peak moment of the story" },
        { name: "Resolution", duration: 50, prompt: "Wrap up and conclusion" }
      ]
    }
  },
  {
    id: "commercial",
    name: "Commercial",
    description: "High-impact ads for products and services (15-60 sec)",
    icon: Video,
    color: "from-orange-500 to-red-600",
    scenes: 4,
    duration: 30,
    style: "dynamic",
    template: {
      scenes: [
        { name: "Hook", duration: 3, prompt: "Attention-grabbing opening" },
        { name: "Problem", duration: 8, prompt: "Present the problem or need" },
        { name: "Solution", duration: 12, prompt: "Introduce the product/service" },
        { name: "Call to Action", duration: 7, prompt: "Clear CTA with branding" }
      ]
    }
  },
  {
    id: "music-video",
    name: "Music Video",
    description: "Visual storytelling set to music (3-5 minutes)",
    icon: Music,
    color: "from-pink-500 to-purple-600",
    scenes: 8,
    duration: 210,
    style: "artistic",
    template: {
      scenes: [
        { name: "Intro Visual", duration: 15, prompt: "Atmospheric opening" },
        { name: "Verse 1", duration: 30, prompt: "Story begins" },
        { name: "Pre-Chorus", duration: 15, prompt: "Build up energy" },
        { name: "Chorus 1", duration: 30, prompt: "Visual climax" },
        { name: "Verse 2", duration: 30, prompt: "Story develops" },
        { name: "Chorus 2", duration: 30, prompt: "Peak visuals" },
        { name: "Bridge", duration: 30, prompt: "Change of pace" },
        { name: "Outro", duration: 30, prompt: "Closing visuals" }
      ]
    }
  },
  {
    id: "documentary",
    name: "Documentary",
    description: "Interview-style or observational content",
    icon: Camera,
    color: "from-blue-500 to-cyan-600",
    scenes: 6,
    duration: 600,
    style: "documentary",
    template: {
      scenes: [
        { name: "Opening", duration: 60, prompt: "Hook and introduction" },
        { name: "Background", duration: 120, prompt: "Context and history" },
        { name: "Main Story", duration: 180, prompt: "Core narrative" },
        { name: "Interviews", duration: 120, prompt: "Expert opinions" },
        { name: "Resolution", duration: 90, prompt: "Conclusion and impact" },
        { name: "Credits", duration: 30, prompt: "End credits" }
      ]
    }
  },
  {
    id: "social-media",
    name: "Social Media",
    description: "Quick, engaging content for TikTok, Reels, Shorts",
    icon: Sparkles,
    color: "from-green-500 to-emerald-600",
    scenes: 3,
    duration: 30,
    style: "trendy",
    template: {
      scenes: [
        { name: "Hook", duration: 3, prompt: "Instant attention grab" },
        { name: "Content", duration: 20, prompt: "Main message or entertainment" },
        { name: "CTA/Outro", duration: 7, prompt: "Engagement prompt" }
      ]
    }
  }
];

export function ProjectTemplates({ onSelect, onCancel }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [step, setStep] = useState("select"); // select | customize

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setProjectName(template.name + " Project");
    setStep("customize");
  };

  const handleCreate = () => {
    if (!projectName.trim()) return;
    
    onSelect?.({
      name: projectName,
      template: selectedTemplate,
      style_guide: selectedTemplate.style,
      scenes: selectedTemplate.template?.scenes || []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-[#1e1e1e] rounded-2xl border border-[#3c3c3c] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-[#252526] border-b border-[#3c3c3c]">
          <h2 className="text-2xl font-bold text-white">
            {step === "select" ? "Choose a Template" : "Customize Project"}
          </h2>
          <p className="text-[#858585] mt-1">
            {step === "select"
              ? "Start with a template or create from scratch"
              : `Creating ${selectedTemplate?.name}`}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "select" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PROJECT_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={cn(
                      "relative overflow-hidden rounded-xl border border-[#3c3c3c] p-5 text-left transition-all hover:border-[#4ec9b0] hover:shadow-lg group",
                      "bg-gradient-to-br",
                      template.color.replace("from-", "hover:from-").replace("to-", "hover:to-"),
                      "hover:bg-opacity-20"
                    )}
                  >
                    {/* Background gradient on hover */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br",
                      template.color
                    )} />
                    
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                        template.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="font-semibold text-white mb-1">
                        {template.name}
                      </h3>
                      <p className="text-xs text-[#858585] mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-[#6a6a6a]">
                        <span className="flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          {template.scenes} scenes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {template.duration > 0 ? formatDuration(template.duration) : "Custom"}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a6a6a] group-hover:text-[#4ec9b0] transition-colors" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm text-[#cccccc]">Project Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="bg-[#2d2d30] border-[#3c3c3c] text-white"
                />
              </div>

              {/* Template Preview */}
              {selectedTemplate?.template?.scenes && (
                <div className="space-y-2">
                  <label className="text-sm text-[#cccccc]">Template Scenes</label>
                  <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] p-4 max-h-64 overflow-y-auto">
                    {selectedTemplate.template.scenes.map((scene, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 py-2 border-b border-[#3c3c3c] last:border-0"
                      >
                        <div className="w-8 h-8 rounded bg-[#3c3c3c] flex items-center justify-center text-xs text-[#858585]">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium truncate">
                            {scene.name}
                          </div>
                          <div className="text-xs text-[#6a6a6a] truncate">
                            {scene.prompt}
                          </div>
                        </div>
                        <div className="text-xs text-[#858585]">
                          {scene.duration}s
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Preview */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2 text-[#858585]">
                  <Palette className="w-4 h-4" />
                  Style: <span className="text-[#4ec9b0] capitalize">{selectedTemplate?.style}</span>
                </div>
                <div className="flex items-center gap-2 text-[#858585]">
                  <Film className="w-4 h-4" />
                  Scenes: <span className="text-[#4ec9b0]">{selectedTemplate?.scenes}</span>
                </div>
                <div className="flex items-center gap-2 text-[#858585]">
                  <Clock className="w-4 h-4" />
                  Duration: <span className="text-[#4ec9b0]">{formatDuration(selectedTemplate?.duration || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-[#252526] border-t border-[#3c3c3c]">
          <Button
            variant="ghost"
            onClick={step === "select" ? onCancel : () => setStep("select")}
            className="text-[#858585] hover:text-white"
          >
            {step === "select" ? "Cancel" : "Back"}
          </Button>
          
          {step === "customize" && (
            <Button
              onClick={handleCreate}
              disabled={!projectName.trim()}
              className="bg-[#4ec9b0] hover:bg-[#3db89e] text-black font-medium px-6"
            >
              <Play className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export default ProjectTemplates;
