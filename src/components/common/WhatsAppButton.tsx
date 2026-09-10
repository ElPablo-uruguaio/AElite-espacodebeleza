import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useSalon();
  const cleanPhone = settings.whatsapp.replace(/\D/g, '');
  const message = encodeURIComponent(`Olá, ${settings.nome_salao}! Gostaria de tirar dúvidas sobre os agendamentos.`);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group animate-float"
    >
      <MessageCircle className="w-7 h-7 fill-white stroke-none group-hover:rotate-12 transition-transform" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-sm font-semibold pl-0 group-hover:pl-2">
        Agendar via WhatsApp
      </span>
    </a>
  );
};
