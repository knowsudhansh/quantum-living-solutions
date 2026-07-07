import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Experience Room | Quantum Living Solutions',
  description: 'Interactive smart space presets selectors overview.',
};

export default function ExperiencePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground/80">
      <h1 className="text-4xl md:text-5xl font-light mb-8 text-foreground tracking-tight">
        Interactive Experience
      </h1>
      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          Our Experience Room will enable dynamic preset selection simulating daylight changes, 
          pathway illuminations, and sanctuary evening transitions.
        </p>
        <p>
          Selecting presets updates ambient rendering variables statically where capabilities 
          indicate limited GPU or hardware memory concurrency.
        </p>
        <div className="bg-zinc-100 dark:bg-zinc-900 p-8 border border-zinc-200 dark:border-zinc-800 rounded-sm mt-8">
          <h2 className="text-xl font-normal text-foreground mb-4">Conceptual Experience Modes</h2>
          <p className="text-base text-foreground/75 mb-4 leading-relaxed">
            Our systems will support several environmental configurations. The following modes describe the conceptual experiences designed for the smart space:
          </p>
          <ul className="space-y-3 text-base text-foreground/75 list-disc pl-5">
            <li><strong>Day Mode</strong>: Automated daylight mapping and solar tracking adjustments.</li>
            <li><strong>Evening Mode</strong>: Gradual transition to warm terracotta tones as dusk falls.</li>
            <li><strong>Night Mode</strong>: High-efficiency illumination profiles and locking security accents.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
