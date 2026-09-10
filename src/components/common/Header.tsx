import React, { useState } from 'react';
import { Scissors, Instagram, MapPin, ShieldCheck, User, LogOut, Key, Sparkles, MessageSquare } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenDelayModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onOpenDelayModal }) => {
  const { settings } = useSalon();
  const { user, role, isLoggedIn, loginAsGestora, loginAsDevAdmin, logout } = useAuth();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginType, setLoginType] = useState<'gestora' | 'dev'>('gestora');
  const [inputPassword, setInputPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (loginType === 'gestora') {
      loginAsGestora(inputPassword).then(success => {
        if (success) {
          setShowLoginModal(false);
          setInputPassword('');
        } else {
          setErrorMessage('Senha incorreta para a Gestora. Tente "admin123".');
        }
      });
    } else {
      const success = loginAsDevAdmin(inputPassword);
      if (success) {
        setShowLoginModal(false);
        setInputPassword('');
      } else {
        setErrorMessage('Chave Dev Master inválida. Tente "devmaster2026".');
      }
    }
  };

  const cleanInstagram = settings.instagram.replace('@', '');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.endereco)}`;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Scissors className="w-6 h-6 text-white transform -rotate-45" />
            </div>
            <div>
              <a href="#" className="font-extrabold text-xl tracking-tight font-sans text-white hover:text-rose-300 transition">
                {settings.nome_salao}
              </a>
              <p className="text-xs text-amber-400/90 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Beleza, Estética & Bem-Estar
              </p>
            </div>
          </div>

          {/* Nav Actions & Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-zinc-300">
            <a href="#servicos" className="hover:text-rose-400 transition">Serviços</a>
            <a href="#stories" className="hover:text-rose-400 transition">Stories</a>
            <a href="#avaliacoes" className="hover:text-rose-400 transition">Avaliações</a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition flex items-center space-x-1 text-zinc-300">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Como Chegar</span>
            </a>
            <a href={`https://instagram.com/${cleanInstagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition flex items-center space-x-1 text-zinc-300">
              <Instagram className="w-4 h-4 text-rose-400" />
              <span>Instagram</span>
            </a>
          </nav>

          {/* Quick Buttons & Auth */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenDelayModal}
              className="hidden sm:flex items-center space-x-1 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-xl border border-zinc-700 transition"
              title="Aviso de atraso ou recado rápido"
            >
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Enviar Recado</span>
            </button>

            <button
              onClick={onOpenBooking}
              className="rose-gradient-btn text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 flex items-center space-x-1.5"
            >
              <span>Agendar Agora</span>
            </button>

            {/* Role switch / Auth trigger */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 border-l border-zinc-800 pl-3">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 capitalize">
                  {role === 'dev_admin' ? 'Dev Master' : 'Gestora'}
                </span>
                <button
                  onClick={logout}
                  className="p-2 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-zinc-800 transition"
                  title="Sair do Painel"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
                title="Área da Gestora / Dev Admin"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Acesso Restrito</h3>
              <p className="text-xs text-zinc-400 mt-1">Selecione seu perfil de acesso ao painel</p>
            </div>

            {/* Toggle Tab */}
            <div className="flex bg-zinc-950 p-1 rounded-xl mb-5 border border-zinc-800">
              <button
                onClick={() => { setLoginType('gestora'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${loginType === 'gestora' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <User className="w-3.5 h-3.5 inline mr-1" />
                Painel Gestora
              </button>
              <button
                onClick={() => { setLoginType('dev'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${loginType === 'dev' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <Key className="w-3.5 h-3.5 inline mr-1" />
                Dev Master
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {loginType === 'gestora' ? 'Senha Operacional da Gestora' : 'Chave de Acesso Dev Master'}
                </label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder={loginType === 'gestora' ? 'Digite a senha (padrão: admin123)' : 'Digite a chave (devmaster2026)'}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className={`w-full font-bold text-sm py-3 rounded-xl transition shadow-lg ${loginType === 'gestora' ? 'rose-gradient-btn text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}
              >
                Acessar Painel {loginType === 'gestora' ? 'da Gestora' : 'Dev Master'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-zinc-800 text-center text-xs text-zinc-500">
              Dica de demonstração: Gestora: <code className="text-amber-400">admin123</code> | Dev: <code className="text-amber-400">devmaster2026</code>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
