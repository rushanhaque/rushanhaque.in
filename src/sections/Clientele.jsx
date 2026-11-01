import { clients } from '../data/content'
import Head from '../components/Head'
import { TLink } from '../components/Transition'
import Icon from '../components/Icon'

// Client logos: drop a file named after the client into src/assets/clients/ (taif-international.svg,
// erfolg-living.png, …) and it takes the place of the wordmark on the next build. A `logo` path
// in data/content.js still works too.
const files = import.meta.glob('../assets/clients/*.{svg,png,webp,jpg,jpeg,avif}', { eager: true, query: '?url', import: 'default' })
const bySlug = Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url]))
export const clientSlug = (name) => name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const two = (n) => String(n).padStart(2, '0')

/**
 * 04 — Clientele. A ledger of the brands: each card carries its number and city, the client's
 * logo (or a wordmark until there is one) and its trade. The cards are not links; under the
 * pointer a card takes a light tint and four brass corner marks, and nothing moves. The last
 * card is kept open for the next brand.
 */
export default function Clientele({ theme = 'ivory' }) {
  return (
    <section className="cli sec" data-theme={theme} data-chapter="Clientele" id="clientele">
      <div className="wrap">
        <Head n="04" label="Brands I work with" title={<em>Clientele</em>} count={clients.length} lede="Brands in India, Saudi Arabia, Poland and Nepal — most of them export houses selling to buyers in dozens of countries." />
        <ul className="cli__grid" data-batch>
          {clients.map((c, i) => {
            const logo = bySlug[clientSlug(c.name)] || c.logo
            return (
              <li className="cli__card" key={c.name}>
                <span className="cli__top"><span>{two(i + 1)}</span><span>{c.place}</span></span>
                <span className={`cli__mark ${logo ? 'has-logo' : ''}`}>
                  {logo ? <img src={logo} alt={c.name} loading="lazy" decoding="async" /> : c.name}
                </span>
                <span className="cli__field">{c.field}</span>
                <i className="cli__ticks" aria-hidden="true" />
              </li>
            )
          })}
          <li className="cli__card cli__card--open">
            <TLink to="/contact">
              <span className="cli__top"><span>{two(clients.length + 1)}</span><span>Anywhere</span></span>
              <span className="cli__mark">Your brand, <em>next.</em></span>
              <span className="cli__field">Start a project <Icon name="arrowUpRight" size={13} /></span>
            </TLink>
          </li>
        </ul>
      </div>
    </section>
  )
}
