import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');
const origin='https://omniblessing.github.io';
const password='synthetic-test-password-only-12345';
const family=()=>({title:'Synthetic Test Family',motto:'Together',demo:false,people:[{id:'a',name:'Parent',status:'living',parents:[],spouses:[]},{id:'b',name:'Child',status:'living',parents:['a'],spouses:[]}]});
test('Cloudflare shared API: real D1 persistence, access controls, photos and conflicts',async t=>{
 const mf=new Miniflare({modules:true,script:fs.readFileSync('cloudflare/worker.js','utf8'),compatibilityDate:'2026-05-15',d1Databases:['DB'],bindings:{OWNER_PASSWORD:password}});
 const request=(path,method='GET',body,token,requestOrigin=origin,ip='192.0.2.1')=>mf.dispatchFetch('https://worker.test'+path,{method,headers:{Origin:requestOrigin,'Content-Type':'application/json','CF-Connecting-IP':ip,...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 let token;
 try{
 await t.test('health reports configuration and viewers cannot write',async()=>{const health=await(await request('/api/health')).json();assert.equal(health.databaseBound,true);assert.equal(health.ownerPasswordConfigured,true);const view=await(await request('/api/family')).json();assert.equal(view.canEdit,false);assert.equal(view.data,null);assert.equal((await request('/api/family','PUT',{data:family(),revision:0})).status,401)});
 await t.test('owner login issues a signed token; foreign origins and forged tokens fail',async()=>{assert.equal((await request('/api/login','POST',{password:'wrong'})).status,401);const result=await request('/api/login','POST',{password});assert.equal(result.status,200);token=(await result.json()).token;assert.equal((await request('/api/family','PUT',{data:family(),revision:0},token,'https://other.test')).status,403);assert.equal((await request('/api/family','PUT',{data:family(),revision:0},'9999999999.'+'0'.repeat(64))).status,401)});
 await t.test('archive is shared, viewer remains read only, stale writes cannot overwrite',async()=>{const saved=await request('/api/family','PUT',{data:family(),revision:0},token);assert.equal(saved.status,200,await saved.clone().text());const view=await(await request('/api/family')).json();assert.equal(view.data.people[1].parents[0],'a');assert.equal(view.canEdit,false);assert.equal(view.revision,1);assert.equal((await request('/api/family','PUT',{data:family(),revision:0},token)).status,409);assert.equal((await(await request('/api/family','GET',undefined,token)).json()).canEdit,true)});
 await t.test('invalid imports cannot overwrite the shared archive',async()=>{for(const alter of [d=>d.people[0].born='2024-02-30',d=>d.people[0].parents=['b'],d=>d.people[0].photo='javascript:alert(1)',d=>d.people.push({...d.people[0]})]){const d=family();alter(d);assert.equal((await request('/api/family','PUT',{data:d,revision:1},token)).status,400)}assert.equal((await(await request('/api/family')).json()).revision,1)});
 await t.test('portraits live in separate binary D1 rows and download correctly',async()=>{const data=family();data.people[0].photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5nUAAAAASUVORK5CYII=';const saved=await request('/api/family','PUT',{data,revision:1},token);assert.equal(saved.status,200,await saved.clone().text());const result=await saved.json();assert.match(result.data.people[0].photo,/^\/api\/portraits\/[a-f0-9]{64}$/);const photo=await request(result.data.people[0].photo);assert.equal(photo.headers.get('Content-Type'),'image/png');assert.ok((await photo.arrayBuffer()).byteLength>0);assert.equal((await request('/api/family','PUT',{data:result.data,revision:2},token)).status,200)});
 await t.test('repeated invalid sign-in attempts are rate limited',async()=>{for(let i=0;i<8;i++)assert.equal((await request('/api/login','POST',{password:'wrong'},undefined,origin,'192.0.2.2')).status,401);assert.equal((await request('/api/login','POST',{password},undefined,origin,'192.0.2.2')).status,429)});
 }finally{await mf.dispose()}
});
