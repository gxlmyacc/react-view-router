module.exports = function (options, project) {
  const browsers = require('./browsers.config');
  return {
    // cacheDirectory: true,
    presets: [
      ['@babel/preset-env', { useBuiltIns: 'entry', targets: { browsers }, corejs: '2.6.5', modules: 'commonjs' }],
      ['@babel/preset-react', { development: options.dev, useBuiltIns: true }],
      // ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
    ],
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      // '@babel/plugin-syntax-import-meta',
      // '@babel/plugin-transform-runtime',
      // '@babel/plugin-transform-classes',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-json-strings',
      '@babel/plugin-transform-arrow-functions',
      '@babel/plugin-proposal-object-rest-spread'
    ],
    ignore: [
    ]
  };
};
