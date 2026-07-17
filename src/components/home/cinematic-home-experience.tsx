'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useMotionSystem } from '@/components/animation/MotionProvider';
import { registerGSAP } from '@/lib/gsap';
import type gsap from 'gsap';
import { CinematicHomeHero } from './cinematic-home-hero';
import { CinematicHomeJourney } from './cinematic-home-journey';

const subscribeHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function useHasHydrated() {
  return useSyncExternalStore(subscribeHydration, getHydratedSnapshot, getServerHydrationSnapshot);
}

export function CinematicHomeExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reducedMotion: prefersReducedMotion } = useMotionSystem();
  const hasHydrated = useHasHydrated();
  const reducedMotion = hasHydrated && prefersReducedMotion;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return undefined;

    const { gsap, ScrollTrigger } = registerGSAP();
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      });

      const one = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
      const all = <T extends HTMLElement>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
      const to = (target: gsap.TweenTarget | null | undefined, vars: gsap.TweenVars, position: gsap.Position) => {
        if (target && (!Array.isArray(target) || target.length > 0)) timeline.to(target, vars, position);
      };
      const fromTo = (
        target: gsap.TweenTarget | null | undefined,
        fromVars: gsap.TweenVars,
        toVars: gsap.TweenVars,
        position: gsap.Position,
      ) => {
        if (target && (!Array.isArray(target) || target.length > 0)) timeline.fromTo(target, fromVars, toVars, position);
      };

      const heroLights = all('[data-hero-light]');
      const heroGatePanels = all('[data-hero-gate-panel]');
      const heroImage = one('[data-hero-image]');
      const heroContent = one('[data-hero-content]');
      const heroOverlay = one('[data-hero-overlay]');

      const arrivalExterior = one('#arrival [data-entry-exterior]');
      const arrivalInterior = one('#arrival [data-entry-interior]');
      const arrivalDoors = all('#arrival [data-entry-door]');
      const arrivalFingerprint = one('#arrival [data-entry-fingerprint]');
      const arrivalScan = one('#arrival [data-entry-scan]');
      const arrivalWarmLight = one('#arrival [data-entry-warm-light]');
      const arrivalReflection = one('#arrival [data-entry-reflection]');
      const arrivalAmbient = one('#arrival [data-entry-ambient]');
      const arrivalCopy = one('#arrival [data-entry-copy]');

      const entryMedia = one('#entry [data-scene-media], #entry .villa-scene-media');
      const entryCopy = one('#entry [data-scene-copy]');
      const entryPanel = one('#entry [data-scene-panel]');

      const livingImage = one('#living [data-living-image]');
      const livingDimmer = one('#living [data-living-dimmer]');
      const livingCeiling = one('#living [data-living-ceiling]');
      const livingLamps = all('#living [data-living-lamp]');
      const livingCurtains = all('#living [data-living-curtain]');
      const livingDaylight = one('#living [data-living-daylight]');
      const livingLeds = all('#living [data-living-led]');
      const livingGolden = one('#living [data-living-golden]');
      const livingRays = one('#living [data-living-rays]');
      const livingReflection = one('#living [data-living-reflection]');
      const livingInterface = one('#living [data-living-interface]');
      const livingCopy = one('#living [data-living-copy]');
      const temperature24 = one('#living [data-temperature-24]');
      const temperature22 = one('#living [data-temperature-22]');
      const comfort = one('#living [data-comfort-mode]');

      gsap.set([arrivalInterior, arrivalWarmLight, arrivalAmbient, livingCeiling, livingDaylight, livingGolden, livingRays, temperature22, comfort].filter(Boolean), { opacity: 0 });
      gsap.set([arrivalCopy, livingInterface, livingCopy, entryCopy, entryPanel].filter(Boolean), { opacity: 0.18, yPercent: 4 });
      gsap.set(arrivalExterior, { scale: 1.04, yPercent: 1, opacity: 1 });
      gsap.set(arrivalFingerprint, {
        opacity: 0,
        scale: 0.82,
        rotate: -4,
        transformOrigin: '50% 50%',
        borderColor: 'rgba(167, 243, 208, 0.22)',
        boxShadow: '0 0 0 rgba(116, 211, 152, 0)',
      });
      gsap.set(arrivalScan, { opacity: 0, scale: 0.72, transformOrigin: '50% 50%' });
      gsap.set(arrivalDoors[0], { xPercent: 0, rotateY: 0, transformOrigin: 'right center' });
      gsap.set(arrivalDoors[1], { xPercent: 0, rotateY: 0, transformOrigin: 'left center' });
      gsap.set(temperature24, { opacity: 1 });
      gsap.set(all('[data-cinematic-scene] [data-scene-copy], [data-cinematic-scene] [data-scene-panel]'), { opacity: 0.76, yPercent: 3 });
      gsap.set(all('[data-scene-reflection]'), { opacity: 0 });

      timeline.addLabel('HeroStart', 0);
      to(heroGatePanels[0], { xPercent: -84, duration: 1.18, ease: 'power3.inOut' }, 'HeroStart+=0.02');
      to(heroGatePanels[1], { xPercent: 84, duration: 1.18, ease: 'power3.inOut' }, 'HeroStart+=0.02');
      to(heroLights, { opacity: 1, stagger: 0.065, duration: 0.48, ease: 'sine.out' }, 'HeroStart+=0.1');
      to(heroImage, { scale: 1.18, yPercent: -6.2, duration: 1.72, ease: 'sine.inOut' }, 'HeroStart');
      to(heroContent, { yPercent: -10, opacity: 0.42, duration: 0.48, ease: 'power1.out' }, 'HeroStart+=0.32');
      to(heroContent, { yPercent: -24, opacity: 0.08, duration: 0.72, ease: 'power2.inOut' }, 'HeroStart+=0.74');
      to(heroOverlay, { opacity: 0.62, duration: 0.8, ease: 'sine.inOut' }, 'HeroStart+=0.34');

      timeline.addLabel('ArrivalStart', 0.44);
      timeline.addLabel('CameraPushStart', 0.46);
      timeline.addLabel('RecognitionStart', 0.66);
      timeline.addLabel('AuthenticationStart', 0.8);
      timeline.addLabel('UnlockConfirmStart', 0.94);
      timeline.addLabel('DoorHandleStart', 1.02);
      timeline.addLabel('LockRotationStart', 1.06);
      timeline.addLabel('DoorOpenStart', 1.1);
      timeline.addLabel('InteriorRevealStart', 1.26);

      to(arrivalExterior, { scale: 1.15, yPercent: -2.8, duration: 0.92, ease: 'sine.inOut' }, 'CameraPushStart');
      to(arrivalExterior, { scale: 1.32, yPercent: -8.6, duration: 1.02, ease: 'power1.inOut' }, 'DoorHandleStart-=0.08');
      to(arrivalFingerprint, { opacity: 0.18, scale: 0.92, rotate: 0, duration: 0.18, ease: 'sine.out' }, 'RecognitionStart');
      to(arrivalFingerprint, {
        opacity: 0.3,
        scale: 1,
        borderColor: 'rgba(167, 243, 208, 0.72)',
        boxShadow: '0 0 28px rgba(116, 211, 152, 0.34)',
        duration: 0.2,
        ease: 'sine.out',
      }, 'AuthenticationStart');
      to(arrivalScan, { opacity: 0.72, scale: 1.18, duration: 0.24, ease: 'sine.out' }, 'AuthenticationStart+=0.02');
      to(arrivalScan, { opacity: 0, scale: 1.72, duration: 0.34, ease: 'sine.in' }, 'UnlockConfirmStart-=0.04');
      to(arrivalFingerprint, { scale: 1.08, opacity: 0.2, duration: 0.28, ease: 'power1.out' }, 'UnlockConfirmStart');
      to(arrivalFingerprint, { rotate: -16, xPercent: -5, duration: 0.26, ease: 'power2.inOut' }, 'DoorHandleStart');
      to(arrivalFingerprint, { rotate: 20, xPercent: 10, opacity: 0.12, duration: 0.28, ease: 'power2.inOut' }, 'LockRotationStart');
      to(arrivalFingerprint, { opacity: 0, scale: 1.16, duration: 0.34, ease: 'sine.in' }, 'DoorOpenStart+=0.08');
      to(arrivalDoors[0], { xPercent: -12, rotateY: -7, duration: 0.24, ease: 'power2.inOut' }, 'DoorHandleStart');
      to(arrivalDoors[1], { xPercent: 12, rotateY: 7, duration: 0.24, ease: 'power2.inOut' }, 'DoorHandleStart');
      to(arrivalDoors[0], { xPercent: -118, rotateY: -28, duration: 0.78, ease: 'power3.inOut' }, 'DoorOpenStart');
      to(arrivalDoors[1], { xPercent: 118, rotateY: 28, duration: 0.78, ease: 'power3.inOut' }, 'DoorOpenStart');
      to(arrivalWarmLight, { opacity: 0.16, duration: 0.26, ease: 'sine.out' }, 'AuthenticationStart+=0.04');
      to(arrivalWarmLight, { opacity: 0.48, duration: 0.42, ease: 'sine.inOut' }, 'DoorHandleStart+=0.02');
      to(arrivalWarmLight, { opacity: 0.98, duration: 0.62, ease: 'sine.inOut' }, 'DoorOpenStart+=0.14');
      to(arrivalInterior, { opacity: 0.28, scale: 1.04, duration: 0.42, ease: 'sine.out' }, 'DoorOpenStart+=0.04');
      to(arrivalExterior, { opacity: 0.1, duration: 0.54, ease: 'sine.inOut' }, 'InteriorRevealStart');
      to(arrivalInterior, { opacity: 1, scale: 0.985, duration: 0.68, ease: 'power1.inOut' }, 'InteriorRevealStart-=0.02');
      to(arrivalReflection, { xPercent: 145, opacity: 0.5, duration: 0.54, ease: 'sine.inOut' }, 'InteriorRevealStart+=0.06');
      to(arrivalAmbient, { opacity: 1, duration: 0.54, ease: 'sine.out' }, 'InteriorRevealStart+=0.1');
      to(arrivalCopy, { opacity: 0.58, yPercent: -2, duration: 0.42, ease: 'power1.out' }, 'InteriorRevealStart+=0.28');
      to(arrivalCopy, { opacity: 1, yPercent: -8, duration: 0.54, ease: 'power2.out' }, 'InteriorRevealStart+=0.46');

      timeline.addLabel('EntryStart', 1.54);
      fromTo(entryMedia, { scale: 1.025, yPercent: 1.8 }, { scale: 1.1, yPercent: -3.8, duration: 0.98, ease: 'sine.inOut' }, 'EntryStart-=0.12');
      to(entryCopy, { opacity: 1, yPercent: 0, duration: 0.48, ease: 'power1.out' }, 'EntryStart+=0.16');
      to(entryPanel, { opacity: 1, yPercent: 0, scale: 1, duration: 0.5, ease: 'power1.out' }, 'EntryStart+=0.22');

      timeline.addLabel('LivingStart', 2.08);
      to(livingImage, { scale: 1.075, yPercent: -2, duration: 1.05 }, 'LivingStart');
      to(livingDimmer, { opacity: 0.38, duration: 0.32 }, 'LivingStart+=0.08');
      to(livingCeiling, { opacity: 0.92, duration: 0.35 }, 'LivingStart+=0.14');
      to(livingLamps, { opacity: 1, stagger: 0.09, duration: 0.34 }, 'LivingStart+=0.22');
      to(livingCurtains[0], { xPercent: -105, duration: 0.56 }, 'LivingStart+=0.31');
      to(livingCurtains[1], { xPercent: 105, duration: 0.56 }, 'LivingStart+=0.31');
      to(livingDaylight, { opacity: 0.82, duration: 0.42 }, 'LivingStart+=0.39');
      to(livingRays, { opacity: 0.58, duration: 0.38 }, 'LivingStart+=0.43');
      to(livingLeds, { opacity: 1, stagger: 0.08, duration: 0.3 }, 'LivingStart+=0.48');
      to(livingInterface, { opacity: 1, yPercent: 0, duration: 0.42 }, 'LivingStart+=0.5');
      to(temperature24, { opacity: 0, duration: 0.2 }, 'LivingStart+=0.62');
      to(temperature22, { opacity: 1, duration: 0.2 }, 'LivingStart+=0.66');
      to(comfort, { opacity: 1, duration: 0.24 }, 'LivingStart+=0.72');
      to(livingGolden, { opacity: 0.9, duration: 0.32 }, 'LivingStart+=0.76');
      to(livingReflection, { xPercent: 150, opacity: 0.55, duration: 0.45 }, 'LivingStart+=0.78');
      to(livingCopy, { opacity: 1, yPercent: -8, duration: 0.5 }, 'LivingStart+=0.58');

      const sceneLabels = ['KitchenStart', 'BedroomStart', 'TheaterStart', 'SecurityStart', 'EnergyStart', 'ProductsStart', 'CollaborationStart', 'FounderStart', 'DemoStart'];
      all('[data-cinematic-scene]').forEach((scene, index) => {
        const label = sceneLabels[index] ?? `Scene${index + 5}Start`;
        const position = 2.82 + index * 0.58;
        const mediaLayer = scene.querySelector<HTMLElement>('[data-scene-media]');
        const copy = scene.querySelector<HTMLElement>('[data-scene-copy]');
        const panel = scene.querySelector<HTMLElement>('[data-scene-panel]');
        const glow = scene.querySelector<HTMLElement>('[data-scene-glow]');
        const reflection = scene.querySelector<HTMLElement>('[data-scene-reflection]');
        const lines = Array.from(scene.querySelectorAll<HTMLElement>('[data-scene-line]'));
        const products = Array.from(scene.querySelectorAll<HTMLElement>('[data-floating-product]'));

        timeline.addLabel(label, position);
        fromTo(mediaLayer, { scale: 1.02, yPercent: 2 }, { scale: 1.08, yPercent: -3, duration: 0.78 }, label);
        fromTo(glow, { opacity: 0.5 }, { opacity: 0.9, duration: 0.58 }, `${label}+=0.06`);
        to(copy, { opacity: 1, yPercent: 0, duration: 0.45 }, `${label}+=0.1`);
        to(panel, { opacity: 1, yPercent: 0, scale: 1, duration: 0.48 }, `${label}+=0.16`);
        to(reflection, { xPercent: 150, opacity: 0.46, duration: 0.46 }, `${label}+=0.22`);
        fromTo(lines, { scaleY: 0.08 }, { scaleY: 1, stagger: 0.08, duration: 0.35 }, `${label}+=0.2`);
        fromTo(products, { opacity: 0.72, yPercent: 5, rotate: -2 }, { opacity: 1, yPercent: 0, rotate: 0, stagger: 0.08, duration: 0.45 }, `${label}+=0.2`);
      });

      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => window.cancelAnimationFrame(refreshFrame);
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <div ref={rootRef} className="overflow-x-clip bg-[#080a0d] text-foreground" data-home-cinematic-root>
      <CinematicHomeHero />
      <CinematicHomeJourney />
    </div>
  );
}
