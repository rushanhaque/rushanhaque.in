// The whole animation engine: one frame loop, a handful of curves and a tween. Small on purpose: it replaces a
// 40 kB library, and everything that can be a CSS transition is one. Nothing here runs unless something asked.

const subs = new Set()
let raf = 0
let last = 0
function loop(t) {
  const dt = last ? Math.min(t - last, 64) : 16.67
  last = t
  for (const f of [...subs]) f(t, dt)
  if (subs.size) raf = requestAnimationFrame(loop)
  else { raf = 0; last = 0 }
}
export const ticker = {
  add(f) { subs.add(f); if (!raf) raf = requestAnimationFrame(loop) },
  remove(f) { subs.delete(f) },
}

export const ease = {
  linear: (t) => t,
  power2Out: (t) => 1 - (1 - t) ** 3,
  power3Out: (t) => 1 - (1 - t) ** 4,
  power2In: (t) => t ** 3,
  power2InOut: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  power3InOut: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
  expoOut: (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  expoInOut: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2),
}

const live = new Map()
/** Tweens numeric properties of a plain object. Returns { kill }. */
export function tween(target, to, { duration = 1, ease: curve = ease.expoOut, delay = 0, onStart, onUpdate, onComplete } = {}) {
  const from = {}
  let t0 = 0
  let started = false
  let dead = false
  const tw = {
    kill() {
      dead = true
      ticker.remove(step)
      live.get(target)?.delete(tw)
    },
  }
  function step(now) {
    if (dead) return
    if (!t0) t0 = now + delay * 1000
    if (now < t0) return
    if (!started) {
      started = true
      for (const k in to) from[k] = target[k]
      onStart?.()
    }
    const p = duration > 0 ? Math.min(1, (now - t0) / (duration * 1000)) : 1
    const v = curve(p)
    for (const k in to) target[k] = from[k] + (to[k] - from[k]) * v
    onUpdate?.()
    if (p >= 1) { tw.kill(); onComplete?.() }
  }
  if (!live.has(target)) live.set(target, new Set())
  live.get(target).add(tw)
  ticker.add(step)
  return tw
}
export const killTweensOf = (target) => { live.get(target)?.forEach((t) => t.kill()) }

/** Follows a value smoothly: call the returned function with a new goal. */
export function follow(target, key, { duration = 0.55, onUpdate } = {}) {
  let goal = target[key]
  let running = false
  const k = 4.6 / (duration * 1000)
  const step = (_, dt) => {
    const d = goal - target[key]
    if (Math.abs(d) < 0.0004) { target[key] = goal; onUpdate?.(); ticker.remove(step); running = false; return }
    target[key] += d * (1 - Math.exp(-k * dt))
    onUpdate?.()
  }
  const to = (v) => { goal = v; if (!running) { running = true; ticker.add(step) } }
  to.stop = () => { ticker.remove(step); running = false }
  return to
}

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const range = (v, a, b) => clamp((v - a) / (b - a))
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

/**
 * Ties a function to how far an element has travelled through the screen, like a scrubbed timeline.
 * start/end are viewport fractions where the element's top meets `start` (progress 0) and its bottom meets `end`
 * (progress 1). It only runs while the element is near the screen, and smooths by `smooth` seconds.
 */
export function scrub(el, { start = 1, end = 0, smooth = 0.3, onUpdate }) {
  let cur = -1
  let goal = 0
  let on = false
  const k = smooth > 0 ? 4.6 / (smooth * 1000) : 1
  const measure = () => {
    const r = el.getBoundingClientRect()
    const h = innerHeight
    const a = r.top - h * start
    const b = r.bottom - h * end
    goal = clamp(-a / (b - a || 1))
  }
  const step = (_, dt) => {
    measure()
    if (cur < 0) cur = goal
    const d = goal - cur
    cur = Math.abs(d) < 0.0004 ? goal : cur + d * (smooth > 0 ? 1 - Math.exp(-k * dt) : 1)
    onUpdate(cur)
    if (!on && cur === goal) ticker.remove(step)
  }
  const io = new IntersectionObserver(([e]) => {
    on = e.isIntersecting
    if (on) ticker.add(step)
  }, { rootMargin: '25% 0px' })
  io.observe(el)
  return () => { io.disconnect(); ticker.remove(step) }
}
