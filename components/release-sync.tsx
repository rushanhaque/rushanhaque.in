'use client';
import { useEffect, useState } from 'react';

export function ReleaseSync({ buildId }: { buildId: string }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (location.pathname.startsWith('/studio')) return;
    let stopped = false, running = false, lastCheck = 0, edited = false, candidate = '';
    const controller = new AbortController();
    const protectInput = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('input:not([type="range"]), textarea, [contenteditable="true"]')) edited = true;
    };
    async function check(force = false) {
      if (stopped || running || document.hidden || (!force && Date.now() - lastCheck < 15000)) return;
      running = true; lastCheck = Date.now();
      try {
        // Omit cookies and deployment headers: ask the production alias which
        // release is active, even when the page belongs to an older release.
        const response = await fetch('/api/version', { cache: 'no-store', credentials: 'omit', signal: controller.signal });
        if (!response.ok) return;
        const value = await response.json();
        if (stopped || typeof value.buildId !== 'string') return;
        if (value.buildId === buildId) { candidate = ''; setAvailable(false); return; }
        // Confirm twice so a transient edge/deployment transition cannot loop.
        if (candidate !== value.buildId) { candidate = value.buildId; return; }
        setAvailable(true);
        if (edited) return;
        const key = 'portfolio-release-reload';
        try {
          const previous = Number(sessionStorage.getItem(key) || 0);
          if (Date.now() - previous < 300000) return;
          sessionStorage.setItem(key, String(Date.now()));
        } catch { return; } // Offer the update if storage is unavailable.
        location.reload();
      } catch { /* Offline visitors keep the page they already have. */ }
      finally { running = false; }
    }
    const onFocus = () => { void check(); };
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void check(true); };
    const timer = setInterval(onFocus, 300000);
    document.addEventListener('input', protectInput);
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);
    void check(true);
    return () => { stopped = true; controller.abort(); clearInterval(timer); document.removeEventListener('input', protectInput); document.removeEventListener('visibilitychange', onFocus); window.removeEventListener('focus', onFocus); window.removeEventListener('pageshow', onPageShow); };
  }, [buildId]);
  return available ? <aside className="release-update" role="status"><span>A new edition is ready. Your current work is safe.</span><button className="text-link" onClick={() => location.reload()}>View latest edition</button></aside> : null;
}
