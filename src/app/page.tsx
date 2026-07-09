'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StructuralCanvasContainer } from '../components/cinematic/canvas-container';
import { RenderState } from '../lib/utils/capability';
import { useActiveAct } from '../lib/hooks/use-active-act';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [renderState, setRenderState] = useState<RenderState | null>(null);
  const activeAct = useActiveAct(renderState);

  const acts = [
    {
      title: 'The Space is Waiting',
      desc: 'An architectural living space lit by soft, natural daylight. The ecosystem rests in a dormant state, awaiting occupancy.',
    },
    {
      title: 'Morning Routine',
      desc: 'As morning approaches, automated systems adjust climate boundaries. Natural solar energy is harvested to maintain temperature stability.',
    },
    {
      title: 'Presence Intelligence',
      desc: 'A digital presence sensor triggers pathway lighting patterns. Subtle guidance guides your movement through the home without manual intervention.',
    },
    {
      title: 'Interconnected Ecosystem',
      desc: 'Control coordinates across hidden devices, wall interfaces, and local keypads, communicating over secure low-latency grids.',
    },
    {
      title: 'Security Shield',
      desc: 'Evening security profiles verify the status of locks, windows, and entries, establishing a secure sanctuary zone automatically.',
    },
    {
      title: 'Cinema Transformation',
      desc: 'Deep scenic lighting transitions adapt to entertainment modes. Audio matrices and motorized window coverings coordinate for optimized media playback.',
    },
    {
      title: 'Night-Mode Sanctuary',
      desc: 'Subsystems shift to high-efficiency dormant profiles, preserving minimal pathway baseboard indicators for night navigation.',
    },
    {
      title: 'Complete Structural Grid',
      desc: 'An overview of coordinates, sensor locations, and automated nodes displays system diagnostics and network connectivity.',
    },
    {
      title: 'Technology Disappears',
      desc: 'Control systems fade into the background, letting structural architecture and natural spaces dominate the living environment.',
    },
    {
      title: 'Book Your Experience',
      desc: 'Online booking is not currently available through this website. Reservation availability details will be published when the scheduling service launches.',
      isCTA: true,
    },
  ];

  const isReducedMotion = renderState === 'REDUCED_MOTION';

  return (
    <div className="relative w-full min-h-screen">
      {/* 1. Background Cinematic Layer - always mount it to allow capability evaluations */}
      <div className="fixed inset-y-0 right-0 left-0 md:left-1/3 lg:left-1/2 z-0 pointer-events-none">
        <StructuralCanvasContainer activeAct={activeAct} onRenderStateChange={setRenderState} />
      </div>

      {/* Initialize capabilities check, rendering a loading placeholder during SSR/Hydration */}
      {renderState === null && (
        <div className="fixed inset-0 z-50 w-full h-full bg-background pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* 2. Semantic Storyboard Content Layer */}
      <div className="relative w-full max-w-4xl mx-auto px-6 md:px-12 z-10">
        {acts.map((act, i) => {
          const isActive = activeAct === i;

          // Set accessibility styling based on active/inactive states
          // We keep contrast > 4.5:1 even on inactive acts by using text-foreground/70
          const textOpacityClass = isReducedMotion
            ? 'text-foreground'
            : isActive
            ? 'text-foreground font-medium transition-all duration-300'
            : 'text-foreground/70 transition-all duration-300';

          const titleColorClass = isReducedMotion
            ? 'text-foreground'
            : isActive
            ? 'text-foreground font-light'
            : 'text-foreground/75';

          const borderHighlightClass = isReducedMotion
            ? 'border-transparent'
            : isActive
            ? 'border-[HSL(35,30%,45%)]'
            : 'border-zinc-200 dark:border-zinc-800';

          return (
            <section
              key={i}
              data-act-index={i}
              className="min-h-screen w-full flex flex-col justify-center py-24 outline-none"
            >
              <div className={`border-l-4 ${borderHighlightClass} pl-6 transition-all duration-300`}>
                <span className="text-xs uppercase tracking-widest text-[hsl(210,80%,30%)] dark:text-[hsl(210,80%,60%)] font-semibold mb-2 block select-none">
                  Act {(i + 1).toString().padStart(2, '0')}
                </span>
                <h2 className={`text-3xl md:text-4xl font-light mb-4 tracking-tight ${titleColorClass}`}>
                  {act.title}
                </h2>
                <p className={`text-base md:text-lg leading-relaxed max-w-2xl ${textOpacityClass}`}>
                  {act.desc}
                </p>

                {act.isCTA && (
                  <div className="mt-8">
                    <Link
                      href="/book-demo"
                      className="inline-block bg-[HSL(35,35%,25%)] dark:bg-[HSL(210,80%,60%)] text-white dark:text-zinc-950 px-8 py-3 rounded-sm text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                    >
                      Schedule a Consultation
                    </Link>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
