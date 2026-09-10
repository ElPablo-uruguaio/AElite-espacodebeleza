import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, X, Play, Sparkles, Film } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { StoryMedia } from '../../types';

export const StoriesPlayer: React.FC = () => {
  const { stories } = useSalon();
  const [activeStory, setActiveStory] = useState<StoryMedia | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeStories = stories.filter(s => s.ativo);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  if (activeStories.length === 0) return null;

  return (
    <section id="stories" className="py-8 bg-zinc-950/90 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 animate-pulse">
              <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Stories do Salão</h2>
            <span className="text-xs bg-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full font-semibold border border-rose-500/30">
              Ao Vivo
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Toque para assistir em loop</span>
        </div>

        {/* Stories Horizontal Avatars Carousel */}
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
          {activeStories.map((story) => (
            <button
              key={story.id}
              onClick={() => {
                setActiveStory(story);
                setIsMuted(true);
              }}
              className="flex flex-col items-center shrink-0 space-y-1.5 group focus:outline-none"
            >
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-2 border-zinc-950 relative">
                  {story.media_type === 'video' ? (
                    <div className="w-full h-full relative">
                      <video
                        src={story.media_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={story.media_url}
                      alt={story.titulo || 'Story'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold text-zinc-300 max-w-[80px] truncate group-hover:text-rose-400 transition">
                {story.titulo || 'VIP Story'}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-sm sm:max-w-md h-[85vh] bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col">
            
            {/* Top Bar inside Story */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white text-xs font-bold">
                  VIP
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{activeStory.titulo || 'Espaço Beleza VIP'}</p>
                  <p className="text-[10px] text-zinc-300 flex items-center gap-1">
                    <Film className="w-3 h-3 text-amber-400 inline" /> Loop Infinito Ativo
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Audio Toggle Button */}
                <button
                  onClick={toggleSound}
                  className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition"
                  title={isMuted ? 'Ativar Áudio' : 'Desativar Áudio'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setActiveStory(null)}
                  className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition"
                  title="Fechar Story"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {activeStory.media_type === 'video' ? (
                <video
                  ref={videoRef}
                  src={activeStory.media_url}
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeStory.media_url}
                  alt="Story VIP"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Audio Track Player if present */}
              {activeStory.audio_url && (
                <audio
                  src={activeStory.audio_url}
                  autoPlay
                  loop
                  muted={isMuted}
                />
              )}
            </div>

            {/* Bottom Caption & Action */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 text-center">
              <p className="text-xs text-zinc-300 mb-3 font-medium">
                Gostou dessa transformação? Agende com nossa equipe!
              </p>
              <button
                onClick={() => {
                  setActiveStory(null);
                  const bookingBtn = document.getElementById('btn-open-booking');
                  if (bookingBtn) bookingBtn.click();
                }}
                className="w-full rose-gradient-btn text-white text-sm font-bold py-3 rounded-xl shadow-lg"
              >
                Agendar Este Visual
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
