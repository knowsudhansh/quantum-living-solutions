'use client';

import React, { useRef, useEffect, useState } from 'react';
import { JourneyProgress } from './journey-progress';
import { JourneyActContent } from './journey-act-content';
import { ScrollScrubVideo } from './scroll-scrub-video';
import { TechnologyHotspot } from './technology-hotspot';
import { StructuralCanvasContainer } from '../cinematic/canvas-container';
import { RenderState } from '../../lib/utils/capability';

interface CinematicHomeJourneyProps {
  renderState: RenderState | null;
  setRenderState: (state: RenderState | null) => void;
}

const actsData = [
  {
    title: 'YOUR SPACE. INTELLIGENTLY ALIVE.',
    subtitle: 'Act 01 — Arrival',
    desc: 'Lighting, climate, curtains, security and entertainment — designed to move together around the way you live.',
  },
  {
    title: 'Welcome Begins Before the Door.',
    subtitle: 'Act 02 — Intelligent Entry',
    desc: 'Automated entry sequences identify arrival patterns. The intelligent gate activates pathway guides dynamically.',
    technologies: ['Smart Gate Automation', 'Video Door Entry', 'Access Control', 'Perimeter Security'],
    hotspot: { label: 'SMART ENTRY', x: 45, y: 55 }
  },
  {
    title: 'The Home Knows You\'ve Arrived.',
    subtitle: 'Act 03 — Welcome Home',
    desc: 'Foyer pathways dim to comfortable warm scenes as perimeter disarms, initiating welcoming room climates.',
    technologies: ['Arrival Scene', 'Entry Lighting', 'Security Disarm', 'Climate Preparation'],
    hotspot: { label: 'FOYER CONTROLS', x: 50, y: 48 }
  },
  {
    title: 'Every Room Finds the Right Light.',
    subtitle: 'Act 04 — Light',
    desc: 'Custom architectural dimming levels adapt to focus tasks, architectural features, and circadian comfort paths.',
    technologies: ['Architectural Lighting', 'Dimming Scenes', 'Occupancy Response'],
    hotspot: { label: 'LIGHTING KEYPAD', x: 55, y: 40 }
  },
  {
    title: 'Privacy Moves With the Day.',
    subtitle: 'Act 05 — Privacy',
    desc: 'Motorized shading adjusts automatically throughout the day, harvesting natural light while managing glare.',
    technologies: ['Motorized Curtains', 'Automated Blinds', 'Daylight Response'],
    hotspot: { label: 'SHADING SENSORS', x: 60, y: 35 }
  },
  {
    title: 'Comfort, Before You Ask.',
    subtitle: 'Act 06 — Comfort',
    desc: 'Temperature zones automatically adjust settings based on occupancy parameters and room exposure cycles.',
    technologies: ['Climate Control', 'Temperature Scenes', 'Occupancy-Based Comfort'],
    hotspot: { label: 'THERMOSTAT SENSOR', x: 52, y: 44 }
  },
  {
    title: 'The Room Becomes the Experience.',
    subtitle: 'Act 07 — Entertainment',
    desc: 'Dim lighting levels, close automated blinds, and activate distributed high-fidelity media routing with one tap.',
    technologies: ['Distributed Audio', 'Video Systems', 'Cinema Scenes', 'One-Touch Control'],
    hotspot: { label: 'MEDIA SYSTEM CONTROLS', x: 58, y: 50 }
  },
  {
    title: 'Protection That Stays in the Background.',
    subtitle: 'Act 08 — Security',
    desc: 'Intelligent security zones coordinate perimeter loops, deadbolt locks, and monitoring panels seamlessly.',
    technologies: ['CCTV Systems', 'Smart Locks', 'Door Sensors', 'Perimeter Monitoring'],
    hotspot: { label: 'SECURE MATRIX', x: 48, y: 52 }
  },
  {
    title: 'The Home Uses Only What It Needs.',
    subtitle: 'Act 09 — Energy',
    desc: 'Intelligent power distribution paths transition inactive circuits to dormant profiles to manage waste.',
    technologies: ['Energy Monitoring', 'Intelligent Scheduling', 'Standby Load Management'],
    hotspot: { label: 'SOLAR & CHARGING HUD', x: 50, y: 58 }
  },
  {
    title: 'One Home. Every System. Working Together.',
    subtitle: 'Act 10 — Complete Home',
    desc: 'Experience home automation designed built around you at our Gorakhpur showroom.',
    isCTA: true,
  },
];

export function CinematicHomeJourney({ renderState, setRenderState }: CinematicHomeJourneyProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Future approved walkthrough video slot:
  // Set to real url when available (e.g. '/videos/walkthrough.mp4')
  const [videoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const trackHeight = rect.height;

      // scrolled is how far the track top has scrolled past the top of the viewport
      const scrolled = -rect.top;
      const maxScroll = trackHeight - viewHeight;

      if (maxScroll > 0) {
        const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
        setScrollProgress(progress);

        // Split progress into actsData.length parts
        const index = Math.min(
          actsData.length - 1,
          Math.floor(progress * actsData.length)
        );
        setActiveIndex(index);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize immediately
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isReducedMotion = renderState === 'REDUCED_MOTION';

  const handleNavigate = (index: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const trackHeight = trackRef.current.scrollHeight;
    const viewHeight = window.innerHeight;
    const maxScroll = trackHeight - viewHeight;
    // Calculate page Y coordinate mapping index to scroll progress
    const targetScrollY = window.scrollY + rect.top + (index / actsData.length) * maxScroll + 10;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  return (
    <div ref={trackRef} className="relative w-full h-[1000vh]">
      {/* Sticky Journey Viewport Stage (calc height based on header displacement) */}
      <div className="sticky top-[64px] h-[calc(100vh-64px)] w-full overflow-hidden flex items-center z-10">
        
        {/* ZONE C: Visual Area (Fixed on right side) */}
        <div className="absolute inset-y-0 right-0 left-0 md:left-2/5 lg:left-1/2 z-0 pointer-events-none transition-opacity duration-700">
          {videoUrl ? (
            <ScrollScrubVideo
              key={videoUrl || 'fallback'}
              videoUrl={videoUrl}
              progress={scrollProgress}
              activeAct={activeIndex}
              isReducedMotion={isReducedMotion}
            />
          ) : (
            <StructuralCanvasContainer activeAct={activeIndex} onRenderStateChange={setRenderState} />
          )}

          {/* Hotspots Overlay */}
          {!isReducedMotion &&
            actsData.map((act, i) => {
              if (!act.hotspot) return null;
              return (
                <TechnologyHotspot
                  key={i}
                  label={act.hotspot.label}
                  technologies={act.technologies}
                  x={act.hotspot.x}
                  y={act.hotspot.y}
                  active={activeIndex === i}
                />
              );
            })}
        </div>

        {/* Content Grid Layer containing ZONE A, GAP, and ZONE B (Overlayed relative) */}
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 z-10 h-full grid grid-cols-1 md:grid-cols-[72px_48px_minmax(420px,500px)_1fr] lg:grid-cols-[80px_64px_minmax(480px,600px)_1fr] items-center">
          
          {/* ZONE A: Progress Rail (Col 1, Desktop only) */}
          <div className="hidden md:block col-start-1 select-none z-20">
            <JourneyProgress
              actsCount={actsData.length}
              activeAct={activeIndex}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Column 2 is the permanent empty spacer gap in the grid */}

          {/* ZONE B: ONE Text Slot Position (Col 3, Vertically Centered) */}
          <div className="col-start-1 md:col-start-3 w-full relative z-20">
            <div key={activeIndex} className="animate-act-fade-in">
              <JourneyActContent
                act={actsData[activeIndex]}
                index={activeIndex}
                isActive={true}
                isReducedMotion={isReducedMotion}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
