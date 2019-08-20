module.exports = function (ctx /* { file, options, env } */) {
  const browsers = require('./browsers.config');
  return {
    exec: true,
    sourceMap: ctx.env === 'development',
    plugins: {
      'postcss-discard-duplicates': ctx.env === 'development',
      'postcss-pxtorem': { rootValue: 16, propList: ['*'] },
      'postcss-fixes': true,
      autoprefixer: { browsers }
    }
  };
};