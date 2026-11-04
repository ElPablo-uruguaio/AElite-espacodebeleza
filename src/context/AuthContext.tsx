import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { isSupabaseConfigured, logSystemEvent, supabase } from '../services/supabase';
import { getTeamPermissions } from '../utils/permissions';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoggedIn: boolean;
  loginAsGestora: (email: string, password: string) => Promise<boolean>;
  loginAsColaborador: (email: string, password: string) => Promise<boolean>;
  loginAsDevAdmin: (email: string, password: string) => Promise<boolean>;
  changePassword: (currentPass: string, newPass: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
    const authClient = supabase;
    if (!authClient) return;

    let mounted = true;
    const syncSession = async () => {
      const { data: { session } } = await authClient.auth.getSession();
      if (!mounted) return;

      if (!session) {
        setUser(null);
        return;
      }

      const storedUser = localStorage.getItem('salon_auth_user');
      const localUser = storedUser ? JSON.parse(storedUser) as UserProfile : null;
      if (localUser && localUser.email === session.user.email) {
        setUser({ ...localUser, id: session.user.id, email: session.user.email || localUser.email });
      } else {
        setUser(null);
      }
    };

    syncSession();
    const { data: { subscription } } = authClient.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.role === 'colaborador' && !user.team_permissions) {
      setUser(prev => prev ? {
        ...prev,
        employee_id: prev.employee_id || 'emp-1',
        team_permissions: getTeamPermissions(`colab-${prev.employee_id || 'emp-1'}`),
      } : prev);
    }
  }, [user]);

  const loginAsGestora = async (email: string, password: string): Promise<boolean> => {
    return signInWithRole(email, password, {
      id: '',
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
    });
  };

  const loginAsColaborador = async (email: string, password: string): Promise<boolean> => {
    const teamPermissions = getTeamPermissions('colab-emp-1');
    return signInWithRole(email, password, {
      id: '',
      email: 'equipe@espacobelezavip.com.br',
      full_name: 'Equipe de Atendimento',
      role: 'colaborador',
      employee_id: 'emp-1',
      team_permissions: teamPermissions,
      permissions: {
        canViewAgenda: teamPermissions.canViewAgenda,
        canViewEstoque: teamPermissions.canViewEstoque,
        canViewFinanceiro: teamPermissions.canViewFinanceiro,
        canManageClients: teamPermissions.canManageClients,
        canEditSettings: teamPermissions.canEditSettings
      }
    });
  };

  const loginAsDevAdmin = async (email: string, password: string): Promise<boolean> => {
    return signInWithRole(email, password, {
      id: '',
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
    });
  };

  const signInWithRole = async (email: string, password: string, profile: UserProfile): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      logSystemEvent('AUTH', 'Supabase não está configurado para autenticação.', 'error');
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        const authMessage = error?.message || 'Usuário não retornado pelo Supabase.';
        console.error(`[Auth] Falha no signInWithPassword: ${authMessage}`, {
          email,
          message: authMessage,
          status: error?.status,
          code: error?.code,
          name: error?.name
        });
        logSystemEvent('AUTH', authMessage, 'warn');
        return false;
      }

      setUser({ ...profile, id: data.user.id, email: data.user.email || email });
      logSystemEvent('AUTH', `Login Supabase efetuado como ${profile.role}.`, 'success');
      return true;
    } catch (error) {
      console.error('[Auth] Erro inesperado no signInWithPassword:', error);
      logSystemEvent('AUTH', 'Erro inesperado durante a autenticação Supabase.', 'error');
      return false;
    }
  };

  const changePassword = async (_currentPass: string, newPass: string): Promise<boolean> => {
    if (!supabase || !user) return false;
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) return false;
    logSystemEvent('AUTH', 'Senha alterada com sucesso.', 'success');
    return true;
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
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
