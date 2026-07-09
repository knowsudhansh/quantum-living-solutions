import React from 'react';
import Link from 'next/link';
import { getIconForSlug } from './solution-icons';

interface SolutionDetailHeroProps {
  title: string;
  slug: string;
  shortDescription: string;
  index: number;
}

export function SolutionDetailHero({ title, slug, shortDescription, index }: SolutionDetailHeroProps) {
  const solNum = (index + 1).toString().padStart(2, '0');
  
  return (
    <div className="border-b border-zinc-800 pb-16 mb-16">
      <div className="mb-10">
        <Link
          href="/solutions"
          className="inline-flex items-center text-xs font-mono tracking-wider uppercase text-[HSL(210,15%,50%)] hover:text-[HSL(210,80%,60%)] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)]"
        >
          &larr; Back to Solutions
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left column: Large display index number and title */}
        <div className="lg:col-span-8 flex flex-col md:flex-row items-start gap-8">
          <span className="text-7xl md:text-8xl font-extralight text-[HSL(35,30%,45%)] font-mono tracking-tighter select-none leading-none">
            {solNum}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-widest text-[HSL(210,80%,60%)] font-semibold font-mono">
                System Specification
              </span>
              <div className="text-[HSL(210,80%,60%)]">
                {getIconForSlug(slug, "w-5 h-5")}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-light text-foreground tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-foreground/75 leading-relaxed mt-6 max-w-2xl font-normal">
              {shortDescription}
            </p>
          </div>
        </div>

        {/* Right column: Action buttons */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto lg:w-full lg:mt-10">
          <Link
            href="/book-demo"
            className="flex-1 text-center bg-[HSL(35,35%,25%)] hover:bg-[HSL(35,35%,30%)] dark:bg-[HSL(210,80%,60%)] dark:hover:bg-[HSL(210,80%,65%)] text-white dark:text-zinc-950 px-6 py-4 rounded-sm text-xs font-mono tracking-wider uppercase transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)] outline-none"
          >
            Request Showroom Demo
          </Link>
          <Link
            href="/contact"
            className="flex-1 text-center border border-zinc-700 hover:border-zinc-500 text-foreground px-6 py-4 rounded-sm text-xs font-mono tracking-wider uppercase transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)] outline-none"
          >
            Consult Engineering Team
          </Link>
        </div>
      </div>
    </div>
  );
}
