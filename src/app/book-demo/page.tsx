import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Book a Demo | Quantum Living Solutions',
  description: 'Schedule a cinematic home automation demonstration.',
};

export default function BookDemoPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground/80">
      <h1 className="text-4xl md:text-5xl font-light mb-8 text-foreground tracking-tight">
        Book an Experience
      </h1>
      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          Experience our integrated home automation systems firsthand in our showroom space.
        </p>
        <div className="bg-zinc-100 dark:bg-zinc-900 p-8 border border-zinc-200 dark:border-zinc-800 rounded-sm mt-8">
          <h2 className="text-xl font-normal text-foreground mb-4">Availability</h2>
          <p className="text-base text-foreground/75 leading-relaxed">
            Online demo scheduling is not yet available. Booking availability and reservation details 
            will be published when the scheduling service launches.
          </p>
        </div>
      </section>
    </div>
  );
}
