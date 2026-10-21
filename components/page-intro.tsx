import { Split } from '@/components/split';
// Entrance motion is pure CSS (the split-heading rules in premium.css): the heading
// paints with the first frame instead of waiting for JavaScript, which protects LCP.
export function PageIntro({eyebrow,title,accent,description}:{eyebrow:string;title:string;accent?:string;description:string}){return <div className="page-intro container"><span className="eyebrow">{eyebrow}</span><Split as="h1" hero text={accent?`${title} *${accent}*`:title}/><p>{description}</p></div>;}
