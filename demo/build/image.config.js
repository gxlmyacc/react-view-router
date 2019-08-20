module.exports = function (options, project) {
  return {
    mozjpeg: {
      progressive: true,
      quality: 65
    },
    // optipng.enabled: false will disable optipng
    optipng: {
      quality: '65-90',
      speed: 4
    },
    pngquant: {
      quality: '65-90',
      speed: 4
    },
    gifsicle: {
      interlaced: false,
    },
    // the webp option will enable WEBP
    webp: {
      quality: 75
    }
  };
};