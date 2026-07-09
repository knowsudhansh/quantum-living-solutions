import React from 'react';
import Link from 'next/link';
import { Solution } from '../../lib/config/solutions';
import { getIconForSlug } from './solution-icons';

interface SolutionsHubGridProps {
  solutions: Solution[];
}

export function SolutionsHubGrid({ solutions }: SolutionsHubGridProps) {
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12 p-6 md:p-8 border border-zinc-900/60 rounded-sm"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(63, 63, 70, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(63, 63, 70, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    >
      {solutions.map((sol, index) => {
        const solNum = (index + 1).toString().padStart(2, '0');
        
        // Asymmetric span logic for the final row
        let spanClass = "col-span-1";
        if (index === 6) {
          spanClass = "md:col-span-1 lg:col-span-2";
        } else if (index === 7) {
          spanClass = "md:col-span-1 lg:col-span-1";
        }

        return (
          <div
            key={sol.slug}
            className={`group relative flex flex-col justify-between p-8 border border-zinc-800 bg-[HSL(220,25%,7%)] hover:bg-[HSL(220,25%,8%)] hover:border-zinc-600 transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:transform-none focus-within:ring-2 focus-within:ring-[HSL(210,80%,60%)] outline-none rounded-sm min-h-[260px] ${spanClass}`}
          >
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-mono text-[HSL(210,15%,50%)] select-none">
                  ACT {solNum}
                </span>
                <div className="text-[HSL(210,15%,60%)] group-hover:text-[HSL(210,80%,60%)] transition-colors duration-300 motion-reduce:transition-none">
                  {getIconForSlug(sol.slug, "w-8 h-8")}
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl md:text-2xl font-light text-foreground mb-3 tracking-tight">
                <Link
                  href={`/solutions/${sol.slug}`}
                  className="hover:underline focus:outline-none"
                >
                  {sol.title}
                </Link>
              </h2>
              <p className="text-sm md:text-base text-foreground/75 leading-relaxed mb-6 font-normal">
                {sol.shortDescription}
              </p>
            </div>

            {/* Read Specification Link */}
            <div className="mt-auto">
              <Link
                href={`/solutions/${sol.slug}`}
                className="inline-flex items-center text-xs font-mono tracking-wider uppercase text-[HSL(210,80%,60%)] hover:text-white transition-colors duration-200 outline-none"
              >
                Read Specification{" "}
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
