import React from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact | Quantum Living Solutions',
  description: 'Showroom location and contact details.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-foreground/80">
      <h1 className="text-4xl md:text-5xl font-light mb-8 text-foreground tracking-tight">
        Contact
      </h1>
      <section className="space-y-6 text-lg leading-relaxed">
        <p>
          Location and contact details will be published before public launch.
        </p>
      </section>
    </div>
  );
}
