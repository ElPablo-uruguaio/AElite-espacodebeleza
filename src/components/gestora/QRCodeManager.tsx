import React from 'react';
import { QrCode, Printer, Sparkles, Smartphone, Scissors } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const QRCodeManager: React.FC = () => {
  const { settings } = useSalon();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://espacobelezavip.com.br';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            QR Code da Recepção para Balcão
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Imprima este cartaz para que os clientes apontem a câmera do celular e instalem o PWA.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Cartaz do Balcão</span>
        </button>
      </div>

      {/* Printable Poster Card */}
      <div className="max-w-md mx-auto bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-500/40 p-8 rounded-3xl text-center space-y-6 shadow-2xl relative">
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <Scissors className="w-8 h-8 text-white transform -rotate-45" />
        </div>

        <div>
          <h4 className="text-2xl font-extrabold text-white tracking-tight">{settings.nome_salao}</h4>
          <p className="text-xs text-amber-400 font-semibold mt-1 uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Baixe Nosso App Exclusivo
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-2xl w-56 h-56 mx-auto flex items-center justify-center border-4 border-rose-500 shadow-2xl">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentOrigin)}`}
            alt="QR Code Recepção Salão"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-2 text-xs text-zinc-300 font-medium">
          <p className="flex items-center justify-center gap-1">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Abra a câmera do seu celular para agendar</span>
          </p>
          <p className="text-[11px] text-zinc-500">
            Ganhe promoções instantâneas e agende horários sem fila.
          </p>
        </div>

        <div className="pt-2 text-[10px] text-amber-500 font-mono">
          {currentOrigin}
        </div>

      </div>

    </div>
  );
};
