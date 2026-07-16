'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from 'framer-motion';
import { useMotionSystem } from './MotionProvider';

type MagneticButtonProps = Omit<HTMLMotionProps<'button'>, 'style' | 'children'> & {
  children: React.ReactNode;
  strength?: number;
};

export function MagneticButton({
  children,
  className = '',
  strength = 0.28,
  onPointerMove,
  onPointerLeave,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const { reducedMotion } = useMotionSystem();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.6 });

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      className={className}
      style={reducedMotion ? undefined : { x, y }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (reducedMotion || event.pointerType === 'touch') return;

        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;

        x.set((event.clientX - bounds.left - bounds.width / 2) * strength);
        y.set((event.clientY - bounds.top - bounds.height / 2) * strength);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        reset();
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
