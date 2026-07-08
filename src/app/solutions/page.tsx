import React from 'react';
import Link from 'next/link';
import { getAllSolutions } from '../../lib/config/solutions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Solutions | Quantum Living Solutions',
  description: 'Explore our luxury home automation integration categories.',
};

export default function SolutionsPage() {
  const solutionsList = getAllSolutions();

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-foreground/80">
      <h1 className="text-4xl md:text-5xl font-light mb-4 text-foreground tracking-tight">
        Automation Solutions
      </h1>
      <p className="text-lg text-foreground/75 mb-12 max-w-2xl leading-relaxed">
        We integrate high-performance system architectures. Select a category below to view detailed specifications.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {solutionsList.map((sol) => (
          <div key={sol.slug} className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <h2 className="text-2xl font-light text-foreground mb-2">
              <Link
                href={`/solutions/${sol.slug}`}
                className="hover:text-[HSL(35,35%,25%)] dark:hover:text-[HSL(210,80%,60%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
              >
                {sol.title}
              </Link>
            </h2>
            <p className="text-base text-foreground/70 leading-relaxed mb-4">{sol.shortDescription}</p>
            <Link
              href={`/solutions/${sol.slug}`}
              className="text-sm font-medium text-[HSL(35,35%,25%)] dark:text-[HSL(210,80%,60%)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
            >
              View Specifications &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
