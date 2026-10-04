# Chrome 49 legacy fixture

This fixture separates three different compatibility claims:

1. React 16.14 + Webpack 4 can consume the packed ReactViewRouter package.
2. The complete browser bundle parses as ES5 and contains no native dynamic import, arrow, async-function or class syntax.
3. The bundle passes guard, Promise-based `lazyImport`, push and POP navigation tests in a browser.

Use Node 14.14 or newer:

```bash
npm install
npm run bootstrap
npm run verify
npm run serve
```

The root Playwright test at `e2e/chrome49-legacy.spec.ts` validates the legacy bundle in the installed Chromium. This catches bundling and behavior regressions, but it is not a substitute for the real Chrome 49 engine.

Real-engine verification was recorded on Windows with Google Chrome 49.0.2623.75 and Node 14.19.0; see `verification.json`. The project still requires an explicitly supplied, trusted Chrome 49 binary and does not download an unsupported browser from third-party archives.

```bash
CHROME49_EXECUTABLE=/trusted/path/to/chrome npm run test:chrome49
```

The runner opens the legacy browser with a temporary profile and drives it through the Chrome remote-debugging protocol; Chrome 49 predates headless mode, so a desktop session or virtual display is required. React 16 and Webpack 4 remain compatibility dependencies. The fixture now uses core-js 3.50; the recorded verification.json predates this migration and must be refreshed after a real Chrome 49 run.

This result certifies the recorded fixed combination, not every Chromium 49 embedding or operating-system integration.
