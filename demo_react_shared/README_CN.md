# React 示例共享应用

[English](./README.md) | [简体中文](./README_CN.md)

这个包集中维护 React 16、17、18、19 launcher 共用的工作台和自包含示例。它是各版本 demo 的共享实现包，不需要单独启动。

开发时每次编译成功（包括只有警告的情况）都会自动整页刷新，并保持当前 URL。示例关闭 Fast Refresh 和 HMR，确保路由单例、缓存组件和懒加载资源引用属于同一次构建；编译报错时不刷新，修复后再刷新。修改 launcher 配置后，已运行的开发服务器需要重启才能生效；生产构建不受影响。

Drawer 示例提供父页面生命周期日志。类组件父页面在子抽屉打开时执行 `componentWillUnactivate`，关闭时执行 `componentDidActivate`；反复打开、关闭会保留父页面实例和备注。`HomePageRoute.tsx` 通过 Hooks 获取 router 和示例 Context，并转发类组件 ref，让生命周期方法能够被调用。

## 目录结构

```text
src/
  workspace/                   # 前台外壳：头部、语言、菜单、共享 history
    App.tsx
    App.scss
    history/index.ts
    routes.ts                  # 只配置中台根路由和路由元信息
  examples/
    guard-navigation/         # 守卫内直接导航，以及随后被忽略的 next()
    route-transition/         # 直接嵌入 Web/移动端换页动画 RouterView 示例
    keep-alive/               # 缓存草稿、保留输入状态与视图生命周期事件
    drawer/                   # 将嵌套子路由展示在抽屉中
    hooks-meta/               # 路由 Hooks 与元信息检查器
    route-guards/              # 样式隔离的独立守卫中台
      App.tsx                  # 接收 basename/mode 并调用 useManualRouter
      App.scss                 # 通过 ?scoped 引入
      history/index.ts         # 仅导出 new ReactViewRouter({ manual: true })
      routes.ts                # 静态路由配置
      global-guards.ts
      guards/
      pages/                   # 路由页面通过 useRouter() 获取 router
  playground/                 # TSX 编辑器、Worker 协议与沙箱运行时
  testing/                     # 集成测试夹具，不作为业务最佳实践
```

工作台拥有 browser history，只配置各中台的根路由；菜单通过 `useRouteTitle` 从路由 `meta` 取得标题，并由唯一的工作台 `RouterView` 使用当前中台根路径作为 basename 渲染命中的中台。在这个挂载边界上，前台明确把 `basename` 和 `mode` 传给中台。中台因此不依赖上层 ReactViewRouter Context：它在 `history/index.ts` 中创建 manual router，由根组件使用宿主传入的契约调用 `useManualRouter(router, { basename, mode, routes, manual: true })`，再在 effect 中启动。全局 `router.beforeEach`、`beforeResolve`、`afterEach` 注册放在中台入口；进入中台自己的 `RouterView` 后，内部路由组件仍通过 `useRouter()` 获取中台 router。

网站的“快速开始”提供可直接复用的 `routes.ts`、`router.ts`、`index.tsx` 三文件代码，并增加独立的“前台与中台集成”指南。基础导航中台同时演示动态参数、`paramsProps`、`defaultProps`、RouterView 传参、计算路由元信息，以及通过 `absolute: true` 返回前台路由。

“路由配置实践”在同一棵配置树中对比 `index`、`redirect`、嵌套 children、动态参数、路由元信息和方法形式的 `lazyImport`。“功能索引”提供可搜索、可分类筛选的能力地图；每张卡片或者跳转到确实相关的运行示例，或者在尚无合适 Web 示例时展开关键行为说明。独立的“API 参考”页面直接渲染 `docs/api_CN.md`，仓库 Markdown 与网站不再重复维护方法签名和参数说明。

“Hooks 与路由元信息”中台把 `useRouteTitle` 作为完整导航模型：路由 meta 生成 5 个 Hook 分类、18 个 Hook 参考页、标签页和面包屑。每个叶子菜单说明一个 Hook 的用途、签名、参数及返回值。`currentPaths` 的祖先部分用于展开菜单，最后一项是唯一选中项；另保留综合运行检查器演示路由数据和 meta 更新。

每个示例使用与组件同名的样式文件并通过 `?scoped` 引入。React 16–19 launcher 都接入 `babel-preset-react-scope-style@0.1.0-alpha.5`，后续新增中台示例不会污染已有模块样式。

在线调试器提供支持 TS、TSX、CSS、SCSS 的语法高亮虚拟文件树，其中 SCSS 会分别高亮变量、选择器、属性、字面量和嵌套运算符。Worker 会分别转译脚本文件、解析相对 import，并将样式合并后注入 `sandbox="allow-scripts"` 的 iframe。编译器和 Worker 都随站点部署，不依赖运行时 CDN；编辑后的工作区只缓存在当前浏览器。

每个可运行示例都提供“查看代码”入口。启动或构建时会从真实示例目录生成同域源码清单，弹窗以只读模式复用 Playground 的文件树工作区。公共工作区已经保留 `editable` 边界，后续若要开放示例在线修改，不需要替换现有源码查看器。

换页动画中台按业务代码的实际方式引入 `react-view-router/transition`。KeepAlive 中台使用 `react-view-router/dom`、路由级缓存配置、激活/失活 Hook 与动画开关，演示有无动画时草稿状态都能在切换页面后保留。Drawer 中台通过 `react-view-router/drawer` 渲染嵌套子路由，打开与关闭时 URL 同步变化；父页面 `.drawer-home-page` 自身就是抽屉的定位与裁剪容器，不再额外放一个空白容器。四个 launcher 都把这些公开子路径映射到本地产物。

换页动画示例通过 `TransitionRouterView` 的 `transitionDuration` 参数（毫秒）调节时长。业务页面需提供有明确高度的展示容器；示例的容器设置了 `position: relative; overflow: hidden;`，组件内部还会创建定位并裁剪的动画舞台。KeepAlive 示例在预览页提供“返回”按钮以观察 POP 动画。Drawer 使用原生 CSS 动画和触摸事件，不再依赖动画、滑动手势包。

API 阅读器会把 Markdown 中引用的仓库文档与 SSR 示例源码一并打包；点击这些链接仍留在站内，且可切换中英文。开发时的错误面板直接显示在页面中，避免透明 iframe 覆盖全屏却不展示报错。

根项目集成测试会直接引入这里的真实 demo 路由树，验证懒加载父子组件守卫顺序和导航中断行为。

守卫日志固定高度并独立滚动，新增事件会自动滚动到底部。日志按每次导航分组，每个紧凑区块展示 `from → to`、最终结果和组内守卫顺序；头部语言开关会让整个工作台在中英文之间切换。

“守卫中发起导航”示例说明了一个特意保留的控制流能力：公共拦截方法可以在守卫执行期间调用 `router.push`、`router.replace` 或 `router.redirect`；外层守卫仍可照常调用 `next()`。示例对比精确同一目标，以及两种目标发生变化的重定向链：`/parent → /parent/child`、pathname 不变但 query 改变。最终目标提交后事务 Promise resolve，属于已失效精确 `fullPath` 的 callback 则会被忽略。

滚动位置保存示例（`/examples/save-position`）对比普通 RouterView 与 Transition。滚动列表、打开预览并返回可验证 POP 恢复；关闭保存后返回可对比新列表从顶部开始的行为。查看代码可以看到容器内选择器、容器 getter 和 DOM renderUtils 配置，本例不启用 KeepAlive。
