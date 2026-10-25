import fs from 'node:fs';
let html=fs.readFileSync('web/index.html','utf8');
// Pages has no backend. Keep this adapter isolated from the full-stack app.
const adapter=`
const pagesStorageKey='house-of-gamit-pages-v1';
let pagesArchive;try{pagesArchive=JSON.parse(localStorage.getItem(pagesStorageKey))}catch{}
window.fetch=async function(url,options={}){
 if(url!=='/api/family')throw new Error('This photo belongs to another host. Import a backup with embedded portraits.');
 if(options.method==='PUT'){
  const body=JSON.parse(options.body);
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
html=html.replace("const $=s=>",adapter+'\nconst $=s=>');
html=html.replaceAll('Saved online','Saved on this device').replaceAll('Updated online','Updated on this device').replaceAll('Updated online','Updated on this device').replaceAll('Your changes are not saved online.','Your changes are not saved on this device.').replaceAll('online tree','tree on this device').replaceAll('online storage','browser storage').replaceAll('saved online','saved on this device').replaceAll('online.','on this device.').replaceAll('Family storage is not connected yet.','Browser storage is still loading.').replaceAll('Private family archive','Personal family archive').replaceAll('Private archive','Browser archive').replaceAll('Sign in with ChatGPT','Reload this page').replaceAll('href="/signin-with-chatgpt?return_to=%2F"','href="./"');
html=html.replace('Wait for Saved on this device before closing. Only the owner can edit; admitted family viewers can explore.','This GitHub Pages edition saves only in this browser. Clearing browser data can remove the tree. Other devices do not receive these edits.');
html=html.replace('<section class="intro"','<div class="notice" role="note"><strong>GitHub Pages edition</strong><span>Family details stay in this browser only. Download backups regularly. Shared family storage is not connected to this edition.</span></div><section class="intro"');
html=html.replace('Your people. Your stories.<br>Preserved across generations.','Saved in this browser.<br>Download backups to keep your story safe.');
const out=process.argv[2]||'outputs/github-pages';
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/index.html',html);fs.writeFileSync(out+'/.nojekyll','');
console.log('Built GitHub Pages edition with explicit browser-local storage.');
