import React, { useState } from 'react';
import { Target, Plus, Eye, CheckCircle2, Copy, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const LandingPageManager: React.FC = () => {
  const { landingPages, createLandingPage } = useSalon();

  const [showAdd, setShowAdd] = useState(false);
  const [slug, setSlug] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemCapa, setImagemCapa] = useState('');
  const [precoPromocional, setPrecoPromocional] = useState(199.90);
  const [valorSinal, setValorSinal] = useState(20.00);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !titulo.trim()) return;

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    createLandingPage({
      slug: cleanSlug,
      titulo_oferta: titulo,
      descricao,
      imagem_capa: imagemCapa || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      preco_promocional: Number(precoPromocional),
      valor_sinal_pix: Number(valorSinal),
      ativa: true
    });

    setSlug('');
    setTitulo('');
    setDescricao('');
    setImagemCapa('');
    setShowAdd(false);
  };

  const copyLpLink = (lpSlug: string, source: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/#${lpSlug}?utm_source=${source}&utm_campaign=${lpSlug}`;
    navigator.clipboard.writeText(fullUrl);
    alert(`Link de campanha copiado com UTM (${source})!\n${fullUrl}`);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-400" />
            Gerenciador de Landing Pages & Campanhas (UTMs)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Crie páginas promocionais exclusivas (ex: /promocao-dia-das-maes) e monitore visualizações e agendamentos convertidos.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="rose-gradient-btn text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Oferta / Landing Page</span>
        </button>
      </div>

      {/* Landing Pages List */}
      <div className="space-y-4">
        {landingPages.map(lp => (
          <div key={lp.id} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img src={lp.imagem_capa} alt={lp.titulo_oferta} className="w-16 h-16 rounded-2xl object-cover border border-zinc-800" />
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  {lp.titulo_oferta}
                  <span className="text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                    /{lp.slug}
                  </span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">{lp.descricao}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-300 mt-2">
                  <span>Preço Promo: <strong className="text-emerald-400">R$ {lp.preco_promocional.toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>Sinal PIX: <strong className="text-amber-400">R$ {lp.valor_sinal_pix.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>

            {/* Campaign Analytics & Links */}
            <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
              
              {/* Analytics Counters */}
              <div className="flex items-center space-x-3 text-center">
                <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                    <Eye className="w-3 h-3 text-amber-400" /> Acessos
                  </p>
                  <p className="text-base font-extrabold text-white">{lp.views_count}</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" /> Conversões
                  </p>
                  <p className="text-base font-extrabold text-emerald-400">{lp.conversions_count}</p>
                </div>
              </div>

              {/* Copy Links with UTM */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => copyLpLink(lp.slug, 'instagram_ads')}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-zinc-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3 text-rose-400" /> Link Instagram Ads
                </button>
                <button
                  onClick={() => copyLpLink(lp.slug, 'whatsapp')}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-zinc-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3 text-emerald-400" /> Link WhatsApp
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">✕</button>

            <h4 className="text-lg font-bold text-white mb-4">Nova Landing Page Promocional</h4>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Título da Oferta *</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Especial Dia das Mães - Combo Luxo"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">URL amigável (Slug) *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ex: promocao-dia-das-maes"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descrição Curta *</label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o que a cliente ganha nesta promoção..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Preço Promocional R$ *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precoPromocional}
                    onChange={(e) => setPrecoPromocional(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Valor Sinal PIX R$ *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorSinal}
                    onChange={(e) => setValorSinal(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">URL Imagem de Capa</label>
                <input
                  type="url"
                  value={imagemCapa}
                  onChange={(e) => setImagemCapa(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rose-gradient-btn text-white font-bold py-3 rounded-xl text-xs shadow-lg"
              >
                Criar Landing Page
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
