import React from 'react';
import { notFound } from 'next/navigation';
import { getSolutionBySlug, getAllSolutions } from '../../../lib/config/solutions';
import { SolutionDetailHero } from '../../../components/solutions/solution-detail-hero';
import { SystemFlowDiagram } from '../../../components/solutions/system-flow-diagram';
import { OperatingStructure } from '../../../components/solutions/operating-structure';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);
  if (!solution) return {};

  return {
    title: `${solution.title} | Quantum Living Solutions`,
    description: solution.shortDescription,
  };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const allSolutions = getAllSolutions();
  const index = allSolutions.findIndex((sol) => sol.slug === slug);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-foreground/80">
      <SolutionDetailHero
        title={solution.title}
        slug={solution.slug}
        shortDescription={solution.shortDescription}
        index={index}
      />

      {/* Detailed Overview Paragraph */}
      <div className="mb-24">
        <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-[HSL(210,15%,50%)] mb-6 select-none">
          Detailed Overview
        </h2>
        <div className="max-w-3xl">
          <p className="text-lg md:text-xl leading-relaxed text-foreground/85 font-normal">
            {solution.detailedOverview}
          </p>
        </div>
      </div>

      {/* Input -> Intelligence -> Action -> Outcome flowchart */}
      <SystemFlowDiagram slug={solution.slug} />

      {/* Operating Structure 3-layer capabilities overview */}
      <OperatingStructure
        capabilities={solution.capabilities}
        integrationNotes={solution.integrationNotes}
      />
    </div>
  );
}
