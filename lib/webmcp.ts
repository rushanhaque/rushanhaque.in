'use client';
import { useEffect,useRef } from 'react';
type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown|Promise<unknown>};
type ModelContext={registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>};
export function useWebMCP(tool:Tool){const latest=useRef(tool);useEffect(()=>{latest.current=tool;},[tool]);useEffect(()=>{const context=(document as Document&{modelContext?:ModelContext}).modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();try{void Promise.resolve(context.registerTool({...latest.current,execute:input=>latest.current.execute(input)},{signal:lifecycle.signal})).catch(()=>{});}catch{}return()=>lifecycle.abort();},[tool.name]);}
