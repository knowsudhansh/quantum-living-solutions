'use client';

import React from 'react';

interface JourneyProgressProps {
  actsCount: number;
  activeAct: number;
  onNavigate: (index: number) => void;
}

export function JourneyProgress({ actsCount, activeAct, onNavigate }: JourneyProgressProps) {
  return (
    <div className="flex flex-col space-y-4 py-8 items-center">
      {Array.from({ length: actsCount }).map((_, i) => {
        const isActive = activeAct === i;
        return (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className="flex items-center gap-3 group text-left outline-none cursor-pointer"
            aria-label={`Navigate to Act ${i + 1}`}
          >
            <span className={`w-6 h-[1px] transition-all duration-300 ${
              isActive ? 'bg-[HSL(35,30%,50%)] w-10' : 'bg-zinc-800 group-hover:bg-zinc-650'
            }`} />
            <span className={`font-mono text-[9px] tracking-widest transition-colors duration-300 ${
              isActive ? 'text-[HSL(35,30%,50%)] font-semibold' : 'text-zinc-600 group-hover:text-zinc-400'
            }`}>
              {(i + 1).toString().padStart(2, '0')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
