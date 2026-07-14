'use client';

import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { useMouse } from '@/hooks/useMouse';

interface CursorGlowProps {
  className?: string;
  size?: number;
}

export function CursorGlow({ className = '', size = 360 }: CursorGlowProps) {
  const reducedMotion = useReducedMotion();
  const { x, y } = useMouse(!reducedMotion);
  const springX = useSpring(x - size / 2, { stiffness: 120, damping: 30, mass: 0.4 });
  const springY = useSpring(y - size / 2, { stiffness: 120, damping: 30, mass: 0.4 });

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
