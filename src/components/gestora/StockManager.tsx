import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, Trash2, Edit3, Link2, CheckCircle2, DollarSign } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const StockManager: React.FC = () => {
  const { estoque, addEstoqueItem, updateEstoqueItem, deleteEstoqueItem, services, servicoProdutos, linkProdutoAoServico, removeProdutoDoServico } = useSalon();

  const [activeTab, setActiveTab] = useState<'produtos' | 'vinculos'>('produtos');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product state
  const [nomeProduto, setNomeProduto] = useState('');
  const [qtdAtual, setQtdAtual] = useState(1000);
  const [qtdMin, setQtdMin] = useState(200);
  const [unidade, setUnidade] = useState('ml');
  const [custo, setCusto] = useState(0.10);

  // Linking state
  const [selectedServico, setSelectedServico] = useState(services[0]?.id || '');
  const [selectedProduto, setSelectedProduto] = useState(estoque[0]?.id || '');
  const [qtdConsumida, setQtdConsumida] = useState(50);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeProduto.trim()) return;

    addEstoqueItem({
      nome_produto: nomeProduto,
      quantidade_atual: Number(qtdAtual),
      quantidade_minima: Number(qtdMin),
      unidade_medida: unidade,
      custo_unitario: Number(custo),
      ativo: true
    });

    setNomeProduto('');
    setShowAddModal(false);
  };

  const handleLinkProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServico || !selectedProduto) return;

    linkProdutoAoServico(selectedServico, selectedProduto, Number(qtdConsumida));
  };

  const lowStockItems = estoque.filter(item => item.quantidade_atual <= item.quantidade_minima);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Controle de Estoque & Consumo por Serviço
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cadastre insumos, defina estoque mínimo e dê baixa automática a cada atendimento no PDV.
          </p>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'produtos' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Produtos do Estoque
          </button>
          <button
            onClick={() => setActiveTab('vinculos')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'vinculos' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Vincular Consumo por Serviço
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-2xl mb-6 text-xs text-rose-300 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-200">Atenção: {lowStockItems.length} produto(s) com estoque crítico!</p>
            <p className="text-rose-300/80 mt-0.5">
              {lowStockItems.map(i => `${i.nome_produto} (${i.quantidade_atual} ${i.unidade_medida})`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: Products */}
      {activeTab === 'produtos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estoque.map(item => {
              const isLow = item.quantidade_atual <= item.quantidade_minima;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                    isLow ? 'bg-rose-950/20 border-rose-500/40' : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {item.nome_produto}
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Custo unitário: R$ {item.custo_unitario.toFixed(2)} / {item.unidade_medida}
                      </p>
                    </div>

                    <button onClick={() => deleteEstoqueItem(item.id)} className="text-zinc-500 hover:text-rose-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-zinc-900/80 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-zinc-400 text-[10px] uppercase font-bold block">Estoque Atual</span>
                      <span className={`text-lg font-extrabold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.quantidade_atual} {item.unidade_medida}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold block">Mínimo</span>
                      <span className="text-xs font-bold text-zinc-300">
                        {item.quantidade_minima} {item.unidade_medida}
                      </span>
                    </div>
                  </div>

                  {/* Quick Quantity Adjustment */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => updateEstoqueItem(item.id, { quantidade_atual: Math.max(0, item.quantidade_atual - 50) })}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-bold py-1.5 rounded-lg border border-zinc-800"
                    >
                      -50
                    </button>
                    <button
                      onClick={() => updateEstoqueItem(item.id, { quantidade_atual: item.quantidade_atual + 500 })}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 text-[11px] font-bold py-1.5 rounded-lg border border-zinc-800"
                    >
                      +500 Reposição
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Consumption Links */}
      {activeTab === 'vinculos' && (
        <div className="space-y-6">
          <form onSubmit={handleLinkProduct} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-amber-400" /> Vincular Consumo de Insumo ao Serviço
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Serviço *</label>
                <select
                  value={selectedServico}
                  onChange={(e) => setSelectedServico(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {services.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Produto Consumido *</label>
                <select
                  value={selectedProduto}
                  onChange={(e) => setSelectedProduto(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {estoque.map(p => <option key={p.id} value={p.id}>{p.nome_produto} ({p.unidade_medida})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Quantidade Consumida *</label>
                <input
                  type="number"
                  step="0.01"
                  value={qtdConsumida}
                  onChange={(e) => setQtdConsumida(Number(e.target.value))}
                  placeholder="Ex: 80"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow"
            >
              Vincular Insumo ao Serviço
            </button>
          </form>

          {/* Linked List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Vínculos de Consumo Ativos</h4>
            {servicoProdutos.map(sp => {
              const srv = services.find(s => s.id === sp.servico_id);
              const prod = estoque.find(p => p.id === sp.produto_id);

              return (
                <div key={sp.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{srv?.nome}</span>
                    <span className="text-zinc-500 mx-2">→</span>
                    <span className="text-amber-400 font-semibold">{sp.quantidade_consumida} {prod?.unidade_medida}</span> de <span className="text-zinc-300">{prod?.nome_produto}</span>
                  </div>
                  <button onClick={() => removeProdutoDoServico(sp.id)} className="text-rose-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">✕</button>

            <h4 className="text-lg font-bold text-white mb-4">Novo Produto no Estoque</h4>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome do Produto / Insumo *</label>
                <input
                  type="text"
                  value={nomeProduto}
                  onChange={(e) => setNomeProduto(e.target.value)}
                  placeholder="Ex: Shampoo Nutritivo Luxe 1L"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Quantidade Inicial *</label>
                  <input
                    type="number"
                    value={qtdAtual}
                    onChange={(e) => setQtdAtual(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Estoque Mínimo *</label>
                  <input
                    type="number"
                    value={qtdMin}
                    onChange={(e) => setQtdMin(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Unidade de Medida *</label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  >
                    <option value="ml">ml (mililitros)</option>
                    <option value="g">g (gramas)</option>
                    <option value="unidade">unidade</option>
                    <option value="frasco">frasco</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Custo Unitário R$</label>
                  <input
                    type="number"
                    step="0.01"
                    value={custo}
                    onChange={(e) => setCusto(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg"
              >
                Salvar Produto no Estoque
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
