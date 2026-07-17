'use client';

import { useEffect } from 'react';
import { canUseSmoothScroll, createLenis, type LenisOptions } from '@/lib/lenis';
import { registerGSAP } from '@/lib/gsap';
import { useMotionSystem } from './MotionProvider';

export function SmoothScroll({ options }: { options?: LenisOptions }) {
  const { reducedMotion } = useMotionSystem();

  useEffect(() => {
    if (reducedMotion || !canUseSmoothScroll()) return undefined;

    const { gsap, ScrollTrigger } = registerGSAP();
    const lenis = createLenis(options);
    let refreshFrame: number | null = null;

    const updateScrollTrigger = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);
    const refresh = () => {
      if (refreshFrame !== null) return;
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = null;
        lenis.resize();
        ScrollTrigger.refresh();
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        lenis.stop();
        return;
      }

      lenis.start();
      refresh();
    };

    lenis.on('scroll', updateScrollTrigger);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('orientationchange', refresh, { passive: true });
    window.addEventListener('pageshow', refresh, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    refresh();

    return () => {
      if (refreshFrame !== null) {
        window.cancelAnimationFrame(refreshFrame);
      }
      window.removeEventListener('resize', refresh);
      window.removeEventListener('orientationchange', refresh);
      window.removeEventListener('pageshow', refresh);
      document.removeEventListener('visibilitychange', handleVisibility);
      lenis.off('scroll', updateScrollTrigger);
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [options, reducedMotion]);

  return null;
}
