'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Download, RotateCcw, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';

gsap.registerPlugin(ScrollTrigger);

function Study({ id, number, name, children, className = '' }: { id: string; number: string; name: string; children: ReactNode; className?: string }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo('.study-heading', { y: 35 }, { y: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 25%', scrub: 1 } });
      gsap.fromTo('.study-number', { rotate: -12 }, { rotate: 8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      if (id === 'decisions-study') gsap.fromTo('.decision-fold', { rotationX: -22, y: 20 }, { rotationX: 0, y: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 60%', once: true } });
      if (id === 'perspective-study') gsap.fromTo('.perspective-object', { rotate: -3, y: 24 }, { rotate: 2, y: -20, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    }, root);
    return () => context.revert();
  }, [id]);
  return <section id={id} className={`portfolio-study ${className}`} ref={root} aria-labelledby={`${id}-title`}><div className="study-topline"><span>OPEN FORM / INTERACTIVE STUDIES</span><span>{number} — {name}</span></div>{children}<span className="study-number" aria-hidden="true">{number}</span></section>;
}

export function StudyIndex() {
  useEffect(() => {
    let disposed = false;
    const align = () => { void document.fonts.ready.then(() => requestAnimationFrame(() => {
      if (disposed || !/^#(?:perspective|direction|decisions|echo|edition)-study$/.test(window.location.hash)) return;
      ScrollTrigger.refresh();
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    })); };
    if (document.readyState === 'complete') align(); else window.addEventListener('load', align, { once: true });
    return () => { disposed = true; window.removeEventListener('load', align); };
  }, []);
  return <nav className="study-index" aria-label="Explore the interactive studies"><span>A FEW THINGS TO GET YOUR HANDS ON <ArrowDown size={14}/></span>{[['perspective-study','01 / Perspective'],['direction-study','02 / Art direction'],['decisions-study','03 / Decisions'],['echo-study','04 / Echoes'],['edition-study','05 / Your edition']].map(([id,title])=><a href={`#${id}`} key={id} onClick={event=>{event.preventDefault();history.replaceState(null,'',`#${id}`);ScrollTrigger.refresh();document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});}}>{title}<ArrowUpRight size={13}/></a>)}</nav>;
}

const monogram = ['11110010001','10001010001','10001010001','11110011111','10100010001','10010010001','10001010001'];
const letterPoints = monogram.flatMap((row,y)=>[...row].flatMap((cell,x)=>cell==='1' ? [[160+x*30,130+y*39]] : []));
const views = [
  { title:'A designer’s eye.', word:'FORM', text:'Separate pieces. One clear composition.' },
  { title:'A developer’s instinct.', word:'FUNCTION', text:'A structure that makes room for the idea.' },
  { title:'A writer’s point of view.', word:'MEANING', text:'The same pieces. Something else to say.' },
];
function sculpturePoint(i:number, view:number) {
  if(view===0) return letterPoints[i % letterPoints.length];
  if(view===1) {
    if(i<24) return [125+(i%12)*34,105+Math.floor(i/12)*245];
    if(i<38) return [125+Math.floor((i-24)/7)*374,140+((i-24)%7)*30];
    if(i<50) return [125+(i-38)*34,153];
    if(i<68) return [160+((i-50)%6)*28,208+Math.floor((i-50)/6)*36];
    return [370+((i-68)%4)*28,208+Math.floor((i-68)/4)*28];
  }
  return [120+(i%15)*28,170+Math.floor(i/15)*62+Math.sin(i*.6)*18];
}
export function PerspectiveStudy() {
  const [angle,setAngle]=useState(0);
  const uid=useId().replaceAll(':','');
  const raw=angle/120, from=Math.floor(raw)%3, to=(from+1)%3, t=raw-Math.floor(raw);
  const active=Math.round(raw)%3;
  const scatter=Math.sin(t*Math.PI);
  return <Study id="perspective-study" number="01" name="A CHANGE OF PERSPECTIVE" className="perspective-study"><div className="study-heading"><h2 id="perspective-study-title">It depends<br/>how you <em>look.</em></h2><p>One mind. Three ways of seeing.<br/>Turn the composition. Find a different answer.</p></div><div className="perspective-object"><svg viewBox="0 0 640 500" role="img" aria-label={`Sculptural fragments resolving into ${views[active].word.toLowerCase()}`}><defs><linearGradient id={`${uid}-metal`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#092c21"/><stop offset=".25" stopColor="#a6b8a7"/><stop offset=".48" stopColor="#f2f3df"/><stop offset=".6" stopColor="#748775"/><stop offset="1" stopColor="#183e30"/></linearGradient><radialGradient id={`${uid}-shadow`}><stop stopColor="#163629" stopOpacity=".25"/><stop offset="1" stopColor="#163629" stopOpacity="0"/></radialGradient></defs><ellipse cx="320" cy="455" rx="220" ry="24" fill={`url(#${uid}-shadow)`}/><g className="sculpture-float">{Array.from({length:84},(_,i)=>{const a=sculpturePoint(i,from),b=sculpturePoint(i,to);const x=a[0]*(1-t)+b[0]*t+Math.sin(i*2.4+angle*.01)*scatter*105;const y=a[1]*(1-t)+b[1]*t+Math.cos(i*1.7)*scatter*100;return <rect key={i} x={x} y={y} width={from===1&&scatter<.2?27:20} height="31" rx="3" fill={`url(#${uid}-metal)`} stroke="#f5f5e6" strokeOpacity=".45" strokeWidth=".5" transform={`rotate(${scatter*Math.sin(i)*160} ${x+10} ${y+15})`}/>;})}{active===2&&<text x="320" y="390" textAnchor="middle" className="sculpture-poem" opacity={1-scatter}>make room for wonder.</text>}</g></svg><span className="object-coordinate">RH / THREE DIMENSIONS OF A PRACTICE</span><span className="object-angle">{String(angle).padStart(3,'0')}°</span></div><div className="perspective-console"><div role="group" aria-label="Choose a perspective">{views.map((view,i)=><button key={view.word} aria-pressed={active===i} onClick={()=>setAngle(i*120)}><span>0{i+1}</span>{view.word}</button>)}</div><label className="study-range"><span>ROTATE THE COMPOSITION <span>0° — 360°</span></span><input type="range" min="0" max="360" value={angle} onChange={e=>setAngle(Number(e.target.value))} aria-label="Sculpture rotation"/></label><div className="study-perspective-caption" aria-live="polite"><strong>{views[active].title}</strong><p>{views[active].text}</p></div></div></Study>;
}

const directionPresets=[{name:'The quiet reader',values:[10,15,10]},{name:'The curious collector',values:[65,85,40]},{name:'The night browser',values:[95,35,95]}];
export function DirectionStudy() {
  const [values,setValues]=useState([10,15,10]);
  const [expression,play,immersion]=values;
  const style={'--book-accent':`hsl(${28+expression*1.2}  ${20+expression*.3}% ${72-expression*.35}%)`,'--book-bg':`hsl(48 25% ${96-immersion*.77}%)`,'--book-ink':immersion>58?'#f6f0da':'#173329','--book-tilt':`${(play-15)/9}deg`,'--book-size':`${48+expression*.34}px`,'--book-radius':`${play*.28}px`} as CSSProperties;
  return <Study id="direction-study" number="02" name="AN ART-DIRECTION INSTRUMENT" className="direction-study"><div className="study-heading"><h2 id="direction-study-title">Same brief.<br/><em>Different worlds.</em></h2><p>The brief: a digital home for an independent bookshop.<br/>You choose the feeling. Watch the whole world follow.</p></div><div className="direction-workbench"><div className={`bookshop-world ${immersion>60?'is-immersive':''}`} style={style}><div className="bookshop-nav"><strong>dog-ear<span>books & other beginnings</span></strong><span>EST. 2026 ↗</span></div><div className="bookshop-body"><div className="bookshop-copy"><span className="bookshop-eyebrow">FOR THE FOREVER CURIOUS</span><h3 style={{fontFamily:play>60?'var(--font-sans)':'Georgia, serif'}}>A good place<br/>to get <em>lost.</em></h3><p>Small press. Big ideas.<br/>Your next favourite is waiting.</p><span className="bookshop-action">Find your next chapter <ArrowUpRight size={17}/></span></div><div className="bookshop-art" aria-hidden="true"><div className="demo-book demo-book-back"><span>THE ART<br/>OF NOTICING</span></div><div className="demo-book demo-book-front"><small>NOT ALL WHO WANDER</small><span>Somewhere,<br/><em>else.</em></span><i/><small>A BOOK OF SMALL DISCOVERIES</small></div><span className="bookshop-orbit">READ SOMETHING UNEXPECTED ↗</span></div></div><div className="bookshop-foot"><span>INDEPENDENT BY NATURE.</span><span>FICTION / ART / THE IN-BETWEEN</span></div></div><div className="direction-controls"><span className="study-label">YOUR CREATIVE DIRECTION</span>{[['Quiet','Expressive'],['Precise','Playful'],['Editorial','Immersive']].map(([a,b],i)=><label className="study-range" key={a}><span>{a}<span>{b}</span></span><input aria-label={`${a} to ${b}`} type="range" min="0" max="100" value={values[i]} onChange={e=>setValues(current=>current.map((v,index)=>index===i?Number(e.target.value):v))}/></label>)}<div className="direction-presets" role="group" aria-label="Art direction presets">{directionPresets.map(p=><button key={p.name} aria-pressed={p.values.every((v,i)=>v===values[i])} onClick={()=>setValues(p.values)}>{p.name}<ArrowUpRight size={14}/></button>)}</div><p className="direction-note">{immersion>60?'An atmospheric destination for browsing slowly.':play>60?'An expressive little world for curious collectors.':'An editorial composition that gives books room to speak.'}</p><small>A fictional brief. Three deliberately different directions.</small></div></div></Study>;
}

const decisions=[
  {title:'What do we say first?',options:['Lead with the feeling','Lead with the offering'],notes:['An invitation makes the first moment personal.','A direct statement makes the offer immediately clear.']},
  {title:'Where does the eye go?',options:['Give the image room','Let the words lead'],notes:['An expansive visual establishes the atmosphere.','A quieter image lets the editorial voice do the work.']},
  {title:'How does the story continue?',options:['Invite an exploration','Start a conversation'],notes:['A gentle next step suits someone still getting to know you.','A direct invitation gives a ready visitor somewhere to go.']},
];
export function DecisionsStudy() {
  const [open,setOpen]=useState<number|null>(0);
  const [choices,setChoices]=useState([0,0,0]);
  return <Study id="decisions-study" number="03" name="BENEATH THE FINISHED THING" className="decisions-study"><div className="study-heading"><h2 id="decisions-study-title">The decisions<br/>you <em>don’t see.</em></h2><p>A finished page is a collection of choices.<br/>Unfold a few. Follow a different possibility.</p></div><div className="decision-workbench"><div className={`folded-preview ${choices[1]?'words-first':''}`}><div className="folded-preview-top"><span>FIELDNOTES / AN INDEPENDENT PRACTICE</span><span>DESIGN EXPLORATION</span></div><div className="folded-preview-content"><div><small>A PLACE FOR WHAT COMES NEXT</small><h3>{choices[0]?<>Thoughtful design.<br/><em>Built for people.</em></>:<>Make space<br/>for <em>possibility.</em></>}</h3><span className="folded-cta">{choices[2]?'Let’s talk about your idea':'Explore a different point of view'} <ArrowUpRight size={16}/></span></div><div className="folded-art" aria-hidden="true"><i/><i/><i/><i/><span>F / N</span></div></div><div className="folded-preview-bottom"><span>ONE COMPOSITION. EIGHT POSSIBLE PATHS.</span><span>{choices.map(v=>v?'B':'A').join(' / ')}</span></div></div><div className="decision-folds">{decisions.map((decision,i)=><div className={`decision-fold ${open===i?'is-open':''}`} key={decision.title}><button className="fold-toggle" aria-expanded={open===i} aria-controls={`decision-fold-${i}`} onClick={()=>setOpen(open===i?null:i)}><span>0{i+1}</span><strong>{decision.title}</strong><span>{open===i?'−':'+'}</span></button><div id={`decision-fold-${i}`} className="fold-inside" hidden={open!==i}><div role="group" aria-label={decision.title}>{decision.options.map((option,j)=><button key={option} aria-pressed={choices[i]===j} onClick={()=>setChoices(current=>current.map((v,index)=>index===i?j:v))}><span>{j?'B':'A'}</span>{option}</button>)}</div><p aria-live="polite">{decision.notes[choices[i]]}</p></div></div>)}<button className="fold-reset" onClick={()=>{setChoices([0,0,0]);setOpen(null);}}>Fold back to the original <RotateCcw size={15}/></button><p className="study-disclaimer">An original design exercise, showing possible trade-offs rather than a reconstruction of a client’s process.</p></div></div></Study>;
}

const echoMarks=['✳','○','↗','∿','+','◐','—','◇'];
const echoColors=['#c7d49a','#f4b797','#e7e9d6','#8dc1b1','#afabd2','#e1c375','#8ea8c6','#b2c89d'];
export function EchoStudy() {
  const [generation,setGeneration]=useState(0);
  const [outside,setOutside]=useState(0);
  const {writings}=useContent();
  const article=writings.find(w=>w.slug==='feedback-loop-collapse');
  const varieties=Math.max(1,8-generation+outside);
  return <Study id="echo-study" number="04" name="A SMALL THOUGHT EXPERIMENT" className="echo-study"><div className="study-heading"><h2 id="echo-study-title">When the internet<br/><em>echoes itself.</em></h2><p>What remains when every new idea learns<br/>only from the one before it?</p></div><div className="echo-world"><div className="echo-readout"><span>GENERATION <strong>{String(generation).padStart(2,'0')}</strong></span><span>VISUAL VOCABULARY <strong>{varieties} / 8</strong></span></div><div className="echo-field" aria-hidden="true">{Array.from({length:144},(_,i)=>{const kind=(i*7+Math.floor(i/12)*3)%varieties;return <span key={i} style={{color:echoColors[kind],animationDelay:`${(-(i%17)*.3).toFixed(1)}s`,transform:`rotate(${varieties===1?0:(Math.sin(i)*25).toFixed(3)}deg)`}}>{echoMarks[kind]}</span>;})}</div><div className="echo-caption" aria-live="polite">{varieties===1?'An entire world. One repeated idea.':generation===0?'Eight kinds of marks. Many ways to be different.':outside?'A new perspective changes what can come next.':'The field still moves. Its vocabulary is getting smaller.'}</div></div><div className="echo-bottom"><div className="echo-actions"><button className="study-button light" disabled={generation>=7} onClick={()=>{setGeneration(v=>v+1);setOutside(v=>Math.max(0,v-1));}}>Learn from the previous generation <ArrowUpRight size={16}/></button><button className="study-button ghost" disabled={varieties===8} onClick={()=>setOutside(v=>Math.min(generation,v+2))}><Sparkles size={16}/> Outside perspectives</button><button className="echo-reset" onClick={()=>{setGeneration(0);setOutside(0);}} aria-label="Reset echo experiment"><RotateCcw size={18}/></button></div><p className="study-disclaimer">An illustrative visual model, not a scientific simulation or a prediction of AI behaviour. {article&&<Link href={`/writing/${article.slug}`}>Read the research note <ArrowUpRight size={13}/></Link>}</p></div></Study>;
}

const editionWords=[['Clarity','Curiosity','Character'],['Calm','Energy','Wonder'],['Connection','Possibility','Meaning']];
const palettes=[['#173c2b','#d4dfb1'],['#953f2d','#f4d4b2'],['#383859','#ded5ea']];
function EditionArt({ choices, uid }: { choices:number[]; uid:string }) {
  const palette=palettes[choices[1]];
  return <svg viewBox="0 0 480 340" aria-hidden="true"><defs><clipPath id={uid}><rect x="16" y="16" width="448" height="308" rx={choices[0]*35}/></clipPath></defs><g clipPath={`url(#${uid})`}><rect width="480" height="340" fill={palette[1]}/>{Array.from({length:12},(_,i)=><ellipse key={i} cx={Number((240+Math.sin(i*.45+choices[0])*70).toFixed(3))} cy="170" rx={25+i*17} ry={140-i*8} transform={`rotate(${i*13+choices[2]*35} 240 170)`} fill="none" stroke={palette[0]} strokeWidth={choices[0]===0?'1.5':'4'}/>)}<circle cx={choices[2]===0?240:choices[2]===1?340:140} cy="170" r="30" fill={palette[0]}/></g></svg>;
}
export function EditionStudy() {
  const [choices,setChoices]=useState([0,0,0]);
  const [printed,setPrinted]=useState(false);
  const [flipped,setFlipped]=useState(false);
  const [status,setStatus]=useState('');
  const card=useRef<HTMLDivElement>(null);
  const uid=useId().replaceAll(':','');
  const words=choices.map((v,i)=>editionWords[i][v]);
  function print(){setPrinted(true);setStatus('Your edition is ready. Turn it over or save a copy.');}
  function download(){
    const svg=card.current?.querySelector('svg');if(!svg)return;
    const art=new XMLSerializer().serializeToString(svg);
    const text=words.join(' / ');
    const output=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 600 600"><rect width="600" height="600" fill="#f3f0e5"/><text x="42" y="48" font-family="Arial,sans-serif" font-size="12" fill="#173c2b">OPEN FORM / A SMALL EDITION BY RUSHAN HAQUE</text><svg x="42" y="80" width="516" height="366" viewBox="0 0 480 340">${art}</svg><text x="42" y="496" font-family="Georgia,serif" font-size="24" fill="#173c2b">${text}</text><text x="42" y="548" font-family="Arial,sans-serif" font-size="12" fill="#173c2b">Made with you. A beginning, perhaps.</text><text x="42" y="570" font-family="Arial,sans-serif" font-size="10" fill="#173c2b">rushanulhaque@gmail.com</text></svg>`;
    const url=URL.createObjectURL(new Blob([output],{type:'image/svg+xml'}));const link=document.createElement('a');link.href=url;link.download=`rushan-edition-${choices.join('')}.svg`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Your edition has been downloaded as an SVG.');
  }
  return <Study id="edition-study" number="05" name="A LITTLE SOMETHING TO TAKE AWAY" className="edition-study"><div className="study-heading"><h2 id="edition-study-title">A small edition.<br/><em>Made with you.</em></h2><p>Three words. Your own composition.<br/>A little piece of this visit, to keep.</p></div><div className="edition-workbench"><div className={`edition-press ${printed?'is-printed':''}`}><div className="press-slot"><span>THE OPEN FORM PRESS</span><i/></div><div className={`edition-card ${flipped?'is-flipped':''}`} ref={card}><div className="edition-front" aria-hidden={flipped}><div className="edition-card-head"><span>RH / OPEN FORM</span><span>EDITION {String(choices[0]*9+choices[1]*3+choices[2]+1).padStart(3,'0')} / 027</span></div><EditionArt choices={choices} uid={`edition-${uid}`}/><h3>{words.join('. ')}.</h3><div className="edition-card-foot"><span>MADE WITH YOU.</span><span>↗</span></div></div><div className="edition-back" aria-hidden={!flipped}><span>TO THE PERSON HOLDING THIS.</span><p>A little curiosity<br/>can be the start of<br/><em>something good.</em></p><span>Have an idea you want to make real?</span><Link tabIndex={flipped?0:-1} href={`/contact?project=${encodeURIComponent(words.join(', '))}`}>Let’s make it together <ArrowUpRight size={15}/></Link><small>RUSHAN HAQUE / OPEN FORM</small></div></div><span className="press-baseline">AN EXPERIMENT IN SHARED AUTHORSHIP</span></div><div className="edition-controls"><span className="study-label">WHAT WOULD YOU LIKE TO MAKE ROOM FOR?</span>{editionWords.map((group,i)=><fieldset key={i}><legend>0{i+1} / {['The intention','The feeling','The possibility'][i]}</legend>{group.map((word,j)=><button key={word} aria-pressed={choices[i]===j} disabled={printed} onClick={()=>{setChoices(v=>v.map((n,k)=>k===i?j:n));setStatus('');}}>{word}</button>)}</fieldset>)}{!printed?<button className="study-button dark print-button" onClick={print}>Print my edition <ArrowDown size={18}/></button>:<div className="edition-result"><button className="study-button dark" onClick={download}>Save your edition <Download size={17}/></button><button className="text-link" aria-pressed={flipped} onClick={()=>setFlipped(v=>!v)}>{flipped?'See the composition':'Turn the card over'} <RotateCcw size={15}/></button><button className="text-link" onClick={()=>{setPrinted(false);setFlipped(false);setStatus('');}}>Make another <RotateCcw size={14}/></button></div>}<p className="edition-status" role="status">{status}</p></div></div></Study>;
}
