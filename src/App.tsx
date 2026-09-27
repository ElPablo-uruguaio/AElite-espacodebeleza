import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { PublicHome } from './pages/PublicHome';
import { GestoraDashboard } from './pages/GestoraDashboard';
import { DevMasterDashboard } from './pages/DevMasterDashboard';
import { PromotionalLanding } from './pages/PromotionalLanding';
import { CollaboratorDashboard } from './pages/CollaboratorDashboard';

export const App: React.FC = () => {
  const { role, isLoggedIn } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const promptedWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let isMounted = true;

    const checkForUpdate = async () => {
      const registration = await navigator.serviceWorker.ready;

      if (!isMounted) return;

      const promptForUpdate = (worker: ServiceWorker) => {
        if (
          !navigator.serviceWorker.controller ||
          promptedWorkerRef.current === worker
        ) {
          return;
        }

        promptedWorkerRef.current = worker;
        if (window.confirm('Uma nova versão do sistema está disponível. Deseja recarregar agora para atualizar?')) {
          window.location.reload();
        }
      };

      const handleUpdateFound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            promptForUpdate(installingWorker);
          }
        });
      };

      registration.addEventListener('updatefound', handleUpdateFound);
      await registration.update();

      if (registration.waiting) {
        promptForUpdate(registration.waiting);
      }

      return () => registration.removeEventListener('updatefound', handleUpdateFound);
    };

    let removeUpdateListener: (() => void) | undefined;
    checkForUpdate().then((cleanup) => {
      removeUpdateListener = cleanup;
    });

    return () => {
      isMounted = false;
      removeUpdateListener?.();
    };
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Check if hash matches a promotional landing page (e.g. #promocao-dia-das-maes or #lp-...)
  const isPromoHash = currentHash.startsWith('#promocao-') || currentHash.startsWith('#lp-');
  if (isPromoHash) {
    const slug = currentHash.replace('#', '').split('?')[0];
    return <PromotionalLanding slug={slug} />;
  }

  // Admin / Gestora routes (/admin, /gestora, #/admin, #/gestora, #admin, #gestora)
  const isAdminRoute =
    currentPath === '/admin' ||
    currentPath === '/gestora' ||
    currentHash === '#/admin' ||
    currentHash === '#/gestora' ||
    currentHash === '#admin' ||
    currentHash === '#gestora';

  // Dev Master route (/dev, #/dev, #dev)
  const isDevRoute =
    currentPath === '/dev' ||
    currentHash === '#/dev' ||
    currentHash === '#dev';

  // If on admin or dev routes, render appropriate dashboard
  if (isAdminRoute) {
    if (isLoggedIn && role === 'dev_admin') {
      return <DevMasterDashboard />;
    }
    if (isLoggedIn && role === 'colaborador') {
      return <CollaboratorDashboard />;
    }
    return <GestoraDashboard />;
  }

  if (isDevRoute) {
    return <DevMasterDashboard />;
  }

  // If user is logged in, allow them to view dashboard if they requested or automatically
  if (isLoggedIn) {
    if (role === 'dev_admin') {
      return <DevMasterDashboard />;
    }
    if (role === 'admin' && (currentPath === '/admin' || currentPath === '/gestora' || currentHash === '#admin' || currentHash === '#gestora')) {
      return <GestoraDashboard />;
    }
    if (role === 'colaborador') {
      return <CollaboratorDashboard />;
    }
  }

  // Default route: Public Landing Page for clients
  return <PublicHome />;
};

export default App;
