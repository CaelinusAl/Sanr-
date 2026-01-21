import React, { useState, useEffect, useRef } from "react";
import {
  Film, ChevronDown, ChevronRight, X, Play, Pause,
  CheckCircle, XCircle, Clock, Loader2, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const STAGE_CONFIG = {
  queued: { icon: Clock, color: "text-[#858585]", label: "Queued" },
  initializing: { icon: Loader2, color: "text-[#569cd6]", label: "Initializing", animate: true },
  generating: { icon: Film, color: "text-[#dcdcaa]", label: "Generating", animate: true },
  downloading: { icon: Loader2, color: "text-[#4ec9b0]", label: "Downloading", animate: true },
  post_processing: { icon: Loader2, color: "text-[#c586c0]", label: "Processing", animate: true },
  complete: { icon: CheckCircle, color: "text-[#4ec9b0]", label: "Complete" },
  failed: { icon: XCircle, color: "text-[#f44747]", label: "Failed" },
  cancelled: { icon: XCircle, color: "text-[#858585]", label: "Cancelled" },
};

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

export function RenderingConsole({
  renders = [],
  onCancelRender,
  onRetryRender,
  onClearCompleted,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState("all");
  const consoleEndRef = useRef(null);

  // Auto-scroll when new renders are added
  useEffect(() => {
    if (isExpanded) {
      consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [renders.length, isExpanded]);

  // Filter renders
  const filteredRenders = renders.filter((render) => {
    switch (filter) {
      case "active":
        return ["queued", "initializing", "generating", "downloading", "post_processing"].includes(
          render.stage
        );
      case "completed":
        return render.stage === "complete";
      case "failed":
        return render.stage === "failed" || render.stage === "cancelled";
      default:
        return true;
    }
  });

  // Count active renders
  const activeCount = renders.filter((r) =>
    ["queued", "initializing", "generating", "downloading", "post_processing"].includes(r.stage)
  ).length;

  const completedCount = renders.filter((r) => r.stage === "complete").length;
  const failedCount = renders.filter((r) => r.stage === "failed" || r.stage === "cancelled").length;

  return (
    <div
      className={cn(
        "bg-[#1e1e1e] border-t border-[#3c3c3c] transition-all duration-300",
        isExpanded ? "h-64" : "h-10"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 h-10 bg-[#252526] border-b border-[#3c3c3c] cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button className="text-[#858585] hover:text-[#cccccc]">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#4ec9b0]" />
            <span className="text-sm font-medium text-[#cccccc]">Rendering</span>
          </div>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] bg-[#dcdcaa] text-[#1e1e1e] rounded font-medium">
              {activeCount} active
            </span>
          )}
          {completedCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] bg-[#4ec9b0]/20 text-[#4ec9b0] rounded">
              {completedCount} done
            </span>
          )}
          {failedCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] bg-[#f44747]/20 text-[#f44747] rounded">
              {failedCount} failed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Filter Buttons */}
          <div className="flex gap-1">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "px-2 py-1 text-[11px] rounded transition-colors",
                  filter === option.id
                    ? "bg-[#0e639c] text-white"
                    : "text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Clear Completed */}
          {completedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCompleted}
              className="h-6 px-2 text-[11px] text-[#858585] hover:text-[#cccccc]"
            >
              Clear Done
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <ScrollArea className="h-[calc(100%-40px)]">
          <div className="p-3 space-y-2">
            {filteredRenders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Film className="w-10 h-10 text-[#858585] opacity-50 mb-3" />
                <p className="text-[#858585] text-sm">
                  {filter !== "all"
                    ? `No ${filter} renders`
                    : "No renders in queue"}
                </p>
                <p className="text-[#6a6a6a] text-xs mt-1">
                  Generate scenes to see them here
                </p>
              </div>
            ) : (
              <>
                {filteredRenders.map((render) => (
                  <RenderItem
                    key={render.renderId}
                    render={render}
                    onCancel={() => onCancelRender?.(render.renderId)}
                    onRetry={() => onRetryRender?.(render.renderId)}
                  />
                ))}
                <div ref={consoleEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function RenderItem({ render, onCancel, onRetry }) {
  const config = STAGE_CONFIG[render.stage] || STAGE_CONFIG.queued;
  const Icon = config.icon;
  
  const canCancel = ["queued", "initializing", "generating"].includes(render.stage);
  const canRetry = render.stage === "failed";

  const formatETA = (seconds) => {
    if (!seconds) return null;
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    return `${Math.ceil(seconds / 60)}m`;
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors",
        render.stage === "complete" && "bg-[#4ec9b0]/5 border-[#4ec9b0]/30",
        render.stage === "failed" && "bg-[#f44747]/5 border-[#f44747]/30",
        render.stage === "generating" && "bg-[#dcdcaa]/5 border-[#dcdcaa]/30",
        !["complete", "failed", "generating"].includes(render.stage) &&
          "bg-[#2d2d30] border-[#3c3c3c]"
      )}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "w-4 h-4",
              config.color,
              config.animate && "animate-spin"
            )}
          />
          <span className="text-sm font-medium text-[#cccccc] truncate max-w-[180px]">
            {render.sceneName || render.renderId}
          </span>
          <span
            className={cn(
              "px-1.5 py-0.5 text-[10px] rounded",
              config.color,
              "bg-current/10"
            )}
          >
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {render.estimatedTimeRemaining && (
            <span className="text-[11px] text-[#858585] mr-2">
              ETA: {formatETA(render.estimatedTimeRemaining)}
            </span>
          )}
          
          {canCancel && (
            <button
              onClick={onCancel}
              className="p-1 text-[#858585] hover:text-[#f44747] hover:bg-[#f44747]/10 rounded transition-colors"
              title="Cancel render"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          
          {canRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2 text-[11px] text-[#4ec9b0] hover:bg-[#4ec9b0]/10"
            >
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Message */}
      <p className="text-xs text-[#858585] mb-2 truncate">{render.message}</p>

      {/* Progress Bar */}
      {!["complete", "failed", "cancelled"].includes(render.stage) && (
        <div className="flex items-center gap-2">
          <Progress
            value={render.progress || 0}
            className="h-1.5 flex-1 bg-[#3c3c3c]"
          />
          <span className="text-[11px] text-[#858585] w-10 text-right">
            {(render.progress || 0).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Error Message */}
      {render.stage === "failed" && render.error && (
        <p className="text-xs text-[#f44747] mt-2 p-2 bg-[#f44747]/10 rounded">
          {render.error}
        </p>
      )}

      {/* Completion Info */}
      {render.stage === "complete" && render.videoUrl && (
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-[#4ec9b0] hover:bg-[#4ec9b0]/10"
            onClick={() => window.open(render.videoUrl, "_blank")}
          >
            View Video
          </Button>
        </div>
      )}
    </div>
  );
}

export default RenderingConsole;
