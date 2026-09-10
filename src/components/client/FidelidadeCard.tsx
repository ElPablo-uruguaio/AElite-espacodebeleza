import React, { useState } from 'react';
import { Award, Search, Sparkles, Gift, CheckCircle2, Star } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { CartaoFidelidade } from '../../types';

export const FidelidadeCard: React.FC = () => {
  const { getCartaoFidelidadeByPhone, settings } = useSalon();
  
  const [inputPhone, setInputPhone] = useState('');
  const [card, setCard] = useState<CartaoFidelidade | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone.trim()) return;

    const found = getCartaoFidelidadeByPhone(inputPhone);
    if (found) {
      setCard(found);
    } else {
      setCard(null);
    }
    setSearched(true);
  };

  const targetVisits = 10;
  const currentPoints = card ? card.pontos_acumulados % targetVisits : 0;
  const progressPercent = Math.min(100, (currentPoints / targetVisits) * 100);

  return (
    <section className="py-12 bg-zinc-950/90 border-t border-zinc-900 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Clube VIP Fidelidade</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Seu Cartão Fidelidade Digital
          </h2>
          <p className="text-zinc-400 text-xs mt-1 font-light">
            A cada atendimento no {settings.nome_salao}, você acumula 1 ponto. Ao completar 10 visitas, ganhe um tratamento exclusivo!
          </p>
        </div>

        {/* Lookup Box */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8 flex items-center space-x-2">
          <input
            type="tel"
            value={inputPhone}
            onChange={(e) => setInputPhone(e.target.value)}
            placeholder="Digite seu WhatsApp (ex: 11988887777)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            required
          />
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shrink-0 flex items-center space-x-1 transition shadow-lg"
          >
            <Search className="w-4 h-4" />
            <span>Consultar</span>
          </button>
        </form>

        {/* Card Display */}
        {searched && (
          <div className="max-w-lg mx-auto bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-amber-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl relative space-y-6 animate-fade-in">
            
            {card ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{card.cliente_nome}</h3>
                    <p className="text-xs text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" /> Cliente VIP {settings.nome_salao}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black text-amber-400 font-mono">
                      {card.pontos_acumulados}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold block">pontos totais</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-300">Progresso para Recompensa VIP:</span>
                    <span className="text-amber-400">{currentPoints} de {targetVisits} visitas</span>
                  </div>

                  <div className="w-full bg-zinc-900 rounded-full h-4 p-0.5 border border-zinc-800 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stamps Visual Grid */}
                <div>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase mb-3">Sua Cartela de Selos:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(spot => {
                      const isStamped = spot <= currentPoints;

                      return (
                        <div
                          key={spot}
                          className={`aspect-square rounded-2xl flex items-center justify-center border transition ${
                            isStamped
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/20'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-700'
                          }`}
                        >
                          {isStamped ? <Star className="w-5 h-5 fill-amber-400" /> : <span className="text-xs font-bold">{spot}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reward Alert */}
                {card.recompensa_disponivel || currentPoints >= targetVisits ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center space-y-1 text-emerald-300">
                    <Gift className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="font-bold text-sm">Parabéns! Recompensa Liberada! 🎉</p>
                    <p className="text-xs text-emerald-200/80">
                      Apresente este cartão na recepção para resgatar sua <strong>Hidratação Profunda Grátis</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-center text-xs text-zinc-400">
                    Faltam apenas <strong className="text-white">{targetVisits - currentPoints} visita(s)</strong> para resgatar seu brinde exclusivo!
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 space-y-2">
                <Gift className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white">Cartão ainda não criado</p>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Agende seu primeiro atendimento no salão e seu Cartão Fidelidade será ativado automaticamente no fechamento do caixa!
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
};
