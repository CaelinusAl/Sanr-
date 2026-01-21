import React, { useState } from 'react';
import { Film, Sparkles, Clock, Zap, Settings, ChevronRight, Loader2 } from 'lucide-react';

const QUALITY_OPTIONS = [
  { value: 'fast', label: '🚀 Fast', desc: '15 min, Good quality', time: '15 min' },
  { value: 'balanced', label: '⭐ Balanced', desc: '30 min, Great quality', time: '30 min' },
  { value: 'hollywood', label: '💎 Hollywood', desc: '60 min, Perfect quality', time: '60 min' },
];

const DURATION_OPTIONS = [
  { value: 5, label: '5 minutes', scenes: 10 },
  { value: 15, label: '15 minutes', scenes: 30 },
  { value: 30, label: '30 minutes', scenes: 60 },
  { value: 60, label: '60 minutes', scenes: 120 },
];

const EXAMPLE_STORIES = [
  {
    title: "Sci-Fi Thriller",
    story: `A 5-minute sci-fi thriller set in 2099 Tokyo.
A detective discovers AI consciousness while investigating murders.
Dark, neon-lit, Blade Runner aesthetic.
Main character: Asian male, 35, wearing trench coat.
3 acts: discovery → chase → revelation.`
  },
  {
    title: "Romantic Comedy",
    story: `A 5-minute romantic comedy in Paris.
Two strangers meet at a cafe during a rain storm.
Light, warm colors, Before Sunrise vibes.
Characters: Young woman with red hair, charming French man.
Funny misunderstandings lead to connection.`
  },
  {
    title: "Action Scene",
    story: `A 5-minute action sequence.
A spy infiltrates a high-tech facility at night.
Dark, tense, Mission Impossible style.
Main character: Athletic woman in black tactical gear.
Laser security, guards, dramatic escape.`
  }
];

export default function AIDirectorPanel({ onStartGeneration, isGenerating }) {
  const [story, setStory] = useState('');
  const [config, setConfig] = useState({
    duration: 5,
    quality: 'fast',
    workers: 5
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedDuration = DURATION_OPTIONS.find(d => d.value === config.duration);
  const selectedQuality = QUALITY_OPTIONS.find(q => q.value === config.quality);

  const handleGenerate = () => {
    if (!story.trim()) return;
    onStartGeneration({ story, config });
  };

  const loadExample = (example) => {
    setStory(example.story);
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
            <p className="text-xs text-zinc-400">Describe your film, we'll create it</p>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Story Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Your Story
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Describe your film in detail...

Include:
• Setting (time, place, atmosphere)
• Characters (appearance, personality)
• Plot (beginning, middle, end)
• Visual style (colors, mood, references)"
            className="w-full h-48 bg-[#2d2d2d] border border-[#404040] rounded-lg p-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
            disabled={isGenerating}
          />
          <div className="text-xs text-zinc-500 text-right">
            {story.length} characters
          </div>
        </div>

        {/* Example Stories */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-500">Quick Start Examples:</label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_STORIES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#404040] rounded-md text-xs text-zinc-300 transition-colors disabled:opacity-50"
              >
                {example.title}
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
          <div className="grid grid-cols-2 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setConfig({ ...config, duration: option.value })}
                disabled={isGenerating}
                className={`p-3 rounded-lg border text-left transition-all ${
                  config.duration === option.value
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-[#2d2d2d] border-[#404040] text-zinc-300 hover:border-zinc-500'
                } disabled:opacity-50`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-zinc-500">{option.scenes} scenes</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Quality Level
          </label>
          <div className="space-y-2">
            {QUALITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setConfig({ ...config, quality: option.value })}
                disabled={isGenerating}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  config.quality === option.value
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-[#2d2d2d] border-[#404040] text-zinc-300 hover:border-zinc-500'
                } disabled:opacity-50`}
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-zinc-500">{option.desc}</div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${config.quality === option.value ? 'text-purple-400' : 'text-zinc-600'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Advanced Settings
            <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
          </button>
          
          {showAdvanced && (
            <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#404040] space-y-3">
              <div>
                <label className="text-xs text-zinc-400">Parallel Workers</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.workers}
                  onChange={(e) => setConfig({ ...config, workers: parseInt(e.target.value) })}
                  disabled={isGenerating}
                  className="w-full mt-1"
                />
                <div className="text-xs text-zinc-500 mt-1">{config.workers} workers (faster = more parallel)</div>
              </div>
            </div>
          )}
        </div>

        {/* Estimate */}
        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-300">Estimated Time:</span>
            <span className="font-bold text-purple-300">{selectedQuality?.time}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-zinc-300">Total Scenes:</span>
            <span className="font-bold text-purple-300">{selectedDuration?.scenes} scenes</span>
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
