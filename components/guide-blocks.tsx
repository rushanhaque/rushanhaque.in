import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import sourcePages from '@/content/source-pages.json';
import guides from '@/content/guides.json';
import type { Project } from '@/lib/content';
import { responsive } from '@/lib/images';
import { projectAccess, projectLink } from '@/lib/project-access';
import { jsonLd } from '@/lib/seo';
import { phone } from '@/lib/content';
import type { Section } from '@/lib/source-sections';

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
const Html = ({ html, className }: { html: string; className?: string }) => <p className={className} dangerouslySetInnerHTML={{ __html: html }}/>;
const pad = (i: number) => String(i + 1).padStart(2, '0');

// Every section shares one editorial grid: the label and heading on the left,
// the content on the right. Lists keep their heading pinned while they scroll.
function Sx({ kind, num, name, title, intro, introHtml, sticky, children }: { kind: string; num: string; name: string; title: string; intro?: string[]; introHtml?: string[]; sticky?: boolean; children?: React.ReactNode }) {
  return <section className={`sx sx-${kind}`}>
    <div className={`sx-head ${sticky ? 'is-sticky' : ''}`}>
      <div className="sx-label"><span>{num}</span><span className="sx-label-name">{name}</span><span/></div>
      <h2 suppressHydrationWarning dangerouslySetInnerHTML={{ __html: title }}/>
      {intro?.map((p, i) => <p key={i}>{p}</p>)}
      {introHtml?.map((p, i) => <Html key={i} html={p}/>)}
    </div>
    <div className="sx-body">{children}</div>
  </section>;
}

function Rows({ items }: { items: { title: string; num: string; html?: string[]; text?: string; href?: string }[] }) {
  return <ol className="sx-rows">{items.map(it => {
    // Imported lists keep their h3 headings; guide items keep their original number, bold title and text.
    const inner = it.html ? <>
      <h3 dangerouslySetInnerHTML={{ __html: it.title }}/>
      <span className="sx-n">{it.num}</span>
      {it.html.map((p, i) => <Html key={i} html={p}/>)}
    </> : <>
      <span className="sx-n">{it.num}</span>
      <strong className="sx-t">{it.title}</strong>
      <span className="sx-d">{it.text}</span>
      {it.href && <ArrowUpRight className="sx-go" size={22} strokeWidth={1.5} aria-hidden="true"/>}
    </>;
    return <li key={it.num}>{it.href ? <Anchor href={it.href} className="sx-row is-link">{inner}</Anchor> : <div className="sx-row">{inner}</div>}</li>;
  })}</ol>;
}

function Faqs({ faqs }: { faqs: { num: string; q: string; a: string[]; plain?: boolean }[] }) {
  return <div className="sx-faqs">{faqs.map(f => <details key={f.num}>
    <summary><span className="sx-faq-n">{f.num}</span><span dangerouslySetInnerHTML={{ __html: f.q }}/><span className="sx-faq-plus" aria-hidden="true"/></summary>
    <div className="sx-faq-a">{f.a.map((p, i) => f.plain ? <p key={i}>{p}</p> : <Html key={i} html={p}/>)}</div>
  </details>)}</div>;
}

// An imported section, laid out in the shared grid with every word unchanged.
export function SourceBlock({ section }: { section: Section }) {
  const s = section;
  switch (s.kind) {
    case 'lead': return <section className="sx-lead">
      <div className="sx-hidden" dangerouslySetInnerHTML={{ __html: s.crumb }}/>
      <div className="sx-hidden"><span>{s.num}</span><span>{s.name}</span></div>
      {s.facts.length > 0 && <ul className="sx-facts">{s.facts.map(([k, v]) => <li key={k}><span>{k}</span><b dangerouslySetInnerHTML={{ __html: v }}/></li>)}</ul>}
      <div className="sx-lead-body">
        <div>{s.paras.map((p, i) => <Html key={i} html={p}/>)}</div>
        <div className="sx-actions">{s.actions.map(a => <a key={a.href} href={a.href}><span>{a.text}</span></a>)}</div>
      </div>
    </section>;
    case 'list': return <Sx {...s} kind="list" sticky intro={undefined} introHtml={s.intro}><Rows items={s.items.map(i => ({ title: i.title, num: i.num, html: i.text }))}/></Sx>;
    case 'links': return <Sx {...s} kind="links" intro={undefined} introHtml={s.intro}><ul className="sx-pills">{s.links.map(l => <li key={l.href}><a href={l.href}>{l.text}</a></li>)}</ul></Sx>;
    case 'faq': return <Sx {...s} kind="faq" sticky intro={undefined} introHtml={s.intro}><Faqs faqs={s.faqs}/></Sx>;
    case 'prose': return <Sx {...s} kind="prose" intro={undefined}><div className="sx-prose">{s.intro.map((p, i) => <Html key={i} html={p}/>)}</div></Sx>;
    case 'cta': return <section className="sx-cta">
      <span className="sx-cta-label">{s.label}</span>
      {s.paras.map((p, i) => <Html key={i} html={p} className={i === 0 ? 'sx-cta-title' : undefined}/>)}
      <div className="sx-actions">{s.actions.map(a => <a key={a.href} href={a.href}><span>{a.text}</span></a>)}</div>
    </section>;
    default: return <section className="source-section" dangerouslySetInnerHTML={{ __html: s.html }}/>;
  }
}

// A section written for the guides, in the same grid.
export function GuideBlock({ section }: { section: GuideSection }) {
  const { label, title, body, items, table, steps, note, links } = section;
  const rich = !!(items || table || steps);
  return <Sx kind={items ? 'list' : 'prose'} sticky={!!items} num={label} name={title} title={title} intro={rich ? body : undefined}>
    {!rich && body && <div className="sx-prose">{body.map((p, i) => <p key={i}>{p}</p>)}</div>}
    {items && <Rows items={items.map((it, i) => ({ title: it.title, num: pad(i), text: it.text, href: it.href }))}/>}
    {table && <div className="guide-table" role="region" aria-label={title} tabIndex={0}><table>
      <thead><tr>{table.head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
      <tbody>{table.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c} data-label={table.head[c]}>{cell}</td>)}</tr>)}</tbody>
    </table></div>}
    {steps && <ol className="sx-steps">{steps.map((s, i) => <li key={s.title}><span>{pad(i)}</span><strong>{s.title}</strong><p>{s.text}</p></li>)}</ol>}
    {note && <p className="sx-note">{note}</p>}
    {links && <p className="sx-links">{links.map(([text, href]) => <Anchor key={href} href={href} className="sx-link">{text}<ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5}/></Anchor>)}</p>}
  </Sx>;
}

export function GuideLead({ facts, updated, lang }: { facts: string[][]; updated: string; lang?: string }) {
  const hi = lang === 'hi';
  return <section className="sx-lead">
    <ul className="sx-facts">{facts.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul>
    <div className="sx-lead-body">
      <p className="sx-updated">{hi ? 'अपडेट' : 'Updated'} <time dateTime={updated}>{new Date(updated + 'T00:00:00Z').toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</time> · Rushan Haque</p>
      <div className="sx-actions"><Link href="/connect"><span>{hi ? 'प्रोजेक्ट शुरू करें' : 'Start a project'}</span></Link><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer"><span>{hi ? 'WhatsApp करें' : 'WhatsApp me'}</span></a></div>
    </div>
  </section>;
}

export function FaqBlock({ label, faqs, title = 'Questions people actually ask' }: { label: string; faqs: { q: string; a: string }[]; title?: string }) {
  return <Sx kind="faq" sticky num={label} name="Questions" title={title}><Faqs faqs={faqs.map((f, i) => ({ num: pad(i), q: f.q, a: [f.a], plain: true }))}/></Sx>;
}

const domain = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };

// Live client sites, shown as quiet thumbnails.
export function RecentWork({ projects, title = 'Websites I’ve built recently.', label = 'Recent work' }: { projects: Project[]; title?: string; label?: string }) {
  const works = projects.filter(p => p.category === 'Client work' && p.image && projectAccess(p) === 'visit').slice(0, 4);
  if (!works.length) return null;
  return <section className="source-section source-work sx-work" aria-labelledby="source-work-title">
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
  const shown = guides.filter(g => !('hideOn' in g && (g.hideOn as string[]).includes(current)));
  const group = (name?: string) => shown.filter(g => ('group' in g ? g.group : undefined) === name);
  const industries = group('industry');
  const areas = [...sourcePages.filter(p => p.kind === 'Location').map(p => ({ slug: p.slug, title: p.title })), ...group('area')]
    .map(a => ({ slug: a.slug, name: a.title.replace('Website designer in ', '') })).sort((a, b) => a.name.localeCompare(b.name));
  return <nav className="container source-directory" aria-label="Explore services, guides and locations"><h2 suppressHydrationWarning>Explore</h2><div>
    <section><h3>Services</h3>{sourcePages.filter(p => p.kind === 'Service').map(p => link(p.slug, p.title))}</section>
    <section><h3>Guides</h3>{group(undefined).map(g => link(g.slug, g.lang === 'hi' ? `${g.title} (हिंदी)` : g.title))}</section>
    {industries.length > 0 && <section><h3>Industries</h3>{industries.map(g => link(g.slug, g.title.replace('Websites for ', '').replace(/^./, c => c.toUpperCase())))}</section>}
    <section><h3>Areas served</h3>{areas.map(a => link(a.slug, a.name))}</section>
  </div></nav>;
}

export function NextStep({ text, lang }: { text: string; lang?: string }) {
  const hi = lang === 'hi';
  return <section className="sx-cta">
    <span className="sx-cta-label">{hi ? 'अगला कदम' : 'Next step'}</span>
    <h2 suppressHydrationWarning className="sx-cta-title">{hi ? 'वेबसाइट बनवानी है?' : <>Got something <em>worth building?</em></>}</h2>
    <p>{text}</p>
    <div className="sx-actions"><Link href="/connect"><span>{hi ? 'प्रोजेक्ट शुरू करें' : 'Start a project'}</span></Link><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer"><span>{hi ? 'WhatsApp करें' : 'WhatsApp me'}</span></a></div>
  </section>;
}

// The last word, or what follows the final " in ", set in the serif: "Website designer in *Moradabad*".
export function accentTitle(title: string, lang?: string): [string, string] {
  if (lang === 'hi') return [title, ''];
  const i = title.lastIndexOf(' in ');
  if (i > 0) return [title.slice(0, i + 3), title.slice(i + 4)];
  const j = title.lastIndexOf(' ');
  return j > 0 ? [title.slice(0, j), title.slice(j + 1)] : [title, ''];
}
