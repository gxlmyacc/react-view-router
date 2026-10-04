# Standalone SSR route-island demo

[English](./README.md) | [简体中文](./README_CN.md)

This example is organized by real application responsibilities. Keep these boundaries instead of merging everything into an entry file.

```text
demo_ssr/
├─ src/
│  ├─ client/index.jsx                     # Browser composition root
│  ├─ components/RouteNavigation.jsx       # Regular JSX navigation UI
│  ├─ pages/*.jsx                          # Isomorphic JSX pages
│  ├─ router/
│  │  ├─ index.js                          # Browser-mode router singleton
│  │  └─ routes.js                         # lazyImport and hydrate declarations
│  └─ App.jsx                              # RouterView and layout
├─ server/
│  ├─ index.js                             # HTTP composition root
│  ├─ renderDocument.jsx                   # SSR island renderer
│  └─ serveClientAsset.js                  # Static asset responsibility
└─ webpack.config.js                       # Client/server builds
```

## Run

```bash
npm install
npm start
```

Open `http://localhost:3000/ssr`. `/ssr` and `/reports` are independent SSR routes, while `/client` is a regular browser route. All three use the same browser-mode ReactViewRouter.

## Add an SSR page

Only edit `src/router/routes.js`:

```jsx
let routeRuntimeAdapter = null;

export function setRouteRuntimeAdapter(adapter) {
  routeRuntimeAdapter = adapter;
}

function provideRouteRuntime(element, { router }) {
  const routeElement = React.cloneElement(element, { router });
  if (!routeRuntimeAdapter) return routeElement;
  return (
    <RouteRuntimeAdapterProvider value={routeRuntimeAdapter}>
      {routeElement}
    </RouteRuntimeAdapterProvider>
  );
}

const routes = [
  { path: '/ssr', component: lazyImport(() => import('../pages/SSRPage'), { hydrate: true }) },
  { path: '/reports', component: lazyImport(() => import('../pages/ReportsPage'), { hydrate: true }) },
  { path: '/client', component: lazyImport(() => import('../pages/ClientPage')) },
  {
    path: '/workspace',
    component: lazyImport(() => import('../pages/WorkspacePage'), {
      hydrate: { wrapElement: provideRouteRuntime },
    }),
    children: [{
      path: 'overview',                         // client layout
      component: lazyImport(() => import('../pages/OverviewPage')),
      children: [
        { path: 'tools', component: lazyImport(() => import('../pages/LocalToolsPage')) },
        { path: 'audit', component: lazyImport(() => import('../pages/AuditPage'), { hydrate: true }) },
      ],
    }],
  },
];
```

`server/renderDocument.jsx` neither knows the page count nor imports pages individually. `resolveHydratableRoutes(routes, requestUrl)` matches the request and loads the matching SSR pages. A server proxy that only needs route metadata can use `collectHydratableRoutes(routes)` or `matchHydratableRoutes(routes, requestUrl)`; neither loads page components.

The `/workspace/overview/tools` branch is `hydrated layout → client layout → client leaf` and emits only the workspace SSR island. `/workspace/overview/audit` is `hydrated layout → client layout → hydrated leaf` and emits two non-overlapping sibling islands for workspace and audit. The intermediate client layout always renders through a browser RouterView.

Workspace contains a child `RouterView` inside an independent hydration root, so `hydrate.wrapElement` explicitly injects the current environment's router and `RouteRuntimeAdapterProvider`. The latter lets the deeper audit hydration renderer find the same adapter across roots instead of falling back to a duplicate client render. `renderDocument.jsx` applies the same wrapper through `wrapHydratableRouteElement`, keeping server and client trees aligned. Ordinary SSR leaves still need only `{ hydrate: true }`.

After creating the adapter, the client entry calls `setRouteRuntimeAdapter(runtimeAdapter)` before rendering App. Routes, router, and the client entry consistently use ESM `import/export`; mixing ESM imports and CommonJS requires can make a bundler select both package-export conditions and duplicate internal Context instances.

## What the SSR container means

The SSR container shown in the documentation is generated server output, not a client route option. The default flow has only three steps:

1. `routes.js` declares the page with `{ hydrate: true }`—no selector is required.
2. `renderDocument.jsx` discovers hydration routes matching the current URL, generates their identities, and emits their server containers.
3. The browser computes the same identity from the matched route, finds the container automatically, and hydrates it.

The generated browser response looks like this:

```html
<div
  data-react-viewssr-route="true"
  data-react-viewprotocol-version="1"
  data-react-viewroute-id="0%7C%2Fssr%7Cdefault"
>...server-rendered page...</div>
```

`0%7C%2Fssr%7Cdefault` is the encoded result of `depth | path | viewName`. It is generated output, not a value to copy into route configuration. `hydrate.container` exists only as an advanced override for unusual DOM layouts.

## Recommended migration order

1. Export one route tree shared by server and client; do not export every SSR route separately.
2. Create and export the browser router directly from `router/index.js` unless the application genuinely needs multiple isolated instances.
3. Add `hydrate: true` only to pages that can reuse server output.
4. Create the standalone adapter directly in the client entry and inject it through the Provider.
5. Let the server renderer mark only standalone islands it owns. Never mark a framework-owned root as standalone.

## Avoid

- Reading `window` or `document` from the route module.
- Calling `hydrateRoot` from a page component.
- Configuring `hydrate.container` when the default generated route identity is sufficient.
- Applying the standalone adapter to DOM or a root owned by another SSR framework.
- Assuming a separate root inherits outer React Context. Bridge providers or stores explicitly with `hydrate.wrapElement`.

This demo uses the React 18 modern adapter. With React 16.8/17, import the runtime factory from `react-view-router/standalone-legacy`; the remaining structure stays the same.
