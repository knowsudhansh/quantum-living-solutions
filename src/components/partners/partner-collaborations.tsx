import React from 'react';
import Image from 'next/image';
import { cache } from 'react';
import { prisma } from '@/lib/db';
import { ensureDefaultPartners } from '@/lib/partners/initializer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartnerRecord {
  id: string;
  name: string;
  tagline: string | null;
  overview: string;
  partnership: string;
  services: string[];
  websiteUrl: string;
  logo: { fileUrl: string; fileName: string } | null;
}

export interface PartnerCollaborationsProps {
  placement: 'home' | 'about' | 'footer';
  variant?: 'full' | 'compact';
}

// ─── Cached data fetch (deduplicates across layouts/pages) ────────────────────

const getCachedPartners = cache(async (
  placement: PartnerCollaborationsProps['placement']
): Promise<PartnerRecord[]> => {
  await ensureDefaultPartners();

  const where: Record<string, unknown> = { isActive: true };
  if (placement === 'home') where.showOnHome = true;
  else if (placement === 'about') where.showOnAbout = true;
  else if (placement === 'footer') where.showOnFooter = true;

  return prisma.partner.findMany({
    where,
    select: {
      id: true,
      name: true,
      tagline: true,
      overview: true,
      partnership: true,
      services: true,
      websiteUrl: true,
      logo: { select: { fileUrl: true, fileName: true } },
    },
    orderBy: { displayOrder: 'asc' },
  });
});

// ─── Compact footer strip ─────────────────────────────────────────────────────

function CompactPartnerStrip({ partners }: { partners: PartnerRecord[] }) {
  if (partners.length === 0) return null;

  return (
    <div className="border-t border-zinc-900 pt-8 mt-8" aria-label="Engineering Partners">
      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4 select-none">
        Engineering Partners
      </p>
      <div className="flex flex-wrap gap-6 items-center" role="list">
        {partners.map(p => (
          <div key={p.id} role="listitem">
            <a
              href={p.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={p.name}
              aria-label={`${p.name} — visit website (opens in new tab)`}
              className="group flex items-center gap-3 opacity-60 hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-300 rounded-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[HSL(210,80%,60%)]"
            >
              {p.logo && (
                <Image
                  src={p.logo.fileUrl}
                  alt={`${p.name} logo`}
                  width={96}
                  height={32}
                  className="h-8 w-auto object-contain filter grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0 transition-all duration-300"
                  loading="lazy"
                  unoptimized={p.logo.fileUrl.startsWith('/uploads/')}
                />
              )}
              <span className="text-xs font-mono text-zinc-500 group-hover:text-white transition-colors">
                {p.name}
              </span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Full editorial card ──────────────────────────────────────────────────────

function PartnerCard({ p }: { p: PartnerRecord }) {
  return (
    <article
      className="
        group/card grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8
        bg-[HSL(220,25%,7%)] border border-zinc-800/80
        hover:bg-[HSL(220,25%,9%)] hover:border-zinc-700/90 transition-all duration-300
        rounded-sm p-6 md:p-8 items-start
      "
      aria-label={`Partner: ${p.name}`}
    >
      {/* ── Left column: Logo + Identity + CTA ─────────────────────────── */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Logo */}
        <div className="w-full max-w-[160px] h-20 bg-zinc-900/60 border border-zinc-800 rounded-sm p-3 flex items-center justify-center overflow-hidden">
          {p.logo ? (
            <Image
              src={p.logo.fileUrl}
              alt={`${p.name} logo`}
              width={140}
              height={56}
              className="w-full h-full object-contain group-hover/card:scale-[1.03] transition-transform duration-500"
              loading="lazy"
              unoptimized={p.logo.fileUrl.startsWith('/uploads/')}
            />
          ) : (
            <span className="text-xs font-mono text-zinc-600 uppercase select-none">
              No Logo
            </span>
          )}
        </div>

        {/* Name + Tagline */}
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight leading-snug">
            {p.name}
          </h3>
          {p.tagline && (
            <p className="text-[10px] font-mono text-[HSL(35,30%,45%)] mt-1.5 uppercase tracking-wider leading-tight">
              {p.tagline}
            </p>
          )}
        </div>

        {/* Engineering Partner badge */}
        <span
          className="
            inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest
            px-2.5 py-1 rounded-sm border border-[HSL(35,30%,35%)]
            text-[HSL(35,30%,55%)] bg-[HSL(35,30%,10%)] w-fit select-none
          "
          aria-label="Engineering Partner"
        >
          <span aria-hidden="true">⚙</span>
          Engineering Partner
        </span>

        {/* Visit Website CTA */}
        <a
          href={p.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${p.name} website (opens in new tab)`}
          className="
            inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider
            border border-zinc-700 hover:border-[HSL(35,30%,45%)]
            text-zinc-400 hover:text-white
            px-4 py-2.5 rounded-sm
            transition-all duration-200
            outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[HSL(210,80%,60%)]
            w-fit select-none group/btn
          "
        >
          Visit Website
          <span className="inline-block transition-transform duration-200 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" aria-hidden="true">↗</span>
        </a>
      </div>

      {/* ── Right column: Content ──────────────────────────────────────── */}
      <div className="lg:col-span-9 space-y-5">
        {/* Company Overview */}
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 select-none">
            Company Overview
          </h4>
          <p className="text-sm text-foreground/75 leading-relaxed">
            {p.overview}
          </p>
        </div>

        {/* Partnership */}
        <div className="border-t border-zinc-800/60 pt-5">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 select-none">
            Our Partnership
          </h4>
          <p className="text-sm text-foreground/75 leading-relaxed">
            {p.partnership}
          </p>
        </div>

        {/* Services */}
        {p.services.length > 0 && (
          <div className="border-t border-zinc-800/60 pt-5">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3 select-none">
              Services
            </h4>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4"
              aria-label={`${p.name} services`}
            >
              {p.services.map((svc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                  <span
                    className="text-[HSL(35,30%,45%)] mt-0.5 shrink-0 text-xs"
                    aria-hidden="true"
                  >
                    ▸
                  </span>
                  <span>{svc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="border border-zinc-800/60 rounded-sm p-10 text-center bg-[HSL(220,25%,5%)]"
      aria-label="No partners currently listed"
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 select-none mb-2">
        Engineering Partnerships
      </p>
      <p className="text-sm text-zinc-500 font-light">
        Partnership announcements coming soon.
      </p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function PartnerCollaborations({
  placement,
  variant = 'full',
}: PartnerCollaborationsProps) {
  const partners = await getCachedPartners(placement);

  if (variant === 'compact') {
    return <CompactPartnerStrip partners={partners} />;
  }

  return (
    <section aria-labelledby="partners-heading" className="reveal-on-scroll">
      {/* Section header */}
      <div className="mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold mb-2 block select-none">
          ENGINEERING PARTNERSHIPS
        </span>
        <h2
          id="partners-heading"
          className="text-3xl sm:text-4xl font-light text-white tracking-tight"
        >
          Brand Collaborations
        </h2>
        <p className="text-base text-foreground/70 mt-3 max-w-2xl leading-relaxed">
          We partner with industry-leading manufacturers and engineering firms to deliver certified,
          high-performance installations.
        </p>
      </div>

      {/* Cards or empty state */}
      {partners.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6" role="list" aria-label="Engineering partners">
          {partners.map(p => (
            <div key={p.id} role="listitem">
              <PartnerCard p={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
