import React, { useMemo, useState } from 'react';
import { BellRing, CheckCircle2, Clock3, ExternalLink, MessageSquare, RefreshCw } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { createWhatsAppReminderLink } from '../../utils/whatsapp';

export const AppointmentRemindersManager: React.FC = () => {
  const { appointmentReminders, processPendingReminders, settings } = useSalon();
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState<number | null>(null);

  const pendingReminders = useMemo(
    () => appointmentReminders.filter(reminder => reminder.status === 'pendente'),
    [appointmentReminders]
  );
  const sentReminders = useMemo(
    () => appointmentReminders.filter(reminder => reminder.status === 'enviado'),
    [appointmentReminders]
  );

  const handleProcess = async () => {
    setProcessing(true);
    const count = await processPendingReminders();
    setProcessedCount(count);
    setProcessing(false);
  };

  const formatDate = (value: string) => new Date(value).toLocaleString([], {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-400" /> Central de Lembretes
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Gatilhos automáticos para 24 horas e 2 horas antes do atendimento.</p>
        </div>
        <button
          onClick={handleProcess}
          disabled={processing}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
          {processing ? 'Processando...' : 'Processar agora'}
        </button>
      </div>

      {processedCount !== null && (
        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-300">
          {processedCount === 0 ? 'Nenhum lembrete entrou na janela de envio.' : `${processedCount} lembrete(s) enviado(s) por notificação local.`}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Clock3 className="w-4 h-4 text-amber-400" /> Pendentes</h3>
            <span className="text-xs text-zinc-500">{pendingReminders.length}</span>
          </div>
          <div className="space-y-3">
            {pendingReminders.length === 0 && <p className="text-xs text-zinc-500 bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-center">Nenhum lembrete pendente.</p>}
            {pendingReminders.map(reminder => (
              <div key={reminder.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{reminder.cliente_nome}</p>
                    <p className="text-xs text-zinc-400 mt-1">{reminder.servico_nome} • {reminder.tipo} antes</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-1">Pendente</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-3">Enviar em: {formatDate(reminder.data_hora_lembrete)} • Atendimento: {formatDate(reminder.data_hora_agendamento)}</p>
                <a
                  href={createWhatsAppReminderLink({
                    phone: reminder.cliente_phone,
                    clienteNome: reminder.cliente_nome,
                    servicoNome: reminder.servico_nome,
                    dataHoraStr: formatDate(reminder.data_hora_agendamento),
                    nomeSalao: settings.nome_salao
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/20 text-emerald-300 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Abrir WhatsApp
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Histórico enviado</h3>
            <span className="text-xs text-zinc-500">{sentReminders.length}</span>
          </div>
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {sentReminders.length === 0 && <p className="text-xs text-zinc-500 bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-center">Nenhum lembrete enviado.</p>}
            {sentReminders.map(reminder => (
              <div key={reminder.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-bold text-white">{reminder.cliente_nome}</p>
                  <span className="text-[10px] text-emerald-400 font-bold">{reminder.tipo}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{reminder.servico_nome} • atendimento em {formatDate(reminder.data_hora_agendamento)}</p>
                <p className="text-[10px] text-zinc-600 mt-2">Processado em {reminder.enviado_em ? formatDate(reminder.enviado_em) : '-'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
