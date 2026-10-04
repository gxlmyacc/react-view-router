# React Native memory-router demo

[English](./README.md) | [简体中文](./README_CN.md)

This example separates platform-independent routing from React Native integration. Business screens do not manipulate `BackHandler` or `Linking` directly.

```text
demo_native/
├─ App.js                                  # Expo entry, re-export only
└─ src/
   ├─ App.jsx                              # JSX composition root
   ├─ screens/*.jsx                       # Screens consuming ReactViewRouter hooks
   ├─ components/
   │  ├─ NativeRouterLink.jsx              # Pressable-to-router.push bridge
   │  └─ RouteNavigation.jsx               # Navigation UI
   └─ navigation/
      ├─ routes.js                         # Routes and lazyImport
      ├─ createAppRouter.js                # Memory-router factory
      ├─ deepLinkConfig.js                 # Application URL prefixes
      ├─ getPathnameFromDeepLink.js        # Pure deep-link parser
      └─ useNativeNavigationBridge.js      # Linking/BackHandler lifecycle bridge
```

## Run

```bash
npm install
npm start
```

## Reusable practices

- Create one memory router per App instance; avoid a mutable module-level router singleton.
- Let screens use client hooks such as `useRoute` without exposing native navigation APIs to them.
- Consume an Android back event only when the memory stack can go back. Return `false` at the stack root.
- Process the initial URL and later Linking events through the same pure parser.
- Keep deep-link prefixes in application configuration rather than router core.
- React Native has no DOM hydration. Optional `hydrate` falls back to the client renderer, and standalone DOM adapters must not be imported.

Expo is used for convenient execution. This demo does not claim a completed minimum React Native/Hermes/JSC matrix. Production applications should add integration tests for the navigation bridge, deep-link mapping, and Android back stack.
