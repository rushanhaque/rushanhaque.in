import { useEffect, useRef, useState } from 'react'
import { works, products, building, experiments } from '../data/live'
import { useReveals } from '../lib/reveal'
import { small, srcSet } from '../lib/img'
import { device } from '../lib/device'
import { follow } from '../lib/motion'
import { A } from '../lib/router'
import Split from '../components/Split'
import Btn from '../components/Btn'
import { lockScroll, unlockScroll } from '../lib/scroll'
import { ArrowUpRight, X } from '../components/glyphs'

const ALL = [
  ...works.map((w) => ({ key: w.slug, group: 'Client sites', title: w.title, sub: w.field.replace(' · ', ', '), year: w.year, status: w.status, image: w.image, href: w.url, text: w.line, w: w.w, h: w.h })),
  ...products.map((p) => ({ key: p.slug, group: 'Products', title: p.title, sub: p.field, year: p.year, status: p.status, image: p.image, to: p.to, href: p.href, text: p.tags.length ? p.tags.join(', ') : p.description, w: p.w, h: p.h })),
  ...building.map((b) => ({ key: b.slug, group: 'In progress', title: b.title, sub: b.field, year: '2026', status: 'In progress', image: b.image, href: b.url, text: b.description, w: b.w, h: b.h })),
  ...experiments.map((e) => ({ key: e.title, group: 'Experiments', title: e.title, sub: e.kind, year: e.year, image: e.image, href: e.url, text: e.text })),
]
const GROUPS = ['All', 'Client sites', 'Products', 'In progress', 'Experiments']
const count = (g) => (g === 'All' ? ALL.length : ALL.filter((i) => i.group === g).length)
const two = (n) => String(n).padStart(2, '0')

function Go({ it, className, children, ...rest }) {
  if (it.to) return <A to={it.to} className={className} {...rest}>{children}</A>
  return <a href={it.href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>{children}</a>
}

// A card: the picture opens the live site (or, for a product, its own page), and the button beneath does the same.
function Card({ it, big }) {
  const live = !it.to
  return (
    <li className={`wk__card ${big ? 'is-big' : ''}`} data-r="card">
      <div className="wk__link">
        <Go it={it} className="wk__pic card-pic" data-cursor={live ? 'Visit site' : 'View'} aria-label={live ? `${it.title}, visit the live site` : it.title}>
          <img src={small(it.image)} srcSet={srcSet(it.image)} sizes={big ? '(max-width: 760px) 92vw, 46vw' : '(max-width: 760px) 92vw, 30vw'} alt={`${it.title} home page`} width={it.w} height={it.h} loading="lazy" decoding="async" />
        </Go>
        <span className="wk__txt card-txt">
          <span className="wk__head"><strong className="h4">{it.title}</strong></span>
          <span className="small">{it.text}</span>
          <span className="note">{[it.sub, it.year, it.status && it.status !== 'Live' ? it.status : ''].filter(Boolean).join(', ')}</span>
          {live ? <Btn href={it.href} variant="solid" className="wk__visit">Visit site</Btn> : <Btn to={it.to} className="wk__visit">Explore</Btn>}
        </span>
      </div>
    </li>
  )
}

// An experiment, opened: its picture, what it is and when, in a sheet over the page.
function XpSheet({ it, onClose }) {
  const shut = useRef(null)
  useEffect(() => {
    lockScroll()
    const back = document.activeElement
    shut.current?.focus()
    const key = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', key)
    return () => { unlockScroll(); removeEventListener('keydown', key); back?.focus?.() }
  }, [onClose])
  return (
    <div className="xps" role="dialog" aria-modal="true" aria-labelledby="xps-title" onClick={onClose}>
      <div className="xps__sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" ref={shut} className="xps__x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        {it.image
          ? <span className="xps__pic"><img src={it.image} alt={`${it.title} screen`} /></span>
          : <span className="xps__pic xps__pic--type pillar" aria-hidden="true">{it.title}</span>}
        <div className="xps__body">
          <p className="note xps__kind">{it.sub}, {it.year}</p>
          <h3 className="h3" id="xps-title">{it.title}</h3>
          <p className="lede">{it.text}</p>
        </div>
      </div>
    </div>
  )
}

// The experiments as an index: a row each, and on a desktop the picture floats beside the pointer. A row opens its
// details in a sheet; the experiments themselves are not linked out.
function Experiments({ items }) {
  const list = useRef(null)
  const peek = useRef(null)
  const [img, setImg] = useState('')
  const [open, setOpen] = useState(null)
  useEffect(() => {
    const d = device()
    if (!d.fine || d.reduced) return undefined
    const el = list.current
    const p = { x: 0, y: 0 }
    const write = () => { peek.current.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)` }
    const fx = follow(p, 'x', { duration: 0.5, onUpdate: write })
    const fy = follow(p, 'y', { duration: 0.5, onUpdate: write })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      fx(e.clientX - r.left)
      fy(e.clientY - r.top)
      const row = e.target.closest?.('[data-img]')
      const src = row?.dataset.img || ''
      peek.current.classList.toggle('is-on', !!src)
      if (src) setImg(src)
    }
    const leave = () => peek.current.classList.remove('is-on')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); fx.stop(); fy.stop() }
  }, [])
  return (
    <div className="xp" ref={list}>
      <ol className="xp__list">
        {items.map((it, i) => (
          <li key={it.key} data-img={it.image || undefined} data-r="up">
            <button type="button" className="xp__row" onClick={() => setOpen(it)} data-cursor="Details">
              <span className="note xp__no">{two(i + 1)}</span>
              <strong className="xp__name">{it.title}</strong>
              <span className="small xp__text">{it.text}</span>
              <span className="note xp__kind">{it.sub}, {it.year}</span>
              <ArrowUpRight size={16} className="xp__go" />
              {it.image && <img className="xp__thumb" src={it.image} alt="" loading="lazy" decoding="async" />}
            </button>
          </li>
        ))}
      </ol>
      <div className="xp__peek" ref={peek} aria-hidden="true">{img && <img src={img} alt="" />}</div>
      {open && <XpSheet it={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

// Every piece of work in one place, filed by kind.
export default function Works() {
  const root = useRef(null)
  const [filter, setFilter] = useState('All')
  useReveals(root, [filter])
  const groups = filter === 'All' ? GROUPS.slice(1) : [filter]
  return (
    <div className="wk" ref={root} data-tone="ivory">
      <header className="phead wrap">
        <p className="note phead__kick">Index of works <i /></p>
        <div className="phead__row"><h1 className="phead__title"><Split>All <em>works</em></Split></h1><sup className="count" aria-hidden="true">({two(ALL.length)})</sup></div>
        <p className="lede phead__lede" data-r="up">Client websites, software products, sites in progress and a cabinet of experiments, made between 2024 and today.</p>
        <div className="tabs" role="group" aria-label="Filter the works">
          {GROUPS.map((g) => (
            <button key={g} type="button" aria-pressed={filter === g} className={filter === g ? 'is-on' : ''} onClick={() => setFilter(g)}>
              {g}<sup>{count(g)}</sup>
            </button>
          ))}
        </div>
      </header>
      <div className="wk__groups wrap">
        {groups.map((g) => {
          const items = ALL.filter((i) => i.group === g)
          return (
            <section className="wk__group" key={g} aria-label={g}>
              <h2 className="kick wk__name"><span>{g}</span><i /><span className="wk__n">{two(items.length)}</span></h2>
              {g === 'Experiments'
                ? <Experiments items={items} />
                : <ul className={`wk__grid ${g === 'Client sites' ? 'is-big' : ''}`}>{items.map((it) => <Card key={it.key} it={it} big={g === 'Client sites'} />)}</ul>}
            </section>
          )
        })}
      </div>
    </div>
  )
}
