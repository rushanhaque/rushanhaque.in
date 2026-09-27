import { getDatabase } from '@/lib/database';
import { submissionSchema } from '@/lib/submission-schema';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function boundedJson(request:Request){const reader=request.body?.getReader();if(!reader)throw new Error('empty');const decoder=new TextDecoder();let size=0;let body='';try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){await reader.cancel();throw new Error('large');}body+=decoder.decode(value,{stream:true});}body+=decoder.decode();return JSON.parse(body);}finally{reader.releaseLock();}}
export async function POST(request:Request){
  const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return json({error:'Please submit this form from the website.'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Unsupported request format.'},415);
  let body:unknown;try{body=await boundedJson(request);}catch{return json({error:'The request could not be read. Please shorten your message and try again.'},400);}
  const parsed=submissionSchema.safeParse(body);if(!parsed.success)return json({error:parsed.error.issues[0].message},422);
  const data=parsed.data;
  if(data.kind==='call'){
    const requested=new Date(`${data.date}T${data.time}:00+05:30`).getTime();const datePart=new Date(`${data.date}T00:00:00Z`);
    if(!Number.isFinite(requested)||datePart.toISOString().slice(0,10)!==data.date||requested<Date.now()+3600000||requested>Date.now()+180*86400000)return json({error:'Choose a valid future time within the next six months.'},422);
  }
  try{
    const db=getDatabase();const now=Date.now();
    const existing=await db.prepare('SELECT kind, email FROM submissions WHERE id = ?').bind(data.id).first<{kind:string;email:string}>();
    if(existing){if(existing.email!==data.email||existing.kind!==data.kind)return json({error:'Please refresh the form and try again.'},409);return json({ok:true,id:data.id});}
    const client=request.headers.get('cf-connecting-ip')||'local';
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${client}:${Math.floor(now/3600000)}`));
    const key=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
    const limit=await db.prepare('INSERT INTO submission_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count').bind(key,now+3600000).first<{count:number}>();
    if((limit?.count||0)>8)return json({error:'A few too many requests. Please try again in an hour, or contact me by email.'},429);
    const {id,kind,name,email:address,website:_website,...payload}=data;
    await db.batch([
      db.prepare('INSERT INTO submissions (id, kind, name, email, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(id,kind,name,address,JSON.stringify(payload),'pending',now),
      db.prepare('DELETE FROM submission_limits WHERE expires_at < ?').bind(now),
    ]);
    return json({ok:true,id},201);
  }catch(error){console.error(JSON.stringify({event:'submission_failed',type:error instanceof Error?error.name:'unknown'}));return json({error:'Your request could not be saved right now. Your details are still here—please try again, or email me directly.'},503);}
}
