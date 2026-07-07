import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About | Quantum Living Solutions',
  description: 'Our philosophy of natural architectural illumination and seamless automation integration.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground/80">
      <h1 className="text-4xl md:text-5xl font-light mb-8 text-foreground tracking-tight">
        Our Philosophy
      </h1>
      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          We provide luxury home automation systems designed to maintain high performance, 
          usability, and accessibility. We separate rich visual experiences from core transaction paths.
        </p>
        <p>
          Our creative direction rejects artificial neon styling and arbitrary designs. 
          We utilize cohesive palettes representing times of day, matching natural architectural illumination.
        </p>
        <p>
          By styling spaces with matte textures, natural concrete, and brushed metal accents, 
          we ensure technology complements rather than dominates the environment.
        </p>
      </section>
    </div>
  );
}
