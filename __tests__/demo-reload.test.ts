/** @jest-environment node */
import path from 'path';

const { configureWebpack } = require('../scripts/configure-demo-reload');

describe('demo source reload', () => {
  it.each(['demo_react16', 'demo_react17', 'demo_react18', 'demo_react19'])('%s enables page reload', (launcher) => {
    const override = require(`../${launcher}/config-overrides`);
    const legacy = launcher === 'demo_react16' || launcher === 'demo_react17';
    const retainedPlugin = { constructor: { name: 'HtmlWebpackPlugin' } };
    const config = {
      mode: 'development',
      output: {},
      entry: '/demo/src/index.tsx',
      plugins: [
        retainedPlugin,
        { constructor: { name: 'ReactRefreshPlugin' } },
        ...(legacy ? [{ constructor: { name: 'HotModuleReplacementPlugin' } }] : []),
      ],
      resolve: { alias: {}, plugins: [], extensions: ['.js'] },
      module: {
        rules: [{
          oneOf: [{
            loader: '/node_modules/babel-loader/index.js',
            include: '/demo/src',
            options: { plugins: ['/node_modules/react-refresh/babel.js', ['C:\\node_modules\\react-refresh\\babel.js', {}], 'other-plugin'] },
          }]
        }],
      },
    };
    const result = override(config);
    expect(result.plugins).toContain(retainedPlugin);
    expect(result.plugins.map((plugin: { constructor: { name: string } }) => plugin.constructor.name))
      .not.toContain('ReactRefreshPlugin');
    expect(result.plugins.map((plugin: { constructor: { name: string } }) => plugin.constructor.name))
      .not.toContain('HotModuleReplacementPlugin');
    expect(result.module.rules[0].oneOf[0].options.plugins).toEqual(['other-plugin']);
    if (legacy) {
      const client = require.resolve('react-dev-utils/webpackHotDevClient', { paths: [path.resolve(launcher)] });
      expect(result.entry).toEqual([client, '/demo/src/index.tsx']);
    } else {
      expect(result.entry).toBe('/demo/src/index.tsx');
    }
    const server = override.devServer(() => (legacy ? {} : { client: { overlay: true } }))();
    expect(server.hot).toBe(false);
    expect(server.liveReload).toBe(true);
    expect(legacy ? server.overlay : server.client.overlay).toBe(false);
  },);

  it('keeps production compilation unchanged', () => {
    const config = { mode: 'production' };
    expect(configureWebpack(config, __dirname)).toBe(config);
    expect(config).toEqual({ mode: 'production' });
  });

  it('retains exactly one legacy socket client before application initialization', () => {
    const launcherDirectory = path.resolve('demo_react16');
    const client = require.resolve('react-dev-utils/webpackHotDevClient', { paths: [launcherDirectory] });
    const config = {
      mode: 'development',
      entry: [client, '/demo/src/index.tsx'],
      plugins: [{ constructor: { name: 'HotModuleReplacementPlugin' } }],
      module: { rules: [] },
    };
    expect(configureWebpack(config, launcherDirectory).entry).toEqual([client, '/demo/src/index.tsx']);
  });
});
