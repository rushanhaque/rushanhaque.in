import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from './gsap'
import { setHour } from './sun'
import { bindPointer, smoothPointer } from './pointer'
import { measureTones, toneTick } from './tone'

const smooth = (t) => { const k = Math.min(1, Math.max(0, t)); return k * k * (3 - 2 * k) }
export const clamp01 = (t) => Math.min(1, Math.max(0, t))
export const range = (v, a, b) => clamp01((v - a) / (b - a))
export const ramp = (v, a, b) => smooth((v - a) / (b - a))

// The director watches one number, how far down the page we are, and from it decides everything that is
// shared: what time it is, which room we are in, which scene the canvas draws. // Sections add their chapters; it reads them in page order. All of
// this runs whether or not there is a canvas: the rooms move the same either way.
//
// A chapter is:
//   id, name         for the Sundial
//   time [from, to]  the hours it spans
//   stage            the scene behind this room, if any; every other room is a solid sheet over the canvas
//   frame(info)      called each tick while it is the current chapter
//   leave()          called once when the walk moves on
export const director = {
  chapters: [],
  current: null,
  listeners: new Set(),
  engineListeners: new Set(),
  engine: null,
  vh: 1,
  state: { stage: null },
  started: false,
  pending: false,

  setEngine(e) {
    this.engine = e
    this.engineListeners.forEach((f) => f(e))
  },
  onEngine(f) {
    this.engineListeners.add(f)
    if (this.engine) f(this.engine)
    return () => this.engineListeners.delete(f)
  },

  start() {
    if (this.started || typeof window === 'undefined') return
    this.started = true
    bindPointer()
    this.update = this.update.bind(this)
    gsap.ticker.add(this.update)
    this.measure()
    ScrollTrigger.addEventListener('refresh', () => this.measure())
    let lastW = innerWidth
    const touch = matchMedia('(hover: none), (pointer: coarse)').matches
    addEventListener('resize', () => {
      // the address bar sliding away on a phone changes nothing that matters here
      if (touch && innerWidth === lastW) return
      lastW = innerWidth
      this.measure()
    })
  },

  add(ch) {
    this.chapters.push(ch)
    if (ch.stage) this.wantGL?.()
    this.measure()
    return () => {
      this.chapters = this.chapters.filter((c) => c !== ch)
      if (this.current === ch) this.current = null
      this.measure()
    }
  },

  soon() {
    if (this.pending) return
    this.pending = true
    queueMicrotask(() => { this.pending = false; this.measure() })
  },

  measure() {
    if (typeof window === 'undefined') return
    measureTones()
    this.vh = innerHeight
    const y = scrollY
    for (const c of this.chapters) {
      if (!c.el) continue
      const r = c.el.getBoundingClientRect()
      c.top = r.top + y
      c.height = r.height
      c.stageH = c.el.querySelector(':scope > .pin__stage')?.offsetHeight || this.vh
    }
    this.chapters.sort((a, b) => a.top - b.top)
  },

  update(time, deltaMs) {
    smoothPointer(Math.min(deltaMs / 1000, 0.05))
    toneTick()
    const list = this.chapters
    if (!list.length) return
    const y = scrollY
    const vh = this.vh
    const line = y + vh * 0.5
    const at = (c) => c.top - vh * 0.5
    let i = 0
    for (let k = 0; k < list.length; k++) if (y >= at(list[k])) i = k
    const c = list[i]
    const prev = list[i - 1]
    const next = list[i + 1]

    const owned = range(line, c.top, c.top + c.height)
    const pinSpan = c.height - c.stageH
    const stick = pinSpan > 4 ? range(y, c.top, c.top + pinSpan) : owned

    setHour(c.time[0] + (c.time[1] - c.time[0]) * owned)

    // a scene runs for as long as any of its room is on screen; the solid rooms slide over it
    let stage = null
    for (const k of list) {
      const ends = k.stageShare ? k.top + (k.height - k.stageH) * k.stageShare : k.top + k.height
      if (k.stage && y + vh > k.top && y < ends) stage = k.stage
    }
    // being inside the room is enough: a stale measurement must never leave its scene switched off
    if (!stage && c.stage) stage = c.stage
    this.state.stage = stage

    c.frame?.({ owned, stick, y, vh, top: c.top, height: c.height, stageH: c.stageH, line, engine: this.engine })

    if (this.current !== c) {
      this.current?.leave?.()
      this.current = c
      this.listeners.forEach((f) => f(c))
    }
  },

  jumpY(id) {
    const c = this.chapters.find((k) => k.id === id)
    return c ? c.top : 0
  },
}

export const onChapter = (f) => {
  director.listeners.add(f)
  if (director.current) f(director.current)
  return () => director.listeners.delete(f)
}

// A section joins the story with this.
export function useChapter(ref, config) {
  useLayoutEffect(() => {
    if (!ref.current) return
    const remove = director.add({ ...config, el: ref.current })
    const ro = new ResizeObserver(() => director.soon())
    ro.observe(ref.current)
    return () => { ro.disconnect(); remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
