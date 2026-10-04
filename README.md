# ReactViewRouter

[English](https://github.com/gxlmyacc/react-view-router/blob/master/README.md) | [简体中文](https://github.com/gxlmyacc/react-view-router/blob/master/README_CN.md)

ReactViewRouter is a configuration-driven React routing gateway that runs in the browser. It centralizes matching, guards, redirects, nested routing, and optional standalone SSR route-island hydration.

Existing SPA usage remains unchanged. Standalone SSR and React Native support are isolated from the default browser bundle.

## Installation

```bash
npm install react-view-router
```

The core peer baseline is React 16.8 or newer.

## Quick start

```tsx
// router/routes.tsx
import { lazyImport } from 'react-view-router';
import HomePage from '../pages/HomePage';

export const routes = [
  { path: '/', component: HomePage },
  {
    path: '/orders',
    component: lazyImport(() => import('../pages/OrdersPage')),
  },
];
```

```tsx
// App.tsx
import ReactViewRouter, { RouterView } from 'react-view-router';
import { routes } from './router/routes';

const router = new ReactViewRouter({ mode: 'browser', routes });

export default function App() {
  return <RouterView router={router} />;
}
```

`lazyImport` accepts a string, a component factory, or a factory returning a Promise. The actual component is the factory result or the resolved Promise value.

## Declaring an SSR route

SSR capability is declared per route. ReactViewRouter does not need a global hydration option:

```tsx
const routes = [{
  path: '/profile',
  component: lazyImport(() => import('./ProfilePage'), {
    hydrate: true,
  }),
}];
```

`hydrate` means that the `RouteLazy` may reuse server-rendered output. The selected standalone adapter decides whether to use React 18 `hydrateRoot` or React 16/17 `hydrate`. Without a compatible adapter, the default behavior degrades to a normal client render. Only `hydrate: { required: true }` makes the missing hydration capability an error.

Multiple SSR pages still share this single `routes` tree. On the server, `resolveHydratableRoutes(routes, requestUrl)` matches and loads hydration routes for the current request. A proxy can inspect route metadata without loading components through `collectHydratableRoutes` or `matchHydratableRoutes`. See the complete template in [`demo_ssr`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_ssr/README.md).

## Capabilities and compatibility

| Scenario | Entry point | Status |
|---|---|---|
| Browser/hash/memory routing | `react-view-router` | Existing API preserved |
| React Router v4/v5 collaboration | `router.history.createHistory4()` | `history@4.10.1`-compatible adapter over the shared ReactViewRouter history |
| DOM render utilities | `react-view-router/dom` | Explicit package export |
| Drawer router view | `react-view-router/drawer` | Explicit package export; styles are imported automatically |
| Transition router view | `react-view-router/transition` | Explicit package export; styles are imported automatically |
| React 18+ standalone SSR island | `react-view-router/standalone-modern` | Implemented and tested |
| React 16.8/17 standalone SSR island | `react-view-router/standalone-legacy` | Implemented and tested |
| React Native | core memory router | Supported without DOM/hydration adapters |

- Core and the legacy standalone adapter still target Chrome 49. The React 16/Webpack 4 packed-package fixture, full ES5 syntax gate, modern Chromium behavior test, and a Windows Chrome 49.0.2623.75 smoke test all pass. Application bundlers must transform dynamic `import()` into a compatible chunk loader.
- Framework-owned page routing is intentionally outside ReactViewRouter's supported scope. Use the framework router for the outer URL and do not mirror its route table into ReactViewRouter.
- Existing Router/Route hooks are browser Client Component hooks and cannot execute in a React Server Component.

## Documentation

| Document | Use it for |
|---|---|
| [Complete API reference](https://github.com/gxlmyacc/react-view-router/blob/master/docs/api.md) | Router, RouterView, RouterLink, route configuration, methods, HOCs, hooks, plugins, and runtime helpers. |
| [SSR and runtime adapters](https://github.com/gxlmyacc/react-view-router/blob/master/docs/ssr.md) | Standalone hydration setup, ownership, compatibility, and fallbacks. |
| [Server Component boundaries](https://github.com/gxlmyacc/react-view-router/blob/master/docs/server-components.md) | Client-only hooks and server-safe helpers. |
| [SSR route-island design](https://github.com/gxlmyacc/react-view-router/blob/master/docs/ssr-route-island-design.md) | Protocol details and the compatibility matrix. |
| [Route guard plugin proposal](https://github.com/gxlmyacc/react-view-router/blob/master/docs/guard-plugin-design.md) | Planned guard-pipeline extraction and constraints. |

## Online demo

[ReactViewRouter playground](https://gxlmyacc.github.io/react-view-router/) — available after the first GitHub Pages deployment.

[Deployment setup](https://github.com/gxlmyacc/react-view-router/blob/master/docs/github-pages.md).

## Runnable examples

| Example | Purpose | Entry |
|---|---|---|
| Standalone SSR | JSX, server/client separation, route-island hydration | [`demo_ssr`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_ssr/README.md) |
| Chrome 49 legacy | React 16, Webpack 4, ES5 bundle, real legacy-browser runner | [`fixtures/chrome49-legacy`](https://github.com/gxlmyacc/react-view-router/blob/master/fixtures/chrome49-legacy/README.md) |
| React Native | Memory routing, deep links, platform bridge | [`demo_native`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_native/README.md) |
| React 16 | React 16 integration | [`demo_react16`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react16/README.md) |
| React 17 | Legacy React integration | [`demo_react17`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react17/README.md) |
| React 18 | React 18 integration | [`demo_react18`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react18/README.md) |
| React 19 | React 19 `createRoot` integration | [`demo_react19`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react19/README.md) |
| Shared React app | JSX pages, nested lazy routes, named outlets, guard-order log | [`demo_react_shared`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react_shared/README.md) |

Examples separate pages, routes, runtime adapters, and server/client entry points so their structure can be reused as a project baseline.

## Current verification

```bash
npm test -- --runInBand
npm run build
npm run build-demo-site
```

These commands cover the library suites, package builds, runnable website, and static-site dependency checks without duplicating a quickly stale test count in the README. The Chrome 49 fixture additionally covers package consumption, ES5 parsing, modern Chromium behavior, and a Windows Chrome 49.0.2623.75 smoke test. Fixed-version verification does not imply coverage of every Chromium 49 embedding or ongoing security maintenance for legacy dependencies.
