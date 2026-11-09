import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { useMeta } from '../lib/meta'
import { GROUPS, Grid, count } from '../components/WorkGrid'
import GallerySection from '../sections/GallerySection'
import Head from '../components/Head'
import Footer from '../components/Footer'

// The Work page: first the walk down the corridor, one client site in each bay, then everything in one list.
export default function Work() {
  const list = useRef(null)
  const [filter, setFilter] = useState('All')
  useMeta({ title: 'Work. Rushan Haque', description: 'Client websites, software products, sites in progress and experiments by Rushan Haque.', path: '/work' })
  useReveals(list, [filter])
  useChapter(list, { id: 'all-work', name: 'All work', hidden: true, time: [12, 14] })
  useEffect(() => { ScrollTrigger.refresh() }, [filter])
  return (
    <div className="work">
      <GallerySection />
      <section className="work__all wrap" ref={list} id="all-work" data-tone="ivory">
        <Head label="The full list" title={<>All <em>work</em></>} count={count('All')} lede="Client websites, software products, sites still in progress, and a few experiments." />
        <div className="tabs" role="group" aria-label="Filter the work">
          {GROUPS.map((g) => (
            <button key={g} type="button" aria-pressed={filter === g} className={filter === g ? 'is-on' : ''} onClick={() => setFilter(g)}>
              {g}<sup>{count(g)}</sup>
            </button>
          ))}
        </div>
        <Grid filter={filter} />
      </section>
      <Footer />
    </div>
  )
}
