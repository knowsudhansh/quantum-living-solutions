'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMotionSystem } from './MotionProvider';

interface CursorGlowProps {
  className?: string;
  size?: number;
}

export function CursorGlow({ className = '', size = 360 }: CursorGlowProps) {
  const { reducedMotion } = useMotionSystem();
  const pointerX = useMotionValue(-size);
  const pointerY = useMotionValue(-size);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 30, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 30, mass: 0.4 });

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return undefined;

    let frame: number | null = null;
    let latestX = -size;
    let latestY = -size;

    const commit = () => {
      frame = null;
      pointerX.set(latestX - size / 2);
      pointerY.set(latestY - size / 2);
    };

    const handlePointerMove = (event: PointerEvent) => {
      latestX = event.clientX;
      latestY = event.clientY;
      if (frame === null) frame = window.requestAnimationFrame(commit);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [pointerX, pointerY, reducedMotion, size]);

  if (reducedMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none fixed z-[5] hidden rounded-full opacity-25 blur-3xl lg:block ${className}`}
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
        background: 'radial-gradient(circle, hsla(35, 30%, 45%, 0.25), transparent 65%)',
      }}
    />
  );
}
