# ReactViewRouter standalone SSR route-island 设计

[English](./ssr-route-island-design.md) | [简体中文](./ssr-route-island-design_CN.md)

## 1. 定位

ReactViewRouter 始终运行在 browser 端。SSR 支持只解决一个问题：当某个 ReactViewRouter 路由组件已经由应用服务端输出 HTML 时，客户端的 `RouteLazy` 可以复用该输出，而不是先清空再重新渲染。

本方案不让 `RouterView` 在 Node 中执行，也不接管外部 SSR 框架的文件路由、Server Component、数据协议、HTTP 状态、缓存或根 hydration。

## 2. 对外 API

路由通过 `lazyImport` 声明可水合能力：

```tsx
const routes = [{
  path: '/users',
  component: lazyImport(() => import('./Users'), {
    hydrate: true,
  }),
}];
```

`hydrate` 未配置时保持原有 browser render。配置为 `true` 时优先复用服务端输出，条件不满足则降级为 client render：

```tsx
lazyImport(load, {
  hydrate: {
    required: false,
    mismatch: 'client-render',
    wrapElement(element) {
      return <BusinessProviders>{element}</BusinessProviders>;
    },
    onError(error, info) {
      reportHydrationError(error, info);
    },
  },
});
```

只有 `required: true` 才把缺少 adapter、container 或协议不匹配视为错误。

## 3. 组件解析

`lazyImport` 支持组件加载函数，也支持返回 Promise 的加载函数。水合与普通 browser render 必须共享同一套解析语义：

```text
load(route, viewName, router, options)
  → component 或 Promise<component>
  → ES module default 解包
  → RouteLazy updater
  → resolved component
```

水合配置不能把加载函数本身误当成 React 组件。

## 4. 职责拆分

| 模块 | 职责 |
|---|---|
| `RouteLazy` | 保存加载器、选项、解析状态和 updater |
| browser renderer | 普通客户端组件渲染 |
| `RouteRuntimeAdapter` | 宿主能力发现、激活、导航与释放的通用协议 |
| standalone SSR adapter | 查找 route container，并调用对应 React 版本的 hydration API |
| ReactViewRouter | 匹配、守卫、导航事务和 adapter 选择 |

核心入口不静态导入 `react-dom` 或 `react-dom/client`：

- React 18+：`react-view-router/standalone-modern`
- React 16.8/17：`react-view-router/standalone-legacy`

这样 legacy、React Native 和普通 SPA bundle 不会加载错误的 DOM runtime。

## 5. Route identity 与容器

服务端和客户端根据同一棵 routes 配置生成 descriptor，由核心根据 depth、path 和 viewName 生成稳定 `routeId`。服务端通常直接调用 `resolveHydratableRoutes(routes, requestUrl)`；它会复用核心匹配规则并发现命中的 `hydrate: true` 节点，不需要逐个 route 调用 `createRouteRuntimeDescriptor`。业务不需要配置 `hydrationKey`，普通场景也不需要手写 selector。

只需要转发信息时，服务端可调用 `collectHydratableRoutes(routes)` 获取全量清单，或调用 `matchHydratableRoutes(routes, requestUrl)` 获取当前请求清单；两者不触发 `lazyImport` 加载。

服务端容器协议：

```html
<div
  data-react-viewssr-route="true"
  data-react-viewprotocol-version="1"
  data-react-viewroute-id="0%7C%2Fusers%7Cdefault"
>...server-rendered Users...</div>
```

`hydrate.container` 仅作为特殊 DOM 结构的高级覆盖项。自动 routeId 无法定位时，adapter 才使用该显式 selector。

## 6. 导航顺序

```text
目标地址
  → 路由匹配
  → beforeEach / route guards
  → RouteLazy 解析
  → runtime descriptor
  → adapter capability check
  → hydrate 或 client render
  → afterEach
```

导航事务使用内部 `NavigationSignal` 处理取消和竞态，不要求浏览器具备无法完整 shim 的 `AbortController`。

通用 runtime gateway 允许应用自行注册其他宿主 adapter，但 ReactViewRouter 不随包发布外部 SSR 框架的专用 adapter，也不对其 navigation/history 语义做兼容承诺。

## 7. Context 与多 root

不同 React root 之间不会自动共享 React Context、Suspense 或 Error Boundary。standalone route island 必须通过 `wrapElement` 重新注入需要的 Provider，或者使用 React root 之外的共享 store。

这不是多调用一次 `hydrateRoot` 就能解决的问题。独立 root 的生命周期、错误边界和 Context 所有权都必须显式处理。

## 8. 降级策略

| 条件 | 默认行为 |
|---|---|
| 没有服务端容器 | client render |
| descriptor 协议版本不匹配 | client render |
| adapter 不支持当前 route | client render |
| hydration 抛错 | 调用 `onError`，再按 mismatch 策略处理 |
| `required: true` 且无法水合 | 抛给 Error Boundary |
| React Native | 不加载 DOM adapter，普通 render |

`mismatch` 支持：

- `client-render`：默认降级；
- `preserve`：保留已有 DOM，由应用接管；
- `throw`：进入错误边界。

## 9. 外部框架边界

如果宿主已经拥有页面 root、URL router、服务端 payload 或 Server Component 协议，则应继续由宿主管理页面级导航与 hydration：

- 不对宿主 DOM 调用 standalone hydration adapter；
- 不扫描或复制宿主路由表；
- 不用 ReactViewRouter 拦截宿主 Link、redirect、action 或 POP；
- Client Component 内若使用 ReactViewRouter，按普通 browser/memory router 用法处理，而不是作为框架集成能力。

这条边界避免两套 router 争用 history，也避免对外承诺无法完整控制的导航事务。

## 10. 兼容性

- Core、legacy standalone adapter 继续以 Chrome 49 为语法目标；
- 动态 `import()` 必须由业务 bundler 转换成目标浏览器可用的 chunk loader；
- React Native 只使用 core memory router，不包含 DOM/hydration adapter；
- standalone modern 依赖 React 18+ 的 `hydrateRoot`；
- standalone legacy 使用 React 16.8/17 的 `hydrate`。

## 11. 验证门禁

每次相关改动至少验证：

1. 完整 TypeScript/Babel/library build；
2. 全量 Jest 与覆盖率不低于基线；
3. standalone SSR server/client bundle；
4. React 16/Webpack 4/ES5 syntax fixture；
5. Chrome 49 smoke；
6. React Native memory/deep-link 测试；
7. 发布包 `exports` 与 tarball 内容。

可运行实现见 [`demo_ssr`](../demo_ssr/README_CN.md)，详细 API 见 [`ssr_CN.md`](./ssr_CN.md)。
