// The name, drawn rather than typed. Every letter is built from the same small kit of parts: one stroke weight, one
// stem, one shoulder radius, and one axis straight across the middle that every crossbar sits on, so the whole name
// is held together by a line you can see but never drawn. Nothing here comes from a typeface, so the wordmark belongs
// to this site alone, and because each letter is one open path it can be drawn on, stroke by stroke.
//
// The grid: cap height 100, baseline at 100, the axis at 50. Stems meet the cap line and the baseline exactly. The
// only stroke that leaves the frame is the tail of the Q, which is the signature of the whole thing.
export const CAP = 100
export const AXIS = 50
export const STROKE = 5.6
export const TRACK = 22 // between letters
export const WORDS = 74 // between the two words

// R  a half-circle bowl closing on the axis, and the leg leaving from exactly where it closes
const R = { w: 62, d: 'M0 100V0h30a25 25 0 0 1 0 50H0m27 0 35 50' }
// U  two stems and one half-circle, its radius exactly half the width
const U = { w: 64, d: 'M0 0v68a32 32 0 0 0 64 0V0' }
// S  two half-circles of one radius, turned against each other and meeting on the axis
const S = { w: 62, d: 'M60 24a26 26 0 1 0-29 26 26 26 0 1 1-29 26' }
// H  the axis itself, held between two stems
const H = { w: 64, d: 'M0 0v100M64 0v100M0 50h64' }
// A  two diagonals from one apex, crossed high so the bar lands on the axis with the rest
const A = { w: 68, d: 'M0 100 34 0l34 100M17 50h34' }
// N  one diagonal, drawn in a single line with its stems
const N = { w: 64, d: 'M0 100V0l64 100V0' }
// Q  a circle, and the one stroke in the name that leaves the frame
const Q = { w: 76, d: 'M38 0a38 50 0 1 0 0 100 38 50 0 1 0 0-100m6 68 32 46' }
// E  the axis again, shortened, between the cap line and the baseline
const E = { w: 56, d: 'M56 0H0v100h56M0 50h42' }

export const GLYPHS = { R, U, S, H, A, N, Q, E }

// A word, set on the grid: each letter placed after the one before it. The box is the cap height and no more, so two
// words always line up exactly; the tail of the Q is simply allowed to hang outside it.
export function word(text, track = TRACK) {
  const pad = STROKE / 2 + 1
  let x = 0
  const letters = text.toUpperCase().split('').map((c) => {
    const g = GLYPHS[c]
    const at = x
    x += g.w + track
    return { c, d: g.d, x: at }
  })
  const w = x - track
  const top = -pad
  const height = CAP + pad * 2
  return { text, letters, w, viewBox: `${-pad} ${top} ${w + pad * 2} ${height}`, aspect: (w + pad * 2) / height, height }
}

// How wide the name is for a given height: side by side, and stacked one word above the other. The first screen
// sizes itself from these, so the name is always as large as the room allows and never a pixel wider.
export function lockup(a, b) {
  const box = CAP + STROKE + 2
  return { wide: a.aspect + b.aspect + WORDS / box, stack: Math.max(a.aspect, b.aspect), lead: 0.16 }
}
