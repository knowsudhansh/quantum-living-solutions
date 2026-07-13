'use client';

import React from 'react';
import Link from 'next/link';

interface Act {
  title: string;
  desc: string;
  subtitle: string;
  technologies?: string[];
  isCTA?: boolean;
}

interface JourneyActContentProps {
  act: Act;
  index: number;
  isActive: boolean;
  isReducedMotion: boolean;
}

export function JourneyActContent({ act, index }: JourneyActContentProps) {
  const textOpacityClass = 'text-foreground font-normal';
  const borderHighlightClass = 'border-[HSL(35,30%,45%)] scale-y-100';

  return (
    <div className="flex flex-col justify-center outline-none py-6 select-none">
      <div className={`border-l-2 ${borderHighlightClass} pl-6 max-w-md sm:max-w-lg lg:max-w-xl break-words`}>
        {/* Step index subtitle */}
        <span className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold mb-2 block select-none">
          {act.subtitle}
        </span>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light mb-4 text-foreground tracking-tight leading-snug break-words">
          {act.title}
        </h2>

        {/* Description */}
        <p className={`text-sm sm:text-base leading-relaxed ${textOpacityClass} break-words`}>
          {act.desc}
        </p>

        {/* Mobile Indicator */}
        <div className="mt-4 md:hidden text-[10px] font-mono text-zinc-500 select-none">
          Act {(index + 1).toString().padStart(2, '0')} / 10
        </div>

        {/* Showroom CTA actions */}
        {act.isCTA && (
          <div className="mt-8 flex flex-wrap gap-4 select-none">
            <Link
              href="/book-demo"
              className="px-6 py-3.5 bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] text-white text-xs font-mono tracking-wider uppercase rounded-sm transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)]"
            >
              Book Showroom Demo
            </Link>
            <a
              href="https://wa.me/918130856575"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 border border-zinc-700 hover:border-zinc-550 text-foreground text-xs font-mono tracking-wider uppercase rounded-sm transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)]"
            >
              Consult on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
