import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// sets a <meta>/<link> by its key attribute, creating it the first time
function tag(name, sel, attrs) {
  let el = document.head.querySelector(sel)
  if (!el) { el = document.createElement(name); document.head.appendChild(el) }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
  return el
}

function apply(h, ORIGIN) {
  const url = ORIGIN + (h.path === '/' ? '/' : h.path)
  document.title = h.title
  document.documentElement.lang = h.lang === 'hi' ? 'hi' : 'en'
  tag('meta', 'meta[name="description"]', { name: 'description', content: h.description })
  tag('meta', 'meta[name="robots"]', { name: 'robots', content: h.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' })
  const canon = document.head.querySelector('link[rel="canonical"]')
  if (h.robots) canon?.remove()
  else tag('link', 'link[rel="canonical"]', { rel: 'canonical', href: url })
  tag('meta', 'meta[property="og:url"]', { property: 'og:url', content: url })
  tag('meta', 'meta[property="og:title"]', { property: 'og:title', content: h.title })
  tag('meta', 'meta[property="og:description"]', { property: 'og:description', content: h.description })
  tag('meta', 'meta[name="twitter:title"]', { name: 'twitter:title', content: h.title })
  tag('meta', 'meta[name="twitter:description"]', { name: 'twitter:description', content: h.description })
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove())
  Object.entries(h.alternates || {}).forEach(([lang, p]) => {
    const l = document.createElement('link')
    l.rel = 'alternate'
    l.hreflang = lang
    l.href = ORIGIN + (p === '/' ? '/' : p)
    document.head.appendChild(l)
  })
  // the page's structured data travels with it
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove())
  ;(h.ld || []).forEach((d) => {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.textContent = JSON.stringify(d)
    document.head.appendChild(s)
  })
}

/**
 * Keeps the head right as you move between pages without a reload: the title, description,
 * canonical address, robots, social cards, language alternates and structured data. The first
 * page arrives with all of it already written in by the pre-renderer, so the full map of
 * routes (lib/seo) loads only when you move on.
 */
export default function Seo() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      if (document.head.querySelector('link[rel="canonical"], meta[name="robots"]')) return
    }
    let alive = true
    import('../lib/seo').then(({ headFor, ORIGIN }) => { if (alive) apply(headFor(pathname), ORIGIN) })
    return () => { alive = false }
  }, [pathname])
  return null
}
