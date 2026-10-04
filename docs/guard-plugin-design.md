# Built-in Route Guard Plugin Design

[English](./guard-plugin-design.md) | [简体中文](./guard-plugin-design_CN.md)

## Status

This is a lower-priority design proposal, not a committed public API. The current guard implementation remains the compatibility baseline.

## Goal

Move guard discovery and execution into a built-in plugin so the plugin system exercises the same extension path as first-party behavior, while preserving `beforeEach`, `beforeResolve`, `afterEach`, route-config guards, and component guards without application changes.

## Boundary

The router core must continue to own the navigation transaction: shared-history coordination, target normalization, redirect loops, commit/rollback, competing router cancellation, and exactly-once completion. A guard plugin may decide whether a transaction proceeds, redirects, or aborts, but it must not commit history independently.

The existing events are useful extension points but are not yet a complete guard engine protocol. In particular, `onRouteing`, `onGetRouteComponentGuards`, and `onGetRouteInterceptor` do not explicitly model every phase or transaction identity. Reimplementing guards only by combining those callbacks would make ordering and cancellation implicit.

## Proposed phases

1. The core creates a navigation transaction with a stable identity.
2. The built-in plugin collects global, route-config, component-instance, and lazy-component guards.
3. It executes leave guards deepest-first, enter/resolve guards parent-first, and stores `next(callback)` handlers locally.
4. It returns allow, abort, redirect, or error to the core.
5. The core coordinates every router sharing the history and performs one commit or rollback.
6. Only after a successful commit does the plugin run completion callbacks, update guards, leave-after hooks, and `afterEach` in the existing order.

## Compatibility requirements

- Public guard registration APIs and callback signatures remain unchanged.
- A later guard abort must discard all earlier `next(callback)` handlers.
- Lazy guards must resolve before commit and preserve parent/child ordering.
- Multiple basename routers sharing one history must vote in the same transaction.
- Memory, browser, hash, SSR hydration, React Native, old shared-history objects, and Chrome 49 fallbacks must retain their current behavior.
- Built-in behavior must not depend on replaceable user-plugin ordering. Initially the guard plugin should use an internal priority/phase channel rather than a conventional named plugin that applications can replace accidentally.

## Migration gate

Before extraction, plugin lifecycle and event contracts must have direct tests. The new implementation should first run in an internal comparison mode against the current guard pipeline. It can replace the current pipeline only after guard-order, abort, redirect, lazy, multi-router, and completion-callback suites produce equivalent results with no coverage regression.

