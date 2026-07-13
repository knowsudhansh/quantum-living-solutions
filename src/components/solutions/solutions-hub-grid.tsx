import React from 'react';
import Link from 'next/link';
import { Solution } from '../../lib/config/solutions';
import { getIconForSlug } from './solution-icons';
import { MotionCard } from '../ui/motion';

interface SolutionsHubGridProps {
  solutions: Solution[];
}

export function SolutionsHubGrid({ solutions }: SolutionsHubGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-12">
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
          <MotionCard
            key={sol.slug}
            delay={index * 0.035}
            className={`qls-card qls-card-hover group relative flex min-h-[260px] flex-col justify-between p-6 md:p-7 focus-within:ring-2 focus-within:ring-[HSL(210,80%,60%)] ${spanClass}`}
          >
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-mono text-[HSL(210,15%,50%)] select-none">
                  ACT {solNum}
                </span>
                <div className="text-[HSL(210,15%,62%)] group-hover:text-[HSL(210,80%,60%)] transition-colors duration-300 motion-reduce:transition-none [&_svg]:h-7 [&_svg]:w-7">
                  {getIconForSlug(sol.slug, "w-8 h-8")}
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl md:text-2xl font-light text-white mb-3 tracking-tight leading-tight">
                <Link
                  href={`/solutions/${sol.slug}`}
                  className="focus:outline-none"
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
                className="qls-text-link inline-flex items-center"
              >
                Read Specification{" "}
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none">
                  &rarr;
                </span>
              </Link>
            </div>
          </MotionCard>
        );
      })}
    </div>
  );
}
