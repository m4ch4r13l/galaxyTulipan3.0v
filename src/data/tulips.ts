export type FlowerType = 'tulips' | 'roses' | 'lilies' | 'carnations' | 'mixed';

export interface FlowerOptionMeta {
  id: FlowerType;
  label: string;
  singular: string;
  plural: string;
  description: string;
}

export const FLOWER_OPTIONS: FlowerOptionMeta[] = [
  {
    id: 'tulips',
    label: 'Tulipanes',
    singular: 'Tulipán',
    plural: 'Tulipanes',
    description: 'Pétalos acopados low-poly en 6 tonos estelares',
  },
  {
    id: 'roses',
    label: 'Rosas',
    singular: 'Rosa',
    plural: 'Rosas',
    description: 'Capullos en espiral con capas de pétalos rizados',
  },
  {
    id: 'lilies',
    label: 'Lirios',
    singular: 'Lirio',
    plural: 'Lirios',
    description: 'Estrellas de seis pétalos curvos y estambres largos',
  },
  {
    id: 'carnations',
    label: 'Claveles',
    singular: 'Clavel',
    plural: 'Claveles',
    description: 'Corolas esponjosas de pétalos rizados en tres niveles',
  },
  {
    id: 'mixed',
    label: 'Jardín Mixto',
    singular: 'Flor',
    plural: 'Flores',
    description: 'Combinación de tulipanes, rosas, lirios y claveles',
  },
];

export function getFlowerMeta(type: FlowerType): FlowerOptionMeta {
  return FLOWER_OPTIONS.find((opt) => opt.id === type) ?? FLOWER_OPTIONS[0];
}

export interface TulipMemory {
  id: number;
  title: string;
  verse: string;
  image: string;
}

export interface GalaxyCustomConfig {
  flowerType: FlowerType;
  flowerCount: number;
  headerTitle: string;
  introSubtitle: string;
  introTitle: string;
  introMessage: string;
  dedicationFooter: string;
  memories: TulipMemory[];
}

export interface TulipColorVariant {
  name: string;
  main: number;
  emissive: number;
  petal: number;
  petalEmissive: number;
}

const assetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, '')}`;
};

export const TULIP_MEMORIES: TulipMemory[] = [
  {
    id: 1,
    title: 'Recuerdo Estelar',
    verse: `"Una conexion \ncomo la nuestra.\nEstará.\nHasta cuando nosotros\ndejemos de estar..."`,
    image: assetUrl('assets/aistudio/img1_22161a26.jpeg'),
  },
  {
    id: 2,
    title: 'Recuerdo Estelar',
    verse: `"¿Cómo no amarte vida mía?\nSi eres un sueño,\nen un mundo de pesadillas."`,
    image: assetUrl('assets/aistudio/img2_a12b6e5d.jpeg'),
  },
  {
    id: 3,
    title: 'Recuerdo Estelar',
    verse: `"La vida es bella\nPero tu...\nMi vida...\nEres mas bella\nQue la vida en sí misma."`,
    image: assetUrl('assets/aistudio/img3_ec320f2a.jpeg'),
  },
  {
    id: 4,
    title: 'Recuerdo Estelar',
    verse: `"Si Dios existe, seguro es poeta,\nY te escribió a ti,\nCon perfección y amor en cada\nuna de tus letras..."`,
    image: assetUrl('assets/aistudio/img4_3ab1da46.jpeg'),
  },
  {
    id: 5,
    title: 'Recuerdo Estelar',
    verse: `"Eres mía,\nPorque ni tan tuya has sido,\nComo ya has sido mía.\nY no eras mia como pertenencia,\nComo un objeto.\nEres mía como vinculo perpetuo."`,
    image: assetUrl('assets/aistudio/img5_f7abd738.jpeg'),
  },
  {
    id: 6,
    title: 'Recuerdo Estelar',
    verse: `"Bendito sea Dios, su física\ny su perfecta cencia.\nBendita sea cada coincidencia,\nque permitio tu bendita existencia..."`,
    image: assetUrl('assets/aistudio/img6_e1c2e0d2.jpeg'),
  },
  {
    id: 7,
    title: 'Recuerdo Estelar',
    verse: `"Se que no será fácil pero\nquiero que sigamos siendo\ntu y yo por mucho tiempo\nmás, quiero estar contigo\ntoda mi vida."`,
    image: assetUrl('assets/aistudio/img7_cfff7819.jpeg'),
  },
];

export const DEFAULT_GALAXY_CONFIG: GalaxyCustomConfig = {
  flowerType: 'tulips',
  flowerCount: 47,
  headerTitle: 'Galaxia 3D de Tulipanes',
  introSubtitle: 'Universo Floral',
  introTitle: 'Galaxia de Tulipanes',
  introMessage:
    'Haz clic o toca cualquier flor flotante del universo 3D para descubrir su mensaje.',
  dedicationFooter: 'Para la estrella de mi vida',
  memories: TULIP_MEMORIES,
};

export const TULIP_COLOR_PALETTE: TulipColorVariant[] = [
  { name: 'Rosa', main: 0xf43f5e, emissive: 0xdb2777, petal: 0xfb7185, petalEmissive: 0xe11d48 },
  { name: 'Magenta', main: 0xd946ef, emissive: 0xc026d3, petal: 0xe879f9, petalEmissive: 0xa855f7 },
  { name: 'Carmesí', main: 0xef4444, emissive: 0xdc2626, petal: 0xf87171, petalEmissive: 0xb91c1c },
  { name: 'Dorado', main: 0xfbbf24, emissive: 0xf59e0b, petal: 0xfde047, petalEmissive: 0xd97706 },
  { name: 'Celeste', main: 0x38bdf8, emissive: 0x0284c7, petal: 0x7dd3fc, petalEmissive: 0x0369a1 },
  { name: 'Blanco', main: 0xffffff, emissive: 0xe2e8f0, petal: 0xfff1f2, petalEmissive: 0xcfd2d8 },
];

export const GALAXY_CONFIG = {
  backgroundStarsCount: 8000,
  distantGalaxiesCount: 250,
  coreParticlesCount: 3500,
  nebulaCloudCount: 1200,
  spiralArmsParticlesCount: 22000,
  spiralArms: 6,
  galaxyRadius: 380,
  tulipClusterCount: 47,
  introStartRadius: 2200,
  introTargetRadius: 260,
  minZoomRadius: 90,
  maxZoomRadius: 1200,
} as const;
