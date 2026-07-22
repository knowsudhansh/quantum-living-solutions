'use client';

export type CinematicInputProfile = 'desktop' | 'tablet-touch' | 'phone-touch';

export function getCinematicInputProfile(): CinematicInputProfile {
  if (typeof window === 'undefined') return 'desktop';

  const hasTouch = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
  if (!hasTouch) return 'desktop';

  const screenWidth = window.screen?.width || window.innerWidth;
  const screenHeight = window.screen?.height || window.innerHeight;
  const shortSide = Math.min(screenWidth, screenHeight);
  const longSide = Math.max(screenWidth, screenHeight);
  const isPhone = shortSide < 720 && longSide < 1100;

  return isPhone ? 'phone-touch' : 'tablet-touch';
}

export function isTouchCinematicProfile(profile: CinematicInputProfile) {
  return profile !== 'desktop';
}
