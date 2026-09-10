import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, Play, DollarSign, Phone, MessageSquare, FileText, Award, Star, Plus } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { AppointmentStatus, Appointment } from '../../types';
import {
  createWhatsAppReminderLink,
  createWhatsAppConfirmationLink,
  createWhatsAppGoogleReviewLink
} from '../../utils/whatsapp';
import { FichaTecnicaModal } from './FichaTecnicaModal';

interface AgendaCalendarProps {
  onOpenPDV: (appointment: Appointment) => void;
}

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ onOpenPDV }) => {
  const { appointments, updateAppointmentStatus, updateAppointmentTime, services, employees, settings, getCartaoFidelidadeByPhone } = useSalon();
  
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedAnamnese, setSelectedAnamnese] = useState<{ name: string; phone: string } | null>(null);
  
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const filteredApps = appointments.filter(a => {
    const matchesDate = a.data_hora.slice(0, 10) === filterDate;
    const matchesStatus = filterStatus === 'todos' || a.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  const handleDragStart = (e: React.DragEvent, appointmentId: string) => {
    e.dataTransfer.setData('appointmentId', appointmentId);
  };

  const handleDrop = (e: React.DragEvent, targetTime: string) => {
    e.preventDefault();
    const appointmentId = e.dataTransfer.getData('appointmentId');
    if (appointmentId) {
      const newDateStr = `${filterDate}T${targetTime}:00`;
      updateAppointmentTime(appointmentId, new Date(newDateStr).toISOString());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'aguardando_confirmacao':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">Aguardando</span>;
      case 'confirmado':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">Confirmado</span>;
      case 'em_atendimento':
        return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Em Atendimento</span>;
      case 'concluido':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">Concluído</span>;
      case 'cancelado':
        return <span className="bg-zinc-800 text-zinc-500 border border-zinc-700 px-3 py-1 rounded-full text-xs font-bold">Cancelado</span>;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-400" />
            Agenda Timeline (Drag & Drop)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Arraste os cards para alterar o horário. Clique em "+ Novo" para agendar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 transition text-sm">
             <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="aguardando_confirmacao">Aguardando</option>
            <option value="confirmado">Confirmados</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="concluido">Concluídos</option>
          </select>
        </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-3">
        {timeSlots.map(time => {
          const appsForTime = filteredApps.filter(a => {
            const dateObj = new Date(a.data_hora);
            const appTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return appTime === time;
          });

          return (
            <div 
              key={time} 
              className="flex items-start gap-4 p-2 rounded-xl border border-dashed border-transparent hover:border-zinc-700 transition"
              onDrop={(e) => handleDrop(e, time)}
              onDragOver={handleDragOver}
            >
              {/* Time Label */}
              <div className="w-16 shrink-0 text-right pt-2 font-mono text-zinc-500 font-bold text-sm">
                {time}
              </div>

              {/* Drop Zone / Appointments */}
              <div className="flex-1 min-h-[60px] bg-zinc-950/50 border border-zinc-800 rounded-2xl p-2 space-y-2">
                {appsForTime.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs font-semibold uppercase tracking-wider py-4">
                    Horário Livre
                  </div>
                ) : (
                  appsForTime.map(app => {
                    const servico = services.find(s => s.id === app.servico_id);
                    const profissional = employees.find(e => e.id === app.profissional_id);
                    const cartao = getCartaoFidelidadeByPhone(app.cliente_phone);

                    return (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 shadow-lg cursor-move hover:border-rose-500 transition"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{app.cliente_nome}</h4>
                            {cartao && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-400" /> {cartao.pontos_acumulados}/10
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-300 font-medium">
                            <span className="text-zinc-500">Serviço:</span> {servico?.nome} • <span className="text-zinc-500">Profissional:</span> {profissional?.nome}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(app.status)}
                            <button
                              onClick={() => setSelectedAnamnese({ name: app.cliente_nome, phone: app.cliente_phone })}
                              className="bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 transition"
                            >
                              <FileText className="w-3 h-3" /> Ficha Técnica
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex space-x-1">
                            <a href={createWhatsAppReminderLink({ phone: app.cliente_phone, clienteNome: app.cliente_nome, servicoNome: servico?.nome, profissionalNome: profissional?.nome, dataHoraStr: `${filterDate} às ${time}`, nomeSalao: settings.nome_salao })} target="_blank" rel="noreferrer" className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg hover:bg-emerald-500/20"><MessageSquare className="w-3.5 h-3.5" /></a>
                            <a href={createWhatsAppConfirmationLink({ phone: app.cliente_phone, clienteNome: app.cliente_nome, servicoNome: servico?.nome, profissionalNome: profissional?.nome, dataHoraStr: `${filterDate} às ${time}`, nomeSalao: settings.nome_salao })} target="_blank" rel="noreferrer" className="text-blue-400 bg-blue-500/10 p-1.5 rounded-lg hover:bg-blue-500/20"><CheckCircle2 className="w-3.5 h-3.5" /></a>
                            <a href={createWhatsAppGoogleReviewLink({ phone: app.cliente_phone, clienteNome: app.cliente_nome, nomeSalao: settings.nome_salao, googleReviewLink: settings.google_review_link || '' })} target="_blank" rel="noreferrer" className="text-amber-400 bg-amber-500/10 p-1.5 rounded-lg hover:bg-amber-500/20"><Star className="w-3.5 h-3.5" /></a>
                          </div>
                          
                          <div className="flex gap-1">
                             {(app.status === 'em_atendimento' || app.status === 'confirmado') && (
                               <button onClick={() => onOpenPDV(app)} className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 shadow">
                                 <DollarSign className="w-3 h-3" /> PDV
                               </button>
                             )}
                             {app.status === 'aguardando_confirmacao' && (
                                <button onClick={() => updateAppointmentStatus(app.id, 'confirmado')} className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg">Confirmar</button>
                             )}
                             {app.status === 'confirmado' && (
                                <button onClick={() => updateAppointmentStatus(app.id, 'em_atendimento')} className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg">Iniciar</button>
                             )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedAnamnese && (
        <FichaTecnicaModal
          clienteNome={selectedAnamnese.name}
          clientePhone={selectedAnamnese.phone}
          onClose={() => setSelectedAnamnese(null)}
        />
      )}
    </div>
  );
};
