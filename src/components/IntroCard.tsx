import { Flower2, Heart } from 'lucide-react';

interface IntroCardProps {
  visible: boolean;
  dismissed: boolean;
  onEnter: () => void;
}

export function IntroCard({ visible, dismissed, onEnter }: IntroCardProps) {
  if (dismissed) return null;

  return (
    <div className="flex justify-center items-center my-auto px-2">
      <div
        className={`glass-panel rounded-3xl p-7 md:p-9 max-w-md w-full text-center transition-all duration-700 ${
          visible
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-pink-500/20 blur-md"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 rounded-full border border-pink-300/35"
            aria-hidden="true"
          />
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_rgba(244,63,94,0.4)] text-white">
            <Flower2 className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        <p className="title-font text-[11px] tracking-[0.26em] uppercase text-pink-300/75 mb-1.5">
          Universo Floral
        </p>

        <h1 className="title-font text-2xl md:text-3xl font-bold glowing-pink text-pink-50 tracking-wide">
          Galaxia de Tulipanes
        </h1>

        <div className="flex items-center justify-center gap-3 my-4" aria-hidden="true">
          <span className="w-12 h-px bg-gradient-to-r from-transparent to-pink-300/45" />
          <span className="w-1.5 h-1.5 rotate-45 border border-pink-300/70" />
          <span className="w-12 h-px bg-gradient-to-l from-transparent to-pink-300/45" />
        </div>

        <p className="script-font text-2xl md:text-[26px] text-pink-100/95 mb-6 leading-relaxed">
          &ldquo;Haz clic o toca cualquier tulipán flotante del universo 3D para descubrir
          su mensaje.&rdquo;
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onEnter}
            className="min-h-[44px] px-7 py-3 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-semibold text-xs tracking-wider uppercase title-font hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_28px_rgba(244,63,94,0.4)] flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Heart className="w-3.5 h-3.5 fill-white" aria-hidden="true" />
            <span>Entrar a la Galaxia</span>
          </button>
        </div>
      </div>
    </div>
  );
}
