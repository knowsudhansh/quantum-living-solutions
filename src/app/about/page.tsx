import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PartnerCollaborations } from '../../components/partners/partner-collaborations';
import { founder } from '../../lib/config/founder';
import { MotionCard, MotionReveal } from '../../components/ui/motion';
import { PRIVATE_SITE_VISIT } from '../../lib/config/business';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us | Quantum Living Solutions',
  description: 'Learn about our philosophy of natural lighting, luxury home automation, and our founder Raj Kumar Sharma.',
};

export default function AboutPage() {
  return (
    <div className="qls-page">
      {/* 1. Large Editorial Company Statement */}
      <MotionReveal className="qls-hero">
        <span className="qls-eyebrow">
          OUR MISSION
        </span>
        <h1 className="qls-title mb-6 max-w-4xl">
          Automation Designed Around Real Life.
        </h1>
        <p className="qls-lead">
          At Quantum Living Solutions, we help you adopt modern automation without making your spaces feel complicated, overbuilt, or difficult to maintain.
        </p>
      </MotionReveal>

      <MotionReveal className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start mb-20" aria-labelledby="founder-heading">
        <div className="lg:col-span-5">
          <div className="qls-card relative aspect-[4/5] overflow-hidden bg-[HSL(220,25%,7%)]">
            <Image
              src={founder.portraitUrl}
              alt={`${founder.name}, ${founder.designation}`}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block mb-3 select-none">
              Leadership Profile
            </span>
            <h2 id="founder-heading" className="text-3xl md:text-4xl font-light text-foreground tracking-tight">
              {founder.name}
            </h2>
            <p className="text-xs font-mono uppercase text-[HSL(35,30%,45%)] mt-2">
              {founder.designation}
            </p>
          </div>

          <blockquote className="border-l-2 border-[HSL(35,30%,45%)] pl-5 text-xl md:text-2xl font-light leading-snug text-white">
            &ldquo;{founder.quote}&rdquo;
          </blockquote>

          <div className="space-y-4">
            {founder.biography.map((paragraph) => (
              <p key={paragraph} className="text-sm md:text-base text-foreground/75 leading-relaxed font-normal">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {founder.experience.map((item) => (
              <MotionCard key={item.label} className="qls-card qls-card-hover p-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">{item.label}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{item.value}</p>
              </MotionCard>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 select-none">
              Achievements
            </h3>
            <ul className="space-y-3">
              {founder.achievements.map((achievement) => (
                <li key={achievement} className="flex gap-3 text-sm text-foreground/75 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[HSL(35,30%,45%)]" aria-hidden="true" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-zinc-800/80 pt-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-5 select-none">
              Timeline
            </h3>
            <div className="space-y-5">
              {founder.timeline.map((item) => (
                <div key={`${item.year}-${item.title}`} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-5">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[HSL(35,30%,45%)]">{item.year}</p>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-sm text-foreground/65 leading-relaxed mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {founder.socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border border-zinc-800 hover:border-[HSL(35,30%,45%)] text-zinc-300 hover:text-white px-4 py-2.5 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </MotionReveal>

      <MotionReveal className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start mb-20">
        <div className="lg:col-span-5">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 select-none">
            Company Approach
          </h3>
          <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-normal">
            We coordinate consultation, design, wiring, programming, and long-term support under one roof.
          </p>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 select-none">
              OUR HISTORY & APPROACH
            </h3>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-normal">
              We coordinate consultation, design, wiring, programming, and long-term support under one roof. Our philosophy rejects complex and flashy layouts in favor of clean, intuitive, and practical control interfaces.
            </p>
          </div>

          <div className="border-t border-zinc-800/80 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[HSL(25,60%,50%)] mb-2 select-none">
                Design Integrity
              </h4>
              <p className="text-sm text-foreground/70 leading-relaxed font-normal">
                Every custom system is planned around comfort and efficiency, complementing natural architectural elements rather than cluttering them with visible hardware.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-[HSL(210,80%,60%)] mb-2 select-none">
                Reliable Handover
              </h4>
              <p className="text-sm text-foreground/70 leading-relaxed font-normal">
                We believe that premium technology should be dependable. We ensure thorough system testing and clean handovers so that control feels simple and natural from day one.
              </p>
            </div>
          </div>
        </div>
      </MotionReveal>

      {/* 4. Core Pillars Grid */}
      <MotionReveal className="border-t border-zinc-800/80 pt-16 mb-20">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-8 select-none">
          OUR CORE VALUES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MotionCard className="qls-card qls-card-hover p-6 md:p-8">
            <h4 className="text-xl font-light text-foreground mb-3 tracking-tight">
              Our Values
            </h4>
            <p className="text-sm md:text-base text-foreground/70 leading-relaxed font-normal">
              We focus on dependable products, clear consultation, and smooth handover so each installation feels intuitive from day one.
            </p>
          </MotionCard>
          <MotionCard className="qls-card qls-card-hover p-6 md:p-8">
            <h4 className="text-xl font-light text-foreground mb-3 tracking-tight">
              Our Experience
            </h4>
            <p className="text-sm md:text-base text-foreground/70 leading-relaxed font-normal">
              Our team works across residential and commercial needs, coordinating design, wiring, programming, and support for scalable automation.
            </p>
          </MotionCard>
          <MotionCard className="qls-card qls-card-hover p-6 md:p-8">
            <h4 className="text-xl font-light text-foreground mb-3 tracking-tight">
              Our Mission
            </h4>
            <p className="text-sm md:text-base text-foreground/70 leading-relaxed font-normal">
              We help customers adopt modern automation without making spaces feel complicated, overbuilt, or difficult to maintain.
            </p>
          </MotionCard>
        </div>
      </MotionReveal>

      {/* 5. Partner Collaborations */}
      <MotionReveal className="border-t border-zinc-800/80 pt-16 mb-16">
        <PartnerCollaborations placement="about" variant="full" />
      </MotionReveal>

      {/* 6. Showroom & Presence Conversion Box */}
      <MotionReveal className="qls-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] mb-2 block select-none">
            VISIT US IN GORAKHPUR
          </span>
          <h3 className="text-2xl md:text-3xl font-light text-foreground tracking-tight mb-2">
            See the Technology in Action
          </h3>
          <p className="text-sm md:text-base text-foreground/70 leading-relaxed max-w-xl">
            Arrange a private site visit with our Gorakhpur engineering team to discuss lighting comfort, automated curtains, and the systems that fit your project.
          </p>
        </div>
        <Link
          href="/book-demo"
          className="qls-button qls-button-primary text-center"
        >
          {PRIVATE_SITE_VISIT.label} · {PRIVATE_SITE_VISIT.priceLabel}
        </Link>
      </MotionReveal>
    </div>
  );
}
