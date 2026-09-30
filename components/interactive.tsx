'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { email } from '@/lib/content';

export function CopyEmail(){const [status,setStatus]=useState('');async function copy(){try{await navigator.clipboard.writeText(email);setStatus('Copied');}catch{setStatus('Use the email link');}window.setTimeout(()=>setStatus(''),3000);}return <button className="copy-email" onClick={copy} aria-label="Copy email address">{status?<Check size={16}/>:<Copy size={16}/>}<span aria-live="polite">{status||'Copy'}</span></button>;}
