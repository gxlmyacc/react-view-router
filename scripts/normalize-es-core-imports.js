const fs = require('fs');
const path = require('path');
const packageName = require('../package.json').name;

// Explicit modern subentries must share the modern core rather than the default legacy core.
const directory = path.resolve(__dirname, '..', process.argv[2], 'es');
for (const name of fs.readdirSync(directory)) {
  if (!name.endsWith('.js')) continue;
  const file = path.join(directory, name);
  const source = fs.readFileSync(file, 'utf8');
  const normalized = source.replace(/from (['"])([^'"]+)\1/g, (match, quote, request) => (
    request === '../..' || request === packageName ? `from ${quote}../../es/index.js${quote}` : match
  ));
  if (normalized !== source) fs.writeFileSync(file, normalized);
}
