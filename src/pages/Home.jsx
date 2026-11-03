import { useRef } from 'react'
import { useReveals } from '../lib/useReveals'
import Hero from '../sections/Hero'
import RecentWorks from '../sections/RecentWorks'
import Drafting from '../sections/Drafting'
import Instruments from '../sections/Instruments'
import Clientele from '../sections/Clientele'
import Serve from '../sections/Serve'
import OtherServices from '../sections/OtherServices'
import Voices from '../sections/Voices'
import Library from '../sections/Library'
import Profile from '../sections/Profile'
import Footer from '../components/Footer'
import { Bridge } from '../components/Story'

// Hero, then 01 Recent works · 02 Currently working on · 03 Products · 04 Clientele ·
// 05 Where I serve · 06 Other services · 07 Reviews · 08 Writing · 09 About.
export default function Home() {
  const root = useRef(null)
  useReveals(root, 'night')
  return (
    <div className="page page--home" ref={root}>
      <Hero />
      <RecentWorks />
      <Drafting />
      <Instruments />
      <Bridge>Behind every build is a business, and most of them <em>make things by hand</em> in brass, copper and wood.</Bridge>
      <Clientele />
      <Serve />
      <OtherServices />
      <Bridge>The work is half the story. <em>The rest is what clients say</em> once it’s live.</Bridge>
      <Voices />
      <Bridge>And when the screens go quiet, <em>I write.</em></Bridge>
      <Library />
      <Profile />
      <Footer />
    </div>
  )
}
