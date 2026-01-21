import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, Play, Download, Trash2, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BASE_URL}/api`;

export default function FilmHistoryPage() {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFilms();
  }, []);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/films`);
      if (response.ok) {
        const data = await response.json();
        setFilms(data);
        // Auto-select the most recent completed film
        const completedFilm = data.find(f => f.status === 'complete' && f.final_video_url);
        if (completedFilm) {
          setSelectedFilm(completedFilm);
        }
      }
    } catch (err) {
      setError('Failed to load films');
      console.error('Fetch films error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filmId) => {
    if (!window.confirm('Are you sure you want to delete this film?')) return;
    
    try {
      await fetch(`${API}/film/${filmId}`, { method: 'DELETE' });
      setFilms(films.filter(f => f.id !== filmId));
      if (selectedFilm?.id === filmId) {
        setSelectedFilm(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDownload = (videoUrl) => {
    window.open(`${BASE_URL}${videoUrl}`, '_blank');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'generating':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'complete':
        return 'Completed';
      case 'error':
        return 'Failed';
      case 'generating':
        return 'In Progress';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-[#333] bg-[#1a1a1a]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-[#333] rounded-lg transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg">Film History</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/ai-director')}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors"
          data-testid="new-film-button"
        >
          Create New Film
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Film List */}
        <div className="w-[400px] border-r border-[#333] overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Your Films ({films.length})</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : films.length === 0 ? (
              <div className="text-center py-8">
                <Film className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                <p className="text-zinc-500 text-sm">No films generated yet</p>
                <button
                  onClick={() => navigate('/ai-director')}
                  className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                >
                  Create Your First Film
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {films.map((film) => (
                  <div
                    key={film.id}
                    onClick={() => setSelectedFilm(film)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFilm?.id === film.id 
                        ? 'bg-purple-500/20 border border-purple-500/30' 
                        : 'bg-[#1a1a1a] hover:bg-[#252525] border border-transparent'
                    }`}
                    data-testid={`film-item-${film.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-10 bg-[#2d2d2d] rounded flex items-center justify-center flex-shrink-0">
                        {film.status === 'complete' && film.final_video_url ? (
                          <Play className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Film className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(film.status)}
                          <span className="text-xs text-zinc-400">{getStatusLabel(film.status)}</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-200 truncate mt-1">
                          {film.film_plan?.title || film.story?.substring(0, 50) || 'Untitled Film'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {formatDate(film.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Player / Details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFilm ? (
            <>
              {/* Video Player */}
              <div className="flex-1 bg-black flex items-center justify-center p-4">
                {selectedFilm.status === 'complete' && selectedFilm.final_video_url ? (
                  <video
                    key={selectedFilm.id}
                    src={`${BASE_URL}${selectedFilm.final_video_url}`}
                    controls
                    autoPlay={false}
                    className="max-w-full max-h-full rounded-lg"
                    data-testid="video-player"
                  />
                ) : selectedFilm.status === 'error' ? (
                  <div className="text-center">
                    <XCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
                    <p className="text-zinc-400 mb-2">Generation Failed</p>
                    <p className="text-sm text-zinc-500 max-w-md">{selectedFilm.error || 'Unknown error'}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Film className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
                    <p className="text-zinc-400">Video not available</p>
                  </div>
                )}
              </div>

              {/* Film Details */}
              <div className="flex-shrink-0 p-4 border-t border-[#333] bg-[#1a1a1a]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-lg">
                    {selectedFilm.film_plan?.title || 'Untitled Film'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {selectedFilm.status === 'complete' && selectedFilm.final_video_url && (
                      <button
                        onClick={() => handleDownload(selectedFilm.final_video_url)}
                        className="p-2 hover:bg-[#333] rounded-lg transition-colors"
                        title="Download"
                        data-testid="download-button"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedFilm.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Delete"
                      data-testid="delete-button"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {selectedFilm.film_plan?.logline && (
                  <p className="text-sm text-zinc-400 mb-3">{selectedFilm.film_plan.logline}</p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  {selectedFilm.film_plan?.genre && (
                    <span>Genre: {selectedFilm.film_plan.genre}</span>
                  )}
                  {selectedFilm.config?.duration && (
                    <span>Duration: {selectedFilm.config.duration} min</span>
                  )}
                  {selectedFilm.completed_scenes && (
                    <span>Scenes: {selectedFilm.completed_scenes.filter(s => s.status === 'complete').length}</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Film className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-400">Select a film to watch</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-500/90 text-white rounded-lg shadow-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-white/70 hover:text-white">×</button>
        </div>
      )}
    </div>
  );
}
