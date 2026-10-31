// The build's server entry: renders any route of the site to HTML, so every page ships with its
// words already in it for search engines and AI crawlers that don't run JavaScript.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import Home from './pages/Home'
import Work from './pages/Work'
import Case from './pages/Case'
import About from './pages/About'
import Contact from './pages/Contact'
import Landing from './pages/Landing'
import NotFound from './pages/NotFound'

const pages = { Home, Work, Case, About, Contact, Landing, NotFound }

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App pages={pages} server />
    </StaticRouter>,
  )
}

export { routes, headFor, headHtml, ORIGIN, services, areas, industries, articles, guides, sourcePages } from './lib/seo'
export { site } from './config/site'
export { works, products, writings, reviews, faq, experience, education, languages, chapters } from './data/content'
