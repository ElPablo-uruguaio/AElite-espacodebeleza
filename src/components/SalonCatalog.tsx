import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar_url: string;
}

export interface Service {
  id: string;
  category: string;
  name: string;
  duration: string;
  description?: string;
  price: number;
  is_starting_price?: boolean;
  assignedCollaboratorIds: string[];
}

const fallbackImage =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';

const emptyServiceForm = {
  name: '',
  category: 'Mãos e Pés',
  duration: '1h',
  price: '',
  description: '',
  is_starting_price: false,
  assignedCollaboratorIds: [] as string[]
};

export const SalonSystemSupabase: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollaboratorFilter, setSelectedCollaboratorFilter] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [staffForm, setStaffForm] = useState({ name: '', role: '' });
  const [editingCollaboratorNames, setEditingCollaboratorNames] = useState<Record<string, string>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Mãos e Pés': true,
    'Coloração / Descoloração': true,
    'Cabelos & Tratamentos': false,
    'Microblading & Sobrancelhas': false
  });

  const fetchSalonData = async () => {
    if (!supabase) {
      setError('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar o catálogo.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [
        { data: staffData, error: staffError },
        { data: servicesData, error: servicesError },
        { data: linksData, error: linksError }
      ] = await Promise.all([
        supabase.from('collaborators').select('*').order('name'),
        supabase.from('services').select('*').order('category').order('name'),
        supabase.from('service_collaborators').select('*')
      ]);

      if (staffError) throw new Error(`Erro ao carregar colaboradores: ${staffError.message}`);
      if (servicesError) throw new Error(`Erro ao carregar serviços: ${servicesError.message}`);
      if (linksError) throw new Error(`Erro ao carregar vínculos: ${linksError.message}`);

      const nextCollaborators = (staffData ?? []) as Collaborator[];
      const links = linksData ?? [];
      const nextServices: Service[] = (servicesData ?? []).map(service => ({
        ...service,
        price: Number(service.price),
        assignedCollaboratorIds: links
          .filter(link => link.service_id === service.id)
          .map(link => link.collaborator_id)
      }));

      setCollaborators(nextCollaborators);
      setEditingCollaboratorNames(
        Object.fromEntries(nextCollaborators.map(collaborator => [collaborator.id, collaborator.name]))
      );
      setServices(nextServices);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Erro desconhecido ao carregar o catálogo.';
      setError(message);
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSalonData();
  }, []);

  const handleSaveService = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    const price = Number(serviceForm.price);
    if (!serviceForm.name.trim() || !Number.isFinite(price)) {
      alert('Informe o nome e um preço válido para o serviço.');
      return;
    }

    const payload = {
      name: serviceForm.name.trim(),
      category: serviceForm.category,
      duration: serviceForm.duration,
      price,
      description: serviceForm.description.trim(),
      is_starting_price: serviceForm.is_starting_price
    };

    try {
      let serviceId = editingService?.id;

      if (editingService) {
        const { error: updateError } = await supabase
          .from('services')
          .update(payload)
          .eq('id', editingService.id);
        if (updateError) throw updateError;

        const { error: deleteLinksError } = await supabase
          .from('service_collaborators')
          .delete()
          .eq('service_id', editingService.id);
        if (deleteLinksError) throw deleteLinksError;
      } else {
        const { data, error: insertError } = await supabase
          .from('services')
          .insert(payload)
          .select('id')
          .single();
        if (insertError) throw insertError;
        serviceId = data.id;
      }

      if (serviceId && serviceForm.assignedCollaboratorIds.length > 0) {
        const { error: linksError } = await supabase.from('service_collaborators').insert(
          serviceForm.assignedCollaboratorIds.map(collaboratorId => ({
            service_id: serviceId,
            collaborator_id: collaboratorId
          }))
        );
        if (linksError) throw linksError;
      }

      setIsServiceModalOpen(false);
      setEditingService(null);
      setServiceForm(emptyServiceForm);
      await fetchSalonData();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Erro ao salvar o serviço.';
      alert(`Não foi possível salvar o serviço: ${message}`);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!supabase || !confirm('Deseja excluir este serviço do banco de dados?')) return;

    const { error: deleteError } = await supabase.from('services').delete().eq('id', id);
    if (deleteError) {
      alert(`Não foi possível excluir o serviço: ${deleteError.message}`);
      return;
    }
    await fetchSalonData();
  };

  const handleAddCollaborator = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !staffForm.name.trim()) return;

    const { error: insertError } = await supabase.from('collaborators').insert({
      name: staffForm.name.trim(),
      role: staffForm.role.trim() || 'Especialista',
      avatar_url: fallbackImage
    });

    if (insertError) {
      alert(`Não foi possível salvar o colaborador: ${insertError.message}`);
      return;
    }

    setStaffForm({ name: '', role: '' });
    await fetchSalonData();
  };

  const handleSaveCollaboratorName = async (id: string) => {
    if (!supabase) return;
    const newName = editingCollaboratorNames[id]?.trim();
    if (!newName) {
      alert('O nome do colaborador não pode ficar vazio.');
      return;
    }

    const { error: updateError } = await supabase
      .from('collaborators')
      .update({ name: newName })
      .eq('id', id);

    if (updateError) {
      alert(`Não foi possível atualizar o nome: ${updateError.message}`);
      return;
    }
    await fetchSalonData();
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (!supabase || !confirm('Remover esta profissional do salão?')) return;

    const { error: deleteError } = await supabase.from('collaborators').delete().eq('id', id);
    if (deleteError) {
      alert(`Não foi possível remover o colaborador: ${deleteError.message}`);
      return;
    }
    if (selectedCollaboratorFilter === id) setSelectedCollaboratorFilter(null);
    await fetchSalonData();
  };

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.toLocaleLowerCase().trim();
    return services.filter(service => {
      const matchesSearch =
        service.name.toLocaleLowerCase().includes(normalizedSearch) ||
        (service.description ?? '').toLocaleLowerCase().includes(normalizedSearch);
      const matchesCollaborator =
        !selectedCollaboratorFilter ||
        service.assignedCollaboratorIds.includes(selectedCollaboratorFilter);
      return matchesSearch && matchesCollaborator;
    });
  }, [searchTerm, selectedCollaboratorFilter, services]);

  const groupedCategories = useMemo(() => {
    return filteredServices.reduce<Record<string, Service[]>>((groups, service) => {
      (groups[service.category] ??= []).push(service);
      return groups;
    }, {});
  }, [filteredServices]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-zinc-950 text-pink-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-xs text-zinc-400">Carregando catálogo do Supabase...</span>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md bg-zinc-950 pb-16 font-sans text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <span className="text-xs font-medium text-zinc-400">
          Modo:{' '}
          <strong className={isAdminMode ? 'text-amber-400' : 'text-pink-400'}>
            {isAdminMode ? 'Gerenciamento' : 'Cliente'}
          </strong>
        </span>
        <button
          type="button"
          onClick={() => setIsAdminMode(value => !value)}
          className="rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200"
        >
          {isAdminMode ? 'Ver como Cliente' : 'Gerenciar Salão'}
        </button>
      </div>

      <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
        <img src={fallbackImage} alt="A'Elite Espaço de Beleza" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-flex items-center gap-1 rounded border border-pink-500/30 bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-pink-400">
            <Sparkles className="h-3 w-3" /> Beleza & Estética
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">A&apos;Elite Espaço de Beleza</h1>
          <div className="mt-0.5 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" /> 5.0
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <MapPin className="h-3.5 w-3.5" /> 12.6 km
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <Users className="h-3 w-3" /> Escolher por Profissional
          </p>
          {isAdminMode && (
            <button type="button" onClick={() => setIsStaffModalOpen(true)} className="text-[11px] font-semibold text-pink-400">
              <Plus className="mr-1 inline h-3 w-3" /> Editar Equipe
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedCollaboratorFilter(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              selectedCollaboratorFilter === null ? 'bg-pink-600 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            Todos os Serviços
          </button>
          {collaborators.map(collaborator => (
            <button
              type="button"
              key={collaborator.id}
              onClick={() =>
                setSelectedCollaboratorFilter(current =>
                  current === collaborator.id ? null : collaborator.id
                )
              }
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                selectedCollaboratorFilter === collaborator.id
                  ? 'border-pink-500 bg-pink-600/20 text-pink-300'
                  : 'border-zinc-700/60 bg-zinc-800/80 text-zinc-300'
              }`}
            >
              {collaborator.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Pesquisar serviço..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
          />
        </div>
        {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}
        {isAdminMode && (
          <button
            type="button"
            onClick={() => {
              setEditingService(null);
              setServiceForm({ ...emptyServiceForm, assignedCollaboratorIds: collaborators.map(c => c.id) });
              setIsServiceModalOpen(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 py-2.5 text-xs font-bold text-white"
          >
            <Plus className="h-4 w-4" /> Cadastrar Novo Serviço
          </button>
        )}
      </div>

      <main className="space-y-3 p-4">
        {Object.keys(groupedCategories).length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 py-10 text-center text-sm text-zinc-400">
            Nenhum serviço encontrado.
          </div>
        ) : (
          Object.entries(groupedCategories).map(([category, items]) => {
            const isOpen = searchTerm.trim() ? true : !!openCategories[category];
            return (
              <div key={category} className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40">
                <button
                  type="button"
                  onClick={() => setOpenCategories(current => ({ ...current, [category]: !current[category] }))}
                  className="flex w-full items-center justify-between border-b border-zinc-800/50 bg-zinc-900 px-4 py-3 text-left text-sm font-semibold tracking-wide text-pink-400"
                >
                  <span>{category} <span className="text-xs font-normal text-zinc-500">({items.length})</span></span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                </button>
                {isOpen && (
                  <div className="divide-y divide-zinc-800/40">
                    {items.map(service => (
                      <div key={service.id} className="flex items-start justify-between gap-3 p-3.5">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-zinc-100">{service.name}</h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                            <Clock className="h-3.5 w-3.5" /> {service.duration}
                          </div>
                          {service.description && <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{service.description}</p>}
                          {service.assignedCollaboratorIds.length > 0 && (
                            <p className="mt-2 text-[10px] text-pink-300">
                              {collaborators.filter(c => service.assignedCollaboratorIds.includes(c.id)).map(c => c.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-bold text-white">
                            R$ {service.price.toFixed(2).replace('.', ',')}
                          </span>
                          {isAdminMode ? (
                            <div className="mt-2 flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingService(service);
                                  setServiceForm({
                                    name: service.name,
                                    category: service.category,
                                    duration: service.duration,
                                    price: String(service.price),
                                    description: service.description ?? '',
                                    is_starting_price: !!service.is_starting_price,
                                    assignedCollaboratorIds: service.assignedCollaboratorIds
                                  });
                                  setIsServiceModalOpen(true);
                                }}
                                className="rounded bg-zinc-800 p-1.5 text-amber-400"
                                aria-label={`Editar ${service.name}`}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => void handleDeleteService(service.id)} className="rounded bg-zinc-800 p-1.5 text-rose-400" aria-label={`Excluir ${service.name}`}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="mt-2 block rounded bg-pink-600 px-3 py-1 text-xs font-semibold text-white">
                              Agendar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={event => void handleSaveService(event)} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-white">{editingService ? 'Editar serviço' : 'Novo serviço'}</h2>
              <button type="button" onClick={() => setIsServiceModalOpen(false)} className="text-zinc-400"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input required value={serviceForm.name} onChange={event => setServiceForm(current => ({ ...current, name: event.target.value }))} placeholder="Nome do serviço" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white" />
              <input value={serviceForm.category} onChange={event => setServiceForm(current => ({ ...current, category: event.target.value }))} placeholder="Categoria" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white" />
              <div className="grid grid-cols-2 gap-3">
                <input value={serviceForm.duration} onChange={event => setServiceForm(current => ({ ...current, duration: event.target.value }))} placeholder="Duração" className="rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white" />
                <input required type="number" min="0" step="0.01" value={serviceForm.price} onChange={event => setServiceForm(current => ({ ...current, price: event.target.value }))} placeholder="Preço" className="rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white" />
              </div>
              <textarea value={serviceForm.description} onChange={event => setServiceForm(current => ({ ...current, description: event.target.value }))} placeholder="Descrição" rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white" />
              <label className="block text-xs font-semibold text-zinc-300">Profissionais vinculados</label>
              <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-zinc-700 p-3">
                {collaborators.map(collaborator => (
                  <label key={collaborator.id} className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={serviceForm.assignedCollaboratorIds.includes(collaborator.id)}
                      onChange={event => setServiceForm(current => ({
                        ...current,
                        assignedCollaboratorIds: event.target.checked
                          ? [...current.assignedCollaboratorIds, collaborator.id]
                          : current.assignedCollaboratorIds.filter(id => id !== collaborator.id)
                      }))}
                    />
                    {collaborator.name}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-pink-600 py-2.5 text-sm font-bold text-white">
              <Save className="h-4 w-4" /> Salvar serviço e vínculos
            </button>
          </form>
        </div>
      )}

      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-white">Gerenciar equipe</h2>
              <button type="button" onClick={() => setIsStaffModalOpen(false)} className="text-zinc-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={event => void handleAddCollaborator(event)} className="mb-5 space-y-2 border-b border-zinc-800 pb-5">
              <input required value={staffForm.name} onChange={event => setStaffForm(current => ({ ...current, name: event.target.value }))} placeholder="Nome do colaborador" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white" />
              <input value={staffForm.role} onChange={event => setStaffForm(current => ({ ...current, role: event.target.value }))} placeholder="Função (opcional)" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 text-sm text-white" />
              <button type="submit" className="w-full rounded-lg bg-pink-600 py-2 text-sm font-bold text-white">Adicionar colaborador</button>
            </form>
            <div className="space-y-3">
              {collaborators.map(collaborator => (
                <div key={collaborator.id} className="flex gap-2">
                  <input
                    value={editingCollaboratorNames[collaborator.id] ?? ''}
                    onChange={event => setEditingCollaboratorNames(current => ({ ...current, [collaborator.id]: event.target.value }))}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-sm text-white"
                    aria-label={`Nome de ${collaborator.name}`}
                  />
                  <button type="button" onClick={() => void handleSaveCollaboratorName(collaborator.id)} className="rounded-lg bg-zinc-800 p-2 text-emerald-400" aria-label={`Salvar nome de ${collaborator.name}`}><Save className="h-4 w-4" /></button>
                  <button type="button" onClick={() => void handleDeleteCollaborator(collaborator.id)} className="rounded-lg bg-zinc-800 p-2 text-rose-400" aria-label={`Excluir ${collaborator.name}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonSystemSupabase;
