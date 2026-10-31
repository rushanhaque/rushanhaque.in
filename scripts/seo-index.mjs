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
console.log(`seo index: ${pages.length} pages`)
