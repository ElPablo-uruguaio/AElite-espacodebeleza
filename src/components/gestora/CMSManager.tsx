import React, { useState } from 'react';
import { Settings, Plus, Trash2, Edit3, Image, Film, Key, CheckCircle2, Lock, Scissors, Sparkles, Star, Upload } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { supabase } from '../../services/supabase';

export const CMSManager: React.FC = () => {
  const { settings, updateSettings, services, addService, updateService, deleteService, stories, addStory, deleteStory } = useSalon();

  const [activeTab, setActiveTab] = useState<'settings' | 'services' | 'stories' | 'password'>('settings');

  // Site Settings state
  const [nomeSalao, setNomeSalao] = useState(settings.nome_salao);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [endereco, setEndereco] = useState(settings.endereco);
  const [chavePix, setChavePix] = useState(settings.chave_pix);
  const [googleReviewLink, setGoogleReviewLink] = useState(settings.google_review_link || 'https://g.page/r/espacobelezavip/review');
  const [bannerInput, setBannerInput] = useState(settings.banner_urls[0] || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // New Service state
  const [srvNome, setSrvNome] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvFoto, setSrvFoto] = useState('');
  const [srvDuracao, setSrvDuracao] = useState(60);
  const [srvPreco, setSrvPreco] = useState(120.00);
  const [srvCategoria, setSrvCategoria] = useState('Cabelos');

  // New Story state
  const [stTitulo, setStTitulo] = useState('');
  const [stMediaUrl, setStMediaUrl] = useState('');
  const [stMediaType, setStMediaType] = useState<'image' | 'video'>('video');
  const [stAudioUrl, setStAudioUrl] = useState('');

  // Password change state
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      nome_salao: nomeSalao,
      whatsapp,
      instagram,
      endereco,
      chave_pix: chavePix,
      google_review_link: googleReviewLink,
      banner_urls: [bannerInput]
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvNome.trim()) return;

    addService({
      nome: srvNome,
      descricao: srvDesc,
      foto_url: srvFoto || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      duracao: Number(srvDuracao),
      preco: Number(srvPreco),
      categoria: srvCategoria,
      ativo: true
    });

    setSrvNome('');
    setSrvDesc('');
    setSrvFoto('');
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stMediaUrl.trim()) return;

    addStory({
      titulo: stTitulo || undefined,
      media_url: stMediaUrl,
      media_type: stMediaType,
      audio_url: stAudioUrl || undefined,
      ativo: true
    });

    setStTitulo('');
    setStMediaUrl('');
    setStAudioUrl('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPass !== confirmPass) {
      setPassMsg({ text: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    if (!supabase) {
      setPassMsg({ text: 'O serviço de autenticação não está configurado.', type: 'error' });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      setPassMsg({ text: error.message || 'Não foi possível alterar a senha.', type: 'error' });
      return;
    }

    setPassMsg({ text: 'Senha alterada com sucesso!', type: 'success' });
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8">
      
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-rose-400" />
          Gerenciador do Site & Configurações (CMS)
        </h3>

        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'settings' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Dados do Salão
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'services' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Serviços & Preços
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'stories' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Stories & Mídias
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'password' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Alterar Senha
          </button>
        </div>
      </div>

      {/* TAB 1: General Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome do Salão *</label>
              <input
                type="text"
                value={nomeSalao}
                onChange={(e) => setNomeSalao(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">WhatsApp de Atendimento *</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Instagram (@usuario)</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Chave PIX do Salão</label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Link de Avaliação do Google Meu Negócio
            </label>
            <input
              type="url"
              value={googleReviewLink}
              onChange={(e) => setGoogleReviewLink(e.target.value)}
              placeholder="https://g.page/r/.../review"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Endereço Completo</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Banner configuration with device file upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">Banner Principal da Página Inicial</label>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="file"
                id="banner-settings-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = ev.target?.result as string;
                      if (result) setBannerInput(result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('banner-settings-upload')?.click()}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-4 py-2 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-rose-400" />
                <span>Escolher Foto do Dispositivo</span>
              </button>
              <input
                type="url"
                value={bannerInput}
                onChange={(e) => setBannerInput(e.target.value)}
                placeholder="Ou cole a URL da Imagem (https://...)"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            {bannerInput && (
              <div className="pt-2">
                <img src={bannerInput} alt="Banner Preview" className="h-24 w-full object-cover rounded-xl border border-zinc-800" />
              </div>
            )}
          </div>

          {settingsSaved && (
            <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              Configurações salvas com sucesso!
            </p>
          )}

          <button
            type="submit"
            className="rose-gradient-btn text-white font-bold text-xs px-6 py-3 rounded-xl shadow"
          >
            Salvar Alterações do Salão
          </button>
        </form>
      )}

      {/* TAB 2: Services */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <form onSubmit={handleAddService} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1">
              <Plus className="w-4 h-4 text-rose-400" /> Cadastrar Novo Serviço
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={srvNome}
                  onChange={(e) => setSrvNome(e.target.value)}
                  placeholder="Nome do serviço"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <select
                  value={srvCategoria}
                  onChange={(e) => setSrvCategoria(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Cabelos">Cabelos</option>
                  <option value="Unhas">Unhas</option>
                  <option value="Estética">Estética</option>
                  <option value="Make">Make</option>
                </select>
              </div>

              <div>
                <input
                  type="number"
                  value={srvPreco}
                  onChange={(e) => setSrvPreco(Number(e.target.value))}
                  placeholder="Preço R$"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                value={srvDesc}
                onChange={(e) => setSrvDesc(e.target.value)}
                placeholder="Descrição resumida do serviço"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Photo upload / URL input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">Foto do Serviço (Upload do Computador/Celular ou URL)</label>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <input
                  type="file"
                  id="srv-photo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const result = ev.target?.result as string;
                        if (result) setSrvFoto(result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('srv-photo-upload')?.click()}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-4 py-2 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-400" />
                  <span>Anexar Foto do Dispositivo</span>
                </button>

                <input
                  type="url"
                  value={srvFoto}
                  onChange={(e) => setSrvFoto(e.target.value)}
                  placeholder="Ou cole a URL da Imagem (https://...)"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500"
                />
              </div>
              {srvFoto && (
                <div className="flex items-center gap-2 pt-1">
                  <img src={srvFoto} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-zinc-700" />
                  <span className="text-[11px] text-emerald-400 font-semibold">Foto carregada para o serviço</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow"
            >
              Adicionar Serviço ao Catálogo
            </button>
          </form>

          {/* List Services with Instant Photo Replacement Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(s => (
              <div key={s.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative group/srv shrink-0">
                    <img src={s.foto_url} alt={s.nome} className="w-14 h-14 rounded-xl object-cover border border-zinc-800" />
                    <input
                      type="file"
                      id={`srv-replace-${s.id}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string;
                            if (result) {
                              updateService(s.id, { foto_url: result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`srv-replace-${s.id}`)?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/srv:opacity-100 rounded-xl flex items-center justify-center text-[10px] text-white font-bold transition"
                      title="Trocar Foto"
                    >
                      <Upload className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-white truncate">{s.nome}</h5>
                    <p className="text-xs text-zinc-400">R$ {s.preco.toFixed(2)} • {s.duracao} min</p>
                    <button
                      type="button"
                      onClick={() => document.getElementById(`srv-replace-${s.id}`)?.click()}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <Upload className="w-3 h-3" /> Trocar Imagem
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => deleteService(s.id)}
                  className="text-zinc-500 hover:text-rose-400 p-2 shrink-0"
                  title="Excluir Serviço"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Stories */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <form onSubmit={handleAddStory} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1">
              <Film className="w-4 h-4 text-purple-400" /> Publicar Novo Story (Loop Infinito)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={stTitulo}
                  onChange={(e) => setStTitulo(e.target.value)}
                  placeholder="Título do Story"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <select
                  value={stMediaType}
                  onChange={(e) => setStMediaType(e.target.value as 'image' | 'video')}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="video">Vídeo (MP4/WebM)</option>
                  <option value="image">Imagem (JPG/PNG)</option>
                </select>
              </div>

              <div>
                <input
                  type="url"
                  value={stAudioUrl}
                  onChange={(e) => setStAudioUrl(e.target.value)}
                  placeholder="URL Trilha Sonora / Narração (opcional)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <input
                type="url"
                value={stMediaUrl}
                onChange={(e) => setStMediaUrl(e.target.value)}
                placeholder="URL da Mídia (https://...mp4 ou image)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow"
            >
              Publicar Story
            </button>
          </form>

          {/* Stories List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stories.map(st => (
              <div key={st.id} className="bg-zinc-950 border border-zinc-800 p-3 rounded-2xl space-y-2 relative">
                <div className="h-32 rounded-xl overflow-hidden bg-zinc-900 relative">
                  {st.media_type === 'video' ? (
                    <video src={st.media_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={st.media_url} alt="Story" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate">{st.titulo || 'Story VIP'}</span>
                  <button onClick={() => deleteStory(st.id)} className="text-rose-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Password Form */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
          <h4 className="text-sm font-bold text-white flex items-center gap-1 mb-2">
            <Lock className="w-4 h-4 text-amber-400" /> Alterar Senha
          </h4>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Nova Senha *</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirmar Senha *</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          {passMsg && (
            <p className={`text-xs font-bold p-3 rounded-xl border ${passMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {passMsg.text}
            </p>
          )}

          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow"
          >
            Atualizar Minha Senha
          </button>
        </form>
      )}

    </div>
  );
};
