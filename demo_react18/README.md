# React 18 demo

[English](./README.md) | [简体中文](./README_CN.md)

This Create React App launcher demonstrates ReactViewRouter with React 18. The JSX pages, nested lazy routes, named `footer` outlet, and visible guard-order log come from [`demo_react_shared`](../demo_react_shared/README.md), shared by the React 16–19 launchers.

## Run

```bash
npm install
npm start
```

Run `npm run build` for a production bundle. `config-overrides.js` resolves the shared source directly and applies scoped styles to each example. For React 18 standalone SSR and route-island hydration, use [`demo_ssr`](../demo_ssr/README.md).
