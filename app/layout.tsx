import type { Metadata } from 'next';
import { UsageEvents } from '@/components/usage-events';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MotionProvider } from '@/components/site-motion';
import { ContentProvider } from '@/components/content-provider';
import { getPublishedContent } from '@/lib/published-content';
import './globals.css';
import './experience.css';
import './pages.css';
import './story.css';
import './choreography.css';
import './completion.css';
import './refinement.css';
import './signature.css';
import './studio.css';
import './experiments.css';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Rushan Haque — Designer, Developer & Writer', template: '%s — Rushan Haque' },
  description: 'Expressive websites. Considered words. Explore the independent design, development, and writing practice of Rushan Haque.',
  robots: { index: false, follow: false },
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export default async function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  const content=await getPublishedContent();
  return <html lang="en"><head><link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><meta name="theme-color" content="#072319"/></head><body id="top"><ContentProvider value={content}><MotionProvider><a className="skip-link" href="#main-content">Skip to content</a><UsageEvents/><SiteHeader/>{children}<SiteFooter/></MotionProvider></ContentProvider></body></html>;
}
