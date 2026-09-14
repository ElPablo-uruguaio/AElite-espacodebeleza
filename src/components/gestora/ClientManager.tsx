import React, { useRef, useState } from 'react';
import { Cake, FileUp, MessageCircle, Plus, Users } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { Client } from '../../types';
import { createWhatsAppBirthdayLink } from '../../utils/whatsapp';

interface ImportedClient {
  nome: string;
  cpf?: string;
  telefone: string;
  data_nascimento?: string;
}

const normalizeDate = (value: unknown): string | undefined => {
  if (!value) return undefined;
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : undefined;
};

const readImportedClients = (text: string, fileName: string): ImportedClient[] => {
  if (fileName.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : parsed.clientes || parsed.clients || parsed.data || [];
    return rows.map((row: Record<string, unknown>) => ({
      nome: String(row.nome ?? row.name ?? row.cliente_nome ?? '').trim(),
      cpf: String(row.cpf ?? row.CPF ?? '').trim() || undefined,
      telefone: String(row.telefone ?? row.phone ?? row.cliente_phone ?? '').trim(),
      data_nascimento: normalizeDate(row.data_nascimento ?? row.nascimento ?? row.birthDate ?? row.birth_date)
    })).filter((client: ImportedClient) => client.nome && client.telefone);
  }

  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(header => header.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''));
  const findIndex = (names: string[]) => headers.findIndex(header => names.includes(header));
  const nameIndex = findIndex(['nome', 'name', 'clientenome', 'cliente']);
  const cpfIndex = findIndex(['cpf', 'documento']);
  const phoneIndex = findIndex(['telefone', 'phone', 'celular', 'whatsapp', 'clientephone']);
  const birthIndex = findIndex(['datanascimento', 'nascimento', 'birthdate', 'birth_date']);
  return lines.slice(1).map(line => {
    const values = line.split(delimiter).map(value => value.trim().replace(/^"|"$/g, ''));
    return {
      nome: values[nameIndex] || '',
      cpf: values[cpfIndex] || undefined,
      telefone: values[phoneIndex] || '',
      data_nascimento: normalizeDate(values[birthIndex])
    };
  }).filter(client => client.nome && client.telefone);
};

export const ClientManager: React.FC = () => {
  const { clients, upsertClient, importClients, checkBirthdayClients, sendPushNotification, settings } = useSalon();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthdaySent, setBirthdaySent] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const birthdayClients = checkBirthdayClients();

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    upsertClient({ nome: name.trim(), cpf: cpf.trim() || undefined, telefone: phone.trim(), data_nascimento: birthDate || undefined });
    setName(''); setCpf(''); setPhone(''); setBirthDate('');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = readImportedClients(text, file.name);
      const count = importClients(imported);
      setImportMessage(`${count} cliente(s) importado(s) com sucesso.`);
    } catch {
      setImportMessage('Não foi possível ler o arquivo. Use CSV com cabeçalho ou JSON válido.');
    }
    event.target.value = '';
  };

  const sendBirthdayNotifications = async () => {
    if (birthdayClients.length === 0) return;
    await sendPushNotification('Aniversariantes do dia', `${birthdayClients.length} cliente(s) fazem aniversário hoje.`,);
    setBirthdaySent(true);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-rose-400" /> Gestão de Clientes</h2><p className="text-xs text-zinc-400 mt-1">Cadastre, importe e acompanhe os dados de contato das clientes.</p></div>
        <label className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"><FileUp className="w-4 h-4" /> Importar Clientes (Trinks / CSV / JSON)<input ref={fileRef} type="file" accept=".csv,.json,application/json,text/csv" onChange={handleImport} className="hidden" /></label>
      </header>

      {importMessage && <p className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-xl px-4 py-3">{importMessage}</p>}

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo *" className="field" required />
        <input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="CPF" className="field" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone *" className="field" required />
        <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="field" />
        <button className="action-btn"><Plus className="w-4 h-4" /> Cadastrar</button>
      </form>

      <section className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-amber-300 flex items-center gap-2"><Cake className="w-4 h-4" /> Aniversariantes de hoje</h3><p className="text-xs text-amber-200/70 mt-1">{birthdayClients.length ? birthdayClients.map(client => client.nome).join(', ') : 'Nenhuma cliente aniversariante hoje.'}</p></div>{birthdayClients.length > 0 && <button onClick={sendBirthdayNotifications} className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2"><MessageCircle className="w-4 h-4" /> {birthdaySent ? 'Notificação enviada' : 'Enviar parabéns'}</button>}</div>
          {birthdayClients.length > 0 && <div className="mt-3 space-y-2">{birthdayClients.map(client => <a key={client.id} href={createWhatsAppBirthdayLink(client.telefone, client.nome, settings.nome_salao)} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-zinc-950/50 rounded-lg px-3 py-2 text-xs text-emerald-300"><span>{client.nome} • {client.telefone}</span><MessageCircle className="w-4 h-4" /></a>)}</div>}
      </section>

      <div className="space-y-2"><p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Clientes cadastrados ({clients.length})</p>{clients.length === 0 ? <p className="text-sm text-zinc-500 py-6 text-center">Nenhum cliente cadastrado.</p> : clients.map((client: Client) => <div key={client.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><p className="text-sm font-bold text-white">{client.nome}</p><p className="text-xs text-zinc-400">{client.telefone} {client.cpf && `• CPF: ${client.cpf}`}</p></div><span className="text-xs text-zinc-500">{client.data_nascimento ? new Date(`${client.data_nascimento}T12:00:00`).toLocaleDateString() : 'Nascimento não informado'}</span></div>)}</div>
    </div>
  );
};
