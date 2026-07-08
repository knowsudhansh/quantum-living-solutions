'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RenderState } from '../../lib/utils/capability';

interface StructuralCanvasProps {
  renderState: RenderState;
  activeAct: number;
}

export function StructuralCanvas({ renderState, activeAct }: StructuralCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Single ref containing mutable three.js context elements to avoid closure leaks
  const contextRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    animationFrameId?: number;
    resizeObserver?: ResizeObserver;
    mouseHandler?: (e: MouseEvent) => void;
    scene?: THREE.Scene;
    cube?: THREE.Mesh;
    grid?: THREE.GridHelper;
  }>({});

  const [drawCalls, setDrawCalls] = useState(0);


  // Active state metrics
  const isLowQuality = renderState === 'LOW_QUALITY_WEBGL';

  const activeActRef = useRef(activeAct);
  useEffect(() => {
    activeActRef.current = activeAct;
  }, [activeAct]);

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    if (!container || !canvas) return;

    // 1. Double-mount protection: clean up any pre-existing instance in this context
    const activeCtx = contextRef.current;
    const performCleanup = () => {
      if (activeCtx.animationFrameId !== undefined) {
        cancelAnimationFrame(activeCtx.animationFrameId);
        activeCtx.animationFrameId = undefined;
      }
      if (activeCtx.resizeObserver) {
        activeCtx.resizeObserver.disconnect();
        activeCtx.resizeObserver = undefined;
      }
      if (activeCtx.mouseHandler && container) {
        container.removeEventListener('mousemove', activeCtx.mouseHandler);
        activeCtx.mouseHandler = undefined;
      }
      if (activeCtx.cube) {
        activeCtx.cube.geometry.dispose();
        if (Array.isArray(activeCtx.cube.material)) {
          activeCtx.cube.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          activeCtx.cube.material.dispose();
        }
      }
      if (activeCtx.grid) {
        activeCtx.grid.geometry.dispose();
        if (Array.isArray(activeCtx.grid.material)) {
          activeCtx.grid.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          activeCtx.grid.material.dispose();
        }
      }
      if (activeCtx.renderer) {
        activeCtx.renderer.dispose();
        activeCtx.renderer = undefined;
      }
    };

    performCleanup();

    // 2. Initialize Three.js Components
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10); // obsidian black matching HSL(220, 25%, 7%)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 0, 0);

    // Renderer optimization based on quality tiers
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isLowQuality, // Disable antialiasing for low-quality WebGL tier
      alpha: false,
    });
    
    // Set device pixel ratio limits based on capability tier
    const dpr = isLowQuality ? 1 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    
    renderer.info.autoReset = false;

    // Scene Geometries (Structural Node and blueprint coordinate grids)
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x3b82f6, // steel blue
      wireframe: true,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const grid = new THREE.GridHelper(10, 10, 0x1d4ed8, 0x1e293b);
    scene.add(grid);

    // Save references to context
    activeCtx.renderer = renderer;
    activeCtx.scene = scene;
    activeCtx.cube = cube;
    activeCtx.grid = grid;

    // 3. Pointer Move Hover Interaction Handler (Clamped Subtle Rotation Tilt)
    let targetRotationX = 0;
    let targetRotationZ = 0;
    
    const mouseHandler = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Clamp tilt angle to prevent excessive rotation
      targetRotationX = y * 0.15;
      targetRotationZ = x * 0.15;
    };
    
    container.addEventListener('mousemove', mouseHandler);
    activeCtx.mouseHandler = mouseHandler;

    const targetCam = new THREE.Vector3(5, 5, 8);
    const targetScale = new THREE.Vector3(1, 1, 1);

    // 4. Animation Frame loop
    const animate = () => {
      if (!isMounted) return;

      // Restrained automatic rotation along Yaw axis (Y-axis)
      cube.rotation.y += 0.005;

      if (!isLowQuality) {
        // Interpolate pointer tilt smoothly (damping factor 0.05)
        cube.rotation.x += (targetRotationX - cube.rotation.x) * 0.05;
        cube.rotation.z += (targetRotationZ - cube.rotation.z) * 0.05;
      } else {
        cube.rotation.x = 0;
        cube.rotation.z = 0;
      }

      const act = activeActRef.current;
      if (act === 0) {
        targetCam.set(5, 5, 8);
        targetScale.set(1, 1, 1);
      } else if (act === 1) {
        targetCam.set(0, 4, 9);
        targetScale.set(1.3, 1.3, 1.3);
      } else if (act === 2) {
        targetCam.set(-4, 2, 9);
        targetScale.set(1, 1.8, 1);
      } else if (act === 3) {
        targetCam.set(5, 0, 8);
        targetScale.set(1.6, 1.6, 1.6);
      } else if (act === 4) {
        targetCam.set(3, 5, 6);
        targetScale.set(1.1, 1.1, 1.1);
      } else if (act === 5) {
        targetCam.set(0, 1, 9);
        targetScale.set(1.6, 1.0, 1.8);
      } else if (act === 6) {
        targetCam.set(2, 2, 12);
        targetScale.set(0.7, 0.7, 0.7);
      } else if (act === 7) {
        targetCam.set(0, 8, 0.1);
        targetScale.set(2.0, 2.0, 2.0);
      } else if (act === 8) {
        targetCam.set(3, 3, 6);
        targetScale.set(1.0, 1.0, 1.0);
      } else if (act === 9) {
        targetCam.set(0, 0, 10);
        targetScale.set(0.5, 0.5, 0.5);
      }

      // Smooth camera interpolation
      camera.position.lerp(targetCam, 0.05);
      camera.lookAt(0, 0, 0);

      // Smooth scale interpolation
      cube.scale.lerp(targetScale, 0.05);

      renderer.render(scene, camera);
      
      // Report draw calls for metrics
      if (isMounted) {
        setDrawCalls(renderer.info.render.calls);
      }

      activeCtx.animationFrameId = requestAnimationFrame(animate);
    };

    activeCtx.animationFrameId = requestAnimationFrame(animate);

    // 5. Resize observer to handle container fluid adjustments
    const resizeObserver = new ResizeObserver((entries) => {
      if (!isMounted || !entries[0]) return;
      const { width: w, height: h } = entries[0].contentRect;
      const aspect = w / (h || 500);
      
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h || 500);
    });
    
    resizeObserver.observe(container);
    activeCtx.resizeObserver = resizeObserver;

    // Cleanup hook on unmount
    return () => {
      isMounted = false;
      performCleanup();
    };
  }, [isLowQuality]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-[hsl(220,25%,7%)] overflow-hidden"
      data-render-state={renderState.toLowerCase().replace(/_/g, '-')}
      data-quality-tier={isLowQuality ? 'low' : 'high'}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      
      {/* Cinematic HUD Telemetry */}
      <div className="absolute top-8 left-8 z-10 select-none pointer-events-none font-mono text-xs text-[hsl(210,15%,50%)]">
        <span className="tracking-widest uppercase block text-[hsl(210,80%,60%)] font-semibold mb-1">
          SYSTEM STATUS: ONLINE
        </span>
        <span>NODE POSITION SEC: {(activeAct + 1).toString().padStart(2, '0')} / 10</span>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-8 right-8 z-10 select-none pointer-events-none text-xs text-[hsl(210,15%,50%)] bg-[rgba(10,12,16,0.8)] px-3 py-1.5 rounded border border-[hsl(210,50%,15%)] font-mono">
          WebGL Active | DPR: {isLowQuality ? '1.0' : '2.0'} | Draw Calls: {drawCalls}
        </div>
      )}
    </div>
  );
}
