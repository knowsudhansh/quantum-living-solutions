'use client';

import React from 'react';

interface HotspotProps {
  label: string;
  technologies?: string[];
  x: number; // Percentage from left of ZONE C
  y: number; // Percentage from top of ZONE C
  active: boolean;
}

export function TechnologyHotspot({ label, technologies = [], x, y, active }: HotspotProps) {
  if (!active) return null;

  return (
    <div
      className="absolute z-20 pointer-events-none transition-all duration-700 ease-out select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="flex items-center gap-3">
        {/* Pulsing point */}
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-[HSL(35,30%,50%)] opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[HSL(35,30%,45%)]" />
        </div>

        {/* Thin connector line */}
        <div className="w-12 h-[1px] bg-zinc-800" />

        {/* Label and Tech items */}
        <div className="bg-zinc-950/85 backdrop-blur-sm px-3.5 py-2.5 border border-zinc-900/80 rounded-sm">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[HSL(35,30%,45%)] font-semibold block leading-none mb-1">
            {label}
          </span>
          {technologies.length > 0 && (
            <div className="mt-1.5 flex flex-col space-y-0.5 select-none">
              {technologies.map((tech) => (
                <span key={tech} className="text-[10px] text-zinc-400 font-normal leading-tight">
                  • {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
