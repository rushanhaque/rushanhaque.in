import { gsap } from './gsap'

// Sections declare data-theme; the whole page tweens between these palettes as they arrive.
export const themes = {
  night: { '--bg': '#120a0c', '--fg': '#ffffff', '--muted': 'rgba(255, 255, 255, 0.6)', '--line': 'rgba(255, 255, 255, 0.14)', '--card': '#1a0f12', '--accent': '#D9B97E', '--hi': '#2A1219' },
  ivory: { '--bg': '#FFFFFF', '--fg': '#201814', '--muted': 'rgba(32, 24, 20, 0.6)', '--line': 'rgba(32, 24, 20, 0.12)', '--card': '#F5F1EE', '--accent': '#4a2228', '--hi': '#FFFFFF' },
  stone: { '--bg': '#F7F4F1', '--fg': '#201814', '--muted': 'rgba(32, 24, 20, 0.6)', '--line': 'rgba(32, 24, 20, 0.13)', '--card': '#EFE9E4', '--accent': '#4a2228', '--hi': '#FFFFFF' },
  wine: { '--bg': '#2b1418', '--fg': '#ffffff', '--muted': 'rgba(255, 255, 255, 0.62)', '--line': 'rgba(255, 255, 255, 0.16)', '--card': '#36191e', '--accent': '#D9B97E', '--hi': '#3f2026' },
}

let current = null

export function setTheme(name, immediate = false) {
  if (!themes[name] || name === current) return
  current = name
  const root = document.documentElement
  root.dataset.theme = name
  gsap.to(root, { ...themes[name], duration: immediate ? 0 : 0.9, ease: 'silk', overwrite: 'auto' })
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themes[name]['--bg'])
}

export const currentTheme = () => current
