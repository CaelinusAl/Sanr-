import React, { useState, useEffect } from "react";
import {
  ClipboardList, RefreshCw, Film, Settings, Sparkles,
  Users, Sun, Palette, BarChart3, Sliders, Eye,
  Clock, DollarSign, Calendar, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const RESOLUTIONS = [
  { value: "1920x1080", label: "1920×1080 (1080p)" },
  { value: "1280x720", label: "1280×720 (720p)" },
  { value: "3840x2160", label: "3840×2160 (4K)" },
  { value: "1792x1024", label: "1792×1024 (Widescreen)" },
  { value: "1024x1792", label: "1024×1792 (Portrait)" },
];

const FPS_OPTIONS = [
  { value: 24, label: "24 fps (Cinema)" },
  { value: 30, label: "30 fps (Standard)" },
  { value: 60, label: "60 fps (Smooth)" },
];

export function SceneProperties({
  scene,
  onSceneUpdate,
  onAnalyze,
  isAnalyzing = false,
  analysis = null,
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [localEffects, setLocalEffects] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    slowMotion: false,
    blurBackground: false,
    stabilization: false,
    noiseReduction: false,
  });

  // Reset effects when scene changes
  useEffect(() => {
    if (scene?.effects) {
      setLocalEffects(scene.effects);
    } else {
      setLocalEffects({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        slowMotion: false,
        blurBackground: false,
        stabilization: false,
        noiseReduction: false,
      });
    }
  }, [scene?.id]);

  const handleEffectChange = (key, value) => {
    const newEffects = { ...localEffects, [key]: value };
    setLocalEffects(newEffects);
    if (scene && onSceneUpdate) {
      onSceneUpdate({ ...scene, effects: newEffects });
    }
  };

  if (!scene) {
    return (
      <div className="flex flex-col h-full bg-[#1e1e1e]">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-[#3c3c3c]">
          <ClipboardList className="w-4 h-4 text-[#cccccc]" />
          <h3 className="font-semibold text-sm text-[#cccccc]">Properties</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <ClipboardList className="w-12 h-12 text-[#858585] mb-4 opacity-50" />
          <p className="text-[#cccccc] mb-2">No scene selected</p>
          <p className="text-xs text-[#858585]">
            Select a scene from timeline to view properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#cccccc]" />
          <h3 className="font-semibold text-sm text-[#cccccc]">Properties</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="h-7 w-7 text-[#cccccc] hover:bg-[#3c3c3c]"
          title="Re-analyze scene"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isAnalyzing && "animate-spin")} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3c3c3c]">
        {[
          { id: "general", label: "General", icon: Settings },
          { id: "analysis", label: "Analysis", icon: BarChart3 },
          { id: "effects", label: "Effects", icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "text-[#4ec9b0] border-b-2 border-[#4ec9b0] bg-[#2d2d30]"
                : "text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30]"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {activeTab === "general" && (
            <GeneralTab scene={scene} onSceneUpdate={onSceneUpdate} />
          )}
          {activeTab === "analysis" && (
            <AnalysisTab
              scene={scene}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onAnalyze={onAnalyze}
            />
          )}
          {activeTab === "effects" && (
            <EffectsTab
              effects={localEffects}
              onEffectChange={handleEffectChange}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// General Tab
function GeneralTab({ scene, onSceneUpdate }) {
  const handleChange = (key, value) => {
    if (onSceneUpdate) {
      onSceneUpdate({ ...scene, [key]: value });
    }
  };

  const resolution = scene.metadata?.resolution || { width: 1920, height: 1080 };
  const resolutionValue = `${resolution.width}x${resolution.height}`;

  return (
    <div className="space-y-4">
      {/* Scene ID */}
      <PropertyGroup label="Scene ID" icon={Film}>
        <Input
          value={scene.id || ""}
          disabled
          className="h-8 bg-[#3c3c3c] border-[#5a5a5a] text-[#858585] text-xs"
        />
      </PropertyGroup>

      {/* Name */}
      <PropertyGroup label="Name" icon={Film}>
        <Input
          value={scene.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          className="h-8 bg-[#3c3c3c] border-[#5a5a5a] text-[#cccccc] text-xs"
          placeholder="Scene name"
        />
      </PropertyGroup>

      {/* Duration */}
      <PropertyGroup label="Duration" icon={Clock}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={scene.duration || 5}
            onChange={(e) => handleChange("duration", parseFloat(e.target.value) || 5)}
            step="0.1"
            min="0.1"
            max="60"
            className="h-8 bg-[#3c3c3c] border-[#5a5a5a] text-[#cccccc] text-xs flex-1"
          />
          <span className="text-xs text-[#858585]">seconds</span>
        </div>
      </PropertyGroup>

      {/* Resolution */}
      <PropertyGroup label="Resolution" icon={Eye}>
        <Select
          value={resolutionValue}
          onValueChange={(value) => {
            const [width, height] = value.split("x").map(Number);
            handleChange("metadata", {
              ...scene.metadata,
              resolution: { width, height },
            });
          }}
        >
          <SelectTrigger className="h-8 bg-[#3c3c3c] border-[#5a5a5a] text-[#cccccc] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#252526] border-[#3c3c3c]">
            {RESOLUTIONS.map((res) => (
              <SelectItem key={res.value} value={res.value} className="text-xs">
                {res.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PropertyGroup>

      {/* Frame Rate */}
      <PropertyGroup label="Frame Rate" icon={Film}>
        <Select
          value={(scene.metadata?.fps || 30).toString()}
          onValueChange={(value) => {
            handleChange("metadata", {
              ...scene.metadata,
              fps: parseInt(value),
            });
          }}
        >
          <SelectTrigger className="h-8 bg-[#3c3c3c] border-[#5a5a5a] text-[#cccccc] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#252526] border-[#3c3c3c]">
            {FPS_OPTIONS.map((fps) => (
              <SelectItem key={fps.value} value={fps.value.toString()} className="text-xs">
                {fps.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PropertyGroup>

      {/* File Size */}
      {scene.fileSize && (
        <PropertyGroup label="File Size" icon={Film}>
          <Input
            value={`${(scene.fileSize / 1024 / 1024).toFixed(2)} MB`}
            disabled
            className="h-8 bg-[#3c3c3c] border-[#5a5a5a] text-[#858585] text-xs"
          />
        </PropertyGroup>
      )}

      {/* Generation Cost */}
      {scene.cost !== undefined && (
        <PropertyGroup label="Generation Cost" icon={DollarSign}>
          <Input
            value={`$${scene.cost.toFixed(2)}`}
            disabled
            className="h-8 bg-[#3c3c3c] border-[#5a5a5a] text-[#858585] text-xs"
          />
        </PropertyGroup>
      )}

      {/* Created At */}
      {scene.createdAt && (
        <PropertyGroup label="Created" icon={Calendar}>
          <Input
            value={new Date(scene.createdAt).toLocaleString()}
            disabled
            className="h-8 bg-[#3c3c3c] border-[#5a5a5a] text-[#858585] text-xs"
          />
        </PropertyGroup>
      )}

      {/* Status */}
      <PropertyGroup label="Status" icon={BarChart3}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              scene.status === "ready" && "bg-green-500",
              scene.status === "generating" && "bg-blue-500 animate-pulse",
              scene.status === "pending" && "bg-yellow-500",
              scene.status === "error" && "bg-red-500"
            )}
          />
          <span className="text-xs text-[#cccccc] capitalize">
            {scene.status || "pending"}
          </span>
        </div>
      </PropertyGroup>
    </div>
  );
}

// Analysis Tab
function AnalysisTab({ scene, analysis, isAnalyzing, onAnalyze }) {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#4ec9b0] animate-spin mb-3" />
        <p className="text-[#cccccc] text-sm">Analyzing scene...</p>
        <p className="text-[#858585] text-xs mt-1">This may take a moment</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BarChart3 className="w-12 h-12 text-[#858585] mb-4 opacity-50" />
        <p className="text-[#cccccc] mb-2">No analysis data</p>
        <Button
          onClick={onAnalyze}
          size="sm"
          className="bg-[#0e639c] hover:bg-[#1177bb] text-white"
        >
          <BarChart3 className="w-3.5 h-3.5 mr-1" />
          Analyze Scene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Characters */}
      <AnalysisSection title="Characters" icon={Users} count={analysis.characters?.length}>
        {analysis.characters?.length > 0 ? (
          <div className="space-y-2">
            {analysis.characters.map((char, idx) => (
              <div
                key={idx}
                className="p-2 bg-[#2d2d30] rounded border border-[#3c3c3c]"
              >
                <div className="text-sm text-[#4ec9b0] font-medium">{char.name}</div>
                <div className="flex gap-3 mt-1 text-xs text-[#858585]">
                  <span>Emotion: {char.emotion}</span>
                  <span>Pose: {char.pose}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#858585] italic">No characters detected</p>
        )}
      </AnalysisSection>

      {/* Lighting */}
      <AnalysisSection title="Lighting" icon={Sun}>
        <div className="space-y-3">
          <MetricBar
            label="Brightness"
            value={analysis.lighting?.brightness || 0}
          />
          <MetricBar
            label="Contrast"
            value={analysis.lighting?.contrast || 0}
          />
        </div>
      </AnalysisSection>

      {/* Composition */}
      <AnalysisSection title="Composition" icon={Palette}>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#858585]">Rule of Thirds</span>
            <span className="text-[#dcdcaa]">
              {((analysis.composition?.ruleOfThirds || 0) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#858585]">Balance</span>
            <span className="text-[#dcdcaa]">
              {((analysis.composition?.balance || 0) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </AnalysisSection>

      {/* Quality */}
      <AnalysisSection title="Quality" icon={Sparkles}>
        <div className="grid grid-cols-3 gap-2">
          <QualityItem label="Overall" value={analysis.quality?.overall} />
          <QualityItem label="Sharpness" value={analysis.quality?.sharpness} />
          <QualityItem label="Noise" value={analysis.quality?.noise} />
        </div>
      </AnalysisSection>
    </div>
  );
}

// Effects Tab
function EffectsTab({ effects, onEffectChange }) {
  return (
    <div className="space-y-6">
      {/* Color Grading */}
      <div>
        <h4 className="text-xs font-semibold text-[#4ec9b0] mb-3 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" />
          Color Grading
        </h4>
        <div className="space-y-4">
          <EffectSlider
            label="Brightness"
            value={effects.brightness}
            onChange={(v) => onEffectChange("brightness", v)}
            min={-100}
            max={100}
          />
          <EffectSlider
            label="Contrast"
            value={effects.contrast}
            onChange={(v) => onEffectChange("contrast", v)}
            min={-100}
            max={100}
          />
          <EffectSlider
            label="Saturation"
            value={effects.saturation}
            onChange={(v) => onEffectChange("saturation", v)}
            min={-100}
            max={100}
          />
          <EffectSlider
            label="Hue"
            value={effects.hue}
            onChange={(v) => onEffectChange("hue", v)}
            min={-180}
            max={180}
          />
        </div>
      </div>

      {/* Effects */}
      <div>
        <h4 className="text-xs font-semibold text-[#4ec9b0] mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Effects
        </h4>
        <div className="space-y-3">
          <EffectToggle
            label="Slow Motion"
            checked={effects.slowMotion}
            onChange={(v) => onEffectChange("slowMotion", v)}
          />
          <EffectToggle
            label="Blur Background"
            checked={effects.blurBackground}
            onChange={(v) => onEffectChange("blurBackground", v)}
          />
          <EffectToggle
            label="Stabilization"
            checked={effects.stabilization}
            onChange={(v) => onEffectChange("stabilization", v)}
          />
          <EffectToggle
            label="Noise Reduction"
            checked={effects.noiseReduction}
            onChange={(v) => onEffectChange("noiseReduction", v)}
          />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function PropertyGroup({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-[#858585] flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

function AnalysisSection({ title, icon: Icon, count, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-[#4ec9b0] mb-2 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        {title}
        {count !== undefined && (
          <span className="text-[#858585]">({count})</span>
        )}
      </h4>
      {children}
    </div>
  );
}

function MetricBar({ label, value }) {
  const percentage = (value * 100).toFixed(0);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#858585]">{label}</span>
        <span className="text-[#dcdcaa]">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-[#3c3c3c] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4ec9b0] rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function QualityItem({ label, value }) {
  return (
    <div className="text-center p-2 bg-[#2d2d30] rounded">
      <div className="text-lg font-bold text-[#dcdcaa]">{value || 0}</div>
      <div className="text-[10px] text-[#858585]">{label}</div>
    </div>
  );
}

function EffectSlider({ label, value, onChange, min, max }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[#cccccc]">{label}</span>
        <span className="text-[#858585]">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
        className="cursor-pointer"
      />
    </div>
  );
}

function EffectToggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#cccccc]">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#4ec9b0]"
      />
    </div>
  );
}

export default SceneProperties;
