import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced } from '../lib/gsap'
import { setTheme } from '../lib/theme'
import { useApp } from '../lib/app'
import { site } from '../config/site'
import HeroShader from '../components/HeroShader'
import NameDots from '../components/NameDots'

// From the previous portfolio: "Developer" resolves out of code first, then "& writer." joins it.
// They hold, then play again, and only while the hero is on screen.
function HeroRoles({ ready }) {
  const dev = useRef(null)
  const wri = useRef(null)
  useGSAP(
    () => {
      const d = dev.current
      const w = wri.current
      if (!ready || reduced()) return
      const chars = 'abcdefghijklmnopqrstuvwxyz{}[]()<>/=;:.*+-_'
      const word = (el, code, text, serif) =>
        gsap.timeline()
          .call(() => { el.className = `hero__role is-code${serif ? ' is-serif-slot' : ''}`; el.textContent = '' })
          .to(el, { duration: 0.7, ease: 'none', scrambleText: { text: code, chars, speed: 0.9, revealDelay: 0.1 } })
          .call(() => { el.className = `hero__role${serif ? ' is-serif' : ''}` })
          .to(el, { duration: 0.9, ease: 'none', scrambleText: { text, chars, speed: 0.6, revealDelay: 0.2 } })
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3, delay: 1.6 })
        .call(() => { d.textContent = ''; w.textContent = '' })
        .add(word(d, '<developer />', 'Developer', false))
        .add(word(w, '// & writer', '& writer.', true), '+=0.15')
        .to({}, { duration: 3.2 })
      const st = ScrollTrigger.create({ trigger: d, start: 'top bottom', end: 'bottom top', onToggle: (self) => (self.isActive ? tl.resume() : tl.pause()) })
      return () => {
        st.kill()
        tl.kill()
        d.textContent = 'Developer'
        d.className = 'hero__role'
        w.textContent = '& writer.'
        w.className = 'hero__role is-serif'
      }
    },
    { dependencies: [ready] },
  )
  return (
    <p className="hero__roles">
      <span className="sr-only">Developer and writer.</span>
      <span className="hero__role" ref={dev} aria-hidden="true">Developer</span>{' '}
      <span className="hero__role is-serif" ref={wri} aria-hidden="true">&amp; writer.</span>
    </p>
  )
}

/**
 * The name, drawn in dots over liquid wine, and what I do beneath it. Scrolling blows the dots apart and dilates an
 * aperture that opens onto the ivory of the next chapter. The real name stays in the page,
 * invisible, for the dots to sample and for screen readers.
 */
export default function Hero() {
  const root = useRef(null)
  const progress = useRef(0)
  const { ready } = useApp()

  useGSAP(
    () => {
      setTheme('night', true)
      if (reduced()) return
      const q = gsap.utils.selector(root)
      const phone = window.innerWidth < 900
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: phone ? '+=110%' : '+=150%',
            scrub: 0.9,
            pin: true,
            onUpdate: (s) => {
              progress.current = s.progress
              setTheme(s.progress > 0.78 ? 'ivory' : 'night')
            },
          },
        })
        .to(q('.hero__cue'), { autoAlpha: 0, duration: 0.15 }, 0)
        .to(q('.hero__roles'), { autoAlpha: 0, y: -24, duration: 0.2 }, 0)
        .fromTo(q('.hero__aperture'), { clipPath: 'circle(0% at 50% 55%)' }, { clipPath: 'circle(76% at 50% 55%)', ease: 'power2.in', duration: 0.85 }, 0.08)
        .fromTo(q('.hero__ring'), { scale: 0.2, autoAlpha: 0 }, { scale: 3.2, autoAlpha: 1, ease: 'power2.in', duration: 0.85 }, 0.02)
        .fromTo(q('.hero__next > *'), { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, ease: 'power3.out', duration: 0.32 }, 0.62)
        .to({}, { duration: 0.12 })
    },
    { scope: root },
  )

  useGSAP(
    () => {
      if (!ready) return
      gsap.from(root.current.querySelectorAll('.hero__roles, .hero__cue, .hero__meta'), { autoAlpha: 0, y: 16, duration: 1.1, delay: 1.2, stagger: 0.15 })
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section className="hero" ref={root} id="top" aria-label="Introduction">
      <HeroShader intro={ready} progress={progress} />
      <NameDots intro={ready} progress={progress} />
      <div className="hero__inner">
        <h1 className="hero__name" aria-label={site.name}>
          <span className="hero__line hero__l1"><span className="hero__txt">Rushan</span></span>{' '}
          <span className="hero__line hero__l2"><span className="hero__txt"><em>Haque</em></span></span>
        </h1>
        <HeroRoles ready={ready} />
        <span className="hero__cue" aria-hidden="true"><i /></span>
        <p className="hero__meta hero__meta--l">{site.city}, India <span>28.84° N, 78.77° E</span></p>
        <p className="hero__meta hero__meta--r">Selected work <span>2024 — {new Date().getFullYear()}</span></p>
      </div>
      <span className="hero__ring" aria-hidden="true" />
      <div className="hero__aperture" aria-hidden="true">
        <div className="hero__next wrap">
          <span className="hero__next-kick">{site.role} · {site.city}</span>
          <p className="hero__next-line">Interfaces, builds and the client care <em>in between.</em></p>
        </div>
      </div>
    </section>
  )
}
