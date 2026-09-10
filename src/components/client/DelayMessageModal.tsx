import React, { useState } from 'react';
import { X, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { MessageType } from '../../types';

interface DelayMessageModalProps {
  onClose: () => void;
}

export const DelayMessageModal: React.FC<DelayMessageModalProps> = ({ onClose }) => {
  const { addClientMessage } = useSalon();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tipo, setTipo] = useState<MessageType>('atraso');
  const [mensagem, setMensagem] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mensagem.trim()) return;

    addClientMessage({
      cliente_nome: name,
      cliente_phone: phone,
      tipo,
      mensagem
    });

    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Enviar Recado à Gestora</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Avise sobre atrasos ou envie recados diretos para a recepção do salão.
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-5 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-bold text-sm">Recado enviado com sucesso!</p>
            <p className="text-xs text-emerald-200/80">
              A recepção e a gestora já foram notificadas.
            </p>
            <button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Seu Nome *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Camila Rocha"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Seu WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Tipo de Mensagem</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as MessageType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="atraso">⏱️ Aviso de Atraso</option>
                <option value="recado">💬 Recado Geral</option>
                <option value="sugestao">💡 Sugestão / Dúvida</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Mensagem *</label>
              <textarea
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva seu recado ou quantos minutos irá se atrasar..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rose-gradient-btn text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Recado Agora</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
