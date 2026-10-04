# ReactViewRouter

[English](https://github.com/gxlmyacc/react-view-router/blob/master/README.md) | [简体中文](https://github.com/gxlmyacc/react-view-router/blob/master/README_CN.md)

ReactViewRouter 是运行在 browser 端的配置化 React 路由网关。它统一处理匹配、守卫、重定向、嵌套路由，以及可选的 standalone SSR route-island hydration。

现有 SPA 用法保持不变；standalone SSR 与 React Native 能力和默认 browser bundle 保持隔离。

## 安装

```bash
npm install react-view-router
```

ReactViewRouter core 的 peer baseline 是 React 16.8+。

## 快速开始

```tsx
// router/routes.tsx
import { lazyImport } from 'react-view-router';
import HomePage from '../pages/HomePage';

export const routes = [
  { path: '/', component: HomePage },
  {
    path: '/orders',
    component: lazyImport(() => import('../pages/OrdersPage')),
  },
];
```

```tsx
// App.tsx
import ReactViewRouter, { RouterView } from 'react-view-router';
import { routes } from './router/routes';

const router = new ReactViewRouter({ mode: 'browser', routes });

export default function App() {
  return <RouterView router={router} />;
}
```

`lazyImport` 接受字符串、组件工厂或返回 Promise 的工厂；真正的组件是工厂返回值或 Promise 结果。

## SSR 路由声明

SSR 能力按路由声明，不需要给 ReactViewRouter constructor 增加全局 hydration 开关：

```tsx
const routes = [{
  path: '/profile',
  component: lazyImport(() => import('./ProfilePage'), {
    hydrate: true,
  }),
}];
```

`hydrate` 表示“该 RouteLazy 可以复用服务端输出”，standalone adapter 决定调用 React 18 `hydrateRoot` 还是 React 16/17 `hydrate`。没有可用 adapter 时，默认降级为普通 client render；`hydrate: { required: true }` 才会抛错。

多个 SSR 页面仍只维护这一棵 `routes`。服务端用 `resolveHydratableRoutes(routes, requestUrl)` 自动匹配并加载当前请求中的 hydration route；转发层可用 `collectHydratableRoutes` 或 `matchHydratableRoutes` 只读取路由清单。完整模板见 [`demo_ssr`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_ssr/README_CN.md)。

## 能力与兼容边界

| 场景 | 入口 | 当前状态 |
|---|---|---|
| 普通 browser/hash/memory 路由 | `react-view-router` | 保持原有用法 |
| React Router v4/v5 协作 | `router.history.createHistory4()` | 在 ReactViewRouter 共享 history 上提供兼容 `history@4.10.1` 的适配器 |
| DOM 渲染工具 | `react-view-router/dom` | 已配置显式 package export |
| Drawer RouterView | `react-view-router/drawer` | 已配置显式 package export；样式入口为 `react-view-router/drawer/index.css` |
| Transition RouterView | `react-view-router/transition` | 已配置显式 package export；样式入口为 `react-view-router/transition/router-view.css` |
| React 18+ 独立 SSR island | `react-view-router/standalone-modern` | 已实现并测试 |
| React 16.8/17 独立 SSR island | `react-view-router/standalone-legacy` | 已实现并测试 |
| React Native | core memory router | 支持；不加载 DOM/hydration adapter |

- Core 与 legacy standalone 继续以 Chrome 49 为目标；React 16/Webpack 4 packed-package fixture、完整 ES5 bundle 门禁、现代 Chromium 行为测试，以及 Windows Chrome 49.0.2623.75 真机 smoke 均已通过。动态 `import()` 需要业务 bundler 转换为兼容 chunk loader。
- framework-owned 页面路由明确不属于 ReactViewRouter 的支持范围；外层 URL 使用框架自身 router，不要把框架路由表镜像到 ReactViewRouter。
- 所有现有 Router/Route hooks 都是 browser Client Component hooks，不能在 React Server Component 中执行。

## 文档

| 文档 | 适用场景 |
|---|---|
| [完整 API 参考](https://github.com/gxlmyacc/react-view-router/blob/master/docs/api_CN.md) | 查询 Router、RouterView、RouterLink、路由配置、实例方法、HOC、Hooks、插件和运行时工具。 |
| [SSR 与 runtime adapter](https://github.com/gxlmyacc/react-view-router/blob/master/docs/ssr_CN.md) | 配置独立水合、所有权、兼容性和降级行为。 |
| [Server Component 边界](https://github.com/gxlmyacc/react-view-router/blob/master/docs/server-components_CN.md) | 区分客户端 Hooks 和服务端安全工具。 |
| [SSR 路由岛设计](https://github.com/gxlmyacc/react-view-router/blob/master/docs/ssr-route-island-design_CN.md) | 查阅协议细节和兼容矩阵。 |
| [路由守卫插件提案](https://github.com/gxlmyacc/react-view-router/blob/master/docs/guard-plugin-design_CN.md) | 查阅守卫流水线插件化的计划和约束。 |

## 在线示例

[ReactViewRouter 示例网站](https://gxlmyacc.github.io/react-view-router/)（首次 GitHub Pages 部署完成后可访问）。

[部署说明](https://github.com/gxlmyacc/react-view-router/blob/master/docs/github-pages.md)。

## 可运行示例

| 示例 | 用途 | 入口 |
|---|---|---|
| Standalone SSR | JSX、server/client 分层、route island hydration | [`demo_ssr`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_ssr/README_CN.md) |
| Chrome 49 legacy | React 16、Webpack 4、ES5 bundle、真实旧内核运行入口 | [`fixtures/chrome49-legacy`](https://github.com/gxlmyacc/react-view-router/blob/master/fixtures/chrome49-legacy/README.md) |
| React Native | memory router、deep link、平台桥接 | [`demo_native`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_native/README_CN.md) |
| React 16 | React 16 集成 | [`demo_react16`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react16/README_CN.md) |
| React 17 | 旧 React 集成 | [`demo_react17`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react17/README_CN.md) |
| React 18 | React 18 集成 | [`demo_react18`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react18/README_CN.md) |
| React 19 | React 19 `createRoot` 集成 | [`demo_react19`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react19/README_CN.md) |
| React 共享应用 | JSX 页面、嵌套懒加载路由、命名 outlet、守卫顺序日志 | [`demo_react_shared`](https://github.com/gxlmyacc/react-view-router/blob/master/demo_react_shared/README_CN.md) |

示例按页面、路由、runtime adapter、server/client entry 分目录组织，避免把演示代码堆在单个文件中。

## 当前验证结果

```bash
npm test -- --runInBand
npm run build
npm run build-demo-site
```

这些命令覆盖库测试、包构建、可运行网站和静态站点依赖检查，README 不再重复记录很快会过期的测试数量。Chrome 49 legacy fixture 还覆盖发布包消费、ES5 解析、现代 Chromium 行为测试和 Windows Chrome 49.0.2623.75 真机 smoke。固定组合验证不代表覆盖所有 Chromium 49 嵌入环境，也不代表旧版本仍受官方安全维护。
