// The guides, services and areas by name only (from data/seo/index.json, written by
// scripts/seo-index.mjs). Light enough for the header and footer to carry on every page; the
// pages' full text loads only with the landing page itself.
import index from '../data/seo/index.json'

const name = (t) => t.replace(/^Website designer in /, '')
export const services = index.filter((p) => p.kind === 'service')
export const areas = index.filter((p) => p.kind === 'area').map((p) => ({ slug: p.slug, name: name(p.title) }))
  .sort((a, b) => (a.name === 'Moradabad' ? -1 : b.name === 'Moradabad' ? 1 : a.name.localeCompare(b.name)))
export const industries = index.filter((p) => p.kind === 'industry')
export const articles = index.filter((p) => p.kind === 'guide')

export const LEGAL = {
  privacy: { title: 'Privacy', description: 'What rushanhaque.in collects through enquiries and the contact form, how it is used, and how to ask for it to be deleted.' },
  accessibility: { title: 'Accessibility', description: 'How rushanhaque.in works with the keyboard, touch, screen readers and browser zoom, and how to report anything in the way.' },
}

const titles = new Map(index.map((p) => [p.slug, p.title]))
export const titleFor = (slug) => titles.get(slug) || LEGAL[slug]?.title
