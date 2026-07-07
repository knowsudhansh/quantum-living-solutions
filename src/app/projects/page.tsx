import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Projects | Quantum Living Solutions',
  description: 'View case studies and automation system topologies of our architectural spaces.',
};

export default function ProjectsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground/80">
      <h1 className="text-4xl md:text-5xl font-light mb-8 text-foreground tracking-tight">
        Featured Projects
      </h1>
      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          We construct integrated automation topologies for premium spaces. Our portfolio details 
          before-and-after lighting modifications, occupancy zones, and network layouts.
        </p>
        <p>
          Each case study presents our core focus on structural design alignment, 
          ensuring custom systems match natural architectural layouts.
        </p>
        <p className="text-base text-foreground/70 italic border-l-2 border-zinc-400 dark:border-zinc-600 pl-4">
          Visual case studies, spatial photography, and system diagrams will be published before public launch.
        </p>
      </section>
    </div>
  );
}
