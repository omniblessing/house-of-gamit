import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('web/index.html','utf8');
const source=html.slice(html.indexOf('function stopFamilyTrace()'),html.indexOf("familyMotion.addEventListener?.('change'"));
function fixture({reduced=false,hidden=false,view='tree'}={}){let cancelled=0;const calls=[];const paths=[{dataset:{traceDelay:'80'},getAnimations:()=>[{cancel:()=>cancelled++}],animate:(frames,options)=>calls.push({frames,options})}];const run=new Function('$$','familyMotion','document','view','selected',source+';return traceFamilyPaths')(()=>paths,{matches:reduced},{hidden},view,'synthetic-person');return {run,calls,cancelled:()=>cancelled}}
test('family trace is a bounded single reveal and cancels interrupted effects',()=>{const f=fixture();f.run();assert.equal(f.calls.length,1);assert.equal(f.cancelled(),1);assert.equal(f.calls[0].options.duration,850);assert.equal(f.calls[0].options.delay,80);assert.equal(f.calls[0].frames.at(-1).opacity,0);assert.equal(f.calls[0].options.iterations,undefined)});
test('reduced motion keeps static connections and cancels existing animation',()=>{const f=fixture({reduced:true});f.run();assert.equal(f.calls.length,0);assert.equal(f.cancelled(),1)});
test('hidden pages and directory views do not animate family paths',()=>{for(const options of [{hidden:true},{view:'members'}]){const f=fixture(options);f.run();assert.equal(f.calls.length,0)}});
