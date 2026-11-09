// Takes the search-engine side of the live website, exactly as it is, so the new design can go live without changing
// it: every page's title, description, canonical and alternate links, social cards and structured data, plus the
// sitemap, robots.txt and llms files. The prerender then puts these back on each page (scripts/prerender.mjs).
// Usage: node scripts/snapshot-seo.mjs <path to the live site's built dist folder>
import fs from 'node:fs'
import path from 'node:path'

const from = process.argv[2]
if (!from) { console.error('usage: node scripts/snapshot-seo.mjs <live dist>'); process.exit(1) }
const to = path.resolve(import.meta.dirname, '../seo')
fs.mkdirSync(to, { recursive: true })

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
// the tags that are about search and sharing, not about how the page looks or runs
const SEO = /<title>[\s\S]*?<\/title>|<meta\s+(?:name|property)="(?!viewport|theme-color)[^"]+"[^>]*>|<link\s+rel="(?:canonical|alternate)"[^>]*>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g
const heads = {}
for (const file of walk(from).filter((f) => f.endsWith('.html'))) {
  const rel = path.relative(from, file).split(path.sep).join('/')
  const html = fs.readFileSync(file, 'utf8')
  const head = html.slice(0, html.indexOf('</head>'))
  heads[rel] = { lang: (html.match(/<html lang="([^"]+)"/) || [])[1] || 'en', tags: head.match(SEO) || [] }
}
fs.writeFileSync(path.join(to, 'heads.json'), JSON.stringify(heads, null, 1))
// and each page's title and description on their own, for moving between pages inside the site
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const titles = {}
for (const [rel, v] of Object.entries(heads)) {
  const p = '/' + rel.replace(/.html$/, '').replace(/^index$/, '')
  const t = v.tags.find((x) => x.startsWith('<title>'))
  const d = v.tags.find((x) => /name="description"/.test(x))
  titles[p] = { title: t ? dec(t.slice(7, -8)) : undefined, description: d ? dec(d.match(/content="([^"]*)/)[1]) : undefined }
}
fs.writeFileSync(path.join(to, 'titles.json'), JSON.stringify(titles))
for (const f of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt']) if (fs.existsSync(path.join(from, f))) fs.copyFileSync(path.join(from, f), path.join(to, f))
console.log(`kept the search side of ${Object.keys(heads).length} pages in ${to}`)
