import React from 'react';
import { Calendar, CheckCircle2, Clock, DollarSign, Home, LogOut, Scissors, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSalon } from '../context/SalonContext';

export const CollaboratorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { appointments, employees, services, updateAppointmentStatus } = useSalon();
  const employeeId = user?.employee_id;
  const permissions = user?.team_permissions;
  const employee = employees.find(item => item.id === employeeId);
  const ownAppointments = appointments
    .filter(appointment => appointment.profissional_id === employeeId)
    .sort((first, second) => first.data_hora.localeCompare(second.data_hora));
  const completedAppointments = ownAppointments.filter(appointment => appointment.status === 'concluido');
  const commissionTotal = completedAppointments.reduce((total, appointment) => {
    return total + (appointment.valor_total * (employee?.comissao_percentual || 0)) / 100;
  }, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <header className="max-w-5xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg">
            <Scissors className="w-6 h-6 transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Área do Colaborador</h1>
            <p className="text-xs text-amber-400">{employee?.nome || user?.full_name || 'Equipe'} • acesso individual</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition">
            <Home className="w-4 h-4 text-rose-400" /> Site público
          </a>
          <button onClick={logout} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition">
            <LogOut className="w-4 h-4 text-rose-400" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Seu acesso é limitado às informações e ações liberadas pela gestora.
        </div>

        {permissions?.canViewAgenda && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-rose-400" /> Minha agenda</h2>
                <p className="text-xs text-zinc-400 mt-1">Apenas atendimentos atribuídos a você.</p>
              </div>
              <span className="text-xs font-bold text-zinc-400">{ownAppointments.length} registros</span>
            </div>
            <div className="space-y-3">
              {ownAppointments.length === 0 && <p className="text-sm text-zinc-500 py-6 text-center">Nenhum atendimento atribuído.</p>}
              {ownAppointments.map(appointment => {
                const service = services.find(item => item.id === appointment.servico_id);
                return (
                  <div key={appointment.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{appointment.cliente_nome}</p>
                      <p className="text-xs text-zinc-400 mt-1">{new Date(appointment.data_hora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} • {service?.nome || 'Serviço'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {appointment.status}</span>
                      {permissions.canEditAgenda && appointment.status === 'aguardando_confirmacao' && (
                        <button onClick={() => updateAppointmentStatus(appointment.id, 'confirmado')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {permissions?.canViewComissoes && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Minhas comissões</p>
                <h2 className="text-3xl font-extrabold text-amber-400">R$ {commissionTotal.toFixed(2).replace('.', ',')}</h2>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">Calculadas sobre seus atendimentos concluídos, conforme o percentual cadastrado.</p>
          </section>
        )}

        {!permissions?.canViewAgenda && !permissions?.canViewComissoes && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <ShieldCheck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white">Acesso aguardando configuração</h2>
            <p className="text-sm text-zinc-400 mt-2">Solicite à gestora a liberação de uma tela para visualizar seu trabalho.</p>
          </section>
        )}
      </main>
    </div>
  );
};
