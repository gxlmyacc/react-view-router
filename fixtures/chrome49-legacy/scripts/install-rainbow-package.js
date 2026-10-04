const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const fixtureRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(fixtureRoot, '..', '..');
const packageDirectory = fs.mkdtempSync(path.join(fixtureRoot, '.tmp-react-viewpackage-'));
const stagingDirectory = path.join(packageDirectory, 'package');
const npmCli = process.env.npm_execpath;

function runNpm(args, cwd, captureOutput) {
  const result = spawnSync(process.execPath, [npmCli].concat(args), {
    cwd,
    encoding: 'utf8',
    env: Object.assign({}, process.env, { npm_config_scripts_prepend_node_path: 'true' }),
    stdio: captureOutput ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });
  if (result.status !== 0) {
    if (result.stdout) process.stderr.write(result.stdout);
    process.exit(result.status || 1);
  }
  return result.stdout || '';
}

function copyEntry(source, target) {
  const stat = fs.statSync(source);
  if (!stat.isDirectory()) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    return;
  }
  fs.mkdirSync(target, { recursive: true });
  fs.readdirSync(source).forEach((entry) => {
    copyEntry(path.join(source, entry), path.join(target, entry));
  });
}

function stagePublishedPackage() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'package.json')));
  const entries = packageJson.files.concat(['README.md', 'LICENSE']);
  fs.mkdirSync(stagingDirectory);
  entries.forEach((entry) => {
    const source = path.join(workspaceRoot, entry);
    if (fs.existsSync(source)) copyEntry(source, path.join(stagingDirectory, entry));
  });
  if (packageJson.scripts) delete packageJson.scripts.prepare;
  fs.writeFileSync(
    path.join(stagingDirectory, 'package.json'),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
}

try {
  stagePublishedPackage();
  runNpm(['pack', '--pack-destination', packageDirectory, '--ignore-scripts'], stagingDirectory, true);
  const filename = fs.readdirSync(packageDirectory).find((entry) => /\.tgz$/.test(entry));
  if (!filename) throw new Error('npm pack did not create a ReactViewRouter tarball');
  const tarball = path.join(packageDirectory, filename);
  const tarballArgument = `./${path.relative(fixtureRoot, tarball).replace(/\\/g, '/')}`;
  runNpm([
    'install', tarballArgument, '--no-save', '--ignore-scripts', '--no-audit', '--no-fund',
  ], fixtureRoot, false);
} finally {
  fs.rmSync(packageDirectory, { force: true, recursive: true });
}
