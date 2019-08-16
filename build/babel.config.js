module.exports = function (options) {
  const browsers = require('./browsers.config')(options);
  return {
    // cacheDirectory: true,
    presets: [
      ['@babel/preset-env', {  useBuiltIns: false, corejs: 2, targets: { browsers }, modules: 'commonjs' }],
      '@babel/preset-react'
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          absoluteRuntime: false,
          corejs: false,
          helpers: false,
          regenerator: true,
          useESModules: false
        }
      ],
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-json-strings',
      '@babel/plugin-transform-arrow-functions',
      '@babel/plugin-proposal-object-rest-spread'
    ],
    ignore: [
    ]
  };
};
