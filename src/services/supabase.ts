import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Utility logger for Dev Admin view
export const logSystemEvent = (module: string, message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
  const logs = JSON.parse(localStorage.getItem('dev_system_logs') || '[]');
  const entry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level,
    module,
    message
  };
  logs.unshift(entry);
  localStorage.setItem('dev_system_logs', JSON.stringify(logs.slice(0, 100)));
};
