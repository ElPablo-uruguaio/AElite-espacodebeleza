import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { PWAInstallBanner } from '../components/common/PWAInstallBanner';
import { HeroCarousel } from '../components/client/HeroCarousel';
import { StoriesPlayer } from '../components/client/StoriesPlayer';
import { ServiceCatalog } from '../components/client/ServiceCatalog';
import { ReviewSection } from '../components/client/ReviewSection';
import { FidelidadeCard } from '../components/client/FidelidadeCard';
import { BookingModal } from '../components/client/BookingModal';
import { DelayMessageModal } from '../components/client/DelayMessageModal';
import { VisagismoModal } from '../components/client/VisagismoModal';
import { ServiceItem } from '../types';

export const PublicHome: React.FC = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showVisagismoModal, setShowVisagismoModal] = useState(false);

  const handleOpenBooking = (service?: ServiceItem) => {
    if (service) setSelectedService(service);
    else setSelectedService(null);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-rose-500 selection:text-white">
      
      {/* PWA Banner */}
      <PWAInstallBanner />

      {/* Header */}
      <Header
        onOpenBooking={() => handleOpenBooking()}
        onOpenDelayModal={() => setShowDelayModal(true)}
      />

      {/* Hidden button trigger for stories */}
      <button
        id="btn-open-booking"
        className="hidden"
        onClick={() => handleOpenBooking()}
      />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setShowVisagismoModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-300 transition hover:border-amber-400/50 hover:bg-amber-500/20"
          >
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span>✨ Análise de Visagismo IA</span>
          </button>
        </div>
        <HeroCarousel onOpenBooking={() => handleOpenBooking()} />
        <StoriesPlayer />
        <ServiceCatalog onSelectService={(srv) => handleOpenBooking(srv)} />
        <ReviewSection />
        <FidelidadeCard />
      </main>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          initialService={selectedService}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showDelayModal && (
        <DelayMessageModal
          onClose={() => setShowDelayModal(false)}
        />
      )}

      {showVisagismoModal && (
        <VisagismoModal onClose={() => setShowVisagismoModal(false)} />
      )}

    </div>
  );
};
