import * as THREE from 'three';

export interface BurstParticle {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  velocity: THREE.Vector3;
  life: number;
  decay: number;
  rotSpeedX: number;
  rotSpeedY: number;
}

export interface ShootingStar {
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  direction: THREE.Vector3;
  life: number;
  decay: number;
}

const SHARED_BURST_GEO = new THREE.SphereGeometry(1.2, 6, 6);

export function triggerTulipSupernova(
  scene: THREE.Scene,
  burstParticles: BurstParticle[],
  x: number,
  y: number,
  z: number,
  customColor = 0xf43f5e,
): void {
  const count = 75;

  for (let i = 0; i < count; i++) {
    const speed = Math.random() * 4.5 + 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    const velocity = new THREE.Vector3(
      speed * Math.sin(phi) * Math.cos(theta),
      speed * Math.sin(phi) * Math.sin(theta),
      speed * Math.cos(phi),
    );

    const material = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.3 ? customColor : 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(SHARED_BURST_GEO, material);
    mesh.position.set(x, y, z);

    scene.add(mesh);
    burstParticles.push({
      mesh,
      velocity,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.015,
      rotSpeedX: (Math.random() - 0.5) * 0.1,
      rotSpeedY: (Math.random() - 0.5) * 0.1,
    });
  }
}

export function spawnShootingStar(
  scene: THREE.Scene,
  shootingStars: ShootingStar[],
): void {
  const startPos = new THREE.Vector3(
    (Math.random() - 0.5) * 220,
    100 + Math.random() * 80,
    (Math.random() - 0.5) * 220,
  );
  const direction = new THREE.Vector3(
    (Math.random() - 0.5) * 8,
    -Math.random() * 6 - 4,
    (Math.random() - 0.5) * 8,
  ).normalize();

  const points: THREE.Vector3[] = [];
  for (let j = 0; j < 25; j++) {
    points.push(startPos.clone().sub(direction.clone().multiplyScalar(j * 1.5)));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
  });

  const line = new THREE.Line(geometry, material);
  scene.add(line);

  shootingStars.push({
    line,
    direction: direction.multiplyScalar(6.0),
    life: 1.0,
    decay: Math.random() * 0.02 + 0.015,
  });
}

export function updateEffects(
  scene: THREE.Scene,
  burstParticles: BurstParticle[],
  shootingStars: ShootingStar[],
  deltaScale: number,
): void {
  for (let i = burstParticles.length - 1; i >= 0; i--) {
    const p = burstParticles[i];
    p.mesh.position.addScaledVector(p.velocity, deltaScale);
    p.mesh.rotation.x += p.rotSpeedX * deltaScale;
    p.mesh.rotation.y += p.rotSpeedY * deltaScale;
    p.life -= p.decay * deltaScale;
    p.mesh.material.opacity = Math.max(0, p.life);

    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.mesh.material.dispose();
      burstParticles.splice(i, 1);
    }
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const s = shootingStars[i];
    s.line.position.addScaledVector(s.direction, deltaScale);
    s.life -= s.decay * deltaScale;
    s.line.material.opacity = Math.max(0, s.life);

    if (s.life <= 0) {
      scene.remove(s.line);
      s.line.geometry.dispose();
      s.line.material.dispose();
      shootingStars.splice(i, 1);
    }
  }
}

export function disposeSharedBurstGeometry(): void {
  SHARED_BURST_GEO.dispose();
}
