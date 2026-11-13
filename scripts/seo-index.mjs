// Writes src/data/seo/index.json: just the slug, title and kind of every guide, service and area
// page. The header and footer link to all of them from every page, and this keeps the full text
// of those pages out of the bundle every visitor downloads. Runs before `dev` and `build`.
import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve(import.meta.dirname, '../src/data/seo')
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
const guides = read('guides.json')
const sources = read('source-pages.json')

const pages = [
  ...sources.map((p) => ({ slug: p.slug, title: p.title, kind: p.kind === 'Service' ? 'service' : 'area', ...(p.kind === 'Service' ? { description: p.description } : {}) })),
  ...guides.map((g) => ({ slug: g.slug, title: g.title, kind: g.group || 'guide', ...(g.lang === 'hi' ? { lang: 'hi' } : {}) })),
]
fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(pages, null, 1) + '\n')

// And each page's own words in a file of its own, so a landing page downloads only itself rather than all of them
// (lib/seoPage.js). The title is the one its <head> carries (lib/seo.js), for when it is reached inside the site.
const extras = read('seo-extras.json')
const T = (s) => (s.length + 15 <= 70 ? `${s} | Rushan Haque` : s)
const out = path.join(dir, 'pages')
fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out)
for (const g of guides) {
  fs.writeFileSync(path.join(out, `${g.slug}.json`), JSON.stringify({ guide: g, title: g.metaTitle.includes('Rushan') ? g.metaTitle : T(g.metaTitle) }))
}
for (const p of sources) {
  const extra = extras[p.slug] || null
  fs.writeFileSync(path.join(out, `${p.slug}.json`), JSON.stringify({ page: p, extra, title: T(extra?.metaTitle ?? p.title) }))
}
// The Services page: every one of these pages by kind, with the line that says what each is about. Kept out of
// index.json, which every page carries; only the Services page loads it.
const hub = { services: [], industries: [], guides: [], areas: [] }
for (const p of sources) {
  if (p.kind === 'Service') hub.services.push({ slug: p.slug, title: p.title, description: p.description })
  else hub.areas.push({ slug: p.slug, name: p.title.replace(/^Website designer in /, '') })
}
for (const g of guides) {
  const entry = { slug: g.slug, title: g.title, description: g.description, ...(g.lang === 'hi' ? { lang: 'hi' } : {}) }
  if (g.group === 'industry') hub.industries.push(entry)
  else if (g.group === 'area') hub.areas.push({ slug: g.slug, name: g.title.replace(/^Website designer in /, '') })
  else hub.guides.push(entry)
}
hub.areas.sort((a, b) => (a.name === 'Moradabad' ? -1 : b.name === 'Moradabad' ? 1 : a.name.localeCompare(b.name)))
fs.writeFileSync(path.join(dir, 'hub.json'), JSON.stringify(hub))
console.log(`seo index: ${pages.length} pages`)
