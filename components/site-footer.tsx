import Link from '@/components/site-link';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { CopyEmail } from '@/components/interactive';
import { MotionToggle } from '@/components/site-motion';
import { FooterFinale } from '@/components/story-fx';
import { Roll } from '@/components/roll';
import { address, bookingUrl, email, phone, socials } from '@/lib/content';

const explore=[['Home','/'],['Works','/projects'],['Writing','/writing'],['Journey','/#journey'],['Certificates','/certifications'],['Reviews','/reviews'],['Contact','/contact']];

export function SiteFooter(){return <footer className="footer"><FooterFinale/><div className="container">
  <div className="footer-top">
    <div className="footer-invitation"><span className="eyebrow">THE NEXT GREAT THING STARTS WITH A CONVERSATION</span><Link href="/contact" className="footer-big-link closing-frame" data-reveal data-cursor="Say hi"><span className="footer-big-line">Start the</span><br/><em className="footer-big-line">conversation.</em><ArrowUpRight/></Link>
      <div className="footer-email"><a href={`mailto:${email}?subject=Hello%20from%20your%20site`}>{email}</a><CopyEmail/></div>
      <ul className="footer-contact">
        <li><span>WhatsApp</span><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer">{phone.label}</a></li>
        <li><span>Studio</span><a href={address.map} target="_blank" rel="noopener noreferrer">{address.label}</a></li>
      </ul>
    </div>
    <div className="footer-nav">
      <div><span>Explore</span>{explore.map(([label,url])=><Link href={url} key={url} className="roll-host"><Roll>{label}</Roll></Link>)}</div>
      <div><span>Connect</span>{socials.map(s=><a href={s.url} key={s.name} target="_blank" rel="noopener noreferrer" className="roll-host footer-social"><Roll>{s.name}</Roll> <ArrowUpRight size={12}/></a>)}<a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="roll-host footer-social"><Roll>Schedule a call</Roll> <ArrowUpRight size={12}/></a><Link href="/write-a-review" className="roll-host"><Roll>Write a review</Roll></Link></div>
    </div>
  </div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} Rushan Haque</span><span className="footer-signoff">Developer & Writer · Moradabad, India</span><div><MotionToggle/><Link href="/privacy">Privacy</Link><Link href="/accessibility">Accessibility</Link><a href="#top" className="back-to-top" aria-label="Back to top"><ArrowUp size={15}/></a></div></div>
</div></footer>;}
