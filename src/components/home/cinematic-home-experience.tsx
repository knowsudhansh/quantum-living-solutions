'use client';

import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { useMotionSystem } from '@/components/animation/MotionProvider';
import { registerGSAP } from '@/lib/gsap';
import { getCinematicInputProfile, isTouchCinematicProfile } from '@/lib/utils/input-device';
import type gsap from 'gsap';
import { CinematicHomeHero } from './cinematic-home-hero';
import { CinematicHomeJourney } from './cinematic-home-journey';

const subscribeHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;
const getServerInputSnapshot = () => 'desktop' as const;

function subscribeInputProfile(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  let frame = 0;
  const notify = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      onStoreChange();
    });
  };

  window.addEventListener('orientationchange', notify, { passive: true });
  window.addEventListener('resize', notify, { passive: true });

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener('orientationchange', notify);
    window.removeEventListener('resize', notify);
  };
}

function useHasHydrated() {
  return useSyncExternalStore(subscribeHydration, getHydratedSnapshot, getServerHydrationSnapshot);
}

function useCinematicInputProfile() {
  return useSyncExternalStore(subscribeInputProfile, getCinematicInputProfile, getServerInputSnapshot);
}

export function CinematicHomeExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const { reducedMotion: prefersReducedMotion } = useMotionSystem();
  const hasHydrated = useHasHydrated();
  const inputProfile = useCinematicInputProfile();
  const reducedMotion = hasHydrated && prefersReducedMotion;
  const isTouchExperience = hasHydrated && isTouchCinematicProfile(inputProfile);
  const useNaturalFlow = reducedMotion || isTouchExperience;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return undefined;

    const runtimeInputProfile = getCinematicInputProfile();
    const runtimeIsTouchExperience = isTouchCinematicProfile(runtimeInputProfile);

    if (runtimeIsTouchExperience) {
      const { ScrollTrigger } = registerGSAP();
      ScrollTrigger.getById('home-cinematic-master')?.kill(true);
      root.dataset.cinematicInput = runtimeInputProfile;
      root.dataset.cinematicMode = 'touch-flow';

      return () => {
        delete root.dataset.cinematicInput;
        delete root.dataset.cinematicMode;
      };
    }

    const scrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    if (!initializedRef.current) {
      initializedRef.current = true;
      window.scrollTo(0, 0);
    }

    const { gsap, ScrollTrigger } = registerGSAP();
    const context = gsap.context(() => {
      root.dataset.cinematicInput = runtimeInputProfile;
      root.dataset.cinematicMode = 'desktop-scrub';

      ScrollTrigger.getById('home-cinematic-master')?.kill(true);

      const cinematicWindow = window as Window & { __qlsHomeTimelineProgress?: number };
      cinematicWindow.__qlsHomeTimelineProgress = 0;

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'home-cinematic-master',
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.05,
          anticipatePin: 0,
          fastScrollEnd: false,
          invalidateOnRefresh: true,
        },
      });
      timeline.eventCallback('onUpdate', () => {
        cinematicWindow.__qlsHomeTimelineProgress = timeline.progress();
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
      const heroRoot = one('[data-home-hero-root]');
      const journeyRoot = one('[data-home-journey-root]');
      const heroScene = one('#home-hero');
      const heroImage = one('[data-hero-image]');
      const heroContent = one('[data-hero-content]');
      const heroOverlay = one('[data-hero-overlay]');

      const arrivalScene = one('#arrival');
      const arrivalExterior = one('#arrival [data-entry-exterior]');
      const arrivalInterior = one('#arrival [data-entry-interior]');
      const arrivalDoors = all('#arrival [data-entry-door]');
      const arrivalFingerprint = one('#arrival [data-entry-fingerprint]');
      const arrivalScan = one('#arrival [data-entry-scan]');
      const arrivalWarmLight = one('#arrival [data-entry-warm-light]');
      const arrivalReflection = one('#arrival [data-entry-reflection]');
      const arrivalAmbient = one('#arrival [data-entry-ambient]');
      const arrivalCopy = one('#arrival [data-entry-copy]');

      const entryScene = one('#entry');
      const entryMedia = one('#entry [data-scene-media], #entry .villa-scene-media');
      const entryCopy = one('#entry [data-scene-copy]');
      const entryPanel = one('#entry [data-scene-panel]');

      const livingScene = one('#living');
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
      const sceneLayers = all<HTMLElement>('[data-home-hero-root] > section, [data-home-journey-root] > section');

      const activateLayer = (target: HTMLElement | null | undefined, position: gsap.Position) => {
        if (target) timeline.set(target, { autoAlpha: 1, pointerEvents: 'auto', zIndex: 6 }, position);
      };

      const deactivateLayer = (target: HTMLElement | null | undefined, position: gsap.Position) => {
        if (target) timeline.set(target, { autoAlpha: 0, pointerEvents: 'none', zIndex: 1 }, position);
      };

      gsap.set(sceneLayers, { autoAlpha: 0, pointerEvents: 'none', zIndex: 1 });
      gsap.set(heroRoot, { opacity: 1, zIndex: 3 });
      gsap.set(journeyRoot, { opacity: 1, zIndex: 2 });
      gsap.set(heroScene, { autoAlpha: 1, pointerEvents: 'auto', zIndex: 6 });
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
      to(heroGatePanels[0], { xPercent: -84, duration: 1.08, ease: 'power3.inOut' }, 'HeroStart+=0.05');
      to(heroGatePanels[1], { xPercent: 84, duration: 1.08, ease: 'power3.inOut' }, 'HeroStart+=0.05');
      to(heroLights, { opacity: 1, stagger: 0.08, duration: 0.56, ease: 'sine.out' }, 'HeroStart+=0.16');
      to(heroImage, { scale: 1.13, yPercent: -4.4, duration: 1.28, ease: 'sine.inOut' }, 'HeroStart');
      to(heroContent, { yPercent: -16, opacity: 0.14, duration: 0.72, ease: 'power2.inOut' }, 'HeroStart+=0.48');
      to(heroOverlay, { opacity: 0.62, duration: 0.7, ease: 'sine.inOut' }, 'HeroStart+=0.52');

      timeline.addLabel('ArrivalStart', 1.28);
      timeline.addLabel('CameraApproachStart', 1.28);
      timeline.addLabel('RecognitionStart', 2.36);
      timeline.addLabel('AuthenticationStart', 2.72);
      timeline.addLabel('SuccessStart', 3.92);
      timeline.addLabel('UnlockPauseStart', 4.42);
      timeline.addLabel('UnlockSoundCue', 4.84);
      timeline.addLabel('DoorHandleStart', 4.92);
      timeline.addLabel('DoorOpenStart', 5.22);
      timeline.addLabel('CameraWalkthroughStart', 7.12);
      timeline.addLabel('InteriorLightStart', 7.3);
      timeline.addLabel('InteriorRevealStart', 7.48);

      timeline.set(journeyRoot, { zIndex: 4 }, 'ArrivalStart');
      timeline.set(heroRoot, { zIndex: 1 }, 'RecognitionStart');
      activateLayer(arrivalScene, 'ArrivalStart');
      deactivateLayer(heroScene, 'RecognitionStart');
      to(arrivalExterior, { scale: 1.16, yPercent: -2.8, duration: 1.08, ease: 'sine.inOut' }, 'CameraApproachStart');
      to(arrivalFingerprint, { opacity: 0.16, scale: 0.9, rotate: 0, duration: 0.36, ease: 'sine.out' }, 'RecognitionStart');
      to(arrivalFingerprint, {
        opacity: 0.28,
        scale: 1,
        borderColor: 'rgba(167, 243, 208, 0.42)',
        boxShadow: '0 0 16px rgba(116, 211, 152, 0.18)',
        duration: 0.6,
        ease: 'sine.inOut',
      }, 'AuthenticationStart');
      to(arrivalScan, { opacity: 0.58, scale: 1.08, duration: 0.58, ease: 'sine.inOut' }, 'AuthenticationStart+=0.08');
      to(arrivalScan, { opacity: 0.12, scale: 1.48, duration: 0.54, ease: 'sine.inOut' }, 'AuthenticationStart+=0.66');
      to(arrivalFingerprint, {
        opacity: 0.44,
        scale: 1.04,
        borderColor: 'rgba(134, 239, 172, 0.82)',
        boxShadow: '0 0 34px rgba(116, 211, 152, 0.34)',
        duration: 0.5,
        ease: 'sine.out',
      }, 'SuccessStart');
      to(arrivalScan, { opacity: 0, scale: 1.78, duration: 0.5, ease: 'sine.out' }, 'SuccessStart');
      to(arrivalWarmLight, { opacity: 0.1, duration: 0.5, ease: 'sine.inOut' }, 'SuccessStart+=0.12');
      to(arrivalFingerprint, { opacity: 0.34, scale: 1.02, duration: 0.42, ease: 'sine.inOut' }, 'UnlockPauseStart');
      to(arrivalFingerprint, { rotate: -18, xPercent: -5, duration: 0.32, ease: 'power2.inOut' }, 'DoorHandleStart');
      to(arrivalDoors[0], { xPercent: -9, rotateY: -6, duration: 0.34, ease: 'power2.inOut' }, 'DoorHandleStart+=0.04');
      to(arrivalDoors[1], { xPercent: 9, rotateY: 6, duration: 0.34, ease: 'power2.inOut' }, 'DoorHandleStart+=0.04');
      to(arrivalFingerprint, { rotate: 16, xPercent: 8, opacity: 0.14, duration: 0.42, ease: 'power2.inOut' }, 'DoorOpenStart');
      to(arrivalFingerprint, { opacity: 0, scale: 1.12, duration: 0.5, ease: 'sine.inOut' }, 'DoorOpenStart+=0.42');
      to(arrivalDoors[0], { xPercent: -118, rotateY: -31, duration: 1.82, ease: 'power2.inOut' }, 'DoorOpenStart');
      to(arrivalDoors[1], { xPercent: 118, rotateY: 31, duration: 1.82, ease: 'power2.inOut' }, 'DoorOpenStart');
      to(arrivalWarmLight, { opacity: 0.34, duration: 0.78, ease: 'sine.inOut' }, 'DoorOpenStart+=0.26');
      to(arrivalWarmLight, { opacity: 0.72, duration: 0.72, ease: 'sine.inOut' }, 'DoorOpenStart+=1.0');
      to(arrivalInterior, { opacity: 0.28, scale: 1.045, duration: 0.76, ease: 'sine.inOut' }, 'DoorOpenStart+=1.12');
      to(arrivalExterior, { scale: 1.34, yPercent: -8.8, duration: 1.14, ease: 'sine.inOut' }, 'CameraWalkthroughStart');
      to(arrivalExterior, { opacity: 0.1, duration: 0.78, ease: 'sine.inOut' }, 'InteriorRevealStart');
      to(arrivalInterior, { opacity: 1, scale: 0.985, duration: 1.0, ease: 'power2.inOut' }, 'InteriorLightStart');
      to(arrivalWarmLight, { opacity: 0.96, duration: 0.86, ease: 'sine.inOut' }, 'InteriorLightStart+=0.12');
      to(arrivalReflection, { xPercent: 145, opacity: 0.5, duration: 0.68, ease: 'sine.inOut' }, 'InteriorRevealStart+=0.14');
      to(arrivalAmbient, { opacity: 1, duration: 0.72, ease: 'sine.out' }, 'InteriorRevealStart+=0.22');
      to(arrivalCopy, { opacity: 0.62, yPercent: -2, duration: 0.58, ease: 'power1.out' }, 'InteriorRevealStart+=0.5');
      to(arrivalCopy, { opacity: 1, yPercent: -8, duration: 0.68, ease: 'power2.out' }, 'InteriorRevealStart+=0.88');

      timeline.addLabel('EntryStart', 9.12);
      activateLayer(entryScene, 'EntryStart');
      deactivateLayer(arrivalScene, 'EntryStart+=1.32');
      fromTo(entryMedia, { scale: 1.025, yPercent: 1.8 }, { scale: 1.1, yPercent: -3.8, duration: 1.08, ease: 'sine.inOut' }, 'EntryStart');
      to(entryCopy, { opacity: 1, yPercent: 0, duration: 0.56, ease: 'power1.out' }, 'EntryStart+=0.84');
      to(entryPanel, { opacity: 1, yPercent: 0, scale: 1, duration: 0.56, ease: 'power1.out' }, 'EntryStart+=1.0');

      timeline.addLabel('LivingStart', 10.82);
      activateLayer(livingScene, 'LivingStart');
      deactivateLayer(entryScene, 'LivingStart+=1.32');
      to(livingImage, { scale: 1.075, yPercent: -2, duration: 1.12, ease: 'sine.inOut' }, 'LivingStart');
      to(livingDimmer, { opacity: 0.38, duration: 0.42, ease: 'sine.inOut' }, 'LivingStart+=1.0');
      to(livingCeiling, { opacity: 0.92, duration: 0.46, ease: 'sine.out' }, 'LivingStart+=1.28');
      to(livingLamps, { opacity: 1, stagger: 0.1, duration: 0.42, ease: 'sine.out' }, 'LivingStart+=1.62');
      to(livingCurtains[0], { xPercent: -105, duration: 0.68, ease: 'power2.inOut' }, 'LivingStart+=2.02');
      to(livingCurtains[1], { xPercent: 105, duration: 0.68, ease: 'power2.inOut' }, 'LivingStart+=2.02');
      to(livingDaylight, { opacity: 0.82, duration: 0.58, ease: 'sine.inOut' }, 'LivingStart+=2.72');
      to(livingRays, { opacity: 0.58, duration: 0.5, ease: 'sine.inOut' }, 'LivingStart+=3.02');
      to(livingLeds, { opacity: 1, stagger: 0.1, duration: 0.42, ease: 'sine.out' }, 'LivingStart+=3.34');
      to(livingInterface, { opacity: 1, yPercent: 0, duration: 0.58, ease: 'power1.out' }, 'LivingStart+=3.9');
      to(temperature24, { opacity: 0, duration: 0.32, ease: 'sine.inOut' }, 'LivingStart+=4.34');
      to(temperature22, { opacity: 1, duration: 0.32, ease: 'sine.inOut' }, 'LivingStart+=4.52');
      to(comfort, { opacity: 1, duration: 0.36, ease: 'sine.out' }, 'LivingStart+=4.86');
      to(livingGolden, { opacity: 0.9, duration: 0.52, ease: 'sine.inOut' }, 'LivingStart+=5.18');
      to(livingReflection, { xPercent: 150, opacity: 0.55, duration: 0.58, ease: 'sine.inOut' }, 'LivingStart+=5.54');
      to(livingCopy, { opacity: 1, yPercent: -8, duration: 0.68, ease: 'power2.out' }, 'LivingStart+=5.9');

      const sceneLabels = ['KitchenStart', 'BedroomStart', 'TheaterStart', 'SecurityStart', 'EnergyStart', 'ProductsStart', 'CollaborationStart', 'FounderStart', 'DemoStart'];
      let previousLayer: HTMLElement | null | undefined = livingScene;
      all('[data-cinematic-scene]').filter((scene) => scene.id && scene.id !== 'entry').forEach((scene, index) => {
        const label = sceneLabels[index] ?? `Scene${index + 5}Start`;
        const position = 18.2 + index * 1.2;
        const mediaLayer = scene.querySelector<HTMLElement>('[data-scene-media]');
        const copy = scene.querySelector<HTMLElement>('[data-scene-copy]');
        const panel = scene.querySelector<HTMLElement>('[data-scene-panel]');
        const glow = scene.querySelector<HTMLElement>('[data-scene-glow]');
        const reflection = scene.querySelector<HTMLElement>('[data-scene-reflection]');
        const lines = Array.from(scene.querySelectorAll<HTMLElement>('[data-scene-line]'));
        const products = Array.from(scene.querySelectorAll<HTMLElement>('[data-floating-product]'));

        timeline.addLabel(label, position);
        activateLayer(scene, label);
        deactivateLayer(previousLayer, label);
        previousLayer = scene;
        fromTo(mediaLayer, { scale: 1.02, yPercent: 2 }, { scale: 1.08, yPercent: -3, duration: 0.78 }, label);
        fromTo(glow, { opacity: 0.5 }, { opacity: 0.9, duration: 0.58 }, `${label}+=0.06`);
        to(copy, { opacity: 1, yPercent: 0, duration: 0.45 }, `${label}+=0.1`);
        to(panel, { opacity: 1, yPercent: 0, scale: 1, duration: 0.48 }, `${label}+=0.16`);
        to(reflection, { xPercent: 150, opacity: 0.46, duration: 0.46 }, `${label}+=0.22`);
        fromTo(lines, { scaleY: 0.08 }, { scaleY: 1, stagger: 0.08, duration: 0.35 }, `${label}+=0.2`);
        fromTo(products, { opacity: 0.72, yPercent: 5, rotate: -2 }, { opacity: 1, yPercent: 0, rotate: 0, stagger: 0.08, duration: 0.45 }, `${label}+=0.2`);
      });

      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        window.cancelAnimationFrame(refreshFrame);
        delete root.dataset.cinematicInput;
        delete root.dataset.cinematicMode;
        delete cinematicWindow.__qlsHomeTimelineProgress;
      };
    }, root);

    return () => {
      window.history.scrollRestoration = scrollRestoration;
      context.revert();
    };
  }, [inputProfile, isTouchExperience, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={useNaturalFlow ? 'qls-home-mobile-flow overflow-x-clip bg-[#080a0d] text-foreground' : 'qls-home-scroll-track overflow-x-clip text-foreground'}
      data-home-cinematic-root
    >
      <div className={useNaturalFlow ? 'qls-home-mobile-flow-inner' : 'qls-home-cinematic-viewport'}>
        <CinematicHomeHero />
        <CinematicHomeJourney />
      </div>
    </div>
  );
}
