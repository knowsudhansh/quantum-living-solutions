'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSystem } from './MotionProvider';

interface TextRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}

export function TextReveal({
  text,
  className = '',
  wordClassName = '',
  delay = 0,
}: TextRevealProps) {
  const { reducedMotion } = useMotionSystem();
  const words = text.split(' ');

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden align-bottom" aria-hidden="true">
          <motion.span
            className={`inline-block ${wordClassName}`}
            initial={{ y: '110%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 0.6, delay: delay + index * 0.035, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {index < words.length - 1 ? '\u00a0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
