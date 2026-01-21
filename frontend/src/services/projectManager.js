/**
 * Project Manager Service for CineCursor
 * Handles project state, auto-save, and project metadata
 */

import { EventEmitter } from "./eventEmitter";

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const MAX_AUTO_SAVES = 10;
const LOCAL_STORAGE_KEY = "cinecursor_projects";
const RECENT_PROJECTS_KEY = "cinecursor_recent_projects";

class ProjectManager extends EventEmitter {
  constructor(apiUrl) {
    super();
    this.apiUrl = apiUrl;
    this.currentProject = null;
    this.recentProjects = [];
    this.autoSaveTimer = null;
    this.hasUnsavedChanges = false;
    this.autoSaveEnabled = true;
    this.loadRecentProjects();
  }

  // Create new project
  async createProject(data) {
    try {
      const response = await fetch(`${this.apiUrl}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description || "",
          style: data.style || "cinematic",
          resolution: data.resolution || "1920x1080",
          fps: data.fps || 30,
          budget: data.budget || 100,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const project = await response.json();
      
      // Initialize project state
      this.currentProject = {
        ...project,
        config: {
          resolution: this.parseResolution(data.resolution || "1920x1080"),
          fps: data.fps || 30,
          aspectRatio: "16:9",
          defaultDuration: 8,
          styleGuide: data.style || "",
          budget: {
            total: data.budget || 100,
            spent: 0,
            remaining: data.budget || 100,
          },
        },
        metadata: {
          totalScenes: 0,
          totalCharacters: 0,
          totalDuration: 0,
          totalCost: 0,
        },
        state: {
          timeline: [],
          assets: [],
          characters: [],
          settings: {},
        },
      };

      this.addToRecentProjects(this.currentProject);
      this.startAutoSave();
      this.emit("project-created", this.currentProject);

      return this.currentProject;
    } catch (error) {
      console.error("Create project error:", error);
      throw error;
    }
  }

  // Open existing project
  async openProject(projectId) {
    try {
      // Load project data
      const [projectRes, scenesRes, charsRes, chatRes] = await Promise.all([
        fetch(`${this.apiUrl}/projects/${projectId}`),
        fetch(`${this.apiUrl}/projects/${projectId}/scenes`),
        fetch(`${this.apiUrl}/projects/${projectId}/characters`),
        fetch(`${this.apiUrl}/projects/${projectId}/chat-history`),
      ]);

      if (!projectRes.ok) {
        throw new Error("Project not found");
      }

      const project = await projectRes.json();
      const scenes = await scenesRes.json();
      const characters = await charsRes.json();
      const chatHistory = await chatRes.json();

      // Calculate metadata
      const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalCost = scenes.reduce((sum, s) => sum + (s.cost || 0), 0);

      this.currentProject = {
        ...project,
        config: project.config || {
          resolution: { width: 1920, height: 1080 },
          fps: 30,
          aspectRatio: "16:9",
          defaultDuration: 8,
          styleGuide: "",
          budget: { total: 100, spent: totalCost, remaining: 100 - totalCost },
        },
        metadata: {
          totalScenes: scenes.length,
          totalCharacters: characters.length,
          totalDuration,
          totalCost,
        },
        state: {
          timeline: scenes,
          assets: [],
          characters,
          chatHistory,
          settings: {},
        },
      };

      // Check for auto-save recovery
      const recovery = this.getAutoSave(projectId);
      if (recovery && recovery.timestamp > new Date(project.modifiedAt).getTime()) {
        this.emit("auto-save-recovery-available", recovery);
      }

      this.addToRecentProjects(this.currentProject);
      this.hasUnsavedChanges = false;
      this.startAutoSave();
      this.emit("project-opened", this.currentProject);

      return this.currentProject;
    } catch (error) {
      console.error("Open project error:", error);
      throw error;
    }
  }

  // Save current project
  async saveProject() {
    if (!this.currentProject) {
      throw new Error("No project is currently open");
    }

    try {
      // Save to backend
      const response = await fetch(
        `${this.apiUrl}/projects/${this.currentProject.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: this.currentProject.name,
            description: this.currentProject.description,
            config: this.currentProject.config,
            metadata: this.currentProject.metadata,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      this.currentProject.modifiedAt = new Date().toISOString();
      this.hasUnsavedChanges = false;
      this.emit("project-saved", this.currentProject);

      return this.currentProject;
    } catch (error) {
      console.error("Save project error:", error);
      throw error;
    }
  }

  // Close current project
  async closeProject(forceSave = false) {
    if (!this.currentProject) return;

    // Check for unsaved changes
    if (this.hasUnsavedChanges && !forceSave) {
      this.emit("unsaved-changes", this.currentProject);
      return false;
    }

    if (this.hasUnsavedChanges && forceSave) {
      await this.saveProject();
    }

    const closedProject = this.currentProject;
    this.stopAutoSave();
    this.currentProject = null;
    this.hasUnsavedChanges = false;
    this.emit("project-closed", closedProject);

    return true;
  }

  // Mark project as modified
  markAsModified() {
    this.hasUnsavedChanges = true;
    this.emit("project-modified", this.currentProject);
  }

  // Get current project
  getCurrentProject() {
    return this.currentProject;
  }

  // Update project metadata
  updateMetadata(updates) {
    if (!this.currentProject) return;

    this.currentProject.metadata = {
      ...this.currentProject.metadata,
      ...updates,
    };
    this.markAsModified();
  }

  // Update project config
  updateConfig(updates) {
    if (!this.currentProject) return;

    this.currentProject.config = {
      ...this.currentProject.config,
      ...updates,
    };
    this.markAsModified();
  }

  // Update project state (timeline, assets, etc.)
  updateState(key, value) {
    if (!this.currentProject) return;

    this.currentProject.state[key] = value;
    this.markAsModified();
  }

  // Auto-save functionality
  startAutoSave() {
    if (!this.autoSaveEnabled) return;
    
    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      if (this.hasUnsavedChanges && this.currentProject) {
        this.performAutoSave();
      }
    }, AUTO_SAVE_INTERVAL);
  }

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  performAutoSave() {
    if (!this.currentProject) return;

    const autoSaveKey = `${LOCAL_STORAGE_KEY}_autosave_${this.currentProject.id}`;
    
    const autoSaveData = {
      projectId: this.currentProject.id,
      state: this.currentProject.state,
      config: this.currentProject.config,
      metadata: this.currentProject.metadata,
      timestamp: Date.now(),
    };

    try {
      // Get existing auto-saves
      const existingSaves = JSON.parse(localStorage.getItem(autoSaveKey) || "[]");
      
      // Add new save
      existingSaves.push(autoSaveData);
      
      // Keep only last MAX_AUTO_SAVES
      const trimmedSaves = existingSaves.slice(-MAX_AUTO_SAVES);
      
      localStorage.setItem(autoSaveKey, JSON.stringify(trimmedSaves));
      this.emit("auto-saved", autoSaveData.timestamp);
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  }

  getAutoSave(projectId) {
    const autoSaveKey = `${LOCAL_STORAGE_KEY}_autosave_${projectId}`;
    
    try {
      const saves = JSON.parse(localStorage.getItem(autoSaveKey) || "[]");
      return saves.length > 0 ? saves[saves.length - 1] : null;
    } catch {
      return null;
    }
  }

  recoverFromAutoSave(projectId) {
    const autoSave = this.getAutoSave(projectId);
    if (!autoSave || !this.currentProject) return false;

    this.currentProject.state = autoSave.state;
    this.currentProject.config = autoSave.config;
    this.currentProject.metadata = autoSave.metadata;
    this.markAsModified();
    this.emit("recovered-from-auto-save", autoSave);

    return true;
  }

  clearAutoSaves(projectId) {
    const autoSaveKey = `${LOCAL_STORAGE_KEY}_autosave_${projectId}`;
    localStorage.removeItem(autoSaveKey);
  }

  // Recent projects
  loadRecentProjects() {
    try {
      const saved = localStorage.getItem(RECENT_PROJECTS_KEY);
      this.recentProjects = saved ? JSON.parse(saved) : [];
    } catch {
      this.recentProjects = [];
    }
  }

  addToRecentProjects(project) {
    // Remove if already exists
    this.recentProjects = this.recentProjects.filter(
      (p) => p.id !== project.id
    );

    // Add to front
    this.recentProjects.unshift({
      id: project.id,
      name: project.name,
      description: project.description,
      modifiedAt: project.modifiedAt || new Date().toISOString(),
      thumbnail: project.thumbnail,
    });

    // Keep only last 10
    this.recentProjects = this.recentProjects.slice(0, 10);

    // Save to localStorage
    try {
      localStorage.setItem(
        RECENT_PROJECTS_KEY,
        JSON.stringify(this.recentProjects)
      );
    } catch (error) {
      console.error("Save recent projects error:", error);
    }
  }

  removeFromRecentProjects(projectId) {
    this.recentProjects = this.recentProjects.filter((p) => p.id !== projectId);
    
    try {
      localStorage.setItem(
        RECENT_PROJECTS_KEY,
        JSON.stringify(this.recentProjects)
      );
    } catch (error) {
      console.error("Save recent projects error:", error);
    }
  }

  getRecentProjects() {
    return this.recentProjects;
  }

  // Helpers
  parseResolution(resolution) {
    const [width, height] = resolution.split("x").map(Number);
    return { width: width || 1920, height: height || 1080 };
  }

  // Budget management
  updateBudget(spent) {
    if (!this.currentProject) return;

    const config = this.currentProject.config;
    config.budget.spent = spent;
    config.budget.remaining = config.budget.total - spent;
    this.markAsModified();
  }

  // Cleanup
  destroy() {
    this.stopAutoSave();
    this.removeAllListeners();
  }
}

// Singleton instance
let instance = null;

export function getProjectManager(apiUrl) {
  if (!instance) {
    instance = new ProjectManager(apiUrl);
  }
  return instance;
}

export default ProjectManager;
