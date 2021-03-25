let path = require('path');
let packageInfo = require('./package.json');

const project = {
  pack: true,
  root: __dirname,
  public: '#{dir}',
  version: packageInfo.version,
  name: 'xinsb-front',
  webpack: true,
  es6: true,
  gzip: true,
  gzipExtensions: ['js', 'css'],
  offline: true,
  bundleAnalyzer: {
    enable: false,
    openAnalyzer: false,
    analyzerMode: 'static',
    reportFilename: path.resolve(__dirname, 'analyzer/report.html')
  },
  remoteDebugHost: '',
  cleanDirs: ['dist'],
  dist: {
    dir: 'dist',
    libs: 'libs',
    assets: 'assets',
    fonts: 'fonts',
    scripts: 'scripts',
    styles: 'styles',
    images: 'images'
  },
  libs: {
    dir: 'libs'
  },
  mock: {
    dir: 'mock'
  },
  assets: {
    dir: 'assets'
  },
  natives: {
    dir: 'natives'
  },
  src: {
    dir: 'src',
    entrys: '',
    images: 'images',
    scripts: 'scripts',
    libs: 'scripts/libs',
    styles: 'styles',
    templates: 'templates',
    fonts: 'fonts',
    chunks: [],
    pathAlias: {
      '@': '#{src}',
      statics: '#{src}statics',
      store: '#{src}scripts/store',
      filters: '#{src}scripts/filters',
      polyfill: '#{src}scripts/polyfill',
      validators: '#{src}scripts/validators',
      directives: '#{src}scripts/directives',
      mixins: '#{src}scripts/mixins',
      config: '#{src}scripts/config',
      libs: '#{src}scripts/libs',
      router: '#{src}views/router',
      component: '#{src}views/component',
      styles: '#{src}styles',
      images: '#{src}images',
      fonts: '#{src}fonts',
      // history: 'history-fix',
      'react-view-router': '#{src}../../es'
    }
  },
  externals: {},
  template: {
    index: {
      title: 'react-view-router demo'
    }
  },
  uglifyExcept: [
    '$', '_', 'exports', 'require', 'synative', 'external', 'importCss',
  ],
  provide: {
    $: '#{src}statics/js/miniQuery.js',
    __: 'lodash',
    importCss: '#{src}statics/js/importCss.js',
    importJs: '#{src}statics/js/importJs.js',
    asyncAll: '#{src}statics/js/asyncAll.js',
  },
  webserver: {
    host: '0.0.0.0',
    port: 8081,
    disableHostCheck: true,
    publicHost: '',
    path: '/',
    hot: false,
    hotOnly: false,
    open: 'index.html',
    https: false,
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
};

let srcDir = path.resolve(project.root, project.src.dir);
let buildDir = path.resolve(project.root, 'build');
function resolvePath(obj) {
  if (!obj) return;
  Object.keys(obj).forEach(function (key) {
    let value = obj[key];
    if (!value) return;
    if (~value.indexOf('#{src}')) obj[key] = path.resolve(srcDir, value.replace('#{src}', ''));
    if (~value.indexOf('#{build}')) obj[key] = path.resolve(buildDir, value.replace('#{build}', ''));
  });
}
resolvePath(project.src.pathAlias);
resolvePath(project.provide);

module.exports = project;
