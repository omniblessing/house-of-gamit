import fs from 'node:fs';
let html=fs.readFileSync('web/index.html','utf8');
// Pages has no backend. Keep this adapter isolated from the full-stack app.
const adapter=`
globalThis.__nativeFamilyFetch=window.fetch.bind(window);
const pagesStorageKey='house-of-gamit-pages-v1';
let pagesArchive;try{pagesArchive=JSON.parse(localStorage.getItem(pagesStorageKey))}catch{}
window.fetch=async function(url,options={}){
 if(url!=='/api/family')throw new Error('This photo belongs to another host. Import a backup with embedded portraits.');
 if(options.method==='PUT'){
  const body=JSON.parse(options.body);
  try{body.data=validateArchive(body.data)}catch(e){return Response.json({error:e.message},{status:400})}
  let latest;try{latest=JSON.parse(localStorage.getItem(pagesStorageKey))}catch{}
  if(body.revision!==(latest?.revision||0))return Response.json({error:'Another tab changed this tree. Download a backup, then reload.'},{status:409});
  if(body.data.people.some(p=>p.photo&&p.photo.startsWith('/api/')))return Response.json({error:'Import a backup with embedded photos before saving on GitHub Pages.'},{status:400});
  pagesArchive={data:body.data,revision:(latest?.revision||0)+1,canEdit:true};
  try{localStorage.setItem(pagesStorageKey,JSON.stringify(pagesArchive))}catch{return Response.json({error:'Device storage is full or unavailable. Download a backup to keep your changes.'},{status:507})}
 }
 let current;try{current=JSON.parse(localStorage.getItem(pagesStorageKey))}catch{}
 return Response.json(current||{data:null,revision:0,canEdit:true});
};
`;
const sharedAdapter=fs.readFileSync('cloudflare/pages-adapter.js','utf8');
html=html.replace("const $=s=>",adapter+'\n/*__SHARED_ADAPTER__*/\nconst $=s=>');
html=html.replaceAll('Saved online','Saved on this device').replaceAll('Updated online','Updated on this device').replaceAll('Updated online','Updated on this device').replaceAll('Your changes are not saved online.','Your changes are not saved on this device.').replaceAll('online tree','tree on this device').replaceAll('online storage','browser storage').replaceAll('saved online','saved on this device').replaceAll('online.','on this device.').replaceAll('Family storage is not connected yet.','Browser storage is still loading.').replaceAll('Private family archive','Personal family archive').replaceAll('Private archive','Browser archive').replaceAll('Sign in with ChatGPT','Reload this page').replaceAll('href="/signin-with-chatgpt?return_to=%2F"','href="./"');
html=html.replace('Wait for Saved on this device before closing. Only the owner can edit; admitted family viewers can explore.','This GitHub Pages edition saves only in this browser. Clearing browser data can remove the tree. Other devices do not receive these edits.');
html=html.replace('<section class="intro"','<div class="notice" role="note" id="storageEdition"><strong>GitHub Pages edition</strong><span>Family details stay in this browser only. Download backups regularly. Shared family storage is not connected to this edition.</span></div><section class="intro"');
html=html.replaceAll('The tree was updated on another device.','The tree was updated in another tab of this browser.').replaceAll('Family owner · Editing enabled','This browser · Editing enabled').replaceAll('A previous browser-only tree is available to upload.','A previous family tree is available in this browser.').replaceAll('Upload browser tree','Restore browser tree');
html=html.replace('Your people. Your stories.<br>Preserved across generations.','Saved in this browser.<br>Download backups to keep your story safe.');
const out=process.argv[2]||'outputs/github-pages';
html=html.replace('</body>',`<dialog class="dialog" id="ownerDialog" aria-labelledby="ownerTitle"><form id="ownerForm"><div class="dialog-top"><h2 id="ownerTitle">Owner sign-in</h2><button type="button" class="icon-btn" data-close="ownerDialog" aria-label="Close owner sign-in"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button></div><div class="dialog-body"><p>Enter the owner password you set in Cloudflare. Everyone can view the shared tree; only the owner can edit.</p><label class="field">Owner password<input type="password" name="password" required autocomplete="current-password" maxlength="512"></label><p class="error-text" id="ownerError" role="alert"></p></div><div class="dialog-foot"><button type="button" class="btn" data-close="ownerDialog">Cancel</button><button class="btn primary" id="ownerSubmit">Sign in</button></div></form></dialog></body>`);
html=html.replace('/*__SHARED_ADAPTER__*/',()=>sharedAdapter);
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/index.html',html);fs.writeFileSync(out+'/.nojekyll','');
console.log('Built GitHub Pages edition with explicit browser-local storage.');
