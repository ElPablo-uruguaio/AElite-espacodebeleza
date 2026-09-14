import React, { useState } from 'react';
import { ShieldAlert, Trash2, Plus } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const StealthBlockManager: React.FC = () => {
  const { blockedClients, addBlockedClient, removeBlockedClient } = useSalon();
  const [newPhone, setNewPhone] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [silentBlockEnabled, setSilentBlockEnabled] = useState(true);

  const handleAddBlock = () => {
    if (!silentBlockEnabled || (!newPhone && !newCpf)) return;
    const newBlock = {
      cliente_phone: newPhone,
      cliente_cpf: newCpf,
      cliente_nome: 'Desconhecido',
      motivo: 'Bloqueio silencioso',
    };
    addBlockedClient(newBlock);
    setNewPhone('');
    setNewCpf('');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-6 border-b border-zinc-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Stealth Block (Bloqueio Discreto)</h2>
          <p className="text-xs text-zinc-400">Clientes bloqueados verão que não há horários disponíveis, sem serem notificados.</p>
        </div>
      </div>
      
      <div className="grid gap-2 mb-6 sm:grid-cols-[1fr_1fr_auto]">
        <input 
          type="text" 
          value={newPhone} 
          onChange={e => setNewPhone(e.target.value)}
          placeholder="Telefone (ex: 11999999999)" 
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white" 
        />
        <input
          type="text"
          value={newCpf}
          onChange={e => setNewCpf(e.target.value)}
          placeholder="CPF (opcional)"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white"
        />
        <label className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 whitespace-nowrap">
          <input
            type="checkbox"
            checked={silentBlockEnabled}
            onChange={e => setSilentBlockEnabled(e.target.checked)}
            className="accent-red-600"
          />
          Bloqueio Silencioso
        </label>
        <button 
          onClick={handleAddBlock}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-1 font-bold text-sm sm:col-start-3"
        >
          <Plus className="w-4 h-4"/> Bloquear
        </button>
      </div>

      <div className="space-y-2">
        {blockedClients.map(b => (
          <div key={b.id} className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div>
              <p className="text-sm font-bold text-white">{b.cliente_nome} <span className="text-zinc-500 text-xs font-normal">({b.cliente_phone || b.cliente_cpf})</span></p>
              <p className="text-xs text-zinc-500">{b.motivo} {b.cliente_cpf && `• CPF: ${b.cliente_cpf}`}</p>
            </div>
            <button onClick={() => removeBlockedClient(b.id)} className="text-zinc-500 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
