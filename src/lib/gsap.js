import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, DrawSVGPlugin, ScrambleTextPlugin, useGSAP)

CustomEase.create('expo', '0.16, 1, 0.3, 1')
CustomEase.create('silk', '0.65, 0.05, 0.36, 1')
CustomEase.create('snap', '0.87, 0, 0.13, 1')

gsap.defaults({ ease: 'expo', duration: 1.2 })
ScrollTrigger.config({ ignoreMobileResize: true })
ScrollTrigger.defaults({ anticipatePin: 1 })
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger })

export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isTouch = () => window.matchMedia('(hover: none)').matches

export { gsap, ScrollTrigger, SplitText, useGSAP }
