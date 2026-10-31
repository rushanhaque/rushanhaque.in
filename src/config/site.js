// Identity, contact and navigation. Re-skin a client build by editing this file and src/data/content.js.
export const site = {
  name: 'Rushan Haque',
  url: 'https://www.rushanhaque.in',
  short: 'RH',
  role: 'Developer & writer',
  location: 'Moradabad, Uttar Pradesh, India',
  city: 'Moradabad',
  tz: 'Asia/Kolkata',
  email: 'rushanulhaque@gmail.com',
  phone: { label: '+91 76680 47608', href: 'tel:+917668047608', whatsapp: 'https://wa.me/917668047608' },
  booking: 'https://cal.com/rushan-haque-emssbo/call',
  formspree: import.meta.env.VITE_FORMSPREE_ID || '',
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
