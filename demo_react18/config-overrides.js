const path = require('path');
const fs = require('fs');
const { configureWebpack, configureDevServer } = require('../scripts/configure-demo-reload');
const ReactScopeStyleWebpackPlugin = require('babel-preset-react-scope-style/webpack');

module.exports = function override(config) {
  const sharedSource = path.resolve(__dirname, '../demo_react_shared/src');
  const transitionSource = path.resolve(__dirname, '../transition/src');
  const drawerSource = path.resolve(__dirname, '../drawer/src');
  config.resolve.alias['react-view-router-react-demo-shared'] = path.join(sharedSource, 'index.ts');
  config.resolve.alias['react-view-router/transition$'] = path.join(transitionSource, 'index.ts');
  config.resolve.alias['react-view-router/drawer$'] = path.join(drawerSource, 'index.ts');
  config.resolve.alias['react-view-router/dom$'] = path.resolve(__dirname, '../dom/es/index.js');
  config.resolve.alias['react-error-overlay$'] = path.resolve(__dirname, '../scripts/dev-error-overlay.js');
  config.resolve.alias['react-view-router'] = path.resolve(__dirname, '../es');
  config.resolve.alias.react = path.resolve(__dirname, 'node_modules/react');
  config.resolve.alias['react-dom'] = path.resolve(__dirname, 'node_modules/react-dom');
  config.resolve.extensions = ['.tsx', '.ts'].concat(config.resolve.extensions);
  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => plugin.constructor.name !== 'ModuleScopePlugin',
  );
  const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf;
  const babelRule = oneOf.find(rule => rule.loader && rule.loader.indexOf('babel-loader') >= 0 && rule.include);
  babelRule.include = [babelRule.include, sharedSource, transitionSource, drawerSource];
  config.plugins.push(new ReactScopeStyleWebpackPlugin({
    babel: { scopePrefix: 'rr-demo-', scopeNamespace: 'react-view-router-demos' },
  }));
  config.plugins = config.plugins.filter(
    plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin',
  );
  return configureWebpack(config, __dirname);
};

module.exports.paths = function overridePaths(paths) {
  // CRA's checker is not compatible with TypeScript 6. Babel compiles TS/TSX;
  // `npm run typecheck` performs the actual check with the modern config.
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
