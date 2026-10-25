import fs from 'node:fs';
fs.writeFileSync('web/document.ts','export const HTML = '+JSON.stringify(fs.readFileSync('web/index.html','utf8'))+';\n');
