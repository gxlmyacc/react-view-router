const path = require('path');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      include: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules', 'react-view-router'),
        path.resolve(__dirname, 'node_modules', 'path-to-regexp'),
        path.resolve(__dirname, 'node_modules', 'dom-helpers'),
        path.resolve(__dirname, 'node_modules', 'react-transition-group'),
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              corejs: '3.50',
              modules: false,
              targets: { ie: '11' },
              useBuiltIns: 'usage',
            }],
            ['@babel/preset-react', { runtime: 'classic' }],
          ],
        },
      },
    }],
  },
};
