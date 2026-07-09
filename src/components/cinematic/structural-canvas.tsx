'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RenderState } from '../../lib/utils/capability';

interface StructuralCanvasProps {
  renderState: RenderState;
  activeAct: number;
}

interface ThreeContext {
  animationFrameId?: number;
  resizeObserver?: ResizeObserver;
  mouseHandler?: (e: MouseEvent) => void;
  walls?: THREE.LineSegments;
  nodes?: Array<{ mesh: THREE.Mesh; subsystem: string; name: string }>;
  busLine?: THREE.Line;
  projectorCone?: THREE.Mesh;
  renderer?: THREE.WebGLRenderer;
  scene?: THREE.Scene;
  consultationTarget?: THREE.Group;
  consultationRingMat?: THREE.MeshBasicMaterial;
  consultationCenterMat?: THREE.MeshBasicMaterial;
  innerRingMesh?: THREE.Mesh;
  outerRingMesh?: THREE.Mesh;
}

const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach((m) => m.dispose());
  } else {
    material.dispose();
  }
};

export function StructuralCanvas({ renderState, activeAct }: StructuralCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<ThreeContext>({});

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

    // 1. Double-mount protection
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
      if (activeCtx.walls) {
        activeCtx.walls.geometry.dispose();
        disposeMaterial(activeCtx.walls.material);
      }
      if (activeCtx.nodes) {
        activeCtx.nodes.forEach((n) => {
          n.mesh.geometry.dispose();
          disposeMaterial(n.mesh.material);
        });
      }
      if (activeCtx.busLine) {
        activeCtx.busLine.geometry.dispose();
        disposeMaterial(activeCtx.busLine.material);
      }
      if (activeCtx.projectorCone) {
        activeCtx.projectorCone.geometry.dispose();
        disposeMaterial(activeCtx.projectorCone.material);
      }
      if (activeCtx.consultationTarget) {
        activeCtx.consultationTarget.children.forEach((child: THREE.Object3D) => {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          disposeMaterial(mesh.material);
        });
        if (activeCtx.scene) {
          activeCtx.scene.remove(activeCtx.consultationTarget);
        }
        activeCtx.consultationTarget = undefined;
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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isLowQuality,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    
    const dpr = isLowQuality ? 1 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    
    renderer.info.autoReset = false;

    // 3. Scene Geometries (Stage V1 Blueprint)
    const steelBlueMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.55 });
    const copperClayMat = new THREE.MeshBasicMaterial({ color: 0xcd693f, transparent: true, opacity: 0.55 });
    const bronzeMat = new THREE.MeshBasicMaterial({ color: 0x946b3f, transparent: true, opacity: 0.55 });

    const wallMaterial = new THREE.LineBasicMaterial({ color: 0x946b3f, opacity: 0.95, transparent: true });
    const wallPoints = [
      new THREE.Vector3(-3.5, 0, -2), new THREE.Vector3(3.5, 0, -2),
      new THREE.Vector3(3.5, 0, -2), new THREE.Vector3(3.5, 0, 2),
      new THREE.Vector3(3.5, 0, 2), new THREE.Vector3(-3.5, 0, 2),
      new THREE.Vector3(-3.5, 0, 2), new THREE.Vector3(-3.5, 0, -2),
      new THREE.Vector3(-1.5, 0, -2), new THREE.Vector3(-1.5, 0, 0),
      new THREE.Vector3(1.5, 0, 0), new THREE.Vector3(1.5, 0, 2),
    ];
    const wallGeom = new THREE.BufferGeometry().setFromPoints(wallPoints);
    const walls = new THREE.LineSegments(wallGeom, wallMaterial);
    scene.add(walls);
    activeCtx.walls = walls;

    const nodesConfig = [
      { name: 'climate1', pos: new THREE.Vector3(3, 0.1, -1), subsystem: 'climate' },
      { name: 'climate2', pos: new THREE.Vector3(1, 0.1, 0), subsystem: 'climate' },
      { name: 'security1', pos: new THREE.Vector3(-1, 0.1, -2), subsystem: 'security' },
      { name: 'security2', pos: new THREE.Vector3(2, 0.1, -1), subsystem: 'security' },
      { name: 'security3', pos: new THREE.Vector3(4, 0.1, 0), subsystem: 'security' },
      { name: 'presence1', pos: new THREE.Vector3(-2, 0.1, -1), subsystem: 'presence' },
      { name: 'presence2', pos: new THREE.Vector3(-1, 0.1, 0), subsystem: 'presence' },
      { name: 'media1', pos: new THREE.Vector3(1.5, 0.1, -1), subsystem: 'media' },
      { name: 'media2', pos: new THREE.Vector3(-1.5, 0.1, -2), subsystem: 'media' },
      { name: 'energy1', pos: new THREE.Vector3(1, 0.1, 2), subsystem: 'energy' }
    ];

    const sphereGeom = new THREE.SphereGeometry(0.13, 16, 16);
    const nodes = nodesConfig.map(cfg => {
      let mat = steelBlueMat;
      if (cfg.subsystem === 'climate' || cfg.subsystem === 'security') {
        mat = copperClayMat;
      } else if (cfg.subsystem === 'energy') {
        mat = bronzeMat;
      }
      const mesh = new THREE.Mesh(sphereGeom, mat.clone());
      mesh.position.copy(cfg.pos);
      scene.add(mesh);
      return { mesh, subsystem: cfg.subsystem, name: cfg.name };
    });
    activeCtx.nodes = nodes;

    const busPoints = [
      new THREE.Vector3(-3, 0.05, 0),
      new THREE.Vector3(-1, 0.05, 0),
      new THREE.Vector3(0, 0.05, -1),
      new THREE.Vector3(1.5, 0.05, -1),
      new THREE.Vector3(3, 0.05, -1),
      new THREE.Vector3(1, 0.05, 2),
      new THREE.Vector3(-3, 0.05, 0)
    ];
    const busGeometry = new THREE.BufferGeometry().setFromPoints(busPoints);
    const busMaterial = new THREE.LineDashedMaterial({
      color: 0x3b82f6,
      dashSize: 0.4,
      gapSize: 0.25,
      transparent: true,
      opacity: 0.6
    });
    const busLine = new THREE.Line(busGeometry, busMaterial);
    busLine.computeLineDistances();
    scene.add(busLine);
    activeCtx.busLine = busLine;

    const coneGeometry = new THREE.ConeGeometry(0.7, 2.2, 4);
    const coneMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0
    });
    const projectorCone = new THREE.Mesh(coneGeometry, coneMaterial);
    projectorCone.position.set(0.5, 0.1, -1);
    projectorCone.rotation.z = Math.PI / 2;
    scene.add(projectorCone);
    activeCtx.projectorCone = projectorCone;

    // Consultation Target (Concentric Rings & Center Point)
    const targetGroup = new THREE.Group();
    const centerGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const centerMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0 });
    const centerMesh = new THREE.Mesh(centerGeom, centerMat);
    targetGroup.add(centerMesh);

    const innerRingGeom = new THREE.RingGeometry(0.24, 0.26, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const innerRingMesh = new THREE.Mesh(innerRingGeom, ringMat);
    innerRingMesh.rotation.x = Math.PI / 2;
    targetGroup.add(innerRingMesh);

    const outerRingGeom = new THREE.RingGeometry(0.48, 0.5, 32);
    const outerRingMesh = new THREE.Mesh(outerRingGeom, ringMat);
    outerRingMesh.rotation.x = Math.PI / 2;
    targetGroup.add(outerRingMesh);

    targetGroup.position.set(0, 0.1, 0);
    scene.add(targetGroup);

    activeCtx.consultationTarget = targetGroup;
    activeCtx.consultationRingMat = ringMat;
    activeCtx.consultationCenterMat = centerMat;
    activeCtx.innerRingMesh = innerRingMesh;
    activeCtx.outerRingMesh = outerRingMesh;

    activeCtx.renderer = renderer;
    activeCtx.scene = scene;

    if (process.env.NODE_ENV === 'development') {
      (window as unknown as Record<string, unknown>).__THREE_CONTEXT__ = activeCtx;
    }

    // 4. Pointer Interaction
    let targetRotationX = 0;
    let targetRotationZ = 0;
    
    const mouseHandler = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      targetRotationX = y * 0.15;
      targetRotationZ = x * 0.15;
    };
    
    if (!isLowQuality) {
      container.addEventListener('mousemove', mouseHandler);
      activeCtx.mouseHandler = mouseHandler;
    }

    const targetCam = new THREE.Vector3(5, 5, 8);

    // 5. Animation Frame loop
    const animate = () => {
      if (!isMounted) return;

      walls.rotation.y = Math.sin(Date.now() * 0.0001) * 0.1;

      if (!isLowQuality) {
        walls.rotation.x += (targetRotationX - walls.rotation.x) * 0.05;
        walls.rotation.z += (targetRotationZ - walls.rotation.z) * 0.05;
      } else {
        walls.rotation.x = 0;
        walls.rotation.z = 0;
      }

      nodes.forEach(node => {
        node.mesh.rotation.x = walls.rotation.x;
        node.mesh.rotation.y = walls.rotation.y;
        node.mesh.rotation.z = walls.rotation.z;
      });
      busLine.rotation.x = walls.rotation.x;
      busLine.rotation.y = walls.rotation.y;
      busLine.rotation.z = walls.rotation.z;
      projectorCone.rotation.x = walls.rotation.x;
      projectorCone.rotation.y = walls.rotation.y;
      projectorCone.rotation.z = walls.rotation.z + Math.PI / 2;

      if (activeCtx.consultationTarget) {
        activeCtx.consultationTarget.rotation.x = walls.rotation.x;
        activeCtx.consultationTarget.rotation.y = walls.rotation.y;
        activeCtx.consultationTarget.rotation.z = walls.rotation.z;
      }
      if (activeCtx.innerRingMesh && activeCtx.outerRingMesh) {
        activeCtx.innerRingMesh.rotation.z += 0.006;
        activeCtx.outerRingMesh.rotation.z -= 0.003;
      }

      const act = activeActRef.current;

      if (act === 0) {
        targetCam.set(5, 5, 8);
      } else if (act === 1) {
        targetCam.set(4.2, 4.8, 5.8);
      } else if (act === 2) {
        targetCam.set(-4.2, 4.8, 5.8);
      } else if (act === 3) {
        targetCam.set(4.8, 5.5, 7.8);
      } else if (act === 4) {
        targetCam.set(-4.5, 4.8, 5.8);
      } else if (act === 5) {
        targetCam.set(4.2, 4.8, 5.8);
      } else if (act === 6) {
        targetCam.set(5, 4.8, 5.2);
      } else if (act === 7) {
        targetCam.set(0.001, 13.0, 0.001);
      } else if (act === 8) {
        targetCam.set(5, 5, 8);
      } else if (act === 9) {
        targetCam.set(5, 5, 8);
      }

      camera.position.lerp(targetCam, 0.05);
      camera.lookAt(0, 0, 0);

      nodes.forEach(({ mesh, subsystem, name }) => {
        let scale = 1.0;
        let opacity = 0.55;

        if (act === 0) {
          scale = 0.65;
          opacity = 0.35;
        } else if (act === 1) {
          if (subsystem === 'climate') {
            scale = 1.05;
            opacity = 1.0;
          } else {
            scale = 0.45;
            opacity = 0.2;
          }
        } else if (act === 2) {
          if (subsystem === 'presence') {
            scale = 1.05;
            opacity = 1.0;
          } else {
            scale = 0.45;
            opacity = 0.2;
          }
        } else if (act === 3) {
          scale = 0.75;
          opacity = 0.45;
        } else if (act === 4) {
          if (subsystem === 'security') {
            scale = 1.05;
            opacity = 1.0;
          } else {
            scale = 0.45;
            opacity = 0.2;
          }
        } else if (act === 5) {
          if (subsystem === 'media') {
            scale = 1.05;
            opacity = 1.0;
          } else {
            scale = 0.45;
            opacity = 0.2;
          }
        } else if (act === 6) {
          if (name === 'presence1') {
            scale = 1.05;
            opacity = 0.95;
          } else {
            scale = 0.25;
            opacity = 0.1;
          }
        } else if (act === 7) {
          scale = 1.05;
          opacity = 1.0;
        } else if (act === 8) {
          scale = 0.0;
          opacity = 0.0;
        } else if (act === 9) {
          scale = 0.0;
          opacity = 0.0;
        }

        if (isLowQuality) {
          scale = Math.min(scale, 1.2);
          opacity = Math.min(opacity, 0.6);
        }

        mesh.scale.set(
          mesh.scale.x + (scale - mesh.scale.x) * 0.05,
          mesh.scale.y + (scale - mesh.scale.y) * 0.05,
          mesh.scale.z + (scale - mesh.scale.z) * 0.05
        );
        mesh.material.opacity = mesh.material.opacity + (opacity - mesh.material.opacity) * 0.05;
      });

      let targetBusOpacity = 0.2;
      if (act === 3) targetBusOpacity = 0.9;
      else if (act === 7) targetBusOpacity = 1.0;
      else if (act === 8) targetBusOpacity = 0.0;
      else if (act === 9) targetBusOpacity = 0.0;
      busMaterial.opacity = busMaterial.opacity + (targetBusOpacity - busMaterial.opacity) * 0.05;

      let targetConeOpacity = 0.0;
      if (act === 5) targetConeOpacity = 0.65;
      coneMaterial.opacity = coneMaterial.opacity + (targetConeOpacity - coneMaterial.opacity) * 0.05;

      // Animate Wall Material Opacity (fading architecture to background in final acts)
      let targetWallOpacity = 0.95;
      if (act === 8 || act === 9) {
        targetWallOpacity = 0.12;
      }
      wallMaterial.opacity = THREE.MathUtils.lerp(wallMaterial.opacity, targetWallOpacity, 0.05);

      // Animate Consultation Target Scale & Opacity
      let targetScaleVal = 1.0;
      let targetConsultationOpacity = 0.0;
      if (act === 9) {
        targetConsultationOpacity = 1.0;
        const pulse = 1.0 + Math.sin(Date.now() * 0.0025) * 0.04;
        targetScaleVal = pulse;
      }
      if (activeCtx.consultationTarget) {
        activeCtx.consultationTarget.scale.set(targetScaleVal, targetScaleVal, targetScaleVal);
      }
      if (activeCtx.consultationRingMat && activeCtx.consultationCenterMat) {
        activeCtx.consultationRingMat.opacity = THREE.MathUtils.lerp(activeCtx.consultationRingMat.opacity, targetConsultationOpacity * 0.75, 0.05);
        activeCtx.consultationCenterMat.opacity = THREE.MathUtils.lerp(activeCtx.consultationCenterMat.opacity, targetConsultationOpacity, 0.05);
      }

      renderer.render(scene, camera);

      activeCtx.animationFrameId = requestAnimationFrame(animate);
    };

    activeCtx.animationFrameId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!isMounted || !entries[0]) return;
      const { width: w, height: h } = entries[0].contentRect;
      const aspect = w / (h || 500);
      
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h || 500, false);
    });
    
    resizeObserver.observe(container);
    activeCtx.resizeObserver = resizeObserver;

    return () => {
      isMounted = false;
      performCleanup();
    };
  }, [isLowQuality]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-background overflow-hidden"
      data-render-state={renderState.toLowerCase().replace(/_/g, '-')}
      data-quality-tier={isLowQuality ? 'low' : 'high'}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
