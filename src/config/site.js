// Identity, contact and navigation.
export const site = {
  name: 'Rushan Haque',
  url: 'https://www.rushanhaque.in',
  role: 'Developer & writer',
  location: 'Moradabad, Uttar Pradesh, India',
  city: 'Moradabad',
  tz: 'Asia/Kolkata',
  email: 'rushanulhaque@gmail.com',
  phone: { label: '+91 76680 47608', href: 'tel:+917668047608', whatsapp: 'https://wa.me/917668047608' },
  booking: 'https://cal.com/rushan-haque-emssbo/call',
  // the contact form's Formspree id (public: it ships in the page either way)
  formspree: import.meta.env.VITE_FORMSPREE_ID || 'mdeanqre',
  nav: [
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rushanhaque/' },
    { label: 'GitHub', href: 'https://github.com/rushanhaque' },
    { label: 'Instagram', href: 'https://www.instagram.com/rushan.haque/' },
    { label: 'WhatsApp', href: 'https://wa.me/917668047608' },
  ],
}

// the time where I am, formatted the same everywhere; building the formatter is slow, so there is only ever one
let clock = null
export const localTime = () => (clock ??= new Intl.DateTimeFormat('en-GB', { timeZone: site.tz, hour: '2-digit', minute: '2-digit' })).format(new Date())
