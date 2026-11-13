import { Fragment, use, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { parseSection } from '../lib/sections'
import { seoPage } from '../lib/seoPage'
import { LEGAL, services, areas, industries, articles, titleFor } from '../lib/pages'
import { site } from '../config/site'
import { works } from '../data/content'
import { TLink } from '../components/Transition'
import Btn from '../components/Btn'
import Footer from '../components/Footer'
import NotFound from './NotFound'
import { ArrowUpRight, Plus, WhatsappLogo } from '../components/glyphs'

// The guides, service pages and area pages, with their words unchanged. These are for reading, so the
// house steps back: a bright wall, a faint lattice, a calm column of text.
const two = (n) => String(n).padStart(2, '0')
const fix = (href = '') => href.replace(/^\/connect\b/, '/contact').replace(/^\/projects\/?$/, '/work').replace(/^\/projects\//, '/work/').replace(/^\/reviews\b/, '/#reviews').replace(/^\/schedule\b/, '/contact').replace(/^\/certifications\b/, '/about')
const fixHtml = (html) => html.replace(/href="([^"]*)"/g, (_, h) => `href="${fix(h)}"`).replace(/, /g, ', ').replace(/—/g, ', ')
const Rich = ({ html, as: As = 'p', className }) => <As className={className} dangerouslySetInnerHTML={{ __html: fixHtml(html) }} />

function Go({ href, children, className }) {
  const to = fix(href)
  return /^https?:/.test(to)
    ? <a href={to} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
    : <TLink to={to} className={className}>{children}</TLink>
}

function Actions({ hi }) {
  return (
    <div className="lp__actions">
      <Btn to="/contact" variant="solid" title="Contact">{hi ? 'प्रोजेक्ट शुरू करें' : 'Start a project'}</Btn>
      <Btn href={site.phone.whatsapp} icon={WhatsappLogo}>{hi ? 'WhatsApp करें' : 'WhatsApp me'}</Btn>
    </div>
  )
}

function Facts({ facts }) {
  return <dl className="lp__facts">{facts.map(([k, v]) => <div key={k}><dt className="note">{k}</dt><dd dangerouslySetInnerHTML={{ __html: v }} /></div>)}</dl>
}

const decode = (t) => (typeof t === 'string' ? t.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, '’').replace(/&quot;/g, '"') : t)

function Sect({ label, title, children }) {
  return (
    <section className="lp__sec">
      <header className="lp__sechead">
        {label && <p className="note">{decode(label)}</p>}
        <h2 className="h3">{decode(title)}</h2>
      </header>
      <div className="lp__body">{children}</div>
    </section>
  )
}

function GuideSection({ s }) {
  return (
    <Sect label={s.label} title={s.title}>
      {s.body?.map((p, i) => <p key={i}>{p}</p>)}
      {s.items && (
        <ul className="lp__items">
          {s.items.map((it) => (
            <li key={it.title}>
              <h3>{it.href ? <Go href={it.href}>{it.title}</Go> : it.title}</h3>
              <p>{it.text}</p>
            </li>
          ))}
        </ul>
      )}
      {s.table && (
        <div className="lp__table" role="region" aria-label={s.title} tabIndex={0}>
          <table>
            <thead><tr>{s.table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{s.table.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => (c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}>{cell}</td>))}</tr>)}</tbody>
          </table>
        </div>
      )}
      {s.steps && <ol className="lp__steps">{s.steps.map((st, i) => <li key={st.title}><span className="note">{two(i + 1)}</span><div><strong>{st.title}</strong><p>{st.text}</p></div></li>)}</ol>}
      {s.note && <p className="note lp__note">{s.note}</p>}
      {s.links && <p className="lp__links">{s.links.map(([text, href]) => <Go key={href} href={href} className="lp__link">{text} <ArrowUpRight size={14} /></Go>)}</p>}
    </Sect>
  )
}

function Faqs({ faqs, label, title }) {
  return (
    <Sect label={label} title={title}>
      <div className="lp__faqs">
        {faqs.map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary>{decode(f.q)}<Plus size={18} /></summary>
            {(Array.isArray(f.a) ? f.a : [f.a]).map((a, k) => <Rich key={k} html={a} />)}
          </details>
        ))}
      </div>
    </Sect>
  )
}

function SourceSection({ s }) {
  switch (s.kind) {
    case 'lead': return (
      <section className="lp__lead">
        {s.facts.length > 0 && <Facts facts={s.facts} />}
        <div className="lp__leadbody">{s.paras.map((p, i) => <Rich key={i} html={p} />)}</div>
      </section>
    )
    case 'list': return (
      <Sect label={s.name || s.num} title={s.title}>
        {s.intro.map((p, i) => <Rich key={i} html={p} />)}
        <ul className="lp__items">{s.items.map((it) => <li key={it.title}><Rich as="h3" html={it.title} />{it.text.map((p, k) => <Rich key={k} html={p} />)}</li>)}</ul>
      </Sect>
    )
    case 'links': return (
      <Sect label={s.name || s.num} title={s.title}>
        {s.intro.map((p, i) => <Rich key={i} html={p} />)}
        <p className="lp__links">{s.links.map((l) => <Go key={l.href} href={l.href} className="lp__link">{decode(l.text)} <ArrowUpRight size={14} /></Go>)}</p>
      </Sect>
    )
    case 'faq': return <Faqs faqs={s.faqs} label={s.num} title={s.title} />
    case 'prose': return <Sect label={s.name || s.num} title={s.title}>{s.intro.map((p, i) => <Rich key={i} html={p} />)}</Sect>
    case 'cta': return (
      <section className="lp__cta">
        <p className="note">{s.label}</p>
        {s.paras.map((p, i) => <Rich key={i} html={p} />)}
        <Actions />
      </section>
    )
    default: return <div className="lp__raw" dangerouslySetInnerHTML={{ __html: fixHtml(s.html) }} />
  }
}

function RecentWork({ hi }) {
  return (
    <section className="lp__sec lp__work">
      <header className="lp__sechead"><h2 className="h3">{hi ? 'हाल में बनाई गई वेबसाइटें' : 'Websites I’ve built recently.'}</h2></header>
      <ul className="lp__shots">
        {works.slice(0, 4).map((w) => (
          <li key={w.slug}>
            <TLink to={`/work/${w.slug}`} title={w.short} data-cursor="View">
              <img src={w.image.replace('.webp', '-800.webp')} alt={`${w.title} website`} width={w.w} height={w.h} loading="lazy" decoding="async" />
              <strong>{w.title}</strong>
              <span>{w.description}</span>
            </TLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

function NextStep({ text, hi }) {
  return (
    <section className="lp__cta">
      <h2 className="h2">{hi ? 'वेबसाइट बनवानी है?' : 'Got something worth building?'}</h2>
      {text && <p className="lede">{text}</p>}
      <Actions hi={hi} />
    </section>
  )
}

export function Directory({ current }) {
  const link = (slug, text) => <li key={slug}><TLink to={`/${slug}`} aria-current={slug === current ? 'page' : undefined}>{text}</TLink></li>
  return (
    <nav className="lp__dir" aria-label="Explore services, guides and areas">
      <section><h3 className="note">Services</h3><ul>{services.map((p) => link(p.slug, p.title))}</ul></section>
      <section><h3 className="note">Guides</h3><ul>{articles.map((g) => link(g.slug, g.lang === 'hi' ? `${g.title} (हिंदी)` : g.title))}</ul></section>
      <section><h3 className="note">Industries</h3><ul>{industries.map((g) => link(g.slug, g.title.replace('Websites for ', '').replace(/^./, (c) => c.toUpperCase())))}</ul></section>
      <section className="is-areas"><h3 className="note">Areas served</h3><ul>{areas.map((a) => link(a.slug, a.name))}</ul></section>
    </nav>
  )
}

function Legal({ slug }) {
  const mail = <a href={`mailto:${site.email}`}>{site.email}</a>
  return slug === 'privacy' ? (
    <div className="lp__prose">
      <h2 className="h4">What I collect</h2><p>The contact and quote forms send the details you enter (how to reach you, your message and, on a quote request, your name, business and team size) to my inbox through Formspree; if it can’t, it opens your email or WhatsApp instead. I use them only to reply.</p>
      <h2 className="h4">Tracking</h2><p>No analytics, no advertising trackers and no tracking cookies.</p>
      <h2 className="h4">Your data</h2><p>To ask about or delete your information, email {mail}.</p>
    </div>
  ) : (
    <div className="lp__prose">
      <h2 className="h4">Motion</h2><p>The site uses animation throughout. Every page works with the keyboard, all content stays readable, and with reduced motion switched on the animations step aside.</p>
      <h2 className="h4">Navigation</h2><p>There is a skip link, visible keyboard focus, labelled forms and full browser zoom.</p>
      <h2 className="h4">Something in the way?</h2><p>Email {mail} with the page and the issue.</p>
    </div>
  )
}

export default function Landing() {
  const { slug } = useParams()
  return titleFor(slug) ? <LandingPage slug={slug} key={slug} /> : <NotFound />
}

function LandingPage({ slug }) {
  const root = useRef(null)
  useReveals(root)
  // this page's words alone, from its own file (lib/seoPage.js); the legal pages carry theirs here
  const data = LEGAL[slug] ? null : use(seoPage(slug))
  const guide = data?.guide
  const page = !guide && data?.page
  const legal = !guide && !page && LEGAL[slug]
  const hi = guide?.lang === 'hi'
  const headTitle = data?.title || (legal && (legal.title.length + 15 <= 70 ? `${legal.title} | Rushan Haque` : legal.title))
  const headDescription = guide?.description || page?.description || legal?.description
  useEffect(() => {
    if (headTitle) document.title = headTitle
    document.head.querySelector('meta[name="description"]')?.setAttribute('content', headDescription)
    document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', `${site.url}/${slug}`)
    if (hi) document.documentElement.lang = 'hi'
    return () => { document.documentElement.lang = 'en' }
  }, [slug, hi, headTitle, headDescription])
  useChapter(root, { id: 'reading', name: 'The reading room', hidden: true, time: [10.6, 12.4] })

  const title = guide?.title || page?.title || legal?.title
  const eyebrow = guide?.eyebrow || page?.kind || legal?.title
  const intro = (guide?.intro || (page && page.description.split(/(?<=[.!?])\s+/)[0]) || legal?.description)?.replace(/ — /g, ', ')

  let body
  if (guide) {
    body = (
      <>
        <section className="lp__lead">
          <Facts facts={guide.facts} />
          <div className="lp__leadbody">
            <p className="note">{hi ? 'अपडेट' : 'Updated'} <time dateTime={guide.updated}>{new Date(guide.updated + 'T00:00:00Z').toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>. Rushan Haque.</p>
            <Actions hi={hi} />
          </div>
        </section>
        {guide.sections.map((s, i) => <GuideSection key={i} s={s} />)}
        <RecentWork hi={hi} />
        <Faqs faqs={guide.faqs} label={two(guide.sections.length + 1)} title={hi ? 'अक्सर पूछे जाने वाले सवाल' : 'What clients ask'} />
        <NextStep text={guide.cta} hi={hi} />
      </>
    )
  } else if (page) {
    const sections = page.sections.map(parseSection)
    const extra = data.extra
    const at = Math.max(0, sections.findIndex((s) => s.kind === 'faq'))
    body = sections.map((s, i) => (
      <Fragment key={i}>
        {i === (at || sections.length - 1) && extra?.sections.map((x, k) => <GuideSection key={`x${k}`} s={x} />)}
        {i === (at || sections.length - 1) && <RecentWork />}
        <SourceSection s={s} />
      </Fragment>
    ))
  } else {
    body = <Legal slug={slug} />
  }

  return (
    <div className="lpage" ref={root}>
      <article className="lp wrap" lang={hi ? 'hi' : undefined} data-tone="ivory">
        <header className="lp__intro">
          <nav className="lp__crumb note" aria-label="Breadcrumb"><TLink to="/" title="Home">{hi ? 'होम' : 'Home'}</TLink><span aria-hidden="true">/</span><span aria-current="page">{eyebrow}</span></nav>
          <h1 className="h1 lp__title">{title}</h1>
          {intro && <p className="lede">{intro}</p>}
        </header>
        {body}
      </article>
      {!legal && <div className="wrap lp__explore"><h2 className="h3">Explore</h2><Directory current={slug} /></div>}
      <Footer dark />
    </div>
  )
}
