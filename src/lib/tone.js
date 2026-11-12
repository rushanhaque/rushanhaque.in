import { gsap } from './gsap'
import { device } from './device'

// The page wears one palette at a time, and it changes as you walk: each block says which tone it belongs to,
// and when it crosses the line just below the middle of the screen, the whole screen turns to that tone.
//
//   data-tone="ivory"   this block follows the page, and asks for ivory when it arrives
//   data-fixed="night"  this block always wears night; a top-level one also asks the page to turn
//   data-wear="night"   this block always wears night and leaves the page alone; the bar borrows its palette
//                       while it is the thing behind the bar, or its words would be the page's ink on this
//                       block's ground, which is how a dark room under a light page loses its header
//   data-at="0.5"       ask when this far down the block reaches the line, rather than its top
//
// Writing colours on the root would restyle every element on the page, every frame (measured: 78ms a frame on a
// slow phone). So the root changes once, which sends everything off screen straight to the new tone, and only
// what is on screen crossfades. Even there the work is split: a block's own background is one property on one
// element, so it can move every frame, while the colours its contents read from have to restyle all of them, so
// those only move in the short middle of the crossing. That is also what looks best: the ground passes slowly
// through a warm dusk rather than grey, and text crosses quickly, so it is never hard to read for long.

const TOKENS = ['--paper-rgb', '--card-rgb', '--stone-rgb', '--ink-rgb', '--accent-rgb', '--on-accent-rgb', '--on-ink-rgb']
const LINE = 0.55
const DURATION = 0.95
const TEXT_FROM = 0.26 // the part of the crossing in which the contents change colour
const TEXT_TO = 0.74

let current = null
let shown = null // what the screen shows right now, as OKLab: { ground, tokens }
let tween = null
let blocks = []
let first = null
let lastY = -1
let vh = 1
let scheduled = false
let dirty = false
let bar = null
let wears = [] // blocks that wear their own tone without asking the page to turn
let worn = null // which of them the bar is sitting on, if any
const live = new Set()
const fresh = new Set()
const palettes = {}

// -- colour ------------------------------------------------------------------------------------
const linear = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const gamma = (v) => { const c = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055; return Math.round(Math.min(1, Math.max(0, c)) * 255) }
const toLab = ([r8, g8, b8]) => {
  const r = linear(r8), g = linear(g8), b = linear(b8)
  const l = Math.cbrt(0.4122 * r + 0.5363 * g + 0.0514 * b)
  const m = Math.cbrt(0.2119 * r + 0.6807 * g + 0.1074 * b)
  const s = Math.cbrt(0.0883 * r + 0.2817 * g + 0.6300 * b)
  return [0.2105 * l + 0.7936 * m - 0.0041 * s, 1.978 * l - 2.4286 * m + 0.4506 * s, 0.0259 * l + 0.7828 * m - 0.8087 * s]
}
const toRgb = ([L, a, b]) => {
  const l = (L + 0.3963 * a + 0.2158 * b) ** 3
  const m = (L - 0.1056 * a - 0.0639 * b) ** 3
  const s = (L - 0.0895 * a - 1.2915 * b) ** 3
  return `${gamma(4.0767 * l - 3.3077 * m + 0.2310 * s)} ${gamma(-1.2684 * l + 2.6098 * m - 0.3413 * s)} ${gamma(-0.0041 * l - 0.7034 * m + 1.7076 * s)}`
}

// the palettes themselves live in the stylesheet, and are read from it once
function palette(name) {
  if (palettes[name]) return palettes[name]
  const probe = document.createElement('i')
  probe.setAttribute('data-fixed', name)
  probe.hidden = true
  document.body.append(probe)
  const css = getComputedStyle(probe)
  palettes[name] = TOKENS.map((t) => toLab(css.getPropertyValue(t).trim().split(/\s+/).map(Number)))
  probe.remove()
  return palettes[name]
}

// What the bar is sitting on. A block that wears its own tone leaves the page alone, so the bar has to notice it
// itself, or its words stay the page's ink over that block's ground — which is how a dark room under a light page
// loses its header altogether.
function dressBar() {
  // found here too: a page that opens on a block with its own tone never cross-fades, which is where it was found before
  bar ??= document.querySelector('.bar')
  if (!bar) return
  const y = scrollY + 32
  const over = wears.find((w) => w.top < y && w.bottom > y)
  const name = over ? over.tone : null
  if (name === worn) return
  worn = name
  if (name) {
    // hand the bar to the stylesheet, which already knows every palette by name
    for (const t of TOKENS) bar.style.removeProperty(t)
    bar.dataset.wear = name
    return
  }
  // and take it back: until the next crossing writes them again, the bar reads the page's own tokens
  delete bar.dataset.wear
  dirty = true
}

const smooth = (t, a, b) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k) }

// -- on screen ---------------------------------------------------------------------------------
function gather(y) {
  for (const b of blocks) {
    if (b.fixed || b.height <= 0 || live.has(b.el)) continue
    if (b.top < y + vh * 1.06 && b.bottom > y - vh * 0.06) { live.add(b.el); fresh.add(b.el) }
  }
}

const writeTokens = (el, strings) => { for (let i = 0; i < TOKENS.length; i++) el.style.setProperty(TOKENS[i], strings[i]) }

// inside: this frame also changes what the contents read
function paint(inside) {
  const ground = `rgb(${toRgb(shown.ground)})`
  document.documentElement.style.backgroundColor = ground
  const strings = inside || fresh.size ? shown.tokens.map(toRgb) : null
  for (const el of live) {
    el.style.backgroundColor = ground
    if (inside || fresh.has(el)) writeTokens(el, strings)
  }
  fresh.clear()
  // The bar has little in it and sits on the ground itself, so it simply keeps pace — unless what is behind it
  // is a block wearing its own tone, in which case it wears that one too and stays readable against it.
  if (bar && !worn) {
    if (strings) writeTokens(bar, strings)
    bar.style.setProperty(TOKENS[0], toRgb(shown.ground))
  }
}

function release() {
  for (const el of live) {
    for (const t of TOKENS) el.style.removeProperty(t)
    el.style.removeProperty('background-color')
  }
  if (bar) for (const t of TOKENS) bar.style.removeProperty(t)
  live.clear()
  fresh.clear()
  document.documentElement.style.removeProperty('background-color')
  shown = null
  tween = null
}

const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]

function setTone(name, instant) {
  if (name === current) return
  const html = document.documentElement
  const was = shown || (current ? { ground: palette(current)[0], tokens: palette(current) } : null)
  current = name
  tween?.kill()
  const to = palette(name)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `rgb(${toRgb(to[0])})`)
  if (instant || !was) {
    release()
    html.dataset.tone = name
    return
  }
  // what is on screen holds its colours for a moment, and everything else changes at once
  bar ??= document.querySelector('.bar')
  const startGround = [...was.ground]
  const startTokens = was.tokens.map((c) => [...c])
  shown = { ground: startGround, tokens: startTokens }
  gather(scrollY)
  // anything left over from a crossing cut short already holds its colours, and is simply carried on from there
  for (const el of live) fresh.add(el)
  paint(true)
  html.dataset.tone = name
  const span = Math.abs(to[0][0] - startGround[0])
  const state = { t: 0 }
  const touch = device().touch
  let wrote = 0
  let last = false
  tween = gsap.to(state, {
    t: 1,
    duration: DURATION,
    ease: 'none',
    onUpdate: () => {
      const inside = state.t >= TEXT_FROM && state.t <= TEXT_TO
      // a phone is given half the frames while the contents are changing: a fade this quick looks no different
      const now = performance.now()
      if (touch && inside && now - wrote < 30) return
      wrote = now
      gather(scrollY)
      const k = smooth(state.t, 0, 1)
      const dusk = Math.sin(Math.PI * k) * span
      const ground = mix(startGround, to[0], k)
      ground[1] += 0.024 * dusk
      ground[2] += 0.034 * dusk
      const text = smooth(state.t, TEXT_FROM, TEXT_TO)
      shown = { ground, tokens: startTokens.map((c, i) => mix(c, to[i], text)) }
      // one last write on the way out of the window, so the contents land exactly on their colours
      const landing = !inside && state.t > TEXT_TO && !last
      if (landing) last = true
      paint(inside || landing)
    },
    onComplete: release,
  })
}

// -- which tone we should be in ------------------------------------------------------------------
function want(y) {
  const line = y + vh * LINE
  let tone = blocks[0]?.tone
  for (const b of blocks) {
    if (b.at > line) break
    tone = b.tone
  }
  return tone
}

function measure() {
  scheduled = false
  const main = document.getElementById('main')
  const found = [...main.querySelectorAll('[data-tone], [data-fixed]')]
    .filter((el) => el.dataset.tone || !main.contains(el.parentElement.closest('[data-tone], [data-fixed]')))
  if (!found.length) return
  vh = innerHeight
  const y = scrollY
  blocks = found.map((el) => {
    const r = el.getBoundingClientRect()
    const top = r.top + y
    return {
      el,
      top,
      bottom: top + r.height,
      height: r.height,
      at: top + r.height * parseFloat(el.dataset.at || 0),
      fixed: !!el.dataset.fixed,
      tone: el.dataset.tone || el.dataset.fixed,
    }
  }).sort((a, b) => a.at - b.at)
  // A pinned room is held still by the scroll, so while it is pinned its own box says where it is on the screen
  // rather than where it sits on the page. The spacer left in its place is the one that still knows.
  wears = [...main.querySelectorAll('[data-wear]')].map((el) => {
    const box = el.closest('.pin-spacer') || el
    const r = box.getBoundingClientRect()
    const top = r.top + y
    return { top, bottom: top + r.height, tone: el.dataset.wear }
  })
  // a new page starts in its own tone, with nothing to cross from
  const isNew = found[0] !== first
  first = found[0]
  const tone = want(y)
  if (isNew && tone) setTone(tone, true)
  dirty = true
}

// called whenever the page may have changed shape: everything added in one commit is measured once
export function measureTones() {
  if (typeof window === 'undefined' || device().reduced || scheduled) return
  scheduled = true
  queueMicrotask(measure)
}

// called every tick by the director
export function toneTick() {
  const y = scrollY
  if (y === lastY && !dirty) return
  lastY = y
  dirty = false
  const tone = want(y)
  if (tone) setTone(tone, false)
  dressBar()
}
