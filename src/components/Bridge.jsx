import { useRef } from 'react'
import { useReveals } from '../lib/reveal'

// A line of the story between two sections, with the screen to itself. It fills in as you read it, and the
// page turns to the next tone in the middle of it.
export default function Bridge({ children, tone = 'night' }) {
  const root = useRef(null)
  useReveals(root)
  return (
    <section className="bridge wrap" ref={root} data-tone={tone} data-at="0.5">
      <p className="h2" data-r="sweep" data-start="top 86%" data-end="bottom 56%">{children}</p>
    </section>
  )
}
