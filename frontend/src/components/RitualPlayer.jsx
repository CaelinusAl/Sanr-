import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, X, Volume2, VolumeX, 
  RotateCcw, Crown, Loader2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Wave animation component
const WaveAnimation = ({ isPlaying }) => (
  <div className="flex items-center justify-center gap-1 h-16">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-gradient-to-t from-indigo-500 to-violet-500 rounded-full"
        animate={isPlaying ? {
          height: [16, 48, 24, 56, 16],
        } : {
          height: 16
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

const RitualPlayer = ({ 
  ritual, 
  isOpen, 
  onClose, 
  isPremium = true,
  language = 'tr'
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
  
  const audioRef = useRef(null);

  // Reset state when ritual changes
  useEffect(() => {
    if (ritual) {
      setAudioUrl(null);
      setFullText('');
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [ritual?.id]);

  // Handle audio time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const loadRitualAudio = async () => {
    if (!ritual || !isPremium) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/premium-ritual/play`, {
        ritual_id: ritual.id,
        language
      });
      
      setAudioUrl(response.data.audio_url);
      setFullText(response.data.full_text);
      toast.success('Ritüel hazır');
    } catch (error) {
      console.error('Load ritual error:', error);
      toast.error('Ritüel yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !ritual) return null;

  const name = language === 'tr' ? ritual.name_tr : ritual.name_en;
  const description = language === 'tr' ? ritual.description_tr : ritual.description_en;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          {/* Player Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:w-full md:max-w-lg z-50 flex items-center justify-center"
          >
            <div className="w-full bg-gradient-to-br from-gray-900 via-indigo-950/80 to-gray-900 
                           rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Content */}
              <div className="p-8 text-center">
                {/* Icon */}
                <div className="text-6xl mb-4">{ritual.icon}</div>
                
                {/* Title */}
                <h2 
                  className="text-2xl font-light text-white mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
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
                      Bu ritüel Premium üyelere özel
                    </p>
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400">
                      <Crown className="w-4 h-4 mr-2" />
                      Premium'a Geç
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Wave Animation */}
                    <div className="mb-6">
                      <WaveAnimation isPlaying={isPlaying} />
                    </div>

                    {/* Audio element */}
                    {audioUrl && (
                      <audio ref={audioRef} src={audioUrl} preload="metadata" />
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
                        />
                        <div className="flex justify-between text-xs text-white/40 mt-2">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                      {/* Volume */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white/60 hover:text-white"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>

                      {/* Restart */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={restart}
                        disabled={!audioUrl}
                        className="text-white/60 hover:text-white"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>

                      {/* Play/Pause - Main button */}
                      {!audioUrl ? (
                        <Button
                          onClick={loadRitualAudio}
                          disabled={isLoading}
                          className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 
                                   hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30"
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
                                   hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30"
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
                        className="text-white/60 hover:text-white text-xs"
                      >
                        {showText ? 'Gizle' : 'Metin'}
                      </Button>
                    </div>

                    {/* Duration info */}
                    <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{ritual.duration_minutes} dakika</span>
                      <span className="mx-2">•</span>
                      <span>{ritual.steps?.length || 0} adım</span>
                    </div>

                    {/* Text display */}
                    <AnimatePresence>
                      {showText && fullText && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 p-4 bg-black/30 rounded-xl max-h-48 overflow-y-auto"
                        >
                          <p 
                            className="text-white/70 text-sm whitespace-pre-line text-left"
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

              {/* Bottom gradient */}
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RitualPlayer;
