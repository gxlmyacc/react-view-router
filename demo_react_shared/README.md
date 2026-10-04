# Shared React demo application

[English](./README.md) | [简体中文](./README_CN.md)

This package owns the workspace and self-contained examples shared by the React 16, 17, 18, and 19 launchers. It is an implementation package rather than a separately launched application.

Development launchers reload the whole page after a successful compilation (including compilations with warnings), keeping the current URL. Fast Refresh and HMR are disabled so router singletons, cached route components, and lazy chunk references all use the same compilation. A compile error prevents the reload until it is fixed. Restart an already running development server after changing its launcher configuration; production builds are unaffected.

The Drawer example includes a parent lifecycle log. Its class page implements `componentWillUnactivate` when the child drawer opens and `componentDidActivate` when it closes. Repeated opening and closing preserves the parent instance and note. `HomePageRoute.tsx` reads the router and demo contexts with Hooks and forwards the class ref so the lifecycle methods can be called.

## Project structure

```text
src/
  workspace/                   # frontend shell: header, language, menu, shared history
    App.tsx
    App.scss
    history/index.ts
    routes.ts                  # only module roots and route metadata
  examples/
    guard-navigation/         # direct navigation inside guards and ignored later next()
    route-transition/         # directly embedded Web/mobile transition RouterView demo
    keep-alive/               # cached draft, preserved state, and view lifecycle events
    drawer/                   # nested route displayed as a drawer
    hooks-meta/               # route Hooks and metadata inspector
    route-guards/              # independently scoped middle-platform module
      App.tsx                  # accepts basename/mode and calls useManualRouter
      App.scss                 # imported with ?scoped
      history/index.ts         # exports new ReactViewRouter({ manual: true })
      routes.ts                # static route configuration
      global-guards.ts
      guards/
      pages/                   # route pages use useRouter()
  playground/                 # TSX editor, Worker protocol, sandbox runtime
  testing/                     # integration fixtures, not application boilerplate
```

The workspace owns browser history and configures only each module's root route. Menu text comes from route `meta` through `useRouteTitle`, and one workspace `RouterView` renders the matched module with the current root path as its basename. At that mounting boundary, the host explicitly passes `basename` and `mode` to the module. The module therefore does not depend on a parent ReactViewRouter context: its `history/index.ts` creates a manual router, and its root calls `useManualRouter(router, { basename, mode, routes, manual: true })` with the host contract, then starts it in an effect. Global `router.beforeEach` / `beforeResolve` / `afterEach` registration lives in that module entry. Route components inside the module's own `RouterView` obtain the module router with `useRouter()`.

The site includes copyable `routes.ts`, `router.ts`, and `index.tsx` Quick Start blocks plus a dedicated host/module integration guide. The basic-navigation module also demonstrates dynamic params, `paramsProps`, `defaultProps`, RouterView props, computed route metadata, and `absolute: true` navigation back to a host-owned route.

The route-configuration guide compares `index`, `redirect`, nested children, dynamic params, metadata, and method-based `lazyImport` in one route tree. The Feature index is a searchable, category-filtered capability map. Every card either links to a relevant runnable example or expands concrete behavioral notes when no matching Web demo exists. The separate API reference renders `docs/api.md` directly, so repository Markdown and the website do not maintain duplicate signatures or parameter descriptions.

The Hooks and route metadata module uses `useRouteTitle` as a complete navigation model. Route metadata generates five Hook categories, eighteen Hook reference pages, tabs, and breadcrumbs. Each leaf explains one Hook's purpose, signature, parameters, and return value. `currentPaths` supplies ancestor open keys while its last item is the only selected menu key; a separate live inspector demonstrates route data and metadata updates.

Each example imports its matching component stylesheet with `?scoped`. All launchers integrate `babel-preset-react-scope-style@0.1.0-alpha.5`, so adding another example does not leak its styles into existing modules.

The route-transition module imports `react-view-router/transition` exactly as application code does. The KeepAlive module uses `react-view-router/dom`, a route-level cache declaration, activation/deactivation hooks, and an animation switch to show that a draft survives navigation with or without a transition. The Drawer module renders a nested child route through `react-view-router/drawer` and keeps its URL in sync with opening and closing. Its parent `.drawer-home-page` is the positioned, clipped drawer viewport; there is no separate empty container. Every launcher maps these public subpaths to local builds for development.

The transition demo passes its duration slider value to `TransitionRouterView` through `transitionDuration` (milliseconds). The host page provides a viewport with an explicit height; this example sets `position: relative; overflow: hidden;` on it. The transition view also creates its own positioned, clipped inner stage. The KeepAlive preview page has a Return button for inspecting POP transitions. Drawer uses native CSS animation and touch events, with no animation/swipe packages required.

The API reader also bundles local documents and SSR source files referenced by its Markdown links. Following those links stays inside the site and preserves the language switch. The development error panel renders in the host page so a failed iframe overlay cannot block all clicks invisibly.

The actual demo route tree is imported by the root integration tests, which verify lazy parent/child guard order and navigation abort behavior.

The fixed-height guard log scrolls independently and follows new events automatically. Calls are grouped by navigation; each compact block shows `from → to`, its final result, and ordered guard decisions. The header switches the complete workspace between English and Chinese.

The guard-navigation example documents an intentional control-flow feature: a shared helper may call `router.push`, `router.replace`, or `router.redirect` while a guard is running. Its outer guard may still call `next()` normally. The demo contrasts an exact same-target decision with two different-target redirect chains: `/parent → /parent/child` and a same-pathname query change. Transaction Promises resolve after the final target commits, while a callback belonging to an obsolete exact `fullPath` is ignored.

The Playground provides a syntax-highlighted virtual file tree for TS, TSX, CSS, and SCSS, including SCSS variables, selectors, properties, literals, and nesting operators. Its Worker transpiles script files into a small CommonJS module runtime, resolves relative imports, and sends combined styles to an iframe with `sandbox="allow-scripts"`. TypeScript and the compiler worker are copied from the local locked dependency into the site artifact; the browser never fetches a compiler, React, or ReactViewRouter from a CDN. The editable workspace is stored locally in the browser.

Every runnable example exposes a **View code** action. Startup/build generates a self-hosted source manifest from the real example directories, and the modal uses the same file-tree workspace as the Playground in read-only mode. The shared workspace already has an `editable` boundary, so a future opt-in editable example mode will not require replacing the source viewer.

The Scroll position example (`/examples/save-position`) compares plain RouterView with Transition. Scroll the list, open Preview, and return to verify POP restoration. Disable saving to compare a fresh list starting at the top. View code shows the scoped selector, container getter, and DOM renderUtils configuration; KeepAlive is disabled.
