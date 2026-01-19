// Ritual Builder - Admin Panel
// Create and edit rituals with step-by-step flow

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Play,
  GripVertical,
  Clock,
  Sparkles,
  Volume2,
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "../../contexts/AdminContext";

const phaseOptions = [
  { value: "açılış", label: "Açılış", color: "violet" },
  { value: "nefes", label: "Nefes Hizalama", color: "blue" },
  { value: "ana", label: "Ana Akış", color: "emerald" },
  { value: "kapanış", label: "Kapanış", color: "amber" }
];

const ritualTypes = [
  { value: "beyin-kalp", label: "Beyin-Kalp Yaratım" },
  { value: "his", label: "His ile Tanışma" },
  { value: "kundalini", label: "Kundalini / Enerji" },
  { value: "yaratim", label: "Tanrısal Yaratım" },
  { value: "epifiz", label: "Epifiz / Dikkat" },
  { value: "kapali", label: "Kapalı Kapı" },
  { value: "custom", label: "Özel" }
];

const difficultyOptions = [
  { value: "kolay", label: "Kolay" },
  { value: "orta", label: "Orta" },
  { value: "derin", label: "Derin" }
];

const RitualBuilder = () => {
  const { adminFetch } = useAdmin();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [ritual, setRitual] = useState({
    title: "",
    subtitle: "",
    description: "",
    ritual_type: "custom",
    duration_minutes: 8,
    difficulty: "orta",
    intention: "",
    steps: [],
    opening_text: "",
    closing_text: "",
    tts_enabled: true,
    background_audio: "",
    tags: [],
    status: "draft",
    visibility: "free"
  });

  const [tagInput, setTagInput] = useState("");

  // Load ritual if editing
  useEffect(() => {
    if (isEdit) {
      loadRitual();
    }
  }, [id]);

  const loadRitual = async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch(`/rituals/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRitual({
          ...data,
          tags: data.tags || []
        });
      }
    } catch (error) {
      setError("Ritüel yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setRitual(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const addStep = () => {
    const newStep = {
      order: ritual.steps.length + 1,
      phase: "ana",
      text: "",
      duration: 6,
      breath_count: null,
      tts_script: ""
    };
    handleChange("steps", [...ritual.steps, newStep]);
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...ritual.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    handleChange("steps", newSteps);
  };

  const removeStep = (index) => {
    const newSteps = ritual.steps.filter((_, i) => i !== index);
    // Reorder
    newSteps.forEach((step, i) => step.order = i + 1);
    handleChange("steps", newSteps);
  };

  const reorderSteps = (newSteps) => {
    newSteps.forEach((step, i) => step.order = i + 1);
    handleChange("steps", newSteps);
  };

  const addTag = () => {
    if (tagInput.trim() && !ritual.tags.includes(tagInput.trim())) {
      handleChange("tags", [...ritual.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    handleChange("tags", ritual.tags.filter(t => t !== tag));
  };

  const handleSave = async (publish = false) => {
    // Validation
    if (!ritual.title.trim()) {
      setError("Başlık gerekli");
      return;
    }
    if (ritual.steps.length === 0) {
      setError("En az bir adım ekleyin");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...ritual,
        status: publish ? "published" : ritual.status
      };

      const url = isEdit ? `/rituals/${id}` : "/rituals";
      const method = isEdit ? "PUT" : "POST";

      const response = await adminFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(isEdit ? "Ritüel güncellendi" : "Ritüel oluşturuldu");
        
        if (!isEdit && data.id) {
          navigate(`/admin/rituals/${data.id}`);
        }

        // If publishing, also call publish endpoint
        if (publish && isEdit) {
          await adminFetch(`/rituals/${id}/publish`, { method: "POST" });
          setSuccess("Ritüel yayınlandı!");
        }
      } else {
        setError(data.detail || "Kaydetme başarısız");
      }
    } catch (error) {
      setError("Bağlantı hatası");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDuration = () => {
    return ritual.steps.reduce((total, step) => total + (step.duration || 6), 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/rituals">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif text-white">
              {isEdit ? "Ritüel Düzenle" : "Yeni Ritüel"}
            </h1>
            <p className="text-sm text-gray-400">
              Adım adım ritüel akışı oluşturun
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="border-gray-700 text-gray-300"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Kaydet
          </Button>
          <Button 
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Yayınla
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400"
          >
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basic Info */}
      <Card className="bg-[#12121a] border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Temel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Başlık *</Label>
              <Input
                value={ritual.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Beyin-Kalp Yaratım Titreşimi"
                className="bg-[#0a0a0f] border-gray-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">Alt Başlık</Label>
              <Input
                value={ritual.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
                placeholder="4 Aşamalı Bilinç Egzersizi"
                className="bg-[#0a0a0f] border-gray-800 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Açıklama</Label>
            <Textarea
              value={ritual.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Ritüelin kısa açıklaması..."
              className="bg-[#0a0a0f] border-gray-800 text-white min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Ritüel Tipi</Label>
              <Select value={ritual.ritual_type} onValueChange={(v) => handleChange("ritual_type", v)}>
                <SelectTrigger className="bg-[#0a0a0f] border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12121a] border-gray-800">
                  {ritualTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Zorluk</Label>
              <Select value={ritual.difficulty} onValueChange={(v) => handleChange("difficulty", v)}>
                <SelectTrigger className="bg-[#0a0a0f] border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12121a] border-gray-800">
                  {difficultyOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Görünürlük</Label>
              <Select value={ritual.visibility} onValueChange={(v) => handleChange("visibility", v)}>
                <SelectTrigger className="bg-[#0a0a0f] border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#12121a] border-gray-800">
                  <SelectItem value="free" className="text-white">Ücretsiz</SelectItem>
                  <SelectItem value="premium" className="text-white">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Niyet/Amaç</Label>
            <Input
              value={ritual.intention}
              onChange={(e) => handleChange("intention", e.target.value)}
              placeholder="Bu ritüelin temel niyeti..."
              className="bg-[#0a0a0f] border-gray-800 text-white"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-gray-400">Etiketler</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Etiket ekle..."
                className="bg-[#0a0a0f] border-gray-800 text-white flex-1"
              />
              <Button variant="outline" onClick={addTag} className="border-gray-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {ritual.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {ritual.tags.map(tag => (
                  <span 
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-white">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* TTS Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-white">Sesli Okuma</p>
                <p className="text-xs text-gray-500">Ritüel başlatıldığında TTS aktif olsun</p>
              </div>
            </div>
            <Switch
              checked={ritual.tts_enabled}
              onCheckedChange={(v) => handleChange("tts_enabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Steps Builder */}
      <Card className="bg-[#12121a] border-gray-800/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white font-serif flex items-center gap-2">
            <Play className="w-5 h-5 text-violet-400" />
            Adımlar
            <span className="text-sm text-gray-500 font-normal">
              ({ritual.steps.length} adım • {Math.round(calculateDuration() / 60)} dk)
            </span>
          </CardTitle>
          <Button onClick={addStep} size="sm" className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-1" />
            Adım Ekle
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {ritual.steps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Henüz adım eklenmedi</p>
              <p className="text-sm">Ritüel akışını oluşturmak için adım ekleyin</p>
            </div>
          ) : (
            <Reorder.Group values={ritual.steps} onReorder={reorderSteps} className="space-y-3">
              {ritual.steps.map((step, index) => (
                <Reorder.Item key={step.order} value={step}>
                  <motion.div
                    layout
                    className="p-4 bg-[#0a0a0f] rounded-lg border border-gray-800/50 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 text-gray-500 cursor-grab">
                        <GripVertical className="w-5 h-5" />
                        <span className="text-sm font-mono">{index + 1}</span>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Select 
                            value={step.phase} 
                            onValueChange={(v) => updateStep(index, "phase", v)}
                          >
                            <SelectTrigger className="bg-[#12121a] border-gray-800 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#12121a] border-gray-800">
                              {phaseOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-white">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <Input
                              type="number"
                              value={step.duration}
                              onChange={(e) => updateStep(index, "duration", parseInt(e.target.value) || 6)}
                              className="bg-[#12121a] border-gray-800 text-white w-20"
                              min={1}
                              max={120}
                            />
                            <span className="text-gray-500 text-sm">sn</span>
                          </div>

                          <div className="col-span-2 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeStep(index)}
                              className="text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <Textarea
                          value={step.text}
                          onChange={(e) => updateStep(index, "text", e.target.value)}
                          placeholder="Şimdi... dikkatini... nefesine getir..."
                          className="bg-[#12121a] border-gray-800 text-white min-h-[60px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </CardContent>
      </Card>

      {/* Opening & Closing */}
      <Card className="bg-[#12121a] border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white font-serif">Açılış & Kapanış Metinleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-400">Açılış Metni (Opsiyonel)</Label>
            <Textarea
              value={ritual.opening_text}
              onChange={(e) => handleChange("opening_text", e.target.value)}
              placeholder="Bu ritüel bir şey yapmak için değil, bir şeyi hatırlamak için tasarlandı..."
              className="bg-[#0a0a0f] border-gray-800 text-white min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400">Kapanış Metni (Opsiyonel)</Label>
            <Textarea
              value={ritual.closing_text}
              onChange={(e) => handleChange("closing_text", e.target.value)}
              placeholder="Bugün kendinle temas ettin... Bu yeterli..."
              className="bg-[#0a0a0f] border-gray-800 text-white min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Info */}
      <div className="flex items-center justify-between p-4 bg-[#12121a] rounded-lg border border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            ritual.status === "published" ? "bg-green-400" : "bg-yellow-400"
          }`} />
          <span className="text-gray-400">
            Durum: <span className="text-white">{
              ritual.status === "published" ? "Yayında" : 
              ritual.status === "review" ? "İncelemede" : "Taslak"
            }</span>
          </span>
        </div>
        <span className="text-sm text-gray-500">
          Toplam Süre: {Math.round(calculateDuration() / 60)} dakika
        </span>
      </div>
    </div>
  );
};

export default RitualBuilder;
