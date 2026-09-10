import React, { useState } from 'react';
import { MessageSquare, Star, CheckCircle2, XCircle, AlertCircle, Phone, Sparkles } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const ReviewsModeration: React.FC = () => {
  const { reviews, toggleReviewApproval, messages, markMessageRead } = useSalon();
  const [activeTab, setActiveTab] = useState<'reviews' | 'messages'>('messages');

  const unreadMessagesCount = messages.filter(m => !m.lida).length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-400" />
            Central de Recados & Moderador de Avaliações
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Aprove depoimentos para o site público e acompanhe avisos de atraso dos clientes.
          </p>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${activeTab === 'messages' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            <span>Recados & Atrasos</span>
            {unreadMessagesCount > 0 && (
              <span className="bg-amber-400 text-zinc-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'reviews' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Moderação de Depoimentos
          </button>
        </div>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-zinc-500 text-xs text-center py-8">Nenhum recado ou aviso recebido.</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !msg.lida ? 'bg-rose-950/20 border-rose-500/40' : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{msg.cliente_nome}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      msg.tipo === 'atraso' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {msg.tipo === 'atraso' ? '⏱️ Aviso de Atraso' : '💬 Recado Geral'}
                    </span>
                    {msg.cliente_phone && (
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" /> {msg.cliente_phone}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 font-light">{msg.mensagem}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Recebido em: {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>

                {!msg.lida && (
                  <button
                    onClick={() => markMessageRead(msg.id)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-700 shrink-0"
                  >
                    Marcar como Lida
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviews Moderation Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.map(rev => (
            <div key={rev.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">{rev.cliente_nome}</span>
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.nota_estrelas ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-300 italic mt-1 font-light">"{rev.comentario}"</p>
              </div>

              <button
                onClick={() => toggleReviewApproval(rev.id)}
                className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1 shrink-0 ${
                  rev.aprovado_para_site
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                }`}
              >
                {rev.aprovado_para_site ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{rev.aprovado_para_site ? 'Aprovado na Home' : 'Aprovar no Site'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
