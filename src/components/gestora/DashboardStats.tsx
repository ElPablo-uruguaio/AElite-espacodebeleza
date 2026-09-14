import React from 'react';
import { Calendar, DollarSign, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const DashboardStats: React.FC = () => {
  const { appointments, services } = useSalon();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayApps = appointments.filter(a => a.data_hora.slice(0, 10) === todayStr);

  const todayCompleted = todayApps.filter(a => a.status === 'concluido');
  const todayRevenue = todayCompleted.reduce((acc, a) => acc + a.valor_total, 0);

  const upcomingApp = todayApps.find(a => a.status === 'confirmado' || a.status === 'aguardando_confirmacao');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      
      {/* Card 1: Agendamentos de Hoje */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-rose-500/40 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Agendamentos Hoje</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{todayApps.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 mt-3 flex items-center gap-1 font-medium">
          <span className="text-emerald-400 font-bold">{todayCompleted.length} concluídos</span> • {todayApps.length - todayCompleted.length} pendentes
        </p>
      </div>

      {/* Card 2: Faturamento do Dia */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-amber-500/40 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Faturamento Hoje</p>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1">
              R$ {todayRevenue.toFixed(2).replace('.', ',')}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 mt-3 flex items-center gap-1 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Comissões inclusas no cálculo</span>
        </p>
      </div>

      {/* Card 3: Próximo Atendimento */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-purple-500/40 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Próximo Atendimento</p>
            <h3 className="text-base font-extrabold text-white mt-1 truncate max-w-[150px]">
              {upcomingApp ? upcomingApp.cliente_nome : 'Nenhum próximo'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 mt-3 font-medium">
          {upcomingApp ? `Horário: ${new Date(upcomingApp.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Agenda livre'}
        </p>
      </div>

      {/* Card 4: Total Atendimentos Confirmados */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-emerald-500/40 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirmados Hoje</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
              {todayApps.filter(a => a.status === 'confirmado' || a.status === 'concluido' || a.status === 'em_atendimento').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 mt-3 font-medium">
          Clientes agendados para hoje
        </p>
      </div>

    </div>
  );
};
