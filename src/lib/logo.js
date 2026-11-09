// Gets an uploaded logo ready in the browser: any picture becomes a small, even image with its empty margins cut off,
// so that every logo sits at the same size on its card. It also works out whether the logo is pale, because a pale
// logo on a see-through background needs a dark card.
const MAX_IN = 8 * 1024 * 1024
const MAX_OUT = 400 * 1024
const SIDE = 640

const load = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => resolve({ img, done: () => URL.revokeObjectURL(url) })
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be read as a picture.')) }
  img.src = url
})

const blobOf = (canvas, type, q) => new Promise((r) => canvas.toBlob(r, type, q))
const dataUrl = (blob) => new Promise((resolve, reject) => {
  const f = new FileReader()
  f.onload = () => resolve(f.result)
  f.onerror = () => reject(new Error('That file could not be read.'))
  f.readAsDataURL(blob)
})

export async function prepareLogo(file) {
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) throw new Error('Use a PNG, JPG, WebP or SVG file.')
  if (file.size > MAX_IN) throw new Error('That file is over 8 MB.')
  const { img, done } = await load(file)
  try {
    const w = img.naturalWidth || 640
    const h = img.naturalHeight || 320
    const k = SIDE / Math.max(w, h)
    const a = document.createElement('canvas')
    a.width = Math.max(1, Math.round(w * k))
    a.height = Math.max(1, Math.round(h * k))
    const g = a.getContext('2d', { willReadFrequently: true })
    g.drawImage(img, 0, 0, a.width, a.height)
    const { data } = g.getImageData(0, 0, a.width, a.height)
    let x0 = a.width
    let y0 = a.height
    let x1 = -1
    let y1 = -1
    let see = false
    let sum = 0
    let n = 0
    for (let y = 0; y < a.height; y++) {
      for (let x = 0; x < a.width; x++) {
        const i = (x + y * a.width) * 4
        const al = data[i + 3]
        if (al < 250) see = true
        if (al <= 8) continue
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
        sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
        n++
      }
    }
    if (x1 < 0) throw new Error('That picture is completely empty.')
    const out = document.createElement('canvas')
    // drawn again from the original at full size, now that the margins are gone (never past a photo's own detail)
    const bw = x1 - x0 + 1
    const bh = y1 - y0 + 1
    const grow = Math.min(SIDE / Math.max(bw, bh), file.type === 'image/svg+xml' ? Infinity : 1 / k)
    out.width = Math.max(1, Math.round(bw * Math.max(grow, 1)))
    out.height = Math.max(1, Math.round(bh * Math.max(grow, 1)))
    out.getContext('2d').drawImage(img, x0 / k, y0 / k, bw / k, bh / k, 0, 0, out.width, out.height)
    let blob = await blobOf(out, 'image/webp', 0.9)
    // not every browser can write WebP
    if (!blob || blob.type !== 'image/webp') blob = await blobOf(out, 'image/png')
    if (!blob || blob.size > MAX_OUT) throw new Error('That logo is too detailed to store. Try a simpler file.')
    const url = await dataUrl(blob)
    return { preview: url, base64: url.split(',')[1], ext: blob.type === 'image/webp' ? 'webp' : 'png', tone: see && sum / n > 0.72 ? 'dark' : 'light' }
  } finally {
    done()
  }
}

export const logoPath = (name, ext) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'client'
  return `/img/clients/${slug}-${Date.now().toString(36)}.${ext}`
}
