import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, X, Volume2, VolumeX, 
  RotateCcw, Crown, Loader2, Clock, Waves
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// SANRI Voice wave animation component
const SanriWaveAnimation = ({ isPlaying, isLoading }) => (
  <div className="flex items-center justify-center gap-1.5 h-20">
    {[...Array(7)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1.5 bg-gradient-to-t from-indigo-600 via-violet-500 to-purple-400 rounded-full"
        animate={isLoading ? {
          height: [12, 24, 12],
          opacity: [0.5, 1, 0.5]
        } : isPlaying ? {
          height: [16, 56, 28, 64, 20, 48, 16],
        } : {
          height: 16,
          opacity: 0.4
        }}
        transition={{
          duration: isLoading ? 0.8 : 1.5,
          repeat: Infinity,
          delay: i * 0.12,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Breathing indicator for meditation
const BreathIndicator = ({ isActive }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute -top-2 left-1/2 -translate-x-1/2"
      >
        <motion.div
          className="w-3 h-3 rounded-full bg-violet-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

const RitualPlayer = ({ 
  ritual, 
  isOpen, 
  onClose, 
  isPremium = true,
  language = 'tr',
  autoPlay = true  // Premium users get autoplay
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [fullText, setFullText] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showText, setShowText] = useState(false);
  const [voiceInfo, setVoiceInfo] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const audioRef = useRef(null);

  // Reset state when ritual changes
  useEffect(() => {
    if (ritual) {
      setAudioUrl(null);
      setFullText('');
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setVoiceInfo(null);
      setHasInteracted(false);
    }
  }, [ritual?.id]);

  // Handle audio time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      toast.success(language === 'tr' ? 'Ritüel tamamlandı' : 'Ritual completed', {
        icon: '✨'
      });
    };
    const handleCanPlay = () => {
      // Autoplay for premium users after user interaction
      if (autoPlay && isPremium && hasInteracted) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log('Autoplay prevented:', err);
        });
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplaythrough', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, [audioUrl, autoPlay, isPremium, hasInteracted, language]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Load ritual audio using SANRI VOICE endpoint (ElevenLabs)
  const loadRitualAudio = useCallback(async () => {
    if (!ritual || !isPremium) return;
    
    setIsLoading(true);
    setHasInteracted(true);
    
    try {
      // Use the new SANRI VOICE ritual endpoint (ElevenLabs)
      const response = await axios.post(`${API_URL}/api/sanri/voice/ritual`, {
        ritual_id: ritual.id,
        language
      });
      
      setAudioUrl(response.data.audio_url);
      setFullText(response.data.full_text);
      setVoiceInfo(response.data.voice);
      
      toast.success(
        language === 'tr' 
          ? `${response.data.voice?.name || 'SANRI Dream'} sesi yüklendi` 
          : 'SANRI Dream voice loaded',
        { icon: '🎙️' }
      );
    } catch (error) {
      console.error('Load ritual error:', error);
      const errorMsg = error.response?.data?.detail || 
        (language === 'tr' ? 'Ritüel yüklenemedi' : 'Failed to load ritual');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [ritual, isPremium, language]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Play error:', err);
        toast.error(language === 'tr' ? 'Ses başlatılamadı' : 'Could not start audio');
      });
    }
  }, [isPlaying, language]);

  const handleSeek = useCallback((value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const restart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for visual indicator
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isOpen || !ritual) return null;

  const name = language === 'tr' ? ritual.name_tr : ritual.name_en;
  const description = language === 'tr' ? ritual.description_tr : ritual.description_en;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Immersive dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50"
            onClick={onClose}
          />
          
          {/* Player Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:w-full md:max-w-lg z-50 flex items-center justify-center"
          >
            <div className="w-full bg-gradient-to-br from-gray-900 via-indigo-950/90 to-gray-900 
                           rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/10 overflow-hidden relative">
              
              {/* Progress bar at top */}
              {audioUrl && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
                    style={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid="ritual-player-close"
                className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 z-10"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Content */}
              <div className="p-8 pt-10 text-center">
                {/* Icon with breathing indicator */}
                <div className="relative inline-block mb-4">
                  <motion.div 
                    className="text-6xl"
                    animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {ritual.icon}
                  </motion.div>
                  <BreathIndicator isActive={isPlaying} />
                </div>
                
                {/* SANRI Voice Badge */}
                {voiceInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full 
                               bg-gradient-to-r from-indigo-500/20 to-violet-500/20 
                               border border-indigo-500/30"
                  >
                    <Waves className="w-3 h-3 text-indigo-400" />
                    <span className="text-xs text-indigo-300 font-medium">
                      SANRI VOICE
                    </span>
                  </motion.div>
                )}
                
                {/* Title */}
                <h2 
                  className="text-2xl font-light text-white mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  data-testid="ritual-player-title"
                >
                  {name}
                </h2>
                
                {/* Description */}
                <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
                  {description}
                </p>

                {/* Premium Gate */}
                {!isPremium ? (
                  <div className="py-8">
                    <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-white/70 mb-4">
                      {language === 'tr' 
                        ? 'Bu ritüel Premium üyelere özel' 
                        : 'This ritual is Premium exclusive'}
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400"
                      data-testid="ritual-player-premium-btn"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {language === 'tr' ? "Premium'a Geç" : 'Go Premium'}
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Wave Animation */}
                    <div className="mb-6">
                      <SanriWaveAnimation isPlaying={isPlaying} isLoading={isLoading} />
                    </div>

                    {/* Audio element */}
                    {audioUrl && (
                      <audio 
                        ref={audioRef} 
                        src={audioUrl} 
                        preload="auto"
                        data-testid="ritual-audio-element"
                      />
                    )}

                    {/* Progress bar */}
                    {audioUrl && (
                      <div className="mb-6">
                        <Slider
                          value={[currentTime]}
                          max={duration || 100}
                          step={0.1}
                          onValueChange={handleSeek}
                          className="w-full"
                          data-testid="ritual-player-progress"
                        />
                        <div className="flex justify-between text-xs text-white/40 mt-2">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                      {/* Volume control */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                          data-testid="ritual-player-mute"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                        {!isMuted && (
                          <Slider
                            value={[volume * 100]}
                            max={100}
                            step={1}
                            onValueChange={(v) => setVolume(v[0] / 100)}
                            className="w-20"
                            data-testid="ritual-player-volume"
                          />
                        )}
                      </div>

                      {/* Restart */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={restart}
                        disabled={!audioUrl}
                        className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
                        data-testid="ritual-player-restart"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>

                      {/* Play/Pause - Main button */}
                      {!audioUrl ? (
                        <Button
                          onClick={loadRitualAudio}
                          disabled={isLoading}
                          className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 
                                   hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30
                                   disabled:opacity-50 transition-all duration-300"
                          data-testid="ritual-player-load"
                        >
                          {isLoading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <Play className="w-8 h-8 ml-1" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={togglePlayPause}
                          className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 
                                   hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30
                                   transition-all duration-300"
                          data-testid="ritual-player-play-pause"
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8" />
                          ) : (
                            <Play className="w-8 h-8 ml-1" />
                          )}
                        </Button>
                      )}

                      {/* Show text toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowText(!showText)}
                        disabled={!fullText}
                        className="text-white/60 hover:text-white hover:bg-white/10 text-xs disabled:opacity-30"
                        data-testid="ritual-player-text-toggle"
                      >
                        {showText 
                          ? (language === 'tr' ? 'Gizle' : 'Hide') 
                          : (language === 'tr' ? 'Metin' : 'Text')}
                      </Button>
                    </div>

                    {/* Duration info */}
                    <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{ritual.duration_minutes} {language === 'tr' ? 'dakika' : 'min'}</span>
                      <span className="mx-2">•</span>
                      <span>{ritual.steps?.length || 0} {language === 'tr' ? 'adım' : 'steps'}</span>
                    </div>

                    {/* Voice info */}
                    {voiceInfo && (
                      <div className="mt-2 text-xs text-indigo-400/60">
                        {voiceInfo.name} • {voiceInfo.provider || 'ElevenLabs'}
                      </div>
                    )}

                    {/* Text display */}
                    <AnimatePresence>
                      {showText && fullText && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 p-4 bg-black/40 rounded-xl max-h-48 overflow-y-auto 
                                     border border-white/5"
                        >
                          <p 
                            className="text-white/70 text-sm whitespace-pre-line text-left leading-relaxed"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                          >
                            {fullText}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Bottom gradient accent */}
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RitualPlayer;
