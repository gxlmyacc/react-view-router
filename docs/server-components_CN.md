# Server Components 与 hooks

[English](./server-components.md) | [简体中文](./server-components_CN.md)

ReactViewRouter 实例、RouterView、history、Context 订阅和所有现有 `use*` hooks 都属于 browser Client Component 能力，不能在 React Server Component 中直接调用。

Server Component 中不能使用：`useRouter`、`useManualRouter`、`useRoute`、`useRouteMeta`、`useRouteMetaChanged`、`useRouteState`、`useRouteParams`、`useRouteQuery`、`useMatchedRoute`、`useMatchedRouteIndex`、`useMatchedRouteAndIndex`、`useRouterView`、`useRouterViewEvent`、`useRouteGuardsRef`、`useRouteChanged`、`useViewActivate`、`useViewDeactivate`、`useRouteTitle`。

正确边界是：Server Component 负责请求态数据和服务端输出，承载它的框架负责页面级路由；Client Boundary 内才可以创建或读取 ReactViewRouter，并使用 RouterView 与上述 hooks。ReactViewRouter 不提供任何框架专用 adapter，也不要求为普通 Client Boundary 再配置一套路由。

`createRouteRuntimeDescriptor` 等纯函数用于 ReactViewRouter 自己拥有的 standalone SSR route island，不代表 ReactViewRouter 能接管外部框架的 Server Component 协议。
