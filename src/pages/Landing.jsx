import { Fragment, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useReveals } from '../lib/useReveals'
import { parseSection } from '../lib/sections'
import { guideBySlug, sourceBySlug, extraFor, LEGAL, services, areas, industries, articles } from '../lib/seo'
import { site } from '../config/site'
import { works } from '../data/content'
import { small, srcSet } from '../lib/img'
import { TLink } from '../components/Transition'
import { Kicker } from '../components/Head'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import NotFound from './NotFound'

const two = (n) => String(n).padStart(2, '0')
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
// links carried over from the previous site, pointed at where those pages live now
const fix = (href = '') => href.replace(/^\/connect\b/, '/contact').replace(/^\/projects\/?$/, '/work').replace(/^\/projects\//, '/work/').replace(/^\/reviews\b/, '/#reviews').replace(/^\/schedule\b/, '/contact').replace(/^\/certifications\b/, '/about')
const fixHtml = (html) => html.replace(/href="([^"]*)"/g, (_, h) => `href="${fix(h)}"`)
const Rich = ({ html, as: As = 'p', className }) => <As className={className} dangerouslySetInnerHTML={{ __html: fixHtml(html) }} />

function Go({ href, children, className }) {
  const to = fix(href)
  return /^https?:/.test(to)
    ? <a href={to} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
    : <TLink to={to} className={className}>{children}</TLink>
}

// "Website designer in *Moradabad*": the place, or the last word, set in the serif
function accent(title, hi) {
  if (hi) return [title, '']
  const i = title.lastIndexOf(' in ')
  if (i > 0) return [title.slice(0, i + 3), title.slice(i + 4)]
  const j = title.lastIndexOf(' ')
  return j > 0 ? [title.slice(0, j), title.slice(j + 1)] : [title, '']
}

function Intro({ eyebrow, title, intro, hi, crumb }) {
  const [lead, em] = accent(title, hi)
  return (
    <header className="lp__intro">
      <nav className="lp__crumb" aria-label="Breadcrumb"><TLink to="/">{hi ? 'होम' : 'Home'}</TLink><span aria-hidden="true">/</span><span aria-current="page">{crumb || title}</span></nav>
      <Kicker label={eyebrow} />
      <h1 className="lp__title">{lead}{em && <>{' '}<em>{em}</em></>}</h1>
      {intro && <p className="lp__lede">{intro}</p>}
    </header>
  )
}

function Actions({ hi }) {
  return (
    <div className="lp__actions">
      <TLink to="/contact" className="lp__btn is-solid">{hi ? 'प्रोजेक्ट शुरू करें' : 'Start a project'} <Icon name="arrowUpRight" size={15} /></TLink>
      <a href={site.phone.whatsapp} className="lp__btn" target="_blank" rel="noopener noreferrer">{hi ? 'WhatsApp करें' : 'WhatsApp me'} <Icon name="whatsapp" size={15} /></a>
    </div>
  )
}

function Facts({ facts }) {
  return <dl className="lp__facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd dangerouslySetInnerHTML={{ __html: v }} /></div>)}</dl>
}

function Head2({ num, name, title }) {
  return (
    <div className="lp__head">
      <span className="lp__num">{num}{name && name !== num && <> · {name}</>}</span>
      <h2>{title}</h2>
    </div>
  )
}

/** One section of a guide, from its JSON. */
function GuideSection({ s }) {
  return (
    <section className="lp__sec">
      <Head2 num={s.label} title={s.title} />
      <div className="lp__body">
        {s.body?.map((p, i) => <p key={i}>{p}</p>)}
        {s.items && (
          <ul className="lp__items">
            {s.items.map((it, i) => (
              <li key={it.title}>
                <span className="lp__inum">{two(i + 1)}</span>
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
              <tbody>{s.table.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => (c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c} data-label={s.table.head[c]}>{cell}</td>))}</tr>)}</tbody>
            </table>
          </div>
        )}
        {s.steps && <ol className="lp__steps">{s.steps.map((st, i) => <li key={st.title}><span>{two(i + 1)}</span><strong>{st.title}</strong><p>{st.text}</p></li>)}</ol>}
        {s.note && <p className="lp__note">{s.note}</p>}
        {s.links && <p className="lp__links">{s.links.map(([text, href]) => <Go key={href} href={href} className="lp__link">{text} <Icon name="arrowUpRight" size={14} /></Go>)}</p>}
      </div>
    </section>
  )
}

function Faqs({ faqs, num, title }) {
  return (
    <section className="lp__sec">
      <Head2 num={num} name={null} title={title} />
      <div className="lp__body lp__faqs">
        {faqs.map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary><span>{two(i + 1)}</span>{f.q}</summary>
            {(Array.isArray(f.a) ? f.a : [f.a]).map((a, k) => <Rich key={k} html={a} />)}
          </details>
        ))}
      </div>
    </section>
  )
}

/** One section of an imported service or area page, parsed without changing a word. */
function SourceSection({ s }) {
  switch (s.kind) {
    case 'lead': return (
      <section className="lp__lead">
        {s.facts.length > 0 && <Facts facts={s.facts} />}
        <div className="lp__lead-body">{s.paras.map((p, i) => <Rich key={i} html={p} />)}</div>
      </section>
    )
    case 'list': return (
      <section className="lp__sec">
        <Head2 num={s.num} name={s.name} title={s.title} />
        <div className="lp__body">
          {s.intro.map((p, i) => <Rich key={i} html={p} />)}
          <ul className="lp__items">{s.items.map((it, i) => <li key={it.title}><span className="lp__inum">{it.num || two(i + 1)}</span><h3>{it.title}</h3>{it.text.map((p, k) => <Rich key={k} html={p} />)}</li>)}</ul>
        </div>
      </section>
    )
    case 'links': return (
      <section className="lp__sec">
        <Head2 num={s.num} name={s.name} title={s.title} />
        <div className="lp__body">{s.intro.map((p, i) => <Rich key={i} html={p} />)}<p className="lp__links">{s.links.map((l) => <Go key={l.href} href={l.href} className="lp__link">{l.text} <Icon name="arrowUpRight" size={14} /></Go>)}</p></div>
      </section>
    )
    case 'faq': return <Faqs faqs={s.faqs} num={s.num} title={s.title} />
    case 'prose': return (
      <section className="lp__sec"><Head2 num={s.num} name={s.name} title={s.title} /><div className="lp__body">{s.intro.map((p, i) => <Rich key={i} html={p} />)}</div></section>
    )
    case 'cta': return (
      <section className="lp__cta">
        <span className="lp__num">{s.label}</span>
        {s.paras.map((p, i) => <Rich key={i} html={p} />)}
        <Actions />
      </section>
    )
    default: return <div className="lp__raw" dangerouslySetInnerHTML={{ __html: fixHtml(s.html) }} />
  }
}

/** Live client sites, each linking to its case study. */
function RecentWork({ hi }) {
  return (
    <section className="lp__sec lp__work">
      <Head2 num="—" title={hi ? 'हाल में बनाई गई वेबसाइटें' : 'Websites I’ve built recently.'} />
      <ul className="lp__shots">
        {works.slice(0, 4).map((w) => (
          <li key={w.slug}>
            <TLink to={`/work/${w.slug}`} label={w.title}>
              <img src={small(w.image)} srcSet={srcSet(w.image)} sizes="(max-width: 899px) 92vw, 40vw" alt={`${w.title} website`} width={w.w} height={w.h} loading="lazy" decoding="async" />
              <span className="lp__shot-meta"><strong>{w.title}</strong><span>{host(w.url)}</span></span>
              <span className="lp__shot-desc">{w.description}</span>
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
      <span className="lp__num">{hi ? 'अगला कदम' : 'Next step'}</span>
      <h2>{hi ? 'वेबसाइट बनवानी है?' : <>Got something <em>worth building?</em></>}</h2>
      {text && <p>{text}</p>}
      <Actions hi={hi} />
    </section>
  )
}

/** Every service, guide, industry and area, so each page leads on to the rest. */
export function Directory({ current }) {
  const link = (slug, text) => <li key={slug}><TLink to={`/${slug}`} aria-current={slug === current ? 'page' : undefined}>{text}</TLink></li>
  return (
    <nav className="lp__dir" aria-label="Explore services, guides and areas">
      <h2>Explore</h2>
      <div>
        <section><h3>Services</h3><ul>{services.map((p) => link(p.slug, p.title))}</ul></section>
        <section><h3>Guides</h3><ul>{articles.map((g) => link(g.slug, g.lang === 'hi' ? `${g.title} (हिंदी)` : g.title))}</ul></section>
        <section><h3>Industries</h3><ul>{industries.map((g) => link(g.slug, g.title.replace('Websites for ', '').replace(/^./, (c) => c.toUpperCase())))}</ul></section>
        <section className="is-areas"><h3>Areas served</h3><ul>{areas.map((a) => link(a.slug, a.name))}</ul></section>
      </div>
    </nav>
  )
}

function Legal({ slug }) {
  const mail = <a href={`mailto:${site.email}`}>{site.email}</a>
  return slug === 'privacy' ? (
    <div className="lp__prose">
      <h2>What I collect</h2><p>The contact form sends the details you enter (your name, how to reach you and your message) to my inbox through Formspree; if it can’t, it opens your email or WhatsApp instead. I use them only to reply.</p>
      <h2>Tracking</h2><p>No analytics, no advertising trackers and no tracking cookies.</p>
      <h2>Your data</h2><p>To ask about or delete your information, email {mail}.</p>
    </div>
  ) : (
    <div className="lp__prose">
      <h2>Motion</h2><p>The site uses animation throughout. Every page works with the keyboard, all content stays readable, and with reduced motion switched on the animations step aside.</p>
      <h2>Navigation</h2><p>There is a skip link, visible keyboard focus, labelled forms, a contents page and full browser zoom.</p>
      <h2>Something in the way?</h2><p>Email {mail} with the page and the issue.</p>
    </div>
  )
}

/**
 * The guides, service pages and area pages carried over from the previous site, with their
 * words unchanged, laid out in this site's style. They are kept out of the main navigation and
 * listed in the footer's small directory.
 */
export default function Landing() {
  const { slug } = useParams()
  const root = useRef(null)
  useReveals(root, 'ivory')
  const guide = guideBySlug(slug)
  const page = !guide && sourceBySlug(slug)
  const legal = !guide && !page && LEGAL[slug]
  if (!guide && !page && !legal) return <NotFound />
  const hi = guide?.lang === 'hi'

  let body
  if (guide) {
    body = (
      <>
        <Intro eyebrow={guide.eyebrow} title={guide.title} intro={guide.intro} hi={hi} />
        <section className="lp__lead">
          <Facts facts={guide.facts} />
          <div className="lp__lead-body">
            <p className="lp__updated">{hi ? 'अपडेट' : 'Updated'} <time dateTime={guide.updated}>{new Date(guide.updated + 'T00:00:00Z').toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</time> · Rushan Haque</p>
            <Actions hi={hi} />
          </div>
        </section>
        {guide.sections.map((s, i) => <GuideSection key={i} s={s} />)}
        <RecentWork hi={hi} />
        <Faqs faqs={guide.faqs} num={two(guide.sections.length + 1)} title={hi ? 'अक्सर पूछे जाने वाले सवाल' : 'What clients ask'} />
        <NextStep text={guide.cta} hi={hi} />
      </>
    )
  } else if (page) {
    const sections = page.sections.map(parseSection)
    const extra = extraFor(slug)
    const at = Math.max(0, sections.findIndex((s) => s.kind === 'faq'))
    body = (
      <>
        <Intro eyebrow={page.kind} title={page.title} intro={page.description.split(/(?<=[.!?])\s+/)[0]} />
        {sections.map((s, i) => (
          <Fragment key={i}>
            {i === (at || sections.length - 1) && extra?.sections.map((x, k) => <GuideSection key={`x${k}`} s={x} />)}
            {i === (at || sections.length - 1) && <RecentWork />}
            <SourceSection s={s} />
          </Fragment>
        ))}
      </>
    )
  } else {
    body = (
      <>
        <Intro eyebrow={legal.title} title={legal.title} intro={legal.description} />
        <Legal slug={slug} />
      </>
    )
  }

  return (
    <div className="page page--landing" ref={root}>
      <article className="lp wrap" data-theme="ivory" lang={hi ? 'hi' : undefined}>{body}</article>
      {!legal && <div className="wrap"><Directory current={slug} /></div>}
      <Footer />
    </div>
  )
}
