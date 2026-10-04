const fs = require('fs');
const path = require('path');

const demoDirectory = path.resolve(process.argv[2]);
const webpack = require(require.resolve('webpack', { paths: [demoDirectory] }));
const cacheDirectory = path.join(demoDirectory, 'node_modules/.cache/playground-legacy');
fs.mkdirSync(cacheDirectory, { recursive: true });
const compiler = require.resolve('typescript/lib/typescript.js', { paths: [demoDirectory] });
const worker = path.resolve(__dirname, 'playground/compiler-worker.js');
const ts = require(compiler);
const legacyCompiler = path.join(cacheDirectory, 'typescript.js');
const legacyWorker = path.join(cacheDirectory, 'compiler-worker.js');
// The compiler is already JavaScript. TypeScript can downlevel its own syntax efficiently.
for (const [source, output] of [[compiler, legacyCompiler], [worker, legacyWorker]]) {
  const result = ts.transpileModule(fs.readFileSync(source, 'utf8'), {
    fileName: source,
    compilerOptions: { target: ts.ScriptTarget.ES2015, module: ts.ModuleKind.CommonJS, ignoreDeprecations: '6.0' },
  });
  fs.writeFileSync(output, result.outputText);
}
const polyfills = require.resolve('core-js/stable');
const compilerEntry = path.join(cacheDirectory, 'typescript-entry.js');
const workerEntry = path.join(cacheDirectory, 'worker-entry.js');
fs.writeFileSync(compilerEntry, `require(${JSON.stringify(polyfills)}); self.ts = require(${JSON.stringify(legacyCompiler)});`);
fs.writeFileSync(workerEntry, `require(${JSON.stringify(polyfills)}); require(${JSON.stringify(legacyWorker)});`);

webpack({
  mode: 'production',
  target: 'webworker',
  entry: { typescript: compilerEntry, 'compiler-worker': workerEntry },
  output: {
    path: path.join(demoDirectory, 'public/playground'),
    filename: '[name].js',
    hashFunction: 'sha256',
  },
  // The Node-only compiler host is unreachable in a browser worker.
  externals: [(context, request, callback) => {
    if (/^(node:)?(fs|path|os|crypto|perf_hooks|inspector|source-map-support)$/.test(request)) callback(null, 'var {}');
    else callback();
  }],
  // TypeScript is large; it is self-hosted and compressed by the server, without a costly second minification pass.
  optimization: { minimize: false },
}, (error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ all: false, errors: true }));
    process.exitCode = 1;
  } else console.log('Built Chrome 49 playground compiler and worker.');
});
