const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const WebSocket = require('ws');

const executable = process.env.CHROME49_EXECUTABLE;
if (!executable) {
  throw new Error('Set CHROME49_EXECUTABLE to a trusted Chrome 49 executable.');
}
if (!fs.existsSync(executable)) {
  throw new Error(`Chrome executable does not exist: ${executable}`);
}

const fixturePort = 3149;
const debuggingPort = 9349;
const fixtureUrl = `http://127.0.0.1:${fixturePort}/`;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'react-view-router-chrome49-'));
const server = spawn(process.execPath, [path.join(__dirname, 'serve.js')], {
  cwd: path.resolve(__dirname, '..'),
  env: Object.assign({}, process.env, { PORT: String(fixturePort) }),
  stdio: ['ignore', 'pipe', 'inherit'],
});
const browser = spawn(executable, [
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--disable-default-apps',
  fixtureUrl,
], { stdio: 'ignore' });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson(pathname) {
  return new Promise((resolve, reject) => {
    const request = http.get({
      hostname: '127.0.0.1',
      port: debuggingPort,
      path: pathname,
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on('error', reject);
  });
}

async function findPageTarget() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const targets = await requestJson('/json');
      const target = targets.find((item) => item.type === 'page' && item.url.indexOf(fixtureUrl) === 0);
      if (target) return target;
    } catch (error) {
      // Chrome has not opened its debugging socket yet.
    }
    await delay(250);
  }
  throw new Error('Chrome 49 did not expose the fixture page through remote debugging.');
}

function createProtocolClient(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let id = 0;
  const pending = {};

  socket.on('message', (raw) => {
    const message = JSON.parse(String(raw));
    if (!message.id || !pending[message.id]) return;
    const callback = pending[message.id];
    delete pending[message.id];
    if (message.error) callback.reject(new Error(message.error.message));
    else callback.resolve(message.result);
  });

  const opened = new Promise((resolve, reject) => {
    socket.on('open', resolve);
    socket.on('error', reject);
  });

  return {
    async send(method, params) {
      await opened;
      id += 1;
      return new Promise((resolve, reject) => {
        pending[id] = { resolve, reject };
        socket.send(JSON.stringify({ id, method, params: params || {} }));
      });
    },
    close() {
      socket.close();
    },
  };
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    const details = response.exceptionDetails;
    const exception = details.exception && details.exception.description;
    throw new Error(exception || details.text || `Chrome evaluation failed: ${expression}`);
  }
  return response.result.value;
}

async function waitFor(client, expression, expected) {
  const deadline = Date.now() + 10000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      if (await evaluate(client, expression) === expected) return;
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  const suffix = lastError ? ` (${lastError.message})` : '';
  throw new Error(`Timed out waiting for: ${expression}${suffix}`);
}

async function run() {
  let client;
  try {
    const target = await findPageTarget();
    client = createProtocolClient(target.webSocketDebuggerUrl);
    await client.send('Runtime.enable');
    await waitFor(client, 'document.querySelector("[data-testid=route-page]").textContent', 'Chrome 49 home');

    await evaluate(client, 'document.getElementById("guarded").click()');
    await waitFor(client, 'document.querySelector("[data-testid=navigation-result]").textContent', 'rejected');
    await waitFor(client, 'location.pathname', '/');

    await evaluate(client, 'document.getElementById("details").click()');
    await waitFor(client, 'location.pathname', '/details');
    await waitFor(client, 'document.querySelector("[data-testid=route-page]").textContent', 'Chrome 49 lazy details');

    await evaluate(client, 'document.getElementById("back").click()');
    await waitFor(client, 'location.pathname', '/');
    await waitFor(client, 'document.querySelector("[data-testid=route-page]").textContent', 'Chrome 49 home');
    process.stdout.write('Real Chrome 49 navigation smoke passed.\n');
  } finally {
    if (client) client.close();
    browser.kill();
    server.kill();
    await delay(250);
    try {
      fs.rmSync(profile, { force: true, recursive: true });
    } catch (error) {
      process.stderr.write(`Could not remove temporary Chrome profile: ${profile}\n`);
    }
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
