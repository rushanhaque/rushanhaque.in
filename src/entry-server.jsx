// The build's server entry: renders any route to HTML, so every page ships with its words already in
// it, for search engines and AI crawlers that don't run JavaScript. Effects never run here, so nothing
// about WebGL or the scroll exists on the server. It is the same App as the browser's, so the first paint
// and the page React takes over are one and the same.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import Home from './pages/Home'
import Work from './pages/Work'
import Case from './pages/Case'
import Product from './pages/Product'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Landing from './pages/Landing'

const pages = { Home, Work, Case, Product, About, Contact, Admin, Landing }

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App pages={pages} />
    </StaticRouter>,
  )
}

export { routes, headFor, headHtml, ORIGIN, services, areas, industries, articles, guides, sourcePages } from './lib/seo'
export { site } from './config/site'
export { works, products, writings, reviews, faq, experience, education, languages, chapters } from './data/content'
