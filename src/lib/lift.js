import { gsap } from './gsap'

// A row of letters as columns you can push: the ones nearest the pointer lift. The height is kept apart from any
// other transform on the letter, and nothing runs once they have settled. Returns a function that stops it.
export function lift(el, letters, { gain = 0.16, spread = 90, when = () => true } = {}) {
  const cur = letters.map(() => 1)
  const aim = letters.map(() => 1)
  let centres = null
  let running = false

  const tick = () => {
    let moving = false
    for (let i = 0; i < letters.length; i++) {
      const d = aim[i] - cur[i]
      if (Math.abs(d) < 0.0006) { if (cur[i] !== aim[i]) { cur[i] = aim[i]; letters[i].style.scale = cur[i] === 1 ? '' : `1 ${cur[i].toFixed(4)}` }; continue }
      cur[i] += d * 0.11
      letters[i].style.scale = `1 ${cur[i].toFixed(4)}`
      moving = true
    }
    if (!moving) { gsap.ticker.remove(tick); running = false }
  }
  const run = () => { if (!running) { running = true; gsap.ticker.add(tick) } }
  const rest = () => { aim.fill(1); run() }
  const move = (e) => {
    if (!when()) { rest(); return }
    centres ??= letters.map((c) => { const r = c.getBoundingClientRect(); return r.left + r.width / 2 })
    const w = innerWidth
    for (let i = 0; i < letters.length; i++) {
      const d = (e.clientX - centres[i]) / w
      aim[i] = 1 + Math.exp(-d * d * spread) * gain
    }
    run()
  }
  const forget = () => { centres = null }
  const leave = () => { forget(); rest() }
  const up = (e) => { if (e.pointerType === 'touch') leave() }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerdown', move)
  el.addEventListener('pointerleave', leave)
  el.addEventListener('pointerup', up)
  addEventListener('resize', forget)
  return () => {
    gsap.ticker.remove(tick)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerdown', move)
    el.removeEventListener('pointerleave', leave)
    el.removeEventListener('pointerup', up)
    removeEventListener('resize', forget)
  }
}
