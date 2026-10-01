import { pageMetadata } from '@/lib/seo';
import Link from '@/components/site-link';
import { ArrowUpRight,Clock,Video } from 'lucide-react';
import { setting } from '@/lib/admin';
import { InquiryForm } from '@/components/inquiry-form';
import { bookingUrl } from '@/lib/content';
export const metadata=pageMetadata('/schedule','Schedule a conversation','Request a time to talk with Rushan Haque.');
export const dynamic="force-dynamic";
export default function Schedule(){const configured=setting("CAL_BOOKING_URL")||bookingUrl;let booking="";try{const url=new URL(configured);if(url.protocol==="https:"&&["cal.com","www.cal.com","calendly.com","www.calendly.com"].includes(url.hostname))booking=url.href;}catch{}return <main id="main-content" className="container contact-layout schedule-layout"><div className="contact-intro"><span className="eyebrow">SCHEDULE</span><h1 data-reveal>Let’s<br/><em>talk.</em></h1><p>Thirty minutes on video. Bring the problem; we’ll work out the rest together.</p><div className="call-details"><span><Clock size={17}/>30 minutes</span><span><Video size={17}/>Video call</span></div><Link href="/contact" className="text-link">Send an enquiry instead <ArrowUpRight size={16}/></Link></div>{booking?<section className="inquiry-form"><h2>Choose a time that works.</h2><p className="form-helper">See live availability in your timezone.</p><a className="button primary" href={booking} target="_blank" rel="noopener noreferrer">Open calendar <ArrowUpRight size={18}/></a><p className="form-helper">Prefer email? <a href="mailto:rushanulhaque@gmail.com">Write to me.</a></p></section>:<InquiryForm kind="call"/>}</main>;}
