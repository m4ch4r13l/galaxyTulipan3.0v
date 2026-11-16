import {
  DEFAULT_GALAXY_CONFIG,
  FLOWER_OPTIONS,
  type FlowerType,
  type GalaxyCustomConfig,
  type TulipMemory,
} from '../data/tulips';

const STORAGE_KEY = 'galaxia_floral_custom_config_v1';

const VALID_FLOWER_TYPES = new Set<FlowerType>(FLOWER_OPTIONS.map((f) => f.id));

function sanitizeMemories(raw: unknown): TulipMemory[] {
  if (!Array.isArray(raw)) return DEFAULT_GALAXY_CONFIG.memories;

  const cleaned: TulipMemory[] = [];
  raw.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const record = item as Partial<TulipMemory>;
    const id = typeof record.id === 'number' && Number.isFinite(record.id) ? record.id : idx + 1;
    const title =
      typeof record.title === 'string' && record.title.trim()
        ? record.title
        : `Recuerdo ${idx + 1}`;
    const verse = typeof record.verse === 'string' ? record.verse : '';
    const image = typeof record.image === 'string' ? record.image : '';
    cleaned.push({ id, title, verse, image });
  });

  return cleaned.length > 0 ? cleaned : DEFAULT_GALAXY_CONFIG.memories;
}

export function normalizeGalaxyConfig(raw: unknown): GalaxyCustomConfig {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_GALAXY_CONFIG;
  }
  const obj = raw as Partial<GalaxyCustomConfig>;

  const flowerType: FlowerType =
    obj.flowerType && VALID_FLOWER_TYPES.has(obj.flowerType)
      ? obj.flowerType
      : DEFAULT_GALAXY_CONFIG.flowerType;

  const flowerCount =
    typeof obj.flowerCount === 'number' && Number.isFinite(obj.flowerCount)
      ? Math.max(15, Math.min(75, Math.round(obj.flowerCount)))
      : DEFAULT_GALAXY_CONFIG.flowerCount;

  return {
    flowerType,
    flowerCount,
    headerTitle:
      typeof obj.headerTitle === 'string' && obj.headerTitle.trim()
        ? obj.headerTitle
        : DEFAULT_GALAXY_CONFIG.headerTitle,
    introSubtitle:
      typeof obj.introSubtitle === 'string'
        ? obj.introSubtitle
        : DEFAULT_GALAXY_CONFIG.introSubtitle,
    introTitle:
      typeof obj.introTitle === 'string' && obj.introTitle.trim()
        ? obj.introTitle
        : DEFAULT_GALAXY_CONFIG.introTitle,
    introMessage:
      typeof obj.introMessage === 'string'
        ? obj.introMessage
        : DEFAULT_GALAXY_CONFIG.introMessage,
    dedicationFooter:
      typeof obj.dedicationFooter === 'string'
        ? obj.dedicationFooter
        : DEFAULT_GALAXY_CONFIG.dedicationFooter,
    memories: sanitizeMemories(obj.memories),
  };
}

export function loadGalaxyConfig(): GalaxyCustomConfig {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GALAXY_CONFIG;
    return normalizeGalaxyConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_GALAXY_CONFIG;
  }
}

export function saveGalaxyConfig(config: GalaxyCustomConfig): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function clearGalaxyConfig(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function compressImageFile(file: File, maxDimension = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        reject(new Error('Archivo vacío.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no válido.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export function downloadConfigJson(config: GalaxyCustomConfig): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `galaxia-${config.flowerType}-personalizada.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
