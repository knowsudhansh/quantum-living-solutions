'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { useMotionSystem } from './MotionProvider';

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className = '' }: ScrollProgressProps) {
  const { reducedMotion } = useMotionSystem();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.4 });

  if (reducedMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className={`fixed left-0 top-0 z-[70] h-px origin-left bg-[HSL(35,30%,55%)] ${className}`}
      style={{ scaleX, width: '100%' }}
    />
  );
}
