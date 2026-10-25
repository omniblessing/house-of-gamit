// Isolated browser QA only. Never used by the production app or build.
import fs from 'node:fs';
const folder=process.argv[2];if(!folder)throw Error('Supply an absolute scratch output directory.');
let html=fs.readFileSync('web/index.html','utf8');
const fixture=`const fixtureKey='house-gamit-ui-fixture-v2';let fixtureState;try{fixtureState=JSON.parse(localStorage.getItem(fixtureKey))}catch{}fixtureState=fixtureState||{data:{...structuredClone(sample),demo:false},revision:1,canEdit:true};window.fetch=async(url,opts={})=>{if(url!=='/api/family')throw Error('UI fixture only supports the family API');if(opts.method==='PUT'){const body=JSON.parse(opts.body);if(body.revision!==fixtureState.revision)return Response.json({error:'Stale fixture revision'},{status:409});fixtureState={data:body.data,revision:fixtureState.revision+1,canEdit:true};localStorage.setItem(fixtureKey,JSON.stringify(fixtureState));}return Response.json(fixtureState)};`;
html=html.replace("const $=s=>",fixture+'\nconst $=s=>');
fs.mkdirSync(folder+'/.openai',{recursive:true});fs.mkdirSync(folder+'/web',{recursive:true});fs.writeFileSync(folder+'/.openai/hosting.json',JSON.stringify({static:{directory:'web'}}));fs.writeFileSync(folder+'/web/index.html',html);
console.log('Created isolated synthetic browser fixture.');
