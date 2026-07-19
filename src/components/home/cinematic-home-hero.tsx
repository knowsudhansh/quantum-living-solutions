'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  DoorOpen,
  Play,
  ShieldCheck,
  SunMedium,
  Thermometer,
  Volume2,
  Zap,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CursorGlow } from '@/components/animation/CursorGlow';
import { FloatingElement } from '@/components/animation/FloatingElement';
import { MagneticButton } from '@/components/animation/MagneticButton';
import { Parallax } from '@/components/animation/Parallax';
import { ScrollProgress } from '@/components/animation/ScrollProgress';
import { useMotionSystem } from '@/components/animation/MotionProvider';
import { PRIVATE_SITE_VISIT } from '@/lib/config/business';
import { useRouter } from 'next/navigation';

const LuxuryVillaExperienceLazy = lazy(() => import('./luxury-villa-hero-dynamic'));

const subscribeHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function useHasHydrated() {
  return useSyncExternalStore(subscribeHydration, getHydratedSnapshot, getServerHydrationSnapshot);
}

function useDesktopWebGLReady(reducedMotion: boolean) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (reducedMotion) {
      const frame = window.requestAnimationFrame(() => setReady(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const media = window.matchMedia('(min-width: 1200px)');
    let timeout: number | undefined;
    const update = () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      if (!media.matches) {
        setReady(false);
        return;
      }
      timeout = window.setTimeout(() => setReady(true), 2200);
    };
    const frame = window.requestAnimationFrame(update);
    media.addEventListener('change', update);

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout !== undefined) window.clearTimeout(timeout);
      media.removeEventListener('change', update);
    };
  }, [reducedMotion]);

  return ready;
}

function HeroLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { reducedMotion: prefersReducedMotion } = useMotionSystem();
  const hasHydrated = useHasHydrated();
  const reducedMotion = hasHydrated && prefersReducedMotion;

  return (
    <span className="block overflow-hidden pb-[0.09em] pt-[0.02em]">
      <span
        className={reducedMotion ? 'block leading-[1.04]' : 'hero-line-reveal block leading-[1.04]'}
        style={reducedMotion ? undefined : { animationDelay: `${delay}s` }}
      >
        {children}
      </span>
    </span>
  );
}

function PremiumHomeLoader({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080a0d]"
      role="status"
      aria-live="polite"
      initial={{ opacity: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
      transition={{ duration: reducedMotion ? 0.18 : 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full max-w-xs px-6 text-center">
        <motion.div
          className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden border border-white/10 bg-white/[0.03]"
          animate={reducedMotion ? undefined : { opacity: [0.72, 1, 0.72] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/brand/qls-logo.jpg" alt="" width={48} height={48} className="h-12 w-12 object-cover" loading="eager" />
        </motion.div>
        <p className="mt-6 text-lg font-light tracking-wide text-white">Quantum Living Solutions</p>
        <div className="mt-5 h-px overflow-hidden bg-white/10" aria-hidden="true">
          <motion.span
            className="block h-full bg-[color:var(--gold-bright)]"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: reducedMotion ? 0.12 : 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="sr-only">Loading the interactive villa experience.</span>
      </div>
    </motion.div>
  );
}

const smartHomeControls = [
  { label: 'Lighting', icon: SunMedium },
  { label: 'Curtains', icon: DoorOpen },
  { label: 'Climate', icon: Thermometer },
  { label: 'Security', icon: ShieldCheck },
  { label: 'Entertainment', icon: Volume2 },
  { label: 'Energy', icon: Zap },
];

function HolographicControlOverlay() {
  const { reducedMotion: prefersReducedMotion } = useMotionSystem();
  const hasHydrated = useHasHydrated();
  const reducedMotion = hasHydrated && prefersReducedMotion;

  return (
    <div className="hidden justify-self-end lg:col-span-3 lg:block">
      <div className="relative overflow-hidden border border-white/15 bg-[#080a0d]/72 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/10" aria-hidden="true" />
        <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[color:var(--gold-bright)]">Interactive home control</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {smartHomeControls.map(({ label, icon: Icon }) => (
            <motion.button
              key={label}
              type="button"
              className="group flex min-h-14 items-center gap-2 border border-white/10 bg-white/[0.035] px-3 text-left text-zinc-300 transition-colors hover:border-[color:var(--gold-bright)]/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gold-bright)]"
              whileHover={reducedMotion ? undefined : { y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              aria-label={`${label} smart home control preview`}
            >
              <Icon className="h-4 w-4 shrink-0 text-[color:var(--gold-bright)] transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-[0.12em]">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CinematicHomeHero() {
  const { reducedMotion: prefersReducedMotion } = useMotionSystem();
  const hasHydrated = useHasHydrated();
  const reducedMotion = hasHydrated && prefersReducedMotion;
  const router = useRouter();
  const heroMouseX = useSpring(useMotionValue(0), { stiffness: 70, damping: 24, mass: 0.8 });
  const heroMouseY = useSpring(useMotionValue(0), { stiffness: 70, damping: 24, mass: 0.8 });
  const heroBoundsRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const enableWebGL = useDesktopWebGLReady(reducedMotion);
  const [showLoader, setShowLoader] = useState(true);
  const goToBookDemo = useCallback(() => router.push('/book-demo'), [router]);
  const goToExperience = useCallback(() => router.push('/experience'), [router]);

  useEffect(() => {
    let timeout: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      timeout = window.setTimeout(() => setShowLoader(false), reducedMotion ? 80 : 420);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const clearBounds = () => {
      heroBoundsRef.current = null;
    };

    window.addEventListener('resize', clearBounds, { passive: true });
    window.addEventListener('orientationchange', clearBounds, { passive: true });

    return () => {
      window.removeEventListener('resize', clearBounds);
      window.removeEventListener('orientationchange', clearBounds);
    };
  }, []);

  return (
    <motion.div
      className="overflow-x-clip bg-[#080a0d] text-foreground"
      data-home-hero-root
      initial={reducedMotion ? false : { opacity: 0, scale: 1.01 }}
      animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence>{showLoader && <PremiumHomeLoader reducedMotion={reducedMotion} />}</AnimatePresence>
      <ScrollProgress />
      <CursorGlow size={280} className="z-20 opacity-20" />

      <section id="home-hero" className={`relative isolate overflow-hidden border-b border-white/10 ${reducedMotion ? 'qls-cinematic-stage' : 'qls-cinematic-scroll'}`}>
        <div className={`qls-cinematic-stage relative flex items-end overflow-hidden ${reducedMotion ? '' : 'qls-cinematic-stage-sticky'}`} onPointerEnter={(event) => {
          const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
          heroBoundsRef.current = { left, top, width, height };
        }} onPointerMove={(event) => {
          if (reducedMotion || event.pointerType === 'touch') return;
          const bounds = heroBoundsRef.current;
          if (!bounds) return;
          heroMouseX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 14);
          heroMouseY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 10);
        }} onPointerLeave={() => {
          heroBoundsRef.current = null;
          heroMouseX.set(0);
          heroMouseY.set(0);
        }}>
          <motion.div data-hero-image className="absolute -inset-[4%]" style={reducedMotion ? undefined : { x: heroMouseX, y: heroMouseY }}>
            <Image
              src="/images/cinematic/villa-arrival.png"
              alt="Quantum Living Solutions luxury smart villa at dusk"
              fill
              priority
              fetchPriority="high"
              loading="eager"
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
          {enableWebGL && (
            <Suspense fallback={null}>
              <LuxuryVillaExperienceLazy />
            </Suspense>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,9,0.9)_0%,rgba(4,6,9,0.48)_45%,rgba(4,6,9,0.14)_100%)]" />
          <motion.div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_40%,rgba(185,145,82,0.27),transparent_28%),radial-gradient(ellipse_at_20%_20%,rgba(61,98,133,0.22),transparent_36%)]" animate={reducedMotion ? undefined : { opacity: [0.54, 0.85, 0.54], scale: [1, 1.06, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
          <div data-hero-overlay className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-transparent to-black/25" />
          <div className="absolute inset-x-0 bottom-[9%] hidden h-44 lg:block" aria-hidden="true">
            <div data-hero-gate-panel className="absolute left-0 top-0 h-full w-[26%] border-r border-white/15 bg-zinc-950/75" />
            <div data-hero-gate-panel className="absolute left-[25%] top-0 h-full w-[26%] border-l border-white/15 bg-zinc-950/75" />
          </div>
          <div className="absolute bottom-[19%] right-[9%] hidden items-end gap-4 lg:flex" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, index) => <span key={index} data-hero-light className="h-10 w-1 bg-[color:var(--gold-bright)] opacity-20 shadow-[0_0_24px_rgba(185,145,82,0.85)]" />)}
          </div>
          {!reducedMotion && <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => <motion.span key={index} className="absolute h-1 w-1 rounded-full bg-[color:var(--gold-bright)]/60" style={{ left: `${18 + index * 11}%`, top: `${20 + (index % 4) * 16}%` }} animate={{ y: [0, -18 - index * 2, 0], opacity: [0, 0.7, 0] }} transition={{ duration: 4.8 + index * 0.35, repeat: Infinity, delay: index * 0.45, ease: 'easeInOut' }} />)}
          </div>}
          <Parallax speed={0.08} className="pointer-events-none absolute right-[8%] top-[18%] hidden h-56 w-56 rounded-full border border-[color:var(--gold)]/30 lg:block"><span aria-hidden="true" /></Parallax>
          <div data-hero-content className="relative z-10 mx-auto grid w-full max-w-[96rem] grid-cols-1 gap-12 px-5 pb-14 pt-[calc(var(--qls-header-height)+3.5rem)] sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12 lg:pb-20">
            <div className="max-w-5xl lg:col-span-9">
              <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">Private residence / Gorakhpur</p>
              <h1 className="max-w-5xl text-5xl font-light leading-[1.02] text-white sm:text-7xl lg:text-[6.55rem]" aria-label="Quantum Living Solutions">
                <HeroLine>Quantum Living</HeroLine>
                <HeroLine delay={0.12}>Solutions</HeroLine>
              </h1>
              <h2 className="mt-6 max-w-3xl text-2xl font-light leading-tight text-zinc-100 sm:text-4xl lg:text-5xl">
                <HeroLine delay={0.28}>Architecting Intelligent Luxury Living</HeroLine>
              </h2>
              <p className="mt-8 max-w-xl text-base leading-8 text-zinc-100 sm:text-lg">A private residence where light, climate, privacy, security and entertainment respond as one considered system.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <MagneticButton className="qls-button qls-button-primary" strength={0.18} onClick={goToBookDemo}>{PRIVATE_SITE_VISIT.label} - {PRIVATE_SITE_VISIT.priceLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></MagneticButton>
                <MagneticButton className="qls-button border border-white/35 bg-white/10 text-white hover:border-white/70" strength={0.18} onClick={goToExperience}>Explore Experience <Play className="h-3.5 w-3.5" aria-hidden="true" /></MagneticButton>
              </div>
            </div>
            <FloatingElement distance={5} duration={5.5} className="hidden justify-self-end border border-white/15 bg-[#080a0d]/70 p-4 lg:block lg:col-span-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[color:var(--gold-bright)]">Residence status</p>
              <div className="mt-3 flex items-end gap-3"><span className="h-2 w-2 rounded-full bg-[color:var(--gold-bright)] shadow-[0_0_14px_rgba(185,145,82,0.85)]" /><span className="text-sm text-white">Arrival scene ready</span></div>
            </FloatingElement>
            <HolographicControlOverlay />
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-200 lg:col-span-12">
              <span className="h-px w-12 bg-[color:var(--gold-bright)]" />
              Scroll to enter <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
