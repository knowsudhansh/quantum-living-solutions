import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSolutionBySlug } from '../../../lib/config/solutions';

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

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground/80">
      <div className="mb-8">
        <Link
          href="/solutions"
          className="text-sm font-medium text-[HSL(35,35%,25%)] dark:text-[HSL(210,80%,60%)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
        >
          &larr; Back to Solutions
        </Link>
      </div>

      <h1 className="text-4xl md:text-5xl font-light mb-6 text-foreground tracking-tight">
        {solution.title}
      </h1>

      <section className="mb-10">
        <h2 className="text-xl font-normal text-foreground mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          Overview
        </h2>
        <p className="text-lg leading-relaxed text-foreground/75">
          {solution.detailedOverview}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-normal text-foreground mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          System Capabilities
        </h2>
        <ul className="list-disc pl-5 space-y-3 text-base text-foreground/75">
          {solution.capabilities.map((cap, i) => (
            <li key={i}>{cap}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-normal text-foreground mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          Integration Notes
        </h2>
        <p className="text-base leading-relaxed text-foreground/75">
          {solution.integrationNotes}
        </p>
      </section>

      <div className="mt-12 bg-zinc-100 dark:bg-zinc-900 p-8 border border-zinc-200 dark:border-zinc-800 rounded-sm">
        <p className="text-base text-foreground/75 leading-relaxed">
          Showroom scheduling is not yet available. Booking details will be published when the scheduling service launches.
        </p>
      </div>
    </div>
  );
}
