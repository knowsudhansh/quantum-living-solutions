'use client';

import { useEffect, useRef, useState } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export function useMouse(enabled = true) {
  const frameRef = useRef<number | null>(null);
  const latestRef = useRef<MousePosition>({ x: 0, y: 0 });
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const update = () => {
      frameRef.current = null;
      setPosition(latestRef.current);
    };

    const handlePointerMove = (event: PointerEvent) => {
      latestRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled]);

  return position;
}
