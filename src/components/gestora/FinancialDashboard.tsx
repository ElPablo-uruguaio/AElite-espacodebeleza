import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  Check,
  DollarSign,
  Edit3,
  Filter,
  Plus,
  Trash2,
  WalletCards,
  X
} from 'lucide-react';
import { isSupabaseConfigured, supabase, supabaseEnvironment } from '../../services/supabase';

type TransactionType = 'ENTRADA' | 'SAIDA';
type TransactionStatus = 'PAGO' | 'PENDENTE';

interface ExpenseCategory {
  nome: string;
  tipo: TransactionType;
}

interface Transaction {
  id: string;
  tipo: TransactionType;
  descricao: string;
  valor: number;
  categoria: string;
  fornecedor: string | null;
  data_pagamento: string;
  status: TransactionStatus;
  profissional_id: string | null;
}

interface TransactionForm {
  descricao: string;
  valor: string;
  categoria: string;
  fornecedor: string;
  data_pagamento: string;
  status: TransactionStatus;
}

const defaultCategories: ExpenseCategory[] = [
  { nome: 'Serviços Prestados', tipo: 'ENTRADA' },
  { nome: 'Venda de Produtos', tipo: 'ENTRADA' },
  { nome: 'Água / Luz / Gás', tipo: 'SAIDA' },
  { nome: 'Internet / Telefone', tipo: 'SAIDA' },
  { nome: 'Produtos / Insumos', tipo: 'SAIDA' },
  { nome: 'Alimentação / Bebedouro', tipo: 'SAIDA' },
  { nome: 'Fornecedores', tipo: 'SAIDA' },
  { nome: 'Comissão de Funcionário', tipo: 'SAIDA' },
  { nome: 'Aluguel / Manutenção', tipo: 'SAIDA' },
  { nome: 'Outras Despesas', tipo: 'SAIDA' }
];
const currentMonth = () => new Date().toISOString().slice(0, 7);
const emptyForm = (): TransactionForm => ({
  descricao: '',
  valor: '',
  categoria: defaultCategories.find(category => category.tipo === 'SAIDA')?.nome || '',
  fornecedor: '',
  data_pagamento: new Date().toISOString().slice(0, 10),
  status: 'PAGO'
});

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');

export const FinancialDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>(defaultCategories);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [commissionTotal, setCommissionTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');

    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('financial_transactions');
      setTransactions(saved ? JSON.parse(saved) : []);
      setCategories(defaultCategories);
      setCommissionTotal(0);
      setIsLoading(false);
      return;
    }

    const [transactionsResult, categoriesResult, payrollResult] = await Promise.all([
      supabase.from('transacoes').select('*').order('data_pagamento', { ascending: false }),
      supabase.from('categorias_despesas').select('nome, tipo').order('nome'),
      supabase.from('payroll').select('total_comissoes').eq('mes_referencia', selectedMonth)
    ]);

    if (transactionsResult.error) {
      setErrorMessage('Não foi possível carregar os lançamentos financeiros.');
    } else {
      setTransactions((transactionsResult.data || []) as Transaction[]);
    }
    if (!categoriesResult.error && categoriesResult.data?.length) {
      setCategories(categoriesResult.data as ExpenseCategory[]);
    }
    if (!payrollResult.error) {
      setCommissionTotal((payrollResult.data || []).reduce((total, row) => total + Number(row.total_comissoes || 0), 0));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [selectedMonth]);

  const filteredTransactions = useMemo(() => transactions.filter(transaction => {
    const matchesMonth = transaction.data_pagamento.slice(0, 7) === selectedMonth;
    const matchesCategory = selectedCategory === 'TODAS' || transaction.categoria === selectedCategory;
    return matchesMonth && matchesCategory;
  }), [transactions, selectedMonth, selectedCategory]);

  const totals = useMemo(() => filteredTransactions.reduce((summary, transaction) => {
    if (transaction.status !== 'PAGO') return summary;
    if (transaction.tipo === 'ENTRADA') summary.entries += Number(transaction.valor);
    else summary.expenses += Number(transaction.valor);
    return summary;
  }, { entries: 0, expenses: 0 }), [filteredTransactions]);

  const openNewExpense = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setForm({
      descricao: transaction.descricao,
      valor: String(transaction.valor),
      categoria: transaction.categoria,
      fornecedor: transaction.fornecedor || '',
      data_pagamento: transaction.data_pagamento,
      status: transaction.status
    });
    setIsModalOpen(true);
  };

  const updateForm = (field: keyof TransactionForm, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const handleSalvar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(form.valor.replace(',', '.'));
    if (isSaving) return;
    if (!form.descricao.trim() || !form.categoria || value <= 0 || !form.data_pagamento) {
      setErrorMessage('Preencha descrição, valor, categoria e data para salvar a despesa.');
      return;
    }

    const payload = {
      tipo: 'SAIDA' as const,
      descricao: form.descricao.trim(),
      valor: value,
      categoria: form.categoria,
      fornecedor: form.fornecedor.trim() || null,
      data_pagamento: form.data_pagamento,
      status: form.status,
      profissional_id: null
    };

    setIsSaving(true);
    setErrorMessage('');

    try {
      console.info('[Financeiro] Iniciando salvamento da transação.', {
        editingId,
        payload,
        supabaseConfigured: isSupabaseConfigured,
        hasSupabaseUrl: supabaseEnvironment.hasUrl,
        hasSupabaseAnonKey: supabaseEnvironment.hasAnonKey
      });

      if (!supabaseEnvironment.hasUrl || !supabaseEnvironment.hasAnonKey) {
        throw new Error('Variáveis do Supabase ausentes. Configure VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      }

      if (!supabase) {
        throw new Error('Cliente Supabase não foi inicializado. Verifique as variáveis de ambiente e reinicie o servidor Vite.');
      }

      const result = editingId
        ? await supabase.from('transacoes').update(payload).eq('id', editingId)
        : await supabase.from('transacoes').insert(payload);

      if (result.error) {
        console.error('[Financeiro] Supabase retornou erro ao salvar transação.', {
          error: result.error,
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          payload
        });
        setErrorMessage(`Não foi possível salvar a despesa: ${result.error.message}`);
        return;
      }

      console.info('[Financeiro] Transação salva com sucesso.', { data: result.data });
      await loadData();

      setIsModalOpen(false);
      setEditingId(null);
      setForm(emptyForm());
    } catch (error) {
      console.error('[Financeiro] Erro inesperado ao salvar transação.', {
        error,
        payload,
        supabaseEnvironment: {
          hasUrl: supabaseEnvironment.hasUrl,
          hasAnonKey: supabaseEnvironment.hasAnonKey
        }
      });
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado ao salvar a despesa.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTransaction = async (transaction: Transaction) => {
    if (!window.confirm(`Excluir o lançamento "${transaction.descricao}"?`)) return;
    if (!isSupabaseConfigured || !supabase) {
      const next = transactions.filter(item => item.id !== transaction.id);
      setTransactions(next);
      localStorage.setItem('financial_transactions', JSON.stringify(next));
    } else {
      const result = await supabase.from('transacoes').delete().eq('id', transaction.id);
      if (result.error) {
        setErrorMessage('Não foi possível excluir o lançamento.');
        return;
      }
      setTransactions(current => current.filter(item => item.id !== transaction.id));
    }
  };

  return (
    <section className="space-y-6 pb-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Controle de caixa</p>
          <h2 className="mt-1 text-2xl font-extrabold text-white">Painel Financeiro</h2>
          <p className="mt-1 text-sm text-zinc-400">Acompanhe entradas, despesas e o saldo do salão.</p>
        </div>
        <button type="button" onClick={openNewExpense} className="rose-gradient-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg">
          <Plus className="h-4 w-4" /> Nova Despesa
        </button>
      </div>

      {errorMessage && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Entradas" value={totals.entries} icon={<ArrowUpCircle />} color="text-emerald-400" />
        <SummaryCard label="Total Saídas / Despesas" value={totals.expenses} icon={<ArrowDownCircle />} color="text-rose-400" />
        <SummaryCard label="Lucro Líquido" value={totals.entries - totals.expenses} icon={<WalletCards />} color={totals.entries - totals.expenses >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
        <SummaryCard label="Total de Comissões" value={commissionTotal} icon={<DollarSign />} color="text-amber-400" />
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl">
        <div className="mb-5 flex flex-col gap-3 border-b border-zinc-800 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><Filter className="h-4 w-4 text-rose-400" /> Lançamentos do período</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-400"><CalendarDays className="h-4 w-4" /><input type="month" value={selectedMonth} onChange={event => setSelectedMonth(event.target.value)} className="border-0 bg-transparent p-0 text-xs text-white focus:ring-0" /></label>
            <select value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)} className="rounded-xl px-3 py-2 text-xs">
              <option value="TODAS">Todas as categorias</option>
              {categories.map(category => <option key={category.nome} value={category.nome}>{category.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-zinc-500"><tr className="border-b border-zinc-800"><th className="px-3 py-3">Data</th><th className="px-3 py-3">Descrição</th><th className="px-3 py-3">Categoria</th><th className="px-3 py-3">Tipo</th><th className="px-3 py-3 text-right">Valor</th><th className="px-3 py-3 text-right">Ações</th></tr></thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoading ? <tr><td colSpan={6} className="px-3 py-10 text-center text-zinc-500">Carregando lançamentos...</td></tr> : filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="text-zinc-300 transition hover:bg-zinc-800/40">
                  <td className="px-3 py-4 text-xs text-zinc-400">{dateLabel(transaction.data_pagamento)}</td>
                  <td className="px-3 py-4 font-semibold text-white">{transaction.descricao}{transaction.fornecedor && <span className="block text-xs font-normal text-zinc-500">{transaction.fornecedor}</span>}</td>
                  <td className="px-3 py-4 text-xs">{transaction.categoria}</td>
                  <td className="px-3 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${transaction.tipo === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{transaction.tipo === 'ENTRADA' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}{transaction.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}</span></td>
                  <td className={`px-3 py-4 text-right font-bold ${transaction.tipo === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'}`}>{transaction.tipo === 'ENTRADA' ? '+' : '-'} {money(Number(transaction.valor))}</td>
                  <td className="px-3 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(transaction)} title="Editar lançamento" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => void deleteTransaction(transaction)} title="Excluir lançamento" className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t border-zinc-700 text-sm font-bold"><td colSpan={4} className="px-3 py-4 text-zinc-400">Saldo do período</td><td className={`px-3 py-4 text-right ${totals.entries - totals.expenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{money(totals.entries - totals.expenses)}</td><td /></tr></tfoot>
          </table>
          {!isLoading && filteredTransactions.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">Nenhum lançamento encontrado para os filtros selecionados.</p>}
        </div>
      </div>

      {isModalOpen && <ExpenseModal editing={Boolean(editingId)} isSaving={isSaving} form={form} categories={categories.filter(category => category.tipo === 'SAIDA')} onChange={updateForm} onClose={() => !isSaving && setIsModalOpen(false)} onSubmit={handleSalvar} />}
    </section>
  );
};

const SummaryCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 ${color}`}>{React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5' })}</div><p className="text-xs font-medium text-zinc-500">{label}</p><p className={`mt-1 text-xl font-extrabold ${color}`}>{money(value)}</p></div>
);

const ExpenseModal: React.FC<{ editing: boolean; isSaving: boolean; form: TransactionForm; categories: ExpenseCategory[]; onChange: (field: keyof TransactionForm, value: string) => void; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }> = ({ editing, isSaving, form, categories, onChange, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between"><div><h3 className="text-xl font-bold text-white">{editing ? 'Editar despesa' : 'Nova despesa'}</h3><p className="mt-1 text-xs text-zinc-500">Registre o gasto para manter o caixa atualizado.</p></div><button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"><X className="h-5 w-5" /></button></div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input required value={form.descricao} onChange={event => onChange('descricao', event.target.value)} placeholder="Descrição da despesa" className="w-full rounded-xl px-3 py-3 text-sm" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><input required min="0.01" step="0.01" type="number" value={form.valor} onChange={event => onChange('valor', event.target.value)} placeholder="Valor (R$)" className="w-full rounded-xl px-3 py-3 text-sm" /><select value={form.categoria} onChange={event => onChange('categoria', event.target.value)} className="w-full rounded-xl px-3 py-3 text-sm">{categories.map(category => <option key={category.nome} value={category.nome}>{category.nome}</option>)}</select></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><input value={form.fornecedor} onChange={event => onChange('fornecedor', event.target.value)} placeholder="Fornecedor (opcional)" className="w-full rounded-xl px-3 py-3 text-sm" /><input required type="date" value={form.data_pagamento} onChange={event => onChange('data_pagamento', event.target.value)} className="w-full rounded-xl px-3 py-3 text-sm" /></div>
        <select value={form.status} onChange={event => onChange('status', event.target.value as TransactionStatus)} className="w-full rounded-xl px-3 py-3 text-sm"><option value="PAGO">Pago</option><option value="PENDENTE">Pendente</option></select>
        <button type="submit" disabled={isSaving} className="rose-gradient-btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"><Check className="h-4 w-4" /> {isSaving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar despesa'}</button>
      </form>
    </div>
  </div>
);
