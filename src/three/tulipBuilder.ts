import * as THREE from 'three';
import {
  GALAXY_CONFIG,
  TULIP_COLOR_PALETTE,
  TULIP_MEMORIES,
  type TulipMemory,
} from '../data/tulips';

export interface TulipUserData {
  id: number;
  memory: TulipMemory;
  originalY: number;
  baseScale: number;
  rotSpeed: number;
  baseColor: number;
  outerPetals: THREE.Mesh[];
  innerPetals: THREE.Mesh[];
  auraSprite: THREE.Sprite;
  bloomFactor: number;
}

interface SharedTulipResources {
  stemGeo: THREE.TubeGeometry;
  stemMat: THREE.MeshStandardMaterial;
  calyxGeo: THREE.LatheGeometry;
  calyxMat: THREE.MeshStandardMaterial;
  leafGeo: THREE.BufferGeometry;
  leafMat: THREE.MeshStandardMaterial;
  outerPetalGeo: THREE.BufferGeometry;
  innerPetalGeo: THREE.BufferGeometry;
  pistilGeo: THREE.CylinderGeometry;
  pistilCrownGeo: THREE.OctahedronGeometry;
  pistilMat: THREE.MeshStandardMaterial;
  filamentGeo: THREE.CylinderGeometry;
  antherGeo: THREE.OctahedronGeometry;
  filamentMat: THREE.MeshStandardMaterial;
  antherMat: THREE.MeshStandardMaterial;
  hitProxyGeo: THREE.CylinderGeometry;
  hitProxyMat: THREE.MeshBasicMaterial;
  variantMaterials: Array<{
    outerPetalMat: THREE.MeshStandardMaterial;
    innerPetalMat: THREE.MeshStandardMaterial;
    baseColor: number;
  }>;
}

function createLowPolyPetalGeometry(
  height: number,
  maxWidth: number,
  cupDepth: number,
  inwardCurl: number,
): THREE.BufferGeometry {
  const cols = 4;
  const rows = 5;

  const positions: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const widthProfile =
      0.22 +
      Math.sin(Math.pow(v, 0.72) * Math.PI) * maxWidth * (1 - 0.18 * v);
    const y = v * height;

    const radialBelly = Math.sin(v * Math.PI * 0.86) * cupDepth;
    const tipCurl = v > 0.65 ? -Math.pow((v - 0.65) / 0.35, 1.7) * inwardCurl : 0;

    for (let c = 0; c <= cols; c++) {
      const u = (c / cols) * 2 - 1;
      const x = u * widthProfile;

      const spoonCurve = -(u * u) * (0.48 * Math.sin(v * Math.PI) + 0.12);
      const midribKeel = (1 - Math.abs(u)) * 0.14 * Math.sin(v * Math.PI);
      const z = radialBelly + tipCurl + spoonCurve + midribKeel;

      positions.push(x, y, z);
    }
  }

  const stride = cols + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * stride + c;
      const b = a + 1;
      const d = (r + 1) * stride + c;
      const e = d + 1;

      indices.push(a, d, b);
      indices.push(b, d, e);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createLowPolyLeafGeometry(length: number, maxWidth: number): THREE.BufferGeometry {
  const rows = 5;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const halfW = Math.sin(Math.pow(v, 0.65) * Math.PI) * maxWidth * (1 - v * 0.15);
    const y = v * length;
    const archOut = Math.pow(v, 1.45) * 2.9;
    const foldDepth = halfW * 0.42;

    positions.push(-halfW, y, archOut + foldDepth);
    positions.push(0, y, archOut);
    positions.push(halfW, y, archOut + foldDepth);
  }

  for (let r = 0; r < rows; r++) {
    const row0 = r * 3;
    const row1 = (r + 1) * 3;
    indices.push(row0, row1, row0 + 1);
    indices.push(row0 + 1, row1, row1 + 1);
    indices.push(row0 + 1, row1 + 1, row0 + 2);
    indices.push(row0 + 2, row1 + 1, row1 + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createSharedTulipResources(): SharedTulipResources {
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -14.5, 0),
    new THREE.Vector3(0.28, -9.8, 0.12),
    new THREE.Vector3(-0.22, -4.8, -0.1),
    new THREE.Vector3(0, -0.4, 0),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 8, 0.34, 6, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    roughness: 0.68,
    metalness: 0.05,
    flatShading: true,
  });

  const calyxPoints = [
    new THREE.Vector2(0.32, -0.6),
    new THREE.Vector2(0.55, -0.1),
    new THREE.Vector2(1.05, 0.35),
    new THREE.Vector2(0.82, 0.58),
    new THREE.Vector2(0, 0.52),
  ];
  const calyxGeo = new THREE.LatheGeometry(calyxPoints, 6);
  const calyxMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.58,
    metalness: 0.05,
    flatShading: true,
  });

  const leafGeo = createLowPolyLeafGeometry(7.6, 1.35);
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    emissive: 0x052e16,
    emissiveIntensity: 0.25,
    roughness: 0.55,
    metalness: 0.06,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const outerPetalGeo = createLowPolyPetalGeometry(5.6, 1.55, 1.55, 0.55);
  const innerPetalGeo = createLowPolyPetalGeometry(5.9, 1.4, 1.35, 0.72);

  const pistilGeo = new THREE.CylinderGeometry(0.18, 0.32, 2.3, 5);
  const pistilCrownGeo = new THREE.OctahedronGeometry(0.42, 0);
  const pistilMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 0.65,
    roughness: 0.35,
    flatShading: true,
  });

  const filamentGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.7, 4);
  const filamentMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.3,
    roughness: 0.45,
    flatShading: true,
  });

  const antherGeo = new THREE.OctahedronGeometry(0.22, 0);
  const antherMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.2,
    flatShading: true,
  });

  const hitProxyGeo = new THREE.CylinderGeometry(2.8, 1.9, 13.5, 6);
  const hitProxyMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const variantMaterials = TULIP_COLOR_PALETTE.map((variant) => ({
    outerPetalMat: new THREE.MeshStandardMaterial({
      color: variant.main,
      emissive: variant.emissive,
      emissiveIntensity: 0.42,
      roughness: 0.28,
      metalness: 0.12,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
    innerPetalMat: new THREE.MeshStandardMaterial({
      color: variant.petal,
      emissive: variant.petalEmissive,
      emissiveIntensity: 0.48,
      roughness: 0.24,
      metalness: 0.14,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
    baseColor: variant.main,
  }));

  return {
    stemGeo,
    stemMat,
    calyxGeo,
    calyxMat,
    leafGeo,
    leafMat,
    outerPetalGeo,
    innerPetalGeo,
    pistilGeo,
    pistilCrownGeo,
    pistilMat,
    filamentGeo,
    antherGeo,
    filamentMat,
    antherMat,
    hitProxyGeo,
    hitProxyMat,
    variantMaterials,
  };
}

function createSingleTulipMesh(
  resources: SharedTulipResources,
  particleTexture: THREE.Texture,
): {
  group: THREE.Group;
  baseColor: number;
  outerPetals: THREE.Mesh[];
  innerPetals: THREE.Mesh[];
  auraSprite: THREE.Sprite;
} {
  const tulipGroup = new THREE.Group();

  const stem = new THREE.Mesh(resources.stemGeo, resources.stemMat);
  tulipGroup.add(stem);

  const calyx = new THREE.Mesh(resources.calyxGeo, resources.calyxMat);
  tulipGroup.add(calyx);

  const leafPrimary = new THREE.Mesh(resources.leafGeo, resources.leafMat);
  leafPrimary.position.set(0.15, -12.6, 0.15);
  leafPrimary.rotation.set(0.24, 0.35, -0.18);
  tulipGroup.add(leafPrimary);

  const leafSecondary = new THREE.Mesh(resources.leafGeo, resources.leafMat);
  leafSecondary.scale.set(0.84, 0.86, 0.84);
  leafSecondary.position.set(-0.15, -10.8, -0.1);
  leafSecondary.rotation.set(0.28, Math.PI + 0.55, 0.16);
  tulipGroup.add(leafSecondary);

  const variant =
    resources.variantMaterials[
      Math.floor(Math.random() * resources.variantMaterials.length)
    ];

  const blossom = new THREE.Group();
  blossom.position.y = 0.28;
  tulipGroup.add(blossom);

  const outerPetals: THREE.Mesh[] = [];
  const innerPetals: THREE.Mesh[] = [];

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;

    const outerHolder = new THREE.Group();
    outerHolder.rotation.y = angle;
    const outerPetal = new THREE.Mesh(resources.outerPetalGeo, variant.outerPetalMat);
    outerPetal.position.set(0, 0, 0.55);
    outerPetal.rotation.x = 0.18;
    outerHolder.add(outerPetal);
    blossom.add(outerHolder);
    outerPetals.push(outerPetal);

    const innerHolder = new THREE.Group();
    innerHolder.rotation.y = angle + Math.PI / 3;
    const innerPetal = new THREE.Mesh(resources.innerPetalGeo, variant.innerPetalMat);
    innerPetal.position.set(0, 0.15, 0.38);
    innerPetal.rotation.x = 0.05;
    innerHolder.add(innerPetal);
    blossom.add(innerHolder);
    innerPetals.push(innerPetal);
  }

  const pistil = new THREE.Mesh(resources.pistilGeo, resources.pistilMat);
  pistil.position.y = 1.45;
  blossom.add(pistil);

  const pistilCrown = new THREE.Mesh(resources.pistilCrownGeo, resources.pistilMat);
  pistilCrown.scale.set(1.15, 0.72, 1.15);
  pistilCrown.position.y = 2.65;
  blossom.add(pistilCrown);

  for (let s = 0; s < 6; s++) {
    const sAngle = (s * Math.PI * 2) / 6;
    const stamenGroup = new THREE.Group();
    stamenGroup.rotation.y = sAngle;

    const filament = new THREE.Mesh(resources.filamentGeo, resources.filamentMat);
    filament.position.set(0, 1.25, 0.45);
    filament.rotation.x = 0.2;
    stamenGroup.add(filament);

    const anther = new THREE.Mesh(resources.antherGeo, resources.antherMat);
    anther.scale.set(0.75, 1.45, 0.75);
    anther.position.set(0, 2.15, 0.62);
    anther.rotation.x = 0.25;
    stamenGroup.add(anther);

    blossom.add(stamenGroup);
  }

  // Luminous aura sprite distinguishing unexplored, explored, hovered, and focused tulips
  const auraMat = new THREE.SpriteMaterial({
    map: particleTexture,
    color: 0xfde68a,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const auraSprite = new THREE.Sprite(auraMat);
  auraSprite.position.set(0, 2.9, 0);
  auraSprite.scale.set(11, 11, 1);
  auraSprite.layers.set(0); // Visual only, never blocks raycasts
  tulipGroup.add(auraSprite);

  const hitProxy = new THREE.Mesh(resources.hitProxyGeo, resources.hitProxyMat);
  hitProxy.position.y = -3.2;
  hitProxy.layers.set(1);
  tulipGroup.add(hitProxy);

  return {
    group: tulipGroup,
    baseColor: variant.baseColor,
    outerPetals,
    innerPetals,
    auraSprite,
  };
}

export function createTulipClusters(
  scene: THREE.Scene,
  particleTexture: THREE.Texture,
): {
  tulips: THREE.Group[];
  disposeSharedTulips: () => void;
} {
  const resources = createSharedTulipResources();
  const tulips: THREE.Group[] = [];

  for (let i = 0; i < GALAXY_CONFIG.tulipClusterCount; i++) {
    const {
      group: tulipMesh,
      baseColor,
      outerPetals,
      innerPetals,
      auraSprite,
    } = createSingleTulipMesh(resources, particleTexture);
    const theta = Math.random() * Math.PI * 2;
    const r = 90 + Math.random() * 240;

    tulipMesh.position.x = Math.cos(theta) * r;
    tulipMesh.position.y = (Math.random() - 0.5) * 60;
    tulipMesh.position.z = Math.sin(theta) * r;

    const baseScale = Math.random() * 0.7 + 1.0;
    tulipMesh.scale.set(baseScale, baseScale, baseScale);

    tulipMesh.rotation.x = (Math.random() - 0.5) * 0.22;
    tulipMesh.rotation.z = (Math.random() - 0.5) * 0.22;

    const memory = TULIP_MEMORIES[i % TULIP_MEMORIES.length];
    const userData: TulipUserData = {
      id: i,
      memory,
      originalY: tulipMesh.position.y,
      baseScale,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      baseColor,
      outerPetals,
      innerPetals,
      auraSprite,
      bloomFactor: 0,
    };
    tulipMesh.userData = userData;

    // Enable layer 1 on interactive flower parts (keep auraSprite on layer 0 only)
    tulipMesh.traverse((child) => {
      if (child !== auraSprite) {
        child.layers.enable(1);
      }
    });

    scene.add(tulipMesh);
    tulips.push(tulipMesh);
  }

  const disposeSharedTulips = () => {
    tulips.forEach((tulip) => {
      const data = tulip.userData as Partial<TulipUserData>;
      data.auraSprite?.material.dispose();
    });
    resources.stemGeo.dispose();
    resources.stemMat.dispose();
    resources.calyxGeo.dispose();
    resources.calyxMat.dispose();
    resources.leafGeo.dispose();
    resources.leafMat.dispose();
    resources.outerPetalGeo.dispose();
    resources.innerPetalGeo.dispose();
    resources.pistilGeo.dispose();
    resources.pistilCrownGeo.dispose();
    resources.pistilMat.dispose();
    resources.filamentGeo.dispose();
    resources.antherGeo.dispose();
    resources.filamentMat.dispose();
    resources.antherMat.dispose();
    resources.hitProxyGeo.dispose();
    resources.hitProxyMat.dispose();
    resources.variantMaterials.forEach((v) => {
      v.outerPetalMat.dispose();
      v.innerPetalMat.dispose();
    });
  };

  return { tulips, disposeSharedTulips };
}
