'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MotionReveal } from '../ui/motion';

type SceneMode = 'morning' | 'evening' | 'entertaining' | 'security';

interface SceneDetails {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  lighting: string;
  curtains: string;
  climate: string;
  security: string;
  entertainment?: string;
  accentClass: string;
  filterClass: string;
}

const SCENE_DATA: Record<SceneMode, SceneDetails> = {
  morning: {
    title: 'Morning',
    subtitle: 'Waking Up',
    description: 'Soft lighting coordinates with gradually opening shades to invite natural morning light into your home, warming the climate for the start of your day.',
    imageUrl: '/images/morning.jpg',
    lighting: 'Soft natural daylight',
    curtains: 'Opening automatically',
    climate: 'Comfort temperature active',
    security: 'Perimeter disarmed',
    accentClass: 'text-[HSL(35,30%,45%)] border-[HSL(35,30%,45%)] bg-[HSL(35,30%,45%)]/5',
    filterClass: 'brightness-[1.05] sepia-[0.02]',
  },
  evening: {
    title: 'Evening',
    subtitle: 'Dusk Transition',
    description: 'Indoor fixtures shift to warm architectural tones as twilight falls. Motorized shades slide closed to secure privacy and lock in climate comfort.',
    imageUrl: '/images/evening.jpg',
    lighting: 'Warm architectural presets',
    curtains: 'Closing for privacy',
    climate: 'Stable temperature control',
    security: 'Dusk perimeter check active',
    accentClass: 'text-[HSL(25,60%,50%)] border-[HSL(25,60%,50%)] bg-[HSL(25,60%,50%)]/5',
    filterClass: 'brightness-[0.9] sepia-[0.15] hue-rotate-[-5deg]',
  },
  entertaining: {
    title: 'Entertaining',
    subtitle: 'Social Gathering',
    description: 'Prepares the rooms for guests by dimming key fixtures into cinematic scenes, activating distributed music, and silently increasing ventilation.',
    imageUrl: '/images/entertaining.jpg',
    lighting: 'Cinematic low-light scene',
    curtains: 'Fully closed',
    climate: 'Silent ventilation active',
    security: 'Sanctuary mode standby',
    entertainment: 'Distributed audio active',
    accentClass: 'text-[HSL(210,80%,60%)] border-[HSL(210,80%,60%)] bg-[HSL(210,80%,60%)]/5',
    filterClass: 'brightness-[0.75] contrast-[1.1] saturate-[1.05]',
  },
  security: {
    title: 'Secure Home',
    subtitle: 'Sanctuary Armed',
    description: 'Secures the entire estate by verifying lock systems on all entries and windows, turning off interior paths, and arming boundary security.',
    imageUrl: '/images/security.jpg',
    lighting: 'Low pathway lighting only',
    curtains: 'Closed fully',
    climate: 'Night energy-saving active',
    security: 'All doors locked & armed',
    accentClass: 'text-zinc-400 border-zinc-700 bg-zinc-800/10',
    filterClass: 'brightness-[0.55] saturate-[0.8] hue-rotate-[10deg] contrast-[1.05]',
  },
};

export function EnvironmentViewer() {
  const [activeScene, setActiveScene] = useState<SceneMode>('morning');
  const active = SCENE_DATA[activeScene];

  return (
    <MotionReveal className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-stretch mt-12">
      {/* Immersive Image Display Panel (Left - 65% width) */}
      <div className="qls-card lg:col-span-8 relative flex flex-col justify-between overflow-hidden bg-zinc-950 min-h-[420px] md:min-h-[580px] h-[min(580px,70vh)]">
        {/* Cinematic Backdrop Image Stack with CSS Crossfade */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeScene}
              src={active.imageUrl}
              alt={`${active.title} scene view`}
              className={`absolute inset-0 w-full h-full object-cover opacity-35 ${active.filterClass}`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 0.38, scale: 1 }}
              exit={{ opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              loading="eager"
              decoding="async"
            />
          </AnimatePresence>
          {/* Edge vignette masks */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent z-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent z-20" />
        </div>

        {/* Top Header Label */}
        <div className="relative z-30 p-6 md:p-8 flex justify-between items-start">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase select-none">
            YOUR SPACE, TRANSFORMED
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[HSL(35,30%,45%)] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-foreground">
              {active.title} Mode
            </span>
          </div>
        </div>

        {/* Bottom Editorial Content */}
        <div className="relative z-30 p-6 md:p-8 mt-auto max-w-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-[HSL(35,30%,45%)] mb-2 block select-none">
            {active.subtitle}
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-foreground tracking-tight mb-3">
            {active.title} Preset
          </h2>
          <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-normal">
            {active.description}
          </p>
        </div>
      </div>

      {/* Interactive Controls & Subsystem Status (Right - 35% width) */}
      <div className="qls-card lg:col-span-4 flex flex-col justify-between p-6 md:p-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold font-mono mb-2 block select-none">
            CHOOSE A SCENE
          </span>
          <h3 className="text-xl md:text-2xl font-light text-foreground tracking-tight mb-6">
            Experience the Difference
          </h3>

          {/* Selectors */}
          <div className="flex flex-col gap-3">
            {(['morning', 'evening', 'entertaining', 'security'] as SceneMode[]).map((scene) => {
              const isSelected = activeScene === scene;
              const details = SCENE_DATA[scene];
              return (
                <button
                  key={scene}
                  onClick={() => setActiveScene(scene)}
                  className={`w-full text-left p-4 rounded-md border text-xs font-mono tracking-wider uppercase transition-all duration-300 outline-none cursor-pointer ${
                    isSelected
                      ? `border-l-4 font-semibold ${details.accentClass}`
                      : 'border-zinc-800 text-foreground/70 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {details.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simplified connected systems display */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-4 select-none">
            Systems Overview
          </span>
          <ul className="space-y-3.5 text-xs md:text-sm">
            <li className="flex justify-between items-center text-foreground/75">
              <span className="font-mono text-zinc-500">Lighting</span>
              <span className="font-normal text-right text-foreground">{active.lighting}</span>
            </li>
            <li className="flex justify-between items-center text-foreground/75">
              <span className="font-mono text-zinc-500">Curtains</span>
              <span className="font-normal text-right text-foreground">{active.curtains}</span>
            </li>
            <li className="flex justify-between items-center text-foreground/75">
              <span className="font-mono text-zinc-500">Climate</span>
              <span className="font-normal text-right text-foreground">{active.climate}</span>
            </li>
            <li className="flex justify-between items-center text-foreground/75">
              <span className="font-mono text-zinc-500">Security</span>
              <span className="font-normal text-right text-foreground">{active.security}</span>
            </li>
            {active.entertainment && (
              <li className="flex justify-between items-center text-foreground/75 transition-all duration-300">
                <span className="font-mono text-zinc-500">Entertainment</span>
                <span className="font-normal text-right text-foreground">{active.entertainment}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </MotionReveal>
  );
}
