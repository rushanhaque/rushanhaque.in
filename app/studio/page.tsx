import { isOwner, setting } from '@/lib/admin';
import '../studio.css';
import { StudioMetrics } from '@/components/studio-metrics';
import { ContentStudio } from '@/components/content-studio';
import { StudioSignIn, StudioSignOut } from '@/components/studio-auth';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Private content studio', robots: { index: false, follow: false } };
export default async function Studio() {
  const authorized = await isOwner();
  return <main id="main-content" className="container studio-page"><span className="eyebrow">RUSHAN HAQUE / PRIVATE WORKSPACE</span><h1>The content desk.</h1>{authorized ? <><nav className="studio-quicklinks" aria-label="Workspace"><a href="/" target="_blank" rel="noopener noreferrer">View portfolio</a><StudioSignOut/></nav><StudioMetrics/><ContentStudio/></> : <section className="studio-gate"><h2>{setting('ADMIN_PUBLISH_SECRET').length >= 16 ? 'Owner sign-in required.' : 'Owner access is not configured yet.'}</h2><p>This workspace is restricted to the site owner. Sign in with your existing admin access key.</p><StudioSignIn/></section>}</main>;
}
