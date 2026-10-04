const fs = require('fs');
const path = require('path');

for (const file of [
  '../drawer/es/index.js',
  '../drawer/esm/index.js',
]) {
  const target = path.resolve(__dirname, file);
  const source = fs.readFileSync(target, 'utf8');
  const normalized = source.replace(/(['"])\.\/index\.scss\1/g, '$1./index.css$1');
  if (normalized === source) throw new Error(`SCSS import not found in ${target}`);
  fs.writeFileSync(target, normalized);
}

const typesFile = path.resolve(__dirname, '../drawer/types/index.d.ts');
const typesSource = fs.readFileSync(typesFile, 'utf8');
const typesNormalized = typesSource.replace(/^import ['"]\.\/index\.scss['"];?\r?\n/m, '');
if (typesNormalized === typesSource) throw new Error(`SCSS import not found in ${typesFile}`);
fs.writeFileSync(typesFile, typesNormalized);
