import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { PublicHome } from './pages/PublicHome';
import { GestoraDashboard } from './pages/GestoraDashboard';
import { DevMasterDashboard } from './pages/DevMasterDashboard';
import { PromotionalLanding } from './pages/PromotionalLanding';

export const App: React.FC = () => {
  const { role, isLoggedIn } = useAuth();
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check if hash matches a promotional landing page (e.g. #promocao-dia-das-maes)
  const isPromoHash = currentHash.startsWith('#promocao-') || currentHash.startsWith('#lp-');

  if (isLoggedIn) {
    if (role === 'dev_admin') {
      return <DevMasterDashboard />;
    }
    if (role === 'admin') {
      return <GestoraDashboard />;
    }
  }

  if (isPromoHash) {
    const slug = currentHash.replace('#', '').split('?')[0];
    return <PromotionalLanding slug={slug} />;
  }

  return <PublicHome />;
};

export default App;
