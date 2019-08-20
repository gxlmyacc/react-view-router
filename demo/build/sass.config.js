module.exports = function (options, project) {
  return {
    importer: require('sass-dedup-once-importer')({
      alias: project.src.pathAlias,
      // exclude: /\b_variables\b|\belement-variables\b|\bmixins\b/,
    }),
    sourceMap: true,
    data: '$env: ' + options.devMode + ';@import "~styles/common-vars";'
  };
};