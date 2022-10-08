module.exports = function (options, project, dir) {
  return {
    limit: 2048,
    publicPath: '',
    // publicStylePath: '../',
    // fallback: 'react-asset-loader',
    name: dir + (dir ? '/' : '') + '[name].[hash:8].[ext]'
  };
};