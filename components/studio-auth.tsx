'use client';
import { useState, type FormEvent } from 'react';
export function StudioSignIn() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const password = new FormData(event.currentTarget).get('password');
    try {
      const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }), cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      location.assign('/studio');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Sign-in failed.'); setBusy(false); }
  }
  return <form onSubmit={submit}><label>Admin access key<input name="password" type="password" autoComplete="current-password" required maxLength={512}/></label><button className="button primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button><p role="status">{message}</p></form>;
}
export function StudioSignOut() {
  const [error, setError] = useState('');
  return <><button className="text-link" onClick={async () => { try { const response = await fetch('/api/admin/session', { method: 'DELETE' }); if (!response.ok) throw Error(); location.assign('/studio'); } catch { setError('Sign-out failed. Try again.'); } }}>Sign out</button><span role="status">{error}</span></>;
}
