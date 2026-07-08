import React from 'react';
import { notFound } from 'next/navigation';
import { getLegalDocBySlug } from '../../../lib/config/legal';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const doc = getLegalDocBySlug(slug);
  if (!doc) return {};

  return {
    title: `${doc.title} | Quantum Living Solutions`,
    description: doc.shortDescription,
  };
}

export default async function LegalDetailPage({ params }: Props) {
  const { slug } = await params;
  const doc = getLegalDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  // Legal pages targeting WCAG AAA contrast ratio > 7:1
  // Slate-on-Parchment layout: deep slate text on soft parchment off-white, or silver-white text on absolute obsidian dark.
  return (
    <article className="max-w-3xl mx-auto px-6 py-20 bg-background text-foreground/90 leading-relaxed font-sans">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-light mb-4 text-foreground tracking-tight">
          {doc.title}
        </h1>
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4" />
      </header>

      <section className="text-base md:text-lg space-y-6 leading-loose">
        <p className="whitespace-pre-line">
          {doc.content}
        </p>
      </section>
    </article>
  );
}
