import { Fragment, type ElementType } from 'react';

// A heading whose words rise out of their own masks and un-tilt, like type being
// set (styles in premium.css). `*text*` is the italic accent and `|` breaks the line.
// A `hero` heading plays as the page opens, on CSS alone, so it paints with the
// first frame; any other plays once as it scrolls in (components/reveal.tsx).
export function Split({ text, as: Tag = 'h2', hero = false, className, id }: { text: string; as?: ElementType; hero?: boolean; className?: string; id?: string }) {
  let n = 0;
  const label = text.replace(/[*|]/g, ' ').replace(/\s+/g, ' ').trim();
  return <Tag id={id} className={className} data-split={hero ? 'hero' : ''} aria-label={label} suppressHydrationWarning>
    {text.split('|').map((line, l) => <Fragment key={l}>
      {l > 0 && <br/>}
      {line.split(/(\*[^*]+\*)/).filter(s => s.trim()).flatMap(part => {
        const em = part.startsWith('*');
        return part.replace(/\*/g, '').trim().split(/\s+/).map(word => {
          const i = n++;
          return <Fragment key={i}>{i > 0 && ' '}<span className="w" aria-hidden="true"><span style={{ '--i': i } as React.CSSProperties}>{em ? <em>{word}</em> : word}</span></span></Fragment>;
        });
      })}
    </Fragment>)}
  </Tag>;
}
