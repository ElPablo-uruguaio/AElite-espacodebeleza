import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { logSystemEvent } from '../services/supabase';
import { getTeamPermissions } from '../utils/permissions';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoggedIn: boolean;
  loginAsGestora: (password: string) => Promise<boolean>;
  loginAsColaborador: (password: string) => Promise<boolean>;
  loginAsDevAdmin: (masterKey: string) => boolean;
  changePassword: (currentPass: string, newPass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('salon_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState<UserRole>(() => {
    return user ? user.role : 'cliente';
  });

  const getStoredPassword = (roleKey: string) => {
    return localStorage.getItem(`${roleKey}_password`) || (roleKey === 'admin' ? 'admin123' : 'colab123');
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('salon_auth_user', JSON.stringify(user));
      setRole(user.role);
    } else {
      localStorage.removeItem('salon_auth_user');
      setRole('cliente');
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'colaborador' && !user.team_permissions) {
      setUser(prev => prev ? {
        ...prev,
        employee_id: prev.employee_id || 'emp-1',
        team_permissions: getTeamPermissions(`colab-${prev.employee_id || 'emp-1'}`),
      } : prev);
    }
  }, [user]);

  const loginAsGestora = async (password: string): Promise<boolean> => {
    const storedPass = getStoredPassword('admin');
    if (password === storedPass) {
      const adminUser: UserProfile = {
        id: 'admin-001',
        email: 'gestora@espacobelezavip.com.br',
        full_name: 'Proprietária & Gestora',
        role: 'admin',
        permissions: {
          canViewAgenda: true,
          canViewEstoque: true,
          canViewFinanceiro: true,
          canManageClients: true,
          canEditSettings: true
        },
        phone: '11999999999'
      };
      setUser(adminUser);
      logSystemEvent('AUTH', 'Login efetuado com sucesso como Admin.', 'success');
      return true;
    }
    logSystemEvent('AUTH', 'Tentativa incorreta de senha da Gestora.', 'warn');
    return false;
  };

  const loginAsColaborador = async (password: string): Promise<boolean> => {
    const storedPass = getStoredPassword('colaborador');
    if (password === storedPass) {
      const colabUser: UserProfile = {
        id: 'colab-001',
        email: 'equipe@espacobelezavip.com.br',
        full_name: 'Equipe de Atendimento',
        role: 'colaborador',
        employee_id: 'emp-1',
        team_permissions: getTeamPermissions('colab-emp-1'),
        permissions: {
          canViewAgenda: getTeamPermissions('colab-emp-1').canViewAgenda,
          canViewEstoque: getTeamPermissions('colab-emp-1').canViewEstoque,
          canViewFinanceiro: getTeamPermissions('colab-emp-1').canViewFinanceiro,
          canManageClients: getTeamPermissions('colab-emp-1').canManageClients,
          canEditSettings: getTeamPermissions('colab-emp-1').canEditSettings
        },
      };
      setUser(colabUser);
      logSystemEvent('AUTH', 'Login efetuado com sucesso como Colaborador.', 'success');
      return true;
    }
    logSystemEvent('AUTH', 'Tentativa incorreta de senha do Colaborador.', 'warn');
    return false;
  };

  const loginAsDevAdmin = (masterKey: string): boolean => {
    const storedDevPassword = localStorage.getItem('dev_admin_password') || 'devmaster2026';
    if (masterKey === storedDevPassword || masterKey === 'master') {
      const devUser: UserProfile = {
        id: 'dev-001',
        email: 'devmaster@antigravity.ai',
        full_name: 'Dev Master (Suporte Técnico)',
        role: 'dev_admin',
        permissions: {
          canViewAgenda: true,
          canViewEstoque: true,
          canViewFinanceiro: true,
          canManageClients: true,
          canEditSettings: true
        }
      };
      setUser(devUser);
      logSystemEvent('AUTH', 'Acesso Dev Admin concedido via Chave Mestre.', 'success');
      return true;
    }
    logSystemEvent('AUTH', 'Tentativa inválida de chave Dev Master.', 'error');
    return false;
  };

  const changePassword = (currentPass: string, newPass: string): boolean => {
    if (!user || user.role === 'dev_admin') return false;
    const roleKey = user.role === 'admin' ? 'admin' : 'colaborador';
    const storedPass = getStoredPassword(roleKey);
    
    if (currentPass === storedPass) {
      localStorage.setItem(`${roleKey}_password`, newPass);
      logSystemEvent('AUTH', 'Senha alterada com sucesso.', 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setRole('cliente');
    logSystemEvent('AUTH', 'Sessão encerrada.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoggedIn: Boolean(user),
        loginAsGestora,
        loginAsColaborador,
        loginAsDevAdmin,
        changePassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
