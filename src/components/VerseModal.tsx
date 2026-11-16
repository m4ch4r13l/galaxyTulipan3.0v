import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flower2, Heart, X } from 'lucide-react';
import type { TulipMemory } from '../data/tulips';

interface VerseModalProps {
  memories: TulipMemory[];
  activeIndex: number | null;
  discoveredIds: number[];
  onSelectIndex: (index: number) => void;
  onClose: () => void;
}

export function VerseModal({
  memories,
  activeIndex,
  discoveredIds,
  onSelectIndex,
  onClose,
}: VerseModalProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const isOpen = activeIndex !== null && memories.length > 0;
  const safeIndex =
    activeIndex !== null
      ? ((activeIndex % memories.length) + memories.length) % memories.length
      : 0;
  const memory = isOpen ? memories[safeIndex] : null;

  useEffect(() => {
    setImgFailed(false);
  }, [safeIndex, isOpen]);

  const handlePrev = () => {
    if (!memories.length) return;
    onSelectIndex((safeIndex - 1 + memories.length) % memories.length);
  };

  const handleNext = () => {
    if (!memories.length) return;
    onSelectIndex((safeIndex + 1) % memories.length);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        onSelectIndex((safeIndex - 1 + memories.length) % memories.length);
      } else if (event.key === 'ArrowRight') {
        onSelectIndex((safeIndex + 1) % memories.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, safeIndex, memories.length, onSelectIndex, onClose]);

  const formattedCurrent = String(safeIndex + 1).padStart(2, '0');
  const formattedTotal = String(memories.length).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            touchStartXRef.current = e.touches[0].clientX;
          }
        }}
        onTouchEnd={(e) => {
          if (touchStartXRef.current === null || e.changedTouches.length === 0) return;
          const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
          touchStartXRef.current = null;
          if (Math.abs(deltaX) > 48) {
            if (deltaX > 0) handlePrev();
            else handleNext();
          }
        }}
        className={`glass-panel rounded-[28px] p-6 sm:p-8 max-w-md w-full text-center relative overflow-hidden transform transition-all duration-300 max-h-[92vh] overflow-y-auto ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Resplandor estelar sutil en la parte superior de la tarjeta */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.18)_0%,rgba(236,72,153,0.06)_48%,transparent_75%)]"
          aria-hidden="true"
        />

        {/* Cabecera editorial */}
        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-[11px] text-pink-200/80 title-font tracking-[0.2em] uppercase tabular-nums">
            <Flower2 className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
            <span>
              Tulipán {formattedCurrent} · {formattedTotal}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar mensaje"
            className="text-pink-200/80 hover:text-white w-9 h-9 rounded-full bg-white/[0.06] hover:bg-rose-500/25 flex items-center justify-center border border-pink-200/20 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Retrato protagonista con aura ambiental */}
        <div className="relative flex items-center justify-center mb-5">
          <div
            className="pointer-events-none absolute w-48 h-48 rounded-full bg-rose-500/20 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-[0_22px_50px_rgba(0,0,0,0.65)] ring-1 ring-pink-200/30 bg-black/50 flex items-center justify-center">
            {memory && !imgFailed ? (
              <img
                key={memory.id}
                src={memory.image}
                alt={`Recuerdo Estelar ${safeIndex + 1}`}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover object-center memory-enter"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-950/80 via-[#1a0526] to-pink-950/80 p-4 text-pink-200/80">
                <Heart className="w-10 h-10 text-pink-400 mb-2" aria-hidden="true" />
                <span className="text-xs title-font tracking-wider">Recuerdo Estelar</span>
              </div>
            )}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Tira de miniaturas centrada (dorado tenue = sin explorar, rosa = explorado) */}
        <div
          className="relative flex items-center justify-center gap-2 mb-5"
          role="tablist"
          aria-label="Galería de tulipanes"
        >
          {memories.map((item, idx) => {
            const isActive = idx === safeIndex;
            const isExplored = discoveredIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Ver tulipán ${idx + 1}${isExplored ? ' (explorado)' : ' (sin explorar)'}`}
                onClick={() => onSelectIndex(idx)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? '-translate-y-0.5 ring-2 ring-rose-400 ring-offset-2 ring-offset-[#150420] opacity-100 shadow-[0_6px_16px_rgba(244,63,94,0.4)]'
                    : isExplored
                      ? 'opacity-70 hover:opacity-100 hover:-translate-y-0.5 ring-1 ring-pink-300/30'
                      : 'opacity-50 hover:opacity-95 hover:-translate-y-0.5 ring-1 ring-amber-200/55'
                }`}
              >
                <img
                  src={item.image}
                  alt={`Miniatura ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </button>
            );
          })}
        </div>

        {/* Divisor ornamental y verso */}
        <div key={memory?.id} className="relative memory-enter px-2">
          <div className="flex items-center justify-center gap-3 mb-3" aria-hidden="true">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-pink-300/40" />
            <span className="w-1.5 h-1.5 rotate-45 border border-pink-300/65" />
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-pink-300/40" />
          </div>

          <h3
            id="modal-title"
            className="title-font text-sm sm:text-base font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-pink-100 via-rose-200 to-pink-300 bg-clip-text text-transparent mb-2"
          >
            {memory?.title ?? 'Tulipán Estelar'}
          </h3>

          <p className="script-font text-[26px] sm:text-[30px] text-pink-50 my-2.5 leading-[1.45] whitespace-pre-line drop-shadow-[0_2px_12px_rgba(244,114,182,0.22)]">
            {memory?.verse ?? ''}
          </p>

          <p className="title-font text-[10px] tracking-[0.24em] uppercase text-pink-300/70 mt-3">
            Para la estrella de mi vida
          </p>
        </div>

        {/* Barra inferior de navegación Anterior / Siguiente */}
        <div className="relative flex items-center justify-between gap-3 pt-4 mt-5 border-t border-pink-300/15">
          <button
            type="button"
            onClick={handlePrev}
            className="min-h-[40px] px-4 py-2 rounded-full text-xs font-semibold text-pink-100 bg-white/[0.05] hover:bg-white/[0.12] border border-pink-200/15 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-pink-300" aria-hidden="true" />
            <span>Anterior</span>
          </button>

          <Heart
            className="w-3.5 h-3.5 text-rose-400/75 fill-rose-400/40 shrink-0"
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[40px] px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-500/90 to-pink-500/90 hover:from-rose-500 hover:to-pink-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(244,63,94,0.3)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-300"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
