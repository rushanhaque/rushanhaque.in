import { clients } from '../data/content'
import Head from '../components/Head'
import { TLink } from '../components/Transition'
import Icon from '../components/Icon'

/**
 * 04 — Clientele. A site plan of plots: each client holds one. A plot shows the client's logo
 * when there is one (data/content.js → clients[].logo) and a wordmark until then; the last plot
 * is kept open for the next brand.
 */
export default function Clientele() {
  return (
    <section className="cli sec" data-theme="ivory" data-chapter="Clientele" id="clientele">
      <div className="wrap">
        <Head n="04" label="Brands I work with" title={<em>Clientele</em>} count={clients.length} lede="Brands in India, Saudi Arabia, Poland and Nepal — most of them export houses selling to buyers in dozens of countries." />
        <ul className="cli__grid" data-batch>
          {clients.map((c) => {
            const inner = (
              <>
                <span className="cli__mark">{c.logo ? <img src={c.logo} alt={c.name} loading="lazy" decoding="async" /> : c.name}</span>
                <span className="cli__meta"><span>{c.field}</span><span>{c.place}</span></span>
              </>
            )
            return (
              <li className="cli__plot" key={c.name} data-spot>
                {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer">{inner}</a> : <div>{inner}</div>}
              </li>
            )
          })}
          <li className="cli__plot cli__plot--open beam">
            <TLink to="/contact">
              <span className="cli__mark">Your brand, next.</span>
              <span className="cli__meta"><span>Start a project</span><Icon name="arrowUpRight" size={14} /></span>
            </TLink>
          </li>
        </ul>
      </div>
    </section>
  )
}
