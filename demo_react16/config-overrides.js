const path = require('path');
const fs = require('fs');
const { configureWebpack, configureDevServer } = require('../scripts/configure-demo-reload');
const ReactScopeStyleWebpackPlugin = require('babel-preset-react-scope-style/webpack');

module.exports = function override(config) {
  const production = config.mode === 'production';
  const artifact = production ? 'esm' : 'es';
  const sharedSource = path.resolve(__dirname, '../demo_react_shared/src');
  const transitionSource = path.resolve(__dirname, '../transition/src');
  const drawerSource = path.resolve(__dirname, '../drawer/src');
  // Webpack 4 defaults to MD4, which OpenSSL 3 disables in Node 17+.
  // SHA-256 works in both modern Node and the Node 14 compatibility runtime.
  config.output.hashFunction = 'sha256';
  config.resolve.alias['react-view-router-react-demo-shared'] = path.join(sharedSource, 'index.ts');
  config.resolve.alias['react-view-router/transition$'] = production ? path.resolve(__dirname, '../transition/esm/index.js') : path.join(transitionSource, 'index.ts');
  config.resolve.alias['react-view-router/drawer$'] = production ? path.resolve(__dirname, '../drawer/esm/index.js') : path.join(drawerSource, 'index.ts');
  config.resolve.alias['react-view-router/dom$'] = path.resolve(__dirname, '../dom', artifact, 'index.js');
  config.resolve.alias['react-error-overlay$'] = path.resolve(__dirname, '../scripts/dev-error-overlay.js');
  config.resolve.alias['react-view-router'] = path.resolve(__dirname, '..', artifact);
  // Shared sources live outside this launcher. Force every package to use the
  // launcher's React instance so Hooks never cross React versions.
  config.resolve.alias.react = path.resolve(__dirname, 'node_modules/react');
  config.resolve.alias['react-dom'] = path.resolve(__dirname, 'node_modules/react-dom');
  config.resolve.extensions = ['.tsx', '.ts'].concat(config.resolve.extensions);
  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => plugin.constructor.name !== 'ModuleScopePlugin',
  );
  const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf;
  const babelRule = oneOf.find(
    rule => rule.loader && rule.loader.indexOf('babel-loader') >= 0 && rule.include,
  );
  babelRule.include = [babelRule.include, sharedSource, transitionSource, drawerSource];
  if (production) {
    // Shared files resolve Browserslist outside this launcher; pin the release target.
    babelRule.options = babelRule.options || {};
    babelRule.options.presets = (babelRule.options.presets || []).concat([
      [require.resolve('@babel/preset-env'), { targets: { chrome: '49' }, modules: false }],
    ]);
  }
  config.plugins.push(new ReactScopeStyleWebpackPlugin({
    babel: { scopePrefix: 'rr-demo-', scopeNamespace: 'react-view-router-demos' },
  }));
  config.plugins = config.plugins.filter(
    plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin',
  );
  return configureWebpack(config, __dirname);
};

module.exports.paths = function overridePaths(paths) {
  // CRA 4 hardcodes deprecated TypeScript resolution settings. Babel still
  // compiles TS/TSX; `npm run typecheck` owns checking with the modern config.
  const craTsConfig = path.resolve(
    __dirname,
    'node_modules/.cache/react-view-router-demo-tsconfig.json',
  );
  fs.mkdirSync(path.dirname(craTsConfig), { recursive: true });
  fs.writeFileSync(craTsConfig, JSON.stringify({
    extends: '../../tsconfig.json',
    compilerOptions: {
      allowJs: true,
      forceConsistentCasingInFileNames: true,
      noFallthroughCasesInSwitch: true,
      moduleResolution: 'Node',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      ignoreDeprecations: '6.0',
    },
    include: ['../../src/**/*.ts', '../../src/**/*.tsx'],
  }, null, 2));
  paths.appTsConfig = craTsConfig;
  return paths;
};

module.exports.devServer = function overrideDevServer(configFunction) {
  return function (proxy, allowedHost) {
    const config = configFunction(proxy, allowedHost);
    return configureDevServer(config);
  };
};
