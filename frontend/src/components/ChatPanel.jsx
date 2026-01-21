import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Trash2, Film, Wand2, Layers, RefreshCw, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Create a dramatic opening scene with a sunset",
  "Add a character named Sarah with brown hair",
  "Generate a scene with epic music",
  "Check my film for continuity errors",
  "Optimize my entire film for pacing"
];

const QUICK_ACTIONS = [
  { icon: Layers, label: "Add Transition", prompt: "Add a fade transition between the last two scenes" },
  { icon: RefreshCw, label: "Check Continuity", prompt: "Check my film for continuity errors" },
  { icon: Wand2, label: "Optimize Film", prompt: "Optimize my film for better pacing and engagement" },
  { icon: FileVideo, label: "Export", prompt: "Help me export my project in the best format" }
];

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  onClearChat, 
  isLoading,
  onCreateFromPlan,
  modelName = "Sora 2"
}) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  }, [input, isLoading, onSendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#4ec9b0]" />
          <h3 className="font-semibold text-sm text-[#cccccc]">AI Director</h3>
          <span className="px-2 py-0.5 text-[11px] bg-[#0e639c] text-white rounded">
            {modelName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs",
            isLoading ? "text-[#dcdcaa]" : "text-[#4ec9b0]"
          )}>
            {isLoading ? "⏳ Thinking..." : "✅ Ready"}
          </span>
          <button
            onClick={onClearChat}
            className="p-1.5 hover:bg-[#3c3c3c] rounded text-[#cccccc] transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {messages.length === 0 ? (
            <WelcomeMessage onSuggestionClick={handleSuggestionClick} />
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage 
                key={msg.id || idx} 
                message={msg} 
                onCreateFromPlan={onCreateFromPlan}
              />
            ))
          )}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-[#858585] text-sm px-3 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#4ec9b0] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-[#4ec9b0] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-[#4ec9b0] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>AI Director is thinking...</span>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {!isLoading && messages.length > 0 && (
        <div className="px-4 py-2 border-t border-[#3c3c3c] flex flex-wrap gap-2">
          {["Generate next scene", "Modify this scene", "Add transition"].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1.5 text-xs bg-[#2d2d30] border border-[#3c3c3c] rounded-full text-[#9cdcfe] hover:bg-[#37373d] hover:border-[#0e639c] transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-[#252526] border-t border-[#3c3c3c]">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to create... (Shift+Enter for new line)"
            className="flex-1 min-h-[40px] max-h-[120px] bg-[#3c3c3c] border-[#5a5a5a] text-[#cccccc] placeholder:text-[#858585] resize-none focus:border-[#0e639c]"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 bg-[#252526] flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(action.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#2d2d30] border border-[#3c3c3c] rounded text-[#cccccc] hover:bg-[#37373d] hover:border-[#0e639c] hover:text-[#4ec9b0] transition-colors"
          >
            <action.icon className="w-3 h-3" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function WelcomeMessage({ onSuggestionClick }) {
  return (
    <div className="text-center py-8 px-4">
      <Sparkles className="w-12 h-12 text-[#4ec9b0] mx-auto mb-4 opacity-60" />
      <h2 className="text-lg font-semibold text-[#4ec9b0] mb-3">👋 Welcome to CineCursor</h2>
      <p className="text-[#cccccc] mb-6">I'm your AI Film Director. Tell me what you want to create:</p>
      <ul className="text-left max-w-md mx-auto space-y-2">
        {[
          { icon: "📹", text: "Generate a scene with a knight walking through a forest" },
          { icon: "👤", text: "Create a character named Sarah with brown hair" },
          { icon: "🎵", text: "Add epic music to my last scene" },
          { icon: "🔧", text: "Fix the lighting inconsistency in Scene 3" },
          { icon: "⚡", text: "Optimize my entire film" }
        ].map((item, idx) => (
          <li
            key={idx}
            onClick={() => onSuggestionClick(item.text)}
            className="text-[#9cdcfe] text-sm cursor-pointer hover:text-[#4ec9b0] hover:bg-[#2d2d30] p-2 rounded transition-colors"
          >
            {item.icon} "{item.text}"
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatMessage({ message, onCreateFromPlan }) {
  const isUser = message.role === "user";
  const isError = message.isError;

  return (
    <div className={cn("group", isError && "opacity-80")}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-lg",
          isUser ? "bg-[#0e639c]" : "bg-[#4ec9b0]/20"
        )}>
          {isUser ? "👤" : "🎬"}
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-[#cccccc]">
            {isUser ? "You" : "AI Director"}
          </span>
          <span className="text-[11px] text-[#858585]">
            {new Date(message.created_at || message.timestamp || Date.now()).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "ml-10 p-3 rounded-lg text-sm leading-relaxed",
        isUser ? "bg-[#2d2d30]" : "bg-[#2d2d30]",
        isError && "bg-[#f44747]/10 border-l-2 border-[#f44747]"
      )}>
        <div className="text-[#cccccc] whitespace-pre-wrap">{message.content}</div>
      </div>

      {/* Scene Plan Preview */}
      {message.scene_plan && (
        <div className="ml-10 mt-3 p-3 bg-[#0e639c]/10 border border-[#0e639c] rounded-lg">
          <h4 className="text-[13px] font-medium text-[#4ec9b0] mb-3 flex items-center gap-2">
            <Film className="w-4 h-4" />
            Scene Plan
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {message.scene_plan.name && (
              <div className="flex justify-between">
                <span className="text-[#858585]">Name:</span>
                <span className="text-[#dcdcaa]">{message.scene_plan.name}</span>
              </div>
            )}
            {message.scene_plan.duration && (
              <div className="flex justify-between">
                <span className="text-[#858585]">Duration:</span>
                <span className="text-[#dcdcaa]">{message.scene_plan.duration}s</span>
              </div>
            )}
            {message.scene_plan.size && (
              <div className="flex justify-between">
                <span className="text-[#858585]">Resolution:</span>
                <span className="text-[#dcdcaa]">{message.scene_plan.size}</span>
              </div>
            )}
            {message.scene_plan.transition_in?.type && (
              <div className="flex justify-between">
                <span className="text-[#858585]">Transition:</span>
                <span className="text-[#dcdcaa]">{message.scene_plan.transition_in.type}</span>
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onCreateFromPlan(message.scene_plan)}
            className="bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs"
          >
            <Wand2 className="w-3 h-3 mr-1" />
            Create This Scene
          </Button>
        </div>
      )}
    </div>
  );
}

export default ChatPanel;
