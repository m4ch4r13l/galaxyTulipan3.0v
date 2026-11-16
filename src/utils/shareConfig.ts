import {
  DEFAULT_GALAXY_CONFIG,
  type FlowerType,
  type GalaxyCustomConfig,
  type TulipMemory,
} from '../data/tulips';
import { normalizeGalaxyConfig } from './galaxyStorage';

const SHARE_HASH_PREFIX = '#g=';

interface CompactMemory {
  i: number;
  t: string;
  v: string;
  p: string;
}

interface CompactSharePayload {
  f: FlowerType;
  n: number;
  ht: string;
  is: string;
  it: string;
  im: string;
  df: string;
  m: CompactMemory[];
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  const padded = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function compressDeflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new CompressionStream('deflate-raw'));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function decompressDeflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

function shrinkDataUrlForLink(
  dataUrl: string,
  maxDimension = 420,
  quality = 0.6,
): Promise<string> {
  if (!dataUrl.startsWith('data:image/')) {
    return Promise.resolve(dataUrl);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

function encodeImageRef(image: string): Promise<string> {
  const defaultIdx = DEFAULT_GALAXY_CONFIG.memories.findIndex(
    (m) => m.image === image,
  );
  if (defaultIdx >= 0) {
    return Promise.resolve(`@${defaultIdx + 1}`);
  }
  if (image.startsWith('data:image/')) {
    return shrinkDataUrlForLink(image);
  }
  return Promise.resolve(image);
}

function decodeImageRef(ref: string): string {
  if (/^@\d+$/.test(ref)) {
    const idx = Number(ref.slice(1)) - 1;
    return DEFAULT_GALAXY_CONFIG.memories[idx]?.image ?? '';
  }
  return ref;
}

export function hasShareConfigInUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hash.startsWith(SHARE_HASH_PREFIX) &&
    window.location.hash.length > SHARE_HASH_PREFIX.length;
}

export async function generateShareUrl(
  config: GalaxyCustomConfig,
): Promise<{ url: string; embeddedPhotoCount: number }> {
  let embeddedPhotoCount = 0;
  const compactMemories: CompactMemory[] = await Promise.all(
    config.memories.map(async (m) => {
      if (m.image.startsWith('data:image/')) {
        embeddedPhotoCount += 1;
      }
      return {
        i: m.id,
        t: m.title,
        v: m.verse,
        p: await encodeImageRef(m.image),
      };
    }),
  );

  const payload: CompactSharePayload = {
    f: config.flowerType,
    n: config.flowerCount,
    ht: config.headerTitle,
    is: config.introSubtitle,
    it: config.introTitle,
    im: config.introMessage,
    df: config.dedicationFooter,
    m: compactMemories,
  };

  const jsonBytes = new TextEncoder().encode(JSON.stringify(payload));
  let token: string;

  if (typeof CompressionStream !== 'undefined') {
    const compressed = await compressDeflate(jsonBytes);
    token = `z1_${bytesToBase64Url(compressed)}`;
  } else {
    token = `r1_${bytesToBase64Url(jsonBytes)}`;
  }

  const baseUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  return {
    url: `${baseUrl}${SHARE_HASH_PREFIX}${token}`,
    embeddedPhotoCount,
  };
}

export async function decodeShareConfigFromUrl(): Promise<GalaxyCustomConfig | null> {
  if (!hasShareConfigInUrl()) return null;
  const token = window.location.hash.slice(SHARE_HASH_PREFIX.length);

  try {
    let jsonBytes: Uint8Array;
    if (token.startsWith('z1_')) {
      if (typeof DecompressionStream === 'undefined') return null;
      const compressed = base64UrlToBytes(token.slice(3));
      jsonBytes = await decompressDeflate(compressed);
    } else if (token.startsWith('r1_')) {
      jsonBytes = base64UrlToBytes(token.slice(3));
    } else {
      return null;
    }

    const jsonText = new TextDecoder().decode(jsonBytes);
    const parsed = JSON.parse(jsonText) as Partial<CompactSharePayload>;

    const expandedMemories: TulipMemory[] = Array.isArray(parsed.m)
      ? parsed.m.map((item, idx) => ({
          id: typeof item.i === 'number' ? item.i : idx + 1,
          title: typeof item.t === 'string' ? item.t : `Recuerdo ${idx + 1}`,
          verse: typeof item.v === 'string' ? item.v : '',
          image: typeof item.p === 'string' ? decodeImageRef(item.p) : '',
        }))
      : DEFAULT_GALAXY_CONFIG.memories;

    return normalizeGalaxyConfig({
      flowerType: parsed.f,
      flowerCount: parsed.n,
      headerTitle: parsed.ht,
      introSubtitle: parsed.is,
      introTitle: parsed.it,
      introMessage: parsed.im,
      dedicationFooter: parsed.df,
      memories: expandedMemories,
    });
  } catch {
    return null;
  }
}
