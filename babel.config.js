module.exports = function (api) {
  const isTest = api?.env?.('test');

  if (isTest) {
    return {
      presets: [
        ['@babel/preset-env', { modules: 'commonjs', targets: { node: 'current' } }],
        '@babel/preset-typescript',
        '@babel/preset-react',
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import',
        ['@babel/plugin-transform-runtime', { useESModules: false }],
      ],
    };
  }

  const config = {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: 'commonjs',
          useBuiltIns: 'usage',
          corejs: '3.50',
          targets: { browsers: ['chrome >= 49', 'firefox >= 52'] }
        }
      ],
      '@babel/preset-typescript',
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-syntax-dynamic-import',
      ['@babel/plugin-transform-runtime', { useESModules: false, }],
      'babel-plugin-define-variables'
    ]
  };

  return process.env.BUILD_ENV === 'es'
    ? {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            useBuiltIns: 'usage',
            corejs: '3.50',
            targets: { browsers: ['chrome >= 86'] }
          }
        ],
        '@babel/preset-typescript',
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',
        'babel-plugin-define-variables'
      ]
    }
    : config;
};
