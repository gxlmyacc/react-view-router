# renderUtils 方法分组方案

保留方法名称，按职责移动到五个对象：

| 对象 | 方法 |
| --- | --- |
| position | getDefaultPositionContainer、getPosition、setPosition、queryPositionTarget |
| storage | getSessionStorage |
| document | createElement、createDocumentFragment、createComment |
| node | appendChild、removeChild、insertBefore、replaceChild、replaceWith、remove |
| reactDOM | createPortal、findDOMNode、unmountComponentAtNode |

## 实现范围

- 完整 ReactRenderUtils 类型按组组织；router 配置支持各组及组内方法的部分实现。
- 默认工具提供 position、storage、document、node；dom 入口复用默认工具并提供 reactDOM。
- 自定义适配器完全接管，不自动合并缺失组或方法。
- KeepAlive 检查实际需要的能力，错误列出完整方法路径。
- 默认 body、自定义容器、Transition 容器优先级及 savePosition 行为不变。
- 直接迁移库、测试、示例、生成类型及中英文文档；不保留平铺与分组两套接口。
- 同步两个仓库，保留各自包名及已有修改。

## 验证

覆盖部分自定义适配器、缺失能力、默认位置保存恢复、SSR 安全导入及完整适配器 KeepAlive 缓存。运行 Jest 与覆盖率、相关 ESLint、源码类型检查和构建，浏览器复查示例。

## 改动前 true 的语义

添加默认 body 容器之前，普通 RouterView 保存 getContainerRef 返回容器的滚动位置；未提供 getter 时提示并跳过。TransitionRouterView 默认提供自身内容容器，显式 getter 优先。true 不查找内部滚动元素。
