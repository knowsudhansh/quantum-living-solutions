'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowRight,
  Cctv,
  ChartNoAxesColumnIncreasing,
  Coffee,
  DoorOpen,
  Fingerprint,
  Lock,
  Moon,
  Play,
  Projector,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Thermometer,
  Volume2,
  Zap,
} from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { FloatingElement } from '@/components/animation/FloatingElement';
import { MagneticButton } from '@/components/animation/MagneticButton';
import { useMotionSystem } from '@/components/animation/MotionProvider';
import { SectionReveal } from '@/components/animation/SectionReveal';
import { SocialLinks } from '@/components/social/social-links';
import { founder } from '@/lib/config/founder';
import { PRIVATE_SITE_VISIT } from '@/lib/config/business';
import { useRouter } from 'next/navigation';

interface FeaturedProduct {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  description: string;
  coverImage: { fileUrl: string } | null;
  category: { name: string };
  brand: { name: string } | null;
}

interface Partner {
  id: string;
  name: string;
  tagline: string | null;
  websiteUrl: string;
  logo: { fileUrl: string } | null;
}

interface VillaSceneProps {
  id: string;
  act: string;
  title: string;
  copy: string;
  image: string;
  imageAlt: string;
  children: React.ReactNode;
  reverse?: boolean;
}

interface CinematicSceneProps {
  id: string;
  act: string;
  title: string;
  copy: string;
  image: string;
  imageAlt: string;
  children: React.ReactNode;
  reverse?: boolean;
  copyClassName?: string;
  overlay?: 'warm' | 'night' | 'cinema' | 'secure' | 'energy';
}

const sceneImages = {
  entry: '/images/morning.jpg',
  living: '/images/evening.jpg',
  kitchen: '/images/kitchen.jpg',
  bedroom: '/images/morning.jpg',
  theater: '/images/entertaining.jpg',
  security: '/images/security.jpg',
  energy: '/images/workspace.jpg',
};

const livingControls = [
  { label: 'Lighting', icon: SunMedium },
  { label: 'Curtains', icon: DoorOpen },
  { label: 'Climate', icon: Zap },
  { label: 'Scenes', icon: Moon },
  { label: 'Music', icon: Volume2 },
  { label: 'Security', icon: ShieldCheck },
];

const kitchenRoutines = [
  { label: 'Coffee', value: 'Brewing', icon: Coffee },
  { label: 'Cabinet LED', value: 'Warm 42%', icon: SunMedium },
  { label: 'Touch Panel', value: 'Active', icon: Zap },
];

const bedroomControls = [
  { label: 'Curtains', value: 'Closing', icon: Moon },
  { label: 'Climate', value: '22 degrees', icon: Thermometer },
  { label: 'Night Mode', value: 'Enabled', icon: Sparkles },
];

const securitySignals = [
  { label: 'Door lock', value: 'Secured', icon: Lock },
  { label: 'Camera', value: 'Tracking', icon: Cctv },
  { label: 'Motion', value: 'Clear', icon: ShieldCheck },
];

const energyMetrics = [
  { label: 'Solar production', value: '4.8 kW' },
  { label: 'Battery storage', value: '78%' },
  { label: 'Home usage', value: '2.1 kW' },
  { label: 'Grid draw', value: '0.4 kW' },
];

const subscribeHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function useHasHydrated() {
  return useSyncExternalStore(subscribeHydration, getHydratedSnapshot, getServerHydrationSnapshot);
}

function VillaScene({ id, act, title, copy, image, imageAlt, children, reverse = false }: VillaSceneProps) {
  return (
    <section id={id} className="villa-scene relative isolate overflow-hidden border-t border-white/10" data-villa-scene>
      <div className="mx-auto grid min-h-[46rem] max-w-[96rem] grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 lg:min-h-[54rem] lg:grid-cols-12 lg:gap-14 lg:px-12">
        <div data-scene-copy className={`relative z-10 max-w-xl lg:col-span-5 ${reverse ? 'lg:col-start-8 lg:row-start-1' : ''}`}>
          <span className="qls-eyebrow">{act}</span>
          <h2 className="qls-section-title text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-foreground/78 sm:text-lg">{copy}</p>
          <div className="mt-8">{children}</div>
        </div>

        <div data-scene-panel className={`relative min-h-[22rem] overflow-hidden border border-white/10 bg-zinc-950 sm:min-h-[30rem] lg:col-span-7 lg:min-h-[37rem] ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(185,145,82,0.18),transparent_38%)]" />
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="villa-scene-media object-cover opacity-75"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-transparent to-black/25" />
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/45 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
            Quantum scene control / {act.replace('Scene ', '')}
          </div>
        </div>
      </div>
    </section>
  );
}

function SceneInterface({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Zap }) {
  return (
    <div className="flex items-center gap-3 border-l border-[color:var(--gold)]/70 py-2 pl-3">
      <Icon className="h-4 w-4 text-[color:var(--gold-bright)]" aria-hidden="true" />
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        <p className="mt-0.5 text-sm text-white">{value}</p>
      </div>
    </div>
  );
}

function CinematicScene({
  id,
  act,
  title,
  copy,
  image,
  imageAlt,
  children,
  reverse = false,
  copyClassName = '',
  overlay = 'warm',
}: CinematicSceneProps) {
  const overlayClass = {
    warm: 'bg-[radial-gradient(ellipse_at_70%_48%,rgba(185,145,82,0.28),transparent_42%)]',
    night: 'bg-[radial-gradient(ellipse_at_68%_36%,rgba(61,98,133,0.3),transparent_42%)]',
    cinema: 'bg-[radial-gradient(ellipse_at_50%_58%,rgba(185,145,82,0.18),transparent_48%)]',
    secure: 'bg-[radial-gradient(ellipse_at_70%_40%,rgba(82,168,255,0.2),transparent_44%)]',
    energy: 'bg-[radial-gradient(ellipse_at_68%_50%,rgba(185,145,82,0.22),transparent_44%)]',
  }[overlay];

  return (
    <section id={id} className="relative isolate overflow-hidden border-t border-white/10" data-cinematic-scene>
      <div data-scene-stage className="qls-cinematic-stage relative overflow-hidden px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div data-scene-media className="absolute -inset-[4%] will-change-transform">
          <Image src={image} alt={imageAlt} fill sizes="100vw" className="object-cover" loading="lazy" />
        </div>
        <div className="absolute inset-0 bg-[#080a0d]/55" />
        <div data-scene-glow className={`absolute inset-0 ${overlayClass}`} aria-hidden="true" />
        <div data-scene-reflection className="pointer-events-none absolute -left-[46%] top-0 h-full w-[42%] -skew-x-12 bg-white/10 opacity-0 will-change-transform" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-transparent to-black/30" />
        <div
          className={`qls-cinematic-inner relative z-10 mx-auto grid max-w-[96rem] grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:items-center lg:gap-14 ${
            reverse ? 'lg:[&>*:first-child]:col-start-8 lg:[&>*:last-child]:col-start-1' : ''
          }`}
        >
          <div data-scene-copy className={`max-w-xl will-change-transform lg:col-span-5 ${reverse ? 'lg:row-start-1' : ''} ${copyClassName}`}>
            <span className="qls-eyebrow">{act}</span>
            <h2 className="qls-section-title text-4xl sm:text-6xl lg:text-7xl">{title}</h2>
            <p className="mt-6 text-base leading-8 text-foreground/84 sm:text-lg">{copy}</p>
          </div>
          <div data-scene-panel className={`will-change-transform lg:col-span-7 ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

const SceneMetric = memo(function SceneMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Zap }) {
  return (
    <motion.div
      className="border border-white/10 bg-[#080a0d]/70 p-4"
      whileHover={{ y: -3, borderColor: 'rgba(185,145,82,0.58)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
    >
      <Icon className="h-4 w-4 text-[color:var(--gold-bright)]" aria-hidden="true" />
      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </motion.div>
  );
});

function LivingControlButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Zap;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`flex min-h-14 items-center gap-3 border px-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--blue)] ${
        active
          ? 'border-[color:var(--gold-bright)]/70 bg-[color:var(--gold)]/15 text-white'
          : 'border-white/10 bg-black/25 text-zinc-300 hover:border-white/30 hover:text-white'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[color:var(--gold-bright)]' : 'text-zinc-400'}`} aria-hidden="true" />
      <span className="font-mono text-[9px] uppercase tracking-[0.12em]">{label}</span>
    </motion.button>
  );
}

const LuxuryProductShowcase = memo(function LuxuryProductShowcase({
  products,
  onExplore,
  onBook,
}: {
  products: FeaturedProduct[];
  onExplore: () => void;
  onBook: () => void;
}) {
  const visibleProducts = products.slice(0, 4);

  return (
    <section id="products" className="relative isolate overflow-hidden border-t border-white/10 bg-[#080a0d] px-5 py-24 sm:px-8 lg:px-12 lg:py-32" data-cinematic-scene>
      <div data-scene-stage className="qls-cinematic-stage relative mx-auto grid max-w-[96rem] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div data-scene-glow className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(185,145,82,0.18),transparent_46%)]" aria-hidden="true" />
        <div data-scene-copy className="relative z-10 max-w-2xl will-change-transform lg:col-span-4">
          <span className="qls-eyebrow">Scene 10 / Product collection</span>
          <h2 className="qls-section-title text-4xl sm:text-6xl lg:text-7xl">Objects that disappear into the architecture.</h2>
          <p className="mt-6 text-base leading-8 text-foreground/78 sm:text-lg">
            Controllers, touch panels, sensors and interfaces presented as refined instruments for the residence.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <MagneticButton className="qls-button qls-button-primary" strength={0.15} onClick={onExplore}>
              Explore Collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </MagneticButton>
            <MagneticButton className="qls-button qls-button-secondary" strength={0.15} onClick={onBook}>
              Book Private Visit
            </MagneticButton>
          </div>
        </div>

        <div data-scene-panel className="relative z-10 min-h-[34rem] lg:col-span-8 lg:min-h-[42rem]">
          <div className="absolute inset-x-[8%] bottom-[10%] h-px bg-gradient-to-r from-transparent via-[color:var(--gold-bright)]/70 to-transparent shadow-[0_0_34px_rgba(185,145,82,0.45)]" />
          {visibleProducts.length > 0 ? (
            <div className="relative h-full min-h-[34rem]">
              {visibleProducts.map((product, index) => {
                const positions = [
                  'left-[2%] top-[6%] lg:left-[4%] lg:top-[10%]',
                  'right-[5%] top-[16%] lg:right-[10%] lg:top-[4%]',
                  'left-[12%] bottom-[5%] lg:left-[22%] lg:bottom-[8%]',
                  'right-[0%] bottom-[0%] lg:right-[4%] lg:bottom-[14%]',
                ];
                return (
                  <FloatingElement key={product.id} distance={6 + index * 1.5} duration={5.2 + index * 0.45} className={`absolute w-[72%] max-w-[20rem] sm:w-[42%] ${positions[index]}`}>
                    <Link href={`/products/${product.slug}`} aria-label={`View ${product.title}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--gold-bright)]">
                      <motion.article
                        data-floating-product
                        className="relative overflow-hidden border border-white/12 bg-[#080a0d]/78 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.42)] will-change-transform"
                        whileHover={{ y: -8, rotate: 0, borderColor: 'rgba(185,145,82,0.72)' }}
                        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                        style={{ rotate: index % 2 === 0 ? '-2deg' : '2deg' }}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                          {product.coverImage ? (
                            <Image src={product.coverImage.fileUrl} alt={product.title} fill sizes="(max-width: 768px) 72vw, 24vw" className="object-cover opacity-80 transition duration-700 group-hover:scale-105" loading="lazy" unoptimized={product.coverImage.fileUrl.startsWith('/uploads/')} />
                          ) : (
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,#151b24,#080a0d)]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d]/78 to-transparent" />
                        </div>
                        <div className="pt-4">
                          <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[color:var(--gold-bright)]">{product.category.name}</p>
                          <h3 className="mt-2 text-lg font-light text-white">{product.title}</h3>
                          <p className="mt-2 max-h-10 overflow-hidden text-xs leading-5 text-zinc-400">{product.subtitle || product.brand?.name || 'Automation hardware'}</p>
                        </div>
                      </motion.article>
                    </Link>
                  </FloatingElement>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[28rem] items-center justify-center border-y border-white/10 text-sm text-zinc-400">
              Published products will appear in this floating collection.
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

const CollaborationStory = memo(function CollaborationStory({ leadPartner }: { leadPartner?: Partner }) {
  return (
    <section id="collaboration" className="relative isolate overflow-hidden border-t border-white/10 px-5 py-24 text-center sm:px-8 lg:px-12 lg:py-32" data-cinematic-scene>
      <div data-scene-stage className="qls-cinematic-stage relative mx-auto flex max-w-5xl flex-col items-center justify-center">
        <div data-scene-glow className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(185,145,82,0.18),transparent_54%)]" aria-hidden="true" />
        <div data-scene-copy className="relative z-10 will-change-transform">
          <span className="qls-eyebrow">Scene 11 / Engineering collaboration</span>
          <h2 className="qls-section-title text-4xl sm:text-6xl lg:text-7xl">Intelligence starts in the wiring.</h2>
        </div>
        <div data-scene-panel className="relative z-10 mt-16 w-full max-w-3xl will-change-transform">
          <div className="border border-white/10 bg-[#080a0d]/70 p-6 sm:p-10">
            <p className="text-2xl font-light text-white sm:text-4xl">Quantum Living Solutions</p>
            <div className="mx-auto my-8 flex w-px flex-col items-center" aria-hidden="true">
              <span data-scene-line className="h-20 w-px origin-top bg-[color:var(--gold-bright)] shadow-[0_0_28px_rgba(185,145,82,0.72)]" />
              <span className="mt-[-0.25rem] h-2.5 w-2.5 rounded-full border border-[color:var(--gold-bright)] bg-[#080a0d] shadow-[0_0_24px_rgba(185,145,82,0.72)]" />
            </div>
            <div className="mx-auto flex min-h-24 items-center justify-center">
              {leadPartner?.logo ? (
                <Image src={leadPartner.logo.fileUrl} alt={`${leadPartner.name} logo`} width={240} height={110} className="h-20 w-auto object-contain" unoptimized={leadPartner.logo.fileUrl.startsWith('/uploads/')} />
              ) : (
                <p className="text-2xl font-light text-white sm:text-4xl">RCS Electricals</p>
              )}
            </div>
            <p className="mt-8 text-xl font-light text-white sm:text-3xl">Building Intelligent Homes Together</p>
            {leadPartner && <a href={leadPartner.websiteUrl} target="_blank" rel="noopener noreferrer" className="qls-text-link mt-8 inline-flex">Meet {leadPartner.name}</a>}
          </div>
        </div>
      </div>
    </section>
  );
});

const FounderEditorial = memo(function FounderEditorial() {
  return (
    <section id="founder" className="relative isolate overflow-hidden border-t border-white/10 bg-[#0b0e12] px-5 py-24 sm:px-8 lg:px-12 lg:py-32" data-cinematic-scene>
      <div data-scene-stage className="qls-cinematic-stage relative mx-auto grid max-w-[96rem] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div data-scene-glow className="absolute inset-0 bg-[radial-gradient(ellipse_at_24%_44%,rgba(185,145,82,0.14),transparent_44%)]" aria-hidden="true" />
        <div data-scene-copy className="relative z-10 will-change-transform lg:col-span-5">
          <span className="qls-eyebrow">Scene 12 / Founder story</span>
          <h2 className="qls-section-title text-4xl sm:text-6xl lg:text-7xl">The discipline behind the calm.</h2>
          <blockquote className="mt-10 border-l border-[color:var(--gold-bright)] pl-6 text-2xl font-light leading-relaxed text-white sm:text-3xl">
            &ldquo;{founder.quote}&rdquo;
          </blockquote>
          <Link href="/about" className="qls-text-link mt-9 inline-flex items-center gap-2">
            Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div data-scene-panel className="relative z-10 grid gap-8 will-change-transform md:grid-cols-[0.78fr_1fr] lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-zinc-900">
            <Image
              src={founder.portraitUrl}
              alt={`${founder.name}, ${founder.designation}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 38vw, 28vw"
              className="object-cover"
              loading="lazy"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d]/38 to-transparent" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-bright)]">{founder.designation}</p>
            <h3 className="mt-3 text-3xl font-light text-white sm:text-4xl">{founder.name}</h3>
            <p className="mt-6 text-base leading-8 text-foreground/75">{founder.biography[0]}</p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {founder.experience.map((item) => (
                <motion.div key={item.label} className="border border-white/10 bg-white/[0.03] p-4" whileHover={{ y: -3, borderColor: 'rgba(185,145,82,0.56)' }}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-white">{item.value}</p>
                </motion.div>
              ))}
            </div>
            <ol className="mt-8 border-l border-white/10 pl-7">
              {founder.timeline.map((item) => (
                <li key={item.title} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[2.04rem] top-1.5 h-2.5 w-2.5 rounded-full border border-[color:var(--gold-bright)] bg-[#0b0e12]" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--gold-bright)]">{item.year}</p>
                  <h4 className="mt-2 text-lg text-white">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-foreground/65">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
});

const DemoFinale = memo(function DemoFinale({ onBook, onContact }: { onBook: () => void; onContact: () => void }) {
  const { reducedMotion } = useMotionSystem();

  return (
    <section id="demo" className="qls-cinematic-stage relative isolate flex items-center overflow-hidden border-t border-white/10 px-5 py-24 text-center sm:px-8 lg:px-12" data-cinematic-scene>
      <div data-scene-stage className="qls-cinematic-inner relative mx-auto flex max-w-5xl items-center justify-center">
        <div data-scene-glow className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(185,145,82,0.22),transparent_54%)]" aria-hidden="true" />
        {!reducedMotion && (
          <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, index) => (
              <motion.span
                key={index}
                className="absolute h-1 w-1 rounded-full bg-[color:var(--gold-bright)]/55"
                style={{ left: `${8 + index * 9}%`, top: `${20 + (index % 5) * 13}%` }}
                animate={{ y: [0, -16, 0], opacity: [0.12, 0.7, 0.12] }}
                transition={{ duration: 4.5 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}
        <div data-scene-copy className="relative z-10 border border-white/10 bg-[#080a0d]/78 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.42)] will-change-transform sm:p-12">
          <span className="qls-eyebrow">Scene 13 / Private demonstration</span>
          <h2 className="qls-section-title text-4xl sm:text-6xl lg:text-7xl">Experience Smart Living</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-foreground/75 sm:text-lg">
            Book your private demonstration and walk through lighting, climate, security and entertainment scenes with our engineering team.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-foreground/58">{PRIVATE_SITE_VISIT.adjustmentNote}</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <MagneticButton className="qls-button qls-button-primary" strength={0.18} onClick={onBook}>
              Book Your Private Demonstration <Play className="h-3.5 w-3.5" aria-hidden="true" />
            </MagneticButton>
            <MagneticButton className="qls-button qls-button-secondary" strength={0.18} onClick={onContact}>
              Talk to our team
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
});

export function CinematicHomeJourney() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const { reducedMotion: prefersReducedMotion } = useMotionSystem();
  const hasHydrated = useHasHydrated();
  const reducedMotion = hasHydrated && prefersReducedMotion;
  const router = useRouter();
  const livingMouseX = useSpring(useMotionValue(0), { stiffness: 62, damping: 22, mass: 0.85 });
  const livingMouseY = useSpring(useMotionValue(0), { stiffness: 62, damping: 22, mass: 0.85 });
  const livingBoundsRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activeLivingControl, setActiveLivingControl] = useState('Lighting');

  useEffect(() => {
    const clearBounds = () => {
      livingBoundsRef.current = null;
    };

    window.addEventListener('resize', clearBounds, { passive: true });
    window.addEventListener('orientationchange', clearBounds, { passive: true });

    return () => {
      window.removeEventListener('resize', clearBounds);
      window.removeEventListener('orientationchange', clearBounds);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHomepageData() {
      try {
        const [productResponse, partnerResponse] = await Promise.all([
          fetch('/api/products/featured', { signal: controller.signal }),
          fetch('/api/partners?placement=home', { signal: controller.signal }),
        ]);

        if (productResponse.ok) {
          const data = await productResponse.json() as { products?: FeaturedProduct[] };
          setProducts(data.products?.slice(0, 4) ?? []);
        }
        if (partnerResponse.ok) {
          const data = await partnerResponse.json() as { partners?: Partner[] };
          setPartners(data.partners ?? []);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          // The visual journey remains fully functional when optional catalog data is unavailable.
        }
      }
    }

    let idleCallback: number | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if ('requestIdleCallback' in window) {
      idleCallback = window.requestIdleCallback(() => void loadHomepageData(), { timeout: 1800 });
    } else {
      timeout = setTimeout(() => void loadHomepageData(), 700);
    }

    return () => {
      controller.abort();
      if (idleCallback !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallback);
      }
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const leadPartner = partners.find((partner) => partner.name.toLowerCase().includes('rcs')) ?? partners[0];
  const goToBookDemo = useCallback(() => router.push('/book-demo'), [router]);
  const goToContact = useCallback(() => router.push('/contact'), [router]);
  const goToProducts = useCallback(() => router.push('/products'), [router]);

  return (
    <motion.div
      ref={journeyRef}
      className="overflow-x-clip bg-[#080a0d] text-foreground"
      data-home-journey-root
      initial={reducedMotion ? false : { opacity: 0, scale: 1.01 }}
      animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <section id="arrival" className="relative isolate overflow-hidden border-b border-white/10" data-villa-scene>
        <div data-entry-stage className="qls-cinematic-stage relative flex items-end overflow-hidden px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div data-entry-exterior className="absolute -inset-[5%] will-change-transform">
            <Image src="/images/cinematic/villa-arrival.png" alt="Approaching a luxury smart home entrance" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#080a0d]/78 via-[#080a0d]/18 to-transparent" />
          <div data-entry-interior className={`absolute -inset-[4%] scale-105 ${reducedMotion ? 'opacity-75' : 'lg:opacity-0'} will-change-transform`}>
            <Image src={sceneImages.entry} alt="Warmly lit smart home interior" fill sizes="100vw" className="object-cover" loading="lazy" />
          </div>
          <div data-entry-warm-light className={`absolute inset-0 bg-[radial-gradient(ellipse_at_58%_62%,rgba(232,174,97,0.68),transparent_30%),linear-gradient(90deg,rgba(8,10,13,0.68),transparent_68%)] ${reducedMotion ? 'opacity-70' : 'lg:opacity-0'}`} />
          <div data-entry-ambient className={`absolute inset-0 bg-[radial-gradient(ellipse_at_72%_42%,rgba(185,145,82,0.22),transparent_42%)] ${reducedMotion ? 'opacity-100' : 'lg:opacity-0'}`} />
          <div data-entry-reflection className="pointer-events-none absolute -left-[46%] top-0 h-full w-[45%] -skew-x-12 bg-white/10 opacity-0 will-change-transform" aria-hidden="true" />
          {!reducedMotion && <>
            <div className="absolute inset-y-[14%] left-[30%] hidden w-[19%] border-r border-white/20 bg-zinc-950/88 lg:block will-change-transform" data-entry-door aria-hidden="true" />
            <div className="absolute inset-y-[14%] left-[49%] hidden w-[19%] border-l border-white/20 bg-zinc-950/88 lg:block will-change-transform" data-entry-door aria-hidden="true" />
            <div data-entry-fingerprint className="absolute left-[48.5%] top-[48%] hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/25 bg-[#07110d]/42 lg:block overflow-hidden will-change-transform" aria-hidden="true">
              <Fingerprint className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-emerald-100/60" />
              <span data-entry-scan className="absolute inset-2 rounded-full border border-emerald-200/20 opacity-0 shadow-[0_0_18px_rgba(116,211,152,0.55)]" />
            </div>
          </>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-transparent to-black/20" />
          <div data-entry-copy className={`relative z-10 mx-auto w-full max-w-[96rem] ${reducedMotion ? '' : 'lg:translate-y-6 lg:opacity-0'} will-change-transform`}>
            <div className="max-w-xl">
              <span className="qls-eyebrow">Scene 02 / Intelligent entry</span>
              <h2 className="qls-section-title text-4xl sm:text-6xl">The door opens before the moment is lost.</h2>
              <p className="mt-6 text-base leading-8 text-foreground/85 sm:text-lg">A verified touch unlocks the entrance, warm light reaches the driveway and the residence shifts naturally from arrival to welcome.</p>
              <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-200">
                <span className="inline-flex items-center gap-2"><Fingerprint className="h-4 w-4 text-[color:var(--gold-bright)]" aria-hidden="true" /> Access verified</span>
                <span className="inline-flex items-center gap-2"><DoorOpen className="h-4 w-4 text-[color:var(--gold-bright)]" aria-hidden="true" /> Welcome scene active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VillaScene id="entry" act="Scene 03 / Entry" title="The house recognizes the moment." copy="A secure arrival unlocks the front door, warms the foyer and brings the essential systems into a calm, ready state." image={sceneImages.entry} imageAlt="Warmly lit luxury home entrance">
        <div className="grid max-w-md grid-cols-2 gap-5 border-y border-white/10 py-5">
          <SceneInterface label="Entry" value="Unlocked" icon={DoorOpen} />
          <SceneInterface label="Temperature" value="23 degrees" icon={SunMedium} />
        </div>
      </VillaScene>

      <section id="living" className="relative isolate overflow-hidden border-b border-white/10" data-villa-scene>
        <div
          data-living-stage
          className="qls-cinematic-stage relative overflow-hidden px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
          onPointerEnter={(event) => {
            const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
            livingBoundsRef.current = { left, top, width, height };
          }}
          onPointerMove={(event) => {
            if (reducedMotion || event.pointerType === 'touch') return;
            const bounds = livingBoundsRef.current;
            if (!bounds) return;
            livingMouseX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
            livingMouseY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
          }}
          onPointerLeave={() => {
            livingBoundsRef.current = null;
            livingMouseX.set(0);
            livingMouseY.set(0);
          }}
        >
          <div data-living-image className="absolute -inset-[4%] will-change-transform">
            <Image src={sceneImages.living} alt="Luxury living room prepared by a smart home scene" fill sizes="100vw" className="object-cover" loading="lazy" />
          </div>
          <div data-living-dimmer className="absolute inset-0 bg-[#080a0d]/80" />
          <div data-living-ceiling className={`absolute inset-0 bg-[radial-gradient(ellipse_at_22%_8%,rgba(255,205,135,0.72),transparent_18%),radial-gradient(ellipse_at_54%_5%,rgba(255,205,135,0.58),transparent_20%),radial-gradient(ellipse_at_84%_12%,rgba(255,205,135,0.6),transparent_18%)] opacity-60 ${reducedMotion ? '' : 'lg:opacity-0'}`} />
          <div data-living-daylight className={`absolute inset-0 bg-[linear-gradient(110deg,rgba(255,237,196,0.25),transparent_45%,rgba(255,237,196,0.1))] opacity-55 ${reducedMotion ? '' : 'lg:opacity-0'}`} />
          <div data-living-golden className={`absolute inset-0 bg-[radial-gradient(ellipse_at_68%_48%,rgba(185,145,82,0.42),transparent_42%)] opacity-35 ${reducedMotion ? '' : 'lg:opacity-0'}`} />
          <div data-living-rays className={`pointer-events-none absolute -left-[16%] top-0 h-[125%] w-[70%] -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,239,204,0.2),transparent)] opacity-30 ${reducedMotion ? '' : 'lg:opacity-0'}`} aria-hidden="true" />
          <div data-living-reflection className="pointer-events-none absolute -left-[48%] top-0 h-full w-[42%] -skew-x-12 bg-white/10 opacity-0 will-change-transform" aria-hidden="true" />
          {!reducedMotion && <>
            <div data-living-curtain className="absolute inset-y-0 left-0 hidden w-[29%] border-r border-white/10 bg-[#10151c]/90 lg:block will-change-transform" aria-hidden="true" />
            <div data-living-curtain className="absolute inset-y-0 right-0 hidden w-[29%] border-l border-white/10 bg-[#10151c]/90 lg:block will-change-transform" aria-hidden="true" />
          </>}
          <div className="absolute inset-x-[12%] top-[17%] hidden justify-between lg:flex" aria-hidden="true">
            {[0, 1, 2].map((index) => <span key={index} data-living-lamp className="h-14 w-2 bg-[color:var(--gold-bright)] opacity-70 shadow-[0_0_34px_rgba(255,205,135,0.85)] lg:opacity-0" />)}
          </div>
          <div className="absolute inset-x-[16%] bottom-[16%] hidden justify-between lg:flex" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => <span key={index} data-living-led className="h-px w-[17%] bg-[color:var(--gold-bright)] opacity-80 shadow-[0_0_18px_rgba(185,145,82,0.9)] lg:opacity-0" />)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-transparent to-black/20" />

          <div data-living-copy className={`qls-cinematic-inner relative z-10 mx-auto flex max-w-[96rem] items-end ${reducedMotion ? '' : 'lg:translate-y-6 lg:opacity-0'} will-change-transform`}>
            <div className="max-w-xl pb-2">
              <span className="qls-eyebrow">Scene 04 / Intelligent living</span>
              <h2 className="qls-section-title text-4xl sm:text-6xl">The room welcomes you back.</h2>
              <p className="mt-6 text-base leading-8 text-foreground/85 sm:text-lg">The room settles into a calm, luminous scene: daylight enters, temperature adjusts and every control remains quietly within reach.</p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-200">
                <span>Warm lighting</span><span>Daylight scene</span><span>Comfort mode</span>
              </div>
            </div>
          </div>

          <motion.div
            data-living-interface
            style={reducedMotion ? undefined : { x: livingMouseX, y: livingMouseY }}
            className={`absolute bottom-6 left-5 right-5 z-20 border border-white/15 bg-[#080a0d]/85 p-4 sm:left-auto sm:right-8 sm:w-[27rem] lg:bottom-10 lg:right-[8%] lg:w-[30rem] ${reducedMotion ? '' : 'lg:opacity-0'} will-change-transform`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[color:var(--gold-bright)]">Living room / active</p>
                <p className="mt-1 text-sm text-white">Arrival comfort scene</p>
              </div>
              <div className="relative min-w-28 text-right font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-400">
                <span data-temperature-24>24 degrees</span>
                <span data-temperature-22 className="absolute right-4 opacity-0">22 degrees</span>
                <span data-comfort-mode className="absolute right-4 top-12 text-[color:var(--gold-bright)] opacity-0">Comfort enabled</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {livingControls.map(({ label, icon }) => <LivingControlButton key={label} label={label} icon={icon} active={activeLivingControl === label} onClick={() => setActiveLivingControl(label)} />)}
            </div>
          </motion.div>
        </div>
      </section>

      <CinematicScene id="kitchen" act="Scene 05 / Smart kitchen" title="The morning routine begins before you ask." copy="The camera enters a warm kitchen as under-cabinet LEDs rise, the coffee machine wakes and the touch panel brings every daily scene within reach." image={sceneImages.kitchen} imageAlt="Luxury smart kitchen with warm task lighting" overlay="warm">
        <div className="relative min-h-[32rem] overflow-hidden border border-white/10 bg-[#080a0d]/72 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-x-[8%] top-[28%] h-px bg-[color:var(--gold-bright)]/80 shadow-[0_0_30px_rgba(185,145,82,0.9)]" aria-hidden="true" />
          <div data-scene-line className="absolute left-[18%] top-[34%] h-28 w-px origin-top bg-[color:var(--gold-bright)]/80 shadow-[0_0_22px_rgba(185,145,82,0.8)]" aria-hidden="true" />
          <div className="absolute left-[10%] top-[52%] h-16 w-16 rounded-full border border-[color:var(--gold-bright)]/55 bg-[#080a0d]/80" aria-hidden="true">
            <Coffee className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-[color:var(--gold-bright)]" />
          </div>
          {!reducedMotion && <motion.span className="absolute left-[17%] top-[42%] h-20 w-7 rounded-full bg-white/16" animate={{ y: [18, -22, 18], opacity: [0, 0.42, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true" />}
          <div className="ml-auto grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
            {kitchenRoutines.map((item) => <SceneMetric key={item.label} {...item} />)}
          </div>
          <div className="absolute bottom-5 right-5 w-72 border border-white/10 bg-black/35 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[color:var(--gold-bright)]">Touch panel</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['Coffee', 'Island', 'Dining', 'Away'].map((label) => <span key={label} className="border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white">{label}</span>)}
            </div>
          </div>
        </div>
      </CinematicScene>

      <CinematicScene id="bedroom" act="Scene 06 / Bedroom" title="Night mode arrives quietly." copy="Curtains close, climate drops into a comfortable range and warm ambient light turns the suite into a private retreat." image={sceneImages.bedroom} imageAlt="Luxury bedroom prepared for night mode" reverse overlay="night">
        <div className="relative min-h-[32rem] overflow-hidden border border-white/10 bg-[#080a0d]/72 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-y-0 left-0 w-[30%] bg-[#121821]/92" aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 w-[30%] bg-[#121821]/92" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(185,145,82,0.2),transparent_48%)]" />
          <div className="relative ml-auto grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            {bedroomControls.map((item) => <SceneMetric key={item.label} {...item} />)}
          </div>
          <div className="absolute bottom-8 left-8 right-8 border-t border-white/10 pt-5">
            <div className="flex items-end gap-4">
              <p className="text-5xl font-light text-white">22</p>
              <div className="pb-2">
                <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[color:var(--gold-bright)]">degrees</p>
                <p className="text-sm text-zinc-300">Sleep climate active</p>
              </div>
            </div>
          </div>
        </div>
      </CinematicScene>

      <CinematicScene id="theater" act="Scene 07 / Home theater" title="The room becomes cinema." copy="The projector descends, the screen lowers and sound arrives as a composed field around the room." image={sceneImages.theater} imageAlt="Private home theater with cinema lighting" overlay="cinema">
        <div className="relative min-h-[32rem] overflow-hidden border border-white/10 bg-[#030507]/88 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
          <div data-scene-line className="mx-auto h-20 w-px origin-top bg-[color:var(--gold-bright)] shadow-[0_0_24px_rgba(185,145,82,0.75)]" aria-hidden="true" />
          <div className="mx-auto flex h-14 w-28 items-center justify-center border border-white/10 bg-black/60"><Projector className="h-6 w-6 text-[color:var(--gold-bright)]" aria-hidden="true" /></div>
          <div className="mx-auto mt-8 aspect-[16/7] max-w-2xl border border-white/10 bg-black shadow-[0_0_70px_rgba(185,145,82,0.16)_inset]" />
          <div className="mx-auto mt-8 flex h-24 max-w-lg items-end gap-1.5" aria-label="Dolby speaker visualization">
            {[28, 46, 72, 58, 90, 64, 38, 74, 52, 84, 44, 62].map((height, index) => (
              <span key={index} className="flex w-full items-end overflow-hidden" style={{ height: `${height}px` }}>
                <motion.span
                  className="block h-full w-full origin-bottom bg-[color:var(--gold-bright)]/75"
                  animate={reducedMotion ? undefined : { scaleY: [0.45, 1, 0.58] }}
                  transition={{ duration: 1.4 + index * 0.04, repeat: Infinity, repeatType: 'mirror' }}
                  style={{ scaleY: 0.45 }}
                />
              </span>
            ))}
            <Volume2 className="ml-3 h-5 w-5 shrink-0 text-[color:var(--gold-bright)]" aria-hidden="true" />
          </div>
        </div>
      </CinematicScene>

      <CinematicScene id="security" act="Scene 08 / Security center" title="Protection stays quiet until it matters." copy="Fingerprint access, rotating camera coverage and lock status live inside one clear security dashboard." image={sceneImages.security} imageAlt="Smart home security and surveillance system" reverse overlay="secure">
        <div className="relative min-h-[32rem] overflow-hidden border border-white/10 bg-[#080a0d]/78 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.8fr_1fr]">
            <div className="flex min-h-64 items-center justify-center border border-white/10 bg-black/32">
              <motion.div className="relative h-36 w-36 rounded-full border border-[color:var(--gold-bright)]/60" animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
                <Fingerprint className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-[color:var(--gold-bright)]" aria-hidden="true" />
                <span className="absolute inset-x-8 top-7 h-px bg-[color:var(--gold-bright)] shadow-[0_0_18px_rgba(185,145,82,0.85)]" />
              </motion.div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {securitySignals.map((item) => <SceneMetric key={item.label} {...item} />)}
              <div className="border border-white/10 bg-black/30 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[color:var(--gold-bright)]">AI security dashboard</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-zinc-300">
                  <span className="border border-white/10 py-3">North gate</span>
                  <span className="border border-white/10 py-3">Driveway</span>
                  <span className="border border-white/10 py-3">Lobby</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CinematicScene>

      <CinematicScene id="energy" act="Scene 09 / Energy intelligence" title="Every watt has a visible path." copy="Solar production, battery charge, grid draw and household load resolve into a calm energy command view." image={sceneImages.energy} imageAlt="Energy management dashboard in a premium workspace" overlay="energy">
        <div className="relative min-h-[32rem] overflow-hidden border border-white/10 bg-[#080a0d]/78 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {energyMetrics.map((metric) => (
              <div key={metric.label} className="border border-white/10 bg-black/28 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{metric.label}</p>
                <p className="mt-3 text-2xl font-light text-white">{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex h-56 items-end gap-3 border-b border-white/10 px-2" aria-label="Animated energy usage chart">
            {[36, 58, 44, 76, 62, 92, 68, 82, 48, 64, 72, 54].map((height, index) => (
              <span key={index} className="flex w-full items-end overflow-hidden" style={{ height: `${height}%` }}>
                <motion.span
                  className="block h-full w-full origin-bottom bg-gradient-to-t from-[color:var(--gold)] to-[color:var(--gold-bright)]"
                  animate={reducedMotion ? undefined : { scaleY: [0.65, 1, 0.78] }}
                  transition={{ duration: 2.2 + index * 0.05, repeat: Infinity, repeatType: 'mirror' }}
                  style={{ scaleY: 0.65 }}
                />
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-zinc-300"><ChartNoAxesColumnIncreasing className="h-5 w-5 text-[color:var(--gold-bright)]" aria-hidden="true" /> Load shifting active / battery priority enabled</div>
        </div>
      </CinematicScene>

      <LuxuryProductShowcase products={products} onExplore={goToProducts} onBook={goToBookDemo} />

      <CollaborationStory leadPartner={leadPartner} />

      <FounderEditorial />

      <DemoFinale onBook={goToBookDemo} onContact={goToContact} />

      <section className="border-t border-white/10 bg-[#080a0d] px-5 py-16 sm:px-8 lg:px-12" data-cinematic-scene>
        <SectionReveal className="mx-auto flex max-w-[96rem] flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <span className="qls-eyebrow">Follow the studio</span>
            <h2 className="mt-3 text-2xl font-light tracking-tight text-white sm:text-3xl">
              See the next intelligent space take shape.
            </h2>
            <p className="mt-4 text-sm leading-7 text-foreground/65 sm:text-base">
              Follow Quantum Living Solutions for project updates, automation ideas, and behind-the-scenes installation details.
            </p>
          </div>
          <SocialLinks size="md" showLabels className="shrink-0" />
        </SectionReveal>
      </section>
    </motion.div>
  );
}
