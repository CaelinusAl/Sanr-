import React, { useState, useEffect, useCallback } from "react";
import { 
  Folder, FolderOpen, Film, Users, Music, Sparkles, 
  Search, RefreshCw, FolderPlus, ChevronRight, ChevronDown,
  MoreVertical, Plus, Edit, Copy, Trash2, Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

const FOLDER_ICONS = {
  scenes: Film,
  characters: Users,
  audio: Music,
  effects: Sparkles
};

const FOLDER_COLORS = {
  scenes: "text-blue-400",
  characters: "text-purple-400",
  audio: "text-green-400",
  effects: "text-yellow-400"
};

export function AssetExplorer({
  scenes = [],
  characters = [],
  assets = [],
  onAssetSelect,
  onAssetDoubleClick,
  onAssetDelete,
  onRefresh,
  selectedAssetId,
  projectName = "Project"
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState(new Set(["scenes", "characters"]));

  const toggleFolder = (folder) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  // Filter by search
  const filteredScenes = scenes.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCharacters = characters.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const audioAssets = assets.filter(a => a.type === "audio");
  const effectAssets = assets.filter(a => a.type === "effect");

  // Calculate storage
  const totalScenes = scenes.length;
  const readyScenes = scenes.filter(s => s.status === "ready").length;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-[#dcdc8b]" />
          <h3 className="font-semibold text-sm text-[#cccccc]">{projectName}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-[#cccccc] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-[#cccccc] transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[#3c3c3c]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#858585]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="h-7 pl-7 text-xs bg-[#3c3c3c] border-[#5a5a5a] text-[#cccccc] placeholder:text-[#858585]"
          />
        </div>
      </div>

      {/* Tree View */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Scenes Folder */}
          <TreeFolder
            name="Scenes"
            icon={Film}
            iconColor="text-blue-400"
            isExpanded={expandedFolders.has("scenes")}
            onToggle={() => toggleFolder("scenes")}
            count={filteredScenes.length}
          >
            {filteredScenes.map((scene) => (
              <TreeItem
                key={scene.id}
                isSelected={selectedAssetId === scene.id}
                onClick={() => onAssetSelect?.(scene)}
                onDoubleClick={() => onAssetDoubleClick?.(scene)}
                onDelete={() => onAssetDelete?.(scene.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {scene.thumbnail ? (
                    <img
                      src={scene.thumbnail}
                      alt=""
                      className="w-6 h-6 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-[#3c3c3c] flex items-center justify-center flex-shrink-0">
                      <Film className="w-3 h-3 text-[#858585]" />
                    </div>
                  )}
                  <span className="truncate text-[#cccccc]">{scene.name}</span>
                  <span className="ml-auto text-[10px] text-[#858585] flex-shrink-0">
                    {scene.duration?.toFixed(1)}s
                  </span>
                  {scene.status === "ready" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  )}
                  {scene.status === "generating" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  )}
                </div>
              </TreeItem>
            ))}
            {filteredScenes.length === 0 && (
              <div className="px-6 py-2 text-xs text-[#858585] italic">No scenes</div>
            )}
          </TreeFolder>

          {/* Characters Folder */}
          <TreeFolder
            name="Characters"
            icon={Users}
            iconColor="text-purple-400"
            isExpanded={expandedFolders.has("characters")}
            onToggle={() => toggleFolder("characters")}
            count={filteredCharacters.length}
          >
            {filteredCharacters.map((char) => (
              <TreeItem
                key={char.id}
                isSelected={selectedAssetId === char.id}
                onClick={() => onAssetSelect?.(char)}
                onDoubleClick={() => onAssetDoubleClick?.(char)}
                onDelete={() => onAssetDelete?.(char.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#3c3c3c] flex items-center justify-center flex-shrink-0 text-xs font-medium text-[#cccccc]">
                    {char.name[0]}
                  </div>
                  <span className="truncate text-[#cccccc]">{char.name}</span>
                  {char.reference_images?.length > 0 && (
                    <span className="ml-auto text-[10px] text-[#858585] flex-shrink-0">
                      {char.reference_images.length} refs
                    </span>
                  )}
                </div>
              </TreeItem>
            ))}
            {filteredCharacters.length === 0 && (
              <div className="px-6 py-2 text-xs text-[#858585] italic">No characters</div>
            )}
          </TreeFolder>

          {/* Audio Folder */}
          <TreeFolder
            name="Audio"
            icon={Music}
            iconColor="text-green-400"
            isExpanded={expandedFolders.has("audio")}
            onToggle={() => toggleFolder("audio")}
            count={audioAssets.length}
          >
            {audioAssets.map((asset) => (
              <TreeItem
                key={asset.id}
                isSelected={selectedAssetId === asset.id}
                onClick={() => onAssetSelect?.(asset)}
                onDoubleClick={() => onAssetDoubleClick?.(asset)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Music className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="truncate text-[#cccccc]">{asset.name}</span>
                  {asset.duration && (
                    <span className="ml-auto text-[10px] text-[#858585] flex-shrink-0">
                      {asset.duration.toFixed(1)}s
                    </span>
                  )}
                </div>
              </TreeItem>
            ))}
            {audioAssets.length === 0 && (
              <div className="px-6 py-2 text-xs text-[#858585] italic">No audio files</div>
            )}
          </TreeFolder>

          {/* Effects Folder */}
          <TreeFolder
            name="Effects"
            icon={Sparkles}
            iconColor="text-yellow-400"
            isExpanded={expandedFolders.has("effects")}
            onToggle={() => toggleFolder("effects")}
            count={effectAssets.length}
          >
            {effectAssets.map((asset) => (
              <TreeItem
                key={asset.id}
                isSelected={selectedAssetId === asset.id}
                onClick={() => onAssetSelect?.(asset)}
                onDoubleClick={() => onAssetDoubleClick?.(asset)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span className="truncate text-[#cccccc]">{asset.name}</span>
                </div>
              </TreeItem>
            ))}
            {effectAssets.length === 0 && (
              <div className="px-6 py-2 text-xs text-[#858585] italic">No effects</div>
            )}
          </TreeFolder>
        </div>
      </ScrollArea>

      {/* Storage Info */}
      <div className="p-3 border-t border-[#3c3c3c] bg-[#252526]">
        <div className="flex items-center justify-between text-xs text-[#858585] mb-2">
          <span>Project Status</span>
          <span>{readyScenes}/{totalScenes} scenes ready</span>
        </div>
        <div className="h-1.5 bg-[#3c3c3c] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4ec9b0] rounded-full transition-all"
            style={{ width: totalScenes > 0 ? `${(readyScenes / totalScenes) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

function TreeFolder({ name, icon: Icon, iconColor, isExpanded, onToggle, count, children }) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 w-full px-2 py-1.5 text-sm hover:bg-[#2d2d30] rounded transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[#858585]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#858585]" />
        )}
        {isExpanded ? (
          <FolderOpen className={cn("w-4 h-4", iconColor)} />
        ) : (
          <Icon className={cn("w-4 h-4", iconColor)} />
        )}
        <span className="text-[#cccccc] flex-1 text-left">{name}</span>
        <span className="text-[10px] text-[#858585] bg-[#3c3c3c] px-1.5 rounded">
          {count}
        </span>
      </button>
      {isExpanded && (
        <div className="ml-4 border-l border-[#3c3c3c]">
          {children}
        </div>
      )}
    </div>
  );
}

function TreeItem({ children, isSelected, onClick, onDoubleClick, onDelete }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 text-xs cursor-pointer rounded ml-2 transition-colors",
            isSelected 
              ? "bg-[#094771] text-white" 
              : "hover:bg-[#2d2d30] text-[#cccccc]"
          )}
        >
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-[#252526] border-[#3c3c3c]">
        <ContextMenuItem className="text-[#cccccc] focus:bg-[#094771] focus:text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add to Timeline
        </ContextMenuItem>
        <ContextMenuItem className="text-[#cccccc] focus:bg-[#094771] focus:text-white">
          <Edit className="w-4 h-4 mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem className="text-[#cccccc] focus:bg-[#094771] focus:text-white">
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#3c3c3c]" />
        <ContextMenuItem 
          className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default AssetExplorer;
