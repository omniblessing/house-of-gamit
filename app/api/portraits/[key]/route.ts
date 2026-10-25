import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../../chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{key:string}>}){
 if(!await getChatGPTUser())return new Response('Sign in required',{status:401});
 const {key}=await params;if(!/^[a-f0-9]{64}$/.test(key))return new Response('Not found',{status:404});
 const obj=await env.BUCKET!.get('portraits/'+key);if(!obj)return new Response('Not found',{status:404});
 return new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'image/jpeg','Cache-Control':'private, max-age=86400','X-Content-Type-Options':'nosniff'}});
}
