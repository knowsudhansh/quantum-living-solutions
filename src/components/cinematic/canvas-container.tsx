'use client';

import React, { useEffect, useState } from 'react';
import {
  RenderState,
  isWebGLAvailable,
  isReducedMotionPreferred,
  evaluateRenderState,
} from '../../lib/utils/capability';
import { StructuralCanvas } from './structural-canvas';
import { BlueprintFallback } from './blueprint-fallback';

interface BatteryManager {
  charging: boolean;
  level: number;
}

interface StructuralCanvasContainerProps {
  activeAct: number;
  onRenderStateChange?: (state: RenderState) => void;
}

export function StructuralCanvasContainer({
  activeAct,
  onRenderStateChange,
}: StructuralCanvasContainerProps) {
  const [renderState, setSetRenderState] = useState<RenderState | null>(null);

  useEffect(() => {
    async function checkCapabilities() {

      const webgl = isWebGLAvailable();
      const motion = isReducedMotionPreferred();

      let batteryCharging: boolean | undefined = undefined;
      let batteryLevel: number | undefined = undefined;

      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        try {
          const nav = navigator as unknown as { getBattery: () => Promise<BatteryManager> };
          const batteryPromise = nav.getBattery();
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 500)
          );
          const battery = await Promise.race([batteryPromise, timeoutPromise]);
          batteryCharging = battery.charging;
          batteryLevel = battery.level;
        } catch {
          // Fall back gracefully to neutral on timeout or rejection
        }
      }

      const navMemory = navigator as unknown as { deviceMemory?: number };
      const memory = typeof navigator !== 'undefined' ? navMemory.deviceMemory : undefined;
      const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined;

      const state = evaluateRenderState(webgl, motion, {
        deviceMemory: memory,
        hardwareConcurrency: cores,
        batteryCharging,
        batteryLevel,
      });

      setSetRenderState(state);
      if (onRenderStateChange) {
        onRenderStateChange(state);
      }
    }

    checkCapabilities();
  }, [onRenderStateChange]);

  if (renderState === null) {
    return <div className="w-full h-full min-h-[500px] bg-[hsl(220,25%,7%)]" data-testid="canvas-loader" />;
  }

  if (renderState === 'REDUCED_MOTION') {
    return null;
  }

  if (renderState === 'LOW_BATTERY' || renderState === 'WEBGL_UNAVAILABLE') {
    return <BlueprintFallback />;
  }

  return <StructuralCanvas renderState={renderState} activeAct={activeAct} />;
}
