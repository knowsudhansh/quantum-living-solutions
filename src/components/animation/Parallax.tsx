'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParallax } from '@/hooks/useParallax';
import { useMotionSystem } from './MotionProvider';

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className = '', speed = 0.15 }: ParallaxProps) {
  const { reducedMotion } = useMotionSystem();
  const [ref, offset] = useParallax<HTMLDivElement>({ speed, disabled: reducedMotion });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reducedMotion ? undefined : { y: offset }}
    >
      {children}
    </motion.div>
  );
}
