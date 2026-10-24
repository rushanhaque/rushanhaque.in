import type { Metadata, Viewport } from 'next';
import { UsageEvents } from '@/components/usage-events';
import { SiteHeader } from '@/components/site-header';
import { FitHeadings } from '@/components/fit-headings';
import { SiteFooter } from '@/components/site-footer';
import { MotionProvider } from '@/components/site-motion';
import { Reveal } from '@/components/reveal';
import { PlanScan } from '@/components/plan-scan';
import { getPublishedContent } from '@/lib/published-content';
import { placementOf } from '@/lib/project-access';
import { ReleaseSync } from '@/components/release-sync';
import { siteOrigin, jsonLd } from '@/lib/seo';
import { siteGraph } from '@/lib/schema';
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
import './books.css';
import './polish.css';
import './header.css';
import './footer.css';
import './buttons.css';
import './mobile.css';
import './seo-pages.css';
import './reveal.css';
import './premium.css';
import './backgrounds.css';
import './finish.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: 'Rushan Haque | Website Designer & Developer', template: '%s — Rushan Haque' },
  description: 'Rushan Haque designs and builds custom websites, online stores and web apps for businesses in India and abroad, fast on mobile and made to rank.',
  applicationName: 'Rushan Haque',
  authors: [{ name: 'Rushan Haque', url: siteOrigin }],
  creator: 'Rushan Haque',
  category: 'Web design and development',
  formatDetection: { telephone: true, email: true, address: true },
  other: { 'geo.region': 'IN-UP', 'geo.placename': 'Moradabad', 'geo.position': '28.8386;78.7733', ICBM: '28.8386, 78.7733' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  // Ownership tags for Google Search Console and Bing Webmaster Tools, set as Vercel environment variables.
  verification: { ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}), ...(process.env.BING_SITE_VERIFICATION ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } } : {}) },
  icons: { icon: [{ url: '/icon.png', type: 'image/png', sizes: '512x512' }], shortcut: '/icon.png', apple: '/apple-icon.png' },
  openGraph: { images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Rushan Haque' }] },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
};
export const viewport: Viewport = { themeColor: '#07241a', colorScheme: 'light' };

// Motion is always on; this marks it before first paint so reduced-motion
// visitors never see an entrance animation start.
const motionScript = `document.documentElement.dataset.motion='full'`;

export default async function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  const content=await getPublishedContent();
  return <html lang="en-IN" data-build-id={release.buildId} suppressHydrationWarning><head>
    <script dangerouslySetInnerHTML={{ __html: motionScript }}/>
    <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
    <link rel="preload" href="/fonts/instrument-italic.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteGraph()) }}/>
  </head><body id="top"><MotionProvider><a className="skip-link" href="#main-content">Skip to content</a><ReleaseSync buildId={release.buildId}/><UsageEvents/><SiteHeader workCount={content.projects.filter(p=>placementOf(p)==='work').length}/><div id="page-stack" className="page-stack">{children}</div><SiteFooter/><FitHeadings/><Reveal/><PlanScan/></MotionProvider></body></html>;
}
