import { site } from '../config/site'

// The name on the first screen, set in Geist as it was on the previous portfolio: the given name in ivory, the
// family name in brass. The dots in components/NameDots.jsx are read straight off these two words, at whatever
// size the page has given them, so there is only ever one name here and the canvas copies it.
export default function Wordmark() {
  const [first, last] = site.name.split(' ')
  return (
    <span className="mark" aria-hidden="true">
      <span className="mark__word">{first}</span>
      <span className="mark__word is-lit">{last}</span>
    </span>
  )
}
