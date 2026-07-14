'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

interface UseParallaxOptions {
  speed?: number;
  disabled?: boolean;
}

export function useParallax<T extends HTMLElement>({
  speed = 0.15,
  disabled = false,
}: UseParallaxOptions = {}): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return undefined;

    const update = () => {
      frameRef.current = null;
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      setOffset((viewportCenter - elementCenter) * speed);
    };

    const requestUpdate = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(update);
      }
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [disabled, speed]);

  return [ref, offset];
}
