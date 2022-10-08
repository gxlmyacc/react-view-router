if (!Date.prototype.format) {
  Date.prototype.format = function (fmt) {
    let o = {
      'M+': this.getMonth() + 1,
      'd+': this.getDate(),
      'h+': this.getHours(),
      'm+': this.getMinutes(),
      's+': this.getSeconds(),
      'q+': Math.floor((this.getMonth() + 3) / 3),
      S: this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    Object.keys(o).forEach(k => {
      if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
        ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    });
    return fmt;
  };
}

module.exports = function (options) {
  options = options || {};
  if (options.dev === undefined) options.dev = true;
  options.devMode = options.dev ? 'development' : 'production';

  let plugins = [];
  let cssLoader; let scssLoader;

  const webpack = require('webpack');
  const path = require('path');
  const glob = require('glob');
  const fs = require('fs');
  // 路径定义
  const porjectDir = path.resolve(__dirname, '../');
  const project = JSON.parse(JSON.stringify(require(path.join(porjectDir, '$project.js'))));
  const buildDir = __dirname;
  const srcDir = path.resolve(porjectDir, project.src.dir);
  const libsDir = path.resolve(porjectDir, project.libs.dir);
  const assetsDir = path.resolve(porjectDir, project.assets.dir);
  // let srcLibDir = path.resolve(srcDir, project.src.libs);
  const distDir = path.resolve(porjectDir, project.dist.dir);
  // const distLibsDir = path.resolve(distDir, project.dist.libs);
  // const distAssetsDir = path.resolve(distDir, project.dist.assets);

  const rootDir = options.root || process.cwd();
  const nodeModPath = path.resolve(rootDir, './node_modules');
  // const nativesDir = path.resolve(rootDir, project.natives.dir);

  // 插件定义
  const ESLintPlugin = require('eslint-webpack-plugin');
  const RuntimeChunkPlugin = webpack.optimize.RuntimeChunkPlugin;
  const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
  const CopyWebpackPlugin = require('copy-webpack-plugin');
  const { CleanWebpackPlugin } = require('clean-webpack-plugin');
  const ProgressBarPlugin = require('progress-bar-webpack-plugin');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
  const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
  const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

  // 入口文件定义
  const entries = function () {
    let jsDir = path.resolve(srcDir, project.src.entrys);
    let entryFiles = glob.sync(jsDir + '/*.{js,jsx}');
    let map = {};
    for (let i = 0; i < entryFiles.length; i++) {
      let filePath = entryFiles[i];
      let filename = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
      map[filename] = filePath;
    }
    return map;
  };

  // html_webpack_plugins 定义
  const htmlPlugins = function () {
    let entryHtml = glob.sync(srcDir + '/' + project.src.templates + '/*.html');
    let r = [];
    let entriesFiles = entries();
    for (let i = 0; i < entryHtml.length; i++) {
      let filePath = entryHtml[i];
      let filename = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
      let conf = {
        template: filePath,
        filename: filename + '.html',
        cache: options.watch,
        watch: options.watch,
        dev: options.dev,
        project
      };
      // 如果和入口js文件同名
      if (filename in entriesFiles) {
        // let fileext = filePath.substring(filePath.lastIndexOf('.') + 1);
        conf.inject = 'body';
        conf.chunks = ['vendor', 'manifest', filename];
        conf.minify = options.dev ? {} : {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        };
        // necessary to consistently work with multiple chunks via WebpackSplitChunks
        conf.chunksSortMode = 'manual';
        conf.hash = false;
      }
      // 设置html标题
      if (project.template && project.template[filename]) {
        if (project.template[filename].title) conf.title = project.template[filename].title;
      }
      // 跨页面引用，如pageA,pageB 共同引用了common-a-b.js，那么可以在这单独处理
      // if(pageA|pageB.test(filename)) conf.chunks.splice(1,0,'common-a-b')
      r.push(new HtmlWebpackPlugin(conf));
    }
    return r;
  };

  if (!options.watch) plugins.push(new ProgressBarPlugin());
  plugins.push(new FriendlyErrorsWebpackPlugin({ clearConsole: false }));
  if (!options.dev) plugins.push(new webpack.HashedModuleIdsPlugin());
  plugins.push(new LodashModuleReplacementPlugin());
  cssLoader = [
    { loader: options.watch ? 'style-loader' : MiniCssExtractPlugin.loader, options: {} },
    { loader: 'css-loader', options: require('./css.config')(options, project) },
  ];
  scssLoader = [].concat(cssLoader, [
    { loader: 'postcss-loader', options: { config: { path: path.resolve(buildDir, 'postcss.config.js') } } },
    { loader: 'resolve-url-loader', options: { sourceMap: options.dev } },
    { loader: 'fast-sass-loader', options: require('./sass.config')(options, project) }
  ]);

  plugins.push(new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: project.src.styles + '/[name].[contenthash:8].css',
    chunkFilename: project.src.styles + '/chunk.[name].[contenthash:8].css'
  }));
  plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(options.devMode),
    },
    __DEV__: JSON.stringify(options.dev),
    __ENV__: JSON.stringify(options.devMode),
    __TEST__: JSON.stringify(options.test),
    __PRE_RELEASE__: JSON.stringify(options.release),
    __VERSION__: JSON.stringify(project.version),
    __OFFLINE__: JSON.stringify(project.offline),
    __PUBLIC_DATE__: JSON.stringify((new Date()).format('yyyy-MM-dd hh:mm:ss')),
    __COMPRESS__: project.gzip,
    __USER_COOKIE__: true, // options.watch,
    __WATCH__: options.watch,
    __REMOTE_DEBUG_HOST__: JSON.stringify(project.remoteDebugHost || ''),
    __HTML_PATH_MAP__: JSON.stringify({ src: '../', target: './' }),
  }));

  // extract webpack runtime and module manifest to its own file in order to
  // prevent venders hash from being updated whenever app bundle is updated
  plugins.push(new RuntimeChunkPlugin({ name: 'manifest' }));

  // plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
  plugins.push(new webpack.ProvidePlugin(project.provide || {}));

  plugins.push(new ESLintPlugin({
    context: project.root,
    emitWarning: options.watch,
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    exclude: [
      path.join(project.root, 'node_modules')
    ]
  }));

  // plugins.push(new webpack.SourceMapDevToolPlugin());

  if (options.watch && project.webserver.hot) {
    // plugins.push(new webpack.NamedModulesPlugin());
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  if (!options.watch && project.cleanDirs.length) plugins.push(
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: project.cleanDirs,
    })
  );
  if (fs.existsSync(libsDir)) plugins.push(new CopyWebpackPlugin([{ from: libsDir + '/**', to: distDir }], { context: porjectDir }));
  if (fs.existsSync(assetsDir)) plugins.push(new CopyWebpackPlugin([{ from: assetsDir + '/**', to: distDir }], { context: porjectDir }));

  function makeCssProcessorOptions(options) {
    // const safeParser = require('postcss-safe-parser');
    const postcssConfig = require('./postcss.config')({ env: options.devMode });
    const ret = { safe: true, /* parser: safeParser, */ discardComments: { removeAll: true } };
    Object.keys(postcssConfig.plugins).forEach(plugin => {
      ret[plugin] = postcssConfig.plugins[plugin];
    });
    return ret;
  }
  function makeNodeModulesExclude(modules) {
    return function (file) {
      if (!modules) modules = [];
      return /node_modules/.test(file) && !modules.some(r => r.test(file));
    };
  }

  // config
  let config = {
    mode: options.devMode,
    context: porjectDir,
    // watchOptions: {
    //   ignored: /node_modules/,
    //   aggregateTimeout: 300, // 当第一个文件更改，重新构建的延迟时间
    //   poll: 1000 // 每秒检查一次变动
    // },
    entry: entries(),
    output: {
      path: distDir,
      filename: project.src.scripts + '/[name].[contenthash].js',
      chunkFilename: project.src.scripts + '/chunk.[name].[contenthash].js',
      publicPath: './',
      pathinfo: options.dev,
      hashDigestLength: 8,
      // devtoolModuleFilenameTemplate: '[namespace]/[resource-path]?[loaders]'
    },
    devtool: options.devMode ? (options.watch ? 'cheap-module-eval-source-map' : 'source-map') : 'nosources-source-map',
    watch: options.watch,
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/
    },
    devServer: require('./server.config')(options, project),
    module: {
      // noParse: /jquery|lodash/,
      rules: [
        {
          test: /\.(jpe?g|png|gif|ico|webp)(\?.*)?$/,
          // exclude: /node_modules/,
          // 小于5KB的图片会自动转成dataUrl，
          use: [
            {
              loader: 'url-loader',
              options: require('./url.config')(options, project, project.src.images)
            },
            // { loader: 'image-webpack-loader', options: require('./image.config')(options, project) }
          ],
        },
        {
          test: /\.(woff|eot|ttf|svg|otf)\??.*$/,
          // exclude: /node_modules/,
          use: [
            {
              loader: 'url-loader',
              options: require('./url.config')(options, project, project.src.fonts)
            }
          ],
        },
        {
          test: /\.ejs$/,
          use: [
            {
              loader: 'ejs-loader',
              options: {
                variable: 'data',
                interpolate: '\\{\\{(.+?)\\}\\}',
                evaluate: '\\[\\[(.+?)\\]\\]'
              }
            }
          ]
        },
        { test: /\.css$/, use: cssLoader, type: 'javascript/auto', dependency: { not: ['url'] } },
        { test: /\.scss$/, use: scssLoader, type: 'javascript/auto', dependency: { not: ['url'] } },
      ]
    },
    externals: project.externals,
    resolve: {
      extensions: ['.js', '.json', '.css', '.scss'],
      modules: [srcDir, nodeModPath],
      alias: project.src.pathAlias
    },
    optimization: {
      minimize: !options.dev,
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: options.dev,
          uglifyOptions: {
            output: {
              comments: false,
              beautify: false,
            },
            mangle: { reserved: ['Response', 'Request', 'ClientResponse', 'ClientRequest'] }
          }
        }),
        new OptimizeCSSAssetsPlugin({ cssProcessorOptions: makeCssProcessorOptions(options) })
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
        automaticNameDelimiter: '-',
        minSize: (options.dev ? 50 : 20) * 1024,
        cacheGroups: {
          vendor: {
            name: 'vendor',
            // test: /[\\/]node_modules[\\/]|[\\/]src[\\/]scripts[\\/]libs[\\/]|[\\/]src[\\/]styles[\\/]/,
            test: /node_modules|\.css$/,
            priority: -10,
            chunks: 'all',
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
        }
      }
    },
    plugins: plugins.concat(htmlPlugins())
  };

  if (project.es6) {
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      exclude: makeNodeModulesExclude([
        /strip-ansi.*?js$/,
        /ansi-regex.*?js$/,
        /tiny-cookie.*?js$/,
        /webpack-dev-server.*?js$/,
        /to-fast-properties.*?js$/
      ]),
      loader: 'babel-loader',
      options: require('./babel.config')(options, project)
    });
    Object.keys(config.entry).forEach(name => {
      let entrys = [];
      if (options.dev && !options.watch) entrys.push('stack-source-map/register');
      // entrys.push('babel-polyfill');
      config.entry[name] = entrys.concat(config.entry[name]);
    });
  }

  // 如果开启了编译报告，使用下方配置
  if (!options.watch) {
    if (project.bundleAnalyzer && project.bundleAnalyzer.enable) {
      // 引入webpack-bundle-analyzer插件
      // BundleAnalyzerPlugin能以可视化的方式展示打包结果
      let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(new BundleAnalyzerPlugin(project.bundleAnalyzer));
    }
  }

  return config;
};
