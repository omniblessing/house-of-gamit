// House of Gamit shared API. Paste this entire file into Cloudflare Edit code.
// Binding: DB (D1). Secret: OWNER_PASSWORD (20+ characters). No R2 required.
function validateArchive(input){
 if(!input||typeof input!=='object'||typeof input.title!=='string'||!input.title.trim()||input.title.length>80||!Array.isArray(input.people)||input.people.length>2000)throw Error('Choose a valid family backup with a house name and at most 2,000 people.');
 const text=(v,max,label)=>{if(v==null)return '';if(typeof v!=='string'||v.length>max)throw Error('Invalid '+label+' in backup.');return v};
 const validDate=v=>!v||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v);
 const people=input.people.map(p=>{if(!p||typeof p!=='object'||typeof p.id!=='string'||!p.id||p.id.length>100||typeof p.name!=='string'||!p.name.trim()||p.name.length>100)throw Error('Every person needs a unique ID and a name.');
 const q={id:p.id,name:p.name.trim(),house:text(p.house,80,'house'),gender:text(p.gender,30,'gender')||'Unspecified',status:p.status,born:text(p.born,10,'birth date'),died:text(p.died,10,'death date'),occupation:text(p.occupation,120,'occupation'),place:text(p.place,120,'place'),bio:text(p.bio,3000,'story'),photo:text(p.photo,2000000,'portrait'),parents:p.parents??[],spouses:p.spouses??[]};
 if(!['living','deceased'].includes(q.status)||!validDate(q.born)||!validDate(q.died)||(q.died&&q.status==='living')||(q.born&&q.died&&q.died<q.born))throw Error('Check life status and dates for '+q.name+'.');
 for(const [key,max] of [['parents',2],['spouses',1]])if(!Array.isArray(q[key])||q[key].length>max||q[key].some(id=>typeof id!=='string'||id===q.id)||new Set(q[key]).size!==q[key].length)throw Error('Invalid family connections for '+q.name+'.');
 if(q.photo&&!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(q.photo)&&!/^\/api\/portraits\/[A-Za-z0-9._-]+$/.test(q.photo))throw Error('Use a backup with embedded JPG, PNG, or WebP portraits.');
 return q});
 const byId=new Map(people.map(p=>[p.id,p]));if(byId.size!==people.length)throw Error('Duplicate person IDs in backup.');
 const done=new Set(),visiting=new Set();function visit(p){if(visiting.has(p.id))throw Error('Family connections contain an ancestor loop.');if(done.has(p.id))return;visiting.add(p.id);p.parents.forEach(id=>{if(!byId.has(id))throw Error('A parent is missing from this backup.');visit(byId.get(id))});visiting.delete(p.id);done.add(p.id)}
 people.forEach(p=>{visit(p);p.spouses.forEach(id=>{const partner=byId.get(id);if(!partner||!partner.spouses.includes(p.id)||p.parents.includes(id)||partner.parents.includes(p.id))throw Error('Check partner connections for '+p.name+'.')})});
 return {title:input.title.trim(),motto:text(input.motto,180,'motto'),demo:input.demo===true,people};
}

const SITE_ORIGIN='https://omniblessing.github.io';
const SERVICE='house-of-gamit-v1';
const encode=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
const hash=async s=>hex(await crypto.subtle.digest('SHA-256',typeof s==='string'?encode.encode(s):s));
async function signingKey(env){return crypto.subtle.importKey('raw',encode.encode(env.OWNER_PASSWORD),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
async function issueToken(env){const expires=String(Math.floor(Date.now()/1000)+12*3600);return expires+'.'+hex(await crypto.subtle.sign('HMAC',await signingKey(env),encode.encode(SERVICE+':editor:'+expires)))}
async function editor(request,env){const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';const [expires,signature]=token.split('.');if(!/^\d{10}$/.test(expires||'')||!/^([a-f0-9]{64})$/.test(signature||'')||Number(expires)<=Date.now()/1000||Number(expires)>Date.now()/1000+13*3600||!env.OWNER_PASSWORD)return false;return crypto.subtle.verify('HMAC',await signingKey(env),Uint8Array.from(signature.match(/../g),v=>parseInt(v,16)),encode.encode(SERVICE+':editor:'+expires))}
async function schema(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS shared_archive (id INTEGER PRIMARY KEY CHECK (id = 1), document TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS shared_portraits (key TEXT PRIMARY KEY, content_type TEXT NOT NULL, body BLOB NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS shared_login_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL)')
])}
async function readJSON(request,max=12000000){if(Number(request.headers.get('Content-Length')||0)>max)throw Error('Request is too large.');if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw Error('Send a JSON request.');const body=await request.text();if(encode.encode(body).length>max)throw Error('Request is too large.');return JSON.parse(body)}
async function serve(request,env){
 const origin=request.headers.get('Origin');const url=new URL(request.url);
 const headers={'Access-Control-Allow-Origin':SITE_ORIGIN,'Access-Control-Allow-Methods':'GET, PUT, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
 const json=(body,status=200)=>Response.json({service:SERVICE,...body},{status,headers});
 if(origin&&origin!==SITE_ORIGIN)return json({error:'This origin is not allowed.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(request.method!=='GET'&&origin!==SITE_ORIGIN)return json({error:'Use the House of Gamit website to edit.'},403);
 if(url.pathname==='/'||url.pathname==='/api/health')return json({ok:true,databaseBound:!!env.DB,ownerPasswordConfigured:typeof env.OWNER_PASSWORD==='string'&&env.OWNER_PASSWORD.length>=20});
 if(!env.DB)return json({error:'Bind the house-of-gamit-db database as DB in Cloudflare.'},503);
 try{
 await schema(env.DB);
 if(url.pathname==='/api/login'&&request.method==='POST'){
  if(typeof env.OWNER_PASSWORD!=='string'||env.OWNER_PASSWORD.length<20)return json({error:'The owner must configure OWNER_PASSWORD as a Cloudflare secret with at least 20 characters.'},503);
  const body=await readJSON(request,4096);if(typeof body.password!=='string'||body.password.length>512)return json({error:'Enter the owner password.'},400);
  const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/900),ip=request.headers.get('CF-Connecting-IP')||'unknown';const key=await hash(env.OWNER_PASSWORD+':'+ip+':'+bucket);
  await env.DB.prepare('DELETE FROM shared_login_attempts WHERE expires < ?').bind(now).run();
  const attempt=await env.DB.prepare('INSERT INTO shared_login_attempts (key, attempts, expires) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(key,(bucket+1)*900).first();
  if(attempt.attempts>8)return json({error:'Too many sign-in attempts. Wait 15 minutes and try again.'},429);
  // Compare fixed-length digests without stopping at the first different character.
  const actual=await hash(body.password),expected=await hash(env.OWNER_PASSWORD);let different=0;for(let i=0;i<actual.length;i++)different|=actual.charCodeAt(i)^expected.charCodeAt(i);
  if(different)return json({error:'That password is incorrect.'},401);
  return json({token:await issueToken(env),expiresIn:12*3600});
 }
 if(url.pathname==='/api/family'&&request.method==='GET'){
  const row=await env.DB.prepare('SELECT document, revision, updated_at FROM shared_archive WHERE id = 1').first();
  return json({data:row?JSON.parse(row.document):null,revision:row?.revision||0,updatedAt:row?.updated_at||null,canEdit:await editor(request,env)});
 }
 if(url.pathname==='/api/family'&&request.method==='PUT'){
  if(!await editor(request,env))return json({error:'Sign in as owner to save. Your browser draft is still available.'},401);
  let body,data;try{body=await readJSON(request);data=validateArchive(body.data)}catch(e){return json({error:e.message||'Invalid family archive.'},400)}
  const current=await env.DB.prepare('SELECT revision FROM shared_archive WHERE id = 1').first();
  if(!Number.isInteger(body.revision)||body.revision<0||body.revision!==(current?.revision||0))return json({error:'Another device saved first. Download your draft, reload, and reapply your change.'},409);
  for(const p of data.people){
   if(p.photo.startsWith('data:')){
    const [prefix,b64]=p.photo.split(','),bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const type=prefix.slice(5,prefix.indexOf(';'));
    const valid=(type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216)||(type==='image/png'&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)||(type==='image/webp'&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP');
    if(!valid||bytes.length>1400000)return json({error:'Invalid or oversized portrait. Upload a compressed JPG, PNG, or WebP.'},400);
    const key=await hash(bytes);await env.DB.prepare('INSERT OR IGNORE INTO shared_portraits (key, content_type, body) VALUES (?, ?, ?)').bind(key,type,bytes.buffer).run();p.photo='/api/portraits/'+key;
   }else if(p.photo){const key=p.photo.slice('/api/portraits/'.length);if(!/^[a-f0-9]{64}$/.test(key)||!await env.DB.prepare('SELECT key FROM shared_portraits WHERE key = ?').bind(key).first())return json({error:'A portrait is missing. Import a backup with embedded photos.'},400)}
  }
  const document=JSON.stringify(data),revision=body.revision+1,stamp=new Date().toISOString();
  if(encode.encode(document).length>1800000)return json({error:'Family text is too large. Download a backup and shorten some biographies.'},413);
  const result=current?await env.DB.prepare('UPDATE shared_archive SET document = ?, revision = ?, updated_at = ? WHERE id = 1 AND revision = ?').bind(document,revision,stamp,body.revision).run():await env.DB.prepare('INSERT OR IGNORE INTO shared_archive (id, document, revision, updated_at) VALUES (1, ?, ?, ?)').bind(document,revision,stamp).run();
  if(result.meta.changes!==1)return json({error:'Another device saved first. Download your draft and reload.'},409);
  return json({data,revision,updatedAt:stamp,canEdit:true});
 }
 if(/^\/api\/portraits\/[a-f0-9]{64}$/.test(url.pathname)&&request.method==='GET'){
  const row=await env.DB.prepare('SELECT body, content_type FROM shared_portraits WHERE key = ?').bind(url.pathname.split('/').at(-1)).first();
  if(!row)return json({error:'Portrait not found.'},404);
  return new Response(new Uint8Array(row.body),{headers:{...headers,'Content-Type':row.content_type,'Cache-Control':'public, max-age=86400'}});
 }
 return json({error:'Not found.'},404);
 }catch{return json({error:'Shared storage is unavailable. Download your browser draft and retry later.'},503)}
}
export default {fetch:serve};
