export interface TulipMemory {
  id: number;
  title: string;
  verse: string;
  image: string;
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
    title: 'Tulipán Estelar',
    verse: `"Una conexion \ncomo la nuestra.\nEstará.\nHasta cuando nosotros\ndejemos de estar..."`,
    image: assetUrl('assets/aistudio/img1_22161a26.jpeg'),
  },
  {
    id: 2,
    title: 'Tulipán Estelar',
    verse: `"¿Cómo no amarte vida mía?\nSi eres un sueño,\nen un mundo de pesadillas."`,
    image: assetUrl('assets/aistudio/img2_a12b6e5d.jpeg'),
  },
  {
    id: 3,
    title: 'Tulipán Estelar',
    verse: `"La vida es bella\nPero tu...\nMi vida...\nEres mas bella\nQue la vida en sí misma."`,
    image: assetUrl('assets/aistudio/img3_ec320f2a.jpeg'),
  },
  {
    id: 4,
    title: 'Tulipán Estelar',
    verse: `"Si Dios existe, seguro es poeta,\nY te escribió a ti,\nCon perfección y amor en cada\nuna de tus letras..."`,
    image: assetUrl('assets/aistudio/img4_3ab1da46.jpeg'),
  },
  {
    id: 5,
    title: 'Tulipán Estelar',
    verse: `"Eres mía,\nPorque ni tan tuya has sido,\nComo ya has sido mía.\nY no eras mia como pertenencia,\nComo un objeto.\nEres mía como vinculo perpetuo."`,
    image: assetUrl('assets/aistudio/img5_f7abd738.jpeg'),
  },
  {
    id: 6,
    title: 'Tulipán Estelar',
    verse: `"Bendito sea Dios, su física\ny su perfecta cencia.\nBendita sea cada coincidencia,\nque permitio tu bendita existencia..."`,
    image: assetUrl('assets/aistudio/img6_e1c2e0d2.jpeg'),
  },
  {
    id: 7,
    title: 'Tulipán Estelar',
    verse: `"Se que no será fácil pero\nquiero que sigamos siendo\ntu y yo por mucho tiempo\nmás, quiero estar contigo\ntoda mi vida."`,
    image: assetUrl('assets/aistudio/img7_cfff7819.jpeg'),
  },
];

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
