import React, { useState, useEffect } from 'react';
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
