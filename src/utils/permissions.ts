import { TeamPermissions } from '../types';

export const DEFAULT_TEAM_PERMISSIONS: TeamPermissions = {
  canViewAgenda: true,
  canEditAgenda: false,
  canViewComissoes: true,
  canEditComissoes: false,
  canViewEstoque: false,
  canEditEstoque: false,
  canViewFinanceiro: false,
  canEditFinanceiro: false,
  canManageClients: false,
  canManageBlockedClients: false,
  canEditSettings: false,
};

const STORAGE_KEY = 'salon_team_permissions';

type StoredPermissions = Record<string, TeamPermissions>;

export const getTeamPermissions = (memberId: string): TeamPermissions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const permissions: StoredPermissions = stored ? JSON.parse(stored) : {};
    return { ...DEFAULT_TEAM_PERMISSIONS, ...(permissions[memberId] || {}) };
  } catch {
    return { ...DEFAULT_TEAM_PERMISSIONS };
  }
};

export const saveTeamPermissions = (memberId: string, permissions: TeamPermissions): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const allPermissions: StoredPermissions = stored ? JSON.parse(stored) : {};
  allPermissions[memberId] = permissions;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPermissions));
};

export const TEAM_PERMISSION_LABELS: Array<{ key: keyof TeamPermissions; label: string; group: string }> = [
  { key: 'canViewAgenda', label: 'Visualizar agenda individual', group: 'Agenda' },
  { key: 'canEditAgenda', label: 'Editar status e horários', group: 'Agenda' },
  { key: 'canViewComissoes', label: 'Visualizar comissões', group: 'Comissões' },
  { key: 'canEditComissoes', label: 'Editar comissões', group: 'Comissões' },
  { key: 'canViewEstoque', label: 'Visualizar estoque', group: 'Operação' },
  { key: 'canEditEstoque', label: 'Editar estoque', group: 'Operação' },
  { key: 'canViewFinanceiro', label: 'Visualizar financeiro geral', group: 'Administração' },
  { key: 'canEditFinanceiro', label: 'Editar financeiro geral', group: 'Administração' },
  { key: 'canManageClients', label: 'Gerenciar clientes', group: 'Administração' },
  { key: 'canManageBlockedClients', label: 'Gerenciar bloqueios silenciosos', group: 'Administração' },
  { key: 'canEditSettings', label: 'Editar configurações e preços', group: 'Administração' },
];
