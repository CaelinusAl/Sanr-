import React, { useState } from 'react';
import { Film, Sparkles, Clock, Zap, Settings, ChevronRight, Loader2, Monitor, Smartphone, Square, RectangleHorizontal, Heart, Palette } from 'lucide-react';

// Quality Presets - Genişletilmiş
const QUALITY_OPTIONS = [
  { value: 'mobile', label: '📱 Mobile', desc: 'Sosyal medya için optimize', resolution: '1024x1024', time: '~10 min', duration: 4 },
  { value: 'standard', label: '🖥️ Standard', desc: 'YouTube/Web için ideal', resolution: '1280x720', time: '~20 min', duration: 4 },
  { value: 'cinema', label: '🎬 Cinema', desc: 'Sinematik widescreen', resolution: '1792x1024', time: '~30 min', duration: 8 },
  { value: 'premium', label: '💎 Premium', desc: 'En yüksek kalite + upscale', resolution: '1792x1024 → 1080p', time: '~45 min', duration: 12, upscale: true },
];

// Aspect Ratio Options
const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9', desc: 'Widescreen', icon: RectangleHorizontal, size: '1280x720' },
  { value: '9:16', label: '9:16', desc: 'Portrait/TikTok', icon: Smartphone, size: '1024x1792' },
  { value: '1:1', label: '1:1', desc: 'Square/Instagram', icon: Square, size: '1024x1024' },
  { value: '21:9', label: '21:9', desc: 'Cinematic Ultra-wide', icon: Monitor, size: '1792x1024' },
];

// Duration Options
const DURATION_OPTIONS = [
  { value: 1, label: '1 dakika', scenes: 2, desc: 'Hızlı test' },
  { value: 3, label: '3 dakika', scenes: 6, desc: 'Kısa film' },
  { value: 5, label: '5 dakika', scenes: 10, desc: 'Standart' },
  { value: 10, label: '10 dakika', scenes: 20, desc: 'Orta uzunluk' },
  { value: 15, label: '15 dakika', scenes: 30, desc: 'Uzun film' },
];

// Emotional Journey Presets
const EMOTIONAL_JOURNEYS = [
  { 
    value: 'hero', 
    label: "🦸 Hero's Journey", 
    desc: 'Klasik kahraman hikayesi',
    arc: ['Huzur', 'Çağrı', 'Macera', 'Kriz', 'Zafer', 'Dönüş'],
    colors: ['#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6', '#22d3ee']
  },
  { 
    value: 'tragedy', 
    label: '😢 Tragedy', 
    desc: 'Duygusal trajedi',
    arc: ['Mutluluk', 'Şüphe', 'Çöküş', 'Kayıp', 'Kabul'],
    colors: ['#fcd34d', '#fb923c', '#f87171', '#6b7280', '#a78bfa']
  },
  { 
    value: 'comedy', 
    label: '😄 Comedy', 
    desc: 'Komik ve eğlenceli',
    arc: ['Kaos', 'Karmaşa', 'Daha Fazla Kaos', 'Çözüm', 'Mutlu Son'],
    colors: ['#facc15', '#fb923c', '#f472b6', '#34d399', '#22d3ee']
  },
  { 
    value: 'romance', 
    label: '💕 Romance', 
    desc: 'Aşk hikayesi',
    arc: ['Tanışma', 'Yakınlaşma', 'Çatışma', 'Ayrılık', 'Kavuşma'],
    colors: ['#fda4af', '#f472b6', '#a855f7', '#6366f1', '#ec4899']
  },
  { 
    value: 'mystery', 
    label: '🔮 Mystery', 
    desc: 'Gizem ve sürpriz',
    arc: ['Gizem', 'İpuçları', 'Şüpheliler', 'Şok', 'Çözüm'],
    colors: ['#1e293b', '#475569', '#64748b', '#f59e0b', '#22c55e']
  },
  { 
    value: 'horror', 
    label: '👻 Horror', 
    desc: 'Korku ve gerilim',
    arc: ['Huzur', 'Rahatsızlık', 'Korku', 'Panik', 'Kaçış/Son'],
    colors: ['#d4d4d4', '#a1a1aa', '#71717a', '#dc2626', '#1f2937']
  },
  { 
    value: 'custom', 
    label: '🎨 Custom', 
    desc: 'Kendi duygusal yolculuğun',
    arc: [],
    colors: []
  },
];

// Example Stories - Genişletilmiş
const EXAMPLE_STORIES = [
  {
    title: "🚀 Sci-Fi",
    story: `2099 Tokyo'da geçen bir bilim kurgu gerilimi.
Bir dedektif, cinayetleri araştırırken yapay zeka bilincini keşfeder.
Karanlık, neon ışıklı, Blade Runner estetiği.
Ana karakter: 35 yaşında Asyalı erkek, trençkot giyiyor.
Duygusal yolculuk: Merak → Keşif → Şok → Kabul`
  },
  {
    title: "💕 Romance",
    story: `Paris'te geçen romantik bir komedi.
Yağmur fırtınasında bir kafede tanışan iki yabancı.
Sıcak renkler, Before Sunrise havası.
Karakterler: Kızıl saçlı genç kadın, çekici Fransız adam.
Duygusal yolculuk: Tanışma → Çekim → Yanlış Anlama → Kavuşma`
  },
  {
    title: "🎬 Action",
    story: `Gece yarısı yüksek teknolojili bir tesise sızan casus.
Karanlık, gergin, Mission Impossible tarzı.
Ana karakter: Siyah taktik kıyafetli atletik kadın.
Lazer güvenlik, muhafızlar, dramatik kaçış.
Duygusal yolculuk: Gerilim → Aksiyon → Tehlike → Zafer`
  },
  {
    title: "👻 Horror",
    story: `Terk edilmiş bir hastanede geçen korku filmi.
Bir grup arkadaş paranormal olaylarla karşılaşır.
Karanlık, kasvetli, soğuk renkler.
Karakterler: 4 genç arkadaş grubu.
Duygusal yolculuk: Merak → Tedirginlik → Korku → Panik → Hayatta Kalma`
  },
  {
    title: "🎭 Drama",
    story: `Bir ailenin yıllar sonra bir araya gelişi.
Eski yaralar, gizli sırlar ve affetme.
Sıcak iç mekanlar, duygusal yakın çekimler.
Karakterler: Yaşlı anne, iki yetişkin kardeş.
Duygusal yolculuk: Gerginlik → Çatışma → İtiraf → Gözyaşları → Barış`
  },
  {
    title: "🌿 Nature",
    story: `Afrika savanasında bir gün batımı belgeseli.
Aslanlar, filler, zürafalar doğal ortamlarında.
Altın saat ışığı, görkemli manzaralar.
Duygusal yolculuk: Huzur → Merak → Hayret → Saygı`
  },
];

export default function AIDirectorPanel({ onStartGeneration, isGenerating }) {
  const [story, setStory] = useState('');
  const [config, setConfig] = useState({
    duration: 5,
    quality: 'standard',
    aspectRatio: '16:9',
    emotionalJourney: 'hero',
    workers: 3,
    upscale: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('story'); // story, style, advanced

  const selectedDuration = DURATION_OPTIONS.find(d => d.value === config.duration);
  const selectedQuality = QUALITY_OPTIONS.find(q => q.value === config.quality);
  const selectedAspect = ASPECT_RATIOS.find(a => a.value === config.aspectRatio);
  const selectedJourney = EMOTIONAL_JOURNEYS.find(j => j.value === config.emotionalJourney);

  const handleGenerate = () => {
    if (!story.trim()) return;
    onStartGeneration({ story, config });
  };

  const loadExample = (example) => {
    setStory(example.story);
  };

  const estimatedTime = () => {
    const scenes = selectedDuration?.scenes || 10;
    const timePerScene = selectedQuality?.value === 'premium' ? 5 : 
                         selectedQuality?.value === 'cinema' ? 4 : 3;
    return Math.ceil(scenes * timePerScene / config.workers);
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[#333]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Director Mode</h2>
            <p className="text-xs text-zinc-400">Hikayeni yaz, filmi biz yapalım</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-[#2d2d2d] p-1 rounded-lg">
          {[
            { id: 'story', label: '📝 Hikaye', icon: Sparkles },
            { id: 'style', label: '🎨 Stil', icon: Palette },
            { id: 'advanced', label: '⚙️ Gelişmiş', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-[#3d3d3d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* TAB 1: STORY */}
        {activeTab === 'story' && (
          <>
            {/* Story Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Hikayeni Anlat
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Filmini detaylı anlat...

Şunları ekle:
• Mekan ve zaman (nerede, ne zaman?)
• Karakterler (nasıl görünüyorlar?)
• Olay örgüsü (başlangıç, gelişme, son)
• Görsel stil (renkler, atmosfer)
• Duygusal yolculuk (hangi duygular?)"
                className="w-full h-40 bg-[#2d2d2d] border border-[#404040] rounded-lg p-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
                disabled={isGenerating}
              />
              <div className="text-xs text-zinc-500 text-right">
                {story.length} karakter
              </div>
            </div>

            {/* Example Stories */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Hızlı Başlangıç:</label>
              <div className="grid grid-cols-3 gap-2">
                {EXAMPLE_STORIES.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadExample(example)}
                    disabled={isGenerating}
                    className="p-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#404040] rounded-lg text-xs text-zinc-300 transition-colors disabled:opacity-50 text-center"
                  >
                    {example.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Emotional Journey */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                Duygusal Yolculuk
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EMOTIONAL_JOURNEYS.slice(0, 6).map((journey) => (
                  <button
                    key={journey.value}
                    onClick={() => setConfig({ ...config, emotionalJourney: journey.value })}
                    disabled={isGenerating}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      config.emotionalJourney === journey.value
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                        : 'bg-[#2d2d2d] border-[#404040] text-zinc-300 hover:border-zinc-500'
                    } disabled:opacity-50`}
                  >
                    <div className="font-medium text-sm">{journey.label}</div>
                    <div className="text-xs text-zinc-500">{journey.desc}</div>
                    {journey.arc.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {journey.colors.slice(0, 5).map((color, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Film Süresi
              </label>
              <div className="flex gap-2 flex-wrap">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setConfig({ ...config, duration: option.value })}
                    disabled={isGenerating}
                    className={`px-3 py-2 rounded-lg border text-center transition-all ${
                      config.duration === option.value
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-[#2d2d2d] border-[#404040] text-zinc-300 hover:border-zinc-500'
                    } disabled:opacity-50`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-zinc-500">{option.scenes} sahne</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: STYLE */}
        {activeTab === 'style' && (
          <>
            {/* Quality Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Video Kalitesi
              </label>
              <div className="space-y-2">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setConfig({ ...config, quality: option.value, upscale: option.upscale || false })}
                    disabled={isGenerating}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                      config.quality === option.value
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                        : 'bg-[#2d2d2d] border-[#404040] text-zinc-300 hover:border-zinc-500'
                    } disabled:opacity-50`}
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-zinc-500">{option.desc}</div>
                      <div className="text-xs text-zinc-600 mt-1">{option.resolution}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">{option.time}</div>
                      {option.upscale && (
                        <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded mt-1 inline-block">
                          +Upscale
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-green-400" />
                En-Boy Oranı
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => {
                  const Icon = ratio.icon;
                  return (
                    <button
                      key={ratio.value}
                      onClick={() => setConfig({ ...config, aspectRatio: ratio.value })}
                      disabled={isGenerating}
                      className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                        config.aspectRatio === ratio.value
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : 'bg-[#2d2d2d] border-[#404040] text-zinc-300 hover:border-zinc-500'
                      } disabled:opacity-50`}
                    >
                      <Icon className="w-6 h-6" />
                      <div>
                        <div className="font-medium">{ratio.label}</div>
                        <div className="text-xs text-zinc-500">{ratio.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* TAB 3: ADVANCED */}
        {activeTab === 'advanced' && (
          <>
            {/* Parallel Workers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Paralel AI Worker Sayısı</label>
              <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#404040]">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={config.workers}
                  onChange={(e) => setConfig({ ...config, workers: parseInt(e.target.value) })}
                  disabled={isGenerating}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>1 (Yavaş, Ucuz)</span>
                  <span className="text-purple-400 font-bold">{config.workers} Worker</span>
                  <span>5 (Hızlı, Pahalı)</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Daha fazla worker = Daha hızlı üretim, daha yüksek API maliyeti
              </p>
            </div>

            {/* Upscaling Option */}
            <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#404040]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-zinc-300">AI Upscaling</div>
                  <div className="text-xs text-zinc-500">720p → 1080p kalite artırma</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.upscale}
                  onChange={(e) => setConfig({ ...config, upscale: e.target.checked })}
                  disabled={isGenerating}
                  className="w-5 h-5 rounded bg-[#404040] border-none"
                />
              </label>
            </div>

            {/* Cost Estimate */}
            <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
              <div className="text-sm font-medium text-amber-300 mb-2">💰 Tahmini Maliyet</div>
              <div className="space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Sahne sayısı:</span>
                  <span>{selectedDuration?.scenes || 10}</span>
                </div>
                <div className="flex justify-between">
                  <span>Video üretimi:</span>
                  <span>~${((selectedDuration?.scenes || 10) * 0.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Director:</span>
                  <span>~$0.10</span>
                </div>
                {config.upscale && (
                  <div className="flex justify-between">
                    <span>Upscaling:</span>
                    <span>~$0.50</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-amber-300 pt-1 border-t border-amber-500/30">
                  <span>Toplam:</span>
                  <span>~${((selectedDuration?.scenes || 10) * 0.5 + 0.1 + (config.upscale ? 0.5 : 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Estimate Card - Always visible */}
        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Süre:</span>
              <span className="font-bold text-purple-300">{selectedDuration?.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Sahne:</span>
              <span className="font-bold text-purple-300">{selectedDuration?.scenes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Kalite:</span>
              <span className="font-bold text-purple-300">{selectedQuality?.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Tahmini:</span>
              <span className="font-bold text-purple-300">~{estimatedTime()} dk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Generate Button */}
      <div className="flex-shrink-0 p-4 border-t border-[#333]">
        <button
          onClick={handleGenerate}
          disabled={!story.trim() || isGenerating}
          data-testid="generate-film-btn"
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-600 disabled:to-zinc-600 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Film Üretiliyor...
            </>
          ) : (
            <>
              <Film className="w-5 h-5" />
              🎬 Film Üret
            </>
          )}
        </button>
      </div>
    </div>
  );
}
