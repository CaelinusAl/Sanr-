import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Power, Save, X, 
  Crown, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const emptyPreset = {
  name_tr: '',
  name_en: '',
  description_tr: '',
  description_en: '',
  icon: '🔮',
  style_prompt: '',
  negative_prompt: 'low quality, blurry, cartoon, anime, oversaturated, distorted anatomy, watermark, logo, text',
  aspect_ratios: ['4:5', '1:1'],
  default_outputs: 1,
  premium_only: false
};

const VisualPresetsPage = () => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [formData, setFormData] = useState(emptyPreset);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPresets();
    fetchAnalytics();
  }, []);

  const fetchPresets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/visual/presets?include_inactive=true`);
      setPresets(response.data);
    } catch (error) {
      console.error('Error fetching presets:', error);
      toast.error('Presetler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/visual/admin/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingPreset(null);
    setFormData(emptyPreset);
    setIsDialogOpen(true);
  };

  const openEditDialog = (preset) => {
    setEditingPreset(preset);
    setFormData({
      name_tr: preset.name_tr,
      name_en: preset.name_en,
      description_tr: preset.description_tr,
      description_en: preset.description_en,
      icon: preset.icon,
      style_prompt: preset.style_prompt,
      negative_prompt: preset.negative_prompt,
      aspect_ratios: preset.aspect_ratios,
      default_outputs: preset.default_outputs,
      premium_only: preset.premium_only
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name_tr || !formData.style_prompt) {
      toast.error('İsim ve stil prompt zorunludur');
      return;
    }

    setSaving(true);
    try {
      if (editingPreset) {
        await axios.put(`${API_URL}/api/visual/admin/presets/${editingPreset.id}`, formData);
        toast.success('Preset güncellendi');
      } else {
        await axios.post(`${API_URL}/api/visual/admin/presets`, formData);
        toast.success('Preset oluşturuldu');
      }
      setIsDialogOpen(false);
      fetchPresets();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (preset) => {
    try {
      await axios.patch(`${API_URL}/api/visual/admin/presets/${preset.id}/toggle`);
      toast.success(`Preset ${preset.is_active ? 'pasif' : 'aktif'} edildi`);
      fetchPresets();
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Durum değiştirme hatası');
    }
  };

  const handleDelete = async (preset) => {
    if (!window.confirm(`"${preset.name_tr}" presetini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/visual/admin/presets/${preset.id}`);
      toast.success('Preset silindi');
      fetchPresets();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Silme hatası');
    }
  };

  const handleAspectRatioChange = (ratio, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        aspect_ratios: [...prev.aspect_ratios, ratio]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        aspect_ratios: prev.aspect_ratios.filter(r => r !== ratio)
      }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <ImageIcon className="w-7 h-7 text-indigo-400" />
              Visual Preset Manager
            </h1>
            <p className="text-gray-400 mt-1">GÖRSELİN modülü stil presetlerini yönetin</p>
          </div>
          <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-500">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Preset
          </Button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-indigo-500/20">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.total_generations}</p>
                    <p className="text-gray-400 text-sm">Toplam Üretim</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-violet-500/20">
                    <ImageIcon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{analytics.total_analyses}</p>
                    <p className="text-gray-400 text-sm">Toplam Analiz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-amber-500/20">
                    <Crown className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{presets.filter(p => p.premium_only).length}</p>
                    <p className="text-gray-400 text-sm">Premium Preset</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`bg-gray-800/50 border-gray-700 ${!preset.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{preset.icon}</span>
                      <div>
                        <h3 className="font-medium text-white">{preset.name_tr.split(' – ')[0]}</h3>
                        <p className="text-xs text-gray-500">{preset.name_en}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {preset.premium_only && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {!preset.is_active && (
                        <Badge variant="secondary">Pasif</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {preset.description_tr}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {preset.aspect_ratios.map((ratio) => (
                      <Badge key={ratio} variant="outline" className="text-xs">
                        {ratio}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(preset)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(preset)}
                        className={preset.is_active ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-white'}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(preset)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">
                      {preset.default_outputs} görsel
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingPreset ? 'Preset Düzenle' : 'Yeni Preset Oluştur'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Icon */}
              <div>
                <Label className="text-gray-300">Icon (Emoji)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white w-24 text-2xl text-center"
                  maxLength={2}
                />
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">İsim (TR)</Label>
                  <Input
                    value={formData.name_tr}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_tr: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Moon Jellyfish – Bilinç Işığı"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">İsim (EN)</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Moon Jellyfish – Consciousness Light"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Açıklama (TR)</Label>
                  <Input
                    value={formData.description_tr}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_tr: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Bilincin görünmez akışını temsil eden..."
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Açıklama (EN)</Label>
                  <Input
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="A cosmic entity representing..."
                  />
                </div>
              </div>

              {/* Style Prompt */}
              <div>
                <Label className="text-gray-300">Style Prompt (Sistem)</Label>
                <Textarea
                  value={formData.style_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, style_prompt: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  placeholder="bioluminescent cosmic jellyfish floating in deep space..."
                />
              </div>

              {/* Negative Prompt */}
              <div>
                <Label className="text-gray-300">Negative Prompt</Label>
                <Textarea
                  value={formData.negative_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, negative_prompt: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                />
              </div>

              {/* Aspect Ratios */}
              <div>
                <Label className="text-gray-300 mb-2 block">Aspect Ratios</Label>
                <div className="flex flex-wrap gap-4">
                  {['1:1', '4:5', '9:16', '16:9'].map((ratio) => (
                    <div key={ratio} className="flex items-center gap-2">
                      <Switch
                        checked={formData.aspect_ratios.includes(ratio)}
                        onCheckedChange={(checked) => handleAspectRatioChange(ratio, checked)}
                      />
                      <span className="text-gray-300 text-sm">{ratio}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center gap-6">
                <div>
                  <Label className="text-gray-300">Varsayılan Görsel Sayısı</Label>
                  <Input
                    type="number"
                    value={formData.default_outputs}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_outputs: parseInt(e.target.value) || 1 }))}
                    className="bg-gray-800 border-gray-700 text-white w-24"
                    min={1}
                    max={4}
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Switch
                    checked={formData.premium_only}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, premium_only: checked }))}
                  />
                  <Label className="text-gray-300">Premium Only</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                İptal
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default VisualPresetsPage;
