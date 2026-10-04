const acorn = require('acorn');
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '..', 'dist', 'app.js');
const source = fs.readFileSync(bundlePath, 'utf8');

acorn.parse(source, {
  allowHashBang: true,
  ecmaVersion: 5,
  sourceType: 'script',
});

process.stdout.write(`ES5 syntax check passed: ${path.relative(process.cwd(), bundlePath)}\n`);
