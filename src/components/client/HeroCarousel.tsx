import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Upload, Image } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { useAuth } from '../../context/AuthContext';

interface HeroCarouselProps {
  onOpenBooking: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onOpenBooking }) => {
  const { settings, updateSettings } = useSalon();
  const { isLoggedIn, role } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  const isGestora = isLoggedIn && (role === 'admin' || role === 'dev_admin');

  const banners = settings.banner_urls.length > 0
    ? settings.banner_urls
    : ['https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'];

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        const newBanners = [...banners];
        newBanners[currentSlide] = result;
        updateSettings({ banner_urls: newBanners });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="relative min-h-[520px] sm:min-h-[580px] flex items-center justify-center overflow-hidden bg-zinc-950">
      
      {/* Background Slides */}
      {banners.map((url, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <img
            src={url}
            alt="Salão de beleza banner"
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
        </div>
      ))}

      {/* Quick Gestora Banner Change Button */}
      {isGestora && (
        <div className="absolute top-4 right-4 z-30">
          <input
            type="file"
            ref={bannerFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />
          <button
            onClick={() => bannerFileInputRef.current?.click()}
            className="bg-black/70 hover:bg-rose-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg transition"
            title="Alterar foto do banner atual"
          >
            <Upload className="w-4 h-4 text-rose-400 hover:text-white" />
            <span>Trocar Imagem do Banner</span>
          </button>
        </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 py-16">
        <div className="inline-flex items-center space-x-2 bg-zinc-900/90 border border-amber-500/30 px-4 py-1.5 rounded-full mb-6 shadow-xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-amber-300">
            Experiência VIP & Atendimento Exclusivo
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Sua beleza tratada com o <span className="gold-gradient-text">cuidado e elegância</span> que você merece.
        </h1>

        <p className="text-zinc-300 text-sm sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-light">
          Agendamento online simples, rápido e em tempo real. Escolha o serviço, selecione seu profissional favorito e transforme seu visual.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto rose-gradient-btn text-white text-base font-bold px-8 py-4 rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 group"
          >
            <Calendar className="w-5 h-5 text-white" />
            <span>Agendar Meu Horário Agora</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#servicos"
            className="w-full sm:w-auto bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-base font-semibold px-6 py-4 rounded-2xl border border-zinc-700 backdrop-blur-md transition flex items-center justify-center"
          >
            Ver Catálogo de Serviços
          </a>
        </div>

        {/* Guarantee badge */}
        <div className="mt-8 flex items-center justify-center space-x-4 text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 inline" /> Agendamento 100% Gratuito Sem Sinal
          </span>
          <span>•</span>
          <span>Confirmação Instantânea</span>
        </div>
      </div>

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-rose-500 w-8' : 'bg-white/30 hover:bg-white/50'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
