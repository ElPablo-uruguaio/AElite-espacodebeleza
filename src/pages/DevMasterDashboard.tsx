import React from 'react';
import { ShieldCheck, LogOut, Home, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DevMasterView } from '../components/dev/DevMasterView';

export const DevMasterDashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      
      <header className="max-w-7xl mx-auto bg-zinc-900 border border-amber-500/30 p-6 rounded-3xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Dev / Admin Master Panel</h1>
            <p className="text-xs text-amber-400 font-mono">Acesso Direto de Desenvolvedor (Master Override)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="#"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-4 py-2 rounded-xl border border-zinc-700 flex items-center gap-1"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Ver Site</span>
          </a>
          <button
            onClick={logout}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-4 py-2 rounded-xl border border-zinc-700 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sair Dev</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <DevMasterView />
      </div>

    </div>
  );
};
