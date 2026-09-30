import { cookies } from 'next/headers';
import { verifySession, sessionCookie } from '@/lib/session';
import { noStoreHeaders } from '@/lib/cache-policy';
export function setting(name:string):string{return process.env[name]||'';}
export async function isOwner(){return verifySession((await cookies()).get(sessionCookie)?.value);}
export const privateJson=(value:unknown,status=200)=>Response.json(value,{status,headers:{...noStoreHeaders,'X-Robots-Tag':'noindex'}});
export async function readBoundedJson(request:Request,max=200000){if(request.headers.get('origin')!==new URL(request.url).origin)throw Error('Invalid origin.');if(!request.headers.get('content-type')?.includes('application/json'))throw Error('JSON is required.');const reader=request.body?.getReader();if(!reader)throw Error('Empty request.');let size=0,body='';const decoder=new TextDecoder();try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Error('Request too large.');}body+=decoder.decode(value,{stream:true});}return JSON.parse(body+decoder.decode());}finally{reader.releaseLock();}}
