import { useRef } from 'react'
import { useChapter } from '../lib/director'
import { useMeta } from '../lib/meta'
import { TLink } from '../components/Transition'
import Btn from '../components/Btn'

export default function NotFound() {
  const root = useRef(null)
  useMeta({ title: 'Page not found. Rushan Haque' })
  useChapter(root, { id: 'lost', name: 'Page not found', hidden: true, time: [8, 8.4] })
  return (
    <section className="lost wrap" ref={root} data-tone="ivory">
      <p className="lost__no pillar" aria-hidden="true">404</p>
      <h1 className="h2">This page doesn’t exist.</h1>
      <p className="lede">The address may have changed, or it may never have existed. These will get you back on track.</p>
      <div className="lost__links">
        <Btn to="/" title="Home" variant="solid">Back to home</Btn>
        <TLink to="/work" className="tlink" title="Work">See the work</TLink>
        <TLink to="/about" className="tlink" title="About">About me</TLink>
        <TLink to="/contact" className="tlink" title="Contact">Get in touch</TLink>
      </div>
    </section>
  )
}
