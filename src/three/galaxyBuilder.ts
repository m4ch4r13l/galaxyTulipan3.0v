import * as THREE from 'three';
import { GALAXY_CONFIG } from '../data/tulips';

export interface GalaxyLayers {
  backgroundStars: THREE.Points;
  distantGalaxies: THREE.Points;
  nebulaClouds: THREE.Points;
  coreParticleCloud: THREE.Points;
  galaxyParticles: THREE.Points;
}

export function createBackgroundStars(): THREE.Points {
  const starCount = GALAXY_CONFIG.backgroundStarsCount;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const colorOptions = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#fbcfe8'),
    new THREE.Color('#fed7aa'),
    new THREE.Color('#c084fc'),
    new THREE.Color('#93c5fd'),
    new THREE.Color('#f43f5e'),
  ];

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 280 + Math.random() * 370;

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

export function createDistantGalaxies(particleTexture: THREE.Texture): THREE.Points {
  const galCount = GALAXY_CONFIG.distantGalaxiesCount;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(galCount * 3);
  const colors = new Float32Array(galCount * 3);

  const galColors = [
    new THREE.Color('#ec4899'),
    new THREE.Color('#8b5cf6'),
    new THREE.Color('#38bdf8'),
    new THREE.Color('#f43f5e'),
    new THREE.Color('#fb7185'),
  ];

  for (let i = 0; i < galCount; i++) {
    const i3 = i * 3;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 250 + Math.random() * 300;

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    const c = galColors[Math.floor(Math.random() * galColors.length)];
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 18.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    map: particleTexture,
    alphaTest: 0.001,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

export function createDiffuseGalaxyCore(particleTexture: THREE.Texture): THREE.Points {
  const coreParticlesCount = GALAXY_CONFIG.coreParticlesCount;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(coreParticlesCount * 3);
  const colors = new Float32Array(coreParticlesCount * 3);

  const centerWhite = new THREE.Color('#ffffff');
  const corePink = new THREE.Color('#ff7597');
  const outerRose = new THREE.Color('#a21caf');
  const mixedColor = new THREE.Color();

  for (let i = 0; i < coreParticlesCount; i++) {
    const i3 = i * 3;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.pow(Math.random(), 2.5) * 65;

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.35;
    positions[i3 + 2] = r * Math.cos(phi);

    mixedColor.copy(centerWhite);
    const normDist = r / 65;
    if (normDist < 0.3) {
      mixedColor.lerp(corePink, normDist / 0.3);
    } else {
      mixedColor.lerp(outerRose, (normDist - 0.3) / 0.7);
    }

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 14.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    map: particleTexture,
    alphaTest: 0.001,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

export function createNebulaDust(): THREE.Points {
  const cloudCount = GALAXY_CONFIG.nebulaCloudCount;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(cloudCount * 3);
  const colors = new Float32Array(cloudCount * 3);

  const cloudColor1 = new THREE.Color('#f43f5e');
  const cloudColor2 = new THREE.Color('#a855f7');
  const cloudColor3 = new THREE.Color('#ec4899');
  const mixColor = new THREE.Color();

  const arms = GALAXY_CONFIG.spiralArms;
  const radius = 340;

  for (let i = 0; i < cloudCount; i++) {
    const i3 = i * 3;
    const r = Math.random() * radius;
    const spinAngle = r * 0.0035;
    const branchAngle = ((i % arms) * 2 * Math.PI) / arms;

    const offsetX = (Math.random() - 0.5) * 80;
    const offsetY = (Math.random() - 0.5) * 25;
    const offsetZ = (Math.random() - 0.5) * 80;

    positions[i3] = Math.cos(branchAngle + spinAngle) * r + offsetX;
    positions[i3 + 1] = offsetY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + offsetZ;

    mixColor.copy(cloudColor1);
    if (i % 3 === 0) mixColor.lerp(cloudColor2, Math.random());
    else if (i % 3 === 1) mixColor.lerp(cloudColor3, Math.random());

    colors[i3] = mixColor.r;
    colors[i3 + 1] = mixColor.g;
    colors[i3 + 2] = mixColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 22.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

export function createMultiArmGalaxy(): THREE.Points {
  const particleCount = GALAXY_CONFIG.spiralArmsParticlesCount;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorInside = new THREE.Color('#fff1f2');
  const colorMiddle = new THREE.Color('#ec4899');
  const colorOutside = new THREE.Color('#831843');
  const mixedColor = new THREE.Color();

  const arms = GALAXY_CONFIG.spiralArms;
  const radius = GALAXY_CONFIG.galaxyRadius;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const r = Math.random() * radius;
    const spinAngle = r * 0.0035;
    const branchAngle = ((i % arms) * 2 * Math.PI) / arms;

    const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 55;
    const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 40;
    const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 55;

    positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

    mixedColor.copy(colorInside);
    if (r < radius * 0.25) {
      mixedColor.lerp(colorInside, r / (radius * 0.25));
    } else if (r < radius * 0.65) {
      mixedColor.lerp(colorMiddle, (r - radius * 0.25) / (radius * 0.4));
    } else {
      mixedColor.lerp(colorOutside, (r - radius * 0.65) / (radius * 0.35));
    }

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.0,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

export function buildGalaxyLayers(
  scene: THREE.Scene,
  particleTexture: THREE.Texture,
): GalaxyLayers {
  const backgroundStars = createBackgroundStars();
  const distantGalaxies = createDistantGalaxies(particleTexture);
  const nebulaClouds = createNebulaDust();
  const coreParticleCloud = createDiffuseGalaxyCore(particleTexture);
  const galaxyParticles = createMultiArmGalaxy();

  scene.add(
    backgroundStars,
    distantGalaxies,
    nebulaClouds,
    coreParticleCloud,
    galaxyParticles,
  );

  return {
    backgroundStars,
    distantGalaxies,
    nebulaClouds,
    coreParticleCloud,
    galaxyParticles,
  };
}
