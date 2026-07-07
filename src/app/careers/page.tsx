import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Careers | Quantum Living Solutions',
  description: 'Careers opportunities and design consultation engineering roles.',
};

export default function CareersPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground/80">
      <h1 className="text-4xl md:text-5xl font-light mb-8 text-foreground tracking-tight">
        Careers
      </h1>
      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          We design integrated control ecosystems for luxury residential architectures. Our engineering 
          teams focus on high-performance, seamless technology integrations.
        </p>
        <div className="bg-zinc-100 dark:bg-zinc-900 p-8 border border-zinc-200 dark:border-zinc-800 rounded-sm mt-8">
          <h2 className="text-xl font-normal text-foreground mb-4">Opportunities</h2>
          <p className="text-base text-foreground/75 leading-relaxed">
            Our talent application portal and active opportunities will be published when the recruitment 
            workflow is ready. No applications are being accepted through this website at this stage.
          </p>
        </div>
      </section>
    </div>
  );
}
