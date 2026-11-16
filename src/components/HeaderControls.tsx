import { Heart, SlidersHorizontal } from 'lucide-react';

interface HeaderControlsProps {
  title: string;
  showSettingsButton?: boolean;
  onOpenSettings: () => void;
}

export function HeaderControls({
  title,
  showSettingsButton = true,
  onOpenSettings,
}: HeaderControlsProps) {
  return (
    <header className="w-full flex items-center justify-between gap-2 max-w-7xl mx-auto pt-1">
      <div className="hidden sm:block w-10 md:w-28 shrink-0" aria-hidden="true" />

      <div className="flex items-center justify-center gap-3 md:gap-4 pointer-events-auto min-w-0">
        <span
          className="hidden md:block w-10 lg:w-16 h-px bg-gradient-to-r from-transparent to-pink-300/40"
          aria-hidden="true"
        />
        <div className="glass-panel px-4 sm:px-5 py-2 rounded-full flex items-center gap-2.5 min-w-0">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" aria-hidden="true" />
          <span className="title-font text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-pink-100 via-rose-200 to-pink-400 bg-clip-text text-transparent truncate">
            {title}
          </span>
        </div>
        <span
          className="hidden md:block w-10 lg:w-16 h-px bg-gradient-to-l from-transparent to-pink-300/40"
          aria-hidden="true"
        />
      </div>

      <div className="pointer-events-auto flex justify-end shrink-0 sm:w-10 md:w-28">
        {showSettingsButton && (
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Abrir configuración y personalización"
            title="Personalizar flores, fotos y mensajes"
            className="glass-dock min-h-[38px] px-3 py-1.5 rounded-full text-xs font-medium text-pink-200/85 hover:text-white hover:border-pink-400/50 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-300 shrink-0" aria-hidden="true" />
            <span className="hidden md:inline">Configurar</span>
          </button>
        )}
      </div>
    </header>
  );
}
