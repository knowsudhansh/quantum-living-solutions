import React from 'react';
import Link from 'next/link';
import { getIconForSlug } from '../solutions/solution-icons';
import { MotionReveal } from '../ui/motion';

interface TransformSpace {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  needs: string;
  systems: { name: string; slug: string }[];
}

const TRANSFORM_SPACES: TransformSpace[] = [
  {
    id: 'residences',
    title: 'Residences & Smart Homes',
    subtitle: 'Luxury Living Spaces',
    imageUrl: '/images/evening.jpg',
    needs: 'Every space in a premium residence should adapt seamlessly to your lifestyle. We harmonize lighting scenes, climate levels, shades, and background audio under one intuitive control system so your home always feels comfortable.',
    systems: [
      { name: 'Home Automation', slug: 'residential-automation' },
      { name: 'Lighting Automation', slug: 'lighting-automation' },
      { name: 'Climate Control', slug: 'climate-control' },
      { name: 'Curtains & Blinds', slug: 'curtains-and-blinds' },
    ],
  },
  {
    id: 'workspaces',
    title: 'Workspaces & Commercial Environments',
    subtitle: 'Intelligent Offices',
    imageUrl: '/images/workspace.jpg',
    needs: 'Modern boardrooms, offices, and collaboration zones thrive when climate, automated presentation screens, and workspace illumination react automatically as personnel move through the facility, optimizing productivity.',
    systems: [
      { name: 'Workspace Automation', slug: 'commercial-automation' },
      { name: 'Security & Surveillance', slug: 'security-and-surveillance' },
      { name: 'Lighting Automation', slug: 'lighting-automation' },
    ],
  },
  {
    id: 'entertainment',
    title: 'Entertainment & Media Spaces',
    subtitle: 'Cinematic Lounges',
    imageUrl: '/images/entertaining.jpg',
    needs: 'A truly custom home theater or media room requires a careful layout where motorized blackouts, dimming tracks, high-fidelity sound, and silent air ventilation integrate into a single-button experience.',
    systems: [
      { name: 'Audio / Video', slug: 'audio-video-entertainment' },
      { name: 'Curtains & Blinds', slug: 'curtains-and-blinds' },
      { name: 'Lighting Automation', slug: 'lighting-automation' },
    ],
  },
  {
    id: 'energy',
    title: 'Energy-Conscious Environments',
    subtitle: 'Resource Optimization',
    imageUrl: '/images/kitchen.jpg',
    needs: 'Luxury living can stay responsible. We configure systems to monitor idle loads, run heating/cooling on dynamic schedules, and manage solar gain to reduce waste without sacrificing comfort.',
    systems: [
      { name: 'Energy Management', slug: 'energy-management' },
      { name: 'Climate Control', slug: 'climate-control' },
      { name: 'Curtains & Blinds', slug: 'curtains-and-blinds' },
    ],
  },
];

export function EnvironmentShowcase() {
  return (
    <div className="space-y-24">
      {TRANSFORM_SPACES.map((space, index) => {
        const isImageLeft = index % 2 === 0;
        return (
          <MotionReveal
            key={space.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-center"
          >
            {/* Visual Panel */}
            <div className={`qls-card group lg:col-span-6 relative aspect-video md:aspect-[4/3] overflow-hidden bg-zinc-950 ${
              isImageLeft ? 'lg:order-1' : 'lg:order-2'
            }`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={space.imageUrl}
                alt={space.title}
                className="w-full h-full object-cover opacity-55 transition-all duration-700 group-hover:opacity-78 group-hover:scale-[1.025]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            {/* Content Panel */}
            <div className={`lg:col-span-6 flex flex-col justify-center ${
              isImageLeft ? 'lg:order-2' : 'lg:order-1'
            }`}>
              <span className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] mb-2 block select-none">
                {space.subtitle}
              </span>
              <h3 className="qls-section-title mb-4">
                {space.title}
              </h3>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-6 font-normal">
                {space.needs}
              </p>

              <div className="border-t border-zinc-800/80 pt-6 mt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 select-none">
                  What We Bring Together
                </h4>
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {space.systems.map((sys) => (
                    <div
                      key={sys.slug}
                      className="flex items-center gap-2 rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-1.5 text-xs text-foreground/85 font-mono"
                    >
                      <span className="text-[HSL(210,80%,60%)]">
                        {getIconForSlug(sys.slug, "w-3.5 h-3.5")}
                      </span>
                      {sys.name}
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/solutions"
                  className="qls-text-link inline-flex items-center"
                >
                  Explore Solutions <span className="ml-2">&rarr;</span>
                </Link>
              </div>
            </div>
          </MotionReveal>
        );
      })}
    </div>
  );
}
