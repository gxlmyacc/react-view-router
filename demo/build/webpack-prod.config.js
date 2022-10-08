let webpackConfig = require('./webpack-base.config');

module.exports = function (options) {
  return webpackConfig({
    dev: false,
    watch: process.argv.indexOf('WATCH') > 0,
    release: process.argv.indexOf('--release') > 0,
    test: process.argv.indexOf('--dev-test') > 0,
    ...options
  });
};