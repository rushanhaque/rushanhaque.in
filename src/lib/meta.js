import { useEffect } from 'react'
import { site } from '../config/site'
import live from '../../seo/titles.json'

// title, description and canonical for the current page, once the visitor moves between pages.
// The page they arrive on already has the right ones, written in at build time.
let arrived = false
export function useMeta({ title: t, description: dsc, path }) {
  let title = t
  let description = dsc
  useEffect(() => {
    if (!arrived && document.title) { arrived = true; return }
    arrived = true
    // the live site's own words for this page, where it has them, so search sees nothing change
    const kept = live[path || location.pathname]
    if (kept) { title = kept.title || title; description = kept.description || description }
    document.title = title
    const set = (sel, attr, value) => { const el = document.head.querySelector(sel); if (el && value) el.setAttribute(attr, value) }
    set('meta[name="description"]', 'content', description || 'Rushan Haque designs and builds websites and software for businesses in India and abroad.')
    set('link[rel="canonical"]', 'href', site.url + (path || location.pathname))
    set('meta[property="og:title"]', 'content', title)
    set('meta[property="og:url"]', 'content', site.url + (path || location.pathname))
  }, [title, description, path])
}
