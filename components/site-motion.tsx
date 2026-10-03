'use client';
import { createContext, useContext, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Motion is always on. The site no longer reads the operating system's
// reduced-motion setting, and there is no switch to turn it off.
const MotionContext = createContext({ reduced: false });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.motion = 'full';
    // Browsers without scroll-driven animations get a GSAP reading-progress fallback.
    if (CSS.supports('animation-timeline: scroll()')) return;
    const tween = gsap.to('.reading-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);

  return <MotionContext.Provider value={{ reduced: false }}><div className="reading-progress" aria-hidden="true"/>{children}</MotionContext.Provider>;
}
export function useMotion() { return useContext(MotionContext); }

