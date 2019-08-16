module.exports = function (options) {
  options = options || {};
  if (options.dev === undefined) options.dev = true;
  options.devMode = options.dev ? 'development' : 'production';

  const webpack = require('webpack');
  const path = require('path');

  const rootDir = options.root || process.cwd();
  const srcDir = path.resolve(rootDir, 'src');
  const distDir = path.resolve(rootDir, 'dist');

  const nodeModPath = path.resolve(rootDir, './node_modules');

  const ProgressBarPlugin = require('progress-bar-webpack-plugin');
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
  const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

  const plugins = [];
  plugins.push(new ProgressBarPlugin());
  plugins.push(new FriendlyErrorsWebpackPlugin({ clearConsole: false }));

  plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(options.devMode),
    },
    __DEV__: JSON.stringify(options.dev),
    __ENV__: JSON.stringify(options.devMode),
  }));

  if (options.devMode) {
    plugins.push(new BundleAnalyzerPlugin({
      enable: true,
      openAnalyzer: false,
      analyzerMode: 'static',
      reportFilename: path.resolve(rootDir, 'analyzer/report.html')
    }));
  }

  // config
  let config = {
    mode: options.devMode,
    context: rootDir,
    entry: path.resolve(srcDir, 'index.js'),
    output: {
      path: distDir,
      filename: options.dev ? 'react-view-router.js' : 'react-view-router.min.js',
      publicPath: './',
      pathinfo: options.dev,
      library: 'ReactViewRouter',
      libraryTarget: 'commonjs2'
    },
    devtool: 'nosources-source-map',
    module: {
      rules: [
        {
          test: /\.(js)$/,
          loader: 'eslint-loader',
          enforce: 'pre',
          exclude: [/node_modules/],
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: require('./babel.config')(options)
        }
      ]
    },
    externals: [
      'react',
      'mini-create-react-context',
      'prop-types',
      'react-is',
      'regenerator-runtime',
      'hoist-non-react-statics'
    ],
    resolve: {
      symlinks: false,
      enforceExtension: false,
      enforceModuleExtension: false,
      extensions: ['.js', '.json'],
      modules: [srcDir, nodeModPath],
      alias: {
        history: 'history-fix'
      }
    },
    resolveLoader: {
      moduleExtensions: ['-loader']
    },
    optimization: {
      minimize: !options.dev,
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: false,
          uglifyOptions: {
            output: {
              comments: false,
              beautify: false,
            },
          }
        }),
      ],
    },
    plugins
  };

  return config;
};
