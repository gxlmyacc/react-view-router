# React 16 示例

[English](./README.md) | [简体中文](./README_CN.md)

这个 Create React App 启动项目演示 ReactViewRouter 与 React 16 的集成。工作台、中台路由、嵌套懒加载路由、命名 `RouterView`、隔离的 SCSS 和守卫日志均来自共享的 [`demo_react_shared`](../demo_react_shared/README_CN.md) 应用。

## 运行

```bash
npm install
npm start
```

构建环境需要 Node 14.17 或更高版本。与 React 17/18 启动器一样，这个 demo 面向现代开发浏览器；Chrome 49 兼容性由 `fixtures/chrome49-legacy` 针对发布后的 ReactViewRouter 库单独验证。

然后打开 `http://localhost:8081/`。Create React App 已提供热更新和 browser 路由回退。由于 CRA 4 使用 Webpack 4，启动包装器会只在 Node 17+ 自动启用 OpenSSL legacy provider；Node 14 不会添加该参数。

**Guard execution order** 面板按每次导航分组，紧凑标题展示 `from → to` 和最终结果；固定高度的日志列表会在新增事件后自动滚到底部。`config-overrides.js` 只负责 workspace alias、共享源码转译和 `babel-preset-react-scope-style@0.1.0-alpha.5` 样式隔离。

启动器还会在 start/build 前将 Playground 使用的 TypeScript 编译器和 Worker 准备为本域静态资源；这些资源只在进入在线调试页面时按需加载，不依赖运行时 CDN。

生产构建使用 `npm run build`。Standalone SSR 请参考 [`demo_ssr`](../demo_ssr/README_CN.md)。
