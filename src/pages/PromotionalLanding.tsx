import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Scissors } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { LandingPageCampaign } from '../types';
import { BookingModal } from '../components/client/BookingModal';
import { Footer } from '../components/common/Footer';

interface PromotionalLandingProps {
  slug: string;
}

export const PromotionalLanding: React.FC<PromotionalLandingProps> = ({ slug }) => {
  const { landingPages, trackLandingPageView, settings, services } = useSalon();
  const [campaign, setCampaign] = useState<LandingPageCampaign | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const found = landingPages.find(lp => lp.slug === slug || slug.includes(lp.slug));
    if (found) {
      setCampaign(found);
      trackLandingPageView(found.slug);
    }
  }, [slug, landingPages]);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Oferta Promocional não encontrada</h2>
        <p className="text-xs text-zinc-400 mb-6">A campanha pode ter expirado ou a URL está incorreta.</p>
        <a href="#" className="rose-gradient-btn text-white text-xs font-bold px-6 py-3 rounded-xl">
          Voltar para a Página Principal do Salão
        </a>
      </div>
    );
  }

  // Pre-selected promo service or fallback to first
  const promoService = services[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Header Bar */}
      <header className="bg-zinc-950 border-b border-zinc-900 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
            <Scissors className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base text-white">{settings.nome_salao}</span>
        </div>

        <a href="#" className="text-xs text-zinc-400 hover:text-white font-semibold">
          Conheça Todos os Serviços
        </a>
      </header>

      {/* Hero Cover Banner */}
      <div className="relative min-h-[480px] flex items-center justify-center overflow-hidden">
        <img
          src={campaign.imagem_capa}
          alt={campaign.titulo_oferta}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/50" />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 py-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Oferta Exclusiva Limitada</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {campaign.titulo_oferta}
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto font-light">
            {campaign.descricao}
          </p>

          <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl max-w-md mx-auto space-y-3 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Preço Especial da Campanha:</span>
              <span className="text-2xl font-extrabold text-emerald-400">R$ {campaign.preco_promocional.toFixed(2)}</span>
            </div>

            <p className="text-[11px] text-zinc-400 text-left border-t border-zinc-800 pt-2">
              Reserva imediata sem cobrança de sinal prévio. Pagamento realizado diretamente no salão.
            </p>

            <button
              onClick={() => setShowBooking(true)}
              className="w-full rose-gradient-btn text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center space-x-2 shadow-xl shadow-rose-600/30"
            >
              <Calendar className="w-5 h-5" />
              <span>Garantir Minha Vaga Promocional</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 inline" /> Agendamento 100% Gratuito Sem Sinal
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Booking Modal with UTM context */}
      {showBooking && (
        <BookingModal
          initialService={promoService}
          onClose={() => setShowBooking(false)}
        />
      )}

    </div>
  );
};
