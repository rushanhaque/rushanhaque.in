import { useEffect, useRef } from 'react'
import { reviews, works } from '../data/content'
import { useReveals } from '../lib/reveal'
import { device } from '../lib/device'
import { range, scrub } from '../lib/motion'
import { small, srcSet } from '../lib/img'
import { A } from '../lib/router'
import Btn from '../components/Btn'
import Head from '../components/Head'
import Split from '../components/Split'
import NotFound from './NotFound'

const host = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

// The drawing it began as, turning into the built thing as you scroll. Both the built picture and its frame move by
// transform only, in opposite directions, so the wipe is drawn by the compositor.
function Wipe({ w }) {
  const root = useRef(null)
  const plate = useRef(null)
  useEffect(() => {
    if (device().reduced) { plate.current.style.setProperty('--p', 1); return undefined }
    return scrub(root.current, { start: 0, end: 1, smooth: 0.2, onUpdate: (p) => plate.current.style.setProperty('--p', range(p, 0.12, 0.88).toFixed(4)) })
  }, [])
  return (
    <section className="case__wipe" ref={root} aria-label="From the drawing to the built site">
      <div className="case__stage wrap">
        <div className="case__plate" ref={plate} style={{ aspectRatio: `${w.w} / ${w.h}` }}>
          <img className="case__plan" src={small(w.plan)} srcSet={srcSet(w.plan)} sizes="90vw" alt={`Line drawing of the ${w.title} home page`} loading="lazy" decoding="async" />
          <span className="case__built"><img src={small(w.image)} srcSet={srcSet(w.image)} sizes="90vw" alt="" loading="lazy" decoding="async" /></span>
          <span className="case__track" aria-hidden="true"><i className="case__line" /></span>
        </div>
        <p className="note case__cap"><span>Built</span><span>Drawn</span></p>
      </div>
    </section>
  )
}

// A case: the site itself, large; what it is; the drawing it began as; why it looks the way it does; and the next one.
export default function Case({ params }) {
  const i = works.findIndex((w) => w.slug === params?.slug)
  if (i < 0) return <NotFound />
  return <CaseInner w={works[i]} no={i} next={works[(i + 1) % works.length]} />
}

function CaseInner({ w, no, next }) {
  const root = useRef(null)
  useReveals(root)
  const decisions = w.caseStudy?.decisions
  const review = reviews.find((r) => (r.company && w.title.toLowerCase().includes(r.company.toLowerCase().split(' ')[0])) || r.quote.toLowerCase().includes(w.short.toLowerCase()))
  return (
    <article className="case" ref={root} data-tone="ivory">
      <header className="case__head wrap">
        <nav className="crumb note" aria-label="Breadcrumb"><A to="/work">Works</A><span aria-hidden="true">/</span><span aria-current="page">{w.short}</span></nav>
        <p className="note case__idx">Case {String(no + 1).padStart(2, '0')} of {String(works.length).padStart(2, '0')}</p>
        <h1 className="case__title"><Split>{w.title}</Split></h1>
        <div className="case__intro">
          <p className="lede" data-r="up">{w.line}</p>
          <dl className="case__meta" data-r="stagger">
            <div><dt className="note">Role</dt><dd>Design &amp; development</dd></div>
            <div><dt className="note">Field</dt><dd>{w.field.replace(' · ', ', ')}</dd></div>
            <div><dt className="note">Year</dt><dd>{w.year}</dd></div>
            <div><dt className="note">Status</dt><dd>{w.status}</dd></div>
          </dl>
        </div>
      </header>

      <div className="case__shot wrap">
        <div className="case__frame">
          <span className="stk__bar" aria-hidden="true"><i /><i /><i /><span>{w.url ? host(w.url) : w.short}</span></span>
          <img src={small(w.image)} srcSet={srcSet(w.image)} sizes="(max-width: 760px) 92vw, 90vw" alt={`${w.title} home page`} width={w.w} height={w.h} fetchPriority="high" decoding="async" />
        </div>
      </div>

      <section className="case__say wrap grid">
        <p className="note case__over">Overview</p>
        <p className="case__desc h3" data-r="sweep"><Split>{w.description}</Split></p>
        <div className="case__side">
          <ul className="tags">{w.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          {w.url && <Btn href={w.url} variant="solid">Visit the site</Btn>}
        </div>
      </section>

      <div className="wrap case__sub"><Head label="Drawing and build" title={<>From the first line <em>to the last pixel.</em></>} /></div>
      <Wipe w={w} />

      {decisions && (
        <section className="case__why wrap">
          <Head label="Decisions" title={<>Three choices that <em>shaped it.</em></>} lede={w.caseStudy.context} />
          <ol className="case__dec" data-r="deal">
            {decisions.map((d, k) => (
              <li key={d.title}>
                <span className="pillar" aria-hidden="true">{k + 1}</span>
                <h2 className="h4">{d.title}</h2>
                <p className="small">{d.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {review && (
        <blockquote className="case__quote wrap" data-r="up">
          <p className="h2">“{review.quote}”</p>
          <footer className="small">{[review.name, review.company].filter(Boolean).join(', ')}</footer>
        </blockquote>
      )}

      <div className="case__cta wrap" data-r="up">
        {w.url && <Btn href={w.url} variant="solid">Visit the live site</Btn>}
        <Btn to="/contact">Start something similar</Btn>
      </div>

      <A to={`/work/${next.slug}`} className="case__next wrap" data-cursor="Next">
        <span className="case__nexttxt">
          <span className="note">Next project</span>
          <span className="h2">{next.title}</span>
          <span className="small">{next.line}</span>
        </span>
        <span className="case__nextpic" style={{ aspectRatio: `${next.w} / ${next.h}` }} data-r="plate">
          <img src={small(next.image)} srcSet={srcSet(next.image)} sizes="(max-width: 760px) 92vw, 46vw" alt="" loading="lazy" decoding="async" />
        </span>
      </A>
    </article>
  )
}
