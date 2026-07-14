'use client';

import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { canUseSmoothScroll, createLenis, type LenisOptions } from '@/lib/lenis';

export function SmoothScroll({ options }: { options?: LenisOptions }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !canUseSmoothScroll()) return undefined;

    const lenis = createLenis(options);
    let frameId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [options, reducedMotion]);

  return null;
}
