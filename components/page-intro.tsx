// Entrance motion is pure CSS (see `.page-intro` in v2.css): the heading paints
// with the first frame instead of waiting for JavaScript, which protects LCP.
export function PageIntro({eyebrow,title,accent,description}:{eyebrow:string;title:string;accent?:string;description:string}){return <div className="page-intro container"><span className="eyebrow">{eyebrow}</span><h1 suppressHydrationWarning><span className="intro-line"><span>{title}</span></span>{accent&&' '}{accent&&<span className="intro-line"><em>{accent}</em></span>}</h1><p>{description}</p></div>;}
