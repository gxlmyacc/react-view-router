# ReactViewRouter standalone SSR route-island design

[English](./ssr-route-island-design.md) | [简体中文](./ssr-route-island-design_CN.md)

## 1. Scope

ReactViewRouter continues to run in the browser. SSR support solves one problem: when an application server has already emitted HTML for a ReactViewRouter route component, the client `RouteLazy` may reuse that output instead of clearing and rendering it again.

The design does not run `RouterView` as a Node page router and does not take over an external framework's file routing, Server Components, data protocol, HTTP status, caching, or root hydration.

## 2. Public declaration

```tsx
const routes = [{
  path: '/users',
  component: lazyImport(() => import('./Users'), { hydrate: true }),
}];
```

Without `hydrate`, the existing browser rendering path is unchanged. `hydrate: true` prefers server output and falls back to client rendering when optional requirements are unavailable. Advanced options include `required`, `mismatch`, `wrapElement`, `onError`, owner/runtime metadata, an explicit container, payload references, and checksums.

Only `required: true` turns a missing adapter, container, or compatible protocol into a hard error.

## 3. Component resolution

Hydration and browser rendering share the same `lazyImport` semantics:

```text
load(route, viewName, router, options)
  → component or Promise<component>
  → ES-module default unwrapping
  → RouteLazy updaters
  → resolved component
```

The loader function itself must never be mistaken for the React component it returns.

## 4. Responsibilities

| Module | Responsibility |
|---|---|
| `RouteLazy` | Loader, options, pending/resolved state, and updaters |
| Browser renderer | Ordinary client component rendering |
| `RouteRuntimeAdapter` | Generic host capability, activation, navigation, and release protocol |
| Standalone SSR adapter | Container discovery and React-version-specific hydration |
| ReactViewRouter | Matching, guards, navigation transactions, and adapter selection |

The core entry does not statically import `react-dom` or `react-dom/client`:

- React 18+: `react-view-router/standalone-modern`
- React 16.8/17: `react-view-router/standalone-legacy`

This keeps DOM runtimes out of normal SPA, React Native, and legacy bundles unless explicitly selected.

## 5. Route discovery and identity

`walkConfigRoutes` normalizes and traverses array and function-based children. It is the reusable tree primitive behind `collectHydratableRoutes`.

Server and client derive descriptors from the same route tree. The core builds a stable route ID from depth, path/name, and view name. The common server path is:

- `collectHydratableRoutes(routes)` for a complete manifest without loading components;
- `matchHydratableRoutes(routes, requestUrl)` for the current request without loading components;
- `resolveHydratableRoutes(routes, requestUrl)` to match and execute required loaders;
- `wrapHydratableRouteElement(routeInfo, element)` to apply the same route wrapper on the server.

Container protocol:

```html
<div
  data-react-viewssr-route="true"
  data-react-viewprotocol-version="1"
  data-react-viewroute-id="0%7C%2Fusers%7Cdefault"
>...server-rendered Users...</div>
```

Applications do not configure a hydration key or manually compose route IDs. `hydrate.container` is an advanced override used only when automatic identity cannot locate an application-owned container.

## 6. Navigation order

```text
target location
  → route matching
  → beforeEach / route guards
  → RouteLazy resolution
  → runtime descriptor
  → adapter capability check
  → hydrate or client render
  → afterEach
```

Navigation transactions use the internal `NavigationSignal` for cancellation and race handling. They do not require an unshimmable `AbortController` implementation.

Applications may register other host adapters through the generic runtime gateway. ReactViewRouter does not ship external-framework adapters or promise their navigation/history semantics.

## 7. Context and multiple roots

React roots do not automatically share Context, Suspense, Error Boundaries, or lifecycle ownership. A standalone island must reinject required providers through `wrapElement` or use a store outside React roots.

For a hydrated layout containing browser child routes and a deeper hydrated leaf, bridge both the router and runtime adapter. The layout and leaf are non-overlapping sibling islands; the intermediate client layout renders inside the hydrated layout root. The runnable demo verifies both:

```text
hydrated layout → client layout → client leaf
hydrated layout → client layout → hydrated leaf
```

## 8. Fallbacks

| Condition | Default behavior |
|---|---|
| No server container | Client render |
| Descriptor protocol mismatch | Client render |
| Adapter rejects the route | Client render |
| Hydration throws | Call `onError`, then apply mismatch policy |
| `required: true` cannot hydrate | Throw to an Error Boundary |
| React Native | Do not load a DOM adapter; render normally |

Mismatch policies are `client-render`, `preserve`, and `throw`.

## 9. External framework boundary

When a host owns the page root, URL router, server payload, or Server Component protocol:

- do not hydrate host-owned DOM through the standalone adapter;
- do not scan or copy the host route table;
- do not intercept host Link, redirect, action, or POP behavior;
- use ReactViewRouter inside a Client Component as an ordinary browser/memory router.

This prevents two routers from competing for history and avoids promises over transactions ReactViewRouter cannot own completely.

## 10. Compatibility

- Core and the legacy standalone adapter target Chrome 49 syntax.
- Dynamic `import()` must be transformed by the application bundler.
- React Native uses only the core memory router.
- Modern standalone hydration requires React 18+ `hydrateRoot`.
- Legacy standalone hydration uses React 16.8/17 `hydrate`.

## 11. Verification gates

Related changes must verify:

1. Full TypeScript/Babel/library build;
2. Complete Jest suite with no coverage regression;
3. Standalone SSR client and server bundles;
4. React 16/Webpack 4/ES5 fixture;
5. Chrome 49 smoke test;
6. React Native memory/deep-link behavior;
7. Package exports and tarball contents.

See the runnable [standalone SSR demo](../demo_ssr/README.md) and the focused [SSR guide](./ssr.md).
