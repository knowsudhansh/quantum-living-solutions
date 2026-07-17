'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Float, MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { useMotionSystem } from '@/components/animation/MotionProvider';
import { isWebGLAvailable } from '@/lib/utils/capability';

type WebGLGateProps = {
  children: (quality: 'standard' | 'low') => ReactNode;
  className?: string;
  label: string;
};

type VillaSceneProps = {
  quality: 'standard' | 'low';
};

function useWebGLGate() {
  const { reducedMotion } = useMotionSystem();
  const [quality, setQuality] = useState<'standard' | 'low' | 'off'>('off');

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') {
      const frame = window.requestAnimationFrame(() => setQuality('off'));
      return () => window.cancelAnimationFrame(frame);
    }

    const media = window.matchMedia('(min-width: 1200px)');

    const evaluate = () => {
      const nav = navigator as Navigator & { deviceMemory?: number };
      const lowCapability = (nav.deviceMemory !== undefined && nav.deviceMemory < 4) || navigator.hardwareConcurrency < 4;
      setQuality(media.matches && isWebGLAvailable() ? (lowCapability ? 'low' : 'standard') : 'off');
    };

    const frame = window.requestAnimationFrame(evaluate);
    media.addEventListener('change', evaluate);
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      media.removeEventListener('change', evaluate);
    };
  }, [reducedMotion]);

  return quality;
}

function WebGLGate({ children, className = '', label }: WebGLGateProps) {
  const quality = useWebGLGate();
  const [mountedQuality, setMountedQuality] = useState<'standard' | 'low' | null>(null);

  useEffect(() => {
    if (mountedQuality === null && quality !== 'off') {
      const frame = window.requestAnimationFrame(() => setMountedQuality(quality));
      return () => window.cancelAnimationFrame(frame);
    }

    return undefined;
  }, [mountedQuality, quality]);

  if (mountedQuality === null) return null;

  return (
    <div className={className} aria-hidden="true" data-webgl-layer={label} data-quality={mountedQuality} data-active="true">
      {children(mountedQuality)}
    </div>
  );
}

function ScrollCameraRig({ quality }: VillaSceneProps) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const scrollable = useRef(1);
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(0, 0.55, 0), []);
  const fog = useRef<THREE.FogExp2>(null);
  const light = useRef<THREE.PointLight>(null);

  useEffect(() => {
    let resizeFrame = 0;

    const updateScrollable = () => {
      scrollable.current = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const scheduleScrollableUpdate = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        updateScrollable();
      });
    };

    const handlePointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    scheduleScrollableUpdate();
    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('resize', scheduleScrollableUpdate, { passive: true });
    window.addEventListener('orientationchange', scheduleScrollableUpdate, { passive: true });
    window.addEventListener('pageshow', scheduleScrollableUpdate, { passive: true });
    document.addEventListener('visibilitychange', scheduleScrollableUpdate);
    window.visualViewport?.addEventListener('resize', scheduleScrollableUpdate, { passive: true });

    return () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('resize', scheduleScrollableUpdate);
      window.removeEventListener('orientationchange', scheduleScrollableUpdate);
      window.removeEventListener('pageshow', scheduleScrollableUpdate);
      document.removeEventListener('visibilitychange', scheduleScrollableUpdate);
      window.visualViewport?.removeEventListener('resize', scheduleScrollableUpdate);
    };
  }, []);

  useFrame((state, delta) => {
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollable.current));
    const timeOfDay = Math.min(1, Math.max(0, progress * 1.35));
    const warmth = THREE.MathUtils.lerp(0.82, 1.55, timeOfDay);
    const dusk = Math.sin(timeOfDay * Math.PI);

    target.set(
      THREE.MathUtils.lerp(3.8, -1.2, progress) + pointer.current.x * 0.16,
      THREE.MathUtils.lerp(2.2, 1.35, progress) - pointer.current.y * 0.08,
      THREE.MathUtils.lerp(5.8, 2.9, progress),
    );

    camera.position.lerp(target, 1 - Math.exp(-delta * 2.4));
    lookAt.set(pointer.current.x * 0.14, 0.62 - pointer.current.y * 0.08, 0);
    camera.lookAt(lookAt);

    if (light.current) {
      light.current.intensity = quality === 'low' ? 1.4 : warmth + dusk * 0.55;
      light.current.color.setHSL(0.1, 0.55, THREE.MathUtils.lerp(0.68, 0.48, timeOfDay));
    }

    if (fog.current) fog.current.density = THREE.MathUtils.lerp(0.025, 0.052, timeOfDay);
    state.gl.toneMappingExposure = THREE.MathUtils.lerp(1.05, 0.82, timeOfDay);
  });

  return (
    <>
      <fogExp2 ref={fog} attach="fog" args={['#080a0d', 0.025]} />
      <pointLight ref={light} position={[0, 2.2, 2.8]} intensity={1.5} color="#f1c27a" distance={9} />
    </>
  );
}

function VillaArchitecture({ quality }: VillaSceneProps) {
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#d8c7a3',
    metalness: 0.12,
    roughness: 0.08,
    transmission: quality === 'low' ? 0 : 0.28,
    transparent: true,
    opacity: 0.28,
  }), [quality]);

  return (
    <group position={[0, -0.45, 0]}>
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[6.8, 0.08, 5.2]} />
        <MeshReflectorMaterial blur={[260, 80]} mixBlur={0.8} mixStrength={0.22} color="#090b0f" metalness={0.42} roughness={0.28} />
      </mesh>

      <group position={[0, 0.62, 0]}>
        <mesh position={[-1.05, 0.62, -0.4]} castShadow>
          <boxGeometry args={[2.15, 1.25, 1.75]} />
          <meshStandardMaterial color="#15181f" roughness={0.44} metalness={0.18} />
        </mesh>
        <mesh position={[1.1, 0.92, 0.12]} castShadow>
          <boxGeometry args={[2.25, 1.85, 2.2]} />
          <meshStandardMaterial color="#191d25" roughness={0.38} metalness={0.2} />
        </mesh>
        <mesh position={[0.2, 1.88, -0.15]} castShadow>
          <boxGeometry args={[3.55, 0.18, 2.5]} />
          <meshStandardMaterial color="#20242c" roughness={0.32} metalness={0.22} />
        </mesh>
        {[-1.62, -0.72, 0.38, 1.38].map((x) => (
          <mesh key={x} position={[x, 0.92, 1.245]} material={glassMaterial}>
            <boxGeometry args={[0.54, 1.12, 0.025]} />
          </mesh>
        ))}
      </group>

      {[-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7].map((x, index) => (
        <mesh key={x} position={[x, 0.08, 2.28]}>
          <boxGeometry args={[0.035, 0.22 + index * 0.015, 0.035]} />
          <meshStandardMaterial color="#d7aa63" emissive="#9b6a2c" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function HolographicControls() {
  const labels = ['Lighting', 'Curtains', 'Climate', 'Security', 'Cinema', 'Energy'];

  return (
    <group position={[2.05, 1.05, 1.65]} rotation={[0, -0.42, 0]}>
      {labels.map((label, index) => (
        <Float key={label} speed={1.15} rotationIntensity={0.08} floatIntensity={0.12}>
          <mesh position={[0, 0.46 - index * 0.18, 0]}>
            <boxGeometry args={[0.9, 0.09, 0.018]} />
            <meshStandardMaterial color="#141922" emissive={index % 2 === 0 ? '#b99152' : '#5b7fa3'} emissiveIntensity={0.22} transparent opacity={0.58} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function VillaScene({ quality }: VillaSceneProps) {
  return (
    <>
      <ambientLight intensity={0.34} color="#d9c4a1" />
      <spotLight position={[-3.8, 4.5, 3.2]} angle={0.45} penumbra={0.85} intensity={2.2} color="#d9aa65" castShadow={quality === 'standard'} />
      <ScrollCameraRig quality={quality} />
      <VillaArchitecture quality={quality} />
      <HolographicControls />
      {quality === 'standard' && <Sparkles count={42} speed={0.18} size={1.2} scale={[6.5, 2.5, 4.5]} position={[0, 0.8, 0.8]} color="#d5a85f" opacity={0.26} />}
      <ContactShadows position={[0, -0.48, 0]} opacity={0.28} blur={2.8} scale={7} far={3.4} />
    </>
  );
}

export function LuxuryVillaExperience() {
  return (
    <WebGLGate className="pointer-events-none absolute inset-0 z-[1] hidden opacity-70 mix-blend-screen lg:block" label="luxury-villa-hero">
      {(quality) => (
        <Canvas
          shadows={quality === 'standard' ? { type: THREE.PCFShadowMap } : false}
          dpr={quality === 'standard' ? [1, 1.45] : [1, 1]}
          camera={{ position: [3.8, 2.2, 5.8], fov: 42, near: 0.1, far: 60 }}
          gl={{ alpha: true, antialias: quality === 'standard', powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.setClearColor(0x000000, 0);
          }}
        >
          <VillaScene quality={quality} />
        </Canvas>
      )}
    </WebGLGate>
  );
}
