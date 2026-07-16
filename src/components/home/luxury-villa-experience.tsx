'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Float, MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { useMotionSystem } from '@/components/animation';
import { registerGSAP } from '@/lib/gsap';
import { isWebGLAvailable } from '@/lib/utils/capability';

type WebGLGateProps = {
  children: (quality: 'standard' | 'low') => ReactNode;
  className?: string;
  label: string;
};

type VillaSceneProps = {
  quality: 'standard' | 'low';
};

type ProductPedestalSceneProps = {
  quality: 'standard' | 'low';
  productCount: number;
};

function useWebGLGate() {
  const { reducedMotion } = useMotionSystem();
  const [quality, setQuality] = useState<'standard' | 'low' | 'off'>('off');

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') {
      const frame = window.requestAnimationFrame(() => setQuality('off'));
      return () => window.cancelAnimationFrame(frame);
    }

    const media = window.matchMedia('(min-width: 1024px)');

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

  if (quality === 'off') return null;

  return (
    <div className={className} aria-hidden="true" data-webgl-layer={label} data-quality={quality}>
      {children(quality)}
    </div>
  );
}

function ScrollCameraRig({ quality }: VillaSceneProps) {
  const { camera } = useThree();
  const scrollProgress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(0, 0.55, 0), []);
  const fog = useRef<THREE.FogExp2>(null);
  const light = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const { ScrollTrigger } = registerGSAP();
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    const handlePointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointer);
      trigger.kill();
    };
  }, []);

  useFrame((state, delta) => {
    const progress = scrollProgress.current;
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
      <color attach="background" args={['#080a0d']} />
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

function ProductPedestalScene({ quality, productCount }: ProductPedestalSceneProps) {
  const group = useRef<THREE.Group>(null);
  const count = Math.max(1, Math.min(productCount, 4));

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.08;
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#f2d9ad" />
      <spotLight position={[0, 5, 2.8]} angle={0.42} penumbra={0.9} intensity={2.8} color="#d2a25a" />
      <group ref={group} position={[0, -0.85, 0]}>
        {Array.from({ length: count }).map((_, index) => {
          const angle = (index / count) * Math.PI * 2;
          const x = Math.cos(angle) * 1.8;
          const z = Math.sin(angle) * 0.75;
          return (
            <Float key={index} speed={0.8 + index * 0.1} rotationIntensity={0.12} floatIntensity={0.18}>
              <group position={[x, 0, z]} rotation={[0, -angle * 0.35, 0]}>
                <mesh position={[0, 0.08, 0]}>
                  <cylinderGeometry args={[0.42, 0.54, 0.16, 48]} />
                  <MeshReflectorMaterial blur={[220, 70]} mixBlur={0.7} mixStrength={0.35} color="#0d1016" metalness={0.52} roughness={0.22} />
                </mesh>
                <mesh position={[0, 0.46, 0]} castShadow>
                  <boxGeometry args={[0.44, 0.62, 0.08]} />
                  <meshStandardMaterial color="#10151c" metalness={0.45} roughness={0.2} emissive="#b99152" emissiveIntensity={0.12} />
                </mesh>
                <mesh position={[0, 0.46, 0.046]}>
                  <boxGeometry args={[0.34, 0.46, 0.012]} />
                  <meshStandardMaterial color="#d8c7a3" emissive="#d4a556" emissiveIntensity={0.26} transparent opacity={0.42} />
                </mesh>
              </group>
            </Float>
          );
        })}
      </group>
      {quality === 'standard' && <Sparkles count={28} speed={0.14} size={1} scale={[4.5, 1.8, 2.5]} position={[0, 0.3, 0]} color="#d5a85f" opacity={0.22} />}
      <ContactShadows position={[0, -0.88, 0]} opacity={0.32} blur={2.4} scale={5.5} far={3} />
    </>
  );
}

export function LuxuryVillaExperience() {
  return (
    <WebGLGate className="pointer-events-none absolute inset-0 z-[1] hidden opacity-70 mix-blend-screen lg:block" label="luxury-villa-hero">
      {(quality) => (
        <Canvas
          shadows={quality === 'standard'}
          dpr={quality === 'standard' ? [1, 1.45] : [1, 1]}
          camera={{ position: [3.8, 2.2, 5.8], fov: 42, near: 0.1, far: 60 }}
          gl={{ alpha: true, antialias: quality === 'standard', powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <VillaScene quality={quality} />
        </Canvas>
      )}
    </WebGLGate>
  );
}

export function ProductPedestalExperience({ productCount }: { productCount: number }) {
  return (
    <WebGLGate className="pointer-events-none absolute inset-0 hidden opacity-80 lg:block" label="product-pedestals">
      {(quality) => (
        <Canvas
          shadows={quality === 'standard'}
          dpr={quality === 'standard' ? [1, 1.35] : [1, 1]}
          camera={{ position: [0, 1.65, 4.8], fov: 42, near: 0.1, far: 40 }}
          gl={{ alpha: true, antialias: quality === 'standard', powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
          }}
        >
          <ProductPedestalScene quality={quality} productCount={productCount} />
        </Canvas>
      )}
    </WebGLGate>
  );
}
