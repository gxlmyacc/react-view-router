/** @jest-environment node */

import fs from 'fs';

const override = require('../demo_react16/config-overrides');

describe('React 16 demo build configuration', () => {
  it('uses the same compact CRA override pattern as the newer React launchers', () => {
    const babelRule = { loader: 'babel-loader', include: 'launcher-src' };
    const config = {
      output: {},
      resolve: {
        alias: {},
        extensions: ['.js', '.jsx'],
        plugins: [
          { constructor: { name: 'ModuleScopePlugin' } },
          { constructor: { name: 'KeepPlugin' } },
        ],
      },
      module: { rules: [{ oneOf: [babelRule] }] },
      plugins: [],
    };

    const result = override(config);

    expect(result.output.hashFunction).toBe('sha256');
    expect(result.resolve.alias['react-view-router-react-demo-shared'])
      .toMatch(/[\\/]demo_react_shared[\\/]src[\\/]index\.ts$/);
    expect(result.resolve.alias['react-view-router/transition$'])
      .toMatch(/[\\/]transition[\\/]src[\\/]index\.ts$/);
    expect(result.resolve.alias['react-view-router']).toMatch(/[\\/]es$/);
    expect(result.resolve.alias.react).toMatch(/[\\/]demo_react16[\\/]node_modules[\\/]react$/);
    expect(result.resolve.alias['react-dom'])
      .toMatch(/[\\/]demo_react16[\\/]node_modules[\\/]react-dom$/);
    expect(result.resolve.plugins).toHaveLength(1);
    expect(babelRule.include).toEqual(expect.arrayContaining([
      'launcher-src',
      expect.stringMatching(/[\\/]demo_react_shared[\\/]src$/),
      expect.stringMatching(/[\\/]transition[\\/]src$/),
    ]));
    expect(result.plugins.some(
      (plugin: { constructor?: { name?: string } }) => plugin.constructor?.name === 'ReactScopeStyleWebpackPlugin',
    )).toBe(true);
    const paths = override.paths({ appTsConfig: 'tsconfig.json' });
    expect(paths.appTsConfig)
      .toMatch(/[\\/]demo_react16[\\/]node_modules[\\/]\.cache[\\/]react-view-router-demo-tsconfig\.json$/);
  });

  it('uses legacy core and subentries only in production', () => {
    const config = {
      mode: 'production',
      output: {},
      resolve: { alias: {}, extensions: ['.js'], plugins: [] },
      module: { rules: [{ oneOf: [{ loader: 'babel-loader', include: 'launcher-src' }] }] },
      plugins: [],
    };
    const result = override(config);
    expect(result.resolve.alias['react-view-router']).toMatch(/[\\/]esm$/);
    for (const name of ['dom', 'drawer', 'transition']) {
      expect(result.resolve.alias[`react-view-router/${name}$`]).toMatch(/[\\/]esm[\\/]index\.js$/);
    }
    const presets = result.module.rules[0].oneOf[0].options.presets;
    const transformed = require('@babel/core').transformSync(
      'async function load(value) { return { ...value }; }',
      { configFile: false, babelrc: false, presets },
    ).code;
    expect(() => require('acorn').parse(transformed, { ecmaVersion: 2015 })).not.toThrow();
    expect(transformed).not.toContain('async function');
    expect(transformed).not.toContain('...value');
  });

  it('removes the old custom Webpack/Gulp build and keeps compatibility testing separate', () => {
    const packageJson = JSON.parse(fs.readFileSync('demo_react16/package.json', 'utf8'));

    expect(packageJson.scripts.start).toContain('run-react-app.js start');
    expect(packageJson.scripts.build).toContain('run-react-app.js build');
    expect(packageJson.scripts.lint).toBe('eslint src --ext .ts,.tsx');
    expect(packageJson.scripts.typecheck).toBe('tsc -p tsconfig.json');
    expect(packageJson.scripts['build-prod']).toBeUndefined();
    expect(packageJson.browserslist.development).toContain('Chrome >= 78');
    expect(packageJson.browserslist.production).toContain('Chrome >= 49');
    expect(fs.existsSync('demo_react16/build/webpack-dev.config.js')).toBe(false);
    expect(fs.existsSync('demo_react16/gulpfile.js')).toBe(false);
    expect(fs.existsSync('demo_react16/public/index.html')).toBe(true);
    const runner = fs.readFileSync('demo_react16/scripts/run-react-app.js', 'utf8');
    expect(runner).toContain('nodeMajor >= 17');
    expect(runner).toContain('--openssl-legacy-provider');
  });

  it('builds one portable React 16 artifact for Pages and domestic mirrors', () => {
    const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const workflow = fs.readFileSync('.github/workflows/demo-site.yml', 'utf8');
    const audit = fs.readFileSync('scripts/verify-demo-site.js', 'utf8');

    expect(rootPackage.scripts['build-demo-site']).toContain('demo_react16 run build');
    expect(rootPackage.scripts['build-demo-site']).toContain('verify-demo-site');
    expect(workflow).toContain('PUBLIC_URL: /${{ github.event.repository.name }}');
    expect(workflow).toContain('actions/upload-pages-artifact@v4');
    expect(workflow).toContain('path: demo_react16/build');
    expect(audit).toContain('forbiddenRuntimeHosts');
    expect(audit).toContain('stackblitz.com');
    expect(audit).toContain('codesandbox.io');
  });
});
