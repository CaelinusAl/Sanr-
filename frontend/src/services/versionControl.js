/**
 * Version Control Service for CineCursor
 * Provides undo/redo and change tracking functionality
 */

import { EventEmitter } from "./eventEmitter";

const MAX_HISTORY_SIZE = 100;

class VersionControlService extends EventEmitter {
  constructor() {
    super();
    this.history = [];
    this.currentIndex = -1;
    this.isRecording = true;
  }

  // Record a state change
  record(action, state, description = "") {
    if (!this.isRecording) return;

    // Remove any future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new entry
    this.history.push({
      action,
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      description,
      timestamp: Date.now(),
    });

    // Trim history if too long
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history = this.history.slice(-MAX_HISTORY_SIZE);
    }

    this.currentIndex = this.history.length - 1;
    this.emit("change", { canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  // Undo last action
  undo() {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    const entry = this.history[this.currentIndex];
    this.emit("undo", entry);
    this.emit("change", { canUndo: this.canUndo(), canRedo: this.canRedo() });

    return entry;
  }

  // Redo last undone action
  redo() {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    const entry = this.history[this.currentIndex];
    this.emit("redo", entry);
    this.emit("change", { canUndo: this.canUndo(), canRedo: this.canRedo() });

    return entry;
  }

  // Check if undo is available
  canUndo() {
    return this.currentIndex > 0;
  }

  // Check if redo is available
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  // Get current state
  getCurrentState() {
    if (this.currentIndex < 0) return null;
    return this.history[this.currentIndex]?.state;
  }

  // Get history entries
  getHistory() {
    return this.history.map((entry, index) => ({
      ...entry,
      isCurrent: index === this.currentIndex,
    }));
  }

  // Go to specific point in history
  goTo(index) {
    if (index < 0 || index >= this.history.length) return null;

    this.currentIndex = index;
    const entry = this.history[this.currentIndex];
    this.emit("goto", entry);
    this.emit("change", { canUndo: this.canUndo(), canRedo: this.canRedo() });

    return entry;
  }

  // Batch multiple changes into one undo step
  batch(callback) {
    this.isRecording = false;
    const initialState = this.getCurrentState();
    
    try {
      callback();
    } finally {
      this.isRecording = true;
    }
    
    // Record final state as single entry
    const finalState = this.getCurrentState();
    if (JSON.stringify(initialState) !== JSON.stringify(finalState)) {
      this.record("batch", finalState, "Batch operation");
    }
  }

  // Clear history
  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.emit("clear");
    this.emit("change", { canUndo: false, canRedo: false });
  }

  // Pause recording
  pause() {
    this.isRecording = false;
  }

  // Resume recording
  resume() {
    this.isRecording = true;
  }
}

// Singleton instance
let instance = null;

export function getVersionControl() {
  if (!instance) {
    instance = new VersionControlService();
  }
  return instance;
}

// React hook for version control
export function useVersionControl() {
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const versionControl = getVersionControl();

  React.useEffect(() => {
    const handleChange = ({ canUndo: undo, canRedo: redo }) => {
      setCanUndo(undo);
      setCanRedo(redo);
    };

    const unsubscribe = versionControl.on("change", handleChange);
    
    // Set initial state
    setCanUndo(versionControl.canUndo());
    setCanRedo(versionControl.canRedo());

    return unsubscribe;
  }, []);

  return {
    undo: () => versionControl.undo(),
    redo: () => versionControl.redo(),
    record: (action, state, desc) => versionControl.record(action, state, desc),
    canUndo,
    canRedo,
    getHistory: () => versionControl.getHistory(),
    goTo: (index) => versionControl.goTo(index),
    clear: () => versionControl.clear(),
  };
}

export default VersionControlService;

import React from "react";
