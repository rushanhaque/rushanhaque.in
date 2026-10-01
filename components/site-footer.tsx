import Link from '@/components/site-link';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { CopyEmail } from '@/components/interactive';
import { MotionToggle } from '@/components/site-motion';
import { address, bookingUrl, email, phone, socials } from '@/lib/content';

const explore=[['Home','/'],['Works','/projects'],['Writing','/writing'],['Services','/services'],['Products','/products'],['Areas served','/areas-served'],['Journey','/#journey'],['Certificates','/certifications'],['Reviews','/reviews'],['Contact','/contact']];

export function SiteFooter(){return <footer className="footer"><div className="container">
  <div className="footer-top">
    <div className="footer-invitation"><span className="eyebrow">SO, WHAT ARE WE BUILDING?</span><Link href="/contact" className="footer-big-link closing-frame" data-reveal data-cursor="Say hi"><span className="footer-big-line">Let’s</span><br/><em className="footer-big-line">talk.</em><ArrowUpRight/></Link>
      <div className="footer-email"><a href={`mailto:${email}?subject=Hello%20from%20your%20site`}>{email}</a><CopyEmail/></div>
      <ul className="footer-contact">
        <li><span>WhatsApp</span><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer">{phone.label}</a></li>
        <li><span>Studio</span><a href={address.map} target="_blank" rel="noopener noreferrer">{address.label}</a></li>
      </ul>
    </div>
    <div className="footer-nav">
      <div><span>Explore</span>{explore.map(([label,url])=><Link href={url} key={url} >{label}</Link>)}</div>
      <div><span>Connect</span>{socials.map(s=><a href={s.url} key={s.name} target="_blank" rel="noopener noreferrer" className="footer-social">{s.name} <ArrowUpRight size={12}/></a>)}<a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="footer-social"><span>Schedule a call</span> <ArrowUpRight size={12}/></a><Link href="/write-a-review" ><span>Write a review</span></Link></div>
    </div>
  </div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} Rushan Haque</span><span className="footer-signoff">Developer & writer. Logic in one hand, language in the other.</span><div><MotionToggle/><Link href="/privacy">Privacy</Link><Link href="/accessibility">Accessibility</Link><a href="#top" className="back-to-top" aria-label="Back to top"><ArrowUp size={15}/></a></div></div>
</div></footer>;}
