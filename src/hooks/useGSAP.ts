'use client';

import { useRef, type DependencyList, type RefObject } from 'react';
import { useGSAP as useGSAPReact } from '@gsap/react';
import type gsap from 'gsap';
import { registerGSAP } from '@/lib/gsap';

type GSAPCallback = (context: gsap.Context) => void | (() => void);

interface UseGSAPOptions {
  scope?: RefObject<Element | null>;
  dependencies?: DependencyList;
  revertOnUpdate?: boolean;
}

export function useGSAP(callback: GSAPCallback, options: UseGSAPOptions = {}) {
  const cleanupRef = useRef<void | (() => void)>(undefined);

  useGSAPReact(
    (context) => {
      registerGSAP();
      cleanupRef.current = callback(context);

      return () => {
        if (typeof cleanupRef.current === 'function') {
          cleanupRef.current();
        }
        cleanupRef.current = undefined;
      };
    },
    {
      scope: options.scope,
      dependencies: Array.from(options.dependencies ?? []),
      revertOnUpdate: options.revertOnUpdate ?? true,
    },
  );
}
