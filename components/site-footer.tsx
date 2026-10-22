'use client';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { bookingUrl, email, phone, socials } from '@/lib/content';

const columns = [
  { title: 'Explore', links: [['Home', '/'], ['Works', '/projects'], ['Certificates', '/certifications'], ['Reviews', '/reviews'], ['Connect', '/connect']] },
  { title: 'Websites', links: [['Website designer in Moradabad', '/website-designer-in-moradabad'], ['E-commerce websites', '/ecommerce-website-development'], ['For exporters', '/website-for-exporters-moradabad'], ['Website cost guide', '/website-cost-in-moradabad'], ['SEO & AI search', '/seo-services']] },
];
// A short footer: one invitation, three small lists, and a single closing line.
export function SiteFooter() {
  return <footer className="ft">
    <div className="ft-inner container">
      <section className="ft-cta" aria-labelledby="ft-title">
        <h2 suppressHydrationWarning id="ft-title">Got something <em>worth building?</em></h2>
        <div className="ft-actions">
          <Link href="/connect" className="ft-btn is-solid">Start a project <ArrowUpRight size={17}/></Link>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="ft-btn">Book a call <ArrowUpRight size={17}/></a>
        </div>
        <p className="ft-mail"><a href={`mailto:${email}?subject=Hello%20from%20your%20site`}>{email}</a><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer">{phone.label}</a></p>
      </section>
      <div className="ft-cols">
        {columns.map(c => <nav key={c.title} aria-label={c.title}>
          <span>{c.title}</span>
          {c.links.map(([label, url]) => <Link key={url} href={url}>{label}</Link>)}
        </nav>)}
        <nav aria-label="Connect">
          <span>Connect</span>
          {socials.map(s => <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>)}
        </nav>
      </div>
    </div>
    <p className="ft-legal container">© {new Date().getFullYear()} Rushan Haque</p>
  </footer>;
}
