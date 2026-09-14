import React, { useEffect, useState } from 'react';
import { Check, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { TeamPermissions } from '../../types';
import {
  DEFAULT_TEAM_PERMISSIONS,
  getTeamPermissions,
  saveTeamPermissions,
  TEAM_PERMISSION_LABELS,
} from '../../utils/permissions';

export const TeamPermissionsManager: React.FC = () => {
  const { employees } = useSalon();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [permissions, setPermissions] = useState<TeamPermissions>({ ...DEFAULT_TEAM_PERMISSIONS });
  const selectedEmployee = employees.find(employee => employee.id === selectedEmployeeId);

  useEffect(() => {
    if (selectedEmployeeId) {
      setPermissions(getTeamPermissions(`colab-${selectedEmployeeId}`));
    }
  }, [selectedEmployeeId]);

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Gestão de Permissões da Equipe</h2>
            <p className="text-xs text-zinc-400">Defina exatamente quais telas e ações cada colaborador pode acessar.</p>
          </div>
        </div>
        <button onClick={handleReset} className="text-xs font-semibold text-zinc-400 hover:text-white transition">
          Restaurar padrão
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="py-10 text-center text-sm text-zinc-400">Cadastre um colaborador para configurar permissões.</div>
      ) : (
        <>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Colaborador</label>
          <div className="relative mb-6">
            <Users className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <select
              value={selectedEmployeeId}
              onChange={event => setSelectedEmployeeId(event.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>{employee.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEAM_PERMISSION_LABELS.map(permission => (
              <label key={permission.key} className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 cursor-pointer hover:border-zinc-700">
                <span>
                  <span className="block text-xs text-zinc-500">{permission.group}</span>
                  <span className="text-sm font-semibold text-zinc-200">{permission.label}</span>
                </span>
                <input
                  type="checkbox"
                  checked={permissions[permission.key]}
                  onChange={() => handlePermissionChange(permission.key)}
                  className="sr-only"
                />
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center border transition ${permissions[permission.key] ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-zinc-900 border-zinc-700 text-zinc-600'}`}>
                  {permissions[permission.key] ? <Check className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
                </span>
              </label>
            ))}
          </div>

          <p className="text-[11px] text-zinc-500 mt-5">
            Alterações salvas automaticamente para {selectedEmployee?.nome || 'o colaborador'} e aplicadas no próximo login.
          </p>
        </>
      )}
    </div>
  );
};
