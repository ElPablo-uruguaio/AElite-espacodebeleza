import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export const ServiceWorkerUpdateBanner: React.FC = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const isReloading = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;
    const updateInterval = window.setInterval(() => {
      void registration?.update().catch(error => {
        console.warn('[PWA] Não foi possível verificar atualizações.', error);
      });
    }, 60 * 60 * 1000);

    const handleControllerChange = () => {
      if (!isReloading.current) return;
      window.location.reload();
    };

    const setupUpdateCheck = async () => {
      try {
        registration = await navigator.serviceWorker.ready;

        const showWaitingWorker = () => {
          if (registration?.waiting) {
            setWaitingWorker(registration.waiting);
            setIsDismissed(false);
          }
        };

        const handleUpdateFound = () => {
          const installingWorker = registration?.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showWaitingWorker();
            }
          });
        };

        registration.addEventListener('updatefound', handleUpdateFound);
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        await registration.update();
        showWaitingWorker();

        return () => {
          registration?.removeEventListener('updatefound', handleUpdateFound);
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        };
      } catch (error) {
        console.warn('[PWA] Não foi possível verificar atualizações.', error);
      }
    };

    let cleanup: (() => void) | undefined;
    void setupUpdateCheck().then(removeListeners => {
      cleanup = removeListeners;
    });

    return () => {
      window.clearInterval(updateInterval);
      cleanup?.();
    };
  }, []);

  const updateApp = () => {
    if (!waitingWorker) return;
    isReloading.current = true;
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

  if (!waitingWorker || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-zinc-900 px-4 py-3 text-zinc-100 shadow-2xl shadow-black/40">
      <p className="text-sm font-semibold">Nova versão disponível.</p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={updateApp}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-amber-400"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Fechar aviso de atualização"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};