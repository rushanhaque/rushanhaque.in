import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP)

gsap.defaults({ ease: 'expo.out', duration: 1.2 })
// the page says when it has moved (App.jsx); there is no need for a second measure the moment it finishes loading
if (typeof window !== 'undefined') ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,resize' })

export { gsap, ScrollTrigger, SplitText, useGSAP }
