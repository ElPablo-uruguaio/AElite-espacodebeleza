import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const NetworkStatus: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-center space-x-2 fixed bottom-0 left-0 w-full z-[100] font-medium text-xs">
      <WifiOff className="w-4 h-4" />
      <span>
        Você está offline. Alterações serão salvas localmente e sincronizadas quando a rede voltar.
      </span>
    </div>
  );
};
