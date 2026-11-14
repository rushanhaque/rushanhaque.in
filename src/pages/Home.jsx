import Hero from '../sections/Hero'
import SelectedWorks from '../sections/SelectedWorks'
import Building from '../sections/Building'
import Products from '../sections/Products'
import Services from '../sections/Services'
import Clientele from '../sections/Clientele'
import Reviews from '../sections/Reviews'
import Writing from '../sections/Writing'
import Closing from '../sections/Closing'

// The home page, told in chapters.
export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWorks />
      <Building />
      <Products />
      <Services />
      <Clientele />
      <Reviews />
      <Writing />
      <Closing />
    </>
  )
}
