import React, { useState, useRef } from 'react';
import { Upload, Image, Film, Sparkles, Trash2, Plus, CheckCircle2, Play, Eye } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { StoryMedia } from '../../types';

export const MediaManager: React.FC = () => {
  const { settings, updateSettings, stories, addStory, deleteStory } = useSalon();

  const [activeMediaTab, setActiveMediaTab] = useState<'banners' | 'stories' | 'gallery'>('banners');

  // New Story Form State
  const [stTitulo, setStTitulo] = useState('');
  const [stMediaUrl, setStMediaUrl] = useState('');
  const [stMediaType, setStMediaType] = useState<'image' | 'video'>('video');
  const [stAudioUrl, setStAudioUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // New Banner state
  const [bannerInput, setBannerInput] = useState('');

  // File Input Refs
  const storyFileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceBannerFileInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceBannerIndex, setReplaceBannerIndex] = useState<number | null>(null);

  // Handle local file reading for stories
  const handleStoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setStMediaUrl(result);
        setStMediaType(isVideo ? 'video' : 'image');
        if (!stTitulo) {
          setStTitulo(file.name.replace(/\.[^/.]+$/, ''));
        }
        setUploadSuccess(`Arquivo "${file.name}" carregado com sucesso.`);
        setTimeout(() => setUploadSuccess(null), 3500);
      }
    };

    reader.readAsDataURL(file);
  };

  // Handle local file upload for new banner
  const handleAddBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const currentBanners = settings.banner_urls || [];
        updateSettings({
          banner_urls: [...currentBanners, result]
        });
        setUploadSuccess(`Novo banner adicionado com sucesso!`);
        setTimeout(() => setUploadSuccess(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local file replacement for specific banner
  const handleReplaceBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceBannerIndex === null) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const currentBanners = [...(settings.banner_urls || [])];
        currentBanners[replaceBannerIndex] = result;
        updateSettings({
          banner_urls: currentBanners
        });
        setUploadSuccess(`Banner #${replaceBannerIndex + 1} substituído com sucesso!`);
        setTimeout(() => setUploadSuccess(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddBannerUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerInput.trim()) return;
    const currentBanners = settings.banner_urls || [];
    updateSettings({
      banner_urls: [...currentBanners, bannerInput.trim()]
    });
    setBannerInput('');
    setUploadSuccess('Banner adicionado via URL com sucesso!');
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const handleRemoveBanner = (indexToRemove: number) => {
    const currentBanners = settings.banner_urls || [];
    if (currentBanners.length <= 1) {
      alert('Mantenha ao menos 1 banner principal para a exibição da página inicial.');
      return;
    }
    const updated = currentBanners.filter((_, idx) => idx !== indexToRemove);
    updateSettings({ banner_urls: updated });
  };

  const handlePublishStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stMediaUrl.trim()) {
      alert('Selecione uma foto ou vídeo para o story.');
      return;
    }

    addStory({
      titulo: stTitulo.trim() || 'Novidade no Salão',
      media_url: stMediaUrl,
      media_type: stMediaType,
      audio_url: stAudioUrl.trim() || undefined,
      ativo: true
    });

    setStTitulo('');
    setStMediaUrl('');
    setStAudioUrl('');
    setUploadSuccess('Story publicado com sucesso e disponível no feed público!');
    setTimeout(() => setUploadSuccess(null), 4000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Central de Conteúdo Visual</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Upload de Mídias, Stories & Banners</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Envie fotos e vídeos do seu computador ou celular para atualizar os Banners da Home e os Stories instantaneamente.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMediaTab('banners')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMediaTab === 'banners' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Banners da Home ({settings.banner_urls?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveMediaTab('stories')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMediaTab === 'stories' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Stories Ao Vivo ({stories.length})</span>
          </button>
        </div>
      </div>

      {/* Global Success Notification */}
      {uploadSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center space-x-3 text-emerald-400 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Hidden Global Input for Replacing a Specific Banner */}
      <input
        type="file"
        ref={replaceBannerFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleReplaceBannerFile}
      />

      {/* ========================================================================= */}
      {/* TAB 1: BANNERS PRINCIPAIS DA HOME                                         */}
      {/* ========================================================================= */}
      {activeMediaTab === 'banners' && (
        <div className="space-y-6">
          
          {/* Action Upload Area for Banners */}
          <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-rose-500/50 rounded-3xl p-6 sm:p-8 text-center transition">
            <input
              type="file"
              ref={bannerFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAddBannerFile}
            />

            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Adicionar Novo Banner para a Home</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mb-4">
              Selecione uma imagem em alta resolução (JPG, PNG ou WebP) direto da sua galeria ou arquivos.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                className="rose-gradient-btn text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Escolher Imagem do Dispositivo / Celular</span>
              </button>
            </div>

            {/* Optional URL input */}
            <form onSubmit={handleAddBannerUrl} className="mt-4 pt-4 border-t border-zinc-900 max-w-lg mx-auto flex gap-2">
              <input
                type="url"
                value={bannerInput}
                onChange={(e) => setBannerInput(e.target.value)}
                placeholder="Ou cole o link direto da imagem (https://...)"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Inserir Link
              </button>
            </form>
          </div>

          {/* Current Banners Grid with Replace / Remove Buttons */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-rose-400" /> Banners Atualmente no Carrossel da Home
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(settings.banner_urls || []).map((url, idx) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden group relative flex flex-col justify-between shadow-lg">
                  <div className="h-44 w-full relative overflow-hidden bg-zinc-900">
                    <img
                      src={url}
                      alt={`Banner ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 border border-amber-500/20">
                      Banner #{idx + 1} {idx === 0 && '• Principal'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-zinc-950 flex items-center justify-between border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => {
                        setReplaceBannerIndex(idx);
                        replaceBannerFileInputRef.current?.click();
                      }}
                      className="bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-700 transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-rose-400 group-hover:text-white" />
                      <span>Substituir Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveBanner(idx)}
                      className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-900 transition"
                      title="Excluir este banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STORIES (VÍDEOS E FOTOS EM LOOP)                                   */}
      {/* ========================================================================= */}
      {activeMediaTab === 'stories' && (
        <div className="space-y-8">
          
          {/* Upload and Publish Story Form */}
          <form onSubmit={handlePublishStory} className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" /> Publicar Novo Story (Foto ou Vídeo em Loop)
              </h4>
              <span className="text-[11px] text-zinc-400">Exibido na página inicial dos clientes</span>
            </div>

            <input
              type="file"
              ref={storyFileInputRef}
              accept="image/*,video/*"
              className="hidden"
              onChange={handleStoryFileUpload}
            />

            {/* Drag / Select File Area */}
            <div
              onClick={() => storyFileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-purple-500/60 bg-zinc-900/50 rounded-2xl p-6 text-center cursor-pointer transition"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-white">
                {stMediaUrl ? 'Mídia Selecionada (Clique para trocar de arquivo)' : 'Clique para selecionar Foto ou Vídeo do celular/computador'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Formatos suportados: MP4, WebM, MOV, JPG, PNG e WebP
              </p>
            </div>

            {/* Preview of chosen media */}
            {stMediaUrl && (
              <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex items-center space-x-4">
                <div className="w-20 h-28 rounded-xl overflow-hidden bg-black shrink-0 relative">
                  {stMediaType === 'video' ? (
                    <video src={stMediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                  ) : (
                    <img src={stMediaUrl} alt="Story Preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {stMediaType === 'video' ? 'Vídeo Carregado' : 'Imagem Carregada'}
                  </span>
                  <p className="text-xs font-bold text-white truncate mt-1">
                    {stTitulo || 'Story Pronto para Publicação'}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    A mídia será exibida com reprodução automática contínua.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setStMediaUrl(''); setStTitulo(''); }}
                  className="text-zinc-400 hover:text-rose-400 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Título ou Destaque do Story</label>
                <input
                  type="text"
                  value={stTitulo}
                  onChange={(e) => setStTitulo(e.target.value)}
                  placeholder="Ex: Transformação Morena Iluminada"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Ou Cole a URL da Mídia Direta (Opcional)</label>
                <input
                  type="url"
                  value={stMediaUrl}
                  onChange={(e) => setStMediaUrl(e.target.value)}
                  placeholder="https://... (mp4 ou imagem)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!stMediaUrl}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-purple-600/20 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Story no Site Público</span>
            </button>
          </form>

          {/* Active Stories List */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" /> Stories Ativos no Salão ({stories.length})
            </h4>

            {stories.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs">
                Nenhum story publicado no momento. Use o formulário acima para adicionar vídeos ou fotos.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {stories.map(st => (
                  <div key={st.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-2.5 space-y-2 relative group overflow-hidden shadow-md flex flex-col justify-between">
                    <div className="h-44 rounded-xl overflow-hidden bg-black relative">
                      {st.media_type === 'video' ? (
                        <video src={st.media_url} className="w-full h-full object-cover" muted autoPlay loop />
                      ) : (
                        <img src={st.media_url} alt="Story" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {st.media_type === 'video' ? 'Vídeo' : 'Foto'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-bold text-white truncate text-[11px]">{st.titulo || 'Story VIP'}</span>
                      <button
                        onClick={() => deleteStory(st.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Remover story"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
