import type { Metadata, Viewport } from 'next';
import { UsageEvents } from '@/components/usage-events';
import { SiteHeader } from '@/components/site-header';
import { FitHeadings } from '@/components/fit-headings';
import { SiteFooter } from '@/components/site-footer';
import { MotionProvider } from '@/components/site-motion';
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
import './books.css';
import './polish.css';
import './header.css';
import './footer.css';
import './buttons.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: 'Rushan Haque — Project Manager & Full-Stack Developer', template: '%s — Rushan Haque' },
  description: 'Expressive websites. Considered words. Explore the independent design, development, and writing practice of Rushan Haque.',
  robots: { index: true, follow: true },
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
  return <html lang="en" data-build-id={release.buildId} suppressHydrationWarning><head>
    <script dangerouslySetInnerHTML={{ __html: motionScript }}/>
    <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
    <link rel="preload" href="/fonts/instrument-italic.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
  </head><body id="top"><MotionProvider><a className="skip-link" href="#main-content">Skip to content</a><ReleaseSync buildId={release.buildId}/><UsageEvents/><SiteHeader workCount={content.projects.length}/><div id="page-stack" className="page-stack">{children}</div><SiteFooter/><FitHeadings/></MotionProvider></body></html>;
}
