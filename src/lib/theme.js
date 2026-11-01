import { gsap } from './gsap'

// Sections declare data-theme; the whole page morphs between these palettes as they arrive.
export const themes = {
  night: { '--bg': '#120a0c', '--fg': '#ffffff', '--muted': 'rgba(255, 255, 255, 0.6)', '--line': 'rgba(255, 255, 255, 0.14)', '--card': '#1a0f12', '--accent': '#D9B97E', '--hi': '#2A1219' },
  ivory: { '--bg': '#FFFFFF', '--fg': '#201814', '--muted': 'rgba(32, 24, 20, 0.6)', '--line': 'rgba(32, 24, 20, 0.12)', '--card': '#F5F1EE', '--accent': '#42242d', '--hi': '#FFFFFF' },
  stone: { '--bg': '#F7F4F1', '--fg': '#201814', '--muted': 'rgba(32, 24, 20, 0.6)', '--line': 'rgba(32, 24, 20, 0.13)', '--card': '#EFE9E4', '--accent': '#42242d', '--hi': '#FFFFFF' },
  wine: { '--bg': '#241419', '--fg': '#ffffff', '--muted': 'rgba(255, 255, 255, 0.62)', '--line': 'rgba(255, 255, 255, 0.16)', '--card': '#2e1a20', '--accent': '#D9B97E', '--hi': '#371f27' },
}

let current = null

// The sections are see-through, so the page's background and every colour on it change as one,
// the way the Halcyon template does it: a single soft crossfade of the whole palette.
export function setTheme(name, immediate = false) {
  if (!themes[name] || name === current) return
  current = name
  const root = document.documentElement
  root.dataset.theme = name
  gsap.to(root, { ...themes[name], duration: immediate ? 0 : 0.8, ease: 'silk', overwrite: 'auto' })
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themes[name]['--bg'])
}

export const currentTheme = () => current
