import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App, { preload } from './App.jsx'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'
import './styles/pages.css'

// A phone keeps a tab alive for days and shows it again without asking the server. When the
// page comes back into view, see whether the site has been deployed since; if so, load it fresh.
if (import.meta.env.PROD) {
  const mine = document.querySelector('script[type="module"][src*="/assets/index-"]')?.getAttribute('src')
  const check = () => {
    if (!mine || document.visibilityState !== 'visible') return
    fetch('/', { cache: 'no-store' })
      .then((r) => r.text())
      .then((html) => {
        const live = html.match(/\/assets\/index-[\w-]+\.js/)?.[0]
        if (live && live !== mine) window.location.reload()
      })
      .catch(() => {})
  }
  document.addEventListener('visibilitychange', check)
  window.addEventListener('pageshow', (e) => e.persisted && check())
}

// the pre-rendered page stays on screen until its own code is in, then renders over itself
preload(window.location.pathname).then((pages) => {
  createRoot(document.getElementById('root')).render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App pages={pages} />
    </BrowserRouter>,
  )
})
