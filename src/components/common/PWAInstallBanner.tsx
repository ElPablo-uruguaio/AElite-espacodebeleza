import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback detection for iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      const iosDismissed = localStorage.getItem('pwa_ios_dismissed');
      if (!iosDismissed) {
        setIsVisible(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar no iOS: toque no botão Compartilhar no Safari e selecione "Adicionar à Tela de Início".');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
    localStorage.setItem('pwa_ios_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-rose-950 via-zinc-900 to-amber-950 border-b border-rose-500/20 px-4 py-3 text-zinc-100 flex items-center justify-between shadow-lg relative z-30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <p className="text-sm font-semibold flex items-center gap-1">
            Instale o App na Tela Inicial <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
          </p>
          <p className="text-xs text-zinc-400">
            Acesso ultra-rápido, notificações exclusivas de promoções e agendamentos diretos.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={handleInstall}
          className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1 transition shadow"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg"
          aria-label="Fechar banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
