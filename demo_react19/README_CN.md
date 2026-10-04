# React 19 示例

[English](./README.md) | [简体中文](./README_CN.md)

该启动项目使用 React 19 `createRoot`，业务页面和路由来自共享的 [`demo_react_shared`](../demo_react_shared/README_CN.md)。共享应用演示嵌套懒加载路由、命名 outlet，以及可见的路由守卫执行顺序。

```bash
npm install
npm start
```

生产构建使用 `npm run build`。`config-overrides.js` 会直接解析共享源码并隔离各示例样式。
