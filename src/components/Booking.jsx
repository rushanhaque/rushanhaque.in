import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { site } from '../config/site'
import { lockScroll, unlockScroll } from '../lib/scroll'
import { CalendarBlank, X } from './glyphs'
import Btn from './Btn'

// Booking a call without leaving the site. Cal.com's scheduler loads only when someone asks for it, into a sheet
// over the page; the link underneath is the real booking page, so it also works with no script, or in a new tab.
const Ctx = createContext({ open: () => {} })
export const useBooking = () => useContext(Ctx)

let loading = null
function loadCal() {
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    /* Cal.com's own embed snippet */
    ;(function (C, A, L) {
      const p = (a, ar) => { a.q.push(ar) }
      const d = C.document
      C.Cal = C.Cal || function () {
        const cal = C.Cal
        const ar = arguments
        if (!cal.loaded) {
          cal.ns = {}
          cal.q = cal.q || []
          const s = d.head.appendChild(d.createElement('script'))
          s.src = A
          s.onerror = () => { loading = null; reject(new Error('blocked')) }
          cal.loaded = true
        }
        if (ar[0] === L) {
          const api = function () { p(api, arguments) }
          const namespace = ar[1]
          api.q = api.q || []
          if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]) } else p(cal, ar)
          return
        }
        p(cal, ar)
      }
    })(window, 'https://app.cal.com/embed/embed.js', 'init')
    window.Cal('init', 'call', { origin: 'https://app.cal.com' })
    window.Cal.ns.call('ui', { theme: 'light', cssVarsPerTheme: { light: { 'cal-brand': '#42242d' } }, hideEventTypeDetails: false, layout: 'month_view' })
    resolve(window.Cal)
  })
  return loading
}

/** Puts the scheduler into an element. Used by the sheet and by the Contact page. */
export function useCalInline(ref, when = true) {
  const [state, setState] = useState('idle')
  useEffect(() => {
    if (!when || !ref.current || ref.current.dataset.cal) return
    const el = ref.current
    el.dataset.cal = '1'
    setState('loading')
    if (!el.id) el.id = `cal-${Math.random().toString(36).slice(2, 8)}`
    loadCal().then((Cal) => {
      Cal.ns.call('inline', { elementOrSelector: `#${el.id}`, calLink: site.calLink, config: { layout: 'month_view', theme: 'light' } })
      // the scheduler is an iframe: it says it is ready by appearing
      const mo = new MutationObserver(() => { if (el.querySelector('iframe')) { setTimeout(() => setState('ready'), 900); mo.disconnect() } })
      mo.observe(el, { childList: true, subtree: true })
    }).catch(() => setState('failed'))
  }, [ref, when])
  return state
}

function Sheet({ onClose }) {
  const box = useRef(null)
  const shut = useRef(null)
  const state = useCalInline(box)
  useEffect(() => {
    lockScroll()
    const back = document.activeElement
    shut.current?.focus()
    const key = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', key)
    return () => { unlockScroll(); removeEventListener('keydown', key); back?.focus?.() }
  }, [onClose])
  return (
    <div className="book" role="dialog" aria-modal="true" aria-labelledby="book-title" onClick={onClose}>
      <div className="book__sheet" onClick={(e) => e.stopPropagation()}>
        <header className="book__head">
          <div>
            <p className="note">A short call</p>
            <h2 className="h3" id="book-title">Pick a <em>time.</em></h2>
          </div>
          <button type="button" ref={shut} className="book__x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className={`book__cal is-${state}`}>
          <div ref={box} className="book__frame" />
          {state !== 'ready' && (
            <div className="book__wait">
              {state === 'failed'
                ? <><p className="small">The scheduler could not load here.</p><Btn href={site.booking} variant="solid" icon={CalendarBlank}>Open the booking page</Btn></>
                : <p className="note">Opening the calendar</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function BookingProvider({ children }) {
  const [on, setOn] = useState(false)
  const open = useCallback(() => setOn(true), [])
  const close = useCallback(() => setOn(false), [])
  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {on && <Sheet onClose={close} />}
    </Ctx.Provider>
  )
}

/** A "Book a call" button: opens the sheet, and is a plain link to the booking page underneath. */
export function BookBtn({ children = 'Book a call', variant = 'ghost', className }) {
  const { open } = useBooking()
  const click = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    open()
  }
  return <Btn href={site.booking} variant={variant} icon={CalendarBlank} className={className} onClick={click}>{children}</Btn>
}

export function BookLink({ children = 'Book a call', className }) {
  const { open } = useBooking()
  return <a href={site.booking} className={className} target="_blank" rel="noopener noreferrer" onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); open() }}>{children}</a>
}
