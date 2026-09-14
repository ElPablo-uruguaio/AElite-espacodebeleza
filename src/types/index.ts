export type UserRole = 'dev_admin' | 'admin' | 'colaborador' | 'cliente';

export interface Permissions {
  canViewAgenda: boolean;
  canViewEstoque: boolean;
  canViewFinanceiro: boolean;
  canManageClients: boolean;
  canEditSettings: boolean;
}

export interface TeamPermissions extends Permissions {
  canEditAgenda: boolean;
  canViewComissoes: boolean;
  canEditComissoes: boolean;
  canEditEstoque: boolean;
  canEditFinanceiro: boolean;
  canManageBlockedClients: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  permissions?: Permissions;
  team_permissions?: TeamPermissions;
  employee_id?: string;
  phone?: string;
  created_at?: string;
}

export interface SiteSettings {
  id: string;
  nome_salao: string;
  whatsapp: string;
  instagram: string;
  endereco: string;
  chave_pix: string;
  valor_sinal_padrao: number;
  google_review_link?: string;
  banner_urls: string[];
}

export interface ServiceItem {
  id: string;
  nome: string;
  descricao: string;
  foto_url: string;
  duracao: number; // minutes
  preco: number;
  categoria: string;
  ativo: boolean;
  created_at?: string;
}

export interface Employee {
  id: string;
  nome: string;
  especialidade: string;
  foto_url: string;
  comissao_percentual: number;
  telefone?: string;
  ativo: boolean;
  created_at?: string;
}

export type AppointmentStatus = 
  | 'aguardando_confirmacao' 
  | 'confirmado' 
  | 'em_atendimento' 
  | 'concluido' 
  | 'cancelado';

export interface Appointment {
  id: string;
  cliente_nome: string;
  cliente_phone: string;
  cliente_cpf?: string;
  data_hora: string; // ISO string
  servico_id: string;
  profissional_id: string;
  status: AppointmentStatus;
  valor_total: number;
  metodo_pagamento?: string; // 'pos' | 'virtual' | 'pix' | 'dinheiro' | 'pendente'
  parent_id?: string;
  recurrence_rule?: string;
  utm_source?: string;
  utm_campaign?: string;
  created_at?: string;
  // Joined fields for display
  servico?: ServiceItem;
  profissional?: Employee;
  // New fields for payment handling
  sinal_pago?: boolean;
  valor_sinal?: number;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  mes_referencia: string; // 'YYYY-MM'
  total_comissoes: number;
  descontos_vales: number;
  valor_pago: number;
  status_pagamento: 'pendente' | 'pago';
  data_pagamento?: string;
  employee_name?: string;
}

export type RecurringDiscountFrequency = 'diario' | 'semanal' | 'quinzenal' | 'mensal';

export interface CommissionRule {
  id: string;
  employee_id: string;
  servico_id: string;
  percentual: number;
  created_at: string;
}

export interface RecurringDiscount {
  id: string;
  employee_id: string;
  descricao: string;
  valor: number;
  frequencia: RecurringDiscountFrequency;
  ativo: boolean;
  created_at: string;
}

export interface PayrollAdvance {
  id: string;
  employee_id: string;
  valor: number;
  data: string;
  observacao: string;
  status: 'pendente' | 'descontado';
  created_at: string;
}

export interface PayrollSummary {
  employee_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  total_bruto: number;
  total_vales: number;
  total_descontos: number;
  valor_liquido: number;
  atendimentos: number;
}

export interface StoryMedia {
  id: string;
  titulo?: string;
  media_url: string;
  media_type: 'image' | 'video';
  audio_url?: string;
  publicado_em: string;
  ativo: boolean;
}

export interface PushNotificationRecord {
  id: string;
  titulo: string;
  mensagem: string;
  enviado_em: string;
  target_count: number;
}

export type AppointmentReminderKind = '24h' | '2h';
export type AppointmentReminderStatus = 'pendente' | 'enviado' | 'cancelado';

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  tipo: AppointmentReminderKind;
  status: AppointmentReminderStatus;
  cliente_nome: string;
  cliente_phone: string;
  servico_nome: string;
  data_hora_agendamento: string;
  data_hora_lembrete: string;
  created_at: string;
  enviado_em?: string;
}

export type MessageType = 'recado' | 'atraso' | 'sugestao';

export interface ClientMessage {
  id: string;
  cliente_nome: string;
  cliente_phone?: string;
  tipo: MessageType;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export interface ClientReview {
  id: string;
  cliente_nome: string;
  nota_estrelas: number; // 1-5
  comentario: string;
  profissional_id?: string;
  aprovado_para_site: boolean;
  created_at: string;
}

export interface LandingPageCampaign {
  id: string;
  slug: string;
  titulo_oferta: string;
  descricao: string;
  imagem_capa: string;
  preco_promocional: number;
  valor_sinal_pix: number;
  ativa: boolean;
  views_count: number;
  conversions_count: number;
  created_at: string;
}

// 1. Ficha Técnica / Anamnese da Cliente
export interface FichaTecnica {
  id: string;
  cliente_phone: string;
  cliente_nome: string;
  historico_quimico: string;
  formulas_tinturas: string;
  alergias: string;
  observacoes: string;
  created_at?: string;
  updated_at?: string;
}

// 2. Controle de Estoque
export interface EstoqueItem {
  id: string;
  nome_produto: string;
  quantidade_atual: number;
  quantidade_minima: number;
  unidade_medida: string; // 'ml', 'g', 'unidade', 'frasco'
  custo_unitario: number;
  ativo: boolean;
  created_at?: string;
}

// Vinculo de Consumo de Produto por Serviço
export interface ServicoProduto {
  id: string;
  servico_id: string;
  produto_id: string;
  quantidade_consumida: number;
}

// 3. Cartão Fidelidade Digital
export interface CartaoFidelidade {
  id: string;
  cliente_phone: string;
  cliente_nome: string;
  pontos_acumulados: number;
  total_visitas: number;
  recompensa_disponivel: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DevLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  module: string;
  message: string;
}

// 4. Clientes Bloqueados (Stealth Block)
export interface BlockedClient {
  id: string;
  cliente_phone: string;
  cliente_cpf?: string;
  cliente_nome: string;
  motivo?: string;
  created_at?: string;
}

// 5. Ausências e Bloqueios Temporários
export interface AbsenceBlock {
  id: string;
  data_inicio: string; // ISO string
  data_fim: string; // ISO string
  profissional_id?: string; // If undefined, applies to entire salon
  motivo: string;
  created_at?: string;
}

// 6. Fila de Espera
export interface WaitlistEntry {
  id: string;
  cliente_nome: string;
  cliente_phone: string;
  data_hora_desejada: string;
  servico_id: string;
  status: 'aguardando' | 'notificado' | 'concluido' | 'cancelado';
  created_at?: string;
}
