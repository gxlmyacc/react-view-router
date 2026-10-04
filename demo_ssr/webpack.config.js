const path = require('path');

const outputPath = path.resolve(__dirname, 'dist');

function createJavaScriptRule(targets) {
  return {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          ['@babel/preset-env', { targets }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    },
  };
}

const shared = {
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
};

module.exports = [
  {
    ...shared,
    name: 'client',
    target: 'web',
    entry: './src/client/index.jsx',
    output: {
      path: outputPath,
      filename: 'client.js',
    },
    module: {
      rules: [createJavaScriptRule({ browsers: ['defaults'] })],
    },
  },
  {
    ...shared,
    name: 'server',
    target: 'node',
    entry: './server/index.js',
    output: {
      path: outputPath,
      filename: 'server.js',
    },
    module: {
      rules: [createJavaScriptRule({ node: 'current' })],
    },
  },
];
