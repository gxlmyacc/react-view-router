module.exports = function (options, project) {
  return {
    sourceMap: options.dev,
    // minimize: !debug,
    // enable CSS Modules
    // modules: true,
    // customize generated class names
    // localIdentName: '[local]_[hash:base64:8]',
  };
};