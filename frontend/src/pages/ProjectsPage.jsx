import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Film, Clock, Clapperboard, Search, MoreVertical, Trash2, Sparkles, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { OnboardingFlow } from "../components/OnboardingFlow";
import { ProjectTemplates } from "../components/ProjectTemplates";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const thumbnails = [
  "https://images.pexels.com/photos/13812458/pexels-photo-13812458.jpeg",
  "https://images.pexels.com/photos/13226337/pexels-photo-13226337.jpeg",
  "https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg",
  "https://images.pexels.com/photos/13812380/pexels-photo-13812380.jpeg",
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    style_guide: "cinematic",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const response = await axios.post(`${API}/projects`, newProject);
      setProjects([response.data, ...projects]);
      setShowCreateModal(false);
      setNewProject({ name: "", description: "", style_guide: "cinematic" });
      toast.success("Project created successfully");
      navigate(`/editor/${response.data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      setProjects(projects.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Header */}
      <header className="h-16 bg-[#18181B] border-b border-zinc-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Clapperboard className="w-7 h-7 text-[#E11D48]" />
          <span className="font-chivo font-bold text-xl text-white">CineCursor</span>
        </div>
        <Button
          data-testid="create-project-btn"
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-black hover:bg-zinc-200 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-chivo text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-zinc-400">Create and manage your video productions</p>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              data-testid="search-projects-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-zinc-600 text-white placeholder:text-zinc-600"
            />
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="projects-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="project-card">
                  <div className="project-thumbnail skeleton" />
                  <div className="project-info">
                    <div className="h-5 w-32 skeleton rounded mb-2" />
                    <div className="h-4 w-24 skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state py-24">
              <Film className="w-16 h-16 mb-4 text-zinc-700" />
              <h3 className="font-chivo text-xl text-zinc-400 mb-2">No projects yet</h3>
              <p className="text-zinc-500 mb-6 max-w-sm">
                Start creating your first AI-powered video production
              </p>
              <Button
                data-testid="create-first-project-btn"
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-black hover:bg-zinc-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  data-testid={`project-card-${project.id}`}
                  className="project-card group"
                  onClick={() => navigate(`/editor/${project.id}`)}
                >
                  <div className="project-thumbnail relative overflow-hidden">
                    <img
                      src={project.thumbnail || thumbnails[index % thumbnails.length]}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="timecode bg-black/60 px-2 py-1 rounded text-xs">
                        {formatDuration(project.total_duration || 0)}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          data-testid={`project-menu-${project.id}`}
                          className="absolute top-3 right-3 p-1.5 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                        <DropdownMenuItem
                          data-testid={`delete-project-${project.id}`}
                          className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                          onClick={(e) => handleDeleteProject(project.id, e)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="project-info">
                    <h3 className="project-title">{project.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <span className="capitalize">{project.style_guide}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#18181B] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-chivo text-xl">Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Project Name
              </Label>
              <Input
                id="name"
                data-testid="project-name-input"
                placeholder="My Awesome Film"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="bg-zinc-900/50 border-zinc-700 focus:border-zinc-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300">
                Description
              </Label>
              <Textarea
                id="description"
                data-testid="project-description-input"
                placeholder="A brief description of your project..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="bg-zinc-900/50 border-zinc-700 focus:border-zinc-500 text-white resize-none h-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="style" className="text-zinc-300">
                Style Guide
              </Label>
              <select
                id="style"
                data-testid="project-style-select"
                value={newProject.style_guide}
                onChange={(e) => setNewProject({ ...newProject, style_guide: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-zinc-900/50 border border-zinc-700 text-white focus:outline-none focus:border-zinc-500"
              >
                <option value="cinematic">Cinematic</option>
                <option value="documentary">Documentary</option>
                <option value="commercial">Commercial</option>
                <option value="music_video">Music Video</option>
                <option value="social_media">Social Media</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              data-testid="create-project-submit-btn"
              onClick={handleCreateProject}
              className="bg-white text-black hover:bg-zinc-200"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
