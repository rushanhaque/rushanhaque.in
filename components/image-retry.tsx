'use client';
import { useEffect } from 'react';

// Images under /images are cached for a year without a second look, so a download cut
// short on a weak connection could stay broken on that device for good. Any of the site's
// own images that fails to load is fetched once more, past the browser's cache.
export function ImageRetry() {
  useEffect(() => {
    const bust = (url: string) => url.replace(/(\/images\/[^\s?#,]+)(?:\?[^\s,]*)?/g, `$1?r=${Date.now().toString(36)}`);
    const retry = (img: HTMLImageElement) => {
      if (img.dataset.retried || !/\/images\//.test(img.currentSrc || img.src)) return;
      img.dataset.retried = '1';
      if (img.srcset) img.srcset = bust(img.srcset);
      img.src = bust(img.getAttribute('src') || img.src);
    };
    const onError = (e: Event) => { if (e.target instanceof HTMLImageElement) retry(e.target); };
    document.addEventListener('error', onError, true);
    // Images that failed before this ran.
    Array.from(document.images).forEach(img => { if (img.complete && img.naturalWidth === 0 && (img.currentSrc || img.src)) retry(img); });
    return () => document.removeEventListener('error', onError, true);
  }, []);
  return null;
}
