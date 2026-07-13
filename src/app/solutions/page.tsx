import React from 'react';
import Link from 'next/link';
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

      <MotionReveal className="max-w-7xl mx-auto px-6 pb-20">
        <div className="qls-card p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="qls-eyebrow">Hardware Catalog</span>
            <h2 className="qls-section-title mt-3 mb-4">
              Explore Our Products
            </h2>
            <p className="qls-lead text-base">
              Browse our complete catalog of smart home controllers, touch panels, sensors and automation devices.
            </p>
          </div>
          <Link
            href="/products"
            className="qls-button qls-button-primary w-full sm:w-auto text-center"
          >
            View Product Catalog
          </Link>
        </div>
      </MotionReveal>
    </div>
  );
}
