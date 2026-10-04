const fs = require('fs');
const path = require('path');

const siteDirectory = path.resolve(__dirname, '../demo_react16/build');
const checkedExtensions = new Set(['.html', '.css', '.js']);
const forbiddenRuntimeHosts = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'raw.githubusercontent.com',
  'stackblitz.com',
  'codesandbox.io',
  'esm.sh',
];

function collectFiles(directory, result = []) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(filePath, result);
    else if (checkedExtensions.has(path.extname(entry.name))) result.push(filePath);
  });
  return result;
}

if (!fs.existsSync(path.join(siteDirectory, 'index.html'))) {
  throw new Error('demo_react16/build/index.html is missing; build the site before verification.');
}

const violations = [];
collectFiles(siteDirectory).forEach(filePath => {
  const source = fs.readFileSync(filePath, 'utf8');
  forbiddenRuntimeHosts.forEach(host => {
    if (source.indexOf(host) >= 0) {
      violations.push(`${path.relative(siteDirectory, filePath)} -> ${host}`);
    }
  });
});

if (violations.length) {
  throw new Error(`The demo site contains forbidden runtime hosts:\n${violations.join('\n')}`);
}

console.log(`Verified ${collectFiles(siteDirectory).length} static site files: no forbidden runtime hosts.`);
