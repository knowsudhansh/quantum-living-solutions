'use client';

import Lenis from 'lenis';

export type LenisInstance = Lenis;
export type LenisOptions = ConstructorParameters<typeof Lenis>[0];

export const defaultLenisOptions: LenisOptions = {
  duration: 0.92,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: true,
  touchMultiplier: 1.15,
  wheelMultiplier: 0.95,
};

export function canUseSmoothScroll() {
  if (typeof window === 'undefined' || !('requestAnimationFrame' in window)) return false;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const reducedData = 'connection' in navigator
    && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

  return !coarsePointer && !reducedData;
}

export function createLenis(options?: LenisOptions) {
  return new Lenis({
    ...defaultLenisOptions,
    ...options,
  });
}
