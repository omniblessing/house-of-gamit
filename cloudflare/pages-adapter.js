// GitHub Pages -> Cloudflare. An unavailable API at startup keeps the local edition intact.
window.FAMILY_API_BASE='https://house-of-gamit-api.thorfin662.workers.dev';
const serviceName='house-of-gamit-v1';
const localFamilyFetch=window.fetch;
const onlineFetch=globalThis.__nativeFamilyFetch;
let ownerToken='';try{ownerToken=sessionStorage.getItem('gamit-owner-session')||''}catch{}
let sharedMode=false,cloudAvailable=false;let usedShared=false;try{usedShared=localStorage.getItem('gamit-shared-connected')==='1'}catch{}window.FAMILY_SHARED_MODE=()=>sharedMode;
async function cloudRequest(path,options={}){
 const headers=new Headers(options.headers||{});if(ownerToken)headers.set('Authorization','Bearer '+ownerToken);
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{return await onlineFetch(window.FAMILY_API_BASE+path,{...options,headers,signal:controller.signal,cache:'no-store',credentials:'omit'})}finally{clearTimeout(timeout)}
}
const sharedReady=(async()=>{try{const r=await cloudRequest('/api/family');const body=await r.json();cloudAvailable=r.ok&&body.service===serviceName;sharedMode=cloudAvailable||usedShared;if(cloudAvailable){try{localStorage.setItem('gamit-shared-connected','1')}catch{}}return sharedMode}catch{sharedMode=usedShared;return sharedMode}})();
window.fetch=async function(url,options={}){
 await sharedReady;
 if(sharedMode&&!cloudAvailable)throw Error('Shared storage could not be reached. Reload to retry. Browser-only editing is disabled to protect your shared tree.');
 if(!sharedMode)return localFamilyFetch(url,options);
 if(url!=='/api/family'&&!/^\/api\/portraits\/[a-f0-9]{64}$/.test(url))throw Error('Unknown archive request.');
 const response=await cloudRequest(url,options);
 if(url==='/api/family'&&response.ok){const body=await response.clone().json();if(body.service!==serviceName)throw Error('The shared server returned an unexpected response.');if(!body.canEdit&&ownerToken&&options.method==='PUT')throw Error('Sign in as owner again to save your draft.');}
 return response;
};
function refreshStorageUI(){
 const note=document.querySelector('#storageEdition');
 if(sharedMode){
  note.textContent='Shared family archive · Everyone with the website link can view this tree. Sign in as owner to edit. Download backups regularly.';
  document.querySelector('.private-label').lastChild.textContent=' Shared family archive';
  document.querySelector('.side-bottom p').textContent='One shared tree across your devices. Keep a downloaded backup for an extra copy.';
  const help=document.querySelector('#helpDialog .dialog-body');if(help)help.innerHTML='<p><strong>Start with someone you know.</strong><br>Add a person, open their profile, then choose Add relative.</p><p><strong>Explore the tree.</strong><br>Drag to move, pinch or use the zoom controls, and choose a name to open their profile. Family members and Our chronicle offer other ways to explore.</p><p><strong>One shared family story.</strong><br>Everyone with the link can view. Only the owner can edit after signing in. Wait for Saved online before closing. Download a backup regularly.</p>';
 }else note.textContent='Browser-only edition · Cloudflare setup is not complete or could not be reached at startup. Edits stay in this browser. Download a backup before reloading to connect shared storage.';
 if(sharedMode&&!cloudAvailable)note.textContent='Shared storage is temporarily unavailable. Your shared tree has not been replaced with a browser copy. Reload to retry.';
 document.querySelector('#ownerAccess').disabled=!cloudAvailable;
 document.querySelector('#ownerAccess').textContent=sharedMode?(ownerToken?'Owner sign-out':'Owner sign-in'):'Cloud setup pending';
}
document.addEventListener('DOMContentLoaded',async()=>{
 const button=document.createElement('button');button.id='ownerAccess';button.className='btn';button.textContent='Connecting…';button.disabled=true;document.querySelector('.top-actions').prepend(button);
 await sharedReady;refreshStorageUI();
 button.onclick=async()=>{
  if(ownerToken){if(saving||unsaved||blocked){toast('Save or download your draft before signing out.');return}ownerToken='';try{sessionStorage.removeItem('gamit-owner-session')}catch{}canEdit=false;updateControls();refreshStorageUI();toast('Signed out. You can still view the family tree.');return}
  document.querySelector('#ownerError').textContent='';document.querySelector('#ownerDialog').showModal();document.querySelector('#ownerForm').elements.password.focus();
 };
 document.querySelector('#ownerForm').onsubmit=async e=>{
  e.preventDefault();const form=e.target,submit=document.querySelector('#ownerSubmit');submit.disabled=true;document.querySelector('#ownerError').textContent='';
  try{const r=await cloudRequest('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:form.elements.password.value})});const body=await r.json();if(!r.ok||typeof body.token!=='string')throw Error(body.error||'Could not sign in.');ownerToken=body.token;try{sessionStorage.setItem('gamit-owner-session',ownerToken)}catch{}form.reset();document.querySelector('#ownerDialog').close();await loadFamily();refreshStorageUI();toast('Owner editing is enabled in this tab for 12 hours.')}catch(err){document.querySelector('#ownerError').textContent=err.message||'Could not sign in. Try again.'}finally{form.elements.password.value='';submit.disabled=false}
 };
});
