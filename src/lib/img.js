// Every picture exists at 800 and 1600 pixels wide; the browser picks the one it needs.
export const small = (src) => src.replace('.webp', '-800.webp')
export const srcSet = (src) => `${small(src)} 800w, ${src} 1600w`
