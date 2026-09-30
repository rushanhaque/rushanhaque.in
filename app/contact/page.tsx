import { pageMetadata } from '@/lib/seo';
import { ArrowUpRight } from 'lucide-react';
import { InquiryForm } from '@/components/inquiry-form';
import { CopyEmail } from '@/components/interactive';
import { email, phone, bookingUrl } from '@/lib/content';
export const metadata=pageMetadata('/contact','Start a conversation','Tell Rushan about your next website, digital product, or creative collaboration.');
export default function Contact(){return <main id="main-content" className="container contact-layout"><div className="contact-intro"><span className="eyebrow">CONTACT / EVERY GOOD THING STARTS SOMEWHERE</span><h1 data-reveal>Something<br/>on your<br/><em>mind?</em></h1><p>A clear brief. A half-formed idea.<br/>A beautifully ambitious what if.<br/>I’d like to hear it.</p><div className="contact-email"><a href={`mailto:${email}`}>{email}</a><CopyEmail/></div><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer" className="text-link">WhatsApp {phone.label} <ArrowUpRight size={16}/></a><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-link">Prefer a conversation? Schedule a call <ArrowUpRight size={16}/></a><span className="contact-location">MORADABAD, INDIA · WORKING EVERYWHERE</span></div><InquiryForm kind="contact"/></main>;}
