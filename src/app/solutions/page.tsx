import React from 'react';
import { getAllSolutions } from '../../lib/config/solutions';
import { SolutionsHubGrid } from '../../components/solutions/solutions-hub-grid';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Solutions | Quantum Living Solutions',
  description: 'Explore our luxury home automation integration categories.',
};

export default function SolutionsPage() {
  const solutionsList = getAllSolutions();

  return (
    <div className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-foreground/80">
      <div className="border-b border-zinc-800 pb-8 mb-10">
        <h1 className="text-4xl md:text-5xl font-light mb-4 text-foreground tracking-tight">
          Automation Solutions
        </h1>
        <p className="text-lg text-foreground/75 max-w-2xl leading-relaxed font-normal">
          We integrate high-performance system architectures. Select a category below to view detailed specifications.
        </p>
      </div>

      <SolutionsHubGrid solutions={solutionsList} />
    </div>
  );
}
