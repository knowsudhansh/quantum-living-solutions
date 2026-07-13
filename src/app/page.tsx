'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CinematicHomeJourney } from '../components/home/cinematic-home-journey';
import { RenderState } from '../lib/utils/capability';
import { getIconForSlug } from '../components/solutions/solution-icons';
import { HomePartnersSection } from '../components/partners/home-partners-section';
import { MotionCard, MotionReveal } from '../components/ui/motion';

export const dynamic = 'force-dynamic';

type SceneKey = 'morning' | 'evening' | 'entertaining' | 'security';

interface FeaturedProduct {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  description: string;
  price: number;
  hidePrice: boolean;
  coverImage: { fileUrl: string } | null;
  category: { name: string };
  brand: { name: string } | null;
}

export default function Home() {
  const [renderState, setRenderState] = useState<RenderState | null>(null);
  const [activeScene, setActiveScene] = useState<SceneKey>('morning');
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/products/featured');
        if (res.ok) {
          const data = await res.json() as { success: boolean; products: FeaturedProduct[] };
          setFeaturedProducts(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching featured products', err);
      }
    };
    fetchFeatured();
  }, []);

  const scenes = {
    morning: {
      title: 'Morning Scene',
      desc: 'Shades raise slowly to capture natural morning daylight while heating warms the space.',
      img: '/images/morning.jpg',
    },
    evening: {
      title: 'Evening Sunset',
      desc: 'Warm ambient illumination sets in as shades lower, creating a private retreat.',
      img: '/images/evening.jpg',
    },
    entertaining: {
      title: 'Cinematic Lounge',
      desc: 'Theater fixtures dim to minimums while audio arrays activate for premium cinema sessions.',
      img: '/images/entertaining.jpg',
    },
    security: {
      title: 'Secure Perimeter',
      desc: 'Entry lock checks activate and twilight pathways light up to keep your residence safe.',
      img: '/images/security.jpg',
    },
  };

  const systems = [
    { name: 'Lighting Control', icon: 'lighting-automation', desc: 'Warm scene adjustments that flow with daylight cycles.' },
    { name: 'Motorized Shading', icon: 'curtains-and-blinds', desc: 'Blinds and curtains that automate for privacy and sun-glare control.' },
    { name: 'Intelligent Climate', icon: 'climate-control', desc: 'Zoned temperature regulation responding automatically to presence.' },
    { name: 'Sanctuary Security', icon: 'security-and-surveillance', desc: 'Perimeter checks, remote alarms, and entry validations.' },
    { name: 'Audio & Cinema', icon: 'audio-video-entertainment', desc: 'Distributed hi-fi sound matrices and optimized home screens.' },
    { name: 'Energy Management', icon: 'energy-management', desc: 'Dormant load monitoring and solar harvesting coordination.' },
  ];

  const spaces = [
    { title: 'Luxury Residences', subtitle: 'Private Smart Homes', img: '/images/evening.jpg', link: '/projects' },
    { title: 'Intelligent Workspaces', subtitle: 'Modern Corporate Offices', img: '/images/workspace.jpg', link: '/projects' },
    { title: 'Cinematic Entertainment', subtitle: 'Home Theaters & Lounges', img: '/images/entertaining.jpg', link: '/projects' },
  ];

  return (
    <div className="relative w-full min-h-screen">
      <h1 className="sr-only">Quantum Living Solutions premium home automation</h1>
      {/* Loading placeholder during SSR/Hydration */}
      {renderState === null && (
        <div className="fixed inset-0 z-50 w-full h-full bg-background pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Immersive Scroll Home Journey (Acts 01–10, ZONE A, B, C) */}
      <CinematicHomeJourney renderState={renderState} setRenderState={setRenderState} />

      {/* Solid Backdrop Container for Lower Editorial Content (Blocks fixed Canvas background) */}
      <div className="relative z-10 bg-zinc-950 border-t border-zinc-900/60 mt-12">

        {/* ==================================================
            SECTION 3 — ONE COMMAND, MANY SYSTEMS
            ================================================== */}
        <MotionReveal className="max-w-7xl mx-auto px-6 qls-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[HSL(25,60%,50%)] font-semibold mb-2 block select-none">
                SYSTEM INTEGRATION
              </span>
              <h2 className="qls-section-title mb-6">
                One Command.<br />
                Many Systems.
              </h2>
              <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-md mb-8 font-normal">
                {"You shouldn't have to manage six different applications. We combine your subsystems to behave as one unified, comfortable living environment."}
              </p>
              {/* Asymmetrical Image block */}
              <div className="relative aspect-video rounded-sm overflow-hidden border border-zinc-900/80 bg-zinc-900 max-w-sm hidden lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/kitchen.jpg"
                  alt="Seamless smart home integration"
                  className="w-full h-full object-cover opacity-45"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {systems.map((sys) => (
                <MotionCard
                  key={sys.name}
                  className="qls-card qls-card-hover p-5 md:p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[HSL(210,80%,60%)]">
                      {getIconForSlug(sys.icon, 'w-5 h-5')}
                    </span>
                    <h3 className="text-base font-semibold text-foreground tracking-tight">
                      {sys.name}
                    </h3>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed font-normal">
                    {sys.desc}
                  </p>
                </MotionCard>
              ))}
            </div>
          </div>
        </MotionReveal>

        {/* ==================================================
            SECTION 4 — FEATURED PRODUCTS
            ================================================== */}
        {featuredProducts.length > 0 && (
          <MotionReveal className="max-w-7xl mx-auto px-6 qls-section">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold mb-2 block select-none">
                  LATEST HARDWARE
                </span>
                <h2 className="qls-section-title">
                  Featured Products
                </h2>
                <p className="text-sm text-foreground/70 leading-relaxed mt-3 max-w-xl">
                  Browse selected smart home controllers, touch panels, sensors and automation devices from our published catalog.
                </p>
              </div>
              <Link
                href="/products"
                className="qls-button qls-button-secondary w-full sm:w-auto text-center"
              >
                View All Products
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => {
                const formatPrice = (paise: number) => {
                  return new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                  }).format(paise / 100);
                };

                return (
                  <MotionCard
                    key={p.id}
                    className="qls-card qls-card-hover group flex flex-col h-full overflow-hidden"
                  >
                    <Link href={`/products/${p.slug}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]">
                      <div className="aspect-video w-full relative bg-zinc-900 border-b border-zinc-900/80 overflow-hidden shrink-0">
                        {p.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.coverImage.fileUrl}
                            alt={p.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-zinc-700 uppercase">
                            No Image
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">
                          {p.category.name}
                        </span>
                        <Link
                          href={`/products/${p.slug}`}
                          className="block mt-1 text-sm font-light text-white tracking-tight hover:text-[HSL(35,30%,70%)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                        >
                          {p.title}
                        </Link>
                        {p.subtitle && (
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                            {p.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-500">Price</span>
                        <span className="text-zinc-300">
                          {p.hidePrice ? 'Call for price' : formatPrice(p.price)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href={`/products/${p.slug}`}
                          className="qls-button qls-button-secondary min-h-0 py-2 text-[9px]"
                        >
                          Details
                        </Link>
                        <Link
                          href="/products"
                          className="qls-button qls-button-primary min-h-0 py-2 text-[9px]"
                        >
                          Catalog
                        </Link>
                      </div>
                    </div>
                  </MotionCard>
                );
              })}
            </div>
          </MotionReveal>
        )}

        {/* ==================================================
            SECTION 5 — LIVING SCENES PREVIEW
            ================================================== */}
        <MotionReveal className="max-w-7xl mx-auto px-6 qls-section">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[HSL(25,60%,50%)] font-semibold mb-2 block select-none">
              SCENE DEMONSTRATION
            </span>
            <h2 className="qls-section-title">
              Intuitive Living Scenes
            </h2>
            <p className="text-sm text-foreground/75 leading-relaxed mt-2">
              Select a scene preset below to see how our custom configurations orchestrate lighting warmth, climate settings, and shading dynamically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left selector menu */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {(Object.keys(scenes) as SceneKey[]).map((key) => {
                const isSelected = activeScene === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveScene(key)}
                    className={`qls-card qls-card-hover w-full text-left p-5 border transition-all duration-300 outline-none cursor-pointer ${
                      isSelected
                        ? 'border-[HSL(35,30%,45%)] bg-[HSL(35,30%,45%)]/5'
                        : 'border-zinc-900 text-foreground/60 hover:border-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-mono uppercase tracking-widest block text-[HSL(35,30%,45%)] font-semibold mb-1">
                      {key.toUpperCase()}
                    </span>
                    <span className="text-base font-light text-foreground block">
                      {scenes[key].title}
                    </span>
                    <span className="text-xs text-foreground/60 leading-normal block mt-2 font-normal">
                      {scenes[key].desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right preview display viewport */}
            <div className="qls-card lg:col-span-8 relative aspect-video overflow-hidden bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scenes[activeScene].img}
                alt={scenes[activeScene].title}
                className="w-full h-full object-cover opacity-50 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 select-none">
                <Link
                  href="/experience"
                  className="qls-button qls-button-secondary bg-zinc-950/80 backdrop-blur-sm"
                >
                  Explore the Full Experience &rarr;
                </Link>
              </div>
            </div>
          </div>
        </MotionReveal>

        {/* ==================================================
            SECTION 5 — SPACES WE TRANSFORM
            ================================================== */}
        <MotionReveal className="max-w-7xl mx-auto px-6 qls-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[HSL(25,60%,50%)] font-semibold mb-2 block select-none">
                WHERE WE WORK
              </span>
              <h2 className="qls-section-title">
                Spaces We Transform
              </h2>
            </div>
            <Link
              href="/projects"
              className="qls-text-link"
            >
              Discover All Environments &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {spaces.map((space) => (
              <MotionCard
                key={space.title}
                className="qls-card group relative flex flex-col justify-end aspect-[4/5] overflow-hidden bg-zinc-900/40 p-6"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={space.img}
                  alt={space.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-opacity duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                <div className="relative z-20">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold block mb-1">
                    {space.subtitle}
                  </span>
                  <h3 className="text-xl font-light text-foreground tracking-tight mb-4">
                    {space.title}
                  </h3>
                  <Link
                    href={space.link}
                    className="inline-flex items-center text-xs font-mono text-[HSL(210,80%,60%)] hover:text-white transition-colors"
                  >
                    View Projects <span className="ml-2">&rarr;</span>
                  </Link>
                </div>
              </MotionCard>
            ))}
          </div>
        </MotionReveal>

        {/* ==================================================
            SECTION 6 — REAL COMPANY STORY
            ================================================== */}
        <MotionReveal className="max-w-7xl mx-auto px-6 qls-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="qls-card lg:col-span-5 relative aspect-video md:aspect-[4/3] overflow-hidden bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/security.jpg"
                alt="Quantum Living Solutions company story"
                className="w-full h-full object-cover opacity-45"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[HSL(25,60%,50%)] font-semibold block select-none">
                BUILT IN GORAKHPUR
              </span>
              <h2 className="qls-section-title">
                Engineered Around Real Life.
              </h2>
              <p className="text-base text-foreground/75 leading-relaxed font-normal">
                Quantum Living Solutions provides premium home and commercial automation services. Under the leadership of founder Raj Kumar Sharma, we coordinate custom scene layouts, climate presets, shading, and cinematic audio/video matrices.
              </p>
              <p className="text-sm text-foreground/60 leading-relaxed font-normal">
                Our consultation-led approach ensures you receive highly intuitive systems that remain dependable and simple to operate, with thorough testing and clean handover procedures.
              </p>
              <div className="pt-4 select-none">
                <Link
                  href="/about"
                  className="qls-button qls-button-secondary"
                >
                  Our Story &rarr;
                </Link>
              </div>
            </div>
          </div>
        </MotionReveal>

        {/* ==================================================
            SECTION 6B — PARTNER COLLABORATIONS
            ================================================== */}
        <HomePartnersSection />

        {/* ==================================================
            SECTION 7 — FINAL CONVERSION MOMENT
            ================================================== */}
        <MotionReveal className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold block select-none">
              START A CONVERSATION
            </span>
            <h2 className="qls-section-title">
              Your Space Can Do More.
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed max-w-md mx-auto">
              Visit our Gorakhpur showroom for a private demo, or schedule a free consultation to discuss your smart home or automation project.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center select-none">
              <Link
                href="/book-demo"
                className="qls-button qls-button-primary w-full sm:w-auto text-center"
              >
                Book Showroom Demo
              </Link>
              <a
                href="https://wa.me/918130856575"
                target="_blank"
                rel="noopener noreferrer"
                className="qls-button qls-button-secondary w-full sm:w-auto text-center"
              >
                Consult on WhatsApp
              </a>
            </div>
          </div>
        </MotionReveal>

      </div>
    </div>
  );
}
