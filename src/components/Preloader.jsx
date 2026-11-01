import { useLayoutEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { stopScroll, startScroll } from '../lib/lenis'
import { low, tier } from '../lib/device'

const pad = (n) => String(Math.round(n)).padStart(3, '0')

/**
 * The name, three ways. In the dark, one point of brass light (already painted by the HTML
 * before any script runs, see #boot in scripts/prerender.mjs). While the site loads, the name
 * rises in Hindi, then Urdu, then English, each taking the last one's place. Dust drifts in to the light
 * and a line of light spreads as the gauge; at 100 the line tears open like a horizon and the
 * hero's name gathers from its dots.
 *
 * First visit to the home page only; a tap or a key skips ahead. Every other arrival, reduced
 * motion and entry-level phones go straight to the page.
 */
export default function Preloader({ onReady, onFinish }) {
  const root = useRef(null)
  const dust = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    const boot = document.getElementById('boot')
    let seen = false
    try {
      seen = sessionStorage.getItem('rh:intro') === '1'
      sessionStorage.setItem('rh:intro', '1')
    } catch {
      /* storage unavailable */
    }
    // the page is already on screen (pre-rendered), so step aside before the first paint
    if (seen || reduced() || low() || window.location.pathname !== '/') {
      boot?.remove()
      el.style.display = 'none'
      onReady()
      onFinish()
      return
    }
    stopScroll()
    // the static point of light hands over to this one, drawn in the same place
    boot?.remove()

    const q = gsap.utils.selector(el)
    const phone = window.innerWidth < 760
    const state = { p: 0 }
    const counter = q('.pl__count b')[0]
    // blur is costly to animate on phones; there the words rise and fade without it
    const blur = (px) => (phone ? 'blur(0px)' : `blur(${px}px)`)

    // ---- the dust: specks that drift in to the light, then burst out across the page ----
    const canvas = dust.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    const size = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    const count = Math.round((phone ? 110 : 240) * (tier() === 'mid' ? 0.7 : 1))
    const reach = Math.hypot(W, H) * 0.55
    const specks = Array.from({ length: count }, () => ({
      a: Math.random() * Math.PI * 2,
      r0: reach * (0.35 + Math.random() * 0.65),
      spin: (Math.random() - 0.5) * 0.9,
      s: 0.6 + Math.random() * 1.5,
      lag: Math.random() * 0.35,
      warm: Math.random() < 0.7,
      burst: 0.6 + Math.random() * 1.4,
    }))
    const fx = { gather: 0, burst: 0, fade: 1 }
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      const cx = W / 2
      const cy = H / 2
      for (const d of specks) {
        // each speck comes in on its own delay, spiralling a little, and settles near the light
        const g = Math.min(1, Math.max(0, (fx.gather - d.lag) / (1 - d.lag)))
        const e = 1 - Math.pow(1 - g, 3)
        let r = d.r0 * (1 - e * 0.94)
        const a = d.a + d.spin * e
        r += fx.burst * reach * d.burst
        const x = cx + Math.cos(a) * r * (1 + fx.burst * 0.6)
        const y = cy + Math.sin(a) * r * (1 - fx.burst * 0.55)
        const near = 1 - Math.min(1, r / reach)
        ctx.globalAlpha = (0.18 + near * 0.7) * fx.fade * Math.min(1, g * 3 + fx.burst)
        ctx.fillStyle = d.warm ? '#e4c78f' : '#f6eee4'
        ctx.fillRect(x, y, d.s, d.s)
      }
    }
    gsap.ticker.add(draw)
    window.addEventListener('resize', size)

    // ---- the gauge: real progress (fonts in), never shorter than the words need ----
    const fonts = document.fonts?.ready ?? Promise.resolve()
    const ready = Promise.race([Promise.all([fonts, new Promise((r) => setTimeout(r, 2150))]), new Promise((r) => setTimeout(r, 4500))])
    const show = () => {
      counter.textContent = pad(state.p * 100)
      el.style.setProperty('--p', state.p.toFixed(4))
      fx.gather = state.p
    }

    const intro = gsap.timeline()
      .fromTo(q('.pl__corner'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'expo' }, 0.1)
      .to(state, { p: 0.88, duration: 2.05, ease: 'power1.inOut', onUpdate: show }, 0.05)
    // the name in Hindi, then Urdu, then English, each rising in as the last one leaves; the
    // English one stays until the reveal
    q('.pl__word').forEach((w, i, all) => {
      const at = 0.15 + i * 0.62
      intro.fromTo(w, { yPercent: 60, autoAlpha: 0, filter: blur(8) }, { yPercent: 0, autoAlpha: 1, filter: blur(0), duration: 0.6, ease: 'expo' }, at)
      if (i < all.length - 1) intro.to(w, { yPercent: -50, autoAlpha: 0, filter: blur(6), duration: 0.32, ease: 'power2.in' }, at + 0.42)
    })

    let revealed = false
    const reveal = () => {
      if (revealed) return
      revealed = true
      intro.kill()
      gsap.timeline({ defaults: { ease: 'expo' }, onComplete: finish })
        .to(state, { p: 1, duration: 0.3, ease: 'power2.out', onUpdate: show }, 0)
        .to(q('.pl__corner'), { autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.15)
        .to(q('.pl__word'), { autoAlpha: 0, scale: 1.06, filter: blur(10), duration: 0.45, ease: 'power2.in' }, 0.2)
        // the line flares, and the light swells behind it
        .to(q('.pl__line'), { scaleY: 3, duration: 0.25, ease: 'power2.out' }, 0.3)
        .to(q('.pl__glow'), { scale: 2.3, autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, 0.3)
        .call(onReady, [], 0.5)
        // the horizon tears open: the dark parts in two, carrying the light on its edges
        .set(q('.pl__edge'), { autoAlpha: 1 }, 0.5)
        .set(q('.pl__line'), { autoAlpha: 0 }, 0.52)
        .to(q('.pl__half.is-top'), { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 0.5)
        .to(q('.pl__half.is-bottom'), { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, 0.5)
        .to(q('.pl__edge'), { autoAlpha: 0, duration: 0.6, ease: 'power1.in' }, 1.05)
        .to(q('.pl__glow'), { autoAlpha: 0, scale: 3.2, duration: 0.9, ease: 'power2.out' }, 0.62)
        .to(fx, { burst: 1, duration: 1.4, ease: 'power3.out' }, 0.5)
        .to(fx, { fade: 0, duration: 0.9, ease: 'power1.in' }, 0.9)
    }
    function finish() {
      gsap.ticker.remove(draw)
      startScroll()
      onFinish()
    }
    ready.then(() => { if (!revealed) intro.then(reveal) })
    // a tap, a click or a key and the reveal starts now
    const skip = () => reveal()
    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })

    return () => {
      gsap.ticker.remove(draw)
      window.removeEventListener('resize', size)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      gsap.killTweensOf([state, fx])
    }
  }, [])

  return (
    <div className="pl" ref={root} aria-hidden="true">
      <div className="pl__half is-top"><i className="pl__edge" /></div>
      <div className="pl__half is-bottom"><i className="pl__edge" /></div>
      <i className="pl__glow" />
      <canvas className="pl__dust" ref={dust} />
      <i className="pl__line" />
      <div className="pl__words">
        <span className="pl__word is-hi" lang="hi">रुशान</span>
        <span className="pl__word is-ur" lang="ur" dir="rtl">رشان</span>
        <span className="pl__word is-en">Rushan</span>
      </div>
      <span className="pl__corner is-tl">Rushan Haque</span>
      <span className="pl__corner is-tr pl__count"><b>000</b>%</span>
      <span className="pl__corner is-bl">Moradabad, India</span>
      <span className="pl__corner is-br">Developer &amp; writer</span>
    </div>
  )
}
