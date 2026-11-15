import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { resolve } from './lib/routes'
import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'
import './styles/chrome.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/home.css'
import './styles/works.css'
import './styles/services.css'
import './styles/pages.css'

// Every built page arrives finished. The page's own code and words load first (they were preloaded with the HTML),
// then React takes over the markup that is already there.
async function start() {
  // some in-app browsers (Instagram, Facebook) can run this file twice; two apps on one page would both add to it
  if (window.__rhStarted) return
  window.__rhStarted = true
  const el = document.getElementById('root')
  const route = await resolve(location.href)
  document.documentElement.dataset.page = route.key
  const app = <App initial={route} />
  // a page whose markup does not match is repaired by React; it is noted so a build can be checked for it
  if (el.firstElementChild) hydrateRoot(el, app, { onRecoverableError: (e) => { (window.__rhHydration ??= []).push(String(e?.message || e).slice(0, 300)) } })
  else createRoot(el).render(app)
}
start()
