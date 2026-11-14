// Runs before dev and build. Splits the guide, service and area pages into one small file each, so a visitor
// to one of them downloads only its own words, and writes index.json: the slug, title and kind of every page,
// light enough for the footer to link to all of them from every page.
import fs from 'node:fs'
import path from 'node:path'

const dir = path.resolve(import.meta.dirname, '../src/data/seo')
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
const guides = read('guides.json')
const sources = read('source-pages.json')
const extras = read('seo-extras.json')

const index = [
  ...sources.map((p) => ({ slug: p.slug, title: p.title, kind: p.kind === 'Service' ? 'service' : 'area', ...(p.kind === 'Service' ? { description: p.description } : {}) })),
  ...guides.map((g) => ({ slug: g.slug, title: g.title, kind: g.group || 'guide', ...(g.lang === 'hi' ? { lang: 'hi' } : {}) })),
]
fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 1) + '\n')

const out = path.join(dir, 'pages')
fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })
for (const g of guides) fs.writeFileSync(path.join(out, `${g.slug}.json`), JSON.stringify({ guide: g }))
for (const p of sources) fs.writeFileSync(path.join(out, `${p.slug}.json`), JSON.stringify({ page: p, extra: extras[p.slug] || null }))
console.log(`seo: ${index.length} pages split`)
