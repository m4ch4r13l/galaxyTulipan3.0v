import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GALAXY_CONFIG, TULIP_MEMORIES, type TulipMemory } from '../data/tulips';
import { buildGalaxyLayers } from '../three/galaxyBuilder';
import { createParticleGlowTexture } from '../three/textures';
import { createTulipClusters, type TulipUserData } from '../three/tulipBuilder';
import {
  disposeSharedBurstGeometry,
  spawnShootingStar,
  triggerTulipSupernova,
  updateEffects,
  type BurstParticle,
  type ShootingStar,
} from '../three/effects';

interface GalaxyCanvasProps {
  isAutoRotating: boolean;
  activeMemoryIndex: number | null;
  discoveredIds: number[];
  onManualControl: () => void;
  onIntroComplete: () => void;
  onTulipClick: (memory: TulipMemory) => void;
  onSelectTulip: (memory: TulipMemory) => void;
}

const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
_raycaster.layers.set(1);

const _desiredCamPos = new THREE.Vector3();
const _desiredLookAt = new THREE.Vector3();
const _dirXZ = new THREE.Vector3();
const _colorUnexplored = new THREE.Color(0xfde68a); // Warm starlight gold
const _colorExplored = new THREE.Color(0xf472b6); // Calm serene rose
const _colorActive = new THREE.Color(0xfff1f2); // Luminous pearl pink

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function GalaxyCanvas({
  isAutoRotating,
  activeMemoryIndex,
  discoveredIds,
  onManualControl,
  onIntroComplete,
  onTulipClick,
  onSelectTulip,
}: GalaxyCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const isAutoRotatingRef = useRef(isAutoRotating);
  isAutoRotatingRef.current = isAutoRotating;

  const discoveredSetRef = useRef<Set<number>>(new Set(discoveredIds));
  useEffect(() => {
    discoveredSetRef.current = new Set(discoveredIds);
  }, [discoveredIds]);

  const onManualControlRef = useRef(onManualControl);
  onManualControlRef.current = onManualControl;

  const onIntroCompleteRef = useRef(onIntroComplete);
  onIntroCompleteRef.current = onIntroComplete;

  const onTulipClickRef = useRef(onTulipClick);
  onTulipClickRef.current = onTulipClick;

  const onSelectTulipRef = useRef(onSelectTulip);
  onSelectTulipRef.current = onSelectTulip;

  const focusBridgeRef = useRef<{
    syncMemoryFocus: (index: number | null) => void;
  } | null>(null);

  useEffect(() => {
    focusBridgeRef.current?.syncMemoryFocus(activeMemoryIndex);
  }, [activeMemoryIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0212);
    scene.fog = new THREE.FogExp2(0x0b0212, 0.0014);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      3000,
    );

    const ambientLight = new THREE.AmbientLight(0xffd1dc, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfbcfe8, 0x2e1065, 0.8);
    scene.add(hemiLight);

    const keyDirLight = new THREE.DirectionalLight(0xfff1f2, 1.1);
    keyDirLight.position.set(120, 180, 90);
    scene.add(keyDirLight);

    const corePointLight = new THREE.PointLight(0xffb6c1, 5.0, 700);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    const particleTexture = createParticleGlowTexture(renderer);
    const galaxyLayers = buildGalaxyLayers(scene, particleTexture);
    const { tulips, disposeSharedTulips } = createTulipClusters(scene, particleTexture);

    const burstParticles: BurstParticle[] = [];
    const shootingStars: ShootingStar[] = [];

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let cameraRadius: number = GALAXY_CONFIG.introStartRadius;
    let targetCameraRadius: number = GALAXY_CONFIG.introTargetRadius;
    let isIntroZooming = true;

    let targetRotationX = 0.3;
    let targetRotationY = 0;
    let currentRotationX = 0.3;
    let currentRotationY = 0;

    let focusedTulip: THREE.Group | null = null;
    let hoveredTulip: THREE.Group | null = null;
    const focusOffset = new THREE.Vector3(0, 8, 28);
    let isReturningFromFocus = false;
    let pendingModalTimer: number | null = null;

    const currentCamPos = new THREE.Vector3(
      Math.sin(currentRotationY) * Math.cos(currentRotationX) * cameraRadius,
      Math.sin(currentRotationX) * cameraRadius + 50,
      Math.cos(currentRotationY) * Math.cos(currentRotationX) * cameraRadius,
    );
    const currentLookAt = new THREE.Vector3(0, 0, 0);

    camera.position.copy(currentCamPos);
    camera.lookAt(currentLookAt);

    let isDragging = false;
    let pointerDownMoved = false;
    let pointerDownPos = { x: 0, y: 0 };
    let previousPointerPos = { x: 0, y: 0 };
    let initialPinchDistance: number | null = null;
    let lastHoverCheck = 0;

    const resolveTulipFromObject = (obj: THREE.Object3D | null): THREE.Group | null => {
      let cursor: THREE.Object3D | null = obj;
      while (cursor && !(cursor.userData as Partial<TulipUserData>)?.memory && cursor.parent) {
        cursor = cursor.parent;
      }
      if (cursor instanceof THREE.Group && (cursor.userData as Partial<TulipUserData>)?.memory) {
        return cursor;
      }
      return null;
    };

    const clearPendingModal = () => {
      if (pendingModalTimer !== null) {
        window.clearTimeout(pendingModalTimer);
        pendingModalTimer = null;
      }
    };

    const startFlightToTulip = (tulip: THREE.Group) => {
      focusedTulip = tulip;
      isReturningFromFocus = false;

      _dirXZ.set(
        camera.position.x - tulip.position.x,
        0,
        camera.position.z - tulip.position.z,
      );
      if (_dirXZ.lengthSq() < 0.001) {
        _dirXZ.copy(tulip.position).setY(0);
      }
      if (_dirXZ.lengthSq() < 0.001) {
        _dirXZ.set(0, 0, 1);
      }
      _dirXZ.normalize();

      const data = tulip.userData as TulipUserData;
      const scale = data.baseScale ?? 1.2;
      const dist = 25 * scale;
      const height = 7.5 * scale;
      focusOffset.set(_dirXZ.x * dist, height, _dirXZ.z * dist);
    };

    const releaseFocus = () => {
      if (focusedTulip !== null) {
        focusedTulip = null;
        isReturningFromFocus = true;
      }
    };

    focusBridgeRef.current = {
      syncMemoryFocus: (index: number | null) => {
        if (index === null) {
          clearPendingModal();
          releaseFocus();
          return;
        }

        const targetMemory =
          TULIP_MEMORIES[
            ((index % TULIP_MEMORIES.length) + TULIP_MEMORIES.length) %
              TULIP_MEMORIES.length
          ];
        if (!targetMemory) return;

        if (focusedTulip) {
          const currentData = focusedTulip.userData as Partial<TulipUserData>;
          if (currentData?.memory?.id === targetMemory.id) {
            return;
          }
        }

        let nearestTulip: THREE.Group | null = null;
        let minDistSq = Infinity;
        for (let i = 0; i < tulips.length; i++) {
          const candidate = tulips[i];
          const data = candidate.userData as Partial<TulipUserData>;
          if (data?.memory?.id === targetMemory.id) {
            const dSq = candidate.position.distanceToSquared(camera.position);
            if (dSq < minDistSq) {
              minDistSq = dSq;
              nearestTulip = candidate;
            }
          }
        }

        if (nearestTulip) {
          startFlightToTulip(nearestTulip);
        }
      },
    };

    const domElem = renderer.domElement;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (isIntroZooming) return;
      isDragging = true;
      hoveredTulip = null;
      pointerDownMoved = false;
      pointerDownPos = { x: event.clientX, y: event.clientY };
      previousPointerPos = { x: event.clientX, y: event.clientY };
      domElem.style.cursor = 'grabbing';
      if (isAutoRotatingRef.current) {
        onManualControlRef.current();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isIntroZooming) return;

      if (isDragging) {
        const deltaX = event.clientX - previousPointerPos.x;
        const deltaY = event.clientY - previousPointerPos.y;
        const totalMove = Math.hypot(
          event.clientX - pointerDownPos.x,
          event.clientY - pointerDownPos.y,
        );
        if (totalMove > 5) {
          pointerDownMoved = true;
          clearPendingModal();
          releaseFocus();
        }

        targetRotationY -= deltaX * 0.005;
        targetRotationX += deltaY * 0.005;
        targetRotationX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationX));
        previousPointerPos = { x: event.clientX, y: event.clientY };
        return;
      }

      const now = performance.now();
      if (now - lastHoverCheck < 45) return;
      lastHoverCheck = now;

      _mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      _mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      _raycaster.setFromCamera(_mouse, camera);
      const hovered = _raycaster.intersectObjects(tulips, true);
      hoveredTulip = hovered.length > 0 ? resolveTulipFromObject(hovered[0].object) : null;
      domElem.style.cursor = hoveredTulip ? 'pointer' : 'grab';
    };

    const handleMouseUp = () => {
      isDragging = false;
      domElem.style.cursor = hoveredTulip ? 'pointer' : 'grab';
    };

    const handleMouseLeave = () => {
      isDragging = false;
      hoveredTulip = null;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (isIntroZooming) return;

      if (event.touches.length === 1) {
        isDragging = true;
        pointerDownMoved = false;
        pointerDownPos = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
        previousPointerPos = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
        if (isAutoRotatingRef.current) {
          onManualControlRef.current();
        }
      } else if (event.touches.length === 2) {
        isDragging = false;
        initialPinchDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY,
        );
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isIntroZooming) return;

      if (isDragging && event.touches.length === 1) {
        const touch = event.touches[0];
        const totalMove = Math.hypot(
          touch.clientX - pointerDownPos.x,
          touch.clientY - pointerDownPos.y,
        );
        if (totalMove > 6) {
          pointerDownMoved = true;
          clearPendingModal();
          releaseFocus();
        }

        targetRotationY -= (touch.clientX - previousPointerPos.x) * 0.005;
        targetRotationX += (touch.clientY - previousPointerPos.y) * 0.005;
        targetRotationX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationX));
        previousPointerPos = { x: touch.clientX, y: touch.clientY };
        event.preventDefault();
      } else if (event.touches.length === 2 && initialPinchDistance !== null) {
        clearPendingModal();
        releaseFocus();
        const currentDist = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY,
        );
        targetCameraRadius = Math.max(
          GALAXY_CONFIG.minZoomRadius,
          Math.min(
            GALAXY_CONFIG.maxZoomRadius,
            targetCameraRadius * (1 + (initialPinchDistance / currentDist - 1) * 0.2),
          ),
        );
        initialPinchDistance = currentDist;
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        initialPinchDistance = null;
      }
      if (event.touches.length === 0) {
        isDragging = false;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (isIntroZooming) return;
      event.preventDefault();
      if (focusedTulip) {
        clearPendingModal();
        releaseFocus();
      }
      targetCameraRadius = Math.max(
        GALAXY_CONFIG.minZoomRadius,
        Math.min(GALAXY_CONFIG.maxZoomRadius, targetCameraRadius + event.deltaY * 0.3),
      );
    };

    const handleCanvasClick = (event: MouseEvent) => {
      if (isIntroZooming || pointerDownMoved) return;

      _mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      _mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      _raycaster.setFromCamera(_mouse, camera);
      const intersects = _raycaster.intersectObjects(tulips, true);

      if (intersects.length > 0) {
        const obj = resolveTulipFromObject(intersects[0].object);
        if (obj) {
          const data = obj.userData as TulipUserData;
          const memory = data.memory;
          clearPendingModal();
          onTulipClickRef.current(memory);
          startFlightToTulip(obj);
          triggerTulipSupernova(
            scene,
            burstParticles,
            obj.position.x,
            obj.position.y,
            obj.position.z,
            data.baseColor ?? 0xf43f5e,
          );

          pendingModalTimer = window.setTimeout(() => {
            pendingModalTimer = null;
            onSelectTulipRef.current(memory);
          }, 1650);
        }
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglUnavailable(true);
    };

    const handleContextRestored = () => {
      setWebglUnavailable(false);
    };

    window.addEventListener('resize', handleResize);
    domElem.addEventListener('mousedown', handleMouseDown);
    domElem.addEventListener('mousemove', handleMouseMove);
    domElem.addEventListener('mouseup', handleMouseUp);
    domElem.addEventListener('mouseleave', handleMouseLeave);
    domElem.addEventListener('touchstart', handleTouchStart, { passive: false });
    domElem.addEventListener('touchmove', handleTouchMove, { passive: false });
    domElem.addEventListener('touchend', handleTouchEnd);
    domElem.addEventListener('wheel', handleWheel, { passive: false });
    domElem.addEventListener('click', handleCanvasClick);
    domElem.addEventListener('webglcontextlost', handleContextLost);
    domElem.addEventListener('webglcontextrestored', handleContextRestored);

    const clock = new THREE.Clock();
    let lastShootingStarTime = 0;
    let frameId = 0;
    let isDisposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const tick = () => {
      if (isDisposed) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();
      const deltaScale = delta * 60;

      if (isIntroZooming) {
        cameraRadius = THREE.MathUtils.damp(cameraRadius, targetCameraRadius, 2.2, delta);
        if (Math.abs(cameraRadius - targetCameraRadius) < 1.5) {
          cameraRadius = targetCameraRadius;
          isIntroZooming = false;
          onIntroCompleteRef.current();
        }
      }

      if (elapsedTime - lastShootingStarTime > 1.8 + Math.random() * 2.0) {
        spawnShootingStar(scene, shootingStars);
        lastShootingStarTime = elapsedTime;
      }

      galaxyLayers.galaxyParticles.rotation.y = elapsedTime * 0.04;
      galaxyLayers.nebulaClouds.rotation.y = elapsedTime * 0.025;
      galaxyLayers.backgroundStars.rotation.y = elapsedTime * 0.005;
      galaxyLayers.distantGalaxies.rotation.y = elapsedTime * 0.002;

      galaxyLayers.coreParticleCloud.rotation.y = elapsedTime * 0.03;
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.06;
      galaxyLayers.coreParticleCloud.scale.set(pulse, pulse, pulse);

      for (let i = 0; i < tulips.length; i++) {
        const tulip = tulips[i];
        const data = tulip.userData as TulipUserData;
        const isFocused = tulip === focusedTulip;
        const isHovered = tulip === hoveredTulip;
        const isDiscovered = discoveredSetRef.current.has(data.memory.id);

        // Gentle rotation & floating bob
        const spinMult = isFocused ? 0.55 : isHovered ? 1.8 : 1.0;
        tulip.rotation.y += data.rotSpeed * deltaScale * spinMult;
        tulip.position.y =
          data.originalY + Math.sin(elapsedTime * 2 + tulip.position.x) * (isFocused ? 1.5 : 4);

        // Scale response on hover & selection
        const targetScale =
          data.baseScale * (isFocused ? 1.2 : isHovered ? 1.13 : 1.0);
        const nextScale = THREE.MathUtils.damp(tulip.scale.x, targetScale, 6.5, delta);
        tulip.scale.setScalar(nextScale);

        // Petal bloom response on hover & selection
        const targetBloom = isFocused ? 1.0 : isHovered ? 0.72 : 0.0;
        data.bloomFactor = THREE.MathUtils.damp(data.bloomFactor, targetBloom, 7, delta);
        for (let p = 0; p < data.outerPetals.length; p++) {
          data.outerPetals[p].rotation.x = 0.18 + data.bloomFactor * 0.22;
        }
        for (let p = 0; p < data.innerPetals.length; p++) {
          data.innerPetals[p].rotation.x = 0.05 + data.bloomFactor * 0.13;
        }

        // Aura distinction: unexplored tulips pulse warm gold, explored tulips glow softly rose, hovered/focused bloom bright pearl-pink
        const wave = Math.sin(elapsedTime * 2.8 + data.id * 0.9);
        let targetAuraOpacity: number;
        let targetAuraScale: number;
        let targetAuraColor: THREE.Color;

        if (isFocused || isHovered) {
          targetAuraOpacity = isFocused ? 0.88 : 0.78;
          targetAuraScale = isFocused ? 14.5 : 13.0;
          targetAuraColor = _colorActive;
        } else if (!isDiscovered) {
          targetAuraOpacity = 0.52 + wave * 0.18;
          targetAuraScale = 11.2 + wave * 1.4;
          targetAuraColor = _colorUnexplored;
        } else {
          targetAuraOpacity = 0.16;
          targetAuraScale = 7.2;
          targetAuraColor = _colorExplored;
        }

        const auraMat = data.auraSprite.material;
        auraMat.opacity = THREE.MathUtils.damp(auraMat.opacity, targetAuraOpacity, 6, delta);
        auraMat.color.lerp(targetAuraColor, 1 - Math.exp(-6 * delta));
        const nextAuraScale = THREE.MathUtils.damp(
          data.auraSprite.scale.x,
          targetAuraScale,
          6,
          delta,
        );
        data.auraSprite.scale.set(nextAuraScale, nextAuraScale, 1);
      }

      updateEffects(scene, burstParticles, shootingStars, deltaScale);

      if (!isIntroZooming && isAutoRotatingRef.current && !focusedTulip) {
        targetRotationY = elapsedTime * 0.04;
        targetRotationX = Math.sin(elapsedTime * 0.2) * 0.15 + 0.3;
      }

      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 5, delta);
      currentRotationX = THREE.MathUtils.damp(currentRotationX, targetRotationX, 5, delta);
      if (!isIntroZooming) {
        cameraRadius = THREE.MathUtils.damp(cameraRadius, targetCameraRadius, 5, delta);
      }

      if (focusedTulip) {
        _desiredLookAt.set(
          focusedTulip.position.x,
          focusedTulip.position.y - 1.0,
          focusedTulip.position.z,
        );
        _desiredCamPos.copy(focusedTulip.position).add(focusOffset);

        currentCamPos.x = THREE.MathUtils.damp(currentCamPos.x, _desiredCamPos.x, 4.2, delta);
        currentCamPos.y = THREE.MathUtils.damp(currentCamPos.y, _desiredCamPos.y, 4.2, delta);
        currentCamPos.z = THREE.MathUtils.damp(currentCamPos.z, _desiredCamPos.z, 4.2, delta);

        currentLookAt.x = THREE.MathUtils.damp(currentLookAt.x, _desiredLookAt.x, 5.0, delta);
        currentLookAt.y = THREE.MathUtils.damp(currentLookAt.y, _desiredLookAt.y, 5.0, delta);
        currentLookAt.z = THREE.MathUtils.damp(currentLookAt.z, _desiredLookAt.z, 5.0, delta);
      } else {
        _desiredLookAt.set(0, 0, 0);
        _desiredCamPos.set(
          Math.sin(currentRotationY) * Math.cos(currentRotationX) * cameraRadius,
          Math.sin(currentRotationX) * cameraRadius + 50,
          Math.cos(currentRotationY) * Math.cos(currentRotationX) * cameraRadius,
        );

        if (isReturningFromFocus) {
          currentCamPos.x = THREE.MathUtils.damp(currentCamPos.x, _desiredCamPos.x, 3.6, delta);
          currentCamPos.y = THREE.MathUtils.damp(currentCamPos.y, _desiredCamPos.y, 3.6, delta);
          currentCamPos.z = THREE.MathUtils.damp(currentCamPos.z, _desiredCamPos.z, 3.6, delta);

          currentLookAt.x = THREE.MathUtils.damp(currentLookAt.x, 0, 4.2, delta);
          currentLookAt.y = THREE.MathUtils.damp(currentLookAt.y, 0, 4.2, delta);
          currentLookAt.z = THREE.MathUtils.damp(currentLookAt.z, 0, 4.2, delta);

          if (currentCamPos.distanceToSquared(_desiredCamPos) < 0.8) {
            isReturningFromFocus = false;
          }
        } else {
          currentCamPos.copy(_desiredCamPos);
          currentLookAt.copy(_desiredLookAt);
        }
      }

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      tick();
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      isDisposed = true;
      focusBridgeRef.current = null;
      clearPendingModal();
      cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);

      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handleMouseDown);
      domElem.removeEventListener('mousemove', handleMouseMove);
      domElem.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('mouseleave', handleMouseLeave);
      domElem.removeEventListener('touchstart', handleTouchStart);
      domElem.removeEventListener('touchmove', handleTouchMove);
      domElem.removeEventListener('touchend', handleTouchEnd);
      domElem.removeEventListener('wheel', handleWheel);
      domElem.removeEventListener('click', handleCanvasClick);
      domElem.removeEventListener('webglcontextlost', handleContextLost);
      domElem.removeEventListener('webglcontextrestored', handleContextRestored);

      Object.values(galaxyLayers).forEach((points) => {
        points.geometry.dispose();
        (points.material as THREE.Material).dispose();
      });

      burstParticles.forEach((p) => {
        scene.remove(p.mesh);
        p.mesh.material.dispose();
      });
      shootingStars.forEach((s) => {
        scene.remove(s.line);
        s.line.geometry.dispose();
        s.line.material.dispose();
      });

      disposeSharedTulips();
      disposeSharedBurstGeometry();
      particleTexture.dispose();
      envTarget.dispose();
      renderer.dispose();

      if (domElem.parentElement === container) {
        container.removeChild(domElem);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={mountRef}
        id="webgl-container"
        className="fixed inset-0 w-screen h-screen z-[1]"
        aria-label="Escena 3D de Galaxia de Tulipanes"
      />
      {webglUnavailable && (
        <div className="fixed inset-0 z-[2] flex items-center justify-center bg-[#0b0212] px-6 text-center">
          <div className="glass-panel rounded-3xl p-8 max-w-md">
            <h2 className="title-font text-xl font-bold text-pink-100 mb-2">
              Galaxia 3D en Pausa
            </h2>
            <p className="text-sm text-pink-200/80">
              Tu navegador suspendió el contexto gráfico WebGL. Recarga la página para
              volver a explorar el universo de tulipanes.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
