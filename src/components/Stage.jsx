import { useEffect, useRef } from 'react'
import { device } from '../lib/device'
import { director } from '../lib/director'

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|microsoft basic/i
// Asked before anything is downloaded, so a device without a real graphics chip waits for nothing.
function canDraw() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return !SOFTWARE.test(name)
  } catch {
    return false
  }
}

// The canvas, once, for the life of the site. Only two rooms use it, so its code loads when one of them is on
// the page and the browser has a moment. Every other page never downloads it, and every page is finished without it.
export default function Stage() {
  const ref = useRef(null)
  useEffect(() => {
    if (!device().gl) {
      document.documentElement.classList.remove('can-gl')
      return undefined
    }
    let cancelled = false
    let asked = false
    const start = () => {
      if (cancelled) return
      if (!canDraw()) { document.documentElement.classList.remove('can-gl'); return }
      import('../gl/boot').then(({ boot }) => { if (!cancelled) boot(ref.current) }).catch(() => { document.documentElement.classList.remove('can-gl') })
    }
    let id = 0
    const idle = window.requestIdleCallback
    const want = (now) => {
      if (asked) { if (now && id) { if (idle) window.cancelIdleCallback(id); else clearTimeout(id); id = 0; start() } return }
      asked = true
      if (now) { start(); return }
      id = idle ? idle(() => { id = 0; start() }, { timeout: 1600 }) : setTimeout(() => { id = 0; start() }, 500)
    }
    director.wantGL = want
    if (director.chapters.some((c) => c.stage)) want()
    return () => {
      cancelled = true
      director.wantGL = null
      if (idle) window.cancelIdleCallback(id)
      else clearTimeout(id)
    }
  }, [])
  return <canvas ref={ref} className="gl" aria-hidden="true" />
}
