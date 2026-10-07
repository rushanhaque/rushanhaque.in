import { pageMetadata } from '@/lib/seo';
import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { email, phone, bookingUrl, address } from '@/lib/content';
import '@/app/connect.css';

export const metadata = pageMetadata('/connect', 'Get a website made — contact', 'Call, WhatsApp or email Rushan Haque, website designer and developer in Moradabad. Tell me what you need; I reply within a day.');

// Moradabad at zoom 12, a 7 x 5 block of OpenStreetMap tiles centred on the city; it is only a soft backdrop.
const TILE = { z: 12, x: 2944, y: 1705 };
const tiles = Array.from({ length: 35 }, (_, i) => ({ x: TILE.x - 3 + (i % 7), y: TILE.y - 2 + Math.floor(i / 7) }));

export default function Connect() {
  return <main id="main-content" className="cn">
    <div className="cn-map" aria-hidden="true">
      <div className="cn-tiles">{tiles.map(t => <img key={`${t.x}-${t.y}`} src={`https://tile.openstreetmap.org/${TILE.z}/${t.x}/${t.y}.png`} alt="" width={256} height={256} loading="lazy" decoding="async" referrerPolicy="origin"/>)}</div>

    </div>
    <div className="cn-grid">
      <section className="cn-intro" aria-labelledby="cn-title">
        <span className="cn-kicker">CONNECT</span>
        <h1 suppressHydrationWarning id="cn-title">So, what are we <em>building?</em></h1>
        <p>A project, a half-formed idea, or just hello. I answer everything myself, usually within a day.</p>
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
        <p className="cn-meta"><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-link">Book a call <ArrowUpRight size={15}/></a><span>{address.label}</span></p>
      </section>
      <section className="cn-form" aria-label="Send a note"><ContactForm/></section>
    </div>
  </main>;
}
