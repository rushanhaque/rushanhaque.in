// The RH mark and everything made from it: the SVG favicon, the PNG icons (48, 180, 192, 512)
// and the 1200×630 share image. Rendered with headless Chrome so the share image is set in the
// site's own fonts. Run after changing the mark:  node scripts/brand.mjs
//
// The mark: R and H as one ligature. The R's bowl rounds into the H's first stem, which both
// letters share; the R's leg comes down to that stem's foot; one horizontal is the R's bowl
// closing and the H's crossbar. Thick verticals and hairline curves and bars, as in Roman
// inscriptions, with a brass full stop: the point of light the site opens on (Rushan: light).
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const pub = path.join(root, 'public')

export function mark({ ink = '#201814', dot = '#b08a4f', bg = null, rx = 14, thick = 3.6, thin = 1.6 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">${bg ? `<rect width="64" height="64" rx="${rx}" fill="${bg}"/>` : ''}<g stroke="${ink}" stroke-linecap="butt" stroke-linejoin="miter"><path d="M9 13V51M30 13V51M50 13V51M17.5 31L30 51" stroke-width="${thick}"/><path d="M9 13.8H21A8.6 8.6 0 0 1 21 31M9 31H50" stroke-width="${thin}"/><path d="M4.5 51H13.5M25.5 51H34.5M45.5 51H54.5M4.5 13H9M25.5 13H34.5M45.5 13H54.5" stroke-width="${(thin * 0.85).toFixed(2)}"/></g><circle cx="58.6" cy="49" r="2.6" fill="${dot}"/></svg>`
}
// the tile used wherever the mark stands alone: maroon, ivory strokes, a brass point
const tile = (big, rx = 14) => mark({ bg: '#2b1418', rx, ink: '#f6eee4', dot: '#e4c78f', thick: big ? 3.6 : 4.4, thin: big ? 1.6 : 2.2 })

const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => fs.existsSync(p))
if (!chrome) throw new Error('Chrome or Edge is needed to render the PNGs')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-'))
const shot = (name, html, w, h) => {
  const file = path.join(tmp, `${name}.html`)
  fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:transparent}</style>${html}`)
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--default-background-color=00000000', `--window-size=${w},${h}`, `--screenshot=${path.join(pub, name)}`, pathToFileURL(file).href], { stdio: 'ignore' })
}
// iPhones round home-screen icons themselves, so theirs (and the app icons) are square
const icon = (name, size, rx = 14) => shot(name, `<div style="width:${size}px;height:${size}px">${tile(size >= 128, rx).replace('<svg ', `<svg width="${size}" height="${size}" `)}</div>`, size, size)

fs.writeFileSync(path.join(pub, 'favicon.svg'), tile(false) + '\n')
icon('favicon-48.png', 48)
icon('apple-touch-icon.png', 180, 0)
icon('icon-192.png', 192, 0)
icon('icon-512.png', 512, 0)

// the share image: the mark on the night palette, the name, what he does and where
const font = (f) => pathToFileURL(path.join(pub, 'fonts', f)).href
shot('og.png', `<style>
@font-face{font-family:Geist;src:url(${font('geist.woff2')}) format('woff2-variations');font-weight:100 900}
@font-face{font-family:Serif;src:url(${font('instrument-italic.woff2')}) format('woff2');font-style:italic}
@font-face{font-family:Mono;src:url(${font('martian.woff2')}) format('woff2-variations')}
.og{position:relative;width:1200px;height:630px;box-sizing:border-box;display:grid;grid-template-columns:330px 1fr;align-items:center;gap:72px;padding:0 90px;background:radial-gradient(60% 80% at 22% 50%,#3b1d23 0%,#1c0d10 55%,#120a0c 100%);color:#f6eee4;font-family:Geist}
.og svg{width:330px;height:330px}
.k{font:500 15px Mono;letter-spacing:.2em;text-transform:uppercase;color:#e4c78f}
h1{margin:22px 0 0;font:500 96px/0.95 Geist;letter-spacing:-.05em}
p{margin:26px 0 0;font:400 30px/1.3 Geist;letter-spacing:-.02em;color:rgba(246,238,228,.82)}
p em{font-family:Serif;font-size:1.12em;color:#e4c78f}
.r{position:absolute;left:90px;right:90px;bottom:54px;display:flex;justify-content:space-between;font:400 14px Mono;letter-spacing:.18em;text-transform:uppercase;color:rgba(246,238,228,.5);border-top:1px solid rgba(246,238,228,.14);padding-top:18px}
</style><div class="og">${mark({ ink: '#f6eee4', dot: '#e4c78f' })}<div><span class="k">rushanhaque.in</span><h1>Rushan Haque</h1><p>Website developer, designer <em>&amp; writer.</em></p></div><div class="r"><span>Moradabad, India</span><span>Websites · stores · software</span></div></div>`, 1200, 630)

fs.rmSync(tmp, { recursive: true, force: true })
console.log('brand: favicon.svg, favicon-48.png, apple-touch-icon.png, icon-192.png, icon-512.png, og.png')
