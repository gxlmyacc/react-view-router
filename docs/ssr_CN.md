# SSR 与混合运行时

[English](./ssr.md) | [简体中文](./ssr_CN.md)

ReactViewRouter 始终是 browser 端路由管理器。`hydrate` 是 RouteLazy 的“可复用服务端输出”声明，不是 Router constructor 开关，也不保证一定调用 `hydrateRoot`。

## Standalone SSR

```tsx
import ReactViewRouter, {
  RouteRuntimeAdapterProvider,
  RouterView,
  lazyImport,
} from 'react-view-router';
import { createModernStandaloneRouteSSRAdapter } from 'react-view-router/standalone-modern';

const routes = [
  {
    path: '/users',
    component: lazyImport(() => import('./Users'), { hydrate: true }),
  },
  {
    path: '/reports',
    component: lazyImport(() => import('./Reports'), { hydrate: true }),
  },
];

const router = new ReactViewRouter({ mode: 'browser', routes });
const adapter = createModernStandaloneRouteSSRAdapter({ document });

createRoot(document.getElementById('app')).render(
  <RouteRuntimeAdapterProvider value={adapter}>
    <RouterView router={router} />
  </RouteRuntimeAdapterProvider>,
);
```

这里的“服务端容器”不是客户端配置，也不需要设置 `container` selector。`hydrate: true` 时，ReactViewRouter 会根据当前 route 的 `path + depth + viewName` 自动生成 `routeId`，standalone adapter 再根据这个 ID 自动寻找服务端 HTML。

服务端不需要逐个导入 page，也不需要分别维护 `usersRoute`、`reportsRoute`。`resolveHydratableRoutes(routes, requestUrl)` 会用 ReactViewRouter 自身的规则匹配当前 URL、遍历命中的嵌套路由和 named view，并加载其中声明了 `hydrate: true` 的组件：

```tsx
// server/renderDocument.tsx：增加 SSR 页面时不需要修改这个模板
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

如果反向代理或服务端转发只需要路由信息，可调用 `collectHydratableRoutes(routes)` 获取整棵配置树的清单，或调用 `matchHydratableRoutes(routes, requestUrl)` 获取当前请求命中的清单；这两个方法都不会加载页面组件。

浏览器最终收到的 HTML 可能是下面这样；编码后的 `routeId` 只是生成结果，不是需要复制到路由配置里的参数：

```html
<div
  data-react-viewssr-route="true"
  data-react-viewprotocol-version="1"
  data-react-viewroute-id="0%7C%2Fusers%7Cdefault"
>...server-rendered Users...</div>
```

以后增加服务端页面时，客户端和服务端只共同修改 `routes`：

```tsx
const routes = [
  { path: '/users', component: lazyImport(() => import('./Users'), { hydrate: true }) },
  { path: '/reports', component: lazyImport(() => import('./Reports'), { hydrate: true }) },
  { path: '/settings', component: lazyImport(() => import('./Settings')) },
];
```

`hydrate.container` 只用于 DOM 结构特殊、无法使用默认 routeId selector 的高级覆盖场景，普通项目不需要配置。也不需要 `hydrationKey`，不应在服务端和客户端分别手拼 `routeId`。同一路径的 named view 与不同 depth 会自动生成不同身份。可直接参考 demo 中的 [路由配置](../demo_ssr/src/router/routes.js)、[服务端 renderer](../demo_ssr/server/renderDocument.jsx) 和 [客户端入口](../demo_ssr/src/client/index.jsx)。

React 18+ 使用 `react-view-router/standalone-modern`；React 16.8/17 使用 `react-view-router/standalone-legacy`。核心入口不会导入 `react-dom/client`。找不到 descriptor/container、版本不匹配或 adapter 不接受时，`hydrate: true` 回退 client render；`hydrate: { required: true }` 进入 Error Boundary，并可通过 `onError` 记录错误。

## 外部 SSR 框架边界

拥有自身 root、history、服务端 payload 或 Server Component 协议的框架，应继续独立管理页面级 URL 与 hydration。不要对框架拥有的 DOM 再使用 standalone adapter，也不要把框架文件路由镜像到 ReactViewRouter。

ReactViewRouter 当前不发布框架专用 adapter。通用 `RouteRuntimeAdapter` 是宿主扩展协议，不构成对某个 SSR 框架及其版本矩阵的兼容承诺。

## Context 与嵌套 RouterView

独立 hydration root 不会自动继承外层 React Context、Suspense 或 Error Boundary。使用 `hydrate.wrapElement` 显式包裹 RouterContext、runtime adapter、业务 Provider 或共享 store；服务端通过 `wrapHydratableRouteElement` 应用同一个 wrapper。含子 `RouterView` 且其后代还存在 hydration route 时，必须把 router 和 `RouteRuntimeAdapterProvider` 一起桥接，否则后代会降级为 client render。普通 Client Component 中使用 ReactViewRouter 与现有 browser 用法相同。

## React Native 与 Chrome 49

Native 没有 DOM hydration：可选 `hydrate` 自动退化为普通 client render；`required: true` 会报配置错误。runtime core 使用内部 `NavigationSignal`，不要求 AbortController。

legacy 构建仍以 Chrome 49 为目标；动态 `import()` 需由业务 bundler 转换为兼容 chunk loader。[Chrome 49 legacy fixture](../fixtures/chrome49-legacy/README.md) 固定 React 16.14、Webpack 4.47，验证 packed package 可消费、完整 bundle 可按 ES5 解析，并在浏览器执行 guard、Promise 型 `lazyImport`、push 和 POP。该场景已在 Windows Chrome 49.0.2623.75 真机通过；`CHROME49_EXECUTABLE` 入口只接受用户显式提供的可信旧浏览器，不自动下载停止维护的第三方二进制。该固定版本结果不自动扩展为所有 Chromium 49 嵌入环境的兼容承诺。
