# SSR and mixed runtimes

[English](./ssr.md) | [简体中文](./ssr_CN.md)

ReactViewRouter remains a browser-side routing manager. `hydrate` is a `RouteLazy` declaration saying that a route may reuse server output. It is not a global router constructor switch and does not guarantee that `hydrateRoot` will be called.

## Standalone SSR

```tsx
import ReactViewRouter, {
  RouteRuntimeAdapterProvider,
  RouterView,
  lazyImport,
} from 'react-view-router';
import { createModernStandaloneRouteSSRAdapter } from 'react-view-router/standalone-modern';

const routes = [
  { path: '/users', component: lazyImport(() => import('./Users'), { hydrate: true }) },
  { path: '/reports', component: lazyImport(() => import('./Reports'), { hydrate: true }) },
  { path: '/settings', component: lazyImport(() => import('./Settings')) },
];

const router = new ReactViewRouter({ mode: 'browser', routes });
const adapter = createModernStandaloneRouteSSRAdapter({ document });

createRoot(document.getElementById('app')).render(
  <RouteRuntimeAdapterProvider value={adapter}>
    <RouterView router={router} />
  </RouteRuntimeAdapterProvider>,
);
```

The SSR container is generated server output, not client route configuration. With `hydrate: true`, ReactViewRouter derives a stable `routeId` from `depth + path/name + viewName`. The standalone adapter uses that identity to find the matching server HTML automatically.

The server reuses the same route tree. It does not import every page or maintain separate `usersRoute` and `reportsRoute` objects:

```tsx
import {
  resolveHydratableRoutes,
  wrapHydratableRouteElement,
} from 'react-view-router';
import { routes } from '../router/routes';

const routeInfos = await resolveHydratableRoutes(routes, requestUrl);
const islands = routeInfos.map((routeInfo) => {
  const { component: Component, descriptor } = routeInfo;
  const element = wrapHydratableRouteElement(routeInfo, <Component />);
  return `
    <div data-react-viewssr-route="true"
      data-react-viewprotocol-version="${descriptor.protocolVersion}"
      data-react-viewroute-id="${escapeAttribute(descriptor.routeId)}"
    >${renderToString(element)}</div>
  `;
}).join('');
```

For forwarding or proxy decisions that do not need components:

- `collectHydratableRoutes(routes)` returns the hydration manifest for the complete route tree.
- `matchHydratableRoutes(routes, requestUrl)` returns only hydration entries matched by the request.
- Neither helper executes a `lazyImport` loader.

Generated HTML resembles:

```html
<div
  data-react-viewssr-route="true"
  data-react-viewprotocol-version="1"
  data-react-viewroute-id="0%7C%2Fusers%7Cdefault"
>...server-rendered Users...</div>
```

The encoded ID is generated output. Do not copy it into route configuration. `hydrate.container` is only an advanced selector override for unusual DOM ownership. There is no `hydrationKey` requirement. Named views and routes at different depths receive different identities automatically.

See the runnable demo's [route tree](../demo_ssr/src/router/routes.js), [server renderer](../demo_ssr/server/renderDocument.jsx), [client entry](../demo_ssr/src/client/index.jsx), and [English guide](../demo_ssr/README.md).

React 18+ uses `react-view-router/standalone-modern`. React 16.8/17 uses `react-view-router/standalone-legacy`. The core entry does not statically import `react-dom/client`.

If the descriptor or container is missing, the protocol version is incompatible, or no adapter accepts the route, optional hydration falls back to client rendering. `hydrate: { required: true }` reports the error to an Error Boundary; `onError` may record it.

## External SSR framework boundary

A framework that owns the page root, history, server payload, or Server Component protocol must continue to own page-level URLs and hydration. Do not apply the standalone adapter to framework-owned DOM, and do not mirror the framework's file routes into ReactViewRouter.

ReactViewRouter does not publish framework-specific adapters. The generic `RouteRuntimeAdapter` is a host extension protocol, not a compatibility promise for a framework or its version matrix.

## Context and nested RouterView

Independent hydration roots do not inherit an outer React Context, Suspense boundary, or Error Boundary. Use `hydrate.wrapElement` to bridge the router, runtime adapter, application providers, or an external store. Apply the same wrapper on the server with `wrapHydratableRouteElement`.

If a hydrated layout contains a child `RouterView` and a descendant can also hydrate, bridge both the router and `RouteRuntimeAdapterProvider`. Otherwise, the descendant cannot see the adapter and falls back to a duplicate client render. The mixed nested pattern is implemented in the [standalone SSR demo](../demo_ssr/README.md).

## React Native and Chrome 49

React Native has no DOM hydration. Optional hydration degrades to normal rendering; `required: true` reports a configuration error. Runtime core uses the internal `NavigationSignal` and does not require `AbortController`.

Legacy output continues to target Chrome 49. Application bundlers must transform dynamic `import()` into a compatible chunk loader. The [Chrome 49 fixture](../fixtures/chrome49-legacy/README.md) pins React 16.14 and Webpack 4.47, checks the packed package and ES5 syntax, and exercises guards, Promise-based `lazyImport`, push, and POP. It has passed on Windows Chrome 49.0.2623.75. This fixed result is not a security-maintenance promise for legacy browsers.
