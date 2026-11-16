import { useCallback, useEffect, useRef, useState } from 'react';
import { BottomDock } from './components/BottomDock';
import { GalaxyCanvas } from './components/GalaxyCanvas';
import { HeaderControls } from './components/HeaderControls';
import { IntroCard } from './components/IntroCard';
import { VerseModal } from './components/VerseModal';
import { TULIP_MEMORIES, type TulipMemory } from './data/tulips';
import { AmbientChimePlayer } from './utils/ambientAudio';

export default function App() {
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null);
  const [lastViewedIndex, setLastViewedIndex] = useState(0);
  const [discoveredIds, setDiscoveredIds] = useState<number[]>([]);

  const audioPlayerRef = useRef<AmbientChimePlayer | null>(null);

  useEffect(() => {
    const player = new AmbientChimePlayer();
    audioPlayerRef.current = player;
    return () => {
      player.dispose();
      audioPlayerRef.current = null;
    };
  }, []);

  const markDiscovered = useCallback((memoryId: number) => {
    setDiscoveredIds((prev) =>
      prev.includes(memoryId) ? prev : [...prev, memoryId],
    );
  }, []);

  const handleToggleViewMode = useCallback(() => {
    setIsAutoRotating((prev) => !prev);
  }, []);

  const handleManualControl = useCallback(() => {
    setIsAutoRotating(false);
  }, []);

  const handleToggleAudio = useCallback(() => {
    setIsAudioPlaying((prev) => {
      const next = !prev;
      if (next) {
        audioPlayerRef.current?.start();
      } else {
        audioPlayerRef.current?.stop();
      }
      return next;
    });
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroReady(true);
  }, []);

  const handleEnterGalaxy = useCallback(() => {
    audioPlayerRef.current?.playEnterChord();
    setIntroReady(false);
    window.setTimeout(() => {
      setIntroDismissed(true);
    }, 500);
  }, []);

  const handleSelectTulip = useCallback(
    (memory: TulipMemory) => {
      const idx = TULIP_MEMORIES.findIndex((item) => item.id === memory.id);
      const resolved = idx >= 0 ? idx : 0;
      setLastViewedIndex(resolved);
      setSelectedMemoryIndex(resolved);
      markDiscovered(TULIP_MEMORIES[resolved].id);
      audioPlayerRef.current?.playMemoryCue(resolved);
    },
    [markDiscovered],
  );

  const handleOpenGallery = useCallback(() => {
    setSelectedMemoryIndex(lastViewedIndex);
    const currentMemory = TULIP_MEMORIES[lastViewedIndex];
    if (currentMemory) {
      markDiscovered(currentMemory.id);
    }
    audioPlayerRef.current?.playMemoryCue(lastViewedIndex);
  }, [lastViewedIndex, markDiscovered]);

  const handleSelectIndex = useCallback(
    (index: number) => {
      const normalized =
        ((index % TULIP_MEMORIES.length) + TULIP_MEMORIES.length) % TULIP_MEMORIES.length;
      setLastViewedIndex(normalized);
      setSelectedMemoryIndex(normalized);
      const currentMemory = TULIP_MEMORIES[normalized];
      if (currentMemory) {
        markDiscovered(currentMemory.id);
      }
      audioPlayerRef.current?.playMemoryCue(normalized);
    },
    [markDiscovered],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedMemoryIndex(null);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      <GalaxyCanvas
        isAutoRotating={isAutoRotating}
        activeMemoryIndex={selectedMemoryIndex}
        discoveredIds={discoveredIds}
        onManualControl={handleManualControl}
        onIntroComplete={handleIntroComplete}
        onSelectTulip={handleSelectTulip}
      />

      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 md:p-8 pointer-events-none">
        <HeaderControls />

        <IntroCard
          visible={introReady}
          dismissed={introDismissed}
          onEnter={handleEnterGalaxy}
        />

        <BottomDock
          isAutoRotating={isAutoRotating}
          isAudioPlaying={isAudioPlaying}
          discoveredCount={discoveredIds.length}
          totalMemories={TULIP_MEMORIES.length}
          onToggleViewMode={handleToggleViewMode}
          onToggleAudio={handleToggleAudio}
          onOpenGallery={handleOpenGallery}
        />
      </div>

      <VerseModal
        memories={TULIP_MEMORIES}
        activeIndex={selectedMemoryIndex}
        discoveredIds={discoveredIds}
        onSelectIndex={handleSelectIndex}
        onClose={handleCloseModal}
      />
    </div>
  );
}
