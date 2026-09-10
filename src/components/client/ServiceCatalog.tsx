import React, { useState } from 'react';
import { Clock, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { ServiceItem } from '../../types';

interface ServiceCatalogProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectService }) => {
  const { services } = useSalon();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(services.map(s => s.categoria)))];
  const activeServices = services.filter(s => s.ativo);

  const filteredServices = activeCategory === 'Todos'
    ? activeServices
    : activeServices.filter(s => s.categoria === activeCategory);

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
            Escolha o tratamento desejado e agende seu horário online com apenas R$ 20,00 de sinal via PIX.
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto no-scrollbar pb-6">
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
                  <img
                    src={service.foto_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                    alt={service.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
                  
                  <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/20">
                    {service.categoria}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition mb-2">
                    {service.nome}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 font-light">
                    {service.descricao}
                  </p>
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
                    R$ {service.preco.toFixed(2).replace('.', ',')}
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

      </div>
    </section>
  );
};
