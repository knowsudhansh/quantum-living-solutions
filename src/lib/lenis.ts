'use client';

import Lenis from 'lenis';

export type LenisInstance = Lenis;
export type LenisOptions = ConstructorParameters<typeof Lenis>[0];

export const defaultLenisOptions: LenisOptions = {
  duration: 1.1,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false,
};

export function canUseSmoothScroll() {
  return typeof window !== 'undefined' && 'requestAnimationFrame' in window;
}

export function createLenis(options?: LenisOptions) {
  return new Lenis({
    ...defaultLenisOptions,
    ...options,
  });
}
