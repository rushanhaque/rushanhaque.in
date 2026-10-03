import { pageMetadata } from '@/lib/seo';
import { ArrowUpRight } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { CopyEmail } from '@/components/interactive';
import { email, phone, bookingUrl } from '@/lib/content';
export const metadata=pageMetadata('/contact','Start a conversation','Tell Rushan about your next website or project.');
export default function Contact(){return <main id="main-content" className="container contact-layout"><div className="contact-intro"><span className="eyebrow">CONTACT</span><h1 data-reveal>So, what<br/>are we<br/><em>building?</em></h1><p>A project, a half-formed idea, or just hello. I read and answer everything myself, usually within a day.</p><div className="contact-email"><a href={`mailto:${email}`}>{email}</a><CopyEmail/></div><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer" className="text-link">WhatsApp {phone.label} <ArrowUpRight size={16}/></a><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-link">Schedule a call <ArrowUpRight size={16}/></a><span className="contact-location">MORADABAD, INDIA</span></div><ContactForm/></main>;}
