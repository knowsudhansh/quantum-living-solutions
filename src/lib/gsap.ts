'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

export function registerGSAP() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize,pageshow,orientationchange',
    });
    registered = true;
  }

  return { gsap, ScrollTrigger };
}

export function getGSAPContext(
  callback: gsap.ContextFunc,
  scope?: Element | string | object,
) {
  registerGSAP();
  return gsap.context(callback, scope);
}

export { gsap, ScrollTrigger };
