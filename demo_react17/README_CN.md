# React 17 示例

[English](./README.md) | [简体中文](./README_CN.md)

这个 Create React App 启动项目演示 ReactViewRouter 与 React 17 的集成。JSX 页面、嵌套懒加载路由、命名 `footer` outlet 和可视化守卫顺序日志都来自 React 16–19 共用的 [`demo_react_shared`](../demo_react_shared/README_CN.md)。

## 运行

```bash
npm install
npm start
```

生产构建使用 `npm run build`。`config-overrides.js` 会直接解析共享源码，并通过 `babel-preset-react-scope-style@0.1.0-alpha.5` 隔离各中台示例样式。该示例的 browserslist 是 Chrome 78+；Chrome 49 兼容认证请使用专门的 [`Chrome 49 fixture`](../fixtures/chrome49-legacy/README.md)。
