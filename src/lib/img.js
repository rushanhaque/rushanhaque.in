import lqip from '../data/lqip.json'

// Every picture exists at 800 and 1600 pixels wide; the browser picks the one it needs.
export const small = (src) => src.replace('.webp', '-800.webp')
export const srcSet = (src) => `${small(src)} 800w, ${src} 1600w`
// A picture's own colours, blurred, behind it until it arrives (a 24px copy, about 200 bytes, in the page itself), so a
// card is never an empty box on a slow connection. Pictures added later in the admin simply have none.
export const blur = (src) => (lqip[src] ? { backgroundImage: `url(${lqip[src]})`, backgroundSize: 'cover', backgroundPosition: 'top' } : undefined)
