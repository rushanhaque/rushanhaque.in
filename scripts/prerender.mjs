// After the browser and server builds: writes every route as a finished HTML page, with the live site's own search
// tags put back exactly as they are (seo/heads.json: titles, descriptions, canonicals, alternates, social cards and
// structured data), each page's own code preloaded, and the live sitemap, robots.txt and llms files beside them.
// Run by `npm run build`.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadAdded, headFor, withSitemap, withLlms, withLlmsFull } from './added-pages.mjs'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const ssr = path.join(root, 'dist-ssr')
const ORIGIN = 'https://www.rushanhaque.in'

const { render, paths, PAGE_FILES } = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href)
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'))
const heads = JSON.parse(fs.readFileSync(path.join(root, 'seo/heads.json'), 'utf8'))
// pages written after the live snapshot: their own tags, and a place at the end of the sitemap and llms files
const added = loadAdded(root)
const addedHeads = new Map(added.map((g) => [`${g.slug}.html`, headFor(g)]))
const verify = {
  google: process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION || '',
  bing: process.env.BING_SITE_VERIFICATION || process.env.VITE_BING_SITE_VERIFICATION || '',
}
const entry = Object.values(manifest).find((m) => m.isEntry)

// a chunk and everything it imports, minus what the entry already brings
function chunks(key, seen = new Set()) {
  const m = manifest[key]
  if (!m || seen.has(key)) return seen
  seen.add(key)
  for (const k of m.imports || []) chunks(k, seen)
  return seen
}
const entryChunks = chunks(Object.keys(manifest).find((k) => manifest[k].isEntry))
const preload = (keys) => [...new Set(keys.flatMap((k) => [...chunks(k)]))]
  .filter((k) => !entryChunks.has(k))
  .map((k) => `<link rel="modulepreload" href="/${manifest[k].file}" />`)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
function fallbackHead(p, title, description, robots) {
  const url = ORIGIN + (p === '/' ? '/' : p)
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${robots || 'index, follow'}" />`,
    robots ? '' : `<link rel="canonical" href="${url}" />`,
  ].filter(Boolean)
}

const fileFor = (p) => (p === '/' ? 'index.html' : `${p.slice(1)}.html`)
function page(p, { robots } = {}) {
  const r = render(p === '/404' ? '/this-page-does-not-exist' : p)
  const file = p === '/404' ? '404.html' : fileFor(p)
  const kept = heads[file]
  const tags = kept ? kept.tags : addedHeads.get(file) || fallbackHead(p, 'Rushan Haque', 'Rushan Haque designs and builds websites and software for businesses in India and abroad.', robots)
  if (verify.google && !tags.some((t) => t.includes('google-site-verification'))) tags.push(`<meta name="google-site-verification" content="${esc(verify.google)}" />`)
  if (verify.bing && !tags.some((t) => t.includes('msvalidate.01'))) tags.push(`<meta name="msvalidate.01" content="${esc(verify.bing)}" />`)
  const pre = preload([PAGE_FILES[r.key], ...(r.key === 'landing' && p !== '/privacy' && p !== '/accessibility' ? [`src/data/seo/pages/${p.slice(1)}.json`] : [])])
  const html = template
    .replace('<html lang="en">', `<html lang="${kept?.lang || r.lang}" data-page="${r.key}">`)
    .replace('<!--app-head-->', [...tags, ...pre].join('\n    '))
    .replace('<!--app-html-->', r.html)
  const to = path.join(dist, file)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, html)
  return kept ? 1 : 0
}

const list = paths()
let matched = 0
for (const p of list) matched += page(p)
page('/404', { robots: 'noindex, follow' })
page('/admin', { robots: 'noindex, nofollow' })

// the live site's sitemap, robots.txt and llms files, unchanged
for (const f of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt']) fs.copyFileSync(path.join(root, 'seo', f), path.join(dist, f))
// ...then the added pages appended after everything that is already there
if (added.length) {
  const grow = (f, fn) => fs.writeFileSync(path.join(dist, f), fn(fs.readFileSync(path.join(dist, f), 'utf8'), added))
  grow('sitemap.xml', withSitemap)
  grow('llms.txt', withLlms)
  grow('llms-full.txt', withLlmsFull)
}

// every address in the sitemap must have been written, or search would find a hole
const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
const missing = [...sitemap.matchAll(/<loc>https:\/\/www\.rushanhaque\.in([^<]*)<\/loc>/g)].map((m) => m[1] || '/').filter((p) => !fs.existsSync(path.join(dist, fileFor(p))))
fs.rmSync(ssr, { recursive: true, force: true })
fs.rmSync(path.join(dist, '.vite'), { recursive: true, force: true })
if (missing.length) { console.error('missing pages for sitemap entries:', missing); process.exit(1) }
console.log(`prerendered ${list.length} pages (${matched} with the live site's own head tags, ${added.length} added) + 404 and admin; sitemap, robots and llms files kept, added pages appended`)
void entry
