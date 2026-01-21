import React, { useEffect, useState, useRef } from 'react';
import { 
  Play, Pause, CheckCircle2, AlertTriangle, Clock, 
  Film, Cpu, Zap, Eye, Download, RefreshCw, 
  ChevronDown, ChevronUp, X, Loader2
} from 'lucide-react';

const STAGES = [
  { id: 'pre-production', label: 'Pre-Production', icon: '📝' },
  { id: 'production', label: 'Production', icon: '🎬' },
  { id: 'validation', label: 'Quality Check', icon: '✅' },
  { id: 'post-production', label: 'Post-Production', icon: '🎨' },
  { id: 'assembly', label: 'Final Assembly', icon: '🎥' },
  { id: 'complete', label: 'Complete', icon: '🎉' },
];

const WorkerCard = ({ worker, index }) => {
  const statusColors = {
    idle: 'bg-zinc-600',
    generating: 'bg-blue-500 animate-pulse',
    complete: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`p-2 rounded-lg border ${worker.status === 'generating' ? 'border-blue-500 bg-blue-500/10' : 'border-[#404040] bg-[#2d2d2d]'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Worker {index + 1}</span>
        <div className={`w-2 h-2 rounded-full ${statusColors[worker.status] || 'bg-zinc-600'}`} />
      </div>
      {worker.currentScene && (
        <div className="mt-1 text-xs text-zinc-300 truncate">
          Scene {worker.currentScene}
        </div>
      )}
      {worker.progress > 0 && worker.status === 'generating' && (
        <div className="mt-1 h-1 bg-[#404040] rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${worker.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

const IssueCard = ({ issue }) => {
  const severityColors = {
    critical: 'border-red-500 bg-red-500/10 text-red-400',
    warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    info: 'border-blue-500 bg-blue-500/10 text-blue-400',
  };

  return (
    <div className={`p-2 rounded-lg border ${severityColors[issue.severity] || severityColors.info}`}>
      <div className="flex items-start gap-2">
        {issue.severity === 'critical' ? (
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium">{issue.type.replace(/_/g, ' ')}</div>
          <div className="text-xs opacity-80 truncate">{issue.message}</div>
          {issue.autoFixable && (
            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Auto-fixing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ScenePreview = ({ scene, isActive }) => {
  return (
    <div className={`flex-shrink-0 w-24 p-2 rounded-lg border transition-all ${
      isActive ? 'border-purple-500 bg-purple-500/10' : 'border-[#404040] bg-[#2d2d2d]'
    }`}>
      <div className="aspect-video bg-[#1a1a1a] rounded mb-1 flex items-center justify-center overflow-hidden">
        {scene.thumbnail ? (
          <img src={scene.thumbnail} alt={`Scene ${scene.number}`} className="w-full h-full object-cover" />
        ) : scene.status === 'generating' ? (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        ) : scene.status === 'complete' ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <Film className="w-4 h-4 text-zinc-600" />
        )}
      </div>
      <div className="text-xs text-center">
        <div className="text-zinc-300 truncate">{scene.number}</div>
        <div className={`text-[10px] ${
          scene.status === 'complete' ? 'text-green-400' :
          scene.status === 'generating' ? 'text-blue-400' :
          scene.status === 'error' ? 'text-red-400' : 'text-zinc-500'
        }`}>
          {scene.status}
        </div>
      </div>
    </div>
  );
};

export default function ProductionDashboard({ 
  filmId, 
  status, 
  onCancel, 
  onDownload,
  filmPlan 
}) {
  const [expandedSections, setExpandedSections] = useState({
    workers: true,
    scenes: true,
    issues: true,
    quality: true
  });
  const scenesRef = useRef(null);

  const currentStageIndex = STAGES.findIndex(s => s.id === status.stage);
  const progressPercent = status.progress || 0;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Auto-scroll to latest scene
  useEffect(() => {
    if (scenesRef.current && status.completedScenes?.length > 0) {
      scenesRef.current.scrollLeft = scenesRef.current.scrollWidth;
    }
  }, [status.completedScenes]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[#333]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{filmPlan?.title || 'Generating Film...'}</h2>
              <p className="text-xs text-zinc-400">{filmPlan?.genre || 'AI Director Mode'}</p>
            </div>
          </div>
          {status.stage !== 'complete' && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stage Progress */}
      <div className="flex-shrink-0 p-4 border-b border-[#333]">
        <div className="flex items-center justify-between mb-2">
          {STAGES.map((stage, idx) => (
            <div 
              key={stage.id}
              className={`flex flex-col items-center ${idx <= currentStageIndex ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                idx < currentStageIndex ? 'bg-green-500' :
                idx === currentStageIndex ? 'bg-purple-500 animate-pulse' :
                'bg-[#404040]'
              }`}>
                {idx < currentStageIndex ? <CheckCircle2 className="w-4 h-4" /> : stage.icon}
              </div>
              <span className="text-[10px] mt-1 text-zinc-400 hidden sm:block">{stage.label}</span>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-[#2d2d2d] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
          <span>{progressPercent.toFixed(0)}% Complete</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ETA: {status.eta || 'Calculating...'}
          </span>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Film Plan Summary */}
        {filmPlan && (
          <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#404040]">
            <p className="text-sm text-zinc-300 italic">"{filmPlan.logline}"</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">{filmPlan.genre}</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{filmPlan.scenes?.length || 0} scenes</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">{filmPlan.characters?.length || 0} characters</span>
            </div>
          </div>
        )}

        {/* AI Workers Grid */}
        {status.stage === 'production' && status.workers && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('workers')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Cpu className="w-4 h-4 text-blue-400" />
                AI Workers ({status.workers.filter(w => w.status === 'generating').length}/{status.workers.length} active)
              </div>
              {expandedSections.workers ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>
            
            {expandedSections.workers && (
              <div className="grid grid-cols-5 gap-2">
                {status.workers.map((worker, idx) => (
                  <WorkerCard key={idx} worker={worker} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scenes Progress */}
        {status.completedScenes && status.completedScenes.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('scenes')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Film className="w-4 h-4 text-purple-400" />
                Scenes ({status.completedScenes.filter(s => s.status === 'complete').length}/{status.totalScenes || status.completedScenes.length})
              </div>
              {expandedSections.scenes ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>
            
            {expandedSections.scenes && (
              <div 
                ref={scenesRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-600"
              >
                {status.completedScenes.map((scene, idx) => (
                  <ScenePreview 
                    key={idx} 
                    scene={scene} 
                    isActive={scene.status === 'generating'} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Preview */}
        {status.previewUrl && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Eye className="w-4 h-4 text-green-400" />
              Live Preview
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                src={status.previewUrl} 
                controls 
                className="w-full h-full"
                autoPlay
                muted
              />
            </div>
          </div>
        )}

        {/* Issues Tracker */}
        {status.issues && status.issues.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('issues')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Issues ({status.issues.length})
              </div>
              {expandedSections.issues ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>
            
            {expandedSections.issues && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {status.issues.map((issue, idx) => (
                  <IssueCard key={idx} issue={issue} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quality Metrics */}
        {status.qualityMetrics && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('quality')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Zap className="w-4 h-4 text-yellow-400" />
                Quality Metrics
              </div>
              {expandedSections.quality ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>
            
            {expandedSections.quality && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-[#2d2d2d] rounded-lg border border-[#404040]">
                  <div className="text-xs text-zinc-400">Face Consistency</div>
                  <div className="text-lg font-bold text-green-400">{status.qualityMetrics.faceConsistency}%</div>
                </div>
                <div className="p-2 bg-[#2d2d2d] rounded-lg border border-[#404040]">
                  <div className="text-xs text-zinc-400">Lighting Score</div>
                  <div className="text-lg font-bold text-blue-400">{status.qualityMetrics.lightingScore}%</div>
                </div>
                <div className="p-2 bg-[#2d2d2d] rounded-lg border border-[#404040]">
                  <div className="text-xs text-zinc-400">Overall Quality</div>
                  <div className="text-lg font-bold text-purple-400">{status.qualityMetrics.overallScore}/10</div>
                </div>
                <div className="p-2 bg-[#2d2d2d] rounded-lg border border-[#404040]">
                  <div className="text-xs text-zinc-400">Auto-Fixed</div>
                  <div className="text-lg font-bold text-yellow-400">{status.qualityMetrics.autoFixedCount}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {status.stage === 'complete' && (
        <div className="flex-shrink-0 p-4 border-t border-[#333]">
          <div className="flex gap-2">
            <button
              onClick={() => window.open(status.finalVideoUrl, '_blank')}
              className="flex-1 py-3 px-4 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#404040] rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
            <button
              onClick={onDownload}
              data-testid="download-film-btn"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              Download Film
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
