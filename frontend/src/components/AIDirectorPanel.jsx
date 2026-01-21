import React, { useState } from 'react';
import { Film, Sparkles, Clock, Zap, Settings, ChevronRight, Loader2, Monitor, Smartphone, Square, RectangleHorizontal, Heart, Palette } from 'lucide-react';

// Quality Presets - Updated for proper scene duration
const QUALITY_OPTIONS = [
  { value: 'mobile', label: '📱 Mobile', desc: 'Optimized for social media', resolution: '1024x1024', time: '~15 min/scene', duration: 8, sceneDuration: '8s/scene' },
  { value: 'standard', label: '🖥️ Standard', desc: 'Ideal for YouTube/Web', resolution: '1280x720', time: '~20 min/scene', duration: 12, sceneDuration: '12s/scene' },
  { value: 'cinema', label: '🎬 Cinema', desc: 'Cinematic widescreen', resolution: '1792x1024', time: '~25 min/scene', duration: 12, sceneDuration: '12s/scene' },
  { value: 'premium', label: '💎 Premium', desc: 'Highest quality + upscale', resolution: '1792x1024 → 1080p', time: '~30 min/scene', duration: 15, upscale: true, sceneDuration: '15s/scene' },
];

// Aspect Ratio Options
const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9', desc: 'Widescreen', icon: RectangleHorizontal, size: '1280x720' },
  { value: '9:16', label: '9:16', desc: 'Portrait/TikTok', icon: Smartphone, size: '1024x1792' },
  { value: '1:1', label: '1:1', desc: 'Square/Instagram', icon: Square, size: '1024x1024' },
  { value: '21:9', label: '21:9', desc: 'Cinematic Ultra-wide', icon: Monitor, size: '1792x1024' },
];

// Duration Options - CORRECTED: scenes calculated for actual duration
const DURATION_OPTIONS = [
  { value: 1, label: '1 minute', scenes: 5, desc: 'Quick test' },      // 5 scenes x 12s = 60s
  { value: 3, label: '3 minutes', scenes: 15, desc: 'Short film' },    // 15 scenes x 12s = 180s
  { value: 5, label: '5 minutes', scenes: 25, desc: 'Standard' },      // 25 scenes x 12s = 300s
  { value: 10, label: '10 minutes', scenes: 50, desc: 'Medium length' }, // 50 scenes x 12s = 600s
  { value: 15, label: '15 minutes', scenes: 75, desc: 'Long film' },   // 75 scenes x 12s = 900s
];

// Emotional Journey Presets
const EMOTIONAL_JOURNEYS = [
  { 
    value: 'hero', 
    label: "🦸 Hero's Journey", 
    desc: 'Classic hero story arc',
    arc: ['Peace', 'Call', 'Adventure', 'Crisis', 'Victory', 'Return'],
    colors: ['#4ade80', '#60a5fa', '#f59e0b', '#ef4444', '#8b5cf6', '#22d3ee']
  },
  { 
    value: 'tragedy', 
    label: '😢 Tragedy', 
    desc: 'Emotional tragedy arc',
    arc: ['Happiness', 'Doubt', 'Downfall', 'Loss', 'Acceptance'],
    colors: ['#fcd34d', '#fb923c', '#f87171', '#6b7280', '#a78bfa']
  },
  { 
    value: 'comedy', 
    label: '😄 Comedy', 
    desc: 'Fun and entertaining',
    arc: ['Chaos', 'Confusion', 'More Chaos', 'Resolution', 'Happy End'],
    colors: ['#facc15', '#fb923c', '#f472b6', '#34d399', '#22d3ee']
  },
  { 
    value: 'romance', 
    label: '💕 Romance', 
    desc: 'Love story arc',
    arc: ['Meeting', 'Connection', 'Conflict', 'Separation', 'Reunion'],
    colors: ['#fda4af', '#f472b6', '#a855f7', '#6366f1', '#ec4899']
  },
  { 
    value: 'mystery', 
    label: '🔮 Mystery', 
    desc: 'Mystery and suspense',
    arc: ['Mystery', 'Clues', 'Suspects', 'Shock', 'Resolution'],
    colors: ['#1e293b', '#475569', '#64748b', '#f59e0b', '#22c55e']
  },
  { 
    value: 'horror', 
    label: '👻 Horror', 
    desc: 'Horror and thriller',
    arc: ['Peace', 'Unease', 'Fear', 'Panic', 'Escape/End'],
    colors: ['#d4d4d4', '#a1a1aa', '#71717a', '#dc2626', '#1f2937']
  },
  { 
    value: 'custom', 
    label: '🎨 Custom', 
    desc: 'Your own emotional journey',
    arc: [],
    colors: []
  },
];

// Example Stories
const EXAMPLE_STORIES = [
  {
    title: "🚀 Sci-Fi",
    story: `A sci-fi thriller set in 2099 Tokyo.
A detective discovers AI consciousness while investigating murders.
Dark, neon-lit, Blade Runner aesthetic.
Main character: 35-year-old Asian male wearing a trench coat.
Emotional journey: Curiosity → Discovery → Shock → Acceptance`
  },
  {
    title: "💕 Romance",
    story: `A romantic comedy set in Paris.
Two strangers meet at a cafe during a rain storm.
Warm colors, Before Sunrise vibes.
Characters: Young woman with red hair, charming French man.
Emotional journey: Meeting → Attraction → Misunderstanding → Reunion`
  },
  {
    title: "🎬 Action",
    story: `A spy infiltrating a high-tech facility at midnight.
Dark, tense, Mission Impossible style.
Main character: Athletic woman in black tactical gear.
Laser security, guards, dramatic escape.
Emotional journey: Tension → Action → Danger → Victory`
  },
  {
    title: "👻 Horror",
    story: `A horror film set in an abandoned hospital.
A group of friends encounters paranormal events.
Dark, gloomy, cold colors.
Characters: Group of 4 young friends.
Emotional journey: Curiosity → Unease → Fear → Panic → Survival`
  },
  {
    title: "🎭 Drama",
    story: `A family reuniting after many years.
Old wounds, hidden secrets, and forgiveness.
Warm interiors, emotional close-ups.
Characters: Elderly mother, two adult siblings.
Emotional journey: Tension → Conflict → Confession → Tears → Peace`
  },
  {
    title: "🌿 Nature",
    story: `A sunset documentary in the African savanna.
Lions, elephants, giraffes in their natural habitat.
Golden hour lighting, majestic landscapes.
Emotional journey: Peace → Curiosity → Wonder → Respect`
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
  const [activeTab, setActiveTab] = useState('story');

  const selectedDuration = DURATION_OPTIONS.find(d => d.value === config.duration);
  const selectedQuality = QUALITY_OPTIONS.find(q => q.value === config.quality);

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
            <p className="text-xs text-zinc-400">Describe your story, we'll create the film</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-[#2d2d2d] p-1 rounded-lg">
          {[
            { id: 'story', label: '📝 Story', icon: Sparkles },
            { id: 'style', label: '🎨 Style', icon: Palette },
            { id: 'advanced', label: '⚙️ Advanced', icon: Settings },
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
                Tell Your Story
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Describe your film in detail...

Include:
• Setting (where and when?)
• Characters (how do they look?)
• Plot (beginning, middle, end)
• Visual style (colors, atmosphere)
• Emotional journey (what emotions?)"
                className="w-full h-40 bg-[#2d2d2d] border border-[#404040] rounded-lg p-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
                disabled={isGenerating}
              />
              <div className="text-xs text-zinc-500 text-right">
                {story.length} characters
              </div>
            </div>

            {/* Example Stories */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Quick Start:</label>
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
                Emotional Journey
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
                Film Duration
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
                    <div className="text-xs text-zinc-500">{option.scenes} scenes</div>
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
                Video Quality
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
                Aspect Ratio
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
              <label className="text-sm font-medium text-zinc-300">Parallel AI Workers</label>
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
                  <span>1 (Slow, Cheap)</span>
                  <span className="text-purple-400 font-bold">{config.workers} Workers</span>
                  <span>5 (Fast, Costly)</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                More workers = Faster generation, higher API cost
              </p>
            </div>

            {/* Upscaling Option */}
            <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#404040]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-zinc-300">AI Upscaling</div>
                  <div className="text-xs text-zinc-500">720p → 1080p quality enhancement</div>
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
              <div className="text-sm font-medium text-amber-300 mb-2">💰 Estimated Cost</div>
              <div className="space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Scene count:</span>
                  <span>{selectedDuration?.scenes || 10}</span>
                </div>
                <div className="flex justify-between">
                  <span>Video generation:</span>
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
                  <span>Total:</span>
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
              <span className="text-zinc-400">Duration:</span>
              <span className="font-bold text-purple-300">{selectedDuration?.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Scenes:</span>
              <span className="font-bold text-purple-300">{selectedDuration?.scenes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Quality:</span>
              <span className="font-bold text-purple-300">{selectedQuality?.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Estimate:</span>
              <span className="font-bold text-purple-300">~{estimatedTime()} min</span>
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
              Generating Film...
            </>
          ) : (
            <>
              <Film className="w-5 h-5" />
              🎬 Generate Film
            </>
          )}
        </button>
      </div>
    </div>
  );
}
