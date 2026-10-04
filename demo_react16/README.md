# React 16 demo

[English](./README.md) | [简体中文](./README_CN.md)

This Create React App launcher demonstrates ReactViewRouter with React 16. The workspace, module routing, nested lazy routes, named `RouterView`, scoped SCSS, and guard log come from the shared [`demo_react_shared`](../demo_react_shared/README.md) application.

## Run

```bash
npm install
npm start
```

The build requires Node 14.17 or newer. Like the React 17/18 launchers, this demo targets a modern development browser; Chrome 49 compatibility is verified separately against the published ReactViewRouter library in `fixtures/chrome49-legacy`.

Then open `http://localhost:8081/`. Create React App provides hot updates and browser-route fallback. The launcher automatically enables OpenSSL's legacy provider only on Node 17+ because CRA 4 uses Webpack 4; Node 14 runs without that flag.

The **Guard execution order** panel groups calls by navigation. Its compact header shows `from → to` and the final result; the fixed-height list follows new events automatically. `config-overrides.js` only adds workspace aliases, shared-source transpilation, and `babel-preset-react-scope-style@0.1.0-alpha.5`.

The launcher also prepares the Playground's TypeScript compiler and Worker as self-hosted static assets before start/build. They are loaded lazily only when the Playground is used and require no runtime CDN.

Use `npm run build` for a production bundle. For standalone SSR, use [`demo_ssr`](../demo_ssr/README.md).
