import { pageMetadata } from '@/lib/seo';
import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import { InquiryForm } from '@/components/inquiry-form';
export const metadata=pageMetadata('/write-a-review','Share your experience','Worked with Rushan? Share a review of your experience.');
export default function Review(){return <main id="main-content" className="container contact-layout"><div className="contact-intro"><span className="eyebrow">A FEW WORDS / FROM YOUR SIDE</span><h1 data-reveal>Good work<br/>gets<br/><em>better together.</em></h1><p>If we’ve worked together, I’d love to know how it felt. Your honest perspective helps shape what comes next.</p><Link href="/reviews" className="text-link">Read shared experiences <ArrowUpRight size={16}/></Link></div><InquiryForm kind="review"/></main>;}
