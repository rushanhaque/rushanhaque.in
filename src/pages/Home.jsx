import Threshold from '../sections/Threshold'
import RecentWorks from '../sections/RecentWorks'
import Drafting from '../sections/Drafting'
import Workshop from '../sections/Workshop'
import Names from '../sections/Names'
import Astrolabe from '../sections/Astrolabe'
import OtherServices from '../sections/OtherServices'
import Reflections from '../sections/Reflections'
import Stacks from '../sections/Stacks'
import DoorSection from '../sections/DoorSection'
import Bridge from '../components/Bridge'
import { useMeta } from '../lib/meta'

// The home page, in walking order.
export default function Home() {
  useMeta({ title: 'Rushan Haque, Website Developer and Designer in Moradabad, India', path: '/' })
  return (
    <>
      <Threshold />
      <RecentWorks />
      <Drafting />
      <Bridge tone="night">Behind every build is a business, and most of them make things by hand in brass, copper and wood.</Bridge>
      <Workshop />
      <Names />
      <Astrolabe />
      <OtherServices />
      <Bridge tone="ivory">The work is half the story. The rest is what clients say once it’s live.</Bridge>
      <Reflections />
      <Bridge tone="night">And when the screens go quiet, I write.</Bridge>
      <Stacks />
      <DoorSection />
    </>
  )
}
