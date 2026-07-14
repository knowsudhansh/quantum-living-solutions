'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useMotionSystem } from './MotionProvider';

type FloatingElementProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className' | 'animate' | 'transition'>;

export function FloatingElement({
  children,
  className = '',
  distance = 10,
  duration = 4,
  ...props
}: FloatingElementProps) {
  const { reducedMotion } = useMotionSystem();

  return (
    <motion.div
      className={className}
      animate={reducedMotion ? undefined : { y: [-distance, distance, -distance] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
