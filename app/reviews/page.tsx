import { ApprovedReviews } from '@/components/approved-reviews';
import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import { PageIntro } from '@/components/page-intro';
import { getPublishedContent } from '@/lib/published-content';
import { pageMetadata } from '@/lib/seo';

// Approved reviews come from the database, so this page renders per request.
export const dynamic='force-dynamic';
export const metadata=pageMetadata('/reviews','A few kind words','Words from people who have worked with Rushan Haque.');
export default async function Reviews(){const {reviews}=await getPublishedContent();
  return <main id="main-content"><PageIntro eyebrow="KIND WORDS / SHARED EXPERIENCES" title="The work matters." accent="So do the people." description="A few words from people I’ve worked with, originally shared on my portfolio."/><section className="container review-grid"><ApprovedReviews/>{reviews.map(r=><article className="review-card fx-spot" data-reveal key={r.name}><blockquote>“{r.quote}”</blockquote><div className="review-person"><span className="review-avatar">{r.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span><div><strong>{r.name}</strong><span>{r.company}</span></div></div></article>)}</section><div className="container section"><Link href="/write-a-review" className="button primary">Worked together? Share your experience <ArrowUpRight size={17}/></Link></div></main>;
}
