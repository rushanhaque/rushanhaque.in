import { director } from '../lib/director'
import { Engine } from './Engine'
import { Gallery } from './stages/Gallery'
import { Atlas } from './stages/Atlas'

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|microsoft basic/i

export function boot(canvas) {
  if (director.engine) return director.engine
  let engine
  try {
    engine = new Engine(canvas)
  } catch {
    document.documentElement.classList.remove('can-gl')
    return null // no WebGL2, or only a software one: the page is already complete without it
  }
  const gl = engine.gl
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : ''
  if (SOFTWARE.test(name)) {
    engine.kill()
    return null
  }
  engine.register('gallery', (e) => new Gallery(e))
  engine.register('atlas', (e) => new Atlas(e))
  director.setEngine(engine)
  if (import.meta.env.DEV) window.__engine = engine
  return engine
}
