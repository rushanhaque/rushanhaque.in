// Every work image ships at 1600px and 800px wide; the browser picks the one the layout needs.
export const small = (src = '') => src.replace(/\.webp$/, '-800.webp')
export const srcSet = (src = '') => `${small(src)} 800w, ${src} 1600w`
