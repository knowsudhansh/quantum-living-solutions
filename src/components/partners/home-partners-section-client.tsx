'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Partner {
  id: string;
  name: string;
  tagline: string | null;
  overview: string;
  partnership: string;
  services: string[];
  websiteUrl: string;
  logo: { fileUrl: string; fileName: string } | null;
}

export function HomePartnersSectionClient() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/partners?placement=home')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json() as Promise<{ partners: Partner[] }>;
      })
      .then(data => {
        if (active) {
          setPartners(data.partners);
          setLoaded(true);
        }
      })
      .catch(err => {
        console.error('[HomePartnersSection] Error fetching partners:', err);
        if (active) {
          setError(true);
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Premium loading skeleton to prevent layout shift
  if (!loaded) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-900/60" aria-busy="true" aria-live="polite">
        <div className="mb-10 animate-pulse">
          <div className="h-4 w-40 bg-zinc-800 rounded mb-3"></div>
          <div className="h-10 w-80 bg-zinc-800 rounded mb-4"></div>
          <div className="h-6 w-full max-w-xl bg-zinc-800 rounded"></div>
        </div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-[HSL(220,25%,7%)] border border-zinc-850 rounded-sm p-8 animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-4">
                  <div className="h-16 w-36 bg-zinc-800 rounded"></div>
                  <div className="h-6 w-48 bg-zinc-800 rounded"></div>
                  <div className="h-6 w-32 bg-zinc-800 rounded"></div>
                </div>
                <div className="lg:col-span-9 space-y-4">
                  <div className="h-4 w-full bg-zinc-800 rounded"></div>
                  <div className="h-4 w-full bg-zinc-800 rounded"></div>
                  <div className="h-4 w-3/4 bg-zinc-800 rounded text-transparent">...</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Section with empty state if no partners found (or on error)
  const showEmpty = error || partners.length === 0;

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-900/60" aria-labelledby="home-partners-heading">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold mb-2 block select-none">
          ENGINEERING PARTNERSHIPS
        </span>
        <h2 id="home-partners-heading" className="text-3xl sm:text-4xl font-light text-white tracking-tight">
          Brand Collaborations
        </h2>
        <p className="text-base text-foreground/70 mt-3 max-w-2xl leading-relaxed">
          We partner with industry-leading manufacturers and engineering firms to deliver certified, high-performance installations.
        </p>
      </div>

      {showEmpty ? (
        <div className="border border-zinc-800/60 rounded-sm p-10 text-center bg-[HSL(220,25%,5%)]" aria-label="No partners currently listed">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 select-none mb-2">
            Engineering Partnerships
          </p>
          <p className="text-sm text-zinc-500 font-light">
            Partnership announcements coming soon.
          </p>
        </div>
      ) : (
        /* Cards */
        <div className="space-y-8" role="list" aria-label="Engineering partners">
          {partners.map(p => (
            <div key={p.id} role="listitem">
              <article
                className="
                  group/card grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8
                  bg-[HSL(220,25%,7%)] border border-zinc-800/80
                  hover:bg-[HSL(220,25%,9%)] hover:border-zinc-700/90 transition-all duration-300
                  rounded-sm p-6 md:p-8 items-start
                "
                aria-label={`Partner: ${p.name}`}
              >
                {/* Left: Logo + identity */}
                <div className="lg:col-span-3 flex flex-col gap-4">
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
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-tight leading-snug">{p.name}</h3>
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

                {/* Right: Overview + Partnership + Services */}
                <div className="lg:col-span-9 space-y-5">
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 select-none">Company Overview</h4>
                    <p className="text-sm text-foreground/75 leading-relaxed">{p.overview}</p>
                  </div>
                  <div className="border-t border-zinc-800/60 pt-5">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 select-none">Our Partnership</h4>
                    <p className="text-sm text-foreground/75 leading-relaxed">{p.partnership}</p>
                  </div>
                  {p.services.length > 0 && (
                    <div className="border-t border-zinc-800/60 pt-5">
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3 select-none">Services</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4" aria-label={`${p.name} services`}>
                        {p.services.map((svc, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                            <span className="text-[HSL(35,30%,45%)] mt-0.5 shrink-0 text-xs" aria-hidden="true">▸</span>
                            <span>{svc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
