# ReactViewRouter API 参考

[English](./api.md) | [简体中文](./api_CN.md)

本文以当前公开导出和 TypeScript 类型为准，说明 Router、React 组件、HOC、Hooks、插件、History 兼容层与独立水合工具。入门代码请先阅读项目根目录 [README](../README_CN.md)。

## 安装与入口

```bash
npm install react-view-router
```

默认入口使用兼容 Chrome 49 的 `esm` 产物（CommonJS）。需要现代 ES Modules 时，可显式引入 `react-view-router/es`、`react-view-router/es/dom`、`react-view-router/es/drawer` 或 `react-view-router/es/transition`。同一应用应统一使用相同版本的入口。Drawer 和 Transition 会自动引入样式。

| 入口 | 用途 | 运行环境 |
|---|---|---|
| `react-view-router` | Router、组件、HOC、Hooks、history、匹配与运行时类型 | Browser、Memory、React Native |
| `react-view-router/dom` | React DOM 渲染适配工具 | Browser |
| `react-view-router/transition` | 带换页动画的 RouterView | Browser |
| `react-view-router/drawer` | Drawer RouterView（保留入口，后续实现可能调整） | Browser |
| `react-view-router/standalone-modern` | React 18+ 独立水合适配器 | Browser hydration |
| `react-view-router/standalone-legacy` | React 16.8/17 独立水合适配器 | Browser hydration |

核心 peer baseline 为 React 16.8+。React Native 使用 core memory router，不应引入 DOM 或 standalone adapter。

## 最小用法

```tsx
import React from 'react';
import ReactViewRouter, { RouterLink, RouterView, lazyImport } from 'react-view-router';

const routes = [
  { path: '/', index: '/home' },
  { path: '/home', component: lazyImport(() => import('./Home')) },
  { path: '/users/:userId', component: lazyImport(() => import('./User')) },
];

const router = new ReactViewRouter({ mode: 'browser', routes });

export default function App() {
  return (
    <>
      <RouterLink router={router} to="/home">首页</RouterLink>
      <RouterView router={router} />
    </>
  );
}
```

嵌套路由组件通过再渲染一个 `<RouterView />` 展示子路由。子 RouterView 会从 Context 获得父视图和 Router。

## 核心路由类型

### 防循环导航保护

每个 Router 默认按 pathname 统计导航尝试：滚动 1000ms 内第 10 次尝试会进入目标页面，并停止本次导航中的配置及守卫重定向。查询参数不区分，动态路径的实际参数值区分。初始导航、push/replace 和前进后退均参与统计；未成功进入页面的重定向尝试也会计数。

```ts
const router = new ReactViewRouter({
  navigationLoopProtection: { windowMs: 1000, maxVisits: 10 },
});
// navigationLoopProtection: false 可关闭保护。
router.onError((error) => {
  if ('code' in error && error.code === 'NAVIGATION_LOOP_DETECTED') {
    console.error(error);
  }
});
```

`NavigationLoopProtectionOptions` 的 `windowMs` 必须是正有限数，`maxVisits` 必须是正整数；省略字段使用上述默认值，无效配置在初始化时抛错。错误类型 `NavigationLoopError` 包含 `code: 'NAVIGATION_LOOP_DETECTED'`、`pathname`、`windowMs` 和 `maxVisits`。

触发时，例如 A→B→C→A 中 A 达到阈值，会提交 A 的地址并渲染 A 配置的组件；若 A 只有 redirect、没有组件，则没有页面内容可渲染。进入目标后通过 `onError` 报告循环原因，导航 Promise 正常完成，不触发取消回调。守卫仍然执行，返回 `false` 或错误时仍可拒绝进入页面。只调整本次导航快照，原有 redirect 配置保持不变。

清空本轮所有计数，下一次跳转立即可用；stop/start 也会清空记录。组件挂载、afterEach 或其他业务代码随后发起的跳转属于新导航，允许继续。

这是频率保护，高频正常访问同一路径也可能触发；不会分析路径序列，也不覆盖纯组件 effect 不断发起新导航的循环、整页跳转或绕过 Router 的外部导航。业务重新发起循环时会重新计数。可在“Index 和重定向”示例中触发 A→B→C→A 并验证进入 A 和后续导航。

### `RouteLocation`

`push`、`replace`、`redirect` 和 `createRoute` 接受字符串或位置对象。

| 字段 | 类型 | 说明 |
|---|---|---|
| `path` | `string` | 目标路径，可使用相对路径、绝对路径或命名路由表达式。 |
| `query` | `Record<string, any>` | URL query。 |
| `params` | `Record<string, any>` | 动态路径参数。 |
| `state` | `Record<string, any>` | 写入目标 history entry 的路由 state。 |
| `append` | `boolean` | 将相对地址追加到当前路径。 |
| `absolute` | `boolean \| HistoryType` | 绕过当前 basename，或指定外层 history 模式。 |
| `delta` | `number` | 已知 history 步数时按 delta 移动。 |
| `backIfVisited` | `boolean \| 'full-match'` | 已访问目标时优先回退，否则正常跳转。 |
| `pendingIfNotPrepared` | `boolean` | Router 尚未准备完成时保持待决。 |
| `preserveState` | `boolean` | 导航时保留已有路由 state。 |

### `Route`

`router.currentRoute`、`initialRoute` 和导航守卫使用该对象。

| 字段 | 说明 |
|---|---|
| `path` / `fullPath` / `url` / `search` | 当前匹配地址和查询字符串。 |
| `query` / `params` | 解析后的 query 与动态参数。 |
| `matched` / `matchedPath` | 从父到子的匹配记录和已匹配路径。 |
| `meta` / `metaComputed` | 原始元信息与函数型元信息的计算结果。 |
| `state` | 当前 history entry 对应的路由 state。 |
| `action` / `delta` | history 动作和导航步数。 |
| `isRedirect` / `redirectedFrom` | 重定向状态和来源。 |
| `isComplete` | 当前路由是否已经完成守卫和提交。 |

### `MatchedRoute`

每项包含规范化配置 `config`、`path`、`subpath`、`depth`、`params`、`meta`、`metaComputed`、组件/视图实例以及各阶段组件守卫。`matched.first` 和 `matched.last` 分别指向首尾匹配项。

## 路由配置 `UserConfigRoute`

| 配置 | 类型 | 说明 |
|---|---|---|
| `path` | `string` | 路径模式；子路由可以使用相对路径。 |
| `name` | `string` | Router 内唯一的路由名，可通过 `[routeName]/child` 引用。 |
| `component` | React component 或 `RouteLazy` | 默认视图组件。 |
| `components` | `Record<string, component>` | 命名视图；`component` 等价于 `components.default`。 |
| `children` | route 数组或函数 | 嵌套路由。函数接收父配置并返回子配置。 |
| `exact` | `boolean` | 是否要求 pathname 精确匹配。 |
| `redirect` | string、位置对象或函数 | 发起重定向导航。 |
| `index` | `':first'`、string 或函数 | 为当前 URL 选择默认同级/子路由，不修改 URL。 |
| `abort` | boolean、string、Error 或函数 | 声明该路由不可进入。 |
| `meta` | `RouteMeta` | 标题、菜单、标签页、权限等应用路由信息。 |
| `defaultProps` | object 或 props factory | 始终传给路由组件的默认属性。 |
| `props` / `paramsProps` | boolean、字段数组、转换表或命名视图表 | 把动态 params 映射为组件 props。 |
| `queryProps` | boolean、字段数组、转换表或命名视图表 | 把 query 映射为组件 props。 |
| `keepAlive` | boolean 或判断函数 | 是否保留失活的路由视图。 |
| `enableRef` | boolean 或判断函数 | 是否为组件绑定路由 ref。 |
| `beforeLeave` / `beforeResolve` | guard | 路由级离开/解析守卫。 |
| `beforeUpdate` / `afterLeave` | hook | 路由更新和离开后的通知。 |

`index` 只选择渲染路由，不创建新 history entry，也不修改地址；被选中的节点仍会进入 `currentRoute.matched`。`index: ':first'` 会跳过 `meta.visible === false` 和 index 占位配置，选择第一个可显示的同级路由。具体 index 值可以匹配 `:reportId` 等动态子路由，静态路径优先。

```tsx
const routes = [
  { path: '/reports', index: 'monthly' },
  { path: ':reportId', component: ReportPage },
];
```

`paramsProps` 和 `queryProps` 支持类型转换：

```tsx
{
  path: '/users/:userId',
  component: UserPage,
  paramsProps: { userId: Number },
  queryProps: { tab: String, page: Number, enabled: Boolean },
}
```

## `ReactViewRouter`

```ts
new ReactViewRouter(options)
```

```ts
const router = new ReactViewRouter(options);
```

### 构造选项

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `name` | `string` | `''` | Router 实例名称。 |
| `basename` | `string` | `''` | 基础路径，内部规范化为尾部带 `/` 的形式。 |
| `mode` | `'browser' \| 'hash' \| 'memory' \| HistoryFix` | `'hash'` | history 模式或外部共享 history。 |
| `hashType` | `'slash' \| 'noslash'` | `'slash'` | hash 地址格式。 |
| `pathname` | `string` | `''` | 内部 memory history 的初始路径。 |
| `history` | `HistoryFix` | — | 显式共享 history，适合前台/中台或多个 memory Router。 |
| `routes` | `UserConfigRoute[]` | `[]` | 路由配置树。 |
| `queryProps` | `ParseQueryProps` | `{}` | 全局 query 转换函数。 |
| `manual` | `boolean` | `false` | 为 `true` 时构造函数不自动调用 `start`。 |
| `rememberInitialRoute` | `boolean` | `false` | 从 session history stacks 恢复初始路由。 |
| `holdInitialQueryProps` | boolean、字段数组或函数 | `false` | 将初始 query 合并到后续导航。 |
| `keepAlive` | boolean、RegExp 或判断函数 | `false` | Router 级视图保留规则。 |
| `renderUtils` | `PartialReactRenderUtils` | 默认浏览器工具 | 不依赖 ReactDOM；自定义对象完全接管，不补齐默认方法。KeepAlive 需完整适配器或相应能力。 |
| `routeRuntimeAdapters` | `RouteRuntimeAdapter[]` | — | 可选的运行时导航/水合适配器。 |

SSR 不是 Router mode；是否允许水合由每个 `RouteLazy` 的 `hydrate` 配置声明。

### 常用状态

| 属性 | 说明 |
|---|---|
| `mode` / `basename` / `basenameNoSlash` | 当前 history 模式和基础路径。 |
| `routes` / `routeNameMap` | 规范化路由树和命名路由映射。 |
| `currentRoute` / `prevRoute` / `pendingRoute` | 当前、上一个和待决路由。 |
| `initialRoute` | Router 启动时解析的初始路由。 |
| `parent` / `top` / `children` | 多 Router 层级关系。 |
| `viewRoot` | 根 RouterView 实例。 |
| `history` / `stacks` | 共享 history 和已记录的顶层路由栈。 |
| `isRunning` / `isPrepared` | 是否已监听 history，以及根视图是否准备完成。 |
| `isBrowserMode` / `isHashMode` / `isMemoryMode` | 当前模式判断。 |

## 生命周期与路由注册

| 方法 | 参数 | 返回值 | 行为 |
|---|---|---|---|
| `start(options?, isInit?)` | 可选 Router options、初始化标记 | `void` | 初始化配置、history 监听和当前路由。 |
| `stop(options?)` | `{ ignoreClearRoute?, isInit? }` | `void` | 释放监听；默认清理当前路由状态。 |
| `use(options)` | Router 扩展选项 | `void` | 更新 routes、query 转换和兼容配置。 |
| `addRoutes(routes, parentRoute?)` | 路由数组、可选父配置 | `void` | 规范化并添加或替换根路由、子路由配置。 |
| `resolveRouteName(resolver)` | `RouteResolveNameFn` | 注销函数 | 注册命名路由的后备解析器。 |

## 导航方法

| 方法 | 参数 | 说明 |
|---|---|---|
| `push(to, onComplete?, onAbort?)` | string 或 `RouteLocation` | 新增 history entry。 |
| `replace(to, onComplete?, onAbort?)` | string 或 `RouteLocation` | 替换当前 history entry。 |
| `redirect(to, onComplete?, onAbort?)` | string 或 `RouteLocation` | 在当前导航事务中选择替换目标。 |
| `go(deltaOrStack)` | number 或 `HistoryStackInfo` | 按步数或已记录栈项移动。 |
| `back()` / `forward()` | — | 后退或前进一项。 |
| `replaceQuery(key, value)` | 字段和值 | 更新一个 query 字段。 |
| `replaceQuery(object)` | query patch | 批量更新 query。 |
| `replaceState(state, matchedRoute?)` | state patch、可选匹配项 | 更新当前 history entry 的路由 state。 |

未传回调且运行环境支持 Promise 时，`push`、`replace`、`redirect` 返回导航 Promise：

| 结果 | Promise |
|---|---|
| 原目标提交 | resolve |
| 同一事务重定向后最终目标提交 | resolve |
| `next(false)`、异常、重定向目标中止或循环 | reject |
| 后续独立导航取代当前事务 | reject |

`push({ path, state })` 把 state 保存到新 entry，`replace` 保存到替换后的 entry。导航后可从 `currentRoute.state` 和目标 `MatchedRoute.state` 读取；刷新或 back/forward 后仍恢复该 entry 对应的数据。

`backIfVisited` 在 Navigation API 和 `navigationKey` 可用时精确遍历顶层 entry，从而避开 iframe 内部插入的 history；不支持的浏览器、旧共享 history 或 memory 模式自动使用原有 stacks/delta 行为。

## 导航守卫

```ts
router.beforeEach((to, from, next) => {
  if (!authenticated && to.path !== '/login') next('/login');
  else next();
});
```

当前 `beforeEach` 只负责注册，不返回取消注册函数；如需替换同一个守卫，请保留原函数引用并再次注册。`beforeResolve`、`afterUpdate`、`afterEach` 和 `onError` 会返回取消注册函数。

| API | 回调 | 能否改变导航 | 阶段 |
|---|---|---|---|
| `beforeEach(guard)` | `(to, from, next)` | 是 | 匹配和组件解析前。 |
| `beforeResolve(guard)` | `(to, from, next)` | 是 | 懒组件与组件守卫解析后、提交前。 |
| `afterEach(hook)` | `(to, from)` | 否 | 成功提交后。 |
| `onError(handler)` | `(error)` | 否 | 监听导航和解析异常。 |
| 路由/组件守卫 | enter、leave、update、resolve | 取决于阶段 | 路由配置或已渲染组件边界。 |

`next()` 放行，`next(false)` 中止，`next(location)` 重定向，`next(error)` 以异常结束。守卫中调用 `router.push`、`replace` 或 `redirect` 会处理同一个待决事务，外层守卫仍可统一调用 `next()`；已经作出的决议会忽略无效的后续调用。

多个 basename Router 共享一个 history 时，所有受影响且已挂载的 Router 会按注册顺序参与同一事务。任意 Router 拒绝都会阻止 history 提交，各 Router 的 `currentRoute` 保持不变，且不执行 `afterEach`。

## 路由创建与匹配

| 方法 | 返回值 | 说明 |
|---|---|---|
| `createRoute(to, options?)` | `Route` | 规范化位置并生成与 `currentRoute` 相同结构的匹配结果。 |
| `createMatchedRoute(config, match)` | `MatchedRoute` | 从配置和 path match 创建匹配快照。 |
| `cloneMatchedRoute(source, match?)` | `MatchedRoute` | 克隆匹配快照并保留已绑定组件、视图和守卫。 |
| `getMatched(to, from?, parent?)` | `MatchedRouteArray` | 返回父到子的匹配数组。 |
| `getMatchedPath(path?)` | `string` | 返回路径中已经匹配的部分。 |
| `getMatchedComponents(...)` | component 数组 | 获取匹配分支中的组件。 |
| `getMatchedViews(...)` | RouterView 数组 | 获取匹配分支中的已挂载视图。 |
| `nameToPath(name, options?)` | `string` | 将路由名解析为路径；absolute 模式可查询父 Router。 |

常用纯函数包括 `normalizeRoutes`、`normalizeRoute`、`normalizeRoutePath`、`normalizeLocation`、`matchPath`、`matchRoutes`、`resolveIndex`、`resolveRedirect`、`resolveAbort`、`readRouteMeta` 和 `configRouteProps`。

`walkConfigRoutes(routes, visitor)` 会遍历静态或函数型 children；visitor 返回 `true` 时终止整棵树遍历。`walkRoutes` 为兼容性保留。

## `RouterView`

```tsx
<RouterView router={router} name="default" fallback={<Loading />} />
```

| Prop | 类型 | 说明 |
|---|---|---|
| `router` | `ReactViewRouter` | 根视图必填；嵌套视图可以从 Context 获取。 |
| `name` | `string` | 命名视图名称，默认 `default`。 |
| `depth` | `number` | 显式匹配深度；通常由嵌套关系推导。 |
| `filter` | route filter | 过滤候选路由配置。 |
| `fallback` | React node 或函数 | 初始化或懒组件解析期间的占位内容。 |
| `container` | `ReactViewContainer` | 包装最终路由内容。 |
| `viewPresenter` | React 组件 | 展示层组件，接收 `{ children, route, router, view }`；可实现换页效果，但不接管路由组件的所有权。 |
| `beforeEach` / `afterEach` | view hook | 视图级导航钩子。 |
| `keepAlive` | boolean 或判断函数 | 控制当前视图的实例保留。 |
| `beforeActivate` | 判断函数 | 缓存视图重新激活前检查。 |
| `onRouteChange` | callback | 当前深度的匹配路由变化时调用。 |

函数型 `fallback` 接收 `{ parentRoute, currentRoute, toRoute, inited, resolving, depth, router, view }`。

`viewPresenter` 位于 `container` 和 KeepAlive 之后。跨导航应保持展示组件的类型稳定，以便管理退场画面。过渡视图和 RouterDrawer 都使用这一展示层；底层 `Drawer` 不依赖路由。过渡期间旧页只保留不可交互的 DOM 视觉快照，真实组件及状态仍由 RouterView/KeepAlive 管理。

### 位置保存与恢复

`RouterViewProps<TContainer = HTMLElement>` 新增 `getContainerRef: () => TContainer | null`、`onSavePosition(container, { to, from })` 和 `onScrollToPosition(container, position)`。后两个回调由 Transition 继承。路由 `meta.savePosition` 支持 boolean、字符串选择器（提供容器时在容器内查找），以及由元信息计算函数返回的目标选择函数；目标选择函数接收 `{ to, from, type: 'leave' | 'enter' }`。

PUSH 在视图更新前保存，POP 在新视图提交后恢复；首次挂载、取消导航和属性更新不触发。保存优先使用元信息，否则调用 `onSavePosition`；恢复优先调用 `onScrollToPosition`。零位置也会保存，恢复成功后删除记录。记录按 basename、视图名称、深度和路由路径隔离。

未提供 `getContainerRef` 时，默认工具通过 `position.getDefaultPositionContainer()` 使用 `document.body` 作为容器；显式提供 getter 时使用其返回值，空值不会回退到 body。`savePosition: true` 保存当前容器的位置（body 的读写映射到浏览器实际页面滚动根节点）；字符串选择器在当前容器内查找滚动元素，未匹配时仍使用容器。默认 body 范围内的选择器应唯一。函数及位置回调也收到当前容器。自定义适配器如需省略 getter，应自行提供可选的 `position.getDefaultPositionContainer()`，不会自动补齐。Transition 自动提供内容容器，显式 getter 优先。

`ReactRenderUtils` 按职责分组；router 配置使用 `PartialReactRenderUtils<TContainer>`，各组及组内方法均可省略。自定义适配器完全接管，组内也不补齐默认方法。

| 分组 | 方法 |
| --- | --- |
| position | getDefaultPositionContainer、getPosition、setPosition、queryPositionTarget |
| storage | getSessionStorage |
| document | createElement、createDocumentFragment、createComment |
| node | appendChild、removeChild、insertBefore、replaceChild、replaceWith、remove |
| reactDOM | createPortal、findDOMNode、unmountComponentAtNode |

`renderUtils` 新增可选的 `position.getPosition(container)`、`position.setPosition(container, position)`、`position.queryPositionTarget(container, selector)` 和 `storage.getSessionStorage()`。存储 getter 返回具有 `getItem`、`setItem` 的对象或 `null`，保留 `_REACT_VIEW_ROUTER_TRANSITION_POSITIONS_` 存储键。存储缺失或不可用时使用 router 实例内缓存。未配置 `renderUtils` 时，router 使用公开导出的 `defaultRenderUtils`，支持浏览器位置读写、选择器、存储及节点操作，不引入 ReactDOM；仅在调用方法时访问全局对象。显式传入自定义对象时完全使用该对象，不自动补齐默认方法。缺少容器 getter、容器或本次操作所需方法时跳过，并按原因去重警告。自定义回调可代替对应的读取、恢复方法。

```tsx
import React from 'react';
import ReactViewRouter, { RouterView } from 'react-view-router';

const router = new ReactViewRouter({
  routes: [{ path: '/home', component: Home, meta: { savePosition: true } }],
});
function App() {
  const container = React.useRef<HTMLDivElement>(null);
  return <div ref={container} style={{ height: 400, overflow: 'auto' }}>
    <RouterView router={router} getContainerRef={() => container.current} />
  </div>;
}
```

Transition 自动提供实际内容容器，包括 `transition="none"`；显式 getter 优先。默认适配器支持浏览器位置操作；自定义适配器需提供相应方法。服务端渲染不执行位置操作。

非 DOM 环境可以通过宿主适配方法使用抽象容器：

```ts
import type { PartialReactRenderUtils, RouterViewProps } from 'react-view-router';
type HostContainer = { offset: { x: number; y: number } };
// hostRenderUtils 是平台已有渲染实现，hostContainer 是宿主提供的容器。
const utils: PartialReactRenderUtils<HostContainer> = {
  ...hostRenderUtils,
  position: {
    ...hostRenderUtils.position,
    getPosition: (container) => ({ ...container.offset }),
    setPosition: (container, position) => {
      container.offset = { x: position.x || 0, y: position.y || 0 };
    },
  },
  storage: { getSessionStorage: () => hostSessionStorage }, // 也可以返回 null
};
const viewProps: RouterViewProps<HostContainer> = {
  getContainerRef: () => hostContainer,
};
// utils 传给 router.options.renderUtils，viewProps 传给 RouterView。
```

## `RouterLink`

```tsx
<RouterLink to={{ path: '/settings', query: { tab: 'profile' } }} replace>
  设置
</RouterLink>
```

| Prop | 说明 |
|---|---|
| `router` | 显式 Router；未传时从 Context 获取。 |
| `to` | string 或 `RouteLocation`。 |
| `replace` | 使用 `router.replace`。 |
| `append` | 相对于当前路由追加路径。 |
| `tag` | 实际渲染的元素类型。 |
| `activeClass` / `exactActiveClass` | 包含匹配和精确匹配时的 class。 |
| `exact` | active 判断是否必须精确匹配。 |
| `event` | 触发导航的 React 事件名，默认 click。 |
| `onRouteChange` | 路由变化回调。 |
| `onRouteActive` / `onRouteInactive` | 激活状态变化回调。 |

## `lazyImport` 与 `RouteLazy`

```ts
lazyImport((route, viewName, router, options) => import('./Page'), options?)
```

加载方法可以直接返回组件或 Promise；Promise 最终结果和 ES module 的 `default` 会被解包，并发解析共享同一个 pending Promise。

| `options.hydrate` | 行为 |
|---|---|
| 未配置 / `false` | 普通 browser 懒加载组件。 |
| `true` | 允许兼容 adapter 复用服务端输出。 |
| `{ required: true }` | 缺少兼容水合能力时抛错。 |
| `{ mismatch: 'client-render' \| 'preserve' \| 'throw' }` | 服务端内容不匹配时的策略。 |

其他 hydrate 字段包括 `owner`、`runtime`、`container`、`payloadRef`、`checksum`、`wrapElement` 和 `onError`。详见 [SSR 文档](./ssr_CN.md)。

## HOC

| HOC | 注入属性 | 说明 |
|---|---|---|
| `withRouter(Component, { withRoute? })` | `router`，可选 `route` | 从最近 Router Context 读取。 |
| `withRoute(Component, { withRouter? })` | `route`，可选 `router` | 包装组件随路由变化更新。 |
| `withMatchedRoute(Component, { withMatchedRouteIndex? })` | `matchedRoute`，可选 index | 读取当前 RouterView 深度的匹配项。 |
| `withMatchedRouteIndex(Component, { withMatchedRoute? })` | `matchedRouteIndex`，可选 route | 读取当前匹配深度。 |
| `withRouterView(Component)` | `routerView` | 注入最近 RouterView 实例。 |

## Hooks

所有 Hooks 都是 Browser/Client Component Hooks，不能在 React Server Component 中执行。

### Router 与匹配

| Hook | 参数 | 返回值与更新行为 |
|---|---|---|
| `useRouter(defaultRouter?)` | 可选后备 Router | 最近的 Router 或后备值。 |
| `useManualRouter(router, options)` | manual Router、basename、mode/history、routes 等 | `{ router, start }`；组件卸载时停止 Router。 |
| `useRoute(defaultRouter?, options?)` | `watch`、`delay`、`ignoreSamePath` | 当前 Route；只有启用 watch 才订阅变化。 |
| `useMatchedRoute(defaultRouter?, options?)` | watch 选项、`matchedOffset`、`commonPageName` | 当前视图深度的 MatchedRoute。 |
| `useMatchedRouteIndex(matchedOffset?)` | 深度偏移 | 非负 matched index。 |
| `useMatchedRouteAndIndex(...)` | 同上 | `[matchedRoute, index]`。 |
| `useRouterView()` | — | 最近的 RouterView 实例。 |

同一配置路由发生 query、params、state 或匹配快照变化时，如组件需要刷新，应传 `{ watch: true }`。

### 路由数据

| Hook | 返回值 / 说明 |
|---|---|
| `useRouteMeta(keyOrKeys, router?, options?)` | `[meta, setMeta]`；支持单字段或字段数组，并可通过 `ignoreConfigRoute` 只改当前匹配快照。 |
| `useRouteState(router?, initialState?, options?)` | `[state, setState]`；state 属于当前 history entry。 |
| `useRouteParams(router?, options?)` | 当前匹配项的动态 params。 |
| `useRouteQuery(router?, options?)` | 当前 Route 的 query。 |

### 事件、守卫与视图生命周期

| Hook | 说明 |
|---|---|
| `useRouteChanged(router, onChange, deps?)` | 注册路由变化插件并在卸载时清理。 |
| `useRouteMetaChanged(router, onChange, deps?)` | 监听 meta 变化，可限制依赖字段。 |
| `useRouteGuardsRef(ref, guards, deps?)` | 通过 `forwardRef` 为函数组件暴露 leave/update/resolve 守卫。 |
| `useRouterViewEvent(name, onEvent, unshift?)` | 注册当前 RouterView 的内部生命周期事件。 |
| `useViewActivate(onEvent)` | KeepAlive 视图重新激活时调用。 |
| `useViewDeactivate(onEvent)` | KeepAlive 视图失活时调用。 |

### `useRouteTitle`

```ts
useRouteTitle(props?, defaultRouter?, deps?)
```

遍历路由配置，将 `meta.title`、`meta.visible` 等信息转换为菜单、标签页、面包屑和当前路径模型。

| 参数 | 说明 |
|---|---|
| `props.maxLevel` | 最大检索层级，默认 `99`。 |
| `props.filter` | 过滤候选路由。 |
| `props.filterMetas` | 指定会触发标题模型重建的 meta 字段。 |
| `props.manual` | 初始不检索，直到调用 `refreshTitles()`。 |
| `props.matchedOffset` | 相对最近 RouterView 调整标题树根深度。 |
| `props.commonPageName` | 公共页面用于恢复来源页面模型的 meta 字段名。 |
| `props.titleName` | 标题字段名，默认 `title`。 |
| `props.onNoMatchedPath` | 当前地址不在模型中时使用 `:first`、固定路径或回调处理。 |
| `defaultRouter` | Context 外部使用的显式 Router。 |
| `deps` | 触发模型重建的额外 React 依赖。 |

返回值包含 `titles`、`setTitles`、`refreshTitles`、`matchedRoutes`、`matchedTitles`、`currentPaths` 和 `parsed`。菜单通常使用 `currentPaths.slice(0, -1)` 作为展开项，最后一项作为唯一选中项。

## 组件守卫

```tsx
export default withRouteGuards(Page, {
  beforeRouteEnter(to, from, next) { next(); },
  beforeRouteLeave(to, from, next) { next(); },
  beforeRouteUpdate(to, from) {},
  beforeRouteResolve(to, from) {},
  afterRouteLeave(to, from) {},
});
```

函数组件可组合 `React.forwardRef` 与 `useRouteGuardsRef` 暴露守卫；不要在同一个 ref 上再单独调用 `useImperativeHandle`。

## 插件 `ReactViewRoutePlugin`

```ts
const uninstall = router.plugin({
  name: 'analytics',
  onRouteChange(route, previousRoute) {
    track(route.fullPath, previousRoute?.fullPath);
  },
});
```

同名插件会替换旧实例；`plugin` 返回注销函数。插件按注册顺序执行，`this` 指向插件对象。某事件返回非 `undefined` 时会作为下一插件的 `prevRes`；抛错会停止后续插件，并在错误消息前添加插件名和事件名。

| 事件组 | 主要事件 |
|---|---|
| 安装与生命周期 | `install`、`uninstall`、`onStart`、`onStop` |
| 路由树 | `onRoutesChange`、`onWalkRoute` |
| 导航 | `onRouteGo`、`onRouteing`、`onRouteAbort`、`onRouteChange` |
| 组件与守卫 | `onRouteEnterNext`、`onRouteLeaveNext`、`onGetRouteComponentGuards`、`onGetRouteInterceptor` |
| 懒加载与视图 | `onLazyResolveComponent`、`onViewContainer` |
| 数据 | `onRouteMetaChange` |

`onRouteGo` 返回 `false` 表示插件接管 dispatch，此时插件必须且只能调用一次完成或中止回调。

## KeepAlive 与换页动画

KeepAlive 可以配置在 route、RouterView 或 Router 上。DOM 节点保留需要 `reactDOM.createPortal`、`document.createElement`、`document.createDocumentFragment`、`node.appendChild` 和 `node.insertBefore`，缺失时抛出列明方法的错误。默认工具不包含 `reactDOM.createPortal`，请配置 `react-view-router/dom` 完整适配器或提供相应方法；`useViewActivate` 和 `useViewDeactivate` 用于监听缓存视图状态变化。

```ts
import { RouterView } from 'react-view-router/transition';
```

`transition` 支持以下名称，也可传入包含 `name`、`zIndex`、`containerStyle`、`containerTag` 的对象：

| 名称 | 效果 |
|---|---|
| `slide` | 新页面从右侧滑入覆盖旧页面，POP 向右退出露出旧页面。 |
| `slide-up` | PUSH 从上方向下入场，POP 向上退场。 |
| `slide-down` | PUSH 从下方向上入场，POP 向下退场。 |
| `fade` | 两页交叉淡入淡出。 |
| `fade-slide` | 淡入淡出配合 24px 水平位移，POP 反转方向。 |
| `zoom` | 淡入淡出配合轻微缩放，POP 反转缩放方向。 |
| `fade-through` | 前 40% 时间旧页淡出，后 60% 时间新页配合轻微缩放淡入。 |
| `carousel` | 两页同时水平推移，POP 反转方向。 |
| `none` | 无动画。 |

`transitionDuration?: number` 设置整次动画的总时长，单位为毫秒，默认 `300`，包括 `fade-through` 的两个阶段。CSS 过渡与结束计时使用同一时长。有方向的动画根据 PUSH/POP 选择方向；REPLACE 等其他导航通过 `transitionFallback` 选择效果。

```tsx
<TransitionRouterView transition="fade-slide" transitionDuration={240} />
<TransitionRouterView transition="slide-up" />
```

`RouterDrawer` 使用基础 `RouterView` 的 `viewPresenter` 渲染子路由。默认在当前位置渲染，由外层提供 `position: relative; overflow: hidden;` 和明确高度。`portalContainer` 仅接受容器 getter：`portalContainer={() => document.body}` 可挂载到 body，也可返回其他 HTMLElement；未提供 getter 或返回 null 时不调用 `reactDOM.createPortal`。样式源码是 `drawer/src/index.scss`，入口自动引入样式，无需手动导入 CSS。

`position` 支持 `'right' | 'left' | 'bottom' | 'top' | 'center'`，默认 `'right'`。面板贴合对应边缘，沿对应坐标轴执行进出动画，并支持向该方向滑动关闭。`maxWidth`、`maxHeight` 接受 CSS 尺寸：数字表示 px，字符串可以是 `'70%'` 等单位。未指定宽高时面板填满容器；最大尺寸限制作用于面板，不影响遮罩或 portal 容器。

```tsx
<RouterDrawer position="right" maxWidth={420} />
<RouterDrawer position="bottom" maxHeight="60%" />
<RouterDrawer position="left" maxWidth={320} mask={false} />
<RouterDrawer maxWidth={320} maskClosable delay={200} />
<RouterDrawer position="center" maxWidth="80vw" maxHeight="calc(100% - 48px)" maskClosable />
<RouterDrawer position="center" width="max-content" height="max-content" maxWidth="90vw" maxHeight="90vh" />
```

`mask` 控制是否显示遮罩，默认 `true`。遮罩与面板使用相同的 `delay` 时长淡入淡出（默认 200ms），不改变面板内容透明度。`mask={false}` 时不渲染遮罩、不拦截面板外的点击，挂载到 body 时也不锁定页面滚动；方向、尺寸和进出动画保持有效。示例通过方向单选按钮组及“显示遮罩”开关调整这些设置，默认不限制尺寸。


居中模式水平、垂直居中并使用淡入淡出动画，即使 `touch=true` 也禁用滑动关闭。尺寸字符串支持 `vw`、`vh`、`%`、`calc()`；百分比相对容器，视口单位相对视口。示例中无效尺寸会提示错误并保留最后有效设置。

抽屉路由组件内可放置 `RouterView` 或 `RouterDrawer`，对应下一级 `children` 路由。内层手势和遮罩仅作用于内层；关闭沿用 `router.back()` 的历史回退语义，不强制跳转父路径。多个 body 遮罩共享滚动锁，最后一层退出后恢复页面滚动。

`width`、`height` 决定面板尺寸，默认均为 `100%`；`maxWidth`、`maxHeight` 限制尺寸上限，默认不限制。四者均接受数字（px）或 CSS 尺寸字符串，例如 `max-content`、`vw/vh/%/calc()`；宽高还支持 `auto`。例如宽高设为 `max-content`，最大宽高设为 `90vw/90vh`，面板按内容大小显示，同时不超过视口的 90%。百分比相对容器，视口单位相对视口。

`maskClosable` 控制点击遮罩是否关闭，默认 `false`；开启时点击面板外的遮罩会沿用关闭按钮的路由回退行为，点击面板内容不会关闭。示例增加“点击遮罩关闭”开关，无遮罩时禁用该开关。`delay` 可自定义面板和遮罩进出时长，默认 200ms。

Drawer 和 KeepAlive 共用 RouterView 的事件及类生命周期派发逻辑。打开抽屉时，先通知父路由的 `useViewDeactivate`，再调用 `componentWillUnactivate`；返回父路由时，先调用 `componentDidActivate`，再通知 `useViewActivate`。事件保留 `type`、`router`、`source`、`target`、`to`、`from` 契约：`source` 是 Drawer 视图，`target` 是父路由。抽屉自身保持激活。取消导航以及在已打开抽屉内切换子路由，不重复通知父页面的可见状态变化。


`react-view-router/drawer` 仅保留默认组件导出，旧的命名类导出已移除。可选的 `ref` 沿用基础 `RouterView` 的行为：路由组件支持 ref 时指向当前路由组件实例，而不是视图或 Drawer 实例；也可能为 `null`。

业务页面应为动画提供有明确高度的展示容器。示例使用 `position: relative; overflow: hidden;`，以限定页面滑动和裁剪范围；`TransitionRouterView` 内部还会创建自己的定位、裁剪舞台，因此这两个样式不是外部容器必须重复设置的运行前提。

## history@4 兼容层

```tsx
const history4 = router.history.createHistory4({
  basename: '/module',
  getUserConfirmation(message, callback) {
    callback(window.confirm(message));
  },
});
```

返回对象兼容 history@4.10.1 的 `action`、`location`、`length`、`createHref`、`push`、`replace`、`go`、`goBack`、`goForward`、`listen` 和单个活动 `block`。底层仍提交到原 ReactViewRouter history，因此第三方 React Router 模块与宿主守卫共享同一导航事务。

## 服务端路由与水合工具

| 方法 | 返回值 | 是否加载组件 |
|---|---|---|
| `collectHydratableRoutes(routes)` | 完整 `HydratableRouteInfo[]` | 否 |
| `matchHydratableRoutes(routes, requestUrl)` | 当前请求的匹配描述 | 否 |
| `resolveHydratableRoutes(routes, requestUrl)` | Promise，包含最终组件 | 是 |
| `wrapHydratableRouteElement(info, element)` | 包装后的 React node | 已由调用方提供 element |

根入口还导出平台中立的 `RouteRuntimeDescriptor`、`RouteRuntimeContext`、`RouteRuntimeAdapter`、`NavigationTransaction`、`NavigationSignal`、`createRouteRuntimeDescriptor`、`resolveRuntimeCompatibility`、`selectRouteRuntimeAdapter`、`RouteRuntimeAdapterContext` 和 `RouteRuntimeAdapterProvider`。

独立 React 适配器必须从显式子入口导入：

```ts
import { createModernStandaloneRouteSSRAdapter } from 'react-view-router/standalone-modern';
import { createLegacyStandaloneRouteSSRAdapter } from 'react-view-router/standalone-legacy';
```

这些能力只处理 ReactViewRouter 自己拥有的独立路由岛，不会接管外部 SSR 框架的 Server Component 协议。

## 查询字符串工具

`parseQuery(search, queryProps?)` 和 `stringifyQuery(object)` 是默认 query 编解码工具。Router 实例提供同名方法，并应用 Router 的全局 `queryProps` 转换配置。

## 兼容性边界

- Core 与 legacy standalone bundle 保持 Chrome 49 语法目标；动态 import 仍需业务 bundler 提供兼容 chunk loader。
- Demo 网站自身以现代浏览器为目标，不代表库的最低浏览器基线。
- React Native 使用 memory router，不读取 DOM、Navigation API 或水合 adapter。
- 所有 React Hooks 都是 Client Component Hooks；服务端仅使用纯路由树、匹配和水合清单工具。
- 一个页面混用新旧 ReactViewRouter 时，history runtime 能力必须通过特性检测；缺少 `navigationKey` 时智能回退自动采用旧 stacks 算法。
- 避免在同一浏览器 bundle 中分别通过 CommonJS 和 ESM 重复加载本包，以免产生两套 Context 或类实例。
