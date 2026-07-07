import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Solutions | Quantum Living Solutions',
  description: 'Explore our luxury home automation integration categories.',
};

export default function SolutionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground/80">
      <h1 className="text-4xl md:text-5xl font-light mb-8 text-foreground tracking-tight">
        Automation Solutions
      </h1>
      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          We design and integrate high-performance home automation ecosystems for modern architectures. 
          Our integrations coordinate climate, lighting, security, and media networks into responsive, 
          unified systems.
        </p>
        <p className="text-base text-foreground/70 italic border-l-2 border-zinc-400 dark:border-zinc-600 pl-4">
          Detailed technical specifications and integration solutions categories will be published on Stage 3B deployment.
        </p>
      </section>
    </div>
  );
}
