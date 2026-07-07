
export type RenderState =
  | 'STANDARD_WEBGL'
  | 'LOW_QUALITY_WEBGL'
  | 'REDUCED_MOTION'
  | 'LOW_BATTERY'
  | 'WEBGL_UNAVAILABLE';

export function isWebGLAvailable(mockCanvas?: HTMLCanvasElement): boolean {
  if (typeof window === 'undefined' && !mockCanvas) return false;
  try {
    const canvas = mockCanvas || document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

export function isReducedMotionPreferred(mockWindow?: Window): boolean {
  if (typeof window === 'undefined' && !mockWindow) return false;
  const win = mockWindow || window;
  try {
    return win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

interface CapabilitySignals {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  batteryCharging?: boolean;
  batteryLevel?: number;
}

export function evaluateRenderState(
  webglAvailable: boolean,
  reducedMotion: boolean,
  signals: CapabilitySignals
): RenderState {
  if (!webglAvailable) {
    return 'WEBGL_UNAVAILABLE';
  }
  if (reducedMotion) {
    return 'REDUCED_MOTION';
  }
  
  // Low battery condition: discharging and level < 20%
  if (
    signals.batteryCharging === false &&
    signals.batteryLevel !== undefined &&
    signals.batteryLevel < 0.2
  ) {
    return 'LOW_BATTERY';
  }

  // Low capability signals: memory < 4GB or cores < 4
  const isLowMemory = signals.deviceMemory !== undefined && signals.deviceMemory < 4;
  const isLowCores = signals.hardwareConcurrency !== undefined && signals.hardwareConcurrency < 4;
  if (isLowMemory || isLowCores) {
    return 'LOW_QUALITY_WEBGL';
  }

  return 'STANDARD_WEBGL';
}
