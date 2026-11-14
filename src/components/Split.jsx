import { Children, cloneElement, isValidElement } from 'react'

// Splits text into words, each in its own mask, at render time: the words are in the HTML already, so nothing is
// measured or rebuilt in the browser, and a rise or a sweep costs a class change. Elements inside (an <em>, a <br>)
// keep their place, with their own words split too.
export default function Split({ children }) {
  let i = 0
  const walk = (node) => {
    if (typeof node === 'string' || typeof node === 'number') {
      const parts = String(node).split(/(\s+)/)
      return parts.map((p, k) => (/^\s+$/.test(p) || !p
        ? p
        : <span className="w" key={k} style={{ '--i': i++ }}><span>{p}</span></span>))
    }
    if (Array.isArray(node)) return node.map(walk)
    if (isValidElement(node) && node.props.children != null) {
      return cloneElement(node, { key: node.key ?? i }, Children.map(node.props.children, walk))
    }
    return node
  }
  return <>{Children.map(children, walk)}</>
}
