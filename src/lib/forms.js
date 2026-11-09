import { site } from '../config/site'

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
export const isPhone = (v) => /^[+()\d][\d\s().-]{6,}$/.test(v) && v.replace(/\D/g, '').length >= 7
export const contactKind = (v) => (isEmail(v) ? 'email' : isPhone(v) ? 'phone' : '')

export const mailto = (body, subject = 'Hello from your site') => `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
export const whatsapp = (body) => `${site.phone.whatsapp}?text=${encodeURIComponent(body)}`

/**
 * Sends through Formspree. Resolves true on success. Throws an Error whose `fallback` flag says the
 * message could not leave from here at all, so the form should offer email and WhatsApp instead.
 */
export async function send(payload) {
  if (!site.formspree) {
    const e = new Error('Send this by email or WhatsApp below; it’s already written.')
    e.fallback = true
    throw e
  }
  let res
  try {
    res = await fetch(`https://formspree.io/f/${site.formspree}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    const e = new Error('Your connection dropped. Send it by email or WhatsApp below; it’s already written.')
    e.fallback = true
    throw e
  }
  if (res.status >= 500) {
    const e = new Error('This could not be sent from here. Send it by email or WhatsApp below; it’s already written.')
    e.fallback = true
    throw e
  }
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b.errors?.[0]?.message || 'Could not send. Please try again.')
  }
  return true
}
