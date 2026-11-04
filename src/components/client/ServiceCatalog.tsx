import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Search, Sparkles, Upload } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { useAuth } from '../../context/AuthContext';
import { ServiceItem } from '../../types';
import { FallbackImage } from '../common/FallbackImage';

interface ServiceCatalogProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectService }) => {
  const { services, updateService } = useSalon();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  const isAdmin = user?.role === 'admin';

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(services.map(s => s.categoria)))],
    [services]
  );
  const activeServices = services.filter(s => s.ativo);

  const filteredServices = activeServices.filter(service => {
    const matchesCategory = activeCategory === 'Todos' || service.categoria === activeCategory;
    const matchesSearch = service.nome.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const toggleDescription = (serviceId: string) => {
    setExpandedServices(current => {
      const next = new Set(current);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  return (
    <section id="servicos" className="py-16 bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Catálogo Premium</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Nossos Serviços & Especialidades
          </h2>
          <p className="text-zinc-400 text-sm mt-2 font-light">
            Escolha o tratamento desejado e faça seu agendamento online de forma rápida e prática. Pagamento realizado no salão após o atendimento.
          </p>
        </div>

        <div className="relative max-w-xl mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar serviço..."
            aria-label="Buscar serviço por nome"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-rose-500"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all duration-300 group flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Photo Header */}
                <div className="h-52 w-full overflow-hidden relative">
                  <FallbackImage
                    src={service.foto_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                    alt={service.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
                  
                  <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/20">
                    {service.categoria}
                  </span>

                  {/* Gestora Quick Photo Replacement Button */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3">
                      <input
                        type="file"
                        id={`catalog-srv-upload-${service.id}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const res = ev.target?.result as string;
                              if (res) updateService(service.id, { foto_url: res });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById(`catalog-srv-upload-${service.id}`)?.click()}
                        className="bg-black/80 hover:bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-white/20 flex items-center gap-1 shadow transition backdrop-blur-md"
                        title="Trocar Foto deste Serviço"
                      >
                        <Upload className="w-3.5 h-3.5 text-rose-400 hover:text-white" />
                        <span>Trocar Foto</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition mb-2">
                    {service.nome}
                  </h3>
                  <div className="text-xs text-zinc-400 leading-relaxed mb-4 font-light">
                    <p>
                      {expandedServices.has(service.id) || service.descricao.length <= 80
                        ? service.descricao
                        : `${service.descricao.slice(0, 80).trimEnd()}...`}
                    </p>
                    {service.descricao.length > 80 && (
                      <button
                        type="button"
                        onClick={() => toggleDescription(service.id)}
                        className="mt-1 font-semibold text-rose-400 hover:text-rose-300"
                        aria-expanded={expandedServices.has(service.id)}
                      >
                        {expandedServices.has(service.id) ? 'Ler menos' : 'Ler mais'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer details & Action */}
              <div className="px-6 pb-6 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1 text-xs text-zinc-400 font-medium mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>{service.duracao} min</span>
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {service.preco_a_partir && <span className="mr-1 text-xs font-medium text-zinc-400">A partir de</span>}
                    {Number.isFinite(service.preco)
                      ? `R$ ${service.preco.toFixed(2).replace('.', ',')}`
                      : 'Consultar'}
                  </div>
                </div>

                <button
                  onClick={() => onSelectService(service)}
                  className="rose-gradient-btn text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center space-x-1.5 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-400">
            Nenhum serviço encontrado para sua busca.
          </p>
        )}

      </div>
    </section>
  );
};
