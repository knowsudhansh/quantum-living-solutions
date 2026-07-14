'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BatteryCharging,
  Coffee,
  DoorOpen,
  Fingerprint,
  Moon,
  Play,
  ShieldCheck,
  SunMedium,
  Volume2,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  FloatingElement,
  CursorGlow,
  MagneticButton,
  Parallax,
  ScrollProgress,
  SectionReveal,
  useMotionSystem,
} from '@/components/animation';
import { useGSAP } from '@/hooks/useGSAP';
import { founder } from '@/lib/config/founder';
import { PRIVATE_SITE_VISIT } from '@/lib/config/business';
import { registerGSAP } from '@/lib/gsap';
import type gsap from 'gsap';
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

function VillaScene({ id, act, title, copy, image, imageAlt, children, reverse = false }: VillaSceneProps) {
  return (
    <section id={id} className="villa-scene relative isolate overflow-hidden border-t border-white/10" data-villa-scene>
      <div className="mx-auto grid min-h-[46rem] max-w-[96rem] grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 lg:min-h-[54rem] lg:grid-cols-12 lg:gap-14 lg:px-12">
        <div className={`relative z-10 max-w-xl lg:col-span-5 ${reverse ? 'lg:col-start-8 lg:row-start-1' : ''}`}>
          <span className="qls-eyebrow">{act}</span>
          <h2 className="qls-section-title text-4xl sm:text-5xl lg:text-6xl">{title}</h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-foreground/78 sm:text-lg">{copy}</p>
          <div className="mt-8">{children}</div>
        </div>

        <div className={`relative min-h-[22rem] overflow-hidden border border-white/10 bg-zinc-950 sm:min-h-[30rem] lg:col-span-7 lg:min-h-[37rem] ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
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
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/20 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 backdrop-blur-sm">
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

function ProductFloat({ product, index }: { product: FeaturedProduct; index: number }) {
  const rotation = index % 2 === 0 ? -3 : 3;

  return (
    <FloatingElement distance={index === 1 ? 7 : 10} duration={5 + index} className="h-full">
      <Link
        href={`/products/${product.slug}`}
        className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--blue)]"
        aria-label={`View ${product.title}`}
      >
        <motion.article
          className="relative flex h-full min-h-[20rem] flex-col justify-end overflow-hidden border border-white/10 bg-zinc-900/60 p-5"
          initial={{ rotate: rotation }}
          whileHover={{ rotate: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        >
          {product.coverImage ? (
            <Image
              src={product.coverImage.fileUrl}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 88vw, (max-width: 1280px) 42vw, 25vw"
              className="object-cover opacity-65 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
              loading="lazy"
              unoptimized={product.coverImage.fileUrl.startsWith('/uploads/')}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#161b20,#080a0d)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-[#080a0d]/35 to-transparent" />
          <div className="relative">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--gold-bright)]">{product.category.name}</p>
            <h3 className="mt-2 text-xl font-light text-white">{product.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{product.subtitle || product.brand?.name || 'Automation hardware'}</p>
            <span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition group-hover:text-[color:var(--gold-bright)]">
              View specification <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </motion.article>
      </Link>
    </FloatingElement>
  );
}

function HeroLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { reducedMotion } = useMotionSystem();

  return (
    <span className="block overflow-hidden">
      <span
        className={reducedMotion ? 'block' : 'hero-line-reveal block'}
        style={reducedMotion ? undefined : { animationDelay: `${delay}s` }}
      >
        {children}
      </span>
    </span>
  );
}

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

export function CinematicHomeJourney() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionSystem();
  const router = useRouter();
  const heroMouseX = useSpring(useMotionValue(0), { stiffness: 70, damping: 24, mass: 0.8 });
  const heroMouseY = useSpring(useMotionValue(0), { stiffness: 70, damping: 24, mass: 0.8 });
  const livingMouseX = useSpring(useMotionValue(0), { stiffness: 62, damping: 22, mass: 0.85 });
  const livingMouseY = useSpring(useMotionValue(0), { stiffness: 62, damping: 22, mass: 0.85 });
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activeLivingControl, setActiveLivingControl] = useState('Lighting');

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

    void loadHomepageData();
    return () => controller.abort();
  }, []);

  useGSAP(
    () => {
      const root = journeyRef.current;
      if (!root || reducedMotion) return;

      const { gsap } = registerGSAP();
      const media = root.querySelectorAll<HTMLElement>('.villa-scene-media');
      const timelines: gsap.core.Animation[] = [];

      media.forEach((element) => {
        timelines.push(gsap.to(element, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: element.closest('[data-villa-scene]'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        }));
      });

      return () => timelines.forEach((timeline) => timeline.kill());
    },
    { scope: journeyRef, dependencies: [reducedMotion] },
  );

  useEffect(() => {
    const root = journeyRef.current;
    if (!root || reducedMotion) return undefined;

    const { gsap, ScrollTrigger } = registerGSAP();
    const context = gsap.context(() => {
      const heroLights = root.querySelectorAll<HTMLElement>('[data-hero-light]');
      const heroGatePanels = root.querySelectorAll<HTMLElement>('[data-hero-gate-panel]');
      const heroImage = root.querySelector<HTMLElement>('[data-hero-image]');
      const heroContent = root.querySelector<HTMLElement>('[data-hero-content]');
      const heroOverlay = root.querySelector<HTMLElement>('[data-hero-overlay]');

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#home-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.85,
        },
      });

      timeline
        .to(heroGatePanels[0], { xPercent: -82, ease: 'none' }, 0)
        .to(heroGatePanels[1], { xPercent: 82, ease: 'none' }, 0)
        .to(heroLights, { autoAlpha: 1, stagger: 0.08, ease: 'none' }, 0.12)
        .to(heroImage, { scale: 1.12, yPercent: -4, ease: 'none' }, 0)
        .to(heroContent, { yPercent: -18, autoAlpha: 0, ease: 'none' }, 0.46)
        .to(heroOverlay, { autoAlpha: 0.72, ease: 'none' }, 0.38);
    }, root);
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const hero = document.getElementById('home-hero');
    if (!hero || reducedMotion) return undefined;

    const heroImage = hero.querySelector<HTMLElement>('[data-hero-image]');
    const heroContent = hero.querySelector<HTMLElement>('[data-hero-content]');
    const heroOverlay = hero.querySelector<HTMLElement>('[data-hero-overlay]');
    const heroLights = hero.querySelectorAll<HTMLElement>('[data-hero-light]');
    const heroGatePanels = hero.querySelectorAll<HTMLElement>('[data-hero-gate-panel]');
    let frame: number | null = null;

    const updateHero = () => {
      frame = null;
      const travel = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max((window.scrollY - hero.offsetTop) / travel, 0), 1);

      if (heroImage) heroImage.style.transform = `scale(${1 + progress * 0.12}) translate3d(0, ${progress * -4}%, 0)`;
      if (heroContent) {
        heroContent.style.opacity = String(1 - Math.max((progress - 0.46) / 0.54, 0));
        heroContent.style.transform = `translate3d(0, ${progress * -18}%, 0)`;
      }
      if (heroOverlay) heroOverlay.style.opacity = String(1 - progress * 0.28);
      heroGatePanels.forEach((panel, index) => {
        const direction = index === 0 ? -1 : 1;
        panel.style.transform = `translate3d(${direction * progress * 82}%, 0, 0)`;
      });
      heroLights.forEach((light, index) => {
        light.style.opacity = String(Math.min(1, Math.max(0.2, progress * 1.8 - index * 0.09)));
      });
    };

    const requestUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateHero);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const entrance = document.getElementById('arrival');
    if (!entrance || reducedMotion) return undefined;

    const { gsap } = registerGSAP();
    const media = gsap.matchMedia();

    media.add('(min-width: 1024px)', () => {
      const stage = entrance.querySelector<HTMLElement>('[data-entry-stage]');
      const exterior = entrance.querySelector<HTMLElement>('[data-entry-exterior]');
      const interior = entrance.querySelector<HTMLElement>('[data-entry-interior]');
      const doors = entrance.querySelectorAll<HTMLElement>('[data-entry-door]');
      const fingerprint = entrance.querySelector<HTMLElement>('[data-entry-fingerprint]');
      const scan = entrance.querySelector<HTMLElement>('[data-entry-scan]');
      const warmLight = entrance.querySelector<HTMLElement>('[data-entry-warm-light]');
      const reflection = entrance.querySelector<HTMLElement>('[data-entry-reflection]');
      const ambient = entrance.querySelector<HTMLElement>('[data-entry-ambient]');
      const copy = entrance.querySelector<HTMLElement>('[data-entry-copy]');

      if (!stage || !exterior || !interior || doors.length < 2) return undefined;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: entrance,
          start: 'top top',
          end: '+=180%',
          scrub: 0.9,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .set([interior, warmLight, ambient, copy], { autoAlpha: 0 })
        .set(fingerprint, { autoAlpha: 0.28, scale: 0.82 })
        .to(exterior, { scale: 1.2, yPercent: -5, ease: 'none' }, 0)
        .to(fingerprint, { autoAlpha: 1, scale: 1, ease: 'none' }, 0.1)
        .to(scan, { yPercent: 840, autoAlpha: 1, ease: 'none' }, 0.17)
        .to(fingerprint, { autoAlpha: 0, scale: 1.18, ease: 'none' }, 0.33)
        .to(doors[0], { xPercent: -108, ease: 'none' }, 0.38)
        .to(doors[1], { xPercent: 108, ease: 'none' }, 0.38)
        .to(warmLight, { autoAlpha: 0.92, ease: 'none' }, 0.43)
        .to(exterior, { autoAlpha: 0.08, ease: 'none' }, 0.53)
        .to(interior, { autoAlpha: 1, scale: 1, ease: 'none' }, 0.53)
        .to(reflection, { xPercent: 145, autoAlpha: 0.56, ease: 'none' }, 0.63)
        .to(ambient, { autoAlpha: 1, ease: 'none' }, 0.67)
        .to(copy, { autoAlpha: 1, yPercent: -8, ease: 'none' }, 0.73);

      return () => timeline.kill();
    });

    return () => media.revert();
  }, [reducedMotion]);

  useEffect(() => {
    const living = document.getElementById('living');
    if (!living || reducedMotion) return undefined;

    const { gsap } = registerGSAP();
    const media = gsap.matchMedia();

    media.add('(min-width: 1024px)', () => {
      const stage = living.querySelector<HTMLElement>('[data-living-stage]');
      const image = living.querySelector<HTMLElement>('[data-living-image]');
      const dimmer = living.querySelector<HTMLElement>('[data-living-dimmer]');
      const ceiling = living.querySelector<HTMLElement>('[data-living-ceiling]');
      const lamps = living.querySelectorAll<HTMLElement>('[data-living-lamp]');
      const curtains = living.querySelectorAll<HTMLElement>('[data-living-curtain]');
      const daylight = living.querySelector<HTMLElement>('[data-living-daylight]');
      const ledStrips = living.querySelectorAll<HTMLElement>('[data-living-led]');
      const golden = living.querySelector<HTMLElement>('[data-living-golden]');
      const rays = living.querySelector<HTMLElement>('[data-living-rays]');
      const reflection = living.querySelector<HTMLElement>('[data-living-reflection]');
      const interfacePanel = living.querySelector<HTMLElement>('[data-living-interface]');
      const copy = living.querySelector<HTMLElement>('[data-living-copy]');
      const temperature24 = living.querySelector<HTMLElement>('[data-temperature-24]');
      const temperature22 = living.querySelector<HTMLElement>('[data-temperature-22]');
      const comfort = living.querySelector<HTMLElement>('[data-comfort-mode]');

      if (!stage || !image || !dimmer || !interfacePanel || !copy) return undefined;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: living,
          start: 'top top',
          end: '+=220%',
          scrub: 0.9,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .set([ceiling, lamps, daylight, ledStrips, golden, rays, interfacePanel, copy, temperature22, comfort], { autoAlpha: 0 })
        .set(temperature24, { autoAlpha: 1 })
        .to(image, { scale: 1.075, yPercent: -2, ease: 'none' }, 0)
        .to(dimmer, { autoAlpha: 0.38, ease: 'none' }, 0.08)
        .to(ceiling, { autoAlpha: 0.92, ease: 'none' }, 0.14)
        .to(lamps, { autoAlpha: 1, stagger: 0.09, ease: 'none' }, 0.22)
        .to(curtains[0], { xPercent: -105, ease: 'none' }, 0.31)
        .to(curtains[1], { xPercent: 105, ease: 'none' }, 0.31)
        .to(daylight, { autoAlpha: 0.82, ease: 'none' }, 0.39)
        .to(rays, { autoAlpha: 0.58, ease: 'none' }, 0.43)
        .to(ledStrips, { autoAlpha: 1, stagger: 0.08, ease: 'none' }, 0.48)
        .to(interfacePanel, { autoAlpha: 1, ease: 'none' }, 0.56)
        .to(temperature24, { autoAlpha: 0, ease: 'none' }, 0.62)
        .to(temperature22, { autoAlpha: 1, ease: 'none' }, 0.66)
        .to(comfort, { autoAlpha: 1, ease: 'none' }, 0.72)
        .to(golden, { autoAlpha: 0.9, ease: 'none' }, 0.76)
        .to(reflection, { xPercent: 150, autoAlpha: 0.55, ease: 'none' }, 0.78)
        .to(copy, { autoAlpha: 1, yPercent: -8, ease: 'none' }, 0.68);

      return () => timeline.kill();
    });

    return () => media.revert();
  }, [reducedMotion]);

  const leadPartner = partners.find((partner) => partner.name.toLowerCase().includes('rcs')) ?? partners[0];

  return (
    <div ref={journeyRef} className="overflow-x-clip bg-[#080a0d] text-foreground">
      <ScrollProgress />
      <CursorGlow size={280} className="z-20 opacity-20" />

      <section id="home-hero" className={`relative isolate overflow-hidden border-b border-white/10 ${reducedMotion ? 'min-h-[100svh]' : 'h-[145svh]'}`}>
        <div className={`relative flex min-h-[100svh] items-end overflow-hidden ${reducedMotion ? '' : 'sticky top-0 h-[100svh]'}`} onPointerMove={(event) => {
          if (reducedMotion || event.pointerType === 'touch') return;
          const bounds = event.currentTarget.getBoundingClientRect();
          heroMouseX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 14);
          heroMouseY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 10);
        }} onPointerLeave={() => {
          heroMouseX.set(0);
          heroMouseY.set(0);
        }}>
          <motion.div data-hero-image className="absolute -inset-[4%]" style={reducedMotion ? undefined : { x: heroMouseX, y: heroMouseY }}>
            <Image src="/images/cinematic/villa-arrival.png" alt="Quantum Living Solutions luxury smart villa at dusk" fill priority sizes="100vw" className="object-cover" />
          </motion.div>
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
          <div data-hero-content className="relative z-10 mx-auto grid w-full max-w-[96rem] grid-cols-1 gap-12 px-5 pb-14 pt-32 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12 lg:pb-20">
            <div className="max-w-5xl lg:col-span-9">
              <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold-bright)]">Private residence / Gorakhpur</p>
              <h1 className="max-w-5xl text-5xl font-light leading-[0.94] text-white sm:text-7xl lg:text-[6.55rem]">
                <HeroLine>Quantum Living</HeroLine>
                <HeroLine delay={0.12}>Solutions</HeroLine>
              </h1>
              <h2 className="mt-6 max-w-3xl text-2xl font-light leading-tight text-zinc-100 sm:text-4xl lg:text-5xl">
                <HeroLine delay={0.28}>Architecting Intelligent Luxury Living</HeroLine>
              </h2>
              <p className="mt-8 max-w-xl text-base leading-8 text-zinc-100 sm:text-lg">A private residence where light, climate, privacy, security and entertainment respond as one considered system.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <MagneticButton className="qls-button qls-button-primary" strength={0.18} onClick={() => router.push('/book-demo')}>{PRIVATE_SITE_VISIT.label} · {PRIVATE_SITE_VISIT.priceLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></MagneticButton>
                <MagneticButton className="qls-button border border-white/35 bg-white/10 text-white hover:border-white/70" strength={0.18} onClick={() => router.push('/experience')}>Explore Experience <Play className="h-3.5 w-3.5" aria-hidden="true" /></MagneticButton>
              </div>
            </div>
            <FloatingElement distance={5} duration={5.5} className="hidden justify-self-end border border-white/15 bg-[#080a0d]/70 p-4 lg:block lg:col-span-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[color:var(--gold-bright)]">Residence status</p>
              <div className="mt-3 flex items-end gap-3"><span className="h-2 w-2 rounded-full bg-[color:var(--gold-bright)] shadow-[0_0_14px_rgba(185,145,82,0.85)]" /><span className="text-sm text-white">Arrival scene ready</span></div>
            </FloatingElement>
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-200 lg:col-span-12">
              <span className="h-px w-12 bg-[color:var(--gold-bright)]" />
              Scroll to enter <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section id="arrival" className="relative isolate overflow-hidden border-b border-white/10" data-villa-scene>
        <div data-entry-stage className="relative flex min-h-[100svh] items-end overflow-hidden px-5 py-14 sm:px-8 lg:h-[100svh] lg:px-12 lg:py-20">
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
            <div data-entry-fingerprint className="absolute left-[47.5%] top-[45%] hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--gold-bright)]/80 bg-[#080a0d]/70 lg:block overflow-hidden will-change-transform" aria-hidden="true">
              <Fingerprint className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-[color:var(--gold-bright)]" />
              <span data-entry-scan className="absolute inset-x-3 top-2 h-px bg-[color:var(--gold-bright)] opacity-0 shadow-[0_0_18px_rgba(185,145,82,0.95)]" />
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
          className="relative min-h-[100svh] overflow-hidden px-5 py-14 sm:px-8 lg:h-[100svh] lg:px-12 lg:py-20"
          onPointerMove={(event) => {
            if (reducedMotion || event.pointerType === 'touch') return;
            const bounds = event.currentTarget.getBoundingClientRect();
            livingMouseX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
            livingMouseY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
          }}
          onPointerLeave={() => {
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

          <div data-living-copy className={`relative z-10 mx-auto flex min-h-[calc(100svh-7rem)] max-w-[96rem] items-end ${reducedMotion ? '' : 'lg:translate-y-6 lg:opacity-0'} will-change-transform`}>
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

      <VillaScene id="kitchen" act="Scene 05 / Kitchen" title="The kitchen comes alive quietly." copy="A single touch starts a familiar morning: task lighting rises, the coffee routine begins and the room holds the right level of ambient light." image={sceneImages.kitchen} imageAlt="Premium smart kitchen" >
        <div className="flex items-center gap-4 border-l border-[color:var(--gold)] pl-4"><Coffee className="h-5 w-5 text-[color:var(--gold-bright)]" aria-hidden="true" /><p className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-200">Morning routine / ready</p></div>
      </VillaScene>

      <VillaScene id="bedroom" act="Scene 06 / Bedroom" title="Night mode, without interruption." copy="Shades settle for privacy, the climate adjusts for rest and every layer of the suite becomes quieter as the day closes." image={sceneImages.bedroom} imageAlt="Calm bedroom with automated curtains" reverse>
        <div className="flex items-center gap-4 border-l border-[color:var(--gold)] pl-4"><Moon className="h-5 w-5 text-[color:var(--gold-bright)]" aria-hidden="true" /><p className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-200">Night scene / 22 degrees</p></div>
      </VillaScene>

      <VillaScene id="theater" act="Scene 07 / Home theater" title="The room becomes cinema." copy="The projector lowers, the screen becomes the focus and sound arrives from every direction with a single, considered command." image={sceneImages.theater} imageAlt="Private home theater with cinema lighting">
        <div className="flex max-w-sm items-end gap-1.5 border-b border-white/10 pb-4" aria-label="Active speaker levels">
          {[20, 46, 72, 54, 88, 64, 38, 58, 30, 70].map((height, index) => <motion.span key={index} className="w-full bg-[color:var(--gold-bright)]/75" animate={reducedMotion ? undefined : { height: [`${height * 0.55}px`, `${height}px`, `${height * 0.65}px`] }} transition={{ duration: 1.2 + index * 0.04, repeat: Infinity, repeatType: 'mirror' }} style={{ height: `${height * 0.55}px` }} />)}
          <Volume2 className="ml-3 h-5 w-5 shrink-0 text-[color:var(--gold-bright)]" aria-hidden="true" />
        </div>
      </VillaScene>

      <VillaScene id="security" act="Scene 08 / Security center" title="Protection stays in the background." copy="Fingerprint access, camera coverage and door status live in one clear security view, ready when you need to check in." image={sceneImages.security} imageAlt="Smart home security and surveillance system" reverse>
        <div className="grid max-w-md grid-cols-2 gap-5 border-y border-white/10 py-5"><SceneInterface label="Perimeter" value="Secured" icon={ShieldCheck} /><SceneInterface label="Access" value="Verified" icon={Fingerprint} /></div>
      </VillaScene>

      <VillaScene id="energy" act="Scene 09 / Energy" title="Every watt has a place." copy="See solar production, household load and battery storage at a glance, then let practical schedules reduce unnecessary draw." image={sceneImages.energy} imageAlt="Energy management dashboard" >
        <div className="grid max-w-md grid-cols-3 gap-4 border-y border-white/10 py-5"><SceneInterface label="Solar" value="4.8 kW" icon={SunMedium} /><SceneInterface label="Home" value="2.1 kW" icon={Zap} /><SceneInterface label="Storage" value="78%" icon={BatteryCharging} /></div>
      </VillaScene>

      <section id="products" className="relative overflow-hidden border-t border-white/10 bg-[#0b0e12] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[96rem]">
          <SectionReveal className="max-w-3xl">
            <span className="qls-eyebrow">Scene 10 / Product collection</span>
            <h2 className="qls-section-title text-4xl sm:text-6xl">The objects behind the experience.</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-foreground/75 sm:text-lg">A selected collection of controllers, interfaces and sensors, presented as part of the architecture rather than an afterthought.</p>
          </SectionReveal>
          {products.length > 0 ? (
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, index) => <ProductFloat key={product.id} product={product} index={index} />)}
            </div>
          ) : (
            <div className="mt-14 border-y border-white/10 py-10 text-sm text-zinc-400">Our published collection is being prepared for viewing.</div>
          )}
          <Link href="/products" className="qls-button qls-button-primary mt-12">Explore product catalog <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section id="collaboration" className="border-t border-white/10 px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <SectionReveal>
            <span className="qls-eyebrow">Scene 11 / Engineering collaboration</span>
            <h2 className="qls-section-title text-4xl sm:text-6xl">Designed together, built to last.</h2>
          </SectionReveal>
          <div className="mx-auto mt-16 flex max-w-3xl flex-col items-center">
            <p className="text-2xl font-light text-white sm:text-4xl">Quantum Living Solutions</p>
            <motion.div className="my-6 h-16 w-px bg-[color:var(--gold-bright)]" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: reducedMotion ? 0 : 0.85 }} />
            {leadPartner?.logo ? <Image src={leadPartner.logo.fileUrl} alt={`${leadPartner.name} logo`} width={220} height={100} className="h-20 w-auto object-contain" unoptimized={leadPartner.logo.fileUrl.startsWith('/uploads/')} /> : <p className="text-2xl font-light text-white sm:text-4xl">RCS Electricals</p>}
            <p className="mt-7 text-base leading-8 text-foreground/75 sm:text-lg">Building intelligent homes together.</p>
            {leadPartner && <a href={leadPartner.websiteUrl} target="_blank" rel="noopener noreferrer" className="qls-text-link mt-7">Meet {leadPartner.name}</a>}
          </div>
        </div>
      </section>

      <section id="founder" className="border-t border-white/10 bg-[#0b0e12] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[96rem] grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          <SectionReveal className="lg:col-span-5">
            <span className="qls-eyebrow">Scene 12 / Founder story</span>
            <h2 className="qls-section-title text-4xl sm:text-6xl">Engineering that feels natural.</h2>
            <blockquote className="mt-10 border-l border-[color:var(--gold-bright)] pl-6 text-2xl font-light leading-relaxed text-white sm:text-3xl">&ldquo;{founder.quote}&rdquo;</blockquote>
            <Link href="/about" className="qls-text-link mt-9 inline-flex items-center gap-2">Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </SectionReveal>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.78fr_1fr] md:items-end">
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-zinc-900"><Image src={founder.portraitUrl} alt={`${founder.name}, ${founder.designation}`} fill className="object-cover" unoptimized /></div>
              <SectionReveal as="article" className="pb-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--gold-bright)]">{founder.designation}</p>
                <h3 className="mt-3 text-3xl font-light text-white sm:text-4xl">{founder.name}</h3>
                <p className="mt-6 text-base leading-8 text-foreground/75">{founder.biography[0]}</p>
              </SectionReveal>
            </div>
            <ol className="mt-14 border-l border-white/10 pl-7">
              {founder.timeline.map((item) => <li key={item.title} className="relative pb-10 last:pb-0"><span className="absolute -left-[2.04rem] top-1.5 h-2.5 w-2.5 rounded-full border border-[color:var(--gold-bright)] bg-[#0b0e12]" /><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--gold-bright)]">{item.year}</p><h4 className="mt-2 text-lg text-white">{item.title}</h4><p className="mt-2 text-sm leading-6 text-foreground/65">{item.description}</p></li>)}
            </ol>
          </div>
        </div>
      </section>

      <section id="demo" className="relative isolate overflow-hidden border-t border-white/10 px-5 py-24 text-center sm:px-8 lg:px-12 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(185,145,82,0.16),transparent_52%)]" />
        <SectionReveal className="relative mx-auto max-w-3xl">
          <span className="qls-eyebrow">Scene 13 / Private site visit</span>
          <h2 className="qls-section-title text-4xl sm:text-6xl">Experience your future home in person.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-foreground/75 sm:text-lg">Plan a private site visit with our engineering team. {PRIVATE_SITE_VISIT.adjustmentNote}</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/book-demo" className="qls-button qls-button-primary">{PRIVATE_SITE_VISIT.label} · {PRIVATE_SITE_VISIT.priceLabel} <Play className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            <Link href="/contact" className="qls-button qls-button-secondary">Talk to our team</Link>
          </div>
        </SectionReveal>
      </section>
    </div>
  );
}
