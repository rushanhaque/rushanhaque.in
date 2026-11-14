import { useEffect } from 'react'

// The first seconds of a first visit. The cover is painted by the HTML itself before any script (index.html): hello in
// the languages of the people the work is for. Once the last word is said and the type has arrived, the sheet lifts
// away on a curve and the first screen rises from under it.
export default function Intro() {
  useEffect(() => {
    const html = document.documentElement
    const cover = document.getElementById('cover')
    if (!cover || !html.classList.contains('intro')) { cover?.remove(); return undefined }
    const later = (ms) => new Promise((r) => setTimeout(r, ms))
    const anims = cover.querySelector('.cv__w:last-child')?.getAnimations?.() || []
    const written = anims.length ? Promise.race([Promise.all(anims.map((a) => a.finished)), later(2600)]) : later(1400)
    const fonts = Promise.race([document.fonts?.ready, later(2200)])
    let gone = false
    let t = 0
    Promise.all([written, fonts, later(Math.max(0, 2100 - performance.now()))]).catch(() => {}).then(() => {
      if (gone) return
      try { sessionStorage.setItem('rh-seen', '1') } catch { /* private mode */ }
      html.classList.add('cv-out')
      t = setTimeout(() => { cover.remove(); html.classList.remove('intro', 'cv-out') }, 1250)
    })
    return () => { gone = true; clearTimeout(t) }
  }, [])
  return null
}
