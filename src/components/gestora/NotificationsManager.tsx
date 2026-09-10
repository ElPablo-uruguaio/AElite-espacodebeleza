import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Smartphone, Sparkles } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const NotificationsManager: React.FC = () => {
  const { notifications, sendPushNotification } = useSalon();

  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) return;

    setSending(true);
    await sendPushNotification(titulo, mensagem);
    setSending(false);
    setSentSuccess(true);
    setTitulo('');
    setMensagem('');
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-zinc-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-rose-400" />
          Disparo de Notificações Push Promocionais
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Envie avisos de promoções diretamente para a tela inicial dos celulares que instalaram o PWA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Form */}
        <form onSubmit={handleBroadcast} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400" /> Nova Notificação Celular
          </h4>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Título da Notificação *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: ⚡ 20% OFF no Combo de Unhas Gel hoje!"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Mensagem / Oferta *</label>
            <textarea
              rows={3}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Ex: Agende até as 18h de hoje e ganhe nutrição capilar profunda gratuita..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              required
            />
          </div>

          {sentSuccess && (
            <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Notificação disparada aos celulares cadastrados!
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rose-gradient-btn text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Enviando...' : 'Disparar para Todos os Celulares'}</span>
          </button>
        </form>

        {/* History */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <h4 className="text-sm font-bold text-white mb-2">Histórico de Disparos</h4>
          {notifications.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">Nenhum disparo promocional recente.</p>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">{notif.titulo}</h5>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {notif.target_count} celulares
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 font-light">{notif.mensagem}</p>
                <p className="text-[10px] text-zinc-500">
                  Enviado em: {new Date(notif.enviado_em).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
