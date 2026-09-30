'use client';
import { useEffect, useState } from 'react';
import type { ContentFile } from '@/lib/content-schema';

export function PublicationStatus({ target }: { target: { file: ContentFile; hash: string; commit: string } | null }) {
  const [state, setState] = useState<{ key: string; status: string } | null>(null);
  useEffect(() => {
    if (!target) return;
    let stopped = false, busy = false;
    const controller = new AbortController();
    const start = Date.now();
    const key = target.file + target.hash;
    async function check() {
      if (stopped || busy || document.hidden) return;
      busy = true;
      try {
        const response = await fetch('/api/version', { cache: 'no-store', credentials: 'omit', signal: controller.signal });
        if (!response.ok) throw Error();
        const release = await response.json();
        if (stopped) return;
        if (release.content?.[target!.file] === target!.hash) {
          setState({ key, status: 'Live: this domain now serves your published content.' });
          stopped = true;
        } else setState({ key, status: Date.now() - start > 180000 ? 'Still awaiting deployment. Check the Vercel build and production-domain assignment; GitHub has your content.' : 'Committed to GitHub. Waiting for Vercel to deploy this content to this domain…' });
      } catch { if (!stopped) setState({ key, status: 'GitHub has your content. Live deployment could not be verified yet; checking again shortly.' }); }
      finally { busy = false; }
    }
    const onFocus = () => { void check(); };
    const timer = setInterval(onFocus, 10000);
    document.addEventListener('visibilitychange', onFocus);
    void check();
    return () => { stopped = true; controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', onFocus); };
  }, [target]);
  if (!target) return null;
  return <p className="publication-status" role="status">{state?.key === target.file + target.hash ? state.status : 'GitHub accepted the content. Verifying the live deployment…'}{target.commit && <> Commit: <code>{target.commit.slice(0, 8)}</code>.</>}</p>;
}
