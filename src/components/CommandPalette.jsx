import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { scrollTo, stopScroll, startScroll } from '../lib/lenis'
import { site } from '../config/site'
import { works, products } from '../data/content'
import { usePageTransition } from './Transition'
import Icon from './Icon'

/** ⌘K / Ctrl K — jump anywhere, copy the email, open WhatsApp, toggle the drafting grid. */
export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const [toast, setToast] = useState('')
  const box = useRef(null)
  const input = useRef(null)
  const { go } = usePageTransition()

  const actions = useMemo(() => {
    const nav = [
      { group: 'Pages', label: 'Index', hint: 'Home', run: () => go('/') },
      { group: 'Pages', label: 'All work', hint: 'Index of everything', run: () => go('/work') },
      { group: 'Pages', label: 'About', hint: 'Journey, credentials, writing', run: () => go('/about') },
      { group: 'Pages', label: 'Contact', hint: 'Start a project', run: () => go('/contact') },
    ]
    const sections = [
      ['Recent works', '#work'], ['Currently building', '#drafting'], ['Products', '#products'], ['Clientele', '#clientele'], ['Where I serve', '#serve'],
      ['Other services', '#services'], ['Reviews', '#reviews'], ['Writing', '#writing'], ['About', '#about'],
    ].map(([label, hash]) => ({ group: 'Home', label, hint: 'Jump to section', run: () => (location.pathname === '/' ? scrollTo(hash, { offset: -20 }) : go(`/${hash}`)) }))
    const cases = [...works, ...products].map((p) => ({ group: 'Projects', label: p.title, hint: p.field, run: () => go(`/work/${p.slug}`) }))
    const util = [
      { group: 'Actions', label: 'Copy email address', hint: site.email, icon: 'copy', run: () => { navigator.clipboard?.writeText(site.email); flash('Email copied') } },
      { group: 'Actions', label: 'Message on WhatsApp', hint: site.phone.label, icon: 'whatsapp', run: () => window.open(site.phone.whatsapp, '_blank', 'noopener') },
      { group: 'Actions', label: 'Book a call', hint: 'cal.com', icon: 'calendar', run: () => window.open(site.booking, '_blank', 'noopener') },
    ]
    return [...nav, ...sections, ...cases, ...util]
  }, [go])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? actions.filter((a) => `${a.label} ${a.hint} ${a.group}`.toLowerCase().includes(s)) : actions
  }, [q, actions])

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }

  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o) }
      else if (e.key === 'Escape') setOpen(false)
    }
    const ext = () => setOpen(true)
    window.addEventListener('keydown', key)
    window.addEventListener('palette:open', ext)
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('palette:open', ext) }
  }, [])

  useEffect(() => {
    if (open) {
      stopScroll()
      setQ('')
      setSel(0)
      gsap.fromTo(box.current, { autoAlpha: 0, y: 20, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 })
      setTimeout(() => input.current?.focus(), 30)
    } else startScroll()
  }, [open])

  useEffect(() => setSel(0), [q])

  const run = (a) => {
    if (!a) return
    setOpen(false)
    setTimeout(() => a.run(), 60)
  }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(list.length - 1, s + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
    if (e.key === 'Enter') run(list[sel])
  }

  let lastGroup = ''
  return (
    <>
      <div className={`cmdk ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden={!open} inert={open ? undefined : ''}>
        <div className="cmdk__box" ref={box} role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
          <div className="cmdk__top">
            <Icon name="search" size={18} />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Where to? Try “Taif”, “services” or “email”…" aria-label="Search commands" />
            <kbd>esc</kbd>
          </div>
          <ul className="cmdk__list" role="listbox">
            {list.map((a, i) => {
              const head = a.group !== lastGroup
              lastGroup = a.group
              return (
                <li key={`${a.group}${a.label}`}>
                  {head && <span className="cmdk__group">{a.group}</span>}
                  <button className={`cmdk__item ${i === sel ? 'is-sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => run(a)} role="option" aria-selected={i === sel}>
                    <Icon name={a.icon || 'arrowUpRight'} size={15} />
                    <span>{a.label}</span>
                    <small>{a.hint}</small>
                  </button>
                </li>
              )
            })}
            {!list.length && <li className="cmdk__empty">Nothing here yet — but there could be. <button onClick={() => run({ run: () => go('/contact') })}>Start a project</button></li>}
          </ul>
          <div className="cmdk__foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>⌘</kbd><kbd>K</kbd> toggle</span></div>
        </div>
      </div>
      <div className={`toast ${toast ? 'is-on' : ''}`} role="status">{toast}</div>
    </>
  )
}
