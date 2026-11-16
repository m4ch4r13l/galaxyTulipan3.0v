import { Heart } from 'lucide-react';

export function HeaderControls() {
  return (
    <header className="w-full flex justify-center items-center max-w-7xl mx-auto pt-1">
      <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
        <span
          className="hidden sm:block w-10 md:w-16 h-px bg-gradient-to-r from-transparent to-pink-300/40"
          aria-hidden="true"
        />
        <div className="glass-panel px-5 py-2 rounded-full flex items-center gap-2.5">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" aria-hidden="true" />
          <span className="title-font text-xs md:text-sm font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-pink-100 via-rose-200 to-pink-400 bg-clip-text text-transparent whitespace-nowrap shrink-0">
            Galaxia 3D de Tulipanes
          </span>
        </div>
        <span
          className="hidden sm:block w-10 md:w-16 h-px bg-gradient-to-l from-transparent to-pink-300/40"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
