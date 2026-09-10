-- ==============================================================================
-- ESPAÇO BELEZA VIP - SUPABASE POSTGRESQL DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('dev_admin', 'admin', 'colaborador', 'cliente')) DEFAULT 'cliente',
  permissions JSONB DEFAULT '{}'::jsonb,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_salao TEXT NOT NULL DEFAULT 'Espaço Beleza VIP',
  whatsapp TEXT NOT NULL DEFAULT '5511999999999',
  instagram TEXT DEFAULT '@espacobelezavip',
  endereco TEXT DEFAULT 'Av. Principal, 1000 - Centro, São Paulo - SP',
  chave_pix TEXT DEFAULT '11999999999',
  valor_sinal_padrao DECIMAL(10,2) DEFAULT 20.00,
  google_review_link TEXT DEFAULT 'https://g.page/r/espacobelezavip/review',
  banner_urls TEXT[] DEFAULT ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  foto_url TEXT,
  duracao INT NOT NULL DEFAULT 60, -- em minutos
  preco DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Cabelos',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  foto_url TEXT,
  comissao_percentual DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  telefone TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_nome TEXT NOT NULL,
  cliente_phone TEXT NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  servico_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('aguardando_confirmacao', 'confirmado', 'em_atendimento', 'concluido', 'cancelado')) DEFAULT 'confirmado',
  valor_total DECIMAL(10,2) NOT NULL,
  metodo_pagamento TEXT DEFAULT 'pendente', -- pos, virtual, pix, dinheiro
  parent_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL, -- for recurrence group
  recurrence_rule TEXT, -- 'weekly', 'biweekly', 'monthly'
  utm_source TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PAYROLL TABLE (COMISSÕES E REPASSES)
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  mes_referencia TEXT NOT NULL, -- Ex: '2026-08'
  total_comissoes DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  descontos_vales DECIMAL(10,2) DEFAULT 0.00,
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status_pagamento TEXT CHECK (status_pagamento IN ('pendente', 'pago')) DEFAULT 'pendente',
  data_pagamento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STORIES TABLE (MÍDIAS EM LOOP COM ÁUDIO)
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) DEFAULT 'video',
  audio_url TEXT,
  publicado_em TIMESTAMPTZ DEFAULT NOW(),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE (PUSH PROMOÇÕES)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  enviado_em TIMESTAMPTZ DEFAULT NOW(),
  target_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MESSAGES TABLE (RECADOS, ATRASOS E SUGESTÕES)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_nome TEXT NOT NULL,
  cliente_phone TEXT,
  tipo TEXT CHECK (tipo IN ('recado', 'atraso', 'sugestao')) DEFAULT 'recado',
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REVIEWS TABLE (AVALIAÇÕES)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_nome TEXT NOT NULL,
  nota_estrelas INT CHECK (nota_estrelas BETWEEN 1 AND 5) NOT NULL,
  comentario TEXT,
  profissional_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  aprovado_para_site BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LANDING PAGES TABLE (MARKETING & CAMPAIGNS)
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  titulo_oferta TEXT NOT NULL,
  descricao TEXT,
  imagem_capa TEXT,
  preco_promocional DECIMAL(10,2) NOT NULL,
  valor_sinal_pix DECIMAL(10,2) DEFAULT 20.00,
  ativa BOOLEAN DEFAULT TRUE,
  views_count INT DEFAULT 0,
  conversions_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FICHAS TECNICAS / ANAMNESE DA CLIENTE
CREATE TABLE IF NOT EXISTS public.fichas_tecnicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_phone TEXT NOT NULL UNIQUE,
  cliente_nome TEXT NOT NULL,
  historico_quimico TEXT,
  formulas_tinturas TEXT,
  alergias TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ESTOQUE DE PRODUTOS E INSUMOS
CREATE TABLE IF NOT EXISTS public.estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_produto TEXT NOT NULL,
  quantidade_atual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantidade_minima DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  unidade_medida TEXT NOT NULL DEFAULT 'ml', -- 'ml', 'g', 'unidade', 'frasco'
  custo_unitario DECIMAL(10,2) DEFAULT 0.00,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. PRODUTOS CONSUMIDOS POR SERVIÇO (VÍNCULO DE CONSUMO)
CREATE TABLE IF NOT EXISTS public.servico_produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  servico_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.estoque(id) ON DELETE CASCADE,
  quantidade_consumida DECIMAL(10,2) NOT NULL DEFAULT 1.00
);

-- 16. CARTÃO FIDELIDADE DIGITAL
CREATE TABLE IF NOT EXISTS public.cartao_fidelidade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_phone TEXT NOT NULL UNIQUE,
  cliente_nome TEXT NOT NULL,
  pontos_acumulados INT DEFAULT 0,
  total_visitas INT DEFAULT 0,
  recompensa_disponivel BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CLIENTES BLOQUEADOS (STEALTH BLOCK)
CREATE TABLE IF NOT EXISTS public.clientes_bloqueados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_phone TEXT NOT NULL UNIQUE,
  cliente_nome TEXT NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AUSÊNCIAS E BLOQUEIOS DE AGENDA
CREATE TABLE IF NOT EXISTS public.ausencias_bloqueios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  profissional_id UUID REFERENCES public.employees(id) ON DELETE CASCADE, -- if null, it's a global salon block (e.g., holiday)
  motivo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. FILA DE ESPERA
CREATE TABLE IF NOT EXISTS public.fila_espera (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_nome TEXT NOT NULL,
  cliente_phone TEXT NOT NULL,
  data_hora_desejada TIMESTAMPTZ NOT NULL,
  servico_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('aguardando', 'notificado', 'concluido', 'cancelado')) DEFAULT 'aguardando',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servico_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartao_fidelidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_bloqueados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ausencias_bloqueios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fila_espera ENABLE ROW LEVEL SECURITY;

-- Public READ for active services, employees, approved reviews, site settings, active stories, active LPs, cartao_fidelidade, and ausencias
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (ativo = TRUE);
CREATE POLICY "Public Read Employees" ON public.employees FOR SELECT USING (ativo = TRUE);
CREATE POLICY "Public Read Approved Reviews" ON public.reviews FOR SELECT USING (aprovado_para_site = TRUE);
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public Read Stories" ON public.stories FOR SELECT USING (ativo = TRUE);
CREATE POLICY "Public Read Landing Pages" ON public.landing_pages FOR SELECT USING (ativa = TRUE);
CREATE POLICY "Public Read Cartao Fidelidade" ON public.cartao_fidelidade FOR SELECT USING (TRUE);
CREATE POLICY "Public Read Ausencias" ON public.ausencias_bloqueios FOR SELECT USING (TRUE);

-- Public INSERT for Appointments, Messages, Reviews, Fila Espera
CREATE POLICY "Public Insert Appointments" ON public.appointments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public Insert Messages" ON public.messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public Insert Fila Espera" ON public.fila_espera FOR INSERT WITH CHECK (TRUE);

-- Manager & Dev Admin ALL Access
CREATE POLICY "Manager All Services" ON public.services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Employees" ON public.employees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Payroll" ON public.payroll FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Stories" ON public.stories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Notifications" ON public.notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Messages" ON public.messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Reviews" ON public.reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Site Settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Landing Pages" ON public.landing_pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Fichas Tecnicas" ON public.fichas_tecnicas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Estoque" ON public.estoque FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Servico Produtos" ON public.servico_produtos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Cartao Fidelidade" ON public.cartao_fidelidade FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Clientes Bloqueados" ON public.clientes_bloqueados FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Ausencias" ON public.ausencias_bloqueios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Manager All Fila Espera" ON public.fila_espera FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- INITIAL SEED DATA FOR DEMO / FIRST RUN
-- ==============================================================================
INSERT INTO public.site_settings (nome_salao, whatsapp, instagram, endereco, chave_pix, valor_sinal_padrao, google_review_link)
VALUES ('Espaço Beleza VIP', '5511999999999', '@espacobelezavip', 'Av. Paulista, 1500 - Jardins, São Paulo - SP', '11999999999', 20.00, 'https://g.page/r/espacobelezavip/review')
ON CONFLICT DO NOTHING;

INSERT INTO public.services (nome, descricao, foto_url, duracao, preco, categoria) VALUES
('Corte Feminino & Escova', 'Modelagem personalizada de corte com lavagem especial e escova modelada.', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80', 60, 140.00, 'Cabelos'),
('Mechas Iluminadas / Balayage', 'Técnica de clareamento premium com tratamento de reconstrução capilar incluso.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 180, 380.00, 'Cabelos'),
('Manicure & Pedicure Gel', 'Unhas perfeitas com esmaltação em gel e cutilagem russa impecável.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', 75, 95.00, 'Unhas'),
('Design de Sobrancelhas com Henna', 'Alinhamento visagista das sobrancelhas com preenchimento em henna natural.', 'https://images.unsplash.com/photo-1522337094846-8a83811221f6?auto=format&fit=crop&w=800&q=80', 45, 65.00, 'Estética'),
('Maquialgem Social VIP', 'Maquiagem de alta durabilidade para eventos com aplicação de cílios postiços.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 60, 180.00, 'Make')
ON CONFLICT DO NOTHING;

INSERT INTO public.estoque (nome_produto, quantidade_atual, quantidade_minima, unidade_medida, custo_unitario) VALUES
('Pó Descolorante Blond Premium', 1200.00, 300.00, 'g', 0.15),
('Água Oxigenada 20 Vol', 2500.00, 500.00, 'ml', 0.04),
('Máscara de Reconstrução Wella', 800.00, 200.00, 'g', 0.25),
('Esmalte Gel Nude Real', 15.00, 3.00, 'frasco', 28.00),
('Henna Castanho Médio', 50.00, 10.00, 'g', 1.20)
ON CONFLICT DO NOTHING;

INSERT INTO public.cartao_fidelidade (cliente_phone, cliente_nome, pontos_acumulados, total_visitas, recompensa_disponivel) VALUES
('11988887777', 'Patrícia Souza', 8, 8, FALSE),
('11977776666', 'Juliana Paes', 10, 10, TRUE)
ON CONFLICT DO NOTHING;
