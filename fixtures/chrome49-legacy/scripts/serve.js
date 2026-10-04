const fs = require('fs');
const http = require('http');
const path = require('path');

const port = Number(process.env.PORT || 3149);
const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'src', 'index.html'));
const bundle = fs.readFileSync(path.join(root, 'dist', 'app.js'));

const server = http.createServer((request, response) => {
  if (request.url === '/app.js') {
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    response.end(bundle);
    return;
  }
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(index);
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Chrome 49 fixture listening on http://127.0.0.1:${port}\n`);
});
