// Rituals List Page - Admin
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "../../contexts/AdminContext";

const RitualsList = () => {
  const { adminFetch } = useAdmin();
  const [rituals, setRituals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadRituals();
  }, []);

  const loadRituals = async () => {
    try {
      const response = await adminFetch("/rituals");
      const data = await response.json();
      setRituals(data.rituals || []);
    } catch (error) {
      console.error("Rituals load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await adminFetch(`/rituals/${id}/publish`, { method: "POST" });
      loadRituals();
    } catch (error) {
      console.error("Publish error:", error);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await adminFetch(`/rituals/${id}/unpublish`, { method: "POST" });
      loadRituals();
    } catch (error) {
      console.error("Unpublish error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu ritüeli silmek istediğinize emin misiniz?")) return;
    
    try {
      await adminFetch(`/rituals/${id}`, { method: "DELETE" });
      loadRituals();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const filteredRituals = rituals.filter(ritual => {
    const matchesSearch = ritual.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || ritual.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white">Ritüel Builder</h1>
          <p className="text-gray-400">Ritüelleri oluşturun ve yönetin</p>
        </div>
        <Link to="/admin/rituals/new">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ritüel
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ritüel ara..."
            className="bg-[#12121a] border-gray-800 text-white pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "draft", "published"].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status 
                ? "bg-violet-600" 
                : "border-gray-700 text-gray-400 hover:text-white"
              }
            >
              {status === "all" ? "Tümü" : status === "draft" ? "Taslak" : "Yayında"}
            </Button>
          ))}
        </div>
      </div>

      {/* Rituals Grid */}
      {filteredRituals.length === 0 ? (
        <div className="text-center py-16">
          <Play className="w-16 h-16 mx-auto mb-4 text-gray-700" />
          <p className="text-gray-500">Henüz ritüel yok</p>
          <Link to="/admin/rituals/new">
            <Button className="mt-4 bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              İlk Ritüeli Oluştur
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRituals.map((ritual, idx) => (
            <motion.div
              key={ritual.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-[#12121a] border-gray-800/50 hover:border-violet-500/30 transition-all">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ritual.status === "published" ? "bg-green-400" : "bg-yellow-400"
                      }`} />
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        {ritual.status === "published" ? "Yayında" : "Taslak"}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#12121a] border-gray-800">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/rituals/${ritual.id}`} className="text-white">
                            <Edit className="w-4 h-4 mr-2" />
                            Düzenle
                          </Link>
                        </DropdownMenuItem>
                        {ritual.status === "published" ? (
                          <DropdownMenuItem onClick={() => handleUnpublish(ritual.id)} className="text-yellow-400">
                            <EyeOff className="w-4 h-4 mr-2" />
                            Yayından Kaldır
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handlePublish(ritual.id)} className="text-green-400">
                            <Eye className="w-4 h-4 mr-2" />
                            Yayınla
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(ritual.id)} className="text-red-400">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Title */}
                  <Link to={`/admin/rituals/${ritual.id}`}>
                    <h3 className="text-lg font-serif text-white mb-1 hover:text-violet-300 transition-colors">
                      {ritual.title}
                    </h3>
                  </Link>
                  {ritual.subtitle && (
                    <p className="text-sm text-gray-500 mb-3">{ritual.subtitle}</p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {ritual.duration_minutes} dk
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      {ritual.steps?.length || 0} adım
                    </span>
                    {ritual.visibility === "premium" && (
                      <span className="text-amber-400">Premium</span>
                    )}
                  </div>

                  {/* Tags */}
                  {ritual.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {ritual.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {ritual.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{ritual.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RitualsList;
