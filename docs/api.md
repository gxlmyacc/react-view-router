# ReactViewRouter API reference

[English](./api.md) | [简体中文](./api_CN.md)

This document describes the public browser-router API and the standalone SSR additions. Start with the root [README](../README.md) for installation and a minimal application.

## Documentation

- [SSR, runtime adapters, and fallbacks](./ssr.md)
- [Server Components and client-only hooks](./server-components.md)
- [Standalone SSR route-island design](./ssr-route-island-design.md)

## Installation

```bash
npm install react-view-router
```

The core peer baseline is React 16.8 or newer.

## Basic use

### Navigation loop protection

Each router counts navigation attempts by pathname. By default, the tenth attempt at the same path within a rolling 1000ms window enters the target page and stops configuration and guard redirects in that navigation. Query parameters share a counter; concrete dynamic path values do not. Initial navigation, push/replace, and back/forward participate, including redirect attempts that never commit a page.

```ts
const router = new ReactViewRouter({
  navigationLoopProtection: { windowMs: 1000, maxVisits: 10 },
});
// Set navigationLoopProtection: false to disable protection.
router.onError((error) => {
  if ('code' in error && error.code === 'NAVIGATION_LOOP_DETECTED') {
    console.error(error);
  }
});
```

`NavigationLoopProtectionOptions.windowMs` must be positive and finite; `maxVisits` must be a positive integer. Omitted fields use the defaults above. Invalid configuration throws during initialization. The exported `NavigationLoopError` type contains `code: 'NAVIGATION_LOOP_DETECTED'`, `pathname`, `windowMs`, and `maxVisits`.

For an A→B→C→A cycle, reaching the threshold at A commits A's URL and renders its configured component. A redirect-only route without a component has no page content to render. After entry, `onError` reports the loop; the navigation promise completes normally and abort callbacks are not invoked. Guards still run and can reject entry with `false` or an error. Only the navigation snapshot changes; configured redirects remain intact.

All counters are cleared immediately so the next navigation can proceed. stop/start also clears counters. Navigation subsequently started by component mount effects, afterEach, or other business code is a new request and remains allowed.

This frequency heuristic can also trigger on legitimate rapid visits. It does not analyze repeated sequences or stop loops composed solely of new component-effect navigations, or full-page/external navigation that bypasses the router. A newly started loop is counted again. The “Index and redirect” example includes an A→B→C→A loop, a visible A page, and a recovery button.

```tsx
import ReactViewRouter, { RouterLink, RouterView, lazyImport } from 'react-view-router';

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    component: lazyImport(() => import('./Home')),
    children: [
      { path: 'details/:id', component: lazyImport(() => import('./Details')) },
    ],
  },
];

const router = new ReactViewRouter({ mode: 'browser', routes });

export default function App() {
  return (
    <>
      <RouterLink router={router} to="/home">Home</RouterLink>
      <RouterView router={router} />
    </>
  );
}
```

Nested route components render another `<RouterView />`. The child view discovers its parent view and router through Context.

## Route configuration

`UserConfigRoute` supports:

| Option | Description |
|---|---|
| `path` | URL pattern. Child paths may be relative. |
| `name` | Unique route name/alias within one router. Named paths can be referenced as `[route-name]/child`. |
| `component` | Default route component. |
| `components` | Named-view components; `component` corresponds to `components.default`. |
| `children` | Child route array or a function returning child routes. |
| `exact` | Require an exact pathname match. |
| `redirect` | String, location object, or redirect function. |
| `index` | Default sibling route path or resolver function. `:first` selects the first visible non-index sibling. A concrete value can match a dynamic sibling such as `:reportId`; static siblings take precedence. |
| `abort` | Abort declaration or abort resolver. |
| `meta` | Application metadata. Function values are exposed through computed metadata. |
| `defaultProps` | Static props or a props factory applied when rendering the route. |
| `props` | Alias of `paramsProps`. Maps route params to component props. |
| `paramsProps` | Boolean, key list, type map, or named-view map for route params. |
| `queryProps` | Boolean, key list, type map, or named-view map for query values. |
| `keepAlive` | Boolean or predicate controlling route-view preservation. |
| `enableRef` | Enable a route component ref, optionally through a predicate. |
| `beforeLeave` | Per-route leave guard. |
| `beforeResolve` | Per-route resolve guard. |
| `afterLeave` | Per-route post-leave hook. |
| `beforeUpdate` | Per-route update guard. |

Normalized `ConfigRoute` values additionally contain absolute `path`, original `subpath`, `depth`, normalized `components`, normalized/static-or-function `children`, a parent link, `meta`, and `_normalized` source configuration.

An index keeps the browser history entry and URL unchanged while selecting the route to render. The selected index child is still appended to `router.currentRoute.matched`; therefore, the child component receives the same matched route record whether it was selected by a complete URL or by `index`, and does not need a separate index-only rendering branch. Dynamic paths receive the concrete index value:

```tsx
const routes = [
  { path: '/', index: () => ({ path: 'monthly', query: { view: 'summary' } }) },
  { path: ':reportId', component: ReportPage },
];
// Opening the parent route renders ReportPage with reportId === 'monthly'.
```

Use `index: ':first'` when the default route should follow menu visibility. It skips routes whose `meta.visible` is `false`, as well as index placeholder routes, and selects the first remaining sibling.

`queryProps` maps URL query values to route-component props independently from path params. It supports all of the following forms:

```tsx
{ path: '/search', component: SearchPage, queryProps: true }
{ path: '/search', component: SearchPage, queryProps: ['keyword', 'page'] }
{ path: '/search', component: SearchPage, queryProps: { keyword: String, page: Number } }
{ path: '/search', components: { default: SearchPage, sidebar: Filters }, queryProps: {
  default: { keyword: String, page: Number },
  sidebar: ['category'],
} }
```

Use conversion maps when components should receive typed values such as `page: number` instead of parsing the query string themselves.

## RouteLazy and hydration

```ts
type LazyImportMethod<P = any> = (
  route: ConfigRoute,
  viewName: string,
  router: ReactViewRouter,
  options: RouteLazyOptions,
) => React.ComponentType<P> | Promise<React.ComponentType<P>>;

function lazyImport<P>(
  importMethod: LazyImportMethod<P>,
  options?: RouteLazyOptions,
): RouteLazy<P>;
```

The loader result—not the loader itself—is the component. Promise results and ES-module `default` exports are unwrapped. Concurrent resolution shares one pending Promise.

`options.hydrate` may be `true` or an object:

```ts
interface RouteLazyHydrateOptions {
  required?: boolean;
  mismatch?: 'client-render' | 'preserve' | 'throw';
  owner?: 'browser' | 'standalone-ssr' | 'framework';
  runtime?: string;
  container?: string;
  payloadRef?: string;
  checksum?: string;
  wrapElement?: (element: React.ReactNode, info: RouteHydrationInfo) => React.ReactNode;
  onError?: (error: Error, info: RouteHydrationInfo) => void;
}
```

See [SSR and mixed runtimes](./ssr.md) before using hydration.

## RouterView

Important props:

| Prop | Description |
|---|---|
| `router` | Router instance. Required for a root view; nested views inherit it. |
| `name` | Named view, defaulting to `default`. |
| `depth` | Explicit matched-route depth. Normally inferred for nested views. |
| `filter` | Filters candidate route configurations. |
| `fallback` | React element or function used while resolving. |
| `container` | Custom route content container. |
| `viewPresenter` | React component wrapping the rendered view; receives `{ children, route, router, view }`. Use it for presentation effects without taking ownership of the route component. |
| `beforeEach` / `afterEach` | View-level navigation hooks. |
| `keepAlive` | Boolean or predicate for view preservation. |
| `beforeActivate` | Predicate before reactivating a preserved view. |
| `onRouteChange` | Called when the view's matched route changes. |

`fallback` functions receive `{ parentRoute, currentRoute, toRoute, inited, resolving, depth, router, view }`.

`viewPresenter` is rendered after `container` and KeepAlive. Keep its component identity stable across navigation so that it can manage outgoing visuals. The transition and drawer entries use this same presentation layer; the drawer's low-level `Drawer` remains independent of routing.

### Saving and restoring positions

`RouterView` accepts `getContainerRef: () => TContainer | null`, with `HTMLElement` as the default container type. Route `meta.savePosition` supports `true`, a container-scoped selector, or a target-returning function supplied by a metadata computation; the function receives `{ to, from, type: 'leave' | 'enter' }`. PUSH saves before the view updates; POP restores after the new view commits. Initial mounts, canceled navigation, and prop-only updates do not trigger position operations.

`onSavePosition(container, { to, from })` returns `RouteSavedPosition` and is used when metadata does not enable saving. `onScrollToPosition(container, position)` overrides default restoration. Both belong to `RouterViewProps<TContainer>` and are inherited by Transition. Records include zero offsets, are isolated by basename, view name, depth, and route path, and are consumed after successful restoration.

Optional `renderUtils` methods are `getPosition(container)`, `setPosition(container, position)`, `queryPositionTarget(container, selector)`, and `getSessionStorage()`. The storage getter returns an object with `getItem` and `setItem`, or `null`; it uses the existing `_REACT_VIEW_ROUTER_TRANSITION_POSITIONS_` key. Missing or unavailable storage falls back to a router-local cache. Core provides no DOM operation fallback. Missing containers, getters, or required methods skip the operation and emit a deduplicated warning. Custom callbacks can replace the corresponding read/write methods.

```tsx
import React from 'react';
import ReactViewRouter, { RouterView } from 'react-view-router';
import renderUtils from 'react-view-router/dom';

const router = new ReactViewRouter({
  routes: [{ path: '/home', component: Home, meta: { savePosition: true } }],
  renderUtils,
});
function App() {
  const container = React.useRef<HTMLDivElement>(null);
  return <div ref={container} style={{ height: 400, overflow: 'auto' }}>
    <RouterView router={router} getContainerRef={() => container.current} />
  </div>;
}
```

Transition supplies its content container automatically, including for `transition="none"`. An explicit `getContainerRef` takes precedence. Existing Transition applications must configure the updated `react-view-router/dom` renderUtils or supply equivalent custom methods. Server rendering performs no position operations.

Non-DOM hosts provide their own handles and operations without emulating DOM scroll properties:

```ts
import type { ReactRenderUtils, RouterViewProps } from 'react-view-router';
type HostContainer = { offset: { x: number; y: number } };
// hostRenderUtils and hostContainer come from the platform's rendering integration.
const utils: ReactRenderUtils<HostContainer> = {
  ...hostRenderUtils,
  getPosition: (container) => ({ ...container.offset }),
  setPosition: (container, position) => {
    container.offset = { x: position.x || 0, y: position.y || 0 };
  },
  getSessionStorage: () => hostSessionStorage, // May also return null.
};
const viewProps: RouterViewProps<HostContainer> = {
  getContainerRef: () => hostContainer,
};
// Pass utils to router.options.renderUtils and viewProps to RouterView.
```

## RouterLink

```tsx
<RouterLink router={router} to="/admin">Admin</RouterLink>
<RouterLink to={{ path: '/settings', query: { tab: 'profile' } }} replace>
  Settings
</RouterLink>
```

Important props:

| Prop | Description |
|---|---|
| `router` | Explicit router; otherwise discovered from the view hierarchy. |
| `to` | String or route-location object passed to `push`/`replace`. |
| `replace` | Use `router.replace` instead of `router.push`. |
| `append` | Append a relative target to the current path. |
| `tag` | Rendered element type. |
| `activeClass` | Class for an active inclusive match. |
| `exact` | Require an exact active match. |
| `exactActiveClass` | Class for an exact match. |
| `event` | React event name that triggers navigation; defaults to click. |
| `onRouteChange` | Called on route changes. |
| `onRouteActive` / `onRouteInactive` | Called when active state changes. |

Route locations may contain `path`, `query`, `params`, `append`, `absolute`, `delta`, `backIfVisited`, and `pendingIfNotPrepared`.

## ReactViewRouter constructor

```ts
const router = new ReactViewRouter(options);
```

Important options:

| Option | Description |
|---|---|
| `name` | Router instance name. |
| `basename` | Base path. |
| `mode` | `browser`, `hash`, `memory`, or a History object. |
| `hashType` | `slash` or `noslash`. |
| `pathname` | Initial pathname for internally created memory history. |
| `history` | Explicit history, useful for linked parent/child memory routers. |
| `routes` | Route configuration tree. |
| `queryProps` | Query conversion functions by key. |
| `manual` | Do not call `start` from the constructor. |
| `rememberInitialRoute` | Recover the original initial route from session storage. |
| `holdInitialQueryProps` | Merge initial query values into later navigations. |
| `keepAlive` | Global keep-alive setting. |
| `renderUtils` | Host operations for keep-alive and position support. |
| `routeRuntimeAdapters` | Optional runtime adapters. |

SSR is not a constructor mode. Hydration remains a per-`RouteLazy` declaration.

## Router state

Common instance properties include:

- `id`, `name`, `version`
- `mode`, `basename`, `basenameNoSlash`
- `routes`, `routeNameMap`
- `currentRoute`, `initialRoute`, `prevRoute`, `pendingRoute`
- `parent`, `top`, `children`, `viewRoot`
- `stacks`
- `isRunning`, `isPrepared`, `isHistoryCreator`
- `isBrowserMode`, `isHashMode`, `isMemoryMode`

`currentRoute` contains `action`, `url`, `path`, `fullPath`, `search`, `query`, `params`, `matched`, `matchedPath`, `meta`, `metaComputed`, `state`, redirect information, completion state, and navigation callbacks.

Each `stacks` item contains `index`, `pathname`, `search`, `timestamp`, parsed `query`, and an optional `navigationKey`. In browsers that implement the Navigation API, the key identifies the corresponding top-level history entry without counting history entries created by descendant iframes. Older browsers and stacks restored without a key retain the legacy index behavior.

`history.version` identifies the neutral shared history-object protocol, not the ReactViewRouter package version. The current value is exported as `HISTORY_PROTOCOL_VERSION`. A missing value is treated as the legacy v1 protocol. When a reusable legacy history is encountered, the current implementation upgrades its interceptor coordinator in place; the history reference, stacks, listeners, and registered router interceptors remain shared. Router-specific runtime methods are always feature-detected so older and newer Router instances can participate in the same transaction safely.

Each `MatchedRoute` contains the normalized configuration, matched params/path, route-level state and metadata, component/view instances, and depth information.

## Lifecycle and route registration

| Method | Parameters | Returns | Behavior |
|---|---|---|---|
| `start(options?, isInit?)` | Optional router options and initialization flag | `void` | Initializes history listening and the current route. It is automatic unless `manual: true` is used. |
| `stop()` | — | `void` | Releases listeners and stops responding to history events. |
| `use(options)` | Router extension options | `void` | Applies routes, query conversion, and compatibility configuration. |
| `addRoutes(routes, parentRoute?)` | Route array and optional parent | `void` | Normalizes and adds or replaces root or child configurations. |

Route registration and lifecycle changes notify the corresponding plugin hooks.

## Navigation guards

```ts
router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !isAuthenticated()) next('/login');
  else next();
});
```

`beforeEach` registers the guard without returning an unsubscribe function. Keep the function reference if you need to replace the same guard later. `beforeResolve`, `afterUpdate`, `afterEach`, and `onError` return unsubscribe functions.

Guard APIs include:

| API | Callback | Can change navigation? | Purpose |
|---|---|---|---|
| `beforeEach(guard)` | `(to, from, next)` | Yes | Runs before route/component resolution. |
| `beforeResolve(guard)` | `(to, from, next)` | Yes | Runs after lazy components and component guards resolve, before commit. |
| `afterEach(hook)` | `(to, from)` | No | Observes a successfully committed navigation. |
| `onError(handler)` | `(error) => void` | No | Observes navigation and resolution errors. |
| Route/component guards | Enter, leave, update, resolve callbacks | Depends on phase | Applies policy at a route or rendered-component boundary. |

`next()` continues, `next(false)` aborts, `next(location)` redirects, and `next(error)` terminates with an error. A guard-time `router.push`, `router.replace`, or `router.redirect` resolves the same pending transaction. The outer guard may still call `next()` afterwards, so shared interception helpers do not need every caller to thread `next` through multiple method layers. If the helper kept the same normalized `fullPath`, a later `next(callback)` registers that completion callback; if it selected a different target, the original target callback is deliberately ignored.

Navigation Promises describe the transaction, not exact-path equality. Declarative redirects, `next(location)`, and guard-time navigation decisions remain in the same transaction, so the originating Promise and every guard-time navigation Promise resolve when the final target commits. They reject together if the final target aborts or fails. A later independent navigation is a different transaction: it cancels the pending one, whose Promise rejects. `next(callback)` is narrower than the Promise—it runs only when its original target actually enters.

For example, `/a → /a/b` and `/a?version=1 → /a?version=2` both change `fullPath` but remain successful redirects, so their transaction Promises resolve. They are not same-target cases; they cover redirect chains whose final target differs from the original target. The latter does not register a late callback for the obsolete `version=1` target. Only the exact-target check used by a late `next(callback)` compares normalized pathname and query; history state and matched-config identity are intentionally outside that check for now.

`beforeResolve` runs after component guards and lazy components resolve but before navigation commits. `afterEach` cannot alter the navigation.

### Shared-history guard transaction

Multiple mounted routers can share one history while using different `basename` values. A navigation is committed only after every affected router allows it. The host router, an active basename router being left, and an inactive basename router being entered all participate in the same transaction in registration order. A rejection from any participant prevents the history commit, leaves every router's `currentRoute` unchanged, and skips their `afterEach` hooks.

An inactive basename `RouterView` is initialized with an empty route so that it is ready to guard the first navigation into its scope. When navigation successfully leaves its scope, its route becomes empty. A router created only after the target React page has committed cannot veto that already committed transition; mount shared-history routers in a persistent application shell when first-entry guards must be transactional.

## Programmatic navigation

```ts
router.push('/home');
router.replace({ path: '/users/:id', params: { id: '42' } });
router.redirect({ path: '/login' });
router.go(-1);
router.back();
router.forward();
```

`push`, `replace`, and `redirect` accept strings or location objects. They support query/params, relative paths, route names, basename bypass, history deltas, previously visited entries, and completion/abort callbacks. When callbacks are omitted and Promise is available, navigation returns a Promise.

| Outcome | Originating Promise |
| --- | --- |
| Original target commits | resolves |
| Same transaction redirects and its final target commits | resolves |
| `next(false)`, error, redirect target abort, or redirect loop | rejects |
| A later independent navigation supersedes this transaction | rejects |
| A duplicate navigation to the already-current route | keeps the existing duplicate-navigation abort behavior |

`router.push({ path, state })` stores `state` on the new target history entry; `router.replace({ path, state })` stores it on the replacement entry. After navigation completes, the target value is available from both `router.currentRoute.state` and the target leaf `MatchedRoute.state`. Back/forward navigation restores the state belonging to that history entry. ReactViewRouter namespaces the physical history state internally so multiple routes and routers can share the same history safely. A router with `basename` stores and reads route state only by its basename-local matched URL (for example, `/result`, not `/module/result`); it does not guess legacy full-path keys because that can associate state with the wrong route.

For a location with `backIfVisited`, a browser/hash router uses `navigation.traverseTo(navigationKey)` when the target entry still exists in the browser Navigation API. This targets the previously visited top-level route even if descendant iframe navigations were inserted between routes. Memory routers never read or invoke the browser Navigation API. If the API or key is unavailable, it falls back to the existing `go(stack)` index calculation. This includes pages whose shared history was created by an older ReactViewRouter version: those stacks have no `navigationKey`, even in a modern browser, and therefore retain the legacy behavior. If an older version later rewrites the shared session cache without the new field, the next navigation also degrades safely. `back()` and `go(number)` keep their native browser-history semantics.

External absolute URLs use full-page navigation.

### history@4 / React Router v4-v5 adapter

Use the adapter when a micro-frontend expects a `history@4.10.1` object but must participate in the host ReactViewRouter history and guard transaction:

```tsx
import { Router } from 'react-router';

const history4 = vuelikeRouter.history.createHistory4({
  basename: '/middleware',
  getUserConfirmation(message, callback) {
    callback(window.confirm(message));
  },
});

export function MiddlewareApp() {
  return (
    <Router history={history4}>
      <MiddlewareRoutes />
    </Router>
  );
}
```

The adapter follows history@4 behavior for decoded/stable `location`, initial and subsequent `action`, basename encoding, relative and partial destinations, state, `createHref`, `push`, `replace`, `go`, `goBack`, `goForward`, `listen/unlisten`, and the single active `block/unblock` prompt. Navigation still commits through the owner ReactViewRouter history, so React Router transitions and ReactViewRouter guards do not create competing browser-history instances.

## Matching and route helpers

```ts
router.createRoute(to, options?);
router.cloneMatchedRoute(source, match?);
router.getMatched(to, from?, parent?);
router.getMatchedPath(path?);
router.getMatchedComponents(to, from?, parent?);
router.getMatchedViews(to, from?, parent?);
router.nameToPath(name, options?);
const unregister = router.resolveRouteName(resolver);
```

| Method | Returns | Purpose |
|---|---|---|
| `createRoute(to, options?)` | `Route` | Converts a string/location into the same shape as `currentRoute` and resolves its matches. |
| `cloneMatchedRoute(source, match?)` | `MatchedRoute` | Creates a new URL/params/state snapshot while preserving mounted component instances, RouterView instances, and bound guards. Pass a new match when cloning another dynamic match. |
| `getMatched(to, from?, parent?)` | `MatchedRoute[]` | Returns the nested matched route array. |
| `getMatchedPath(path?)` | `string` | Returns the currently matched portion of a pathname. |
| `getMatchedComponents(...)` | Component array | Returns components from matched route records. |
| `getMatchedViews(...)` | RouterView array | Returns mounted views associated with matched route records. |
| `nameToPath(name, options?)` | `string` | Resolves a named route and can search parent routers for an absolute lookup. |
| `resolveRouteName(resolver)` | Unregister function | Registers a fallback named-route resolver. |

## Query and route state

```ts
router.replaceQuery('tab', 'summary');
router.replaceQuery({ tab: 'summary', page: 2 });
router.replaceState({ scrollTop: 120 });
```

`replaceQuery` updates the current query and browser/hash URL when appropriate. `replaceState` updates the current or specified matched route state so it can be recovered after back/forward navigation.

The exported `parseQuery` and `stringifyQuery` functions implement the defaults. Query parsers may be overridden in router configuration.

## Plugins: `ReactViewRoutePlugin`

```ts
const uninstall = router.plugin({
  name: 'analytics',
  onRouteChange(route, previousRoute) {
    track(route.fullPath, previousRoute?.fullPath);
  },
});
```

Registering the same plugin name replaces the previous plugin. `plugin` returns an uninstall function. Extension points include install/uninstall, start/stop, route-tree changes, navigation dispatch, route enter/leave, route changes, metadata changes, lazy component resolution, route walking, guard discovery, aborts, and view containers.

Hooks run in registration order with `this` bound to the plugin. A hook's defined return value is passed to the next plugin as `prevRes`; returning `undefined` preserves the previous result. If a hook throws, later plugins are skipped and the error message is prefixed with the plugin name and event. `onStart` runs when listening starts, while `onStop` runs only when an active router is restarted or explicitly stopped.

`onRouteGo` receives the normalized `RouteHistoryLocation`. Returning `false` takes ownership of dispatch, so the plugin must call the supplied completion or abort callback exactly once. `onRouteAbort` describes a guard-pipeline abort; it is not a notification for every invalid method argument. See the [built-in guard plugin proposal](./guard-plugin-design.md) for the deliberately deferred guard-pipeline extraction.

## Route tree utilities

```ts
normalizeRoutes(routes, parent?);
normalizeRoute(route, parent?);
normalizeRoutePath(path, route?, append?, basename?);
normalizeLocation(to, options?);
matchPath(pathname, options);
matchRoutes(routes, to, parent?, options?);
```

Use `walkConfigRoutes` for reusable complete-tree traversal:

```ts
const stopped = walkConfigRoutes(routes, (route, index, siblings) => {
  inspect(route);
  return shouldStop(route);
});
```

It normalizes input, traverses static and function-based children, and stops the complete walk when the visitor returns `true`. The legacy `walkRoutes` export remains available for compatibility.

Other useful exports include `resolveRedirect`, `resolveAbort`, `resolveIndex`, `readRouteMeta`, `configRouteProps`, `createUserConfigRoute`, and `createUserConfigRoutes`.

## Server hydration helpers

```ts
collectHydratableRoutes(routes): HydratableRouteInfo[];
matchHydratableRoutes(routes, requestUrl): MatchedHydratableRouteInfo[];
resolveHydratableRoutes(routes, requestUrl): Promise<ResolvedHydratableRouteInfo[]>;
wrapHydratableRouteElement(routeInfo, element): React.ReactNode;
```

- Collection and matching do not execute component loaders.
- Resolution uses ReactViewRouter's own memory-safe matcher and `RouteLazy` resolution semantics.
- Results include normalized route, view name, lazy object, and runtime descriptor.
- Matched/resolved results include the matched route and temporary server matcher router.
- Resolved results include the final component.
- The wrapper helper lets the host create JSX with its own React version before applying `hydrate.wrapElement`.

## Runtime adapters

The root entry exports the platform-neutral contracts:

- `RouteRuntimeDescriptor`
- `RouteRuntimeContext`
- `RouteRuntimeAdapter`
- `NavigationTransaction` and `NavigationSignal`
- `createRouteRuntimeDescriptor`
- `resolveRuntimeCompatibility`
- `selectRouteRuntimeAdapter`
- `RouteRuntimeAdapterContext` and `RouteRuntimeAdapterProvider`

React-specific standalone factories are explicit subpath imports:

```ts
import { createModernStandaloneRouteSSRAdapter } from 'react-view-router/standalone-modern';
import { createLegacyStandaloneRouteSSRAdapter } from 'react-view-router/standalone-legacy';
```

## Route component guards

```tsx
export default withRouteGuards(Page, {
  beforeRouteEnter(to, from, next) {
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  beforeRouteUpdate(to, from) {},
  beforeRouteResolve(to, from) {},
  afterRouteLeave(to, from) {},
});
```

Function components may expose guards through `useRouteGuardsRef` and `React.forwardRef`. Do not combine `useRouteGuardsRef` with a separate `useImperativeHandle` for the same ref.

## HOCs

| HOC | Injected props | Options / behavior |
|---|---|---|
| `withRouter(Component, { withRoute? })` | `router`, optionally `route` | Uses the nearest RouterView context. |
| `withRoute(Component, { withRouter? })` | `route`, optionally `router` | Subscribes the wrapper to route changes. |
| `withMatchedRoute(Component, { withMatchedRouteIndex? })` | `matchedRoute`, optionally `matchedRouteIndex` | Reads the match at the current view depth. |
| `withMatchedRouteIndex(Component, { withMatchedRoute? })` | `matchedRouteIndex`, optionally `matchedRoute` | Exposes the current matched depth. |
| `withRouterView(Component)` | `routerView` | Exposes the nearest RouterView instance. |

## Hooks

All hooks in this section are Client Component/browser hooks. See [Server Components and hooks](./server-components.md).

### Core access

| Hook | Parameters | Returns |
|---|---|---|
| `useRouter(defaultRouter?)` | Optional fallback router | Nearest `ReactViewRouter` instance. |
| `useManualRouter(router, options)` | Manual router and runtime options | Router plus a stable `start` function. |
| `useRoute(defaultRouter?, options?)` | Optional router and watch options | Current route snapshot. |
| `useMatchedRoute(defaultRouter?, options?)` | Optional router, offset, and watch options | Matched route at the selected view depth. |
| `useMatchedRouteIndex(matchedOffset?)` | Optional depth offset | Current matched-route index. |
| `useMatchedRouteAndIndex(...)` | Router/watch/depth options | Matched route and its index. |
| `useRouterView()` | — | Nearest RouterView instance. |
| `useRouterViewEvent(...)` | Event callbacks and dependencies | Registers view-scoped lifecycle callbacks. |

`useRoute` options control watching, delayed notification, and same-path suppression. Matched-route hooks can offset from the current view depth. Watching is opt-in: pass `{ watch: true }` when a mounted component must react to a new dynamic param, query, state, or matched snapshot on the same route configuration.

### Route data

| Hook | Returns / behavior |
|---|---|
| `useRouteMeta(keyOrKeys)` | Metadata plus a setter. For one key, use `setMeta(value)`; for multiple keys, use `setMeta({ key: value })`. The optional second setter argument writes the complete supplied object instead of filtering declared keys. |
| `useRouteMetaChanged(router, onChange, dependentKeys?)` | Registers a metadata-change observer, optionally limited to selected keys. |
| `useRouteState(...)` | State stored on the active history entry and matched route. |
| `useRouteParams(...)` | Dynamic path params from the selected matched route. |
| `useRouteQuery(...)` | Parsed query values from the current route. |

### Guards and lifecycle

| Hook | Purpose |
|---|---|
| `useRouteGuardsRef(ref, guards, deps?)` | Exposes function-component guards through a forwarded ref. |
| `useRouteChanged(router, onChange)` | Observes committed route changes. |
| `useViewActivate(onEvent)` | Observes a keep-alive view becoming active. |
| `useViewDeactivate(onEvent)` | Observes a keep-alive view becoming inactive. |

Activation/deactivation hooks apply to keep-alive route views.

### Route titles

`useRouteTitle` traverses route configurations and derives title/visibility information from `meta.title` and `meta.visible`, including function-valued metadata. It supports menu/tab construction, filtering, depth limits, and refresh behavior.

```ts
useRouteTitle(props?, defaultRouter?, deps?)
```

| Input | Purpose |
|---|---|
| `props.maxLevel` | Maximum number of title levels to collect; defaults to `99`. |
| `props.filter` | Predicate that can exclude each candidate route. |
| `props.filterMetas` | Metadata keys whose changes rebuild the title model. |
| `props.manual` | Starts with no titles until `refreshTitles()` is called. |
| `props.matchedOffset` | Moves the title root relative to the nearest RouterView depth. |
| `props.commonPageName` | Metadata key used to recover the source-page model for a shared/common page. |
| `props.titleName` | Metadata field used as the title; defaults to `title`. |
| `props.onNoMatchedPath` | `:first`, a fixed path, or a callback used when the current path is absent from the model. |
| `defaultRouter` | Explicit router for callers outside a Router Context. |
| `deps` | Additional dependencies that rebuild the model. |

The result contains `titles`, `setTitles`, `refreshTitles`, `matchedRoutes`, `matchedTitles`, `currentPaths`, and `parsed`. For a menu, use `currentPaths.slice(0, -1)` as its initial/open ancestor keys and the last path as its selected key.

## Keep alive and transitions

Core keep-alive behavior is configured on routes, views, or the router. The package exports keep-alive anchor constants and lifecycle hooks.

Transition components and CSS are separate package entries:

```ts
import { RouterView } from 'react-view-router/transition';
import 'react-view-router/transition/router-view.css';
```

The transition view keeps one live route tree. During an exit it animates an inert DOM snapshot of the old page, while KeepAlive continues to own the real component and its state.

`transition` accepts the names below, or an object with `name`, `zIndex`, `containerStyle`, and `containerTag`:

| Name | Effect |
|---|---|
| `slide` | The incoming page covers the old page from the right; POP uncovers it. |
| `slide-up` | PUSH enters from above, moving downward; POP exits upward. |
| `slide-down` | PUSH enters from below, moving upward; POP exits downward. |
| `fade` | Cross-fade. |
| `fade-slide` | Cross-fade with a 24px horizontal shift; POP reverses direction. |
| `zoom` | Cross-fade with a subtle scale change; POP reverses the scale direction. |
| `fade-through` | The old page fades out during the first 40%, then the new page fades in with a slight scale change during the remaining 60%. |
| `carousel` | Both pages move horizontally together; POP reverses direction. |
| `none` | No animation. |

`transitionDuration?: number` sets the total animation duration in milliseconds (default `300`), including both phases of `fade-through`. CSS transitions and the completion timer use the same duration. Directional effects use PUSH/POP; `transitionFallback` selects an effect for other navigation actions such as REPLACE.

```tsx
<TransitionRouterView transition="fade-slide" transitionDuration={240} />
<TransitionRouterView transition="slide-up" />
```

The host page should provide a viewport with an explicit height. The demo sets `position: relative; overflow: hidden;` to bound and clip the animation. `TransitionRouterView` also creates its own positioned, clipped inner stage, so repeating those two rules on the outer viewport is a layout choice rather than a runtime requirement.

Drawer and DOM utilities are also explicit exports:

```ts
import RouterDrawer from 'react-view-router/drawer';
import 'react-view-router/drawer/index.css';
import { render } from 'react-view-router/dom';
```

`RouterDrawer` composes the base `RouterView` with a drawer presenter. It renders inline by default inside a page-owned viewport with an explicit height and `position: relative; overflow: hidden;`. `portalContainer` accepts only a container getter: use `portalContainer={() => document.body}` for a body portal, or return another HTMLElement. An omitted getter or null result renders inline without `createPortal`. Its SCSS source is `drawer/src/index.scss`, while the published stylesheet is `react-view-router/drawer/index.css`.

`position` supports `'right' | 'left' | 'bottom' | 'top' | 'center'` (default: `'right'`). The panel aligns with that edge, animates along the corresponding axis, and supports outward swipe-to-close. `maxWidth` and `maxHeight` accept CSS dimensions: numbers are pixels, strings can use units such as `'70%'`. The panel fills its container when width/height are unspecified; limits constrain the panel rather than the mask or portal container.

```tsx
<RouterDrawer position="right" maxWidth={420} />
<RouterDrawer position="bottom" maxHeight="60%" />
<RouterDrawer position="left" maxWidth={320} mask={false} />
<RouterDrawer maxWidth={320} maskClosable delay={200} />
<RouterDrawer position="center" maxWidth="80vw" maxHeight="calc(100% - 48px)" maskClosable />
<RouterDrawer position="center" width="max-content" height="max-content" maxWidth="90vw" maxHeight="90vh" />
```

`mask` controls backdrop visibility and defaults to `true`. The backdrop fades in and out using the panel's `delay` (200ms by default), without fading panel content. With `mask={false}`, no backdrop blocks clicks outside the panel, and a body portal does not lock page scrolling. Direction, size limits, and panel animations remain available. The example provides direction radio buttons and a “Show backdrop” checkbox, with no size limits by default.


Center panels fade in/out and disable swipe-to-close even with `touch=true`. CSS strings support `vw`, `vh`, `%`, and `calc()`; percentages use the container, viewport units use the viewport. Invalid example inputs show an error and keep the last valid size.

A drawer route component can contain `RouterView` or `RouterDrawer` for its next-level `children` routes. Inner gestures and backdrop clicks only affect the inner drawer. Closing preserves `router.back()` history semantics rather than forcing the parent path. Body portals share a scroll lock until the last masked panel exits.

`width` and `height` set panel dimensions, both defaulting to `100%`. `maxWidth` and `maxHeight` constrain their upper bounds and have no default limit. All four accept numbers (pixels) or CSS dimension strings, such as `max-content` and `vw/vh/%/calc()`; width/height also support `auto`. Set width/height to `max-content` with maximum dimensions of `90vw/90vh` to size by content while staying within 90% of the viewport. Percentages use the container; viewport units use the viewport.

`maskClosable` defaults to `false`. When enabled, clicking the backdrop outside the panel uses the same route-back behavior as the close button; panel content clicks do not close it. The example includes a “Close on backdrop click” checkbox, disabled when the backdrop is hidden. `delay` customizes panel and backdrop duration, defaulting to 200ms.

Drawer and KeepAlive use RouterView's shared event/lifecycle dispatcher. Opening the Drawer notifies the parent route's `useViewDeactivate` subscribers before calling `componentWillUnactivate`; returning to the parent calls `componentDidActivate` before notifying `useViewActivate`. Events retain the `type`, `router`, `source`, `target`, `to`, and `from` contract: `source` is the Drawer view and `target` is the parent route. The Drawer itself stays active. Canceled navigation and switching between child routes in an already open Drawer do not notify parent visibility changes.


Only the default component export is provided; the former named class exports are removed. Its optional `ref` follows the base `RouterView` behavior: it receives the active route component instance when that component accepts a ref, not the view or Drawer instance, and may be `null`.

## React Native

Use the core memory router. Do not import standalone DOM adapters. Map platform deep links to ReactViewRouter paths at the application boundary. See the [React Native demo](../demo_native/README.md).

## Compatibility notes

- Core and legacy builds retain the Chrome 49 syntax target.
- Dynamic imports require an application bundler with a compatible chunk loader.
- Avoid mixing CommonJS `require` and ESM `import` for the same package inside one browser bundle when conditional exports could select both builds and duplicate Context/class singletons.
- Existing public APIs are protected by an export-name hash test.
- Framework-owned page routing is outside ReactViewRouter's standalone SSR ownership.

For the equivalent Chinese reference, see [API 参考（中文）](./api_CN.md).
