import { useEffect, useState, type ChangeEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Download,
  Flower2,
  Heart,
  ImagePlus,
  Link2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  DEFAULT_GALAXY_CONFIG,
  FLOWER_OPTIONS,
  getFlowerMeta,
  type FlowerType,
  type GalaxyCustomConfig,
  type TulipMemory,
} from '../data/tulips';
import {
  compressImageFile,
  downloadConfigJson,
  normalizeGalaxyConfig,
} from '../utils/galaxyStorage';
import { generateShareUrl } from '../utils/shareConfig';

interface SettingsModalProps {
  isOpen: boolean;
  config: GalaxyCustomConfig;
  storageWarning: boolean;
  onChangeConfig: (next: GalaxyCustomConfig) => void;
  onResetConfig: () => void;
  onClose: () => void;
}

type SettingsTab = 'scene' | 'memories' | 'templates';

const DEFAULT_HEADER_SET = new Set(
  FLOWER_OPTIONS.map((f) =>
    f.id === 'mixed' ? 'Galaxia 3D Floral' : `Galaxia 3D de ${f.plural}`,
  ),
);

const DEFAULT_INTRO_SET = new Set(
  FLOWER_OPTIONS.map((f) =>
    f.id === 'mixed' ? 'Galaxia Floral' : `Galaxia de ${f.plural}`,
  ),
);

export function SettingsModal({
  isOpen,
  config,
  storageWarning,
  onChangeConfig,
  onResetConfig,
  onClose,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('scene');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [shareEmbeddedCount, setShareEmbeddedCount] = useState<number>(0);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setShareUrl('');
    setCopiedShare(false);
  }, [config]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  if (!isOpen) return null;

  const handleSelectFlower = (flowerType: FlowerType) => {
    const meta = getFlowerMeta(flowerType);
    const nextHeader = DEFAULT_HEADER_SET.has(config.headerTitle.trim())
      ? flowerType === 'mixed'
        ? 'Galaxia 3D Floral'
        : `Galaxia 3D de ${meta.plural}`
      : config.headerTitle;
    const nextIntro = DEFAULT_INTRO_SET.has(config.introTitle.trim())
      ? flowerType === 'mixed'
        ? 'Galaxia Floral'
        : `Galaxia de ${meta.plural}`
      : config.introTitle;

    onChangeConfig({
      ...config,
      flowerType,
      headerTitle: nextHeader,
      introTitle: nextIntro,
    });
  };

  const handleUpdateMemory = (id: number, patch: Partial<TulipMemory>) => {
    onChangeConfig({
      ...config,
      memories: config.memories.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  };

  const handleAddMemory = () => {
    const maxId = config.memories.reduce((max, item) => Math.max(max, item.id), 0);
    const fallbackImg =
      DEFAULT_GALAXY_CONFIG.memories[
        config.memories.length % DEFAULT_GALAXY_CONFIG.memories.length
      ]?.image ?? '';
    const newMemory: TulipMemory = {
      id: maxId + 1,
      title: `Recuerdo ${config.memories.length + 1}`,
      verse: `"Un momento especial\nque brilla para siempre\nen nuestra galaxia."`,
      image: fallbackImg,
    };
    onChangeConfig({
      ...config,
      memories: [...config.memories, newMemory],
    });
    setStatusMessage('Se agregó un nuevo recuerdo');
  };

  const handleDeleteMemory = (id: number) => {
    if (config.memories.length <= 1) return;
    onChangeConfig({
      ...config,
      memories: config.memories.filter((item) => item.id !== id),
    });
  };

  const handleMoveMemory = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= config.memories.length) return;
    const next = [...config.memories];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChangeConfig({ ...config, memories: next });
  };

  const handlePhotoUpload = async (
    id: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingId(id);
    try {
      const compressed = await compressImageFile(file);
      handleUpdateMemory(id, { image: compressed });
      setStatusMessage('Foto cargada y optimizada');
    } catch {
      setStatusMessage('No se pudo cargar esa imagen');
    } finally {
      setUploadingId(null);
    }
  };

  const handleImportJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result ?? ''));
        const normalized = normalizeGalaxyConfig(parsed);
        onChangeConfig(normalized);
        setStatusMessage('Configuración importada correctamente');
      } catch {
        setStatusMessage('El archivo JSON no es válido');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateShareLink = async () => {
    setIsGeneratingShare(true);
    setCopiedShare(false);
    try {
      const { url, embeddedPhotoCount } = await generateShareUrl(config);
      setShareUrl(url);
      setShareEmbeddedCount(embeddedPhotoCount);
      setStatusMessage('Enlace de solo lectura generado');
    } catch {
      setStatusMessage('No se pudo generar el enlace');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setStatusMessage('Enlace copiado al portapapeles');
      window.setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      setStatusMessage('Selecciona y copia el enlace manualmente');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 modal-backdrop"
    >
      <div className="glass-panel rounded-[26px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-pink-300/15">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] title-font tracking-[0.2em] uppercase text-pink-300/80">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
              <span>Estudio de Personalización</span>
            </div>
            <h2
              id="settings-modal-title"
              className="title-font text-lg sm:text-xl font-bold text-pink-50 mt-0.5 truncate"
            >
              Configurar Galaxia Floral
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar configuración"
            className="text-pink-200/80 hover:text-white w-9 h-9 rounded-full bg-white/[0.06] hover:bg-rose-500/25 flex items-center justify-center border border-pink-200/20 transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Secciones de configuración"
          className="flex items-center gap-1.5 px-5 sm:px-7 py-3 border-b border-pink-300/10 overflow-x-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'scene'}
            onClick={() => setActiveTab('scene')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scene'
                ? 'bg-rose-500/25 text-white border border-rose-400/50'
                : 'bg-white/[0.04] text-pink-200/80 border border-white/5 hover:bg-white/10'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5 text-rose-300" aria-hidden="true" />
            <span>Flores y Textos</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'memories'}
            onClick={() => setActiveTab('memories')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'memories'
                ? 'bg-rose-500/25 text-white border border-rose-400/50'
                : 'bg-white/[0.04] text-pink-200/80 border border-white/5 hover:bg-white/10'
            }`}
          >
            <ImagePlus className="w-3.5 h-3.5 text-rose-300" aria-hidden="true" />
            <span>Fotos y Mensajes ({config.memories.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'templates'}
            onClick={() => setActiveTab('templates')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-rose-500/25 text-white border border-rose-400/50'
                : 'bg-white/[0.04] text-pink-200/80 border border-white/5 hover:bg-white/10'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-rose-300" aria-hidden="true" />
            <span>Compartir / Plantillas</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto touch-pan-y px-5 sm:px-7 py-5 space-y-5">
          {storageWarning && (
            <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-100">
              Las imágenes ocupan bastante espacio en el navegador; exporta tu archivo JSON para respaldar este pedido.
            </div>
          )}

          {activeTab === 'scene' && (
            <div className="space-y-6">
              <section>
                <h3 className="title-font text-xs font-semibold tracking-[0.16em] uppercase text-pink-200/90 mb-3">
                  Tipo de flor en la galaxia 3D
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FLOWER_OPTIONS.map((option) => {
                    const selected = config.flowerType === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectFlower(option.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          selected
                            ? 'bg-rose-500/20 border-rose-400/70 shadow-[0_6px_22px_rgba(244,63,94,0.22)]'
                            : 'bg-white/[0.03] border-pink-200/10 hover:bg-white/[0.07] hover:border-pink-200/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-pink-50">
                            {option.label}
                          </span>
                          {selected && (
                            <Heart
                              className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <p className="text-xs text-pink-200/70 mt-1 leading-relaxed">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl bg-white/[0.03] border border-pink-200/10 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label
                    htmlFor="flower-count-range"
                    className="text-xs font-semibold text-pink-100"
                  >
                    Cantidad de flores flotantes
                  </label>
                  <span className="text-xs font-bold text-rose-300 tabular-nums">
                    {config.flowerCount} flores
                  </span>
                </div>
                <input
                  id="flower-count-range"
                  type="range"
                  min={15}
                  max={75}
                  step={1}
                  value={config.flowerCount}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      flowerCount: Number(e.target.value),
                    })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </section>

              <section className="space-y-3.5">
                <h3 className="title-font text-xs font-semibold tracking-[0.16em] uppercase text-pink-200/90">
                  Textos y dedicatorias generales
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs text-pink-200/80 mb-1">
                      Título superior
                    </span>
                    <input
                      type="text"
                      value={config.headerTitle}
                      onChange={(e) =>
                        onChangeConfig({ ...config, headerTitle: e.target.value })
                      }
                      className="w-full rounded-xl bg-black/40 border border-pink-200/20 px-3 py-2 text-sm text-pink-50 focus:outline-none focus:border-rose-400"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs text-pink-200/80 mb-1">
                      Subtítulo de bienvenida
                    </span>
                    <input
                      type="text"
                      value={config.introSubtitle}
                      onChange={(e) =>
                        onChangeConfig({ ...config, introSubtitle: e.target.value })
                      }
                      className="w-full rounded-xl bg-black/40 border border-pink-200/20 px-3 py-2 text-sm text-pink-50 focus:outline-none focus:border-rose-400"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs text-pink-200/80 mb-1">
                      Título de bienvenida
                    </span>
                    <input
                      type="text"
                      value={config.introTitle}
                      onChange={(e) =>
                        onChangeConfig({ ...config, introTitle: e.target.value })
                      }
                      className="w-full rounded-xl bg-black/40 border border-pink-200/20 px-3 py-2 text-sm text-pink-50 focus:outline-none focus:border-rose-400"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs text-pink-200/80 mb-1">
                      Dedicatoria al pie del recuerdo
                    </span>
                    <input
                      type="text"
                      value={config.dedicationFooter}
                      onChange={(e) =>
                        onChangeConfig({ ...config, dedicationFooter: e.target.value })
                      }
                      placeholder="Ej. Feliz aniversario, amor"
                      className="w-full rounded-xl bg-black/40 border border-pink-200/20 px-3 py-2 text-sm text-pink-50 focus:outline-none focus:border-rose-400"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-xs text-pink-200/80 mb-1">
                    Mensaje en tarjeta inicial
                  </span>
                  <textarea
                    rows={2}
                    value={config.introMessage}
                    onChange={(e) =>
                      onChangeConfig({ ...config, introMessage: e.target.value })
                    }
                    className="w-full rounded-xl bg-black/40 border border-pink-200/20 px-3 py-2 text-sm text-pink-50 focus:outline-none focus:border-rose-400 resize-y"
                  />
                </label>
              </section>
            </div>
          )}

          {activeTab === 'memories' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-pink-200/75">
                  Sube fotos desde tu dispositivo o pega una URL, y edita cada mensaje.
                </p>
                <button
                  type="button"
                  onClick={handleAddMemory}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Agregar recuerdo</span>
                </button>
              </div>

              <div className="space-y-3">
                {config.memories.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white/[0.03] border border-pink-200/15 p-3.5 sm:p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="title-font text-xs font-semibold tracking-wider uppercase text-pink-200/90">
                        Recuerdo #{idx + 1}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveMemory(idx, -1)}
                          disabled={idx === 0}
                          aria-label="Subir recuerdo"
                          className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-pink-200 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMemory(idx, 1)}
                          disabled={idx === config.memories.length - 1}
                          aria-label="Bajar recuerdo"
                          className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-pink-200 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMemory(item.id)}
                          disabled={config.memories.length <= 1}
                          aria-label="Eliminar recuerdo"
                          className="w-8 h-8 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 disabled:opacity-30 flex items-center justify-center text-rose-200 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3.5">
                      <div className="flex sm:flex-col items-center gap-2.5 shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/50 ring-1 ring-pink-200/25 flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={`Vista previa ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Heart className="w-5 h-5 text-pink-400/60" aria-hidden="true" />
                          )}
                        </div>

                        <label className="min-h-[34px] px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/[0.08] hover:bg-white/15 border border-pink-200/20 text-pink-100 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                          <Upload className="w-3 h-3 text-rose-300" aria-hidden="true" />
                          <span>
                            {uploadingId === item.id ? 'Cargando...' : 'Subir foto'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(item.id, e)}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      <div className="flex-1 space-y-2.5 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <label className="block">
                            <span className="block text-[11px] text-pink-200/75 mb-1">
                              Título
                            </span>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                handleUpdateMemory(item.id, { title: e.target.value })
                              }
                              className="w-full rounded-lg bg-black/40 border border-pink-200/20 px-2.5 py-1.5 text-xs text-pink-50 focus:outline-none focus:border-rose-400"
                            />
                          </label>

                          <label className="block">
                            <span className="block text-[11px] text-pink-200/75 mb-1">
                              URL de imagen (opcional)
                            </span>
                            <input
                              type="text"
                              value={item.image.startsWith('data:') ? '' : item.image}
                              placeholder={
                                item.image.startsWith('data:')
                                  ? 'Foto local cargada'
                                  : 'https://...'
                              }
                              onChange={(e) =>
                                handleUpdateMemory(item.id, { image: e.target.value })
                              }
                              className="w-full rounded-lg bg-black/40 border border-pink-200/20 px-2.5 py-1.5 text-xs text-pink-50 placeholder:text-pink-200/40 focus:outline-none focus:border-rose-400"
                            />
                          </label>
                        </div>

                        <label className="block">
                          <span className="block text-[11px] text-pink-200/75 mb-1">
                            Mensaje o dedicatoria
                          </span>
                          <textarea
                            rows={3}
                            value={item.verse}
                            onChange={(e) =>
                              handleUpdateMemory(item.id, { verse: e.target.value })
                            }
                            className="w-full rounded-lg bg-black/40 border border-pink-200/20 px-2.5 py-1.5 text-xs text-pink-50 focus:outline-none focus:border-rose-400 resize-y"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              {/* Enlace compartible en modo solo lectura */}
              <div className="rounded-2xl bg-gradient-to-br from-rose-500/12 to-pink-500/5 border border-rose-400/30 p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-pink-50 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-rose-300 shrink-0" aria-hidden="true" />
                    <span>Enlace para compartir (modo regalo)</span>
                  </h3>
                  <p className="text-xs text-pink-200/80 leading-relaxed mt-1">
                    Genera un enlace con tu configuración guardada dentro de la URL. Quien abra ese enlace solo verá la galaxia personalizada y no tendrá acceso al menú de Configurar.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isGeneratingShare}
                    onClick={handleGenerateShareLink}
                    className="min-h-[42px] px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:brightness-110 disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {isGeneratingShare
                        ? 'Generando enlace...'
                        : 'Generar enlace para compartir'}
                    </span>
                  </button>

                  {shareUrl && (
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="min-h-[42px] px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-pink-200/25 text-pink-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedShare ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-pink-300" aria-hidden="true" />
                          <span>Copiar enlace</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {shareUrl && (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label="Enlace para compartir generado"
                      className="w-full rounded-xl bg-black/45 border border-pink-200/20 px-3 py-2 text-xs text-pink-100 font-mono focus:outline-none focus:border-rose-400"
                    />
                    <p className="text-[11px] text-pink-200/75 leading-relaxed">
                      {shareEmbeddedCount > 0 && shareUrl.length > 16000
                        ? `Incluye ${shareEmbeddedCount} foto(s) subida(s) (${Math.round(shareUrl.length / 1024)} KB). Si alguna app de mensajería recorta enlaces muy largos, usa URLs de imagen para obtener un enlace corto.`
                        : `Enlace listo (${shareUrl.length.toLocaleString()} caracteres) · Listo para enviar a tu cliente.`}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-pink-200/15 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-pink-50">
                  Guardar y reutilizar pedidos en archivo
                </h3>
                <p className="text-xs text-pink-200/75 leading-relaxed">
                  Todos tus cambios se guardan automáticamente en este navegador. También puedes exportar o importar archivos JSON para administrar distintos pedidos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    downloadConfigJson(config);
                    setStatusMessage('Archivo JSON descargado');
                  }}
                  className="min-h-[46px] px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/12 border border-pink-200/20 text-pink-100 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4 text-rose-300" aria-hidden="true" />
                  <span>Exportar configuración (.json)</span>
                </button>

                <label className="min-h-[46px] px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/12 border border-pink-200/20 text-pink-100 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-rose-300" aria-hidden="true" />
                  <span>Importar configuración (.json)</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportJson}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-pink-300/10 flex justify-between items-center gap-3 flex-wrap">
                <span className="text-xs text-pink-200/70">
                  ¿Quieres volver al diseño inicial?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onResetConfig();
                    setStatusMessage('Valores originales restaurados');
                  }}
                  className="min-h-[38px] px-4 py-2 rounded-full bg-white/[0.05] hover:bg-rose-500/20 border border-pink-200/15 text-xs font-semibold text-pink-200 hover:text-white inline-flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Restaurar originales</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t border-pink-300/15 bg-black/20">
          <span className="text-xs text-pink-200/75 truncate">
            {statusMessage ?? 'Cambios aplicados en tiempo real'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-6 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:brightness-110 transition-all cursor-pointer shrink-0"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
