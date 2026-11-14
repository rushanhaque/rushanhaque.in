// Serves dist/ the way Vercel will: clean URLs (/about is about.html), the redirects from vercel.json, long caching
// for hashed assets, and the 404 page for anything else. For checking a build locally: npm run serve
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../dist')
const port = Number(process.env.PORT || 5312)
const { redirects = [] } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../vercel.json'), 'utf8'))
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' }

const toRegex = (src) => new RegExp(`^${src.replace(/:(\w+)\*/g, '(?<$1>.*)').replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`)
const rules = redirects.filter((r) => !r.has).map((r) => ({ re: toRegex(r.source), to: r.destination }))

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  let p = decodeURIComponent(url.pathname)
  if (p.length > 1 && p.endsWith('/')) { res.writeHead(308, { Location: p.slice(0, -1) + url.search }); return res.end() }
  for (const r of rules) {
    const m = p.match(r.re)
    if (m) { res.writeHead(308, { Location: r.to.replace(/:(\w+)\*?/g, (_, k) => m.groups?.[k] ?? '') }); return res.end() }
  }
  const tries = p === '/' ? ['index.html'] : [p.slice(1), `${p.slice(1)}.html`]
  const file = tries.map((t) => path.join(root, t)).find((f) => f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile())
  const send = (f, status = 200) => {
    const type = TYPES[path.extname(f)] || 'application/octet-stream'
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': f.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache' })
    fs.createReadStream(f).pipe(res)
  }
  if (file) return send(file)
  send(path.join(root, '404.html'), 404)
}).listen(port, () => console.log(`dist on http://localhost:${port}`))
