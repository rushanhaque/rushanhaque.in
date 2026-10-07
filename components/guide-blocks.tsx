import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import sourcePages from '@/content/source-pages.json';
import guides from '@/content/guides.json';
import type { Project } from '@/lib/content';
import { responsive } from '@/lib/images';
import { projectAccess, projectLink } from '@/lib/project-access';
import { jsonLd } from '@/lib/seo';
import { phone } from '@/lib/content';

export type GuideSection = {
  label: string; title: string; body?: string[]; note?: string;
  items?: { title: string; text: string; href?: string }[];
  table?: { head: string[]; rows: string[][] };
  steps?: { title: string; text: string }[];
  links?: string[][];
};

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }}/>;
}

const external = (href: string) => /^https?:/.test(href);
function Anchor({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return external(href)
    ? <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}<span className="sr-only"> (opens in a new tab)</span></a>
    : <Link href={href} className={className}>{children}</Link>;
}

// One numbered section in the same visual language as the imported pages.
export function GuideBlock({ section }: { section: GuideSection }) {
  const { label, title, body, items, table, steps, note, links } = section;
  return <section className="source-section guide-section">
    <div className="source-section-label"><span>{label}</span><span>{title}</span><span/></div>
    <h2 suppressHydrationWarning>{title}</h2>
    {body?.map((p, i) => <p key={i}>{p}</p>)}
    {items && <ul className="guide-items">{items.map((it, i) => <li key={it.title}>
      {it.href ? <Anchor href={it.href} className="guide-item is-link"><span className="guide-item-n">{String(i + 1).padStart(2, '0')}</span><strong>{it.title}</strong><span className="guide-item-text">{it.text}</span><ArrowUpRight aria-hidden="true" className="guide-item-go" size={18} strokeWidth={1.5}/></Anchor>
        : <div className="guide-item"><span className="guide-item-n">{String(i + 1).padStart(2, '0')}</span><strong>{it.title}</strong><span className="guide-item-text">{it.text}</span></div>}
    </li>)}</ul>}
    {table && <div className="guide-table" role="region" aria-label={title} tabIndex={0}><table>
      <thead><tr>{table.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
      <tbody>{table.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c} data-label={table.head[c]}>{cell}</td>)}</tr>)}</tbody>
    </table></div>}
    {steps && <ol className="guide-steps">{steps.map((s, i) => <li key={s.title}><span>{String(i + 1).padStart(2, '0')}</span><strong>{s.title}</strong><p>{s.text}</p></li>)}</ol>}
    {note && <p className="guide-note">{note}</p>}
    {links && <p className="guide-links">{links.map(([text, href]) => <Anchor key={href} href={href} className="guide-link">{text}<ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5}/></Anchor>)}</p>}
  </section>;
}

export function FaqBlock({ label, faqs, title = 'Questions people actually ask' }: { label: string; faqs: { q: string; a: string }[]; title?: string }) {
  return <section className="source-section">
    <div className="source-section-label"><span>{label}</span><span>Questions</span><span/></div>
    <h2 suppressHydrationWarning>{title}</h2>
    <div className="source-faq">{faqs.map((f, i) => <details key={f.q}><summary><span className="source-question-number">{String(i + 1).padStart(2, '0')}</span><span>{f.q}</span><span/></summary><div><p>{f.a}</p></div></details>)}</div>
  </section>;
}

const domain = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };

// Live client sites, shown as quiet thumbnails.
export function RecentWork({ projects, title = 'Websites I’ve built recently.', label = 'Recent work' }: { projects: Project[]; title?: string; label?: string }) {
  const works = projects.filter(p => p.category === 'Client work' && p.image && projectAccess(p) === 'visit').slice(0, 4);
  if (!works.length) return null;
  return <section className="source-section source-work" aria-labelledby="source-work-title">
    <div className="source-section-label"><span>{label}</span><span>{label}</span><span/></div>
    <div className="source-work-head"><h2 suppressHydrationWarning id="source-work-title">{title}</h2><Link href="/projects" className="source-work-all">See all work</Link></div>
    <ul className="source-work-grid">{works.map(w => <li key={w.slug}><a {...projectLink(w)} className="source-work-card">
      <span className="source-work-image"><img src={w.image!} {...responsive(w.image, '(max-width: 650px) 46vw, 520px')} alt={`${w.title} website`} width="1600" height="1000" loading="lazy" decoding="async"/></span>
      <span className="source-work-meta"><strong>{w.title}</strong><span>{domain(w.url)}<span className="sr-only"> (opens in a new tab)</span></span></span>
      <span className="source-work-desc">{w.description}</span>
    </a></li>)}</ul>
  </section>;
}

export function Directory({ current }: { current: string }) {
  const link = (slug: string, text: string) => <Link key={slug} href={'/' + slug} aria-current={slug === current ? 'page' : undefined}>{text}<ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5}/></Link>;
  return <nav className="container source-directory" aria-label="Explore services, guides and locations"><h2 suppressHydrationWarning>Explore</h2><div>
    <section><h3>Services</h3>{sourcePages.filter(p => p.kind === 'Service').map(p => link(p.slug, p.title))}</section>
    <section><h3>Guides</h3>{guides.map(g => link(g.slug, g.lang === 'hi' ? `${g.title} (हिंदी)` : g.title))}</section>
    <section><h3>Areas served</h3>{sourcePages.filter(p => p.kind === 'Location').map(p => link(p.slug, p.title.replace('Website designer in ', '')))}</section>
  </div></nav>;
}

export function NextStep({ text, lang }: { text: string; lang?: string }) {
  const hi = lang === 'hi';
  return <section className="source-section guide-next">
    <div className="source-section-label"><span>{hi ? 'अगला कदम' : 'Next step'}</span><span/><span/></div>
    <h2 suppressHydrationWarning>{hi ? 'वेबसाइट बनवानी है?' : <>Got something <em>worth building?</em></>}</h2>
    <p>{text}</p>
    <div className="source-actions"><Link href="/connect">{hi ? 'प्रोजेक्ट शुरू करें' : 'Start a project'}</Link><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer">{hi ? 'WhatsApp करें' : 'WhatsApp me'}</a></div>
  </section>;
}
