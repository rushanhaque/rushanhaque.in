import Btn from '../components/Btn'
import { A } from '../lib/router'

export default function NotFound() {
  return (
    <section className="lost wrap" data-tone="ivory">
      <p className="lost__no pillar" aria-hidden="true">404</p>
      <h1 className="h2">This page doesn’t <em>exist.</em></h1>
      <p className="lede">The address may have changed, or it may never have existed. These will get you back on track.</p>
      <div className="lost__links">
        <Btn to="/" variant="solid">Back to home</Btn>
        <A to="/work" className="tlink">See the works</A>
        <A to="/about" className="tlink">About me</A>
        <A to="/contact" className="tlink">Get in touch</A>
      </div>
    </section>
  )
}
