import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { CLIENTS, Cards } from '../components/WorkGrid'
import Btn from '../components/Btn'

const FloorPlan = lazy(() => import('../components/FloorPlan'))

// The client sites, side by side. On a desktop they can also be laid out on a floor you drag around.
export default function RecentWorks() {
  const root = useRef(null)
  const [mode, setMode] = useState('grid')
  useReveals(root, [mode])
  useChapter(root, { id: 'work', name: 'Recent works', time: [7.5, 11.8] })
  useEffect(() => { ScrollTrigger.refresh() }, [mode])
  return (
    <section className="rw" ref={root} id="work" data-tone="ivory">
      <header className="phead phead--sec wrap">
        <div className="phead__title">
          <h2 className="h1">Recent <em>works</em><sup className="count" aria-hidden="true">({String(CLIENTS.length).padStart(2, '0')})</sup></h2>
        </div>
        <div className="work__tools">
          <p className="lede phead__lede" data-r="lift">Websites for businesses that make beautiful things, each designed and built from the first conversation to launch.</p>
          <div className="tabs work__view" role="group" aria-label="Choose a view">
            <button type="button" aria-pressed={mode === 'grid'} className={mode === 'grid' ? 'is-on' : ''} onClick={() => setMode('grid')}>Grid</button>
            <button type="button" aria-pressed={mode === 'plan'} className={mode === 'plan' ? 'is-on' : ''} onClick={() => setMode('plan')}>Floor plan</button>
          </div>
        </div>
      </header>
      {mode === 'plan'
        ? <Suspense fallback={<div className="plan" />}><FloorPlan items={CLIENTS} /></Suspense>
        : <div className="rw__grid wrap"><Cards items={CLIENTS} even /></div>}
      <div className="rw__more wrap" data-r="lift">
        <Btn to="/work" title="Works" variant="solid">See all works</Btn>
      </div>
    </section>
  )
}
