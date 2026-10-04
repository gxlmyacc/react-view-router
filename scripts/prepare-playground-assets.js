const fs = require('fs');
const path = require('path');
const { readMessages, collectExampleTranslations, getSourceImports } = require('./localize-example-sources');

const SOURCE_EXTENSIONS = new Set(['.css', '.js', '.jsx', '.scss', '.ts', '.tsx']);

function collectSourceFiles(directory, rootDirectory) {
  const files = [];
  fs.readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        collectSourceFiles(absolutePath, rootDirectory).forEach((file) => files.push(file));
      } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push({
          path: path.relative(rootDirectory, absolutePath).split(path.sep).join('/'),
          content: fs.readFileSync(absolutePath, 'utf8'),
        });
      }
    });
  return files;
}

/**
 * Collect the real shared runtime dependencies of an example, preserving relative import paths.
 * @param {string} directory Example directory.
 * @param {{path: string, content: string}[]} files Example files.
 * @returns {{path: string, content: string}[]} Shared dependencies.
 */
function collectExampleDependencies(directory, files) {
  const root = path.resolve(__dirname, '../demo_react_shared/src');
  const known = new Set(files.map((file) => path.resolve(directory, file.path)));
  const dependencies = [];
  const scan = (absolutePath, content) => {
    if (!/\.[jt]sx?$/.test(absolutePath)) return;
    getSourceImports(content).forEach((request) => {
      const base = path.resolve(path.dirname(absolutePath), request.split('?')[0]);
      const target = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']
        .map((extension) => path.resolve(base + extension)).find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (!target) throw new Error(`Missing example dependency: ${request} from ${absolutePath}`);
      const relative = path.relative(root, target);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Example dependency outside source root: ${target}`);
      if (known.has(target)) return;
      known.add(target);
      const source = fs.readFileSync(target, 'utf8');
      dependencies.push({ path: relative.split(path.sep).join('/'), content: source });
      scan(target, source);
    });
  };
  files.forEach((file) => scan(path.resolve(directory, file.path), file.content));
  return dependencies;
}

function collectExampleSources(examplesDirectory) {
  const manifest = {};
  const messages = readMessages(path.resolve(__dirname, '../demo_react_shared/src/workspace/i18n.ts'));
  fs.readdirSync(examplesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((entry) => {
      const directory = path.join(examplesDirectory, entry.name);
      const files = collectSourceFiles(directory, directory);
      if (!files.length) return;
      const preferredEntry = ['App.tsx', 'App.jsx', 'index.tsx', 'index.jsx']
        .find((candidate) => files.some((file) => file.path === candidate));
      manifest[`demo_react_shared/src/examples/${entry.name}`] = {
        entry: preferredEntry || files[0].path,
        files: collectExampleTranslations(files, messages),
        dependencies: collectExampleDependencies(directory, files),
      };
    });
  return manifest;
}

function collectReferenceDocuments(rootDirectory) {
  const documents = {};
  const visited = new Set();
  const seeds = ['docs/api.md', 'docs/api_CN.md'];

  function visit(relativePath) {
    const absolutePath = path.resolve(rootDirectory, relativePath);
    const projectPath = path.relative(rootDirectory, absolutePath);
    if (projectPath.startsWith('..') || path.isAbsolute(projectPath) || visited.has(projectPath)
      || !fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) return;
    const extension = path.extname(projectPath).toLowerCase();
    if (!['.md', '.js', '.jsx', '.ts', '.tsx'].includes(extension)) return;
    visited.add(projectPath);

    const content = fs.readFileSync(absolutePath, 'utf8');
    const canonicalPath = projectPath.replace(/_CN\.md$/, '.md').split(path.sep).join('/');
    if (!documents[canonicalPath]) documents[canonicalPath] = {};
    if (extension === '.md') {
      const language = projectPath.endsWith('_CN.md') ? 'zh' : 'en';
      documents[canonicalPath][language] = content;
      const counterpart = language === 'zh'
        ? projectPath.replace(/_CN\.md$/, '.md')
        : projectPath.replace(/\.md$/, '_CN.md');
      if (counterpart !== projectPath) visit(counterpart);

      const linkPattern = /\]\((\.\.?\/[^)#]+)(?:#[^)]*)?\)/g;
      let match = linkPattern.exec(content);
      while (match) {
        visit(path.relative(rootDirectory, path.resolve(path.dirname(absolutePath), match[1])));
        match = linkPattern.exec(content);
      }
    } else {
      const language = extension.slice(1);
      documents[canonicalPath].en = `# ${canonicalPath}\n\n\`\`\`${language}\n${content}\n\`\`\``;
    }
  }

  seeds.forEach(visit);
  Object.keys(documents).forEach((key) => {
    if (!documents[key].zh) documents[key].zh = documents[key].en;
    if (!documents[key].en) documents[key].en = documents[key].zh;
  });
  return documents;
}

function preparePlaygroundAssets(directory) {
  const demoDirectory = path.resolve(directory || process.cwd());
  const outputDirectory = path.join(demoDirectory, 'public/playground');
  const referenceDirectory = path.join(demoDirectory, 'public/reference');
  const typescriptSource = require.resolve('typescript/lib/typescript.js', {
    paths: [demoDirectory],
  });
  const workerSource = path.resolve(__dirname, 'playground/compiler-worker.js');
  const examplesDirectory = path.resolve(__dirname, '../demo_react_shared/src/examples');
  const exampleSources = collectExampleSources(examplesDirectory);
  const apiDocuments = collectReferenceDocuments(path.resolve(__dirname, '..'));

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.mkdirSync(referenceDirectory, { recursive: true });
  fs.copyFileSync(typescriptSource, path.join(outputDirectory, 'typescript.js'));
  fs.copyFileSync(workerSource, path.join(outputDirectory, 'compiler-worker.js'));
  fs.writeFileSync(
    path.join(outputDirectory, 'examples.json'),
    `${JSON.stringify(exampleSources)}\n`,
    'utf8',
  );
  fs.writeFileSync(
    path.join(referenceDirectory, 'api-documents.json'),
    `${JSON.stringify(apiDocuments)}\n`,
    'utf8',
  );
  console.log(`Prepared self-hosted playground assets, API documents, and ${Object.keys(exampleSources).length}`
    + ` example sources for ${path.basename(demoDirectory)}.`);
}

if (require.main === module) preparePlaygroundAssets(process.argv[2]);

module.exports = preparePlaygroundAssets;
module.exports.collectExampleSources = collectExampleSources;
module.exports.collectReferenceDocuments = collectReferenceDocuments;
