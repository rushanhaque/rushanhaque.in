'use client';
import { createContext, useContext, useEffect } from 'react';

// Motion is always on. The site no longer reads the operating system's
// reduced-motion setting, and there is no switch to turn it off.
const MotionContext = createContext({ reduced: false });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => { document.documentElement.dataset.motion = 'full'; }, []);

  return <MotionContext.Provider value={{ reduced: false }}>{children}</MotionContext.Provider>;
}
export function useMotion() { return useContext(MotionContext); }

