'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useMotionSystem } from './MotionProvider';

type SectionRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article';
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className' | 'initial' | 'whileInView' | 'viewport' | 'transition'>;

export function SectionReveal({
  children,
  className = '',
  delay = 0,
  as = 'section',
  ...props
}: SectionRevealProps) {
  const { reducedMotion } = useMotionSystem();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </Component>
  );
}
