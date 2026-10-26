import { ClientMap } from '@/components/client-map';
import { jsonLd, pageMetadata, siteOrigin } from '@/lib/seo';
import { breadcrumbs, ids } from '@/lib/schema';
import { Star } from 'lucide-react';
import { ReviewForm } from '@/components/review-form';
import { ApprovedReviews } from '@/components/approved-reviews';
import { getPublishedContent } from '@/lib/published-content';
import { withoutEmoji } from '@/lib/text';
import '@/app/review-page.css';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('/reviews', 'Client reviews', 'What clients in India, Saudi Arabia, Poland and Nepal said about working with Rushan Haque on their websites, and a place to add your own.');

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
// "Dec 2025" as an ISO month for structured data.
const isoMonth = (d: string) => { const m = d.match(/^(\w{3})\w*\s+(\d{4})$/); const i = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1; return m && i >= 0 ? `${m[2]}-${String(i + 1).padStart(2, '0')}` : undefined; };
const short = (d: string) => { const m = d.match(/^(\w{3})\w*\s+(\d{4})$/); return m ? `${m[1].toUpperCase()} ’${m[2].slice(2)}` : d.toUpperCase(); };
const stars = (n: number) => <span className="rvp-stars" aria-label={`${n} out of 5`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill={i < Math.round(n) ? 'currentColor' : 'none'} strokeWidth={1.5}/>)}</span>;

export default async function WriteReview() {
  const { reviews } = await getPublishedContent();
  const ratings = reviews.map(r => Number(r.rating)).filter(Boolean);
  const average = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';
  const row = 'DESIGN/DEVELOPMENT/';
  // Every review on the page, as reviews of the business, for search and answer engines.
  const page = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${siteOrigin}/reviews#page`, url: `${siteOrigin}/reviews`, name: 'Client reviews', isPartOf: { '@id': ids.website }, about: { '@id': ids.business },
    mainEntity: { '@type': 'ItemList', itemListElement: reviews.map((r, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Review', itemReviewed: { '@id': ids.business }, author: { '@type': 'Person', name: r.name, ...(r.company ? { worksFor: { '@type': 'Organization', name: r.company } } : {}) }, reviewRating: { '@type': 'Rating', ratingValue: Number(r.rating) || 5, bestRating: 5, worstRating: 1 }, reviewBody: withoutEmoji(r.quote), ...(isoMonth(r.date) ? { datePublished: isoMonth(r.date) } : {}), ...(r.location ? { locationCreated: { '@type': 'Place', name: r.location } } : {}) } })) } };
  return <main id="main-content" className="rvp">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([page, breadcrumbs([['Reviews', '/reviews']])]) }}/>
    <section className="rvp-hero">
      <div className="rvp-marquee" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => i).map(i => <div key={i} className={`rvp-row ${i % 2 ? 'is-reverse' : ''}`}><span>{row.repeat(6)}</span><span>{row.repeat(6)}</span></div>)}</div>
      <div className="rvp-card">
        <div className="rvp-pitch">
          <span className="rvp-pill"><i aria-hidden="true"/>Open submission</span>
          <h1 suppressHydrationWarning>Add your name to the <em>sheet.</em></h1>
          <p>Worked with me? Say how it actually went. It arrives unedited and goes up the same way, with no polishing and no cherry-picking.</p>
          <ol><li><b>01</b>Takes under a minute</li><li><b>02</b>Straight to my inbox</li><li><b>03</b>Published as written</li></ol>
        </div>
        <ReviewForm/>
      </div>
    </section>
    <section className="rvp-said" aria-labelledby="rvp-said-title">
      <ClientMap/>
      <div className="rvp-head"><span>02</span><i/><span>REVIEWS</span></div>
      <div className="rvp-top">
        <h2 suppressHydrationWarning id="rvp-said-title">What they <em>said.</em></h2>
        <div className="rvp-sum"><b>{average}</b><small>/ 5.0</small>{stars(Number(average))}<span>{reviews.length} reviews<br/>Collected direct · in their own words</span></div>
      </div>
      <div className="rvp-grid"><ApprovedReviews/>{reviews.map((r, i) => <article key={r.name} className={`rvp-rev ${i === 0 ? 'is-wide' : ''}`}>
        <header><span>R/{String(i + 1).padStart(2, '0')}</span><span className="rvp-score">{stars(Number(r.rating) || 5)}{Number(r.rating || 5).toFixed(1)}</span></header>
        <blockquote>“{withoutEmoji(r.quote)}”</blockquote>
        <footer><i>{r.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</i><div><strong>{r.name}</strong><span>{[r.company, r.location].filter(Boolean).join(' · ')}</span></div><time>{r.date ? short(r.date) : ''}</time></footer>
      </article>)}</div>
    </section>
  </main>;
}
