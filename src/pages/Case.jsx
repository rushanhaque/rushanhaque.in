import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useChapter, ramp } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { useMeta } from '../lib/meta'
import { small, srcSet } from '../lib/img'
import { reviews, works } from '../data/content'
import { TLink } from '../components/Transition'
import Btn from '../components/Btn'
import Footer from '../components/Footer'
import Head from '../components/Head'
import NotFound from './NotFound'

// A case: the site itself, large; what it is; the drawing it began as, turning into the built thing as you
// scroll; why it looks the way it does; and the next one.
export default function Case() {
  const { slug } = useParams()
  const i = works.findIndex((w) => w.slug === slug)
  if (i < 0) return <NotFound />
  return <CaseInner w={works[i]} next={works[(i + 1) % works.length]} key={slug} />
}

function CaseInner({ w, next }) {
  const root = useRef(null)
  const first = useRef(null)
  const wipe = useRef(null)
  const rest = useRef(null)
  const real = useRef(null)
  const line = useRef(null)
  useMeta({ title: `${w.title}. Rushan Haque`, description: w.description, path: `/work/${w.slug}` })
  useReveals(root)

  useChapter(first, { id: 'case-hero', name: w.short, hidden: true, time: [8.6, 10] })
  useChapter(wipe, {
    id: 'case-drawing',
    name: 'From the drawing',
    hidden: true,
    time: [10, 12],
    frame: ({ stick }) => {
      const x = ramp(stick, 0.08, 0.92)
      if (real.current) real.current.style.clipPath = `inset(0 ${(100 - x * 100).toFixed(2)}% 0 0)`
      if (line.current) line.current.style.left = `${(x * 100).toFixed(2)}%`
    },
  })
  useChapter(rest, { id: 'case-rest', name: 'Notes', hidden: true, time: [12, 15] })

  const decisions = w.caseStudy?.decisions
  const review = reviews.find((r) => (r.company && w.title.toLowerCase().includes(r.company.toLowerCase().split(' ')[0])) || r.quote.toLowerCase().includes(w.short.toLowerCase()))
  return (
    <article className="case" ref={root}>
      <div ref={first}>
        <div data-tone="ivory">
        <header className="case__head wrap">
          <nav className="crumb note" aria-label="Breadcrumb"><TLink to="/work" title="Works">Works</TLink><span aria-hidden="true">/</span><span aria-current="page">{w.short}</span></nav>
          <h1 className="h1">{w.title}</h1>
          <div className="case__intro">
            <p className="lede">{w.line}</p>
            <dl className="case__meta note">
              <div><dt>Role</dt><dd>Design &amp; development</dd></div>
              <div><dt>Field</dt><dd>{w.field.replace(' · ', ', ')}</dd></div>
              <div><dt>Year</dt><dd>{w.year}</dd></div>
              <div><dt>Status</dt><dd>{w.status}</dd></div>
            </dl>
          </div>
        </header>

        <div className="case__shot wrap">
          <img data-plate src={small(w.image)} srcSet={srcSet(w.image)} sizes="(max-width: 760px) 92vw, 90vw" alt={`${w.title} home page`} width={w.w} height={w.h} fetchPriority="high" decoding="async" />
        </div>
        </div>

        <section className="case__say wrap grid" data-tone="ivory">
          <p className="note case__over">Overview</p>
          <p className="case__desc h3" data-r="sweep">{w.description}</p>
          <div className="case__side">
            <ul className="tags">{w.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            {w.url && <Btn href={w.url} variant="solid">Visit the site</Btn>}
          </div>
        </section>
      </div>

      <div className="wrap case__sub" data-tone="ivory"><Head label="Drawing and build" title={<>From the first line <em>to the last pixel.</em></>} /></div>
      <section className="case__wipe pin" ref={wipe} aria-label="From the drawing to the built site" data-tone="ivory">
        <div className="pin__stage case__stage">
          <div className="case__plate" style={{ aspectRatio: `${w.w} / ${w.h}` }}>
            <img className="case__plan" src={small(w.plan)} srcSet={srcSet(w.plan)} sizes="90vw" alt={`Line drawing of the ${w.title} home page`} loading="lazy" decoding="async" />
            <img className="case__built" ref={real} src={small(w.image)} srcSet={srcSet(w.image)} sizes="90vw" alt="" loading="lazy" decoding="async" />
            <span className="case__line" ref={line} aria-hidden="true" />
          </div>
          <p className="note case__cap"><span>Built</span><span>Drawn</span></p>
        </div>
      </section>

      <div ref={rest}>
        {decisions && (
          <section className="case__why wrap" data-tone="ivory">
            <Head label="Decisions" title={<>Three choices that <em>shaped it.</em></>} lede={w.caseStudy.context} />
            <ol className="case__dec">
              {decisions.map((d, k) => (
                <li key={d.title} data-r="fade" data-delay={k * 0.06}>
                  <span className="pillar" aria-hidden="true">{k + 1}</span>
                  <h2 className="h4">{d.title}</h2>
                  <p className="small">{d.text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {review && (
          <blockquote className="case__quote wrap" data-r="fade" data-tone="ivory">
            <p className="h2">“{review.quote}”</p>
            <footer className="small">{[review.name, review.company].filter(Boolean).join(', ')}</footer>
          </blockquote>
        )}

        <div className="case__cta wrap" data-r="fade" data-tone="ivory">
          {w.url && <Btn href={w.url} variant="solid">Visit the live site</Btn>}
          <Btn to="/contact" title="Contact">Start something similar</Btn>
        </div>

        <TLink to={`/work/${next.slug}`} title={next.short} className="case__next wrap" data-cursor="Next" data-tone="ivory">
          <span className="case__nexttxt">
            <span className="note">Next project</span>
            <span className="h2">{next.title}</span>
            <span className="small">{next.line}</span>
          </span>
          <span className="case__nextpic" style={{ aspectRatio: `${next.w} / ${next.h}` }} data-r="plate" data-morph="">
            <img src={small(next.image)} srcSet={srcSet(next.image)} sizes="(max-width: 760px) 92vw, 46vw" alt="" loading="lazy" decoding="async" />
          </span>
        </TLink>
        <Footer />
      </div>
    </article>
  )
}
