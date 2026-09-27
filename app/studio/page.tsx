import Link from '@/components/site-link';
import { getChatGPTUser,chatGPTSignInPath } from '@/app/chatgpt-auth';
import { isOwner,setting } from '@/lib/admin';
import { StudioMetrics } from '@/components/studio-metrics';
import { ContentStudio } from '@/components/content-studio';
export const dynamic='force-dynamic';
export const metadata={title:'Private content studio',robots:{index:false,follow:false}};
export default async function Studio(){const user=await getChatGPTUser();const authorized=await isOwner();return <main id="main-content" className="container studio-page"><span className="eyebrow">RUSHAN HAQUE / PRIVATE WORKSPACE</span><h1>The content desk.</h1>{authorized?<><nav className="studio-quicklinks" aria-label="Workspace"><a href="/" target="_blank" rel="noopener noreferrer">View portfolio ↗</a><Link href="/signout-with-chatgpt?return_to=/studio" target="_top">Sign out</Link></nav><StudioMetrics/><ContentStudio/></>:<section className="studio-gate"><h2>{!setting('CMS_OWNER_EMAIL')?'Owner access is not configured yet.':'Owner sign-in required.'}</h2><p>This workspace is restricted to the configured site owner. Public visitors cannot read submissions or edit content.</p>{!user&&<a className="button primary" href={chatGPTSignInPath('/studio')} target="_top">Sign in with ChatGPT</a>}</section>}</main>;}
