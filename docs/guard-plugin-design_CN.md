# 内置路由守卫插件设计

[English](./guard-plugin-design.md) | [简体中文](./guard-plugin-design_CN.md)

## 状态

这是一个优先级较低的设计提案，并不是已经承诺的公开 API。当前守卫实现仍是兼容性基线。

## 目标

把守卫收集与执行提炼成内置插件，让框架自身能力也走插件扩展路径，从而反向完善插件机制；同时保持 `beforeEach`、`beforeResolve`、`afterEach`、路由配置守卫和组件守卫的现有用法不变。

## 边界

路由 core 仍必须拥有导航事务：共享 history 协调、目标规范化、重定向循环、提交/回滚、多 router 竞争取消及完成回调 exactly-once。守卫插件可以决定事务继续、重定向或中止，但不能自行提交 history。

现有事件是有用的扩展点，但还不是完整的守卫引擎协议。尤其 `onRouteing`、`onGetRouteComponentGuards`、`onGetRouteInterceptor` 没有显式描述全部阶段和事务身份；仅拼接这些回调来重写守卫，会让顺序与取消规则变成隐式行为。

## 建议阶段

1. core 创建具有稳定身份的导航事务。
2. 内置插件收集全局、路由配置、组件实例及懒加载组件守卫。
3. 按“离开时子到父、进入/解析时父到子”执行，并在插件内部暂存 `next(callback)`。
4. 插件向 core 返回放行、中止、重定向或错误结果。
5. core 协调共享同一 history 的所有 router，只执行一次提交或回滚。
6. 仅提交成功后，插件才按现有顺序执行完成回调、update 守卫、leave-after 和 `afterEach`。

## 兼容要求

- 公开守卫注册 API 和回调签名不变。
- 后续守卫中止时，必须丢弃此前所有 `next(callback)`。
- 懒加载守卫必须在提交前解析，并保持父子顺序。
- 多个 basename router 共享 history 时必须参与同一事务投票。
- memory、browser、hash、SSR hydration、React Native、旧共享 history 对象和 Chrome 49 降级行为均保持一致。
- 内置行为不能依赖可被用户改变的普通插件顺序。初期应使用内部优先级/阶段通道，避免应用意外用同名插件替换守卫插件。

## 迁移门禁

提炼前先用直接测试固定插件生命周期和全部事件契约。新守卫实现应先以内部对照模式与现有管线同时运行；只有守卫顺序、中止、重定向、懒加载、多 router 和完成回调测试完全等价，且覆盖率不下降后，才替换当前实现。

