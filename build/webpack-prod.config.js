let webpackConfig = require('./webpack-base.config');

module.exports = function (options) {
  return webpackConfig({ dev: false, ...options });
};