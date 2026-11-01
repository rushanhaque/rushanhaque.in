import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced } from '../lib/gsap'
import { small, srcSet } from '../lib/img'
import { TLink } from './Transition'
import Icon from './Icon'
import LiquidWindow from './LiquidWindow'

const two = (n) => String(n).padStart(2, '0')
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

/**
 * The featured sites in one browser window, as in the previous portfolio. Each name in the
 * list takes the window as its words arrive level with it: a liquid front rises through the
 * page with the next site behind it (LiquidWindow); on entry-level phones, or without WebGL,
 * its card wipes up over the last one. On wide screens the window holds under the header and
 * each site's words hold level with its picture while it is theirs.
 */
export default function Showcase({ items, external = false }) {
  const root = useRef(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      // an item takes the window while it crosses the line where the eye rests
      // on wide screens a site takes the window as its words rise to meet it
      const line = window.innerWidth >= 900 && window.innerHeight > 520 ? '42%' : window.innerWidth < 900 ? '68%' : 'center'
      q('.sc__item').forEach((el, i) => ScrollTrigger.create({ trigger: el, start: `top ${line}`, end: `bottom ${line}`, onToggle: (s) => s.isActive && setActive(i) }))
      if (reduced()) return
      gsap.timeline({ scrollTrigger: { trigger: q('.sc__window')[0], start: 'top 85%', once: true } })
        .fromTo(q('.sc__window'), { clipPath: 'inset(100% 0% 0% 0% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.4, ease: 'expo', clearProps: 'clipPath' }, 0)
        .from(q('.sc__frames'), { scale: 1.18, duration: 1.8, ease: 'expo', clearProps: 'scale' }, 0)
    },
    { scope: root },
  )

  const it = items[active]
  return (
    <div className="sc" ref={root}>
      <ol className="sc__list">
        {items.map((w, i) => (
          <li className={`sc__item ${i === active ? 'is-on' : ''}`} key={w.slug}>
            {/* on wide screens the words hold level with the middle of the window while it is theirs */}
            <div className="sc__copy">
            <span className="sc__no">{two(i + 1)}</span>
            <h3 className="sc__name" aria-label={w.title}>
              {w.title.split('').map((c, k) => <span className="ch" aria-hidden="true" key={k} style={{ '--c': k }}>{c === ' ' ? '\u00a0' : c}</span>)}
            </h3>
            <p className="sc__field">{[w.field, w.year].filter(Boolean).join(' · ')}</p>
            <p className="sc__desc">{w.description}</p>
            {external
              ? <a href={w.url} target="_blank" rel="noopener noreferrer" className="sc__link">Preview the build <Icon name="arrowUpRight" size={14} /></a>
              : <TLink to={`/work/${w.slug}`} label={w.title} className="sc__link">View the case <Icon name="arrowRight" size={14} /></TLink>}
            </div>
          </li>
        ))}
      </ol>
      <div className="sc__stage">
        <div className="sc__window">
          <div className="sc__bar" aria-hidden="true">
            <i /><i /><i />
            <span className="sc__host" key={it.slug}>{host(it.url)}</span>
          </div>
          <div className="sc__frames">
            {items.map((w, i) => (
              <span className={i === active ? 'is-on' : i < active ? 'is-past' : ''} key={w.slug}>
                <img src={small(w.image)} srcSet={srcSet(w.image)} sizes="(max-width: 899px) 92vw, 52vw" alt={i === active ? `${w.title} website` : ''} width={w.w} height={w.h} loading="lazy" decoding="async" />
              </span>
            ))}
            <LiquidWindow items={items} active={active} />
          </div>
        </div>
      </div>
    </div>
  )
}
