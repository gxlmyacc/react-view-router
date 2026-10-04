# React 17 demo

[English](./README.md) | [简体中文](./README_CN.md)

This Create React App launcher demonstrates ReactViewRouter with React 17. The JSX pages, nested lazy routes, named `footer` outlet, and visible guard-order log come from [`demo_react_shared`](../demo_react_shared/README.md), shared by the React 16–19 launchers.

## Run

```bash
npm install
npm start
```

Run `npm run build` for a production bundle. `config-overrides.js` resolves the shared source directly and applies `babel-preset-react-scope-style@0.1.0-alpha.5` to each isolated example. Its browserslist targets Chrome 78 and newer; use the dedicated [`Chrome 49 fixture`](../fixtures/chrome49-legacy/README.md) for legacy-browser certification.
