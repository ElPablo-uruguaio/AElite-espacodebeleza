import React from 'react';
import { Scissors, MapPin, Phone, Instagram, Clock, Heart } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const Footer: React.FC = () => {
  const { settings } = useSalon();
  const cleanInstagram = settings.instagram.replace('@', '');

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white">{settings.nome_salao}</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Seu refúgio de beleza e auto-cuidado. Atendimento personalizado com os melhores profissionais e produtos de alta performance.
          </p>
        </div>

        {/* Localização & Contato */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contato & Localização</h4>
          <div className="space-y-2 text-xs">
            <p className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings.endereco}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp: {settings.whatsapp}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Instagram className="w-4 h-4 text-rose-400 shrink-0" />
              <a href={`https://instagram.com/${cleanInstagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                {settings.instagram}
              </a>
            </p>
          </div>
        </div>

        {/* Horário de Funcionamento */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Horários</h4>
          <div className="space-y-1.5 text-xs">
            <p className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Terça a Sábado: 09:00h às 19:00h</span>
            </p>
            <p className="text-zinc-500 pl-6">Domingo e Segunda: Fechado</p>
          </div>
        </div>

        {/* Agendamentos e Sinal PIX */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sinal & Agendamento</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Para garantir seu horário exclusivo, os agendamentos online solicitam um sinal simbólico de R$ 20,00 via PIX, totalmente abatido no valor final.
          </p>
          <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[11px] text-amber-400 font-mono">
            Chave PIX: {settings.chave_pix}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} {settings.nome_salao}. Todos os direitos reservados.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Desenvolvido com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> por Antigravity AI
        </p>
      </div>
    </footer>
  );
};
