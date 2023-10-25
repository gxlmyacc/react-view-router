const config = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: 2,
        targets: { browsers: ['chrome >= 49', 'firefox >= 52'] }
      }
    ],
    '@babel/typescript',
    '@babel/preset-react'
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-transform-runtime', { useESModules: false, }],
    'babel-plugin-define-variables'
  ]
};

module.exports = process.env.BUILD_ENV === 'es'
  ? {
    presets: [
      '@babel/typescript',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      'babel-plugin-define-variables'
    ]
  }
  : config;
