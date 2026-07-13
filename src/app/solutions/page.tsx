import React from 'react';
import { getAllSolutions } from '../../lib/config/solutions';
import { SolutionsHubGrid } from '../../components/solutions/solutions-hub-grid';
import { MotionReveal } from '../../components/ui/motion';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Solutions | Quantum Living Solutions',
  description: 'Explore our luxury home automation integration categories.',
};

export default function SolutionsPage() {
  const solutionsList = getAllSolutions();

  return (
    <div className="qls-page">
      <MotionReveal className="qls-hero">
        <span className="qls-eyebrow">Systems Architecture</span>
        <h1 className="qls-title mb-5">
          Automation Solutions
        </h1>
        <p className="qls-lead">
          We integrate high-performance system architectures. Select a category below to view detailed specifications.
        </p>
      </MotionReveal>

      <SolutionsHubGrid solutions={solutionsList} />
    </div>
  );
}
