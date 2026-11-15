import { site } from '../config/site'
import live from '../../seo/titles.json'
import added from '../data/seo/added-meta.json'

// The title, description and canonical of the current page, once the visitor moves between pages inside the site.
// The page they arrive on already has every tag in place, written at build time from the live site's own snapshot
// (seo/heads.json); these are the same words, so nothing a search engine sees changes.
const FALLBACK = 'Rushan Haque designs and builds websites and software for businesses in India and abroad.'

export function applyMeta(route) {
  const path = route.path
  const kept = live[path] || added[path]
  const title = kept?.title || (route.key === 'notfound' ? 'Page not found | Rushan Haque' : `${route.name} | Rushan Haque`)
  const description = kept?.description || FALLBACK
  document.title = title
  const set = (sel, attr, value) => { const el = document.head.querySelector(sel); if (el) el.setAttribute(attr, value) }
  set('meta[name="description"]', 'content', description)
  set('link[rel="canonical"]', 'href', site.url + (path === '/' ? '/' : path))
  set('meta[property="og:title"]', 'content', title)
  set('meta[property="og:description"]', 'content', description)
  set('meta[property="og:url"]', 'content', site.url + (path === '/' ? '/' : path))
  document.documentElement.lang = route.data?.guide?.lang === 'hi' ? 'hi' : 'en'
}
