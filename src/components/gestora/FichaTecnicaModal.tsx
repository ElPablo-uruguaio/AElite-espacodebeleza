import React, { useState, useEffect } from 'react';
import { X, FileText, Save, CheckCircle2, AlertTriangle, User, Phone, Sparkles } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

interface FichaTecnicaModalProps {
  clienteNome: string;
  clientePhone: string;
  onClose: () => void;
}

export const FichaTecnicaModal: React.FC<FichaTecnicaModalProps> = ({
  clienteNome,
  clientePhone,
  onClose
}) => {
  const { getFichaTecnicaByPhone, saveFichaTecnica } = useSalon();

  const [historicoQuimico, setHistoricoQuimico] = useState('');
  const [formulasTinturas, setFormulasTinturas] = useState('');
  const [alergias, setAlergias] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const existing = getFichaTecnicaByPhone(clientePhone);
    if (existing) {
      setHistoricoQuimico(existing.historico_quimico || '');
      setFormulasTinturas(existing.formulas_tinturas || '');
      setAlergias(existing.alergias || '');
      setObservacoes(existing.observacoes || '');
    }
  }, [clientePhone, getFichaTecnicaByPhone]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFichaTecnica({
      cliente_nome: clienteNome,
      cliente_phone: clientePhone,
      historico_quimico: historicoQuimico,
      formulas_tinturas: formulasTinturas,
      alergias,
      observacoes
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ficha Técnica / Anamnese da Cliente</h3>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span>Cliente: <strong className="text-white">{clienteNome}</strong></span>
                <span>•</span>
                <span>WhatsApp: <strong className="text-amber-400">{clientePhone}</strong></span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Histórico Químico */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Histórico Químico Capilar & Tratamentos Anteriores
            </label>
            <textarea
              rows={3}
              value={historicoQuimico}
              onChange={(e) => setHistoricoQuimico(e.target.value)}
              placeholder="Ex: Alisamento ácido há 3 meses, descoloração prévia com fundo de clareamento 8..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-light"
            />
          </div>

          {/* Fórmulas de Tinturas e Colorações */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              Fórmulas de Tinturas & Matizações Usadas
            </label>
            <textarea
              rows={3}
              value={formulasTinturas}
              onChange={(e) => setFormulasTinturas(e.target.value)}
              placeholder="Ex: Mechas: Pó descolorante 1:1.5 + OX 20Vol. Tonalização: 9.89 Illumina (30g) + 9.1 (10g) + Emulsão 1.9%..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-light"
            />
          </div>

          {/* Alergias & Restrições */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Alergias, Sensibilidades & Restrições
            </label>
            <input
              type="text"
              value={alergias}
              onChange={(e) => setAlergias(e.target.value)}
              placeholder="Ex: Alergia a PPD, sensibilidade ao calor do secador, gestante no 2º trimestre..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Observações Gerais */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Observações Gerais & Preferências
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Prefere café sem açúcar, corte repicado nas pontas mantendo o comprimento..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-light"
            />
          </div>

          {savedSuccess && (
            <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Ficha Técnica / Anamnese salva com sucesso!
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-5 py-3 rounded-xl transition"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center space-x-1.5 shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Ficha Técnica</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
