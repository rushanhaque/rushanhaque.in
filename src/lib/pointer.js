// The pointer, shared. Everything that follows the cursor reads from here, outside React.
//   x, y     pixels
//   nx, ny   -1..1, viewport centred, y up
//   sx, sy   the same, smoothed: this is where "the light" is
export const pointer = { x: 0, y: 0, nx: 0.4, ny: 0.34, sx: 0.4, sy: 0.34, moved: false, down: false }

let bound = false
export function bindPointer() {
  if (bound || typeof window === 'undefined') return
  bound = true
  pointer.x = innerWidth * 0.7
  pointer.y = innerHeight * 0.33
  const set = (e) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
    if (e.pointerType === 'touch') return // a finger scrolling is not a finger steering the light
    pointer.nx = (e.clientX / innerWidth) * 2 - 1
    pointer.ny = -((e.clientY / innerHeight) * 2 - 1)
    pointer.moved = true
  }
  addEventListener('pointermove', set, { passive: true })
  addEventListener('pointerdown', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.down = true }, { passive: true })
  addEventListener('pointerup', () => { pointer.down = false }, { passive: true })
}

export function smoothPointer(dt) {
  const k = 1 - Math.exp(-dt * 5)
  pointer.sx += (pointer.nx - pointer.sx) * k
  pointer.sy += (pointer.ny - pointer.sy) * k
}
