'use client';
import { useEffect } from 'react';

// Section headings stay on one line: when a heading would wrap, its type is
// scaled down to the width available. On narrow screens a heading that would
// fall below a comfortable size keeps its normal size and wraps instead.
// The same code runs inline right after the page content, so headings have
// their final size in the first frame (no layout shift), and again on resize
// and once the web fonts have loaded.
const SCRIPT = `(function(){
var SEL=['main h1','.tl-deck-head h2','.tl-build-head h2','.tl-writing-head h2','.tl-wall-head h2','.tl-person-copy h2','.tl-voices-head h2','.lab-intro h2','.study-head h2','.ft-cta h2','.rvp-top h2','main section > h2','main .container > h2'].join(',');
function run(){
  var els=[].slice.call(document.querySelectorAll(SEL)).filter(function(el){return !el.closest('.gh, .tl-hero, .ad, .credential-card, .project-card, .guide-page .page-intro')});
  els.forEach(function(el){el.style.fontSize='';el.style.whiteSpace='nowrap'});
  var floor=window.innerWidth<700?30:36,page=document.documentElement.clientWidth;
  var plan=els.map(function(el){
    var parent=el.parentElement,ps=getComputedStyle(parent);
    var room=parent.clientWidth-parseFloat(ps.paddingLeft)-parseFloat(ps.paddingRight);
    var box=el.getBoundingClientRect();
    var avail=Math.min(el.clientWidth||room,room,page-box.left-16);
    var need=Math.max(el.scrollWidth,box.width);
    if(!avail||need<=avail+1)return null;
    var size=Math.floor(parseFloat(getComputedStyle(el).fontSize)*(avail/need)*0.98);
    return size>=floor?size+'px':'';
  });
  els.forEach(function(el,i){var v=plan[i];if(v===null)return;if(v)el.style.fontSize=v;else el.style.whiteSpace=''});
}
window.__fitHeadings=run;run();
})();`;

export function FitHeadings() {
  useEffect(() => {
    const fit = () => (window as Window & { __fitHeadings?: () => void }).__fitHeadings?.();
    let frame = 0;
    const run = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(fit); };
    run();
    document.fonts?.ready.then(run);
    let width = window.innerWidth;
    const onResize = () => { if (window.innerWidth !== width) { width = window.innerWidth; run(); } };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', onResize); };
  }, []);
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }}/>;
}
