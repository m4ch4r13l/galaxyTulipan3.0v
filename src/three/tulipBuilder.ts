import * as THREE from 'three';
import {
  TULIP_COLOR_PALETTE,
  type FlowerType,
  type TulipMemory,
} from '../data/tulips';

export type ConcreteFlowerSpecies = 'tulips' | 'roses' | 'lilies' | 'carnations';

export interface PetalBinding {
  mesh: THREE.Mesh;
  baseTiltX: number;
  bloomDeltaX: number;
}

export interface TulipUserData {
  id: number;
  memory: TulipMemory;
  species: ConcreteFlowerSpecies;
  originalY: number;
  baseScale: number;
  rotSpeed: number;
  baseColor: number;
  petalBindings: PetalBinding[];
  auraSprite: THREE.Sprite;
  bloomFactor: number;
}

interface SharedFlowerResources {
  stemGeo: THREE.TubeGeometry;
  stemMat: THREE.MeshStandardMaterial;
  calyxGeo: THREE.LatheGeometry;
  roseCalyxGeo: THREE.LatheGeometry;
  carnationCalyxGeo: THREE.LatheGeometry;
  calyxMat: THREE.MeshStandardMaterial;
  leafGeo: THREE.BufferGeometry;
  roseLeafGeo: THREE.BufferGeometry;
  lilyLeafGeo: THREE.BufferGeometry;
  carnationLeafGeo: THREE.BufferGeometry;
  sepalGeo: THREE.BufferGeometry;
  leafMat: THREE.MeshStandardMaterial;
  outerPetalGeo: THREE.BufferGeometry;
  innerPetalGeo: THREE.BufferGeometry;
  roseInnerPetalGeo: THREE.BufferGeometry;
  roseMidPetalGeo: THREE.BufferGeometry;
  roseOuterPetalGeo: THREE.BufferGeometry;
  lilyOuterTepalGeo: THREE.BufferGeometry;
  lilyInnerTepalGeo: THREE.BufferGeometry;
  carnationOuterPetalGeo: THREE.BufferGeometry;
  carnationInnerPetalGeo: THREE.BufferGeometry;
  pistilGeo: THREE.CylinderGeometry;
  lilyPistilGeo: THREE.CylinderGeometry;
  pistilCrownGeo: THREE.OctahedronGeometry;
  pistilMat: THREE.MeshStandardMaterial;
  filamentGeo: THREE.CylinderGeometry;
  lilyFilamentGeo: THREE.CylinderGeometry;
  antherGeo: THREE.OctahedronGeometry;
  lilyAntherGeo: THREE.BoxGeometry;
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

function createRosePetalGeometry(
  height: number,
  maxWidth: number,
  cupDepth: number,
  lipRollBack: number,
): THREE.BufferGeometry {
  const cols = 4;
  const rows = 5;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const widthProfile =
      0.24 + Math.sin(Math.pow(v, 0.58) * Math.PI * 0.92) * maxWidth;
    const y = v * height;
    const belly = Math.sin(v * Math.PI * 0.85) * cupDepth;
    // Outward rolled upper edge characteristic of blooming roses
    const outerRoll = v > 0.62 ? Math.pow((v - 0.62) / 0.38, 1.6) * lipRollBack : 0;

    for (let c = 0; c <= cols; c++) {
      const u = (c / cols) * 2 - 1;
      const x = u * widthProfile;
      const heartDip = v > 0.85 ? -Math.abs(u) * 0.08 + (1 - Math.abs(u)) * 0.06 : 0;
      const cupWrap = -(u * u) * (0.55 * Math.sin(v * Math.PI * 0.9) + 0.14);
      const z = belly + outerRoll + cupWrap;

      positions.push(x, y + heartDip, z);
    }
  }

  const stride = cols + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * stride + c;
      const b = a + 1;
      const d = (r + 1) * stride + c;
      const e = d + 1;
      indices.push(a, d, b, b, d, e);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createLilyTepalGeometry(
  length: number,
  maxWidth: number,
  archBack: number,
): THREE.BufferGeometry {
  const cols = 4;
  const rows = 6;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    // Lance-shaped profile: narrow claw, wide mid-belly, sharp pointed tip
    const widthProfile =
      0.16 + Math.pow(Math.sin(v * Math.PI), 0.78) * maxWidth * (1 - 0.32 * v);
    const y = v * length;
    const trumpetCurve = Math.pow(v, 1.8) * archBack;

    for (let c = 0; c <= cols; c++) {
      const u = (c / cols) * 2 - 1;
      const x = u * widthProfile;
      // Distinct central ridge / keel and subtle wavy edges
      const midrib = (1 - Math.abs(u)) * 0.28 * Math.sin(v * Math.PI);
      const edgeCurl = (u * u) * 0.22 * v;
      const z = trumpetCurve + midrib - edgeCurl;
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
      indices.push(a, d, b, b, d, e);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createCarnationPetalGeometry(
  height: number,
  fanWidth: number,
  ruffleAmp: number,
): THREE.BufferGeometry {
  const cols = 6;
  const rows = 4;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const widthProfile = 0.16 + Math.pow(v, 0.78) * fanWidth;
    const baseY = v * height;

    for (let c = 0; c <= cols; c++) {
      const u = (c / cols) * 2 - 1;
      const x = u * widthProfile;
      // Serrated/pinked carnation top margin
      const tooth = v > 0.75 ? ((c % 2 === 0 ? 1 : -1) * 0.22 * (v - 0.75) * 4) : 0;
      // Pleated zig-zag radial ruffles
      const pleat = ((c % 2 === 0 ? 1 : -1) * ruffleAmp * Math.pow(v, 1.2));
      const cup = Math.sin(v * Math.PI * 0.6) * 0.45 - (u * u) * 0.28 * v;
      const z = cup + pleat;
      positions.push(x, baseY + tooth, z);
    }
  }

  const stride = cols + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * stride + c;
      const b = a + 1;
      const d = (r + 1) * stride + c;
      const e = d + 1;
      indices.push(a, d, b, b, d, e);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createLowPolyLeafGeometry(
  length: number,
  maxWidth: number,
  archAmount = 2.9,
): THREE.BufferGeometry {
  const rows = 5;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const halfW = Math.sin(Math.pow(v, 0.65) * Math.PI) * maxWidth * (1 - v * 0.15);
    const y = v * length;
    const archOut = Math.pow(v, 1.45) * archAmount;
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

function createSharedFlowerResources(): SharedFlowerResources {
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

  const roseCalyxPoints = [
    new THREE.Vector2(0.3, -0.9),
    new THREE.Vector2(0.75, -0.3),
    new THREE.Vector2(0.95, 0.25),
    new THREE.Vector2(0.65, 0.55),
    new THREE.Vector2(0, 0.45),
  ];
  const roseCalyxGeo = new THREE.LatheGeometry(roseCalyxPoints, 6);

  const carnationCalyxPoints = [
    new THREE.Vector2(0.32, -1.2),
    new THREE.Vector2(0.62, -0.4),
    new THREE.Vector2(0.72, 0.45),
    new THREE.Vector2(0.92, 0.95),
    new THREE.Vector2(0, 0.78),
  ];
  const carnationCalyxGeo = new THREE.LatheGeometry(carnationCalyxPoints, 7);

  const calyxMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.58,
    metalness: 0.05,
    flatShading: true,
  });

  const leafGeo = createLowPolyLeafGeometry(7.6, 1.35, 2.9);
  const roseLeafGeo = createLowPolyLeafGeometry(4.6, 1.05, 2.4);
  const lilyLeafGeo = createLowPolyLeafGeometry(6.2, 0.72, 3.3);
  const carnationLeafGeo = createLowPolyLeafGeometry(5.6, 0.48, 2.8);
  const sepalGeo = createLowPolyLeafGeometry(2.1, 0.42, 1.15);

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    emissive: 0x052e16,
    emissiveIntensity: 0.25,
    roughness: 0.55,
    metalness: 0.06,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  // Tulip petals
  const outerPetalGeo = createLowPolyPetalGeometry(5.6, 1.55, 1.55, 0.55);
  const innerPetalGeo = createLowPolyPetalGeometry(5.9, 1.4, 1.35, 0.72);

  // Rose petals
  const roseInnerPetalGeo = createRosePetalGeometry(3.7, 1.3, 0.75, 0.25);
  const roseMidPetalGeo = createRosePetalGeometry(4.3, 1.65, 1.05, 0.55);
  const roseOuterPetalGeo = createRosePetalGeometry(4.7, 1.95, 1.25, 0.9);

  // Lily tepals
  const lilyOuterTepalGeo = createLilyTepalGeometry(6.3, 1.45, 2.35);
  const lilyInnerTepalGeo = createLilyTepalGeometry(6.1, 1.25, 2.0);

  // Carnation petals
  const carnationOuterPetalGeo = createCarnationPetalGeometry(3.9, 1.55, 0.38);
  const carnationInnerPetalGeo = createCarnationPetalGeometry(3.4, 1.25, 0.34);

  const pistilGeo = new THREE.CylinderGeometry(0.18, 0.32, 2.3, 5);
  const lilyPistilGeo = new THREE.CylinderGeometry(0.11, 0.2, 4.4, 5);
  const pistilCrownGeo = new THREE.OctahedronGeometry(0.42, 0);
  const pistilMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 0.65,
    roughness: 0.35,
    flatShading: true,
  });

  const filamentGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.7, 4);
  const lilyFilamentGeo = new THREE.CylinderGeometry(0.05, 0.07, 3.6, 4);
  const antherGeo = new THREE.OctahedronGeometry(0.22, 0);
  const lilyAntherGeo = new THREE.BoxGeometry(0.75, 0.24, 0.26);

  const filamentMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.3,
    roughness: 0.45,
    flatShading: true,
  });

  const antherMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.2,
    flatShading: true,
  });

  const hitProxyGeo = new THREE.CylinderGeometry(3.0, 2.0, 14.0, 6);
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
    roseCalyxGeo,
    carnationCalyxGeo,
    calyxMat,
    leafGeo,
    roseLeafGeo,
    lilyLeafGeo,
    carnationLeafGeo,
    sepalGeo,
    leafMat,
    outerPetalGeo,
    innerPetalGeo,
    roseInnerPetalGeo,
    roseMidPetalGeo,
    roseOuterPetalGeo,
    lilyOuterTepalGeo,
    lilyInnerTepalGeo,
    carnationOuterPetalGeo,
    carnationInnerPetalGeo,
    pistilGeo,
    lilyPistilGeo,
    pistilCrownGeo,
    pistilMat,
    filamentGeo,
    lilyFilamentGeo,
    antherGeo,
    lilyAntherGeo,
    filamentMat,
    antherMat,
    hitProxyGeo,
    hitProxyMat,
    variantMaterials,
  };
}

function buildTulipBlossom(
  blossom: THREE.Group,
  resources: SharedFlowerResources,
  variant: SharedFlowerResources['variantMaterials'][number],
  petalBindings: PetalBinding[],
): void {
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;

    const outerHolder = new THREE.Group();
    outerHolder.rotation.y = angle;
    const outerPetal = new THREE.Mesh(resources.outerPetalGeo, variant.outerPetalMat);
    outerPetal.position.set(0, 0, 0.55);
    outerPetal.rotation.x = 0.18;
    outerHolder.add(outerPetal);
    blossom.add(outerHolder);
    petalBindings.push({ mesh: outerPetal, baseTiltX: 0.18, bloomDeltaX: 0.22 });

    const innerHolder = new THREE.Group();
    innerHolder.rotation.y = angle + Math.PI / 3;
    const innerPetal = new THREE.Mesh(resources.innerPetalGeo, variant.innerPetalMat);
    innerPetal.position.set(0, 0.15, 0.38);
    innerPetal.rotation.x = 0.05;
    innerHolder.add(innerPetal);
    blossom.add(innerHolder);
    petalBindings.push({ mesh: innerPetal, baseTiltX: 0.05, bloomDeltaX: 0.13 });
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
}

function buildRoseBlossom(
  blossom: THREE.Group,
  resources: SharedFlowerResources,
  variant: SharedFlowerResources['variantMaterials'][number],
  petalBindings: PetalBinding[],
): void {
  // 5 star-like green sepals under the rose head
  for (let i = 0; i < 5; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i * Math.PI * 2) / 5;
    const sepal = new THREE.Mesh(resources.sepalGeo, resources.leafMat);
    sepal.position.set(0, -0.08, 0.65);
    sepal.rotation.x = 1.05;
    holder.add(sepal);
    blossom.add(holder);
  }

  // Inner spiral bud (4 petals)
  for (let i = 0; i < 4; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i * Math.PI * 2) / 4;
    const petal = new THREE.Mesh(resources.roseInnerPetalGeo, variant.innerPetalMat);
    petal.position.set(0.12, 0.35, 0.34);
    petal.rotation.set(0.06, 0.28, -0.14);
    holder.add(petal);
    blossom.add(holder);
    petalBindings.push({ mesh: petal, baseTiltX: 0.06, bloomDeltaX: 0.14 });
  }

  // Middle cupped whorl (5 petals)
  for (let i = 0; i < 5; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i * Math.PI * 2) / 5 + 0.32;
    const petal = new THREE.Mesh(resources.roseMidPetalGeo, variant.innerPetalMat);
    petal.position.set(0.14, 0.18, 0.62);
    petal.rotation.set(0.28, 0.22, -0.1);
    holder.add(petal);
    blossom.add(holder);
    petalBindings.push({ mesh: petal, baseTiltX: 0.28, bloomDeltaX: 0.22 });
  }

  // Outer curled whorl (6 petals)
  for (let i = 0; i < 6; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i * Math.PI * 2) / 6 + 0.15;
    const petal = new THREE.Mesh(resources.roseOuterPetalGeo, variant.outerPetalMat);
    petal.position.set(0.12, 0.02, 0.92);
    petal.rotation.set(0.54, 0.18, -0.08);
    holder.add(petal);
    blossom.add(holder);
    petalBindings.push({ mesh: petal, baseTiltX: 0.54, bloomDeltaX: 0.26 });
  }

  const goldenHeart = new THREE.Mesh(resources.pistilCrownGeo, resources.pistilMat);
  goldenHeart.scale.set(0.95, 0.95, 0.95);
  goldenHeart.position.y = 1.65;
  blossom.add(goldenHeart);
}

function buildLilyBlossom(
  blossom: THREE.Group,
  resources: SharedFlowerResources,
  variant: SharedFlowerResources['variantMaterials'][number],
  petalBindings: PetalBinding[],
): void {
  // 6-pointed star tepals (3 outer + 3 inner)
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;

    const outerHolder = new THREE.Group();
    outerHolder.rotation.y = angle;
    const outerTepal = new THREE.Mesh(resources.lilyOuterTepalGeo, variant.outerPetalMat);
    outerTepal.position.set(0, 0.05, 0.45);
    outerTepal.rotation.x = 0.62;
    outerHolder.add(outerTepal);
    blossom.add(outerHolder);
    petalBindings.push({ mesh: outerTepal, baseTiltX: 0.62, bloomDeltaX: 0.2 });

    const innerHolder = new THREE.Group();
    innerHolder.rotation.y = angle + Math.PI / 3;
    const innerTepal = new THREE.Mesh(resources.lilyInnerTepalGeo, variant.innerPetalMat);
    innerTepal.position.set(0, 0.14, 0.36);
    innerTepal.rotation.x = 0.46;
    innerHolder.add(innerTepal);
    blossom.add(innerHolder);
    petalBindings.push({ mesh: innerTepal, baseTiltX: 0.46, bloomDeltaX: 0.18 });
  }

  // Prominent tall lily pistil
  const pistil = new THREE.Mesh(resources.lilyPistilGeo, resources.pistilMat);
  pistil.position.y = 2.35;
  blossom.add(pistil);

  const stigma = new THREE.Mesh(resources.pistilCrownGeo, resources.pistilMat);
  stigma.scale.set(1.25, 0.65, 1.25);
  stigma.position.y = 4.6;
  blossom.add(stigma);

  // 6 sweeping stamens with horizontal T-shaped anthers
  for (let s = 0; s < 6; s++) {
    const stamenGroup = new THREE.Group();
    stamenGroup.rotation.y = (s * Math.PI * 2) / 6 + 0.26;

    const filament = new THREE.Mesh(resources.lilyFilamentGeo, resources.filamentMat);
    filament.position.set(0, 1.9, 0.68);
    filament.rotation.x = 0.36;
    stamenGroup.add(filament);

    const anther = new THREE.Mesh(resources.lilyAntherGeo, resources.antherMat);
    anther.position.set(0, 3.65, 1.32);
    anther.rotation.set(0.32, 0.2, 0.18);
    stamenGroup.add(anther);

    blossom.add(stamenGroup);
  }
}

function buildCarnationBlossom(
  blossom: THREE.Group,
  resources: SharedFlowerResources,
  variant: SharedFlowerResources['variantMaterials'][number],
  petalBindings: PetalBinding[],
): void {
  // Elevate petals slightly out of the taller tubular carnation calyx
  const crownY = 0.55;

  // Outer ruffled skirt (7 petals)
  for (let i = 0; i < 7; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i * Math.PI * 2) / 7;
    const petal = new THREE.Mesh(resources.carnationOuterPetalGeo, variant.outerPetalMat);
    petal.position.set(0, crownY, 0.52);
    petal.rotation.x = 0.86;
    holder.add(petal);
    blossom.add(holder);
    petalBindings.push({ mesh: petal, baseTiltX: 0.86, bloomDeltaX: 0.2 });
  }

  // Middle ruffled tier (6 petals)
  for (let i = 0; i < 6; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i * Math.PI * 2) / 6 + 0.35;
    const petal = new THREE.Mesh(resources.carnationOuterPetalGeo, variant.innerPetalMat);
    petal.position.set(0, crownY + 0.35, 0.38);
    petal.rotation.x = 0.52;
    holder.add(petal);
    blossom.add(holder);
    petalBindings.push({ mesh: petal, baseTiltX: 0.52, bloomDeltaX: 0.18 });
  }

  // Inner fluffy tuft (5 upright ruffled petals)
  for (let i = 0; i < 5; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i * Math.PI * 2) / 5 + 0.15;
    const petal = new THREE.Mesh(resources.carnationInnerPetalGeo, variant.innerPetalMat);
    petal.position.set(0, crownY + 0.65, 0.22);
    petal.rotation.x = 0.2;
    holder.add(petal);
    blossom.add(holder);
    petalBindings.push({ mesh: petal, baseTiltX: 0.2, bloomDeltaX: 0.15 });
  }

  const centerCrown = new THREE.Mesh(resources.pistilCrownGeo, resources.pistilMat);
  centerCrown.scale.set(0.85, 0.85, 0.85);
  centerCrown.position.y = crownY + 1.85;
  blossom.add(centerCrown);
}

function createSingleFlowerMesh(
  species: ConcreteFlowerSpecies,
  resources: SharedFlowerResources,
  particleTexture: THREE.Texture,
): {
  group: THREE.Group;
  baseColor: number;
  petalBindings: PetalBinding[];
  auraSprite: THREE.Sprite;
} {
  const flowerGroup = new THREE.Group();

  const stem = new THREE.Mesh(resources.stemGeo, resources.stemMat);
  flowerGroup.add(stem);

  const calyxGeo =
    species === 'roses'
      ? resources.roseCalyxGeo
      : species === 'carnations'
        ? resources.carnationCalyxGeo
        : resources.calyxGeo;
  const calyx = new THREE.Mesh(calyxGeo, resources.calyxMat);
  flowerGroup.add(calyx);

  if (species === 'lilies') {
    for (let l = 0; l < 4; l++) {
      const leaf = new THREE.Mesh(resources.lilyLeafGeo, resources.leafMat);
      leaf.position.set(0, -8.5 + l * 1.35, 0);
      leaf.rotation.set(0.28, (l * Math.PI) / 2 + 0.35, 0);
      flowerGroup.add(leaf);
    }
  } else if (species === 'carnations') {
    for (let l = 0; l < 4; l++) {
      const leaf = new THREE.Mesh(resources.carnationLeafGeo, resources.leafMat);
      leaf.position.set(0, -10.8 + Math.floor(l / 2) * 3.8, 0);
      leaf.rotation.set(0.26, l * Math.PI + (l >= 2 ? Math.PI / 2 : 0), 0);
      flowerGroup.add(leaf);
    }
  } else if (species === 'roses') {
    const leafPrimary = new THREE.Mesh(resources.roseLeafGeo, resources.leafMat);
    leafPrimary.position.set(0.18, -10.5, 0.14);
    leafPrimary.rotation.set(0.28, 0.45, -0.18);
    flowerGroup.add(leafPrimary);

    const leafSecondary = new THREE.Mesh(resources.roseLeafGeo, resources.leafMat);
    leafSecondary.scale.set(0.86, 0.88, 0.86);
    leafSecondary.position.set(-0.18, -7.8, -0.1);
    leafSecondary.rotation.set(0.32, Math.PI + 0.65, 0.16);
    flowerGroup.add(leafSecondary);
  } else {
    const leafPrimary = new THREE.Mesh(resources.leafGeo, resources.leafMat);
    leafPrimary.position.set(0.15, -12.6, 0.15);
    leafPrimary.rotation.set(0.24, 0.35, -0.18);
    flowerGroup.add(leafPrimary);

    const leafSecondary = new THREE.Mesh(resources.leafGeo, resources.leafMat);
    leafSecondary.scale.set(0.84, 0.86, 0.84);
    leafSecondary.position.set(-0.15, -10.8, -0.1);
    leafSecondary.rotation.set(0.28, Math.PI + 0.55, 0.16);
    flowerGroup.add(leafSecondary);
  }

  const variant =
    resources.variantMaterials[
      Math.floor(Math.random() * resources.variantMaterials.length)
    ];

  const blossom = new THREE.Group();
  blossom.position.y = 0.28;
  flowerGroup.add(blossom);

  const petalBindings: PetalBinding[] = [];

  if (species === 'roses') {
    buildRoseBlossom(blossom, resources, variant, petalBindings);
  } else if (species === 'lilies') {
    buildLilyBlossom(blossom, resources, variant, petalBindings);
  } else if (species === 'carnations') {
    buildCarnationBlossom(blossom, resources, variant, petalBindings);
  } else {
    buildTulipBlossom(blossom, resources, variant, petalBindings);
  }

  // Luminous aura sprite distinguishing unexplored, explored, hovered, and focused flowers
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
  auraSprite.layers.set(0);
  flowerGroup.add(auraSprite);

  const hitProxy = new THREE.Mesh(resources.hitProxyGeo, resources.hitProxyMat);
  hitProxy.position.y = -3.2;
  hitProxy.layers.set(1);
  flowerGroup.add(hitProxy);

  return {
    group: flowerGroup,
    baseColor: variant.baseColor,
    petalBindings,
    auraSprite,
  };
}

const MIXED_SPECIES_ORDER: ConcreteFlowerSpecies[] = [
  'tulips',
  'roses',
  'lilies',
  'carnations',
];

export function createTulipClusters(
  scene: THREE.Scene,
  particleTexture: THREE.Texture,
  options: {
    flowerType?: FlowerType;
    flowerCount?: number;
    memories: TulipMemory[];
  },
): {
  tulips: THREE.Group[];
  disposeSharedTulips: () => void;
} {
  const resources = createSharedFlowerResources();
  const tulips: THREE.Group[] = [];
  const count = Math.max(15, Math.min(75, options.flowerCount ?? 47));
  const memories = options.memories;
  const requestedType = options.flowerType ?? 'tulips';

  for (let i = 0; i < count; i++) {
    const species: ConcreteFlowerSpecies =
      requestedType === 'mixed'
        ? MIXED_SPECIES_ORDER[i % MIXED_SPECIES_ORDER.length]
        : requestedType;

    const {
      group: flowerMesh,
      baseColor,
      petalBindings,
      auraSprite,
    } = createSingleFlowerMesh(species, resources, particleTexture);

    const theta = Math.random() * Math.PI * 2;
    const r = 90 + Math.random() * 240;

    flowerMesh.position.x = Math.cos(theta) * r;
    flowerMesh.position.y = (Math.random() - 0.5) * 60;
    flowerMesh.position.z = Math.sin(theta) * r;

    const baseScale = Math.random() * 0.7 + 1.0;
    flowerMesh.scale.set(baseScale, baseScale, baseScale);

    flowerMesh.rotation.x = (Math.random() - 0.5) * 0.22;
    flowerMesh.rotation.z = (Math.random() - 0.5) * 0.22;

    const memory = memories[i % memories.length];
    const userData: TulipUserData = {
      id: i,
      memory,
      species,
      originalY: flowerMesh.position.y,
      baseScale,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      baseColor,
      petalBindings,
      auraSprite,
      bloomFactor: 0,
    };
    flowerMesh.userData = userData;

    flowerMesh.traverse((child) => {
      if (child !== auraSprite) {
        child.layers.enable(1);
      }
    });

    scene.add(flowerMesh);
    tulips.push(flowerMesh);
  }

  const disposeSharedTulips = () => {
    tulips.forEach((flower) => {
      scene.remove(flower);
      const data = flower.userData as Partial<TulipUserData>;
      data.auraSprite?.material.dispose();
    });
    resources.stemGeo.dispose();
    resources.stemMat.dispose();
    resources.calyxGeo.dispose();
    resources.roseCalyxGeo.dispose();
    resources.carnationCalyxGeo.dispose();
    resources.calyxMat.dispose();
    resources.leafGeo.dispose();
    resources.roseLeafGeo.dispose();
    resources.lilyLeafGeo.dispose();
    resources.carnationLeafGeo.dispose();
    resources.sepalGeo.dispose();
    resources.leafMat.dispose();
    resources.outerPetalGeo.dispose();
    resources.innerPetalGeo.dispose();
    resources.roseInnerPetalGeo.dispose();
    resources.roseMidPetalGeo.dispose();
    resources.roseOuterPetalGeo.dispose();
    resources.lilyOuterTepalGeo.dispose();
    resources.lilyInnerTepalGeo.dispose();
    resources.carnationOuterPetalGeo.dispose();
    resources.carnationInnerPetalGeo.dispose();
    resources.pistilGeo.dispose();
    resources.lilyPistilGeo.dispose();
    resources.pistilCrownGeo.dispose();
    resources.pistilMat.dispose();
    resources.filamentGeo.dispose();
    resources.lilyFilamentGeo.dispose();
    resources.antherGeo.dispose();
    resources.lilyAntherGeo.dispose();
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
