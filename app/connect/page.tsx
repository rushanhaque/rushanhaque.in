import { jsonLd, pageMetadata, siteOrigin } from '@/lib/seo';
import { breadcrumbs, ids } from '@/lib/schema';
import { ArrowUpRight, CalendarCheck, Mail, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { email, phone, bookingUrl, address } from '@/lib/content';
import '@/app/connect.css';

export const metadata = pageMetadata('/connect', 'Get a website made — contact', 'Call, WhatsApp or email Rushan Haque, website designer and developer. Tell me what you need; I reply within a day.');

// Moradabad at zoom 12: a 7 x 5 block of OpenStreetMap tiles, baked once into one softened
// image (public/images/bg/moradabad-map.webp), so the backdrop is a single small local file.

export default function Connect() {
  const page = { '@context': 'https://schema.org', '@type': 'ContactPage', '@id': `${siteOrigin}/connect#page`, url: `${siteOrigin}/connect`, name: 'Contact Rushan Haque', isPartOf: { '@id': ids.website }, about: { '@id': ids.business }, mainEntity: { '@id': ids.business } };
  return <main id="main-content" className="cn">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([page, breadcrumbs([['Connect', '/connect']])]) }}/>
    <div className="cn-map" aria-hidden="true">
      <div className="cn-tiles"><img src="/images/bg/moradabad-map.webp" alt="" width={1792} height={1280} decoding="async" fetchPriority="low"/></div>

    </div>
    <small className="cn-credit">Map © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors</small>
    <div className="cn-grid">
      <section className="cn-intro" aria-labelledby="cn-title">
        <span className="cn-kicker">CONNECT</span>
        <h1 suppressHydrationWarning id="cn-title">So, what are we <em>building?</em></h1>
        <p>A project, a half-formed idea, or just hello. I reply to everything myself, usually within a day.</p>
        <div className="cn-direct">
          <a className="cn-card is-primary" href={phone.whatsapp} target="_blank" rel="noopener noreferrer">
            <span className="cn-icon"><MessageCircle size={22}/></span>
            <span className="cn-text"><small>WhatsApp, fastest</small><strong>{phone.label}</strong></span>
            <ArrowUpRight className="cn-go" size={20}/>
          </a>
          <a className="cn-card" href={`mailto:${email}?subject=Hello%20from%20your%20site`}>
            <span className="cn-icon"><Mail size={22}/></span>
            <span className="cn-text"><small>Email</small><strong>{email}</strong></span>
            <ArrowUpRight className="cn-go" size={20}/>
          </a>
        </div>
        <a className="cn-book" href={bookingUrl} target="_blank" rel="noopener noreferrer"><CalendarCheck size={20}/>Book a call<ArrowUpRight size={18}/><span className="sr-only"> (opens in a new tab)</span></a>
        <p className="cn-meta"><span>{address.label}</span></p>
      </section>
      <section className="cn-form" aria-label="Send a note"><ContactForm/></section>
    </div>
  </main>;
}
