import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SiteSettings,
  ServiceItem,
  Employee,
  Appointment,
  PayrollRecord,
  StoryMedia,
  PushNotificationRecord,
  ClientMessage,
  ClientReview,
  LandingPageCampaign,
  AppointmentStatus,
  FichaTecnica,
  EstoqueItem,
  ServicoProduto,
  CartaoFidelidade,
  BlockedClient,
  AbsenceBlock,
  WaitlistEntry
} from '../types';
import { logSystemEvent } from '../services/supabase';
import { sendLocalPushNotification } from '../services/push';

interface SalonContextType {
  settings: SiteSettings;
  services: ServiceItem[];
  employees: Employee[];
  appointments: Appointment[];
  payroll: PayrollRecord[];
  stories: StoryMedia[];
  notifications: PushNotificationRecord[];
  messages: ClientMessage[];
  reviews: ClientReview[];
  landingPages: LandingPageCampaign[];
  fichasTecnicas: FichaTecnica[];
  estoque: EstoqueItem[];
  servicoProdutos: ServicoProduto[];
  cartoesFidelidade: CartaoFidelidade[];
  
  blockedClients: BlockedClient[];
  absences: AbsenceBlock[];
  waitlist: WaitlistEntry[];

  // New Actions for security & scheduling features
  addBlockedClient: (client: Omit<BlockedClient, 'id'>) => void;
  removeBlockedClient: (id: string) => void;
  isBlockedClient: (phone?: string, cpf?: string) => boolean;
  addAbsence: (absence: Omit<AbsenceBlock, 'id'>) => void;
  removeAbsence: (id: string) => void;
  addToWaitlist: (entry: Omit<WaitlistEntry, 'id'>) => void;
  removeFromWaitlist: (id: string) => void;  
  // Actions
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, service: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'created_at'>) => Appointment | null;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  checkoutAppointment: (id: string, metodoPagamento: string) => void;

  addStory: (story: Omit<StoryMedia, 'id' | 'publicado_em'>) => void;
  deleteStory: (id: string) => void;

  sendPushNotification: (titulo: string, mensagem: string) => Promise<void>;
  
  addClientMessage: (message: Omit<ClientMessage, 'id' | 'created_at' | 'lida'>) => void;
  markMessageRead: (id: string) => void;

  addClientReview: (review: Omit<ClientReview, 'id' | 'created_at' | 'aprovado_para_site'>) => void;
  toggleReviewApproval: (id: string) => void;

  createLandingPage: (lp: Omit<LandingPageCampaign, 'id' | 'views_count' | 'conversions_count' | 'created_at'>) => void;
  trackLandingPageView: (slug: string) => void;
  registerCommissionPayout: (employeeId: string, mesReferencia: string) => void;

  // New Actions for the 5 Features
  saveFichaTecnica: (ficha: Omit<FichaTecnica, 'id' | 'created_at' | 'updated_at'>) => void;
  createFichaTecnica: (data: Omit<FichaTecnica, 'id' | 'created_at' | 'updated_at'>) => void;
  updateFichaTecnica: (id: string, updates: Partial<FichaTecnica>) => void;
  getFichaTecnicaByPhone: (phone: string) => FichaTecnica | undefined;

  addEstoqueItem: (item: Omit<EstoqueItem, 'id' | 'created_at'>) => void;
  updateEstoqueItem: (id: string, item: Partial<EstoqueItem>) => void;
  deleteEstoqueItem: (id: string) => void;

  linkProdutoAoServico: (servicoId: string, produtoId: string, quantidade: number) => void;
  removeProdutoDoServico: (id: string) => void;

  getCartaoFidelidadeByPhone: (phone: string) => CartaoFidelidade | undefined;
  addVisitaFidelidade: (phone: string, nome: string) => void;
  updateAppointmentTime: (id: string, newDateTimeIso: string) => void;
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'set-1',
  nome_salao: 'Espaço Beleza VIP',
  whatsapp: '5511999999999',
  instagram: '@espacobelezavip',
  endereco: 'Av. Paulista, 1500 - Jardins, São Paulo - SP',
  chave_pix: '11999999999',
  valor_sinal_padrao: 20.00,
  google_review_link: 'https://g.page/r/espacobelezavip/review',
  banner_urls: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80'
  ]
};

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    nome: 'Corte Feminino & Escova Modelada',
    descricao: 'Lavagem relaxante com produtos profissionais, corte visagista e finalização com escova.',
    foto_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    duracao: 60,
    preco: 140.00,
    categoria: 'Cabelos',
    ativo: true
  },
  {
    id: 'srv-2',
    nome: 'Mechas Iluminadas / Balayage',
    descricao: 'Técnica de clareamento suave com nutrição e matização de alta performance.',
    foto_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    duracao: 180,
    preco: 380.00,
    categoria: 'Cabelos',
    ativo: true
  },
  {
    id: 'srv-3',
    nome: 'Manicure & Pedicure em Gel',
    descricao: 'Cutilagem russa com acabamento de alta durabilidade e brilho intenso.',
    foto_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    duracao: 75,
    preco: 95.00,
    categoria: 'Unhas',
    ativo: true
  },
  {
    id: 'srv-4',
    nome: 'Design de Sobrancelhas com Henna',
    descricao: 'Mapeamento facial completo com pigmentação temporária de efeito natural.',
    foto_url: 'https://images.unsplash.com/photo-1522337094846-8a83811221f6?auto=format&fit=crop&w=800&q=80',
    duracao: 45,
    preco: 65.00,
    categoria: 'Estética',
    ativo: true
  },
  {
    id: 'srv-5',
    nome: 'Maquiagem Social VIP',
    descricao: 'Make duradoura para casamentos e festas com cílios de seda inclusos.',
    foto_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    duracao: 60,
    preco: 180.00,
    categoria: 'Make',
    ativo: true
  }
];

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    nome: 'Helena Silva',
    especialidade: 'Master Colorista & Hairstylist',
    foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    comissao_percentual: 50.0,
    ativo: true
  },
  {
    id: 'emp-2',
    nome: 'Carla Mendes',
    especialidade: 'Especialista em Unhas & Gel',
    foto_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    comissao_percentual: 40.0,
    ativo: true
  },
  {
    id: 'emp-3',
    nome: 'Juliana Costa',
    especialidade: 'Visagista & Estética Facial',
    foto_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    comissao_percentual: 45.0,
    ativo: true
  }
];

const DEFAULT_ESTOQUE: EstoqueItem[] = [
  {
    id: 'est-1',
    nome_produto: 'Pó Descolorante Blond Premium',
    quantidade_atual: 1200.00,
    quantidade_minima: 300.00,
    unidade_medida: 'g',
    custo_unitario: 0.15,
    ativo: true
  },
  {
    id: 'est-2',
    nome_produto: 'Água Oxigenada 20 Vol Wella',
    quantidade_atual: 2500.00,
    quantidade_minima: 500.00,
    unidade_medida: 'ml',
    custo_unitario: 0.04,
    ativo: true
  },
  {
    id: 'est-3',
    nome_produto: 'Esmalte Gel Nude Real',
    quantidade_atual: 15.00,
    quantidade_minima: 3.00,
    unidade_medida: 'frasco',
    custo_unitario: 28.00,
    ativo: true
  },
  {
    id: 'est-4',
    nome_produto: 'Henna Castanho Médio',
    quantidade_atual: 50.00,
    quantidade_minima: 10.00,
    unidade_medida: 'g',
    custo_unitario: 1.20,
    ativo: true
  }
];

const DEFAULT_SERVICO_PRODUTOS: ServicoProduto[] = [
  {
    id: 'sp-1',
    servico_id: 'srv-2', // Mechas Iluminadas
    produto_id: 'est-1', // Pó descolorante
    quantidade_consumida: 80.00 // 80g por mecha
  },
  {
    id: 'sp-2',
    servico_id: 'srv-2', // Mechas Iluminadas
    produto_id: 'est-2', // Agua Oxigenada
    quantidade_consumida: 120.00 // 120ml por mecha
  },
  {
    id: 'sp-3',
    servico_id: 'srv-3', // Manicure Gel
    produto_id: 'est-3', // Esmalte Gel
    quantidade_consumida: 0.10 // 0.1 frasco
  }
];

const DEFAULT_FICHAS_TECNICAS: FichaTecnica[] = [
  {
    id: 'ft-1',
    cliente_phone: '11988887777',
    cliente_nome: 'Patrícia Souza',
    historico_quimico: 'Fazia progressiva de formol a cada 4 meses. Transicionando para mechas balayage.',
    formulas_tinturas: 'Fórmula Mechas: Pó Blond 1:1.5 com OX 20Vol + Matização 9.1 + 9.89 Wella Illumina.',
    alergias: 'Sem alergias relatadas a PPD ou amônia.',
    observacoes: 'Sensibilidade no couro cabeludo se usar água muito quente.'
  }
];

const DEFAULT_CARTOES_FIDELIDADE: CartaoFidelidade[] = [
  {
    id: 'cf-1',
    cliente_phone: '11988887777',
    cliente_nome: 'Patrícia Souza',
    pontos_acumulados: 8,
    total_visitas: 8,
    recompensa_disponivel: false
  },
  {
    id: 'cf-2',
    cliente_phone: '11977776666',
    cliente_nome: 'Juliana Paes',
    pontos_acumulados: 10,
    total_visitas: 10,
    recompensa_disponivel: true
  }
];

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export const SalonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const s = localStorage.getItem('salon_settings');
    return s ? JSON.parse(s) : DEFAULT_SETTINGS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const s = localStorage.getItem('salon_services');
    return s ? JSON.parse(s) : DEFAULT_SERVICES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const e = localStorage.getItem('salon_employees');
    return e ? JSON.parse(e) : DEFAULT_EMPLOYEES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const a = localStorage.getItem('salon_appointments');
    if (a) return JSON.parse(a);
    const today = new Date();
    today.setHours(14, 0, 0, 0);
    return [
      {
        id: 'app-sample-1',
        cliente_nome: 'Patrícia Souza',
        cliente_phone: '11988887777',
        data_hora: today.toISOString(),
        servico_id: 'srv-2',
        profissional_id: 'emp-1',
        status: 'confirmado',
        sinal_pago: true,
        valor_total: 380.00,
        valor_sinal: 20.00,
        metodo_pagamento: 'pendente',
        created_at: new Date().toISOString()
      }
    ];
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const p = localStorage.getItem('salon_payroll');
    return p ? JSON.parse(p) : [];
  });

  const [stories, setStories] = useState<StoryMedia[]>(() => {
    const st = localStorage.getItem('salon_stories');
    return st ? JSON.parse(st) : [];
  });

  const [notifications, setNotifications] = useState<PushNotificationRecord[]>(() => {
    const n = localStorage.getItem('salon_notifications');
    return n ? JSON.parse(n) : [];
  });

  const [messages, setMessages] = useState<ClientMessage[]>(() => {
    const m = localStorage.getItem('salon_messages');
    return m ? JSON.parse(m) : [];
  });

  const [reviews, setReviews] = useState<ClientReview[]>(() => {
    const r = localStorage.getItem('salon_reviews');
    return r ? JSON.parse(r) : [];
  });

  const [landingPages, setLandingPages] = useState<LandingPageCampaign[]>(() => {
    const lp = localStorage.getItem('salon_landing_pages');
    return lp ? JSON.parse(lp) : [];
  });

  // 5 New Features States
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>(() => {
    const ft = localStorage.getItem('salon_fichas_tecnicas');
    return ft ? JSON.parse(ft) : DEFAULT_FICHAS_TECNICAS;
  });

  const [estoque, setEstoque] = useState<EstoqueItem[]>(() => {
    const est = localStorage.getItem('salon_estoque');
    return est ? JSON.parse(est) : DEFAULT_ESTOQUE;
  });

  const [servicoProdutos, setServicoProdutos] = useState<ServicoProduto[]>(() => {
    const sp = localStorage.getItem('salon_servico_produtos');
    return sp ? JSON.parse(sp) : DEFAULT_SERVICO_PRODUTOS;
  });

  // Loyalty cards state
  const [cartoesFidelidade, setCartoesFidelidade] = useState<CartaoFidelidade[]>(() => {
    const cf = localStorage.getItem('salon_cartoes_fidelidade');
    return cf ? JSON.parse(cf) : DEFAULT_CARTOES_FIDELIDADE;
  });

  const [blockedClients, setBlockedClients] = useState<BlockedClient[]>(() => {
    const bc = localStorage.getItem('salon_blocked_clients');
    return bc ? JSON.parse(bc) : [];
  });

  const [absences, setAbsences] = useState<AbsenceBlock[]>(() => {
    const ab = localStorage.getItem('salon_absences');
    return ab ? JSON.parse(ab) : [];
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    const wl = localStorage.getItem('salon_waitlist');
    return wl ? JSON.parse(wl) : [];
  });

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem('salon_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('salon_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('salon_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('salon_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('salon_payroll', JSON.stringify(payroll)); }, [payroll]);
  useEffect(() => { localStorage.setItem('salon_stories', JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem('salon_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('salon_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('salon_reviews', JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('salon_landing_pages', JSON.stringify(landingPages)); }, [landingPages]);

  useEffect(() => { localStorage.setItem('salon_fichas_tecnicas', JSON.stringify(fichasTecnicas)); }, [fichasTecnicas]);
  useEffect(() => { localStorage.setItem('salon_blocked_clients', JSON.stringify(blockedClients)); }, [blockedClients]);
  useEffect(() => { localStorage.setItem('salon_absences', JSON.stringify(absences)); }, [absences]);
  useEffect(() => { localStorage.setItem('salon_waitlist', JSON.stringify(waitlist)); }, [waitlist]);
  useEffect(() => { localStorage.setItem('salon_estoque', JSON.stringify(estoque)); }, [estoque]);
  useEffect(() => { localStorage.setItem('salon_servico_produtos', JSON.stringify(servicoProdutos)); }, [servicoProdutos]);
  useEffect(() => { localStorage.setItem('salon_cartoes_fidelidade', JSON.stringify(cartoesFidelidade)); }, [cartoesFidelidade]);

  // Actions implementation
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logSystemEvent('CMS', 'Configurações do salão atualizadas.', 'success');
  };

  const addService = (service: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = { ...service, id: 'srv-' + Date.now() };
    setServices(prev => [newService, ...prev]);
    logSystemEvent('CMS', `Novo serviço adicionado: ${service.nome}`, 'success');
  };

  const updateService = (id: string, serviceData: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...serviceData } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = { ...employee, id: 'emp-' + Date.now() };
    setEmployees(prev => [newEmployee, ...prev]);
  };

  const updateEmployee = (id: string, employeeData: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employeeData } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const createAppointment = (data: Omit<Appointment, 'id' | 'created_at'>): Appointment | null => {
    if (isBlockedClient(data.cliente_phone, data.cliente_cpf)) {
      return null;
    }

    const newApp: Appointment = {
      ...data,
      id: 'app-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setAppointments(prev => [newApp, ...prev]);
    logSystemEvent('AGENDA', `Agendamento criado para ${newApp.cliente_nome}`, 'success');
    return newApp;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    logSystemEvent('AGENDA', `Status do agendamento ${id} alterado para ${status}.`, 'info');
  };

  const updateAppointmentTime = (id: string, newDateTimeIso: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, data_hora: newDateTimeIso } : a));
    logSystemEvent('AGENDA', `Horário do agendamento ${id} atualizado.`, 'info');
  };

  const checkoutAppointment = (id: string, metodoPagamento: string) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;

    // 1. Mark appointment as completed
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'concluido', metodo_pagamento: metodoPagamento } : a));

    // 2. AUTOMATIC STOCK DEDUCTION for products linked to this service
    const linkedProds = servicoProdutos.filter(sp => sp.servico_id === app.servico_id);
    if (linkedProds.length > 0) {
      setEstoque(prevEstoque => prevEstoque.map(item => {
        const link = linkedProds.find(sp => sp.produto_id === item.id);
        if (link) {
          const novaQtd = Math.max(0, item.quantidade_atual - link.quantidade_consumida);
          logSystemEvent('ESTOQUE', `Baixa automática de ${link.quantidade_consumida}${item.unidade_medida} em "${item.nome_produto}"`, 'info');
          return { ...item, quantidade_atual: novaQtd };
        }
        return item;
      }));
    }

    // 3. AUTOMATIC LOYALTY POINTS INCREMENT (+1 visit)
    addVisitaFidelidade(app.cliente_phone, app.cliente_nome);

    logSystemEvent('PDV', `Caixa fechado para ${app.cliente_nome} via ${metodoPagamento.toUpperCase()}. Estoque e Fidelidade atualizados.`, 'success');
  };

  const addStory = (storyData: Omit<StoryMedia, 'id' | 'publicado_em'>) => {
    const newStory: StoryMedia = {
      ...storyData,
      id: 'st-' + Date.now(),
      publicado_em: new Date().toISOString()
    };
    setStories(prev => [newStory, ...prev]);
  };

  const deleteStory = (id: string) => {
    setStories(prev => prev.filter(st => st.id !== id));
  };

  const sendPushNotification = async (titulo: string, mensagem: string) => {
    await sendLocalPushNotification(titulo, mensagem);
    const newRecord: PushNotificationRecord = {
      id: 'notif-' + Date.now(),
      titulo,
      mensagem,
      enviado_em: new Date().toISOString(),
      target_count: 24
    };
    setNotifications(prev => [newRecord, ...prev]);
  };

  const addClientMessage = (messageData: Omit<ClientMessage, 'id' | 'created_at' | 'lida'>) => {
    const newMsg: ClientMessage = {
      ...messageData,
      id: 'msg-' + Date.now(),
      lida: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [newMsg, ...prev]);
  };

  const markMessageRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, lida: true } : m));
  };

  const addClientReview = (reviewData: Omit<ClientReview, 'id' | 'created_at' | 'aprovado_para_site'>) => {
    const newRev: ClientReview = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      aprovado_para_site: false,
      created_at: new Date().toISOString()
    };
    setReviews(prev => [newRev, ...prev]);
  };

  const toggleReviewApproval = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, aprovado_para_site: !r.aprovado_para_site } : r));
  };

  const createLandingPage = (lpData: Omit<LandingPageCampaign, 'id' | 'views_count' | 'conversions_count' | 'created_at'>) => {
    const newLp: LandingPageCampaign = {
      ...lpData,
      id: 'lp-' + Date.now(),
      views_count: 0,
      conversions_count: 0,
      created_at: new Date().toISOString()
    };
    setLandingPages(prev => [newLp, ...prev]);
  };

  const trackLandingPageView = (slug: string) => {
    setLandingPages(prev => prev.map(lp => lp.slug === slug ? { ...lp, views_count: lp.views_count + 1 } : lp));
  };

  const registerCommissionPayout = (employeeId: string, mesReferencia: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const completedApps = appointments.filter(a => a.profissional_id === employeeId && a.status === 'concluido');
    const totalRevenue = completedApps.reduce((sum, a) => sum + a.valor_total, 0);
    const comissaoAccrued = (totalRevenue * emp.comissao_percentual) / 100;

    const record: PayrollRecord = {
      id: 'pay-' + Date.now(),
      employee_id: employeeId,
      mes_referencia: mesReferencia,
      total_comissoes: comissaoAccrued,
      descontos_vales: 0.00,
      valor_pago: comissaoAccrued,
      status_pagamento: 'pago',
      data_pagamento: new Date().toISOString(),
      employee_name: emp.nome
    };

    setPayroll(prev => [record, ...prev]);
    logSystemEvent('FOLHA', `Comissão de R$ ${comissaoAccrued.toFixed(2)} paga para ${emp.nome}`, 'success');
  };

  // Security & Scheduling Actions
  const addBlockedClient = (client: Omit<BlockedClient, 'id'>) => {
    const phone = client.cliente_phone.replace(/\D/g, '');
    const cpf = client.cliente_cpf?.replace(/\D/g, '');
    const alreadyBlocked = blockedClients.some(existing =>
      (phone && existing.cliente_phone.replace(/\D/g, '') === phone) ||
      (cpf && existing.cliente_cpf?.replace(/\D/g, '') === cpf)
    );
    if (alreadyBlocked) return;

    const newClient: BlockedClient = { ...client, id: `blk-${Date.now()}` };
    setBlockedClients(prev => [newClient, ...prev]);
    logSystemEvent('SEGURANCA', `Cliente bloqueado: ${client.cliente_nome}`, 'warn');
  };
  const removeBlockedClient = (id: string) => {
    setBlockedClients(prev => prev.filter(b => b.id !== id));
  };
  const isBlockedClient = (phone?: string, cpf?: string): boolean => {
    const normalizedPhone = phone?.replace(/\D/g, '');
    const normalizedCpf = cpf?.replace(/\D/g, '');
    return blockedClients.some(client =>
      (normalizedPhone && client.cliente_phone.replace(/\D/g, '') === normalizedPhone) ||
      (normalizedCpf && client.cliente_cpf?.replace(/\D/g, '') === normalizedCpf)
    );
  };
  const addAbsence = (absence: Omit<AbsenceBlock, 'id'>) => {
    const newAbsence: AbsenceBlock = { ...absence, id: `abs-${Date.now()}` };
    setAbsences(prev => [newAbsence, ...prev]);
    logSystemEvent('SEGURANCA', `Ausência adicionada`, 'info');
  };
  const removeAbsence = (id: string) => {
    setAbsences(prev => prev.filter(a => a.id !== id));
  };
  const addToWaitlist = (entry: Omit<WaitlistEntry, 'id'>) => {
    const newEntry: WaitlistEntry = { ...entry, id: `wl-${Date.now()}` };
    setWaitlist(prev => [newEntry, ...prev]);
    logSystemEvent('AGENDAMENTO', `Cliente adicionado à fila de espera`, 'info');
  };
  const removeFromWaitlist = (id: string) => {
    setWaitlist(prev => prev.filter(w => w.id !== id));
  };

  // --------------------------------------------------------------------------
  // NEW 5 FEATURES ACTIONS IMPLEMENTATION
  // --------------------------------------------------------------------------

  // 1. Ficha Técnica / Anamnese
  const saveFichaTecnica = (data: Omit<FichaTecnica, 'id' | 'created_at' | 'updated_at'>) => {
    const cleanPhone = data.cliente_phone.replace(/\D/g, '');
    const existing = fichasTecnicas.find(f => f.cliente_phone.replace(/\D/g, '') === cleanPhone);

    if (existing) {
      setFichasTecnicas(prev => prev.map(f => f.id === existing.id ? { ...f, ...data, updated_at: new Date().toISOString() } : f));
      logSystemEvent('ANAMNESE', `Anamnese atualizada para ${data.cliente_nome}`, 'success');
    } else {
      const newFicha: FichaTecnica = {
        ...data,
        id: 'ft-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setFichasTecnicas(prev => [newFicha, ...prev]);
      logSystemEvent('ANAMNESE', `Nova ficha técnica criada para ${data.cliente_nome}`, 'success');
    }
  };

  const createFichaTecnica = saveFichaTecnica;
  const updateFichaTecnica = (id: string, updates: Partial<FichaTecnica>) => {
     setFichasTecnicas(prev => prev.map(f => f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f));
  };

  const getFichaTecnicaByPhone = (phone: string): FichaTecnica | undefined => {
    const clean = phone.replace(/\D/g, '');
    return fichasTecnicas.find(f => f.cliente_phone.replace(/\D/g, '') === clean);
  };

  // 2. Controle de Estoque
  const addEstoqueItem = (itemData: Omit<EstoqueItem, 'id' | 'created_at'>) => {
    const newItem: EstoqueItem = {
      ...itemData,
      id: 'est-' + Date.now(),
      created_at: new Date().toISOString()
    };
    setEstoque(prev => [newItem, ...prev]);
    logSystemEvent('ESTOQUE', `Produto cadastrado no estoque: ${newItem.nome_produto}`, 'success');
  };

  const updateEstoqueItem = (id: string, itemData: Partial<EstoqueItem>) => {
    setEstoque(prev => prev.map(item => item.id === id ? { ...item, ...itemData } : item));
  };

  const deleteEstoqueItem = (id: string) => {
    setEstoque(prev => prev.filter(item => item.id !== id));
    setServicoProdutos(prev => prev.filter(sp => sp.produto_id !== id));
  };

  const linkProdutoAoServico = (servicoId: string, produtoId: string, quantidade: number) => {
    const existing = servicoProdutos.find(sp => sp.servico_id === servicoId && sp.produto_id === produtoId);
    if (existing) {
      setServicoProdutos(prev => prev.map(sp => sp.id === existing.id ? { ...sp, quantidade_consumida: quantidade } : sp));
    } else {
      const newLink: ServicoProduto = {
        id: 'sp-' + Date.now(),
        servico_id: servicoId,
        produto_id: produtoId,
        quantidade_consumida: quantidade
      };
      setServicoProdutos(prev => [...prev, newLink]);
    }
    logSystemEvent('ESTOQUE', `Insumo de serviço vinculado com sucesso.`, 'info');
  };

  const removeProdutoDoServico = (id: string) => {
    setServicoProdutos(prev => prev.filter(sp => sp.id !== id));
  };

  // 3. Cartão Fidelidade Digital
  const getCartaoFidelidadeByPhone = (phone: string): CartaoFidelidade | undefined => {
    const clean = phone.replace(/\D/g, '');
    return cartoesFidelidade.find(cf => cf.cliente_phone.replace(/\D/g, '') === clean);
  };

  const addVisitaFidelidade = (phone: string, nome: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const existing = cartoesFidelidade.find(cf => cf.cliente_phone.replace(/\D/g, '') === cleanPhone);

    if (existing) {
      const novosPontos = existing.pontos_acumulados + 1;
      const totalVisitas = existing.total_visitas + 1;
      const recompensa = novosPontos >= 10;

      setCartoesFidelidade(prev => prev.map(cf => cf.id === existing.id ? {
        ...cf,
        pontos_acumulados: novosPontos,
        total_visitas: totalVisitas,
        recompensa_disponivel: recompensa,
        updated_at: new Date().toISOString()
      } : cf));
      logSystemEvent('FIDELIDADE', `Visita acumulada para ${nome}. Pontos: ${novosPontos}/10`, 'success');
    } else {
      const newCard: CartaoFidelidade = {
        id: 'cf-' + Date.now(),
        cliente_phone: phone,
        cliente_nome: nome,
        pontos_acumulados: 1,
        total_visitas: 1,
        recompensa_disponivel: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCartoesFidelidade(prev => [newCard, ...prev]);
      logSystemEvent('FIDELIDADE', `Cartão Fidelidade criado para ${nome}. 1º ponto registrado!`, 'success');
    }
  };

  return (
    <SalonContext.Provider
      value={{
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
        cartoesFidelidade,
        blockedClients,
        absences,
        waitlist,
        updateSettings,
        addService,
        updateService,
        deleteService,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        createAppointment,
        updateAppointmentStatus,
        checkoutAppointment,
        addStory,
        deleteStory,
        sendPushNotification,
        addClientMessage,
        markMessageRead,
        addClientReview,
        toggleReviewApproval,
        createLandingPage,
        trackLandingPageView,
        registerCommissionPayout,
        saveFichaTecnica,
        getFichaTecnicaByPhone,
        addEstoqueItem,
        updateEstoqueItem,
        deleteEstoqueItem,
        linkProdutoAoServico,
        removeProdutoDoServico,
        getCartaoFidelidadeByPhone,
        addVisitaFidelidade,
        updateAppointmentTime,
        createFichaTecnica,
        updateFichaTecnica,
        addBlockedClient,
        removeBlockedClient,
        isBlockedClient,
        addAbsence,
        removeAbsence,
        addToWaitlist,
        removeFromWaitlist
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) throw new Error('useSalon deve ser usado dentro de um SalonProvider');
  return context;
};
