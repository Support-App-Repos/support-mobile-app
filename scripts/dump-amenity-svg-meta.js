const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/assets/images/svgs/amenties');
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.svg')) continue;
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  const vb = (s.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24';
  const n = (s.match(/<path/g) || []).length;
  console.log(f, '|', vb, '| paths:', n);
}
