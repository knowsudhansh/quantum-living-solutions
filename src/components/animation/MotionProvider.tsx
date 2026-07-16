'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { MotionConfig, useReducedMotion } from 'framer-motion';

interface MotionContextValue {
  reducedMotion: boolean;
  transition: {
    duration: number;
    ease: [number, number, number, number];
  };
}

const MotionContext = createContext<MotionContextValue | null>(null);
const subscribeHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const hasHydrated = useSyncExternalStore(subscribeHydration, getHydratedSnapshot, getServerHydrationSnapshot);
  const reducedMotion = hasHydrated && Boolean(prefersReducedMotion);

  const value = useMemo<MotionContextValue>(
    () => ({
      reducedMotion,
      transition: {
        duration: reducedMotion ? 0 : 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
    [reducedMotion],
  );

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion="user" transition={value.transition}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}

export function useMotionSystem() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotionSystem must be used inside MotionProvider');
  }
  return context;
}
