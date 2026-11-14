import { useRef } from 'react'
import { site } from '../config/site'
import { useReveals } from '../lib/reveal'
import Btn from '../components/Btn'
import Split from '../components/Split'
import Rosette from '../components/Rosette'
import { BookBtn } from '../components/Booking'
import { WhatsappLogo, EnvelopeSimple } from '../components/glyphs'

// The end of the story, and the way to start the next one. The engraving from the first screen returns behind it.
export default function Closing() {
  const root = useRef(null)
  useReveals(root)
  return (
    <section className="exit" ref={root} id="start" aria-label="Start a project" data-tone="ivory" data-chapter="08" data-name="Start a project">
      <Rosette className="exit__ros" glint={false} />
      <div className="exit__in wrap">
        <p className="note exit__kick">08 <i /> The next chapter</p>
        <h2 className="exit__title" data-r="rise"><Split>So, what are we <em>building?</em></Split></h2>
        <p className="lede" data-r="up">A project, a half-formed idea, or just hello. I reply to everything myself, usually within a day.</p>
        <div className="exit__row" data-r="deal">
          <Btn href={site.phone.whatsapp} variant="solid" icon={WhatsappLogo}>WhatsApp</Btn>
          <Btn href={`mailto:${site.email}?subject=Hello%20from%20your%20site`} icon={EnvelopeSimple}>Email</Btn>
          <BookBtn />
          <Btn to="/contact">Write to me</Btn>
        </div>
      </div>
    </section>
  )
}
