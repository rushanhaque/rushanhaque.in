import { isOwner, setting } from '@/lib/admin';
import '../studio.css';
import { ContentStudio } from '@/components/content-studio';
import { StudioSignIn, StudioSignOut } from '@/components/studio-auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function Studio() {
  const authorized = await isOwner();
  const configured = setting('ADMIN_PUBLISH_SECRET').length >= 16;
  return <main id="main-content" className="container studio-page">
    <header className="ad-head">
      <div><span className="ad-kicker">ADMIN</span><h1 suppressHydrationWarning>Content</h1></div>
      {authorized && <nav className="ad-links" aria-label="Admin"><a href="/" target="_blank" rel="noopener noreferrer">View site</a><StudioSignOut/></nav>}
    </header>
    {authorized ? <ContentStudio/> : <section className="ad-panel ad-gate">
      {configured ? <><h2 suppressHydrationWarning>Sign in</h2><p>Enter your admin password.</p><StudioSignIn/></>
        : <><h2 suppressHydrationWarning>Admin password not set</h2><p>In Vercel, open the project’s Settings → Environment Variables, add <code>ADMIN_PUBLISH_SECRET</code> with a password of at least 16 characters, and redeploy. Then sign in here with that password.</p></>}
    </section>}
  </main>;
}
