import { pageMetadata } from '@/lib/seo';
import { Star } from 'lucide-react';
import { ReviewForm } from '@/components/review-form';
import { ApprovedReviews } from '@/components/approved-reviews';
import { getPublishedContent } from '@/lib/published-content';
import '@/app/review-page.css';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('/reviews', 'Reviews', 'What people said about working with Rushan Haque, and a place to add your own.');

const short = (d: string) => { const m = d.match(/^(\w{3})\w*\s+(\d{4})$/); return m ? `${m[1].toUpperCase()} ’${m[2].slice(2)}` : d.toUpperCase(); };
const stars = (n: number) => <span className="rvp-stars" aria-label={`${n} out of 5`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill={i < Math.round(n) ? 'currentColor' : 'none'} strokeWidth={1.5}/>)}</span>;

export default async function WriteReview() {
  const { reviews } = await getPublishedContent();
  const ratings = reviews.map(r => Number(r.rating)).filter(Boolean);
  const average = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';
  const row = 'DEVELOPER/WRITER/';
  return <main id="main-content" className="rvp">
    <section className="rvp-hero">
      <div className="rvp-marquee" aria-hidden="true">{[0, 1, 2].map(i => <div key={i} className={`rvp-row ${i === 1 ? 'is-reverse' : ''}`}><span>{row.repeat(6)}</span><span>{row.repeat(6)}</span></div>)}</div>
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
      <div className="rvp-head"><span>02</span><i/><span>REVIEWS</span></div>
      <div className="rvp-top">
        <h2 suppressHydrationWarning id="rvp-said-title">What they <em>said.</em></h2>
        <div className="rvp-sum"><b>{average}</b><small>/ 5.0</small>{stars(Number(average))}<span>{reviews.length} reviews<br/>Collected direct · published unedited</span></div>
      </div>
      <div className="rvp-grid"><ApprovedReviews/>{reviews.map((r, i) => <article key={r.name} className={`rvp-rev ${i === 0 ? 'is-wide' : ''}`}>
        <header><span>R/{String(i + 1).padStart(2, '0')}</span><span className="rvp-score">{stars(Number(r.rating) || 5)}{Number(r.rating || 5).toFixed(1)}</span></header>
        <blockquote>“{r.quote}”</blockquote>
        <footer><i>{r.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</i><div><strong>{r.name}</strong><span>{[r.company, r.location].filter(Boolean).join(' · ')}</span></div><time>{r.date ? short(r.date) : ''}</time></footer>
      </article>)}</div>
    </section>
  </main>;
}
