import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('web/index.html','utf8');
const source=html.slice(html.indexOf('function buildFamilyScene('),html.indexOf('let treeScene=null'));
const build=new Function(source+';return buildFamilyScene')();
const p=(id,parents=[],spouses=[])=>({id,name:'Synthetic '+id,parents,spouses});
function verify(people){const s=build(people),{w,h}=s.card;assert.equal(Object.keys(s.positions).length,people.length);const cards=Object.entries(s.positions);for(const [id,a]of cards){assert.ok(Number.isFinite(a.x)&&Number.isFinite(a.y),id);for(const [other,b]of cards){if(id!==other)assert.ok(a.x+w<=b.x||b.x+w<=a.x||a.y+h<=b.y||b.y+h<=a.y,'Cards overlap: '+id+' '+other)}}for(const line of s.paths){for(let i=1;i<line.points.length;i++){const a=line.points[i-1],b=line.points[i];assert.ok(a.x===b.x||a.y===b.y,'Non-orthogonal connector');for(const[id,r]of cards){const hit=a.x===b.x?a.x>r.x+.1&&a.x<r.x+w-.1&&Math.max(a.y,b.y)>r.y+.1&&Math.min(a.y,b.y)<r.y+h-.1:a.y>r.y+.1&&a.y<r.y+h-.1&&Math.max(a.x,b.x)>r.x+.1&&Math.min(a.x,b.x)<r.x+w-.1;assert.equal(hit,false,'Connector crosses '+id)}}}return s}
test('couples stay adjacent and shared siblings use one family junction',()=>{const people=[p('a',[],['b']),p('b',[],['a']),p('c',['a','b'],['d']),p('d',[],['c']),p('e',['a','b']),p('f',['c','d'])];const s=verify(people);assert.equal(s.positions.a.y,s.positions.b.y);assert.equal(Math.abs(s.positions.a.x-s.positions.b.x),s.card.w+32);assert.ok(s.positions.c.y>s.positions.a.y);assert.ok(s.positions.f.y>s.positions.c.y);assert.equal(s.paths.filter(l=>l.kind==='partner').length,2)});
test('single parents, disconnected families and long names do not collide',()=>{verify([p('one'),p('two',['one']),p('three',['one']),p('unrelated'),p('last',['two'])])});
test('both partners ancestry and skipped generations route around cards',()=>{verify([p('a'),p('b'),p('c',['a'],['d']),p('d',['b'],['c']),p('e',['c','d']),p('f',['e']),p('g',['a','f'])])});
test('large synthetic seven-generation tree has no card or connector collisions',()=>{const people=[p('root')];let parent='root';for(let row=1;row<7;row++){for(let i=0;i<7;i++)people.push(p('r'+row+'p'+i,[parent]));parent='r'+row+'p0'}verify(people)});
