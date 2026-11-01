// The RH mark and everything made from it: the SVG favicon, the PNG icons (48, 180, 192, 512)
// and the 1200×630 share image. Rendered with headless Chrome so the share image is set in the
// site's own fonts. Run after changing the mark:  node scripts/brand.mjs
//
// The mark: R and H cut like a high-contrast Roman, thick stems and hairline bars and serifs,
// the R's bowl swelling at its right. The letters stand apart, and the H's crossbar runs on past
// the letter to a brass full stop: a line drawn out to the point of light the site opens on
// (Rushan: light). The same drawing as src/components/Logo.jsx.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const pub = path.join(root, 'public')

// square: the mark centred on a square sheet (the icons); otherwise its own 72 × 48 box
export function mark({ ink = '#201814', dot = '#b08a4f', bg = null, rx = 14, T = 3.8, t = 1.3, r = 2.5, square = false } = {}) {
  const sv = t * 0.85
  const top = 8 + sv / 2
  const base = 40 - sv / 2
  const box = square ? '-6.3 -18 84 84' : '0 0 72 48'
  const [bx, by, bw, bh] = box.split(' ')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none">${bg ? `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${(rx * bw) / 64}" fill="${bg}"/>` : ''}<g fill="${ink}"><path d="M17 8.2A8.4 8.4 0 0 1 17 25L17 23.7A5 7.1 0 0 0 17 9.5Z"/><path d="M12.4 24.4L15.9 24.4L25.4 40L21.7 40Z"/></g><g stroke="${ink}" stroke-linecap="butt"><path d="M8 8V40M35 8V40M53 8V40" stroke-width="${T}"/><path d="M8 8.85H17M8 24.35H17M35 24H64" stroke-width="${t}"/><path d="M3.6 ${top}H8M3.6 ${base}H12.4M19.6 ${base}H27.2M30.6 ${top}H39.4M48.6 ${top}H57.4M30.6 ${base}H39.4M48.6 ${base}H57.4" stroke-width="${sv.toFixed(2)}"/></g><circle cx="67.4" cy="24" r="${r}" fill="${dot}"/></svg>`
}
// the tile used wherever the mark stands alone: maroon, ivory strokes, a brass point
const tile = (big, rx = 14) => mark({ bg: '#241419', rx, ink: '#f6eee4', dot: '#e4c78f', square: true, T: big ? 4 : 5.4, t: big ? 1.5 : 2.6, r: big ? 2.8 : 3.6 })

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
.og{position:relative;width:1200px;height:630px;box-sizing:border-box;display:grid;grid-template-columns:360px 1fr;align-items:center;gap:72px;padding:0 90px;background:radial-gradient(60% 80% at 22% 50%,#372028 0%,#1a0e12 55%,#120a0c 100%);color:#f6eee4;font-family:Geist}
.og svg{width:360px;height:240px}
.k{font:500 15px Mono;letter-spacing:.2em;text-transform:uppercase;color:#e4c78f}
h1{margin:22px 0 0;font:500 84px/0.95 Geist;letter-spacing:-.05em;white-space:nowrap}
p{margin:26px 0 0;font:400 30px/1.3 Geist;letter-spacing:-.02em;color:rgba(246,238,228,.82)}
p em{font-family:Serif;font-size:1.12em;color:#e4c78f}
.r{position:absolute;left:90px;right:90px;bottom:54px;display:flex;justify-content:space-between;font:400 14px Mono;letter-spacing:.18em;text-transform:uppercase;color:rgba(246,238,228,.5);border-top:1px solid rgba(246,238,228,.14);padding-top:18px}
</style><div class="og">${mark({ ink: '#f6eee4', dot: '#e4c78f' })}<div><span class="k">rushanhaque.in</span><h1>Rushan Haque</h1><p>Website developer, designer <em>&amp; writer.</em></p></div><div class="r"><span>Moradabad, India</span><span>Websites · stores · software</span></div></div>`, 1200, 630)

fs.rmSync(tmp, { recursive: true, force: true })
console.log('brand: favicon.svg, favicon-48.png, apple-touch-icon.png, icon-192.png, icon-512.png, og.png')
