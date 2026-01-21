/**
 * Keyboard Shortcuts Manager for CineCursor
 * Provides VS Code-like keyboard shortcut handling
 */

class KeyboardShortcutsManager {
  constructor() {
    this.shortcuts = new Map();
    this.pressedKeys = new Set();
    this.listeners = new Map();
    this.enabled = true;
    this.setupListeners();
    this.registerDefaultShortcuts();
  }

  setupListeners() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    window.addEventListener("blur", this.clearPressedKeys.bind(this));
  }

  handleKeyDown(e) {
    if (!this.enabled) return;

    const key = this.normalizeKey(e);
    this.pressedKeys.add(key);

    // Check if focused on input element
    const target = e.target;
    const isInputFocused = ["INPUT", "TEXTAREA", "SELECT"].includes(
      target.tagName
    ) || target.isContentEditable;

    // If focused on input, don't trigger any shortcuts except specific ones with modifier keys
    if (isInputFocused) {
      // Only allow shortcuts with modifier keys (Cmd/Ctrl) when in input
      const hasModifier = this.pressedKeys.has("Cmd") || 
                          this.pressedKeys.has("Ctrl") || 
                          this.pressedKeys.has("Alt");
      if (!hasModifier) {
        return; // Don't process shortcuts without modifiers in inputs
      }
    }

    // Check if any shortcut matches
    for (const shortcut of this.shortcuts.values()) {
      if (this.isShortcutPressed(shortcut)) {
        // Skip non-global shortcuts when in input (even with modifiers, for safety)
        if (isInputFocused && !shortcut.global) {
          continue;
        }

        e.preventDefault();
        e.stopPropagation();
        
        try {
          shortcut.callback();
          this.emit(shortcut.id);
        } catch (error) {
          console.error(`Shortcut error (${shortcut.id}):`, error);
        }
      }
    }
  }

  handleKeyUp(e) {
    const key = this.normalizeKey(e);
    this.pressedKeys.delete(key);
  }

  clearPressedKeys() {
    this.pressedKeys.clear();
  }

  normalizeKey(e) {
    // Handle modifier keys
    if (e.key === "Meta" || e.key === "Control") {
      return navigator.platform.includes("Mac") ? "Cmd" : "Ctrl";
    }
    if (e.key === "Shift") return "Shift";
    if (e.key === "Alt") return "Alt";
    
    // Handle special keys
    if (e.key === " ") return "Space";
    if (e.key === "ArrowLeft") return "Left";
    if (e.key === "ArrowRight") return "Right";
    if (e.key === "ArrowUp") return "Up";
    if (e.key === "ArrowDown") return "Down";
    if (e.key === "Escape") return "Escape";
    if (e.key === "Enter") return "Enter";
    if (e.key === "Backspace") return "Backspace";
    if (e.key === "Delete") return "Delete";
    if (e.key === "Tab") return "Tab";
    
    // Return lowercase for letters
    return e.key.toLowerCase();
  }

  isShortcutPressed(shortcut) {
    if (shortcut.keys.length !== this.pressedKeys.size) {
      return false;
    }

    return shortcut.keys.every((key) => {
      // Handle platform-specific keys
      if (key === "CmdOrCtrl") {
        return this.pressedKeys.has("Cmd") || this.pressedKeys.has("Ctrl");
      }
      return this.pressedKeys.has(key);
    });
  }

  register(shortcut) {
    this.shortcuts.set(shortcut.id, {
      ...shortcut,
      callback: shortcut.callback || (() => {}),
    });
  }

  unregister(id) {
    this.shortcuts.delete(id);
  }

  updateCallback(id, callback) {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      shortcut.callback = callback;
    }
  }

  getShortcuts(category) {
    const allShortcuts = Array.from(this.shortcuts.values());
    return category
      ? allShortcuts.filter((s) => s.category === category)
      : allShortcuts;
  }

  getShortcutLabel(id) {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return "";

    return shortcut.keys
      .map((key) => {
        if (key === "CmdOrCtrl") {
          return navigator.platform.includes("Mac") ? "⌘" : "Ctrl";
        }
        if (key === "Cmd") return "⌘";
        if (key === "Ctrl") return "Ctrl";
        if (key === "Shift") return "⇧";
        if (key === "Alt") return navigator.platform.includes("Mac") ? "⌥" : "Alt";
        if (key === "Space") return "Space";
        if (key === "Delete") return "⌫";
        if (key === "Enter") return "↵";
        if (key === "Escape") return "Esc";
        if (key === "Left") return "←";
        if (key === "Right") return "→";
        if (key === "Up") return "↑";
        if (key === "Down") return "↓";
        return key.toUpperCase();
      })
      .join(navigator.platform.includes("Mac") ? "" : "+");
  }

  registerDefaultShortcuts() {
    // === GENERAL ===
    this.register({
      id: "save",
      keys: ["CmdOrCtrl", "s"],
      description: "Save project",
      category: "general",
      callback: () => this.emit("save"),
      global: true,
    });

    this.register({
      id: "undo",
      keys: ["CmdOrCtrl", "z"],
      description: "Undo",
      category: "general",
      callback: () => this.emit("undo"),
      global: false,
    });

    this.register({
      id: "redo",
      keys: ["CmdOrCtrl", "Shift", "z"],
      description: "Redo",
      category: "general",
      callback: () => this.emit("redo"),
      global: false,
    });

    this.register({
      id: "export",
      keys: ["CmdOrCtrl", "e"],
      description: "Export project",
      category: "general",
      callback: () => this.emit("export"),
      global: false,
    });

    this.register({
      id: "new_scene",
      keys: ["CmdOrCtrl", "n"],
      description: "New scene",
      category: "general",
      callback: () => this.emit("new_scene"),
      global: false,
    });

    this.register({
      id: "search",
      keys: ["CmdOrCtrl", "f"],
      description: "Search",
      category: "general",
      callback: () => this.emit("search"),
      global: false,
    });

    this.register({
      id: "command_palette",
      keys: ["CmdOrCtrl", "Shift", "p"],
      description: "Command palette",
      category: "general",
      callback: () => this.emit("command_palette"),
      global: true,
    });

    // === PLAYBACK ===
    this.register({
      id: "play_pause",
      keys: ["Space"],
      description: "Play/Pause",
      category: "playback",
      callback: () => this.emit("play_pause"),
      global: false, // Don't trigger in inputs
    });

    this.register({
      id: "stop",
      keys: ["Escape"],
      description: "Stop playback",
      category: "playback",
      callback: () => this.emit("stop"),
      global: false, // Don't trigger in inputs
    });

    this.register({
      id: "frame_forward",
      keys: ["Right"],
      description: "Next frame",
      category: "playback",
      callback: () => this.emit("frame_forward"),
      global: false, // Don't trigger in inputs
    });

    this.register({
      id: "frame_backward",
      keys: ["Left"],
      description: "Previous frame",
      category: "playback",
      callback: () => this.emit("frame_backward"),
      global: false, // Don't trigger in inputs
    });

    this.register({
      id: "go_to_start",
      keys: ["Home"],
      description: "Go to start",
      category: "playback",
      callback: () => this.emit("go_to_start"),
      global: false, // Don't trigger in inputs
    });

    this.register({
      id: "go_to_end",
      keys: ["End"],
      description: "Go to end",
      category: "playback",
      callback: () => this.emit("go_to_end"),
      global: false, // Don't trigger in inputs
    });

    // === TIMELINE ===
    this.register({
      id: "zoom_in",
      keys: ["CmdOrCtrl", "="],
      description: "Zoom in timeline",
      category: "timeline",
      callback: () => this.emit("zoom_in"),
      global: true,
    });

    this.register({
      id: "zoom_out",
      keys: ["CmdOrCtrl", "-"],
      description: "Zoom out timeline",
      category: "timeline",
      callback: () => this.emit("zoom_out"),
      global: true,
    });

    this.register({
      id: "zoom_fit",
      keys: ["CmdOrCtrl", "0"],
      description: "Fit timeline to view",
      category: "timeline",
      callback: () => this.emit("zoom_fit"),
      global: true,
    });

    // === EDITING ===
    this.register({
      id: "split_clip",
      keys: ["CmdOrCtrl", "b"],
      description: "Split clip at playhead",
      category: "editing",
      callback: () => this.emit("split_clip"),
      global: false,
    });

    this.register({
      id: "delete_clip",
      keys: ["Delete"],
      description: "Delete selected clip",
      category: "editing",
      callback: () => this.emit("delete_clip"),
      global: false,
    });

    this.register({
      id: "copy",
      keys: ["CmdOrCtrl", "c"],
      description: "Copy selected clip",
      category: "editing",
      callback: () => this.emit("copy"),
      global: false,
    });

    this.register({
      id: "paste",
      keys: ["CmdOrCtrl", "v"],
      description: "Paste clip",
      category: "editing",
      callback: () => this.emit("paste"),
      global: false,
    });

    this.register({
      id: "cut",
      keys: ["CmdOrCtrl", "x"],
      description: "Cut selected clip",
      category: "editing",
      callback: () => this.emit("cut"),
      global: false,
    });

    this.register({
      id: "duplicate",
      keys: ["CmdOrCtrl", "d"],
      description: "Duplicate selected clip",
      category: "editing",
      callback: () => this.emit("duplicate"),
      global: false,
    });

    this.register({
      id: "select_all",
      keys: ["CmdOrCtrl", "a"],
      description: "Select all clips",
      category: "editing",
      callback: () => this.emit("select_all"),
      global: false,
    });

    // === AI ===
    this.register({
      id: "ai_chat",
      keys: ["CmdOrCtrl", "i"],
      description: "Focus AI chat",
      category: "ai",
      callback: () => this.emit("ai_chat"),
      global: true,
    });

    this.register({
      id: "generate_scene",
      keys: ["CmdOrCtrl", "g"],
      description: "Generate scene for selected",
      category: "ai",
      callback: () => this.emit("generate_scene"),
      global: false,
    });
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event, ...args) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(...args);
      } catch (error) {
        console.error(`Shortcut listener error (${event}):`, error);
      }
    });
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    document.removeEventListener("keyup", this.handleKeyUp.bind(this));
    window.removeEventListener("blur", this.clearPressedKeys.bind(this));
    this.shortcuts.clear();
    this.listeners.clear();
    this.pressedKeys.clear();
  }
}

// Singleton instance
let instance = null;

export function getKeyboardShortcuts() {
  if (!instance) {
    instance = new KeyboardShortcutsManager();
  }
  return instance;
}

export function useKeyboardShortcut(id, callback, deps = []) {
  const manager = getKeyboardShortcuts();
  
  React.useEffect(() => {
    const unsubscribe = manager.on(id, callback);
    return unsubscribe;
  }, [id, ...deps]);
}

// Hook to use multiple shortcuts
export function useKeyboardShortcuts(shortcuts) {
  const manager = getKeyboardShortcuts();
  
  React.useEffect(() => {
    const unsubscribes = shortcuts.map(({ id, callback }) =>
      manager.on(id, callback)
    );
    
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [shortcuts]);
}

export default KeyboardShortcutsManager;

// Import React for hooks
import React from "react";
