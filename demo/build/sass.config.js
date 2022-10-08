module.exports = function (options, project) {
  return {
    sourceMap: true,
    data: '$env: ' + options.devMode + ';@import "~styles/common-vars";'
  };
};