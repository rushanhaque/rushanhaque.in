'use client';
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

type Preference = 'system' | 'reduce' | 'full';
const KEY = 'rh-motion';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());

function readPreference(): Preference {
  try { const value = localStorage.getItem(KEY); return value === 'reduce' || value === 'full' ? value : 'system'; } catch { return 'system'; }
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', emit);
  window.addEventListener('storage', emit);
  return () => { listeners.delete(fn); query.removeEventListener('change', emit); window.removeEventListener('storage', emit); };
}
function snapshot() {
  const preference = readPreference();
  const reduced = preference === 'reduce' || (preference === 'system' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return `${preference}:${reduced ? 1 : 0}`;
}

const MotionContext = createContext({ reduced: false, preference: 'system' as Preference, setPreference: (() => {}) as (value: Preference) => void });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  // The server renders the full-motion markup; the client corrects it before any timeline starts.
  const state = useSyncExternalStore(subscribe, snapshot, () => 'system:0');
  const [preference, flag] = state.split(':') as [Preference, string];
  const reduced = flag === '1';
  const setPreference = useCallback((value: Preference) => {
    try { if (value === 'system') localStorage.removeItem(KEY); else localStorage.setItem(KEY, value); } catch { /* Private mode: preference lasts for this page. */ }
    emit();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduce' : 'full';
    if (reduced) return;
    // Browsers without scroll-driven animations get a GSAP reading-progress fallback.
    if (CSS.supports('animation-timeline: scroll()')) return;
    const tween = gsap.to('.reading-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true } });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [reduced]);

  return <MotionContext.Provider value={{ reduced, preference, setPreference }}><div className="reading-progress" aria-hidden="true"/>{children}</MotionContext.Provider>;
}
export function useMotion() { return useContext(MotionContext); }

export function MotionToggle() {
  const { reduced, setPreference } = useMotion();
  return <button type="button" className="motion-switch" aria-pressed={!reduced} onClick={() => setPreference(reduced ? 'full' : 'reduce')}>
    <span className="motion-switch-track" aria-hidden="true"><i/></span>Motion {reduced ? 'off' : 'on'}
  </button>;
}
