import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomDock } from './components/BottomDock';
import { GalaxyCanvas } from './components/GalaxyCanvas';
import { HeaderControls } from './components/HeaderControls';
import { IntroCard } from './components/IntroCard';
import { SettingsModal } from './components/SettingsModal';
import { VerseModal } from './components/VerseModal';
import {
  DEFAULT_GALAXY_CONFIG,
  getFlowerMeta,
  type GalaxyCustomConfig,
  type TulipMemory,
} from './data/tulips';
import { AmbientChimePlayer } from './utils/ambientAudio';
import {
  clearGalaxyConfig,
  loadGalaxyConfig,
  saveGalaxyConfig,
} from './utils/galaxyStorage';
import {
  decodeShareConfigFromUrl,
  hasShareConfigInUrl,
} from './utils/shareConfig';

export default function App() {
  const [isSharedView, setIsSharedView] = useState<boolean>(() =>
    hasShareConfigInUrl(),
  );
  const [isShareReady, setIsShareReady] = useState<boolean>(
    () => !hasShareConfigInUrl(),
  );
  const [config, setConfig] = useState<GalaxyCustomConfig>(() =>
    hasShareConfigInUrl() ? DEFAULT_GALAXY_CONFIG : loadGalaxyConfig(),
  );
  const [storageWarning, setStorageWarning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null);
  const [lastViewedIndex, setLastViewedIndex] = useState(0);
  const [discoveredIds, setDiscoveredIds] = useState<number[]>([]);

  const audioPlayerRef = useRef<AmbientChimePlayer | null>(null);

  useEffect(() => {
    let active = true;

    const syncFromHash = async () => {
      if (!hasShareConfigInUrl()) {
        if (!active) return;
        setIsSharedView(false);
        setConfig(loadGalaxyConfig());
        setIsShareReady(true);
        return;
      }

      setIsSharedView(true);
      setIsSettingsOpen(false);
      const decoded = await decodeShareConfigFromUrl();
      if (!active) return;
      if (decoded) {
        setConfig(decoded);
      } else {
        setConfig(DEFAULT_GALAXY_CONFIG);
      }
      setIsShareReady(true);
    };

    if (hasShareConfigInUrl()) {
      void syncFromHash();
    }

    const onHashChange = () => {
      void syncFromHash();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      active = false;
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const flowerMeta = useMemo(
    () => getFlowerMeta(config.flowerType),
    [config.flowerType],
  );

  useEffect(() => {
    const player = new AmbientChimePlayer();
    audioPlayerRef.current = player;
    return () => {
      player.dispose();
      audioPlayerRef.current = null;
    };
  }, []);

  const handleChangeConfig = useCallback(
    (next: GalaxyCustomConfig) => {
      if (isSharedView) return;
      setConfig(next);
      const saved = saveGalaxyConfig(next);
      setStorageWarning(!saved);
      setDiscoveredIds((prev) =>
        prev.filter((id) => next.memories.some((m) => m.id === id)),
      );
      setLastViewedIndex((prev) =>
        next.memories.length > 0 ? Math.min(prev, next.memories.length - 1) : 0,
      );
    },
    [isSharedView],
  );

  const handleResetConfig = useCallback(() => {
    if (isSharedView) return;
    clearGalaxyConfig();
    setConfig(DEFAULT_GALAXY_CONFIG);
    setStorageWarning(false);
    setDiscoveredIds([]);
    setLastViewedIndex(0);
    setSelectedMemoryIndex(null);
  }, [isSharedView]);

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

  const handleTulipClick = useCallback(
    (memory: TulipMemory) => {
      const idx = config.memories.findIndex((item) => item.id === memory.id);
      const resolved = idx >= 0 ? idx : 0;
      audioPlayerRef.current?.playMemoryCue(resolved);
    },
    [config.memories],
  );

  const handleSelectTulip = useCallback(
    (memory: TulipMemory) => {
      const idx = config.memories.findIndex((item) => item.id === memory.id);
      const resolved = idx >= 0 ? idx : 0;
      setLastViewedIndex(resolved);
      setSelectedMemoryIndex(resolved);
      if (config.memories[resolved]) {
        markDiscovered(config.memories[resolved].id);
      }
    },
    [config.memories, markDiscovered],
  );

  const handleOpenGallery = useCallback(() => {
    if (config.memories.length === 0) return;
    const safeIdx = Math.min(lastViewedIndex, config.memories.length - 1);
    setSelectedMemoryIndex(safeIdx);
    const currentMemory = config.memories[safeIdx];
    if (currentMemory) {
      markDiscovered(currentMemory.id);
    }
    audioPlayerRef.current?.playMemoryCue(safeIdx);
  }, [config.memories, lastViewedIndex, markDiscovered]);

  const handleSelectIndex = useCallback(
    (index: number) => {
      if (config.memories.length === 0) return;
      const normalized =
        ((index % config.memories.length) + config.memories.length) %
        config.memories.length;
      setLastViewedIndex(normalized);
      setSelectedMemoryIndex(normalized);
      const currentMemory = config.memories[normalized];
      if (currentMemory) {
        markDiscovered(currentMemory.id);
      }
      audioPlayerRef.current?.playMemoryCue(normalized);
    },
    [config.memories, markDiscovered],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedMemoryIndex(null);
  }, []);

  if (!isShareReady) {
    return <div className="w-screen h-screen bg-[#0b0212]" />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      <GalaxyCanvas
        flowerType={config.flowerType}
        flowerCount={config.flowerCount}
        memories={config.memories}
        isAutoRotating={isAutoRotating}
        activeMemoryIndex={selectedMemoryIndex}
        discoveredIds={discoveredIds}
        onManualControl={handleManualControl}
        onIntroComplete={handleIntroComplete}
        onTulipClick={handleTulipClick}
        onSelectTulip={handleSelectTulip}
      />

      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 md:p-8 pointer-events-none">
        <HeaderControls
          title={config.headerTitle}
          showSettingsButton={!isSharedView}
          onOpenSettings={() => {
            if (isSharedView) return;
            setSelectedMemoryIndex(null);
            setIsSettingsOpen(true);
          }}
        />

        <IntroCard
          visible={introReady}
          dismissed={introDismissed}
          subtitle={config.introSubtitle}
          title={config.introTitle}
          message={config.introMessage}
          onEnter={handleEnterGalaxy}
        />

        <BottomDock
          flowerPlural={flowerMeta.plural}
          flowerSingular={flowerMeta.singular}
          isAutoRotating={isAutoRotating}
          isAudioPlaying={isAudioPlaying}
          discoveredCount={discoveredIds.length}
          totalMemories={config.memories.length}
          onToggleViewMode={handleToggleViewMode}
          onToggleAudio={handleToggleAudio}
          onOpenGallery={handleOpenGallery}
        />
      </div>

      <VerseModal
        memories={config.memories}
        activeIndex={selectedMemoryIndex}
        discoveredIds={discoveredIds}
        flowerSingular={flowerMeta.singular}
        dedicationFooter={config.dedicationFooter}
        onSelectIndex={handleSelectIndex}
        onClose={handleCloseModal}
      />

      {!isSharedView && (
        <SettingsModal
          isOpen={isSettingsOpen}
          config={config}
          storageWarning={storageWarning}
          onChangeConfig={handleChangeConfig}
          onResetConfig={handleResetConfig}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
