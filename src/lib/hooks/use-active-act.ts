import { useEffect, useState } from 'react';
import { RenderState } from '../utils/capability';

export function useActiveAct(renderState: RenderState | null) {
  const [activeAct, setActiveAct] = useState(0);

  useEffect(() => {
    if (!renderState || renderState === 'REDUCED_MOTION') {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Target middle of the screen
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const actIndex = parseInt(entry.target.getAttribute('data-act-index') || '0', 10);
          setActiveAct((prev) => (prev !== actIndex ? actIndex : prev));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const sections = document.querySelectorAll('section[data-act-index]');
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      observer.disconnect();
    };
  }, [renderState]);

  return activeAct;
}
