import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App, { preload } from './App.jsx'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'
import './styles/pages.css'

// the pre-rendered page stays on screen until its own code is in, then renders over itself
preload(window.location.pathname).then((pages) => {
  createRoot(document.getElementById('root')).render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App pages={pages} />
    </BrowserRouter>,
  )
})
