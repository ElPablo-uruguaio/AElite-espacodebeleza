import React, { useEffect, useState } from 'react';
import { Check, LockKeyhole, Pencil, Save, ShieldCheck, Users, X } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { supabase } from '../../services/supabase';
import { TeamPermissions } from '../../types';
import {
  DEFAULT_TEAM_PERMISSIONS,
  getTeamPermissions,
  saveTeamPermissions,
  TEAM_PERMISSION_LABELS,
} from '../../utils/permissions';

type EmployeeDraft = {
  nome: string;
  serviceIds: string[];
};

export const TeamPermissionsManager: React.FC = () => {
  const {
    employees,
    services,
    updateEmployee,
    employeeServiceIds,
    updateEmployeeServices,
  } = useSalon();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [permissions, setPermissions] = useState<TeamPermissions>({ ...DEFAULT_TEAM_PERMISSIONS });
  const [drafts, setDrafts] = useState<Record<string, EmployeeDraft>>({});
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [savingEmployeeId, setSavingEmployeeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ employeeId: string; type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setDrafts(currentDrafts => {
      const nextDrafts = { ...currentDrafts };
      employees.forEach(employee => {
        if (!nextDrafts[employee.id]) {
          nextDrafts[employee.id] = {
            nome: employee.nome,
            serviceIds: employeeServiceIds[employee.id] || [],
          };
        }
      });
      return nextDrafts;
    });
  }, [employees, employeeServiceIds]);

  useEffect(() => {
    if (selectedEmployeeId) {
      setPermissions(getTeamPermissions(`colab-${selectedEmployeeId}`));
    }
  }, [selectedEmployeeId]);

  const updateDraft = (employeeId: string, changes: Partial<EmployeeDraft>) => {
    setDrafts(currentDrafts => ({
      ...currentDrafts,
      [employeeId]: { ...currentDrafts[employeeId], ...changes },
    }));
  };

  const toggleService = (employeeId: string, serviceId: string) => {
    const draft = drafts[employeeId];
    if (!draft) return;

    const serviceIds = draft.serviceIds.includes(serviceId)
      ? draft.serviceIds.filter(id => id !== serviceId)
      : [...draft.serviceIds, serviceId];

    updateDraft(employeeId, { serviceIds });
  };

  const saveEmployeeChanges = async (employeeId: string) => {
    const draft = drafts[employeeId];
    if (!draft || !draft.nome.trim()) {
      setFeedback({ employeeId, type: 'error', text: 'O nome do profissional é obrigatório.' });
      return;
    }

    setSavingEmployeeId(employeeId);
    setFeedback(null);

    try {
      if (supabase) {
        const { error: employeeError } = await supabase
          .from('employees')
          .update({ nome: draft.nome.trim() })
          .eq('id', employeeId);

        if (employeeError) throw employeeError;

        const { error: deleteError } = await supabase
          .from('profissional_servico')
          .delete()
          .eq('profissional_id', employeeId);

        if (deleteError) throw deleteError;

        if (draft.serviceIds.length > 0) {
          const { error: insertError } = await supabase
            .from('profissional_servico')
            .insert(draft.serviceIds.map(servicoId => ({
              profissional_id: employeeId,
              servico_id: servicoId,
            })));

          if (insertError) throw insertError;
        }
      }

      updateEmployee(employeeId, { nome: draft.nome.trim() });
      updateEmployeeServices(employeeId, draft.serviceIds);
      setEditingEmployeeId(null);
      setFeedback({ employeeId, type: 'success', text: 'Alterações guardadas com sucesso.' });
    } catch (error) {
      console.error('Erro ao guardar profissional:', error);
      setFeedback({ employeeId, type: 'error', text: 'Não foi possível guardar no banco de dados.' });
    } finally {
      setSavingEmployeeId(null);
    }
  };

  const handlePermissionChange = (key: keyof TeamPermissions) => {
    const updatedPermissions = { ...permissions, [key]: !permissions[key] };
    setPermissions(updatedPermissions);
    saveTeamPermissions(`colab-${selectedEmployeeId}`, updatedPermissions);
  };

  const handleReset = () => {
    const resetPermissions = { ...DEFAULT_TEAM_PERMISSIONS };
    setPermissions(resetPermissions);
    saveTeamPermissions(`colab-${selectedEmployeeId}`, resetPermissions);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gestão da Equipe</h2>
              <p className="text-xs text-zinc-400">Edite profissionais e defina os serviços que cada um realiza.</p>
            </div>
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-400">Cadastre um profissional para começar.</div>
        ) : (
          <div className="space-y-4">
            {employees.map(employee => {
              const draft = drafts[employee.id] || { nome: employee.nome, serviceIds: [] };
              const isEditing = editingEmployeeId === employee.id;
              const isSaving = savingEmployeeId === employee.id;
              const employeeFeedback = feedback?.employeeId === employee.id ? feedback : null;

              return (
                <article key={employee.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={employee.foto_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'}
                        alt={employee.nome}
                        className="h-12 w-12 shrink-0 rounded-full border border-zinc-700 object-cover"
                      />
                      <div className="min-w-0">
                        {isEditing ? (
                          <input
                            value={draft.nome}
                            onChange={event => updateDraft(employee.id, { nome: event.target.value })}
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-white focus:border-rose-500 focus:outline-none"
                            aria-label={`Nome de ${employee.nome}`}
                          />
                        ) : (
                          <h3 className="truncate text-sm font-bold text-white">{employee.nome}</h3>
                        )}
                        <p className="text-xs text-zinc-500">{employee.especialidade}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 lg:shrink-0">
                      {isEditing ? (
                        <>
                          <button type="button" onClick={() => saveEmployeeChanges(employee.id)} disabled={isSaving} className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/30 disabled:opacity-50">
                            <Save className="h-3.5 w-3.5" /> {isSaving ? 'A guardar...' : 'Guardar'}
                          </button>
                          <button type="button" onClick={() => setEditingEmployeeId(null)} disabled={isSaving} aria-label="Cancelar edição" className="rounded-xl bg-zinc-800 p-2 text-zinc-400 transition hover:text-white disabled:opacity-50">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => { setEditingEmployeeId(employee.id); setFeedback(null); }} className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-rose-500 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 border-t border-zinc-800 pt-4">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Serviços realizados</h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {services.filter(service => service.ativo).map(service => (
                          <label key={service.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-700">
                            <input type="checkbox" checked={draft.serviceIds.includes(service.id)} onChange={() => toggleService(employee.id, service.id)} className="h-4 w-4 accent-rose-500" />
                            <span>{service.nome}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {employeeFeedback && (
                    <p className={`mt-3 text-xs ${employeeFeedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {employeeFeedback.text}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gestão de Permissões</h2>
              <p className="text-xs text-zinc-400">Defina quais telas e ações cada colaborador pode acessar.</p>
            </div>
          </div>
          <button type="button" onClick={handleReset} className="text-xs font-semibold text-zinc-400 transition hover:text-white">Restaurar padrão</button>
        </div>

        {employees.length > 0 && (
          <>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">Colaborador</label>
            <div className="relative mb-6">
              <Users className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <select value={selectedEmployeeId} onChange={event => setSelectedEmployeeId(event.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none">
                {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.nome}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {TEAM_PERMISSION_LABELS.map(permission => (
                <label key={permission.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 hover:border-zinc-700">
                  <span><span className="block text-xs text-zinc-500">{permission.group}</span><span className="text-sm font-semibold text-zinc-200">{permission.label}</span></span>
                  <input type="checkbox" checked={permissions[permission.key]} onChange={() => handlePermissionChange(permission.key)} className="sr-only" />
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${permissions[permission.key] ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400' : 'border-zinc-700 bg-zinc-900 text-zinc-600'}`}>
                    {permissions[permission.key] ? <Check className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
