import { createContext, useContext } from 'react'
import { prefetch } from './routes'

// The router is App's own state (see App.jsx); this is how the rest of the site reads it and moves.
export const RouterCtx = createContext({ route: { key: 'home', path: '/' }, navigate: () => {} })
export const useRoute = () => useContext(RouterCtx).route
export const useNavigate = () => useContext(RouterCtx).navigate

const internal = (to) => typeof to === 'string' && to.startsWith('/') && !to.startsWith('//')

/** A link to a page of this site: a real <a>, so it works without script, that moves through the curtain. */
export function A({ to, children, onClick, onPointerEnter, ...rest }) {
  const { navigate } = useContext(RouterCtx)
  const click = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !internal(to)) return
    e.preventDefault()
    navigate(to)
  }
  // reaching for a link loads what its page needs, so the switch never waits
  const enter = (e) => { onPointerEnter?.(e); if (internal(to)) prefetch(to) }
  return <a href={to} onClick={click} onPointerEnter={enter} onPointerDown={enter} onFocus={enter} {...rest}>{children}</a>
}
