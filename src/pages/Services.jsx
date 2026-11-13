import { useRef } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { useMeta } from '../lib/meta'
import { site } from '../config/site'
import hub from '../data/seo/hub.json'
import { TLink } from '../components/Transition'
import Btn from '../components/Btn'
import Head from '../components/Head'
import Footer from '../components/Footer'
import { ArrowUpRight, WhatsappLogo } from '../components/glyphs'

// Everything I offer, in one place: what I build, who it is for, the guides worth reading before hiring anyone,
// and the towns I work in. Each of these has a page of its own (pages/Landing.jsx); this is the door to all of them,
// so none of them is only ever reached from the footer. The list comes from scripts/seo-index.mjs (data/seo/hub.json).
export const SERVICES_TITLE = 'Services: Website Design, Development and SEO | Rushan Haque'
export const SERVICES_DESCRIPTION = 'Website design and development, online stores, web applications, SEO and speed work for businesses in India and abroad, designed and built by Rushan Haque in Moradabad.'

const two = (n) => String(n).padStart(2, '0')
const plain = (t = '') => t.replace(/ — /g, ', ')

function List({ items, numbered = false }) {
  return (
    <ul className="svc__list" data-r="stagger" data-gap="0.05">
      {items.map((p, i) => (
        <li key={p.slug}>
          <TLink to={`/${p.slug}`} title={p.title} className="svc__row" lang={p.lang}>
            {numbered && <span className="svc__no note" aria-hidden="true">{two(i + 1)}</span>}
            <span className="svc__main">
              <strong className="svc__name">{p.title}</strong>
              {p.description && <span className="small svc__desc">{plain(p.description)}</span>}
            </span>
            <ArrowUpRight size={18} className="svc__go" />
          </TLink>
        </li>
      ))}
    </ul>
  )
}

export default function Services() {
  const root = useRef(null)
  useMeta({ title: SERVICES_TITLE, description: SERVICES_DESCRIPTION, path: '/services' })
  useReveals(root)
  useChapter(root, { id: 'services-page', name: 'Services', hidden: true, time: [10.6, 12.4] })
  return (
    <div className="svcpage" ref={root}>
      <div className="svc wrap" data-tone="ivory">
        <header className="svc__intro">
          <nav className="crumb note" aria-label="Breadcrumb"><TLink to="/" title="Home">Home</TLink><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav>
          <h1 className="h1 svc__title">Websites, stores and <em>software</em>, built end to end</h1>
          <p className="lede">Design, development, search and the care after launch, for businesses in India and abroad. One person from the first conversation to the years after, so nothing is lost in a handover.</p>
          <div className="lp__actions">
            <Btn to="/contact" variant="solid" title="Contact">Start a project</Btn>
            <Btn href={site.phone.whatsapp} icon={WhatsappLogo}>WhatsApp me</Btn>
          </div>
        </header>

        <section className="svc__sec" aria-labelledby="svc-build">
          <Head id="svc-build" label="What I build" title={<>Services</>} count={hub.services.length} lede="Each one is done from scratch for the business in front of me, and each page says what it involves, what it costs and how long it takes." />
          <List items={hub.services} numbered />
        </section>

        <section className="svc__sec" aria-labelledby="svc-who">
          <Head id="svc-who" label="By industry" title={<>Who it’s <em>for</em></>} count={hub.industries.length} lede="What a clinic, a school or a builder needs from a website is not the same. These pages start from the business." />
          <List items={hub.industries} />
        </section>

        <section className="svc__sec" aria-labelledby="svc-read">
          <Head id="svc-read" label="Guides" title={<>Before you <em>hire</em></>} count={hub.guides.length} lede="Straight answers on cost, process and choosing who builds it, including two in Hindi." />
          <List items={hub.guides} />
        </section>

        <section className="svc__sec" aria-labelledby="svc-where">
          <Head id="svc-where" label="Areas served" title={<>Near <em>Moradabad</em>, and further</>} count={hub.areas.length} lede="Based in Moradabad and working in person across western Uttar Pradesh and Uttarakhand, and online with anyone." />
          <ul className="svc__areas" data-r="stagger" data-gap="0.02">
            {hub.areas.map((a) => <li key={a.slug}><TLink to={`/${a.slug}`} title={`Website designer in ${a.name}`}>{a.name}</TLink></li>)}
          </ul>
        </section>

        <section className="lp__cta svc__cta" data-r="fade">
          <h2 className="h2">Not sure which you need?</h2>
          <p className="lede">Tell me what the business does and what the website has to do for it. I’ll say plainly what it needs, and what it doesn’t.</p>
          <div className="lp__actions">
            <Btn to="/contact" variant="solid" title="Contact">Start a project</Btn>
            <Btn href={site.booking}>Book a call</Btn>
          </div>
        </section>
      </div>
      <Footer dark />
    </div>
  )
}
