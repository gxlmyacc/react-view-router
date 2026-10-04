# Standalone SSR 路由岛示例

[English](./README.md) | [简体中文](./README_CN.md)

这个示例按真实项目职责拆分，不建议把所有代码重新合并到入口文件。

```text
demo_ssr/
├─ src/
│  ├─ client/index.jsx                     # browser 组合入口
│  ├─ components/RouteNavigation.jsx       # 普通 JSX 导航 UI
│  ├─ pages/*.jsx                          # server/client 共用页面
│  ├─ router/
│  │  ├─ index.js                          # browser-mode Router 单例
│  │  └─ routes.js                         # lazyImport 与 hydrate 声明
│  └─ App.jsx                              # RouterView 与布局
├─ server/
│  ├─ index.js                             # HTTP 入口
│  ├─ renderDocument.jsx                   # SSR island renderer
│  └─ serveClientAsset.js                  # 静态资源处理
└─ webpack.config.js                       # client/server 双构建
```

## 运行

```bash
npm install
npm start
```

打开 `http://localhost:3000/ssr`。`/ssr` 与 `/reports` 是两个独立 SSR route，`/client` 是普通 browser route；三者共用同一个 browser-mode ReactViewRouter。

## 增加 SSR 页面

只修改 `src/router/routes.js`：

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

`server/renderDocument.jsx` 不需要知道页面数量，也不逐个 import 页面。它通过 `resolveHydratableRoutes(routes, requestUrl)` 自动匹配当前请求并加载命中的 SSR 页面。服务端转发如果只需要路径信息，可使用 `collectHydratableRoutes(routes)` 或 `matchHydratableRoutes(routes, requestUrl)`，两者不会加载组件。

复杂分支 `/workspace/overview/tools` 是 `hydrate layout → client layout → client leaf`，只生成 workspace SSR island；`/workspace/overview/audit` 是 `hydrate layout → client layout → hydrate leaf`，会生成 workspace 和 audit 两个互不重叠的 sibling islands。中间 client layout 始终由 browser RouterView 渲染。

Workspace 是包含子 `RouterView` 的独立 hydration root，因此通过 `hydrate.wrapElement` 给它显式注入当前环境的 router 和 `RouteRuntimeAdapterProvider`。后者让更深层的 audit hydration renderer 跨 root 找到同一个 adapter，避免降级 client render 后产生重复页面。`renderDocument.jsx` 使用 `wrapHydratableRouteElement` 应用同一 wrapper，保证 server/client 结构一致；普通叶子 SSR route 仍只需 `{ hydrate: true }`。

client 入口创建 adapter 后先调用 `setRouteRuntimeAdapter(runtimeAdapter)`，再渲染 App。routes、router 和 client 入口统一使用 ESM `import/export`，避免 bundler 分别命中 package exports 的 `import`/`require` 条件后打入两套内部 Context。

## 服务端容器到底是什么

文档里的 SSR 容器是服务端生成结果，不是客户端路由配置。默认流程只有三步：

1. `routes.js` 给页面声明 `{ hydrate: true }`，不需要 selector。
2. `renderDocument.jsx` 遍历当前 URL 命中的 hydration route，自动生成身份并输出服务端页面外层。
3. 浏览器根据匹配到的 route 自动计算相同身份、找到容器并水合。

浏览器最终收到的生成结果类似：

```html
<div
  data-react-viewssr-route="true"
  data-react-viewprotocol-version="1"
  data-react-viewroute-id="0%7C%2Fssr%7Cdefault"
>...服务端渲染的页面...</div>
```

`0%7C%2Fssr%7Cdefault` 是 `depth | path | viewName` 的编码结果，只是生成产物，不需要复制到路由配置。`hydrate.container` 只用于特殊 DOM 布局下覆盖默认查找规则。

## 推荐迁移顺序

1. 导出一棵 server/client 共用的 `routes`，不要再单独导出每个 SSR route。
2. 如果应用不需要多个隔离实例，就在 `router/index.js` 中直接创建并导出 browser router。
3. 只给能够复用服务端输出的 `RouteLazy` 配置 `hydrate: true`。
4. 在 client 入口直接创建 standalone adapter，再通过 Provider 注入。
5. server renderer 只标记自己拥有的 standalone island，不标记 framework-owned root。

## 不要这样做

- 不要在路由模块中读取 `window` 或 `document`。
- 不要让页面组件调用 `hydrateRoot`。
- 默认生成的路由身份已经够用时，不要额外配置 `hydrate.container`。
- 不要对其他 SSR 框架拥有的 DOM/root 使用 standalone adapter。
- 不要假设独立 root 自动继承外层 React Context；通过 `hydrate.wrapElement` 显式桥接 Provider/store。

该 demo 使用 React 18 modern adapter。React 16.8/17 只需从 `react-view-router/standalone-legacy` 导入 runtime 工厂，其余分层不变。
