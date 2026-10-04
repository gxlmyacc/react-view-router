/**
 * Reload demo routes as a unit so singleton routers and cached lazy components
 * cannot retain references from an earlier compilation.
 * @param {object} config Webpack configuration from CRA.
 * @param {string} launcherDirectory Absolute demo launcher directory.
 * @returns {object} The development configuration; production is unchanged.
 */
function configureWebpack(config, launcherDirectory) {
  if (config.mode !== 'development') return config;
  const legacy = config.plugins.some((plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin');
  config.plugins = config.plugins.filter((plugin) => (
    plugin.constructor.name !== 'HotModuleReplacementPlugin' && plugin.constructor.name !== 'ReactRefreshPlugin'
  ));
  config.module.rules.forEach((rule) => {
    (rule.oneOf || [rule]).forEach((loader) => {
      if (!loader.options || !Array.isArray(loader.options.plugins)) return;
      loader.options.plugins = loader.options.plugins.filter((plugin) => {
        const name = Array.isArray(plugin) ? plugin[0] : plugin;
        return typeof name !== 'string' || !/[\\/]react-refresh[\\/]babel(?:\.js)?$/.test(name);
      });
    });
  });
  if (legacy) {
    // CRA 4 normally injects its socket client through ReactRefreshPlugin.
    // Without HMR the same client reloads after a successful compilation.
    const client = require.resolve('react-dev-utils/webpackHotDevClient', { paths: [launcherDirectory] });
    const entries = Array.isArray(config.entry) ? config.entry : [config.entry];
    config.entry = [client, ...entries.filter((entry) => entry !== client)];
  }
  return config;
}

/**
 * @param {object} config Webpack-dev-server 3 or 4 configuration.
 * @returns {object} Configuration that reloads after successful compilation.
 */
function configureDevServer(config) {
  config.hot = false;
  config.liveReload = true;
  if (config.client) config.client.overlay = false;
  else config.overlay = false;
  return config;
}

module.exports = { configureWebpack, configureDevServer };
