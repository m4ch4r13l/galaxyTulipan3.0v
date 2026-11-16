import { useState } from 'react';
import {
  Box,
  ChevronDown,
  ChevronUp,
  Flower2,
  MousePointerClick,
  Music,
} from 'lucide-react';

interface BottomDockProps {
  isAutoRotating: boolean;
  isAudioPlaying: boolean;
  discoveredCount: number;
  totalMemories: number;
  onToggleViewMode: () => void;
  onToggleAudio: () => void;
  onOpenGallery: () => void;
}

export function BottomDock({
  isAutoRotating,
  isAudioPlaying,
  discoveredCount,
  totalMemories,
  onToggleViewMode,
  onToggleAudio,
  onOpenGallery,
}: BottomDockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <footer className="w-full flex flex-col items-center gap-2 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-expanded={!isCollapsed}
        className="glass-dock pointer-events-auto px-3.5 py-1 rounded-full text-[11px] font-medium text-pink-200/80 hover:text-white transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-pink-300" aria-hidden="true" />
            <span>Mostrar controles</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-pink-300" aria-hidden="true" />
            <span>Ocultar</span>
          </>
        )}
      </button>

      {!isCollapsed && (
        <>
          <nav
            aria-label="Controles de la galaxia"
            className="glass-dock pointer-events-auto inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-3xl sm:rounded-full"
          >
            <button
              type="button"
              onClick={onToggleViewMode}
              aria-pressed={!isAutoRotating}
              className={`min-h-[40px] px-3.5 md:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 ${
                !isAutoRotating
                  ? 'bg-pink-500/20 text-pink-50 border border-pink-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                  : 'bg-white/[0.04] text-pink-200/90 border border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-pink-300 shrink-0" aria-hidden="true" />
              <span>{isAutoRotating ? 'Vista Órbita' : 'Control Manual'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleAudio}
              aria-pressed={isAudioPlaying}
              className={`min-h-[40px] px-3.5 md:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 ${
                isAudioPlaying
                  ? 'bg-pink-500/20 text-pink-50 border border-pink-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                  : 'bg-white/[0.04] text-pink-200/90 border border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-pink-300 shrink-0" aria-hidden="true" />
              <span>{isAudioPlaying ? 'Melodía Activa' : 'Melodía'}</span>
            </button>

            <span
              className="hidden sm:block w-px h-5 bg-pink-300/20 mx-0.5"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={onOpenGallery}
              className="min-h-[40px] px-4 md:px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_22px_rgba(244,63,94,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-300"
            >
              <Flower2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Tulipanes</span>
              <span className="text-pink-100/95 font-semibold tabular-nums">
                {discoveredCount}/{totalMemories}
              </span>
            </button>
          </nav>

          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-pink-200/65 pointer-events-none select-none">
            <MousePointerClick className="w-3 h-3 text-pink-400/75 shrink-0" aria-hidden="true" />
            <span>Toca un tulipán 3D · Arrastra para girar · Rueda o pellizco para zoom</span>
          </div>
        </>
      )}
    </footer>
  );
}
