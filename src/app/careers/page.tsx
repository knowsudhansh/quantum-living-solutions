'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Cpu, MapPin } from 'lucide-react';
import { MotionCard, MotionReveal } from '../../components/ui/motion';
import { OtherOpportunitiesModal } from '../../components/careers/other-opportunities-modal';
import { careerPositions, otherOpportunity } from '../../lib/config/careers';

export default function CareersPage() {
  const [showOtherModal, setShowOtherModal] = useState(false);

  return (
    <div className="qls-page">
      <MotionReveal className="qls-hero">
        <span className="qls-eyebrow">Join Our Team</span>
        <h1 className="qls-title mb-5">Careers & Open Positions</h1>
        <p className="qls-lead">
          Build premium intelligent spaces with a team focused on exacting installation, dependable automation, and calm client experiences.
        </p>
      </MotionReveal>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {careerPositions.map((position, index) => (
          <MotionCard key={position.slug} delay={index * 0.08} className="qls-card p-6 md:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <span className="qls-eyebrow">Open Position</span>
                <h2 className="text-3xl font-light text-white">{position.title}</h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[color:var(--gold)]/35 bg-[color:var(--gold)]/10 text-[color:var(--gold-bright)]">
                <Cpu className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-foreground/72">{position.summary}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 sm:grid-cols-2">
              <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-[color:var(--gold-bright)]" aria-hidden="true" /> {position.type}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[color:var(--gold-bright)]" aria-hidden="true" /> {position.location}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {position.highlights.map((item) => (
                <span key={item} className="border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400">
                  {item}
                </span>
              ))}
            </div>

            <Link href={`/careers/${position.slug}`} className="qls-button qls-button-primary mt-8">
              View Role & Apply
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </MotionCard>
        ))}

        <MotionCard delay={0.12} className="qls-card p-6 md:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="qls-eyebrow">General Intake</span>
              <h2 className="text-3xl font-light text-white">{otherOpportunity.title}</h2>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-zinc-700 bg-zinc-950/50 text-zinc-300">
              <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-foreground/72">{otherOpportunity.summary}</p>
          <p className="mt-5 border-l border-[color:var(--gold)]/60 pl-4 text-sm leading-7 text-foreground/80">
            {otherOpportunity.message}
          </p>

          <button type="button" onClick={() => setShowOtherModal(true)} className="qls-button qls-button-secondary mt-8">
            Upload Resume
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </MotionCard>
      </section>

      <MotionReveal className="mt-14 border-t border-zinc-800/80 pt-8">
        <p className="max-w-2xl text-sm leading-7 text-foreground/65">
          For business or hiring coordination, write to{' '}
          <a href="mailto:rajkumarsharma@quantumlivingsolutions.com" className="text-[color:var(--gold-bright)] transition-colors hover:text-white">
            rajkumarsharma@quantumlivingsolutions.com
          </a>
          .
        </p>
      </MotionReveal>

      <OtherOpportunitiesModal open={showOtherModal} onClose={() => setShowOtherModal(false)} />
    </div>
  );
}
