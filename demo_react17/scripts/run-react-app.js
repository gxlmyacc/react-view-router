const { spawnSync } = require('child_process');

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
const cliPath = require.resolve('react-app-rewired/bin/index.js');
const nodeArgs = [];
const childEnv = Object.assign({}, process.env);

require('../../scripts/prepare-playground-assets')(__dirname + '/..');

// CRA 4 uses Webpack 4, whose MD4 hashing is disabled by OpenSSL 3.
// Node 14 does not need or understand this flag, so only enable it on Node 17+.
if (nodeMajor >= 17) {
  nodeArgs.push('--openssl-legacy-provider');
  childEnv.NODE_OPTIONS = [
    childEnv.NODE_OPTIONS,
    '--openssl-legacy-provider',
  ].filter(Boolean).join(' ');
}

nodeArgs.push(cliPath);
nodeArgs.push.apply(nodeArgs, process.argv.slice(2));

const result = spawnSync(process.execPath, nodeArgs, {
  env: childEnv,
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exit(result.status === null ? 1 : result.status);
