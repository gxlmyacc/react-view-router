# Server Components and hooks

[English](./server-components.md) | [简体中文](./server-components_CN.md)

ReactViewRouter instances, `RouterView`, history access, Context subscriptions, and all existing `use*` hooks are browser Client Component capabilities. They cannot run directly in a React Server Component.

The following hooks are client-only: `useRouter`, `useManualRouter`, `useRoute`, `useRouteMeta`, `useRouteMetaChanged`, `useRouteState`, `useRouteParams`, `useRouteQuery`, `useMatchedRoute`, `useMatchedRouteIndex`, `useMatchedRouteAndIndex`, `useRouterView`, `useRouterViewEvent`, `useRouteGuardsRef`, `useRouteChanged`, `useViewActivate`, `useViewDeactivate`, and `useRouteTitle`.

Use this ownership boundary:

- A Server Component reads request-scoped data and produces server output.
- The host framework owns page-level routing, HTTP behavior, and its Server Component protocol.
- A Client Boundary may create or consume ReactViewRouter, render `RouterView`, and call router hooks.
- A normal Client Boundary does not need a second mirrored copy of the host framework's route table.

Pure helpers such as `createRouteRuntimeDescriptor`, `collectHydratableRoutes`, and `matchHydratableRoutes` may run on the server for standalone route islands owned by ReactViewRouter. This does not allow ReactViewRouter to take over an external framework's Server Component protocol.
