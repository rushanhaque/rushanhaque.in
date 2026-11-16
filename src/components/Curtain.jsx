import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Star from './Star'

// Between pages: a sheet of wine rises from the foot of the screen with the next page's name on it, the page changes
// behind it, and it carries on up and away. Only transforms move, so it is smooth on any phone.
const wait = (el, ms) => new Promise((r) => {
  let done = false
  const end = () => { if (!done) { done = true; r() } }
  el.addEventListener('transitionend', (e) => { if (e.target === el) end() }, { once: true })
  setTimeout(end, ms)
})

const Curtain = forwardRef(function Curtain(_, ref) {
  const root = useRef(null)
  const [label, setLabel] = useState('')
  useImperativeHandle(ref, () => ({
    async cover(name) {
      const el = root.current
      setLabel(name || '')
      el.className = 'curtain is-ready'
      el.getBoundingClientRect()
      el.className = 'curtain is-cover'
      await wait(el, 440)
    },
    async reveal() {
      const el = root.current
      el.className = 'curtain is-reveal'
      await wait(el, 620)
      el.className = 'curtain'
    },
  }), [])
  return (
    <div className="curtain" ref={root} aria-hidden="true">
      <div className="curtain__in">
        <Star className="curtain__star" />
        <p className="curtain__name">{label}</p>
      </div>
    </div>
  )
})
export default Curtain
