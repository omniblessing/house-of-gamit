import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { validateFamily } from '../../../lib/family-validation';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function current(){return env.DB!.prepare('SELECT * FROM family_archive WHERE id = 1').first<{document:string;revision:number;owner_id:string;updated_at:string}>();}
export async function GET(){
  try {const user=await getChatGPTUser(); if(!user)return json({error:'Sign in to view this family tree.'},401);
    const row=await current(); const canEdit=row?row.owner_id===user.userId:user.email.toLowerCase()===(env.FAMILY_OWNER_EMAIL||'').toLowerCase();
    return json({data:row?JSON.parse(row.document):null,revision:row?.revision||0,updatedAt:row?.updated_at||null,canEdit});
  } catch {return json({error:'Family storage is unavailable. Your browser backup has not been removed.'},503);}
}
export async function PUT(request:Request){
  try {
    const user=await getChatGPTUser();if(!user)return json({error:'Sign in to save.'},401);
    if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'This save must come from the family website.'},403);
    const row=await current(); const allowed=row?row.owner_id===user.userId:user.email.toLowerCase()===(env.FAMILY_OWNER_EMAIL||'').toLowerCase();
    if(!allowed)return json({error:'Only the family owner can edit this tree.'},403);
    if(Number(request.headers.get('content-length')||0)>12000000)return json({error:'Archive too large.'},413);
    const raw=await request.text();if(raw.length>12000000)return json({error:'Archive too large.'},413);
    let body:any, data:any;try{body=JSON.parse(raw);data=validateFamily(body.data);}catch(e){return json({error:e instanceof Error?e.message:'Invalid archive.'},400);}
    if(!Number.isInteger(body.revision)||body.revision!==(row?.revision||0))return json({error:'The tree changed on another device. Export your changes, then reload before editing.'},409);
    for(const p of data.people){if(p.photo?.startsWith('data:')){
      const [prefix,b64]=p.photo.split(',');const bytes=Uint8Array.from(atob(b64),(c:string)=>c.charCodeAt(0));
      const magic=(bytes[0]===0xff&&bytes[1]===0xd8&&prefix.includes('jpeg'))||(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47&&prefix.includes('png'))||(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'&&prefix.includes('webp'));
      if(!magic)return json({error:'Portrait file format is invalid.'},400);
      const digest=await crypto.subtle.digest('SHA-256',bytes);const key=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
      await env.BUCKET!.put('portraits/'+key,bytes,{httpMetadata:{contentType:prefix.slice(5,prefix.indexOf(';'))}});p.photo='/api/portraits/'+key;
    }}
    const stamp=new Date().toISOString();const revision=(row?.revision||0)+1;const doc=JSON.stringify(data);if(new TextEncoder().encode(doc).length>1800000)return json({error:'Family biography text exceeds the storage limit. Export a backup and shorten some biographies.'},413);
    const result=row?await env.DB!.prepare('UPDATE family_archive SET document = ?, revision = ?, updated_at = ? WHERE id = 1 AND revision = ?').bind(doc,revision,stamp,body.revision).run():await env.DB!.prepare('INSERT OR IGNORE INTO family_archive (id, document, revision, owner_id, updated_at) VALUES (1, ?, ?, ?, ?)').bind(doc,revision,user.userId,stamp).run();
    if(result.meta.changes!==1)return json({error:'Another device saved first. Export your changes and reload.'},409);
    return json({data,revision,updatedAt:stamp});
  }catch {return json({error:'Could not save to the server. Export your changes as a backup and retry.'},503);}
}
