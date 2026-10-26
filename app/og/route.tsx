import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// The share image for every page (lib/seo.ts points each page here with its own title):
// the title set large on the forest sheet, with the drawing set's title block beneath.
// The fonts never change, so they are read once.
const fonts = Promise.all(['normal', 'italic'].map(style => readFile(join(process.cwd(), `assets/og/instrument-serif-latin-400-${style}.woff`))));

const ink = '#07241a', cream = '#ffffff', brass = '#d98ba0';
// Titles in a script the serif has no letters for (the Hindi guides) fall back to the name.
const latin = (s: string) => /^[\u0000-ɏ‐-›₹ ]*$/.test(s);

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  let title = (query.get('t') || 'Rushan Haque | Website Designer & Developer').slice(0, 120);
  const path = (query.get('p') || '/').slice(0, 70);
  if (!latin(title)) title = 'Rushan Haque | Website Designer & Developer';
  // "Title — subtitle" and "Name | role" set the second part in brass italics.
  const [head, ...rest] = title.split(/\s+[—|–]\s+/);
  const tail = rest.join(' — ');
  const size = head.length <= 18 ? 116 : head.length <= 30 ? 96 : head.length <= 44 ? 78 : 64;
  const [regular, italic] = await fonts;
  const cell = { display: 'flex', alignItems: 'center', height: 40, padding: '0 16px', border: `1px solid rgba(255,255,255,.28)`, marginRight: -1 } as const;
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 72px 56px', background: ink, color: cream, fontFamily: 'Instrument', backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '64px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 22, letterSpacing: 4, color: brass }}>
        <span>RUSHAN HAQUE</span>
        <span style={{ flex: 1, height: 1, margin: '0 24px', background: 'rgba(255,255,255,.25)' }}/>
        <span style={{ color: 'rgba(255,255,255,.7)' }}>WEBSITE DESIGNER &amp; DEVELOPER</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: size, lineHeight: 1.02, letterSpacing: -2, maxWidth: 1040 }}>{head}</div>
        {tail && <div style={{ display: 'flex', marginTop: 14, fontSize: Math.round(size * .6), fontStyle: 'italic', color: brass, lineHeight: 1.1 }}>{tail}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 20, letterSpacing: 2, color: 'rgba(255,255,255,.8)' }}>
        <div style={{ display: 'flex' }}>
          <span style={cell}>DWG</span>
          <span style={cell}>rushanhaque.in{path === '/' ? '' : path}</span>
          <span style={cell}>1 : 1</span>
        </div>
        <span style={{ fontStyle: 'italic', fontSize: 26, color: brass }}>Fast, mobile-first, made to be found.</span>
      </div>
    </div>,
    {
      width: 1200, height: 630,
      fonts: [{ name: 'Instrument', data: regular, style: 'normal', weight: 400 }, { name: 'Instrument', data: italic, style: 'italic', weight: 400 }],
      // A page's image only changes with its title, and a new title is a new address.
      headers: { 'Cache-Control': 'public, max-age=604800, s-maxage=31536000, stale-while-revalidate=604800' },
    },
  );
}
