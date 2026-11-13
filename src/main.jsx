import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { seoPage } from './lib/seoPage'
import './styles/tokens.css'
import './styles/base.css'
import './styles/chrome.css'
import './styles/sections.css'
import './styles/pages.css'

// a landing page's words start loading now, alongside its code rather than after it
const one = location.pathname.match(/^\/([a-z0-9-]+)\/?$/)
if (one) seoPage(one[1])

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
// every built page arrives finished: React takes over the words that are already there
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
