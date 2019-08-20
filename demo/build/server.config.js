module.exports = function (options, project) {
  const path = require('path');
  const url = require('url');
  const fs = require('fs');
  const bodyParser = require('body-parser');
  const multipart = require('connect-multiparty');
  const cookieParser = require('cookie-parser');
  const porjectDir = project.root;
  const distDir = path.resolve(porjectDir, project.dist.dir);
  return {
    inline: true,
    quiet: true,
    historyApiFallback: true,
    // noInfo: true, // only errors & warns on hot reload
    host: project.webserver.host,
    port: project.webserver.port,
    disableHostCheck: project.webserver.disableHostCheck,
    hot: project.webserver.hot,
    hotOnly: project.webserver.hotOnly,
    compress: project.gzip,
    contentBase: distDir,
    public: project.webserver.publicHost ? (project.webserver.publicHost + ':' + project.webserver.port) : '',
    publicPath: project.webserver.path,
    https: project.webserver.https,
    headers: project.webserver.headers,
    overlay: {
      warnings: false,
      errors: true
    },
    stats: {
      extensions: true,
      index: project.webserver.open
    },
    before(app) {
      let store = {};
      let _global = {};
      app.use(bodyParser.json({ limit: '50mb' }));
      app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
      app.use(multipart());
      app.use(cookieParser());

      // req.body：报文 req.params：url路径 req.query：url参数
      let func = function (req, res) {
        let urlObj = url.parse(req.url, true);
        let mockDataFile = path.join(porjectDir, urlObj.pathname);
        let pathnames = urlObj.pathname.split('\\');
        if (fs.existsSync(mockDataFile)) res.sendFile(mockDataFile);
        else {
          let mockDataFile1 = pathnames[pathnames.length - 1];
          if (!mockDataFile1.includes('.')) mockDataFile += '.js';
          if (fs.existsSync(mockDataFile)) {
            if (mockDataFile.endsWith('.js')) {
              delete require.cache[mockDataFile];
              let mockFunc = require(mockDataFile);
              try {
                let _store = store[mockDataFile] ? store[mockDataFile] : (store[mockDataFile] = { global: _global });
                _store.pathname = urlObj.pathname;
                _store.parentPath = path.join(porjectDir, urlObj.pathname + '/../');
                let ret = mockFunc(req, res, _store);
                if (ret !== undefined) {
                  if (typeof ret === 'object') res.json(ret);
                  else if (typeof ret === 'string') res.send(ret);
                  else res.send('不支持的报文类型:' + (typeof ret) + '!');
                }
              } catch (e) {
                res.status(500).json({ status: '服务端处理异常！', message: e.name + ': ' + e.message });
              }
            } else res.sendFile(mockDataFile);
          } else if (fs.existsSync(mockDataFile + '.json')) res.sendFile(mockDataFile + '.json');
          else res.status(404).json({ status: '没有找到此文件', notFound: mockDataFile });
        }
      };
      app.get('/mock/*', func);
      app.post('/mock/*', func);
    }
  };
};
