import { gsap, reduced } from './gsap'
import { low } from './device'

// Sections declare data-theme; the whole page tweens between these palettes as they arrive.
export const themes = {
  night: { '--bg': '#120a0c', '--fg': '#ffffff', '--muted': 'rgba(255, 255, 255, 0.6)', '--line': 'rgba(255, 255, 255, 0.14)', '--card': '#1a0f12', '--accent': '#D9B97E', '--hi': '#2A1219' },
  ivory: { '--bg': '#FFFFFF', '--fg': '#201814', '--muted': 'rgba(32, 24, 20, 0.6)', '--line': 'rgba(32, 24, 20, 0.12)', '--card': '#F5F1EE', '--accent': '#4a2228', '--hi': '#FFFFFF' },
  stone: { '--bg': '#F7F4F1', '--fg': '#201814', '--muted': 'rgba(32, 24, 20, 0.6)', '--line': 'rgba(32, 24, 20, 0.13)', '--card': '#EFE9E4', '--accent': '#4a2228', '--hi': '#FFFFFF' },
  wine: { '--bg': '#2b1418', '--fg': '#ffffff', '--muted': 'rgba(255, 255, 255, 0.62)', '--line': 'rgba(255, 255, 255, 0.16)', '--card': '#36191e', '--accent': '#D9B97E', '--hi': '#3f2026' },
}
const DARK = ['night', 'wine']
const TIME = 1.15

let current = null
let atmos = null

/**
 * The rooms of the home page share one backdrop (see .atmos): its sections are see-through and
 * take their colours from the page, so when you cross from a light room into a dark one the whole
 * screen changes, not just the section. The new colour opens out from the line where the rooms
 * meet, the way the loader's horizon does, with a thread of brass on each edge; a change between
 * two light rooms (or two dark ones) simply fades.
 */
export function rooms(on) {
  const html = document.documentElement
  html.classList.toggle('has-rooms', on)
  if (!on) return
  if (!atmos) {
    const el = document.createElement('div')
    el.className = 'atmos'
    el.setAttribute('aria-hidden', 'true')
    el.innerHTML = '<i class="atmos__wash"></i><i class="atmos__edge"></i><i class="atmos__edge"></i>'
    document.body.prepend(el)
    const [wash, top, bottom] = el.children
    atmos = { el, wash, top, bottom }
  }
  // arriving on the page, the backdrop starts as the room you are in
  gsap.killTweensOf([atmos.el, atmos.wash, atmos.top, atmos.bottom])
  gsap.set([atmos.wash, atmos.top, atmos.bottom], { autoAlpha: 0 })
  delete atmos.wash.dataset.to
  atmos.el.style.backgroundColor = themes[current || 'ivory']['--bg']
}

function paint(name, from, immediate, y) {
  if (!atmos || !document.documentElement.classList.contains('has-rooms')) return
  const { el, wash, top, bottom } = atmos
  const to = themes[name]['--bg']
  // a change still opening when the next one comes is finished at once
  gsap.killTweensOf([el, wash, top, bottom])
  if (wash.dataset.to) el.style.backgroundColor = wash.dataset.to
  gsap.set([wash, top, bottom], { autoAlpha: 0 })
  delete wash.dataset.to
  const turn = from && DARK.includes(from) !== DARK.includes(name)
  if (immediate || reduced()) { el.style.backgroundColor = to; return }
  if (!turn || low()) { gsap.to(el, { backgroundColor: to, duration: low() ? 0.5 : 0.9, ease: 'silk' }); return }
  const h = window.innerHeight
  const at = Math.min(100, Math.max(0, (y / h) * 100))
  wash.dataset.to = to
  wash.style.backgroundColor = to
  gsap.fromTo(wash, { autoAlpha: 1, clipPath: `inset(${at}% 0% ${100 - at}% 0%)` }, {
    clipPath: 'inset(0% 0% 0% 0%)', duration: TIME, ease: 'silk',
    onComplete: () => { el.style.backgroundColor = to; delete wash.dataset.to; gsap.set(wash, { autoAlpha: 0 }) },
  })
  // the light on the two edges travels out with them and burns down as it goes
  gsap.fromTo(top, { y, autoAlpha: 1 }, { y: 0, duration: TIME, ease: 'silk' })
  gsap.fromTo(bottom, { y, autoAlpha: 1 }, { y: h, duration: TIME, ease: 'silk' })
  gsap.to([top, bottom], { autoAlpha: 0, duration: TIME * 0.7, delay: TIME * 0.3, ease: 'power1.in' })
}

export function setTheme(name, immediate = false, y = window.innerHeight / 2) {
  if (!themes[name] || name === current) return
  const from = current
  current = name
  const root = document.documentElement
  root.dataset.theme = name
  paint(name, from, immediate, y)
  gsap.to(root, { ...themes[name], duration: immediate ? 0 : low() ? 0.5 : TIME, ease: 'silk', overwrite: 'auto' })
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themes[name]['--bg'])
}

export const currentTheme = () => current
