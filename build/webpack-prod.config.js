let webpackConfig = require('./webpack-base.config');

module.exports = function (options) {
  return webpackConfig(Object.assign({
    dev: false,
  }, options));
};