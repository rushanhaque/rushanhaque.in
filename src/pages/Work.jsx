import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { useMeta } from '../lib/meta'
import { GROUPS, Grid, count } from '../components/WorkGrid'
import Head from '../components/Head'
import Footer from '../components/Footer'

// The Work page: everything in one list, and every card that has a live site plays it.
export default function Work() {
  const list = useRef(null)
  const [filter, setFilter] = useState('All')
  useMeta({ title: 'Work. Rushan Haque', description: 'Client websites, software products, sites in progress and experiments by Rushan Haque.', path: '/work' })
  useReveals(list, [filter])
  useChapter(list, { id: 'all-work', name: 'All works', hidden: true, time: [12, 14] })
  useEffect(() => { ScrollTrigger.refresh() }, [filter])
  return (
    <div className="work">
      <section className="work__all wrap" ref={list} id="all-work" data-tone="night">
        <Head as="h1" label="The full list" title={<>All <em>works</em></>} count={count('All')} lede="Client websites, software products, sites still in progress, and a few experiments." />
        <div className="tabs" role="group" aria-label="Filter the works">
          {GROUPS.map((g) => (
            <button key={g} type="button" aria-pressed={filter === g} className={filter === g ? 'is-on' : ''} onClick={() => setFilter(g)}>
              {g}<sup>{count(g)}</sup>
            </button>
          ))}
        </div>
        <Grid filter={filter} />
      </section>
      <Footer dark />
    </div>
  )
}
