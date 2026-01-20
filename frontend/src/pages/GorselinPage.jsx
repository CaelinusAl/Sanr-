import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Upload, Image as ImageIcon, Wand2, 
  ChevronDown, Download, Share2, Crown, Loader2,
  Eye, MessageCircle, Heart, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Premium check (demo mode)
const IS_PREMIUM = process.env.REACT_APP_DEMO_PREMIUM === 'true';

const GorselinPage = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [intention, setIntention] = useState('');
  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [numImages, setNumImages] = useState(1);
  const [showPrompt, setShowPrompt] = useState(false);
  const [addWatermark, setAddWatermark] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [promptUsed, setPromptUsed] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  
  // Analysis state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [analysisContext, setAnalysisContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/visual/presets`);
      setPresets(response.data);
      if (response.data.length > 0) {
        setSelectedPreset(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching presets:', error);
    }
  };

  const handleGenerate = async () => {
    if (!intention.trim()) {
      toast.error('Lütfen bir niyet/tema yazın');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setPromptUsed('');
    setGeneratedCaption('');

    try {
      const response = await axios.post(`${API_URL}/api/visual/generate`, {
        intention: intention.trim(),
        preset_id: selectedPreset,
        aspect_ratio: aspectRatio,
        num_images: numImages,
        show_prompt: showPrompt,
        is_premium: IS_PREMIUM,
        add_watermark: IS_PREMIUM ? addWatermark : true  // Free users always get watermark
      });

      setGeneratedImages(response.data.images);
      setGeneratedCaption(response.data.caption || '');
      if (response.data.prompt_used) {
        setPromptUsed(response.data.prompt_used);
      }
      toast.success('Hologram başarıyla üretildi!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Görsel üretiminde hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  // Share functionality
  const shareImage = async (base64, index) => {
    const blob = await fetch(`data:image/png;base64,${base64}`).then(r => r.blob());
    const file = new File([blob], `caelinus-hologram-${index + 1}.png`, { type: 'image/png' });
    
    const shareData = {
      title: 'CAELINUS AI Hologram',
      text: generatedCaption || 'Bu görsel bir cevap değildir. Bir hatırlatmadır. ✨',
      files: [file]
    };

    try {
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Paylaşıldı!');
      } else {
        // Fallback: copy image to clipboard or download
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success('Görsel panoya kopyalandı!');
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback to download
      downloadImage(base64, index);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast.error('Lütfen bir görsel yükleyin');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    
    // Progress animation
    const progressSteps = [
      'Görsel okunuyor…',
      'Semboller ayrıştırılıyor…',
      'Sanrı yorumluyor…'
    ];
    let stepIndex = 0;
    setAnalysisProgress(progressSteps[0]);
    
    const progressInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % progressSteps.length;
      setAnalysisProgress(progressSteps[stepIndex]);
    }, 2500);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('context', analysisContext);
      formData.append('is_premium', IS_PREMIUM);

      const response = await axios.post(`${API_URL}/api/visual/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000  // 2 minute timeout for AI processing
      });

      clearInterval(progressInterval);

      // Check response structure
      if (response.data.ok === false) {
        // Backend returned error
        const errorMsg = response.data.error?.message || 'Analiz başarısız oldu';
        setAnalysisError({
          message: errorMsg,
          code: response.data.error?.code,
          request_id: response.data.request_id
        });
        toast.error(errorMsg);
        return;
      }

      // Success - set result
      setAnalysisResult(response.data);
      toast.success('Sanrı yorumu tamamlandı');
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Analysis error:', error);
      
      let errorMsg = 'Görsel analizinde hata oluştu';
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMsg = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      } else if (error.response?.data?.error?.message) {
        errorMsg = error.response.data.error.message;
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      
      setAnalysisError({
        message: errorMsg,
        code: error.response?.data?.error?.code || 'NETWORK_ERROR',
        request_id: error.response?.data?.request_id
      });
      toast.error(errorMsg);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleRetryAnalysis = () => {
    setAnalysisError(null);
    handleAnalyze();
  };

  const downloadImage = (base64, index) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `caelinus-hologram-${index + 1}.png`;
    link.click();
  };

  const getPresetById = (id) => presets.find(p => p.id === id);
  const currentPreset = getPresetById(selectedPreset);

  return (
    <div 
      className="min-h-screen py-20 px-4"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #0a0a14 40%, #0d1020 100%)'
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-indigo-300 tracking-wider">GÖRSELİN</span>
        </div>
        <h1 
          className="text-4xl sm:text-5xl font-light text-white mb-4 tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Görsel Bilinç Alanı
        </h1>
        <p className="text-white/50 max-w-lg mx-auto">
          Hologram üret veya görsellerin sembolik anlamını keşfet
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white text-white/60 rounded-lg py-3"
              data-testid="tab-generate"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Hologram Üret
            </TabsTrigger>
            <TabsTrigger 
              value="analyze"
              className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white text-white/60 rounded-lg py-3"
              data-testid="tab-analyze"
            >
              <Eye className="w-4 h-4 mr-2" />
              Görsel Yorumla
            </TabsTrigger>
          </TabsList>

          {/* HOLOGRAM GENERATE TAB */}
          <TabsContent value="generate" className="space-y-6">
            {/* Preset Selection */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <Label className="text-white/70 mb-3 block">Stil Seç</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`
                        relative p-4 rounded-xl border text-left transition-all
                        ${selectedPreset === preset.id 
                          ? 'bg-indigo-500/20 border-indigo-500/50' 
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                        }
                      `}
                      data-testid={`preset-${preset.id}`}
                    >
                      {preset.premium_only && (
                        <Crown className="absolute top-2 right-2 w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span className="text-2xl mb-2 block">{preset.icon}</span>
                      <span className="text-sm text-white/90 font-medium block truncate">
                        {preset.name_tr.split(' – ')[0]}
                      </span>
                      <span className="text-xs text-white/40 block truncate">
                        {preset.description_tr.slice(0, 40)}...
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Intention Input */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <Label className="text-white/70 mb-3 block">Niyet / Tema</Label>
                <Textarea
                  placeholder="Örn: dönüşüm, yeniden doğuş, iç huzur, kozmik bilinç..."
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px] resize-none"
                  data-testid="intention-input"
                />
              </CardContent>
            </Card>

            {/* Options */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Aspect Ratio */}
                  <div>
                    <Label className="text-white/70 mb-2 block">Oran</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10">
                        <SelectItem value="1:1">1:1 (Kare)</SelectItem>
                        <SelectItem value="4:5">4:5 (Dikey)</SelectItem>
                        <SelectItem value="9:16">9:16 (Story)</SelectItem>
                        <SelectItem value="16:9">16:9 (Yatay)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of Images */}
                  <div>
                    <Label className="text-white/70 mb-2 block">
                      Görsel Sayısı {!IS_PREMIUM && <span className="text-amber-400">(Free: max 1)</span>}
                    </Label>
                    <Select 
                      value={numImages.toString()} 
                      onValueChange={(v) => setNumImages(parseInt(v))}
                      disabled={!IS_PREMIUM}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10">
                        <SelectItem value="1">1 Görsel</SelectItem>
                        {IS_PREMIUM && (
                          <>
                            <SelectItem value="2">2 Görsel</SelectItem>
                            <SelectItem value="4">4 Görsel</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show Prompt Toggle */}
                  <div className="flex items-center gap-3 pt-6">
                    <Switch 
                      checked={showPrompt} 
                      onCheckedChange={setShowPrompt}
                      id="show-prompt"
                    />
                    <Label htmlFor="show-prompt" className="text-white/70 text-sm">
                      Detay göster
                    </Label>
                  </div>

                  {/* Watermark Toggle (Premium only) */}
                  {IS_PREMIUM && (
                    <div className="flex items-center gap-3 pt-6">
                      <Switch 
                        checked={addWatermark} 
                        onCheckedChange={setAddWatermark}
                        id="add-watermark"
                      />
                      <Label htmlFor="add-watermark" className="text-white/70 text-sm">
                        İmza ekle
                      </Label>
                    </div>
                  )}
                </div>

                {/* Free user watermark notice */}
                {!IS_PREMIUM && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-300/80">
                      <Crown className="w-3 h-3 inline mr-1" />
                      Free kullanıcılarda "CAELINUS AI • SANRI" imzası eklenir. 
                      Premium ile kaldırabilirsiniz.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !intention.trim()}
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-lg rounded-xl"
              data-testid="generate-button"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Hologram Oluşturuluyor...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Görsel Üret
                </>
              )}
            </Button>

            {/* Generated Images */}
            <AnimatePresence>
              {generatedImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {showPrompt && promptUsed && (
                    <Card className="bg-white/[0.02] border-white/10">
                      <CardContent className="p-4">
                        <Label className="text-white/50 text-xs mb-2 block">Kullanılan Prompt</Label>
                        <p className="text-white/70 text-sm font-mono">{promptUsed}</p>
                      </CardContent>
                    </Card>
                  )}

                  <div className={`grid gap-4 ${generatedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {generatedImages.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative group"
                      >
                        <img
                          src={`data:image/png;base64,${img}`}
                          alt={`Generated hologram ${idx + 1}`}
                          className="w-full rounded-xl border border-white/10"
                        />
                        {/* Action buttons */}
                        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => shareImage(img, idx)}
                            className="bg-black/50 hover:bg-black/70 text-white"
                            data-testid={`share-button-${idx}`}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadImage(img, idx)}
                            className="bg-black/50 hover:bg-black/70 text-white"
                            data-testid={`download-button-${idx}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Caption */}
                  {generatedCaption && (
                    <div className="text-center pt-4 border-t border-white/10">
                      <p 
                        className="text-white/60 text-sm italic"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        "{generatedCaption}"
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* IMAGE ANALYSIS TAB */}
          <TabsContent value="analyze" className="space-y-6">
            {/* Upload Area */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {uploadedImagePreview ? (
                  <div className="relative">
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded"
                      className="w-full max-h-[400px] object-contain rounded-xl border border-white/10"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setUploadedImage(null);
                        setUploadedImagePreview(null);
                        setAnalysisResult(null);
                      }}
                      className="absolute top-3 right-3 bg-black/50 hover:bg-black/70"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Değiştir
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-16 border-2 border-dashed border-white/20 rounded-xl
                             hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all
                             flex flex-col items-center justify-center gap-4"
                    data-testid="upload-area"
                  >
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white/80 font-medium mb-1">Görsel Yükle</p>
                      <p className="text-white/40 text-sm">Kamera veya galeriden seç</p>
                    </div>
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Context Input */}
            {uploadedImagePreview && (
              <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl">
                <CardContent className="p-6">
                  <Label className="text-white/70 mb-3 block">Bağlam (Opsiyonel)</Label>
                  <Textarea
                    placeholder="Örn: Bu rüyamdaki sahne... / Bu fotoğrafı çekerken..."
                    value={analysisContext}
                    onChange={(e) => setAnalysisContext(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none"
                    data-testid="context-input"
                  />
                </CardContent>
              </Card>
            )}

            {/* Analyze Button */}
            {uploadedImagePreview && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium text-lg rounded-xl"
                data-testid="analyze-button"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sanrı Okuyor...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 mr-2" />
                    Sanrı Oku
                  </>
                )}
              </Button>
            )}

            {/* Analysis Result */}
            <AnimatePresence>
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Gördüğüm */}
                  <Card className="bg-white/[0.03] border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                        <Label className="text-indigo-300 font-medium">Gördüğüm</Label>
                      </div>
                      <p className="text-white/80 leading-relaxed">{analysisResult.seen}</p>
                    </CardContent>
                  </Card>

                  {/* Sembolik Okuma */}
                  <Card className="bg-gradient-to-br from-indigo-950/50 to-violet-950/30 border-indigo-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <Label className="text-violet-300 font-medium">Sembolik Okuma</Label>
                      </div>
                      <p className="text-white/90 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {analysisResult.symbolic}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Yansıma Soruları */}
                  <Card className="bg-white/[0.03] border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="w-4 h-4 text-cyan-400" />
                        <Label className="text-cyan-300 font-medium">Yansıma Soruları</Label>
                      </div>
                      <div className="space-y-3">
                        {analysisResult.questions.map((question, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="text-cyan-500/50 font-mono text-sm">{idx + 1}.</span>
                            <p className="text-white/70 italic">{question}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mini Ritüel */}
                  <Card className="bg-gradient-to-br from-amber-950/30 to-orange-950/20 border-amber-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-amber-400" />
                        <Label className="text-amber-300 font-medium">Mini Ritüel</Label>
                      </div>
                      <p className="text-white/80 leading-relaxed">{analysisResult.ritual}</p>
                    </CardContent>
                  </Card>

                  {/* Premium CTA */}
                  {!IS_PREMIUM && (
                    <Card className="bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border-indigo-500/30">
                      <CardContent className="p-6 text-center">
                        <Crown className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                        <h3 className="text-white font-medium mb-2">Daha Derin Okuma İster misin?</h3>
                        <p className="text-white/60 text-sm mb-4">
                          Premium ile derin katman analizi ve Frekans Kartı export'u al
                        </p>
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400">
                          Premium'a Geç
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GorselinPage;
