module.exports = function (options, project, dir) {
  return {
    limit: 2048,
    publicPath: '',
    publicStylePath: '../',
    fallback: 'vue-asset-loader',
    name: dir + (dir ? '/' : '') + '[name].[hash:8].[ext]'
  };
};