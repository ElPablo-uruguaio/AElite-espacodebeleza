import React, { useState, useEffect } from 'react';
import { Terminal, Download, Database, ShieldAlert, CheckCircle2, RefreshCw, FileCode, Layers, Lock } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { downloadJSONBackup, downloadCSVBackup } from '../../services/backup';
import { isSupabaseConfigured, supabase } from '../../services/supabase';

export const DevMasterView: React.FC = () => {
  const {
    services,
    employees,
    appointments,
    payroll,
    stories,
    notifications,
    messages,
    reviews,
    landingPages,
    settings,
    fichasTecnicas,
    estoque,
    servicoProdutos,
    cartoesFidelidade
  } = useSalon();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadLogs = () => {
    const l = JSON.parse(localStorage.getItem('dev_system_logs') || '[]');
    setLogs(l);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExportFullJSON = () => {
    const fullBackup = {
      backup_timestamp: new Date().toISOString(),
      database_version: '1.1.0',
      settings,
      services,
      employees,
      appointments,
      payroll,
      stories,
      notifications,
      messages,
      reviews,
      landingPages,
      fichasTecnicas,
      estoque,
      servicoProdutos,
      cartoesFidelidade
    };
    downloadJSONBackup(fullBackup, `salao_beleza_full_backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    if (!supabase) {
      setPasswordMessage({ text: 'O serviço de autenticação não está configurado.', type: 'error' });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordMessage({ text: error.message || 'Não foi possível alterar a senha.', type: 'error' });
      return;
    }

    setPasswordMessage({ text: 'Senha alterada com sucesso.', type: 'success' });
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-extrabold text-white">Dev Master Control Panel</h2>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              Master Access
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Monitoramento do sistema, inspeção de tabelas e backup local seguro em JSON/CSV.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportFullJSON}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center space-x-2 shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Backup Completo (JSON)</span>
          </button>
        </div>
      </div>

      {/* Security */}
      <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            Segurança
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Altere a senha da conta atual.</p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {passwordMessage && (
            <p className={`text-xs font-bold p-3 rounded-xl border ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow"
          >
            Salvar Senha
          </button>
        </form>
      </section>

      {/* Supabase Connection Status Card */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-400" />
          Status de Integração com Supabase PostgreSQL
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Status da Conexão</p>
            <p className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
              {isSupabaseConfigured ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Conectado ao Supabase
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" /> Modo Simulação Activo
                </>
              )}
            </p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Total de Tabelas</p>
            <p className="text-sm font-bold text-white mt-1">16 Tabelas RLS</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Agendamentos Registrados</p>
            <p className="text-sm font-bold text-amber-400 mt-1">{appointments.length} Registros</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Contratos RLS</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">100% Protegidos</p>
          </div>
        </div>
      </div>

      {/* CSV Table Exporter Panel */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          Exportação de Tabelas em CSV (Backup Local por Tabela)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <button
            onClick={() => downloadCSVBackup(appointments, 'appointments')}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-2xl text-left transition text-xs font-semibold text-zinc-200 flex items-center justify-between"
          >
            <span>Appointments ({appointments.length})</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => downloadCSVBackup(services, 'services')}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-2xl text-left transition text-xs font-semibold text-zinc-200 flex items-center justify-between"
          >
            <span>Services ({services.length})</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => downloadCSVBackup(employees, 'employees')}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-2xl text-left transition text-xs font-semibold text-zinc-200 flex items-center justify-between"
          >
            <span>Employees ({employees.length})</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => downloadCSVBackup(payroll, 'payroll')}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-2xl text-left transition text-xs font-semibold text-zinc-200 flex items-center justify-between"
          >
            <span>Payroll ({payroll.length})</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => downloadCSVBackup(fichasTecnicas, 'fichas_tecnicas')}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-2xl text-left transition text-xs font-semibold text-zinc-200 flex items-center justify-between"
          >
            <span>FichasTecnicas ({fichasTecnicas.length})</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => downloadCSVBackup(estoque, 'estoque')}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-2xl text-left transition text-xs font-semibold text-zinc-200 flex items-center justify-between"
          >
            <span>Estoque ({estoque.length})</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => downloadCSVBackup(cartoesFidelidade, 'cartao_fidelidade')}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-2xl text-left transition text-xs font-semibold text-zinc-200 flex items-center justify-between"
          >
            <span>Fidelidade ({cartoesFidelidade.length})</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => downloadCSVBackup(landingPages, 'landing_pages')}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-3 rounded-2xl text-left transition text-xs font-semibold text-zinc-200 flex items-center justify-between"
          >
            <span>Landing Pages ({landingPages.length})</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Supabase Automated Backup Instructions Card */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-amber-400" />
          Instruções para Rotina de Backups Automáticos no Supabase
        </h3>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs text-zinc-300 font-mono">
          <p className="text-amber-400 font-bold">1. Backup automático via CLI/Cron (pg_dump):</p>
          <p className="text-zinc-400">
            pg_dump -h db.[PROJECT_REF].supabase.co -U postgres -d postgres -F c -f salao_backup.dump
          </p>
          <p className="text-amber-400 font-bold mt-2">2. Supabase Point-in-Time Recovery (PITR):</p>
          <p className="text-zinc-400">
            Ative o recurso PITR no painel do Supabase em Project Settings &gt; Database &gt; Daily Backups.
          </p>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            System Runtime Logs
          </h3>
          <button
            onClick={loadLogs}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar Logs
          </button>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl max-h-60 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <p className="text-zinc-600">Nenhum evento registrado no log.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex items-start space-x-2 text-[11px]">
                <span className="text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`font-bold uppercase ${
                  log.level === 'success' ? 'text-emerald-400' :
                  log.level === 'warn' ? 'text-amber-400' :
                  log.level === 'error' ? 'text-rose-400' : 'text-purple-400'
                }`}>
                  [{log.module}]
                </span>
                <span className="text-zinc-300">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
