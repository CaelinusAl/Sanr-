import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AIDirectorPanel from '../components/AIDirectorPanel';
import ProductionDashboard from '../components/ProductionDashboard';
import { ArrowLeft, Film, Sparkles } from 'lucide-react';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BASE_URL}/api`;

export default function FilmGeneratorPage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [filmId, setFilmId] = useState(null);
  const [filmPlan, setFilmPlan] = useState(null);
  const [status, setStatus] = useState({
    stage: 'pre-production',
    progress: 0,
    workers: [],
    issues: [],
    completedScenes: [],
    qualityMetrics: null,
    eta: null,
    previewUrl: null,
    finalVideoUrl: null
  });
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socketUrl = API.replace('/api', '').replace('https://', 'wss://').replace('http://', 'ws://');
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('connect_error', (err) => {
      console.log('WebSocket connection error, falling back to polling:', err.message);
    });

    newSocket.on('film_status', (data) => {
      console.log('Film status update:', data);
      if (data.filmId === filmId) {
        setStatus(prev => ({
          ...prev,
          ...data,
          workers: data.workers || prev.workers,
          issues: data.issues || prev.issues,
          completedScenes: data.completedScenes || prev.completedScenes,
          qualityMetrics: data.qualityMetrics || prev.qualityMetrics
        }));

        if (data.filmPlan) {
          setFilmPlan(data.filmPlan);
        }

        if (data.stage === 'complete') {
          setIsGenerating(false);
        }
      }
    });

    newSocket.on('film_error', (data) => {
      if (data.filmId === filmId) {
        setError(data.message);
        setIsGenerating(false);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [filmId]);

  // Start film generation
  const handleStartGeneration = async ({ story, config }) => {
    setIsGenerating(true);
    setError(null);
    setStatus({
      stage: 'pre-production',
      progress: 0,
      workers: Array(config.workers).fill({ status: 'idle', currentScene: null, progress: 0 }),
      issues: [],
      completedScenes: [],
      qualityMetrics: null,
      eta: 'Calculating...',
      previewUrl: null,
      finalVideoUrl: null
    });

    try {
      const response = await fetch(`${API}/film/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, config })
      });

      if (!response.ok) {
        throw new Error('Failed to start film generation');
      }

      const data = await response.json();
      setFilmId(data.filmId);
      
      // If socket not connected, use polling
      if (!socket?.connected) {
        startPolling(data.filmId);
      }
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  // Polling fallback for status updates
  const startPolling = useCallback((fId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API}/film/${fId}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(prev => ({
            ...prev,
            ...data
          }));

          if (data.filmPlan) {
            setFilmPlan(data.filmPlan);
          }

          if (data.stage === 'complete' || data.stage === 'error') {
            clearInterval(pollInterval);
            setIsGenerating(false);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  // Cancel generation
  const handleCancel = async () => {
    if (filmId) {
      try {
        await fetch(`${API}/film/${filmId}/cancel`, { method: 'POST' });
      } catch (err) {
        console.error('Cancel error:', err);
      }
    }
    setIsGenerating(false);
    setFilmId(null);
    setFilmPlan(null);
    setStatus({
      stage: 'pre-production',
      progress: 0,
      workers: [],
      issues: [],
      completedScenes: [],
      qualityMetrics: null,
      eta: null,
      previewUrl: null,
      finalVideoUrl: null
    });
  };

  // Download film
  const handleDownload = () => {
    if (status.finalVideoUrl) {
      window.open(`${API.replace('/api', '')}${status.finalVideoUrl}`, '_blank');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-[#333] bg-[#1a1a1a]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-[#333] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg">AI Director</span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
              V2.0
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Powered by Claude Opus 4 + Sora 2
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Director Input / Production Dashboard */}
        <div className="flex-1 border-r border-[#333] overflow-hidden">
          {!isGenerating && !filmId ? (
            <AIDirectorPanel 
              onStartGeneration={handleStartGeneration}
              isGenerating={isGenerating}
            />
          ) : (
            <ProductionDashboard
              filmId={filmId}
              status={status}
              filmPlan={filmPlan}
              onCancel={handleCancel}
              onDownload={handleDownload}
            />
          )}
        </div>

        {/* Right Panel - Preview / Info */}
        <div className="w-[400px] flex flex-col bg-[#1a1a1a] overflow-hidden">
          {/* Preview Header */}
          <div className="flex-shrink-0 p-4 border-b border-[#333]">
            <h3 className="font-medium text-zinc-300">Film Preview</h3>
          </div>

          {/* Preview Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {status.previewUrl ? (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  src={`${API.replace('/api', '')}${status.previewUrl}`}
                  controls
                  className="w-full h-full"
                />
              </div>
            ) : status.stage === 'complete' && status.finalVideoUrl ? (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  src={`${API.replace('/api', '')}${status.finalVideoUrl}`}
                  controls
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                  <Film className="w-10 h-10 text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm">
                  {isGenerating 
                    ? 'Preview will appear as scenes are generated...'
                    : 'Start generating to see preview'}
                </p>
              </div>
            )}
          </div>

          {/* Film Info */}
          {filmPlan && (
            <div className="flex-shrink-0 p-4 border-t border-[#333] space-y-3">
              <h4 className="font-medium text-zinc-300">{filmPlan.title}</h4>
              
              {filmPlan.characters && filmPlan.characters.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Characters</div>
                  <div className="flex flex-wrap gap-1">
                    {filmPlan.characters.map((char, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 bg-[#2d2d2d] rounded text-xs text-zinc-300"
                      >
                        {char.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {filmPlan.visualStyle && (
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Visual Style</div>
                  <div className="flex gap-1">
                    {filmPlan.visualStyle.colorPalette?.slice(0, 5).map((color, idx) => (
                      <div 
                        key={idx}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-500/90 text-white rounded-lg shadow-lg max-w-sm">
          <div className="font-medium">Error</div>
          <div className="text-sm opacity-90">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-white/70 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
