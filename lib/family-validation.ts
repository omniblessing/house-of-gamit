export function validateFamily(input: any) {
  if (!input || typeof input.title !== 'string' || !input.title.trim() || input.title.length > 80 || typeof input.motto !== 'string' || input.motto.length > 180 || !Array.isArray(input.people) || input.people.length > 1000) throw new Error('Invalid family archive. Maximum 1,000 people.');
  const ids = new Set<string>();
  for (const p of input.people) {
    if (!p || typeof p.id !== 'string' || !/^[\w-]{1,100}$/.test(p.id) || ids.has(p.id)) throw new Error('Invalid or duplicate person ID.');
    ids.add(p.id);
    if (typeof p.name !== 'string' || !p.name.trim() || p.name.length > 100 || !['living','deceased'].includes(p.status)) throw new Error('Each person needs a name and valid life status.');
    for (const [key, limit] of Object.entries({house:80,gender:30,occupation:120,place:120,bio:3000,born:10,died:10})) if (p[key] !== undefined && (typeof p[key] !== 'string' || p[key].length > limit)) throw new Error('Invalid profile field: '+key);
    for (const date of [p.born,p.died]) if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date)) throw new Error('Invalid date.');
    if (p.died && (p.status === 'living' || (p.born && p.died < p.born))) throw new Error('Inconsistent birth/death dates.');
    if (!Array.isArray(p.parents) || p.parents.length > 2 || !Array.isArray(p.spouses) || p.spouses.length > 1) throw new Error('Invalid relationships. This version supports two parents and one partner.');
    if (new Set(p.parents).size!==p.parents.length || new Set(p.spouses).size!==p.spouses.length) throw new Error('Duplicate relationship.');
    if (p.photo && (typeof p.photo!=='string' || p.photo.length>600000 || !/^(data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+|\/api\/portraits\/[a-f0-9]{64})$/.test(p.photo))) throw new Error('Invalid portrait. Use a JPG, PNG, or WebP photo.');
  }
  const byId = new Map<string,any>(input.people.map((p:any)=>[p.id,p]));
  for (const p of input.people) {
    if ([...p.parents,...p.spouses].some(id=>!ids.has(id)||id===p.id) || p.parents.some((id:string)=>p.spouses.includes(id))) throw new Error('Invalid relationship target.');
    if (p.spouses.some((id:string)=>!byId.get(id).spouses.includes(p.id))) throw new Error('Partner relationships must be reciprocal.');
  }
  function visit(id:string, path=new Set<string>()):boolean {if(path.has(id))return true;path.add(id);return byId.get(id).parents.some((p:string)=>visit(p,new Set(path)));}
  if (input.people.some((p:any)=>visit(p.id))) throw new Error('A person cannot be their own ancestor.');
  return {title:input.title.trim(),motto:input.motto,demo:!!input.demo,people:input.people.map((p:any)=>Object.fromEntries(['id','name','house','gender','status','born','died','occupation','place','bio','parents','spouses','photo'].filter(k=>p[k]!==undefined).map(k=>[k,p[k]])))};
}
