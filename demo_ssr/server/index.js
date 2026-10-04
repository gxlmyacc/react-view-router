const http = require('http');
const renderDocument = require('./renderDocument').default;
const serveClientAsset = require('./serveClientAsset');

const server = http.createServer(async (request, response) => {
  if (serveClientAsset(request, response)) return;

  try {
    response.setHeader('content-type', 'text/html; charset=utf-8');
    response.end(await renderDocument(request.url || '/ssr'));
  } catch (error) {
    response.statusCode = 500;
    response.end(error.stack || error.message);
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  process.stdout.write(`SSR demo: http://localhost:${port}/ssr\n`);
});
