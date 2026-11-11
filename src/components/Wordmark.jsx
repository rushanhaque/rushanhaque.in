import { STROKE, lockup, word } from '../lib/letters'

// The name as it is drawn (lib/letters.js), one SVG per word. Both words are given the same height, so their cap
// heights match exactly, and the pair is sized to whatever room the first screen has. Every letter is one path of
// length 1, so it can be drawn on from nothing with no measuring: the stroke simply fills itself in.
const RUSHAN = word('Rushan')
const HAQUE = word('Haque')
const FIT = lockup(RUSHAN, HAQUE)

function Word({ w, from, lit }) {
  return (
    <svg className={`mark__word ${lit ? 'is-lit' : ''}`} viewBox={w.viewBox} style={{ '--aspect': w.aspect }} fill="none" aria-hidden="true" focusable="false">
      <g strokeWidth={STROKE} strokeLinecap="butt" strokeLinejoin="miter">
        {w.letters.map((l, i) => (
          <path key={l.c + i} className="mark__ch" style={{ '--i': from + i }} pathLength="1" transform={`translate(${l.x} 0)`} d={l.d} />
        ))}
      </g>
    </svg>
  )
}

export default function Wordmark({ drawn }) {
  return (
    <span className={`mark ${drawn ? 'is-drawn' : ''}`} style={{ '--wide': FIT.wide, '--stack': FIT.stack, '--lead': FIT.lead }} aria-hidden="true">
      <Word w={RUSHAN} from={0} />
      <Word w={HAQUE} from={RUSHAN.letters.length} lit />
    </span>
  )
}
