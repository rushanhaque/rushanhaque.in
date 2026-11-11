import { useRef } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { site } from '../config/site'
import Btn from '../components/Btn'
import Footer from '../components/Footer'
import { WhatsappLogo, EnvelopeSimple, CalendarBlank } from '../components/glyphs'

// The end of the page, and the way to start something.
export default function DoorSection() {
  const root = useRef(null)
  const foot = useRef(null)
  useReveals(root)
  useChapter(root, { id: 'door', name: 'Start a project', time: [22, 24] })
  useChapter(foot, { id: 'morning', name: '', hidden: true, time: [24, 24.5] })

  return (
    <>
      <section className="exit wrap" ref={root} id="door" aria-label="Start a project" data-tone="wine">
        <h2 className="h1" data-r="lines">So, what are we building?</h2>
        <p className="lede" data-r="fade">A project, a half-formed idea, or just hello. I reply to everything myself, usually within a day.</p>
        <div className="exit__row" data-r="deal" data-gap="0.07">
          <Btn href={site.phone.whatsapp} variant="solid" icon={WhatsappLogo}>WhatsApp</Btn>
          <Btn href={`mailto:${site.email}?subject=Hello%20from%20your%20site`} icon={EnvelopeSimple}>Email</Btn>
          <Btn href={site.booking} icon={CalendarBlank}>Book a call</Btn>
          <Btn to="/contact" title="Contact">Write to me</Btn>
        </div>
      </section>
      <div ref={foot} className="exit__foot"><Footer lead={false} dark /></div>
    </>
  )
}
