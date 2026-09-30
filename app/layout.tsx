import type { Metadata, Viewport } from 'next';
import { UsageEvents } from '@/components/usage-events';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MotionProvider } from '@/components/site-motion';
import { PointerEffects } from '@/components/pointer-effects';
import { ContentProvider } from '@/components/content-provider';
import { getPublishedContent } from '@/lib/published-content';
import { ReleaseSync } from '@/components/release-sync';
import { siteOrigin } from '@/lib/seo';
import release from '@/generated/release.json';
import './globals.css';
import './experience.css';
import './pages.css';
import './story.css';
import './choreography.css';
import './completion.css';
import './refinement.css';
import './signature.css';
import './v2.css';
import './editorial.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: 'Rushan Haque — Designer, Developer & Writer', template: '%s — Rushan Haque' },
  description: 'Expressive websites. Considered words. Explore the independent design, development, and writing practice of Rushan Haque.',
  robots: { index: true, follow: true },
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};
export const viewport: Viewport = { themeColor: '#072319', colorScheme: 'light' };

// Applies the saved or system motion preference before first paint, so reduced-motion
// visitors never see an entrance animation start.
const motionScript = `try{var m=localStorage.getItem('rh-motion');document.documentElement.dataset.motion=m==='reduce'||(m!=='full'&&matchMedia('(prefers-reduced-motion: reduce)').matches)?'reduce':'full'}catch(e){}`;

export default async function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  const content=await getPublishedContent();
  return <html lang="en" data-build-id={release.buildId} suppressHydrationWarning><head>
    <script dangerouslySetInnerHTML={{ __html: motionScript }}/>
    <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
    <link rel="preload" href="/fonts/instrument-italic.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
  </head><body id="top"><ContentProvider value={content}><MotionProvider><a className="skip-link" href="#main-content">Skip to content</a><ReleaseSync buildId={release.buildId}/><UsageEvents/><PointerEffects/><SiteHeader/>{children}<SiteFooter/></MotionProvider></ContentProvider></body></html>;
}
