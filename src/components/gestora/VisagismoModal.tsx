import React, { useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { analisarVisagismo } from '../../services/geminiService';

interface VisagismoModalProps {
  onClose: () => void;
  clienteNome?: string;
}

export const VisagismoModal: React.FC<VisagismoModalProps> = ({ onClose, clienteNome }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido.');
      return;
    }

    setError(null);
    setAnalysis('');
    setFileName(file.name);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => setImageData(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => setError('Não foi possível carregar a imagem. Tente novamente.');
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageData || !mimeType) {
      setError('Selecione uma foto antes de iniciar a análise.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analisarVisagismo(imageData, mimeType);
      setAnalysis(result);
    } catch (analysisError) {
      setError(analysisError instanceof Error
        ? analysisError.message
        : 'Não foi possível analisar a imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setMimeType('');
    setFileName('');
    setAnalysis('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative my-8 w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Fechar análise de visagismo"
          className="absolute right-5 top-5 rounded-xl p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3 border-b border-zinc-800 pb-5 pr-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Análise de Visagismo</h2>
            <p className="text-xs text-zinc-400">
              {clienteNome ? `Recomendação personalizada para ${clienteNome}` : 'Recomendações para o Elite Espaço de Beleza'}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
              {imageData ? (
                <div className="relative aspect-[4/3]">
                  <img src={imageData} alt="Foto selecionada para análise de visagismo" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    aria-label="Remover foto"
                    className="absolute right-3 top-3 rounded-xl bg-black/70 p-2 text-zinc-200 transition hover:bg-black hover:text-white disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 p-6 text-center text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                >
                  <Camera className="h-10 w-10 text-amber-400" />
                  <span className="text-sm font-semibold">Adicione uma foto</span>
                  <span className="text-xs text-zinc-500">JPG, PNG ou WEBP</span>
                </button>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{imageData ? 'Trocar foto' : 'Selecionar foto'}</span>
            </button>

            {fileName && <p className="truncate text-center text-[11px] text-zinc-500">{fileName}</p>}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!imageData || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-950/20 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              <span>{loading ? 'Analisando imagem...' : 'Analisar Visagismo'}</span>
            </button>

            {error && (
              <p className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <section className="min-h-[280px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recomendação profissional</h3>
            </div>
            {analysis ? (
              <div className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">{analysis}</div>
            ) : (
              <div className="flex h-52 flex-col items-center justify-center text-center text-zinc-500">
                <Sparkles className="mb-3 h-8 w-8 text-zinc-700" />
                <p className="text-sm">A análise aparecerá aqui após o envio da foto.</p>
              </div>
            )}
          </section>
        </div>

        <p className="mt-5 text-[11px] leading-5 text-zinc-500">
          A análise é uma orientação estética e deve ser confirmada presencialmente por um profissional antes da realização do serviço.
        </p>
      </div>
    </div>
  );
};
