import { useRef, Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveals } from '../lib/useReveals'
import { allProjects, projectBySlug, reviews } from '../data/content'
import { small, srcSet } from '../lib/img'
import { TLink } from '../components/Transition'
import Button from '../components/Button'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import { Kicker } from '../components/Head'

const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

/** Drawing ⟷ building: drag the brass divider to compare the line drawing with the finished site. */
function Compare({ p }) {
  const ref = useRef(null)
  const set = (x) => {
    const r = ref.current.getBoundingClientRect()
    const k = Math.min(1, Math.max(0, (x - r.left) / r.width))
    ref.current.style.setProperty('--k', k)
  }
  const drag = (e) => {
    set(e.clientX)
    const move = (ev) => set(ev.clientX)
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  const key = (e) => {
    const cur = parseFloat(getComputedStyle(ref.current).getPropertyValue('--k')) || 0.5
    if (e.key === 'ArrowLeft') ref.current.style.setProperty('--k', Math.max(0, cur - 0.05))
    if (e.key === 'ArrowRight') ref.current.style.setProperty('--k', Math.min(1, cur + 0.05))
  }
  useGSAP(() => {
    const o = { k: 0.08 }
    gsap.to(o, { k: 0.5, duration: 2.2, ease: 'expo', onUpdate: () => ref.current?.style.setProperty('--k', o.k), scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true } })
  }, { scope: ref })
  return (
    <div className="cmp" ref={ref} style={{ aspectRatio: `${p.w} / ${p.h}` }} onPointerDown={drag}>
      <div className="cmp__plan"><img src={p.plan} alt="" loading="lazy" /></div>
      <img className="cmp__render" src={p.image} alt={`${p.title}, finished`} loading="lazy" />
      <span className="cmp__label cmp__label--l">The drawing</span>
      <span className="cmp__label cmp__label--r">The building</span>
      <button className="cmp__handle" role="slider" aria-label="Compare drawing and finished site" aria-valuemin={0} aria-valuemax={100} onKeyDown={key}><Icon name="arrowLeft" size={14} /><Icon name="arrowRight" size={14} /></button>
    </div>
  )
}

export default function Case() {
  const { slug } = useParams()
  const p = projectBySlug(slug)
  const root = useRef(null)
  useReveals(root, 'ivory')

  useGSAP(() => {
    if (!p) return
    const q = gsap.utils.selector(root)
    gsap.timeline({ delay: 0.15 })
      .from(q('.case__title .ch'), { yPercent: 120, rotateX: -90, stagger: 0.03, duration: 1.4 })
      .from(q('.case__meta > *'), { y: 30, autoAlpha: 0, stagger: 0.06, duration: 1 }, 0.4)
      .fromTo(q('.case__cover'), { clipPath: 'inset(18% 12% 0% 12% round 999px 999px 0 0)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px 24px 0 0)', duration: 1.8, ease: 'expo' }, 0.3)
    gsap.fromTo(q('.case__cover img'), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: q('.case__cover')[0], start: 'top bottom', end: 'bottom top', scrub: true } })
  }, { scope: root, dependencies: [slug] })

  if (!p) return <NotFound />
  const i = allProjects.indexOf(p)
  const next = allProjects[(i + 1) % allProjects.length]
  const review = reviews.find((r) => (r.company && p.title.toLowerCase().includes(r.company.toLowerCase().split(' ')[0])) || r.quote.toLowerCase().includes(p.short.toLowerCase()))

  return (
    <div className="page page--case" ref={root}>
      <section className="case" data-theme="ivory">
        <header className="case__head wrap">
          <TLink to="/work" className="case__back"><Icon name="arrowLeft" size={14} /> All work</TLink>
          <Kicker n={String(i + 1).padStart(2, '0')} label={p.field} />
          <h1 className="case__title" aria-label={p.title}>
            {p.title.split(' ').map((w, k) => (
              <Fragment key={k}>{k > 0 && ' '}<span className="case__w">{w.split('').map((c, j) => <span className="ch" key={j}>{c}</span>)}</span></Fragment>
            ))}
          </h1>
          <dl className="case__meta">
            <div><dt>Role</dt><dd>Design &amp; development</dd></div>
            <div><dt>Year</dt><dd>{p.year}</dd></div>
            <div><dt>Status</dt><dd><span className={`status ${p.status === 'Live' ? 'status--live' : 'status--wip'}`}><i />{p.status}</span></dd></div>
            <div><dt>{p.url ? 'Visit' : 'Type'}</dt><dd>{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="case__visit">{host(p.url)} <Icon name="arrowUpRight" size={14} /></a> : p.field}</dd></div>
          </dl>
        </header>
        <figure className="case__cover wrap">
          <div className="case__cover-in"><img src={p.image} srcSet={srcSet(p.image)} sizes="100vw" alt={`${p.title} — homepage`} width={p.w} height={p.h} fetchpriority="high" /></div>
        </figure>

        <div className="case__body wrap">
          <aside className="case__aside">
            <span className="eyebrow">Overview</span>
            <ul className="case__tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          </aside>
          <div className="case__main">
            <p className="case__lead" data-split>{p.caseStudy?.context || p.line || p.description}</p>
            <p className="case__text" data-reveal>{p.description}</p>
          </div>
        </div>

        <section className="case__compare wrap">
          <header className="case__sub">
            <span className="eyebrow">Drawing and build</span>
            <h2 data-split>From the first line <em>to the last pixel.</em></h2>
          </header>
          <Compare p={p} />
        </section>

        {p.caseStudy && (
          <section className="case__decisions wrap">
            <header className="case__sub"><span className="eyebrow">Decisions</span><h2 data-split>Three choices that <em>shaped it.</em></h2></header>
            <ol>
              {p.caseStudy.decisions.map((d, k) => (
                <li key={d.title} data-reveal data-delay={k * 0.08}>
                  <span className="case__dn">0{k + 1}</span>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {p.does && (
          <section className="case__decisions wrap">
            <header className="case__sub"><span className="eyebrow">What it does</span><h2 data-split>Built for the <em>everyday.</em></h2></header>
            <ol>
              {p.does.map((d, k) => (
                <li key={d} data-reveal data-delay={k * 0.08}><span className="case__dn">0{k + 1}</span><p className="case__does">{d}</p></li>
              ))}
            </ol>
            <ol className="case__steps">
              {p.steps.map((s, k) => (
                <li key={s.title} data-reveal data-delay={k * 0.06}><span>Step {k + 1}</span><strong>{s.title}</strong><p>{s.text}</p></li>
              ))}
            </ol>
          </section>
        )}

        {review && (
          <blockquote className="case__quote wrap" data-reveal>
            <p>“{review.quote}”</p>
            <footer>{review.name} — {review.company}</footer>
          </blockquote>
        )}

        <div className="case__cta wrap" data-reveal>
          {p.url && <Button href={p.url} variant="solid">Visit the live site</Button>}
          <Button to="/contact" variant="ghost">Start something similar</Button>
        </div>

        <TLink to={`/work/${next.slug}`} label={next.title} className="case__next" zoom>
          <span className="eyebrow">Next project</span>
          <span className="case__next-title">{next.title}</span>
          <span className="case__next-meta">{next.field} <i aria-hidden="true" /> View the case</span>
          <span className="case__next-media media"><img src={small(next.image)} alt="" loading="lazy" decoding="async" /></span>
        </TLink>
      </section>
      <Footer />
    </div>
  )
}
