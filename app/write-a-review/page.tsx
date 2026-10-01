import { pageMetadata } from '@/lib/seo';
import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import { InquiryForm } from '@/components/inquiry-form';
export const metadata=pageMetadata('/write-a-review','Share your experience','Worked with Rushan? Leave a review.');
export default function Review(){return <main id="main-content" className="container contact-layout"><div className="contact-intro"><span className="eyebrow">REVIEW</span><h1 data-reveal>How was<br/><em>working together?</em></h1><p>Be candid. Flattery is optional, and criticism gets published too.</p><Link href="/reviews" className="text-link">Read reviews <ArrowUpRight size={16}/></Link></div><InquiryForm kind="review"/></main>;}
