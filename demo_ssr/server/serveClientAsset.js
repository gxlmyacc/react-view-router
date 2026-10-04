const fs = require('fs');
const path = require('path');

const adjacentClientFile = path.resolve(__dirname, 'client.js');
const clientFile = fs.existsSync(adjacentClientFile)
  ? adjacentClientFile
  : path.resolve(__dirname, '../dist/client.js');

function serveClientAsset(request, response) {
  if (request.url !== '/client.js') return false;

  response.setHeader('content-type', 'text/javascript; charset=utf-8');
  fs.createReadStream(clientFile).pipe(response);
  return true;
}

module.exports = serveClientAsset;
