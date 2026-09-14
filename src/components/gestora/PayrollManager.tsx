import React, { useState } from 'react';
import { Users, DollarSign, Plus, CheckCircle2, Percent, Trash2 } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { RecurringDiscountFrequency } from '../../types';

export const PayrollManager: React.FC = () => {
  const { employees, services, appointments, payroll, commissionRules, recurringDiscounts, payrollAdvances, addEmployee, registerCommissionPayout, upsertCommissionRule, addRecurringDiscount, removeRecurringDiscount, addPayrollAdvance, calculatePayroll } = useSalon();

  const [showAddModal, setShowAddModal] = useState(false);
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [comissao, setComissao] = useState(45.0);
  const [fotoUrl, setFotoUrl] = useState('');
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [ruleServiceId, setRuleServiceId] = useState(services[0]?.id || '');
  const [rulePercentage, setRulePercentage] = useState(45);
  const [discountDescription, setDiscountDescription] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountFrequency, setDiscountFrequency] = useState<RecurringDiscountFrequency>('mensal');
  const [advanceValue, setAdvanceValue] = useState(0);
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [advanceNote, setAdvanceNote] = useState('');

  const currentMonthStr = period;
  const [periodYear, periodMonth] = period.split('-').map(Number);
  const periodStart = `${period}-01`;
  const periodEnd = new Date(periodYear, periodMonth, 0).toISOString().slice(0, 10);
  const selectedSummary = calculatePayroll(selectedEmployeeId, periodStart, periodEnd);

  const addRule = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedEmployeeId && ruleServiceId) upsertCommissionRule({ employee_id: selectedEmployeeId, servico_id: ruleServiceId, percentual: Number(rulePercentage) });
  };
  const addDiscount = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedEmployeeId || !discountDescription.trim() || discountValue <= 0) return;
    addRecurringDiscount({ employee_id: selectedEmployeeId, descricao: discountDescription, valor: Number(discountValue), frequencia: discountFrequency, ativo: true });
    setDiscountDescription(''); setDiscountValue(0);
  };
  const addAdvance = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedEmployeeId || advanceValue <= 0) return;
    addPayrollAdvance({ employee_id: selectedEmployeeId, valor: Number(advanceValue), data: advanceDate, observacao: advanceNote });
    setAdvanceValue(0); setAdvanceNote('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !especialidade.trim()) return;

    addEmployee({
      nome,
      especialidade,
      comissao_percentual: Number(comissao),
      foto_url: fotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      ativo: true
    });

    setNome('');
    setEspecialidade('');
    setFotoUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-400" />
            Folha de Pagamento & Comissões da Equipe
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cálculo automático de comissões, vales e descontos no período selecionado.
          </p>
        </div>

        <div className="flex items-center gap-2">
        <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
        <button
          onClick={() => setShowAddModal(true)}
          className="rose-gradient-btn text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Colaborador</span>
        </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Summary label="Total Bruto de Comissões" value={selectedSummary.total_bruto} color="text-emerald-400" />
        <Summary label="Vales / Adiantamentos" value={selectedSummary.total_vales} color="text-amber-400" />
        <Summary label="Descontos Recorrentes" value={selectedSummary.total_descontos} color="text-orange-400" />
        <Summary label="Valor Líquido a Pagar" value={selectedSummary.valor_liquido} color="text-white" />
      </div>
      <p className="text-xs text-zinc-500 mb-5">{selectedSummary.atendimentos} atendimentos concluídos • {money(selectedSummary.total_bruto)} bruto - {money(selectedSummary.total_vales)} vales - {money(selectedSummary.total_descontos)} descontos = <strong className="text-white">{money(selectedSummary.valor_liquido)} líquido</strong></p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <form onSubmit={addRule} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2"><Percent className="w-4 h-4 text-rose-400" /> Comissão por serviço</h4>
          <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="field">{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}</select>
          <select value={ruleServiceId} onChange={e => setRuleServiceId(e.target.value)} className="field">{services.map(service => <option key={service.id} value={service.id}>{service.nome}</option>)}</select>
          <input type="number" min="0" max="100" step="0.5" value={rulePercentage} onChange={e => setRulePercentage(Number(e.target.value))} className="field" placeholder="Percentual" />
          <button className="action-btn">Salvar percentual</button>
          {commissionRules.filter(rule => rule.employee_id === selectedEmployeeId).map(rule => <p key={rule.id} className="text-[11px] text-zinc-400">{services.find(service => service.id === rule.servico_id)?.nome}: <strong className="text-white">{rule.percentual}%</strong></p>)}
        </form>
        <form onSubmit={addDiscount} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-white">Desconto recorrente</h4>
          <input value={discountDescription} onChange={e => setDiscountDescription(e.target.value)} placeholder="Descrição" className="field" />
          <input type="number" min="0" step="0.01" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} placeholder="Valor" className="field" />
          <select value={discountFrequency} onChange={e => setDiscountFrequency(e.target.value as RecurringDiscountFrequency)} className="field"><option value="diario">Diário</option><option value="semanal">Semanal</option><option value="quinzenal">Quinzenal</option><option value="mensal">Mensal</option></select>
          <button className="action-btn">Lançar desconto</button>
          {recurringDiscounts.filter(discount => discount.employee_id === selectedEmployeeId).map(discount => <div key={discount.id} className="flex justify-between text-[11px] text-zinc-400"><span>{discount.descricao} ({discount.frequencia}) - {money(discount.valor)}</span><button type="button" onClick={() => removeRecurringDiscount(discount.id)} className="text-red-400"><Trash2 className="w-3.5 h-3.5" /></button></div>)}
        </form>
        <form onSubmit={addAdvance} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-white">Vale / Adiantamento</h4>
          <input type="number" min="0" step="0.01" value={advanceValue} onChange={e => setAdvanceValue(Number(e.target.value))} placeholder="Valor" className="field" />
          <input type="date" value={advanceDate} onChange={e => setAdvanceDate(e.target.value)} className="field" />
          <input value={advanceNote} onChange={e => setAdvanceNote(e.target.value)} placeholder="Observação" className="field" />
          <button className="action-btn">Registrar vale</button>
          {payrollAdvances.filter(advance => advance.employee_id === selectedEmployeeId && advance.status === 'pendente').map(advance => <p key={advance.id} className="text-[11px] text-zinc-400">{money(advance.valor)} em {advance.data} {advance.observacao && `- ${advance.observacao}`}</p>)}
        </form>
      </div>

      {/* Employees Commission Summary Table */}
      <div className="space-y-4">
        {employees.map((emp) => {
          // Calculate total completed revenue for this employee
          const completedApps = appointments.filter(a => a.profissional_id === emp.id && a.status === 'concluido' && a.data_hora.slice(0, 7) === currentMonthStr);
          const totalRevenue = completedApps.reduce((acc, a) => acc + a.valor_total, 0);
          const comissaoAcumulada = calculatePayroll(emp.id, periodStart, periodEnd).valor_liquido;

          // Check if paid for current month
          const isPaidThisMonth = payroll.some(p => p.employee_id === emp.id && p.mes_referencia === currentMonthStr && p.status_pagamento === 'pago');

          return (
            <div
              key={emp.id}
              className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={emp.foto_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                  alt={emp.nome}
                  className="w-14 h-14 rounded-2xl object-cover border border-zinc-700"
                />
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {emp.nome}
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Percent className="w-3 h-3" /> {emp.comissao_percentual}% Comissão
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400">{emp.especialidade}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                    Atendimentos concluídos: <strong className="text-zinc-300">{completedApps.length}</strong> | Faturamento total gerado: <strong className="text-white">R$ {totalRevenue.toFixed(2)}</strong>
                  </p>
                </div>
              </div>

              {/* Commission & Action */}
              <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                <div>
                  <p className="text-[11px] text-zinc-400 font-semibold uppercase">Líquido a Pagar</p>
                  <p className="text-xl font-extrabold text-emerald-400">
                    R$ {comissaoAcumulada.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                {isPaidThisMonth ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Pago ({currentMonthStr})
                  </span>
                ) : (
                  <button
                    onClick={() => registerCommissionPayout(emp.id, currentMonthStr)}
                    disabled={comissaoAcumulada <= 0}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow disabled:opacity-40"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Registrar Pagamento</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <h4 className="text-lg font-bold text-white mb-4">Novo Colaborador da Equipe</h4>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Beatriz Lima"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Especialidade / Cargo *</label>
                <input
                  type="text"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  placeholder="Ex: Designer de Cílios & Sobrancelhas"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">% de Comissão Padrão *</label>
                <input
                  type="number"
                  step="0.5"
                  value={comissao}
                  onChange={(e) => setComissao(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">URL da Foto de Perfil</label>
                <input
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rose-gradient-btn text-white font-bold py-3 rounded-xl text-xs shadow-lg"
              >
                Cadastrar Colaborador
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const money = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

const Summary: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
    <p className="text-[10px] uppercase font-bold text-zinc-500">{label}</p>
    <p className={`text-xl font-extrabold mt-1 ${color}`}>{money(value)}</p>
  </div>
);
