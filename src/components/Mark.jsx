import { STROKE, word } from '../lib/letters'

// The monogram: the R and the H of the drawn name (lib/letters.js), set close enough to read as one piece. Both
// letters close on the same axis, so at this size the eye sees a single band straight through the middle, which is
// what the whole alphabet is built around. Same hand as the name on the first screen, and nothing else uses it.
const RH = word('RH', 13)

export default function Mark({ className = '' }) {
  return (
    <svg className={`mono ${className}`} viewBox={RH.viewBox} fill="none" aria-hidden="true" focusable="false">
      <g strokeWidth={STROKE} strokeLinecap="butt" strokeLinejoin="miter" stroke="currentColor">
        {RH.letters.map((l) => <path key={l.c} transform={`translate(${l.x} 0)`} d={l.d} />)}
      </g>
    </svg>
  )
}
