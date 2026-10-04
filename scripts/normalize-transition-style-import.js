const fs = require('fs');
const path = require('path');

for (const format of ['es', 'esm']) {
  const file = path.resolve(__dirname, `../transition/${format}/RouterView.js`);
  const source = fs.readFileSync(file, 'utf8');
  const normalized = source.replace(/(['"])\.\/RouterView\.scss\1/g, '$1./router-view.css$1');
  if (normalized === source) throw new Error(`SCSS import not found in ${file}`);
  fs.writeFileSync(file, normalized);
}
