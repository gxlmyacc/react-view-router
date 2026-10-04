# 两个 Router 项目的 core-js 3 迁移计划

状态：已实施，2026-10-04。

## 范围与现状

- 开源项目：`E:\文档\Github\react-view-router`。
- 内部项目：`E:\文档\工作目录\rainbow-router`。
- 两边根依赖均为 `core-js: ^2`，Babel 两个生产分支均为 `corejs: 2`，通过 `useBuiltIns: usage` 注入全局 polyfill。
- 开源项目 React 16–19 demo 已改为 `react-view-router: file:..`；内部项目这四个 demo 仍为 `rainbow-router: 0.0.6`。
- 两边 native、SSR demo 已引用 `file:..`；共享 demo 使用 peerDependencies，保留其契约。

## 实施步骤

1. 检查两边工作区现有修改、源代码中的显式 core-js 导入、构建配置、相关锁文件和已有回归测试。保留两个项目原有浏览器 target 差异。
2. 查询 core-js 3 的正式版本和 Babel 官方配置说明，选用兼容现有 Node/Babel 的稳定版本；两边使用同一依赖范围，并在 Babel 明确配置对应 minor 版本。
3. 升级根依赖及 Babel 的两个生产分支；迁移显式 core-js 2 路径，保留现有 usage 全局 polyfill 机制。
4. 将两边 React 16–19 demo 改为对应包名的 `link:..`。实施时发现 Yarn 1 的 `file:..` 会复制整个父项目并遇到临时文件错误，因此改用直接链接；重建父项目后立即使用最新产物。
5. 更新两个项目根锁文件及受影响 demo 的锁文件/本地依赖，避免残留旧 Router 发布包入口；不整体删除锁文件，不无关升级依赖。第三方依赖仍可能需要 core-js 2，这种间接依赖不强制覆盖。
6. 重新构建 core、dom、drawer、transition 的 ESM/CommonJS/类型产物，检查输出中的 core-js 导入已采用 core-js 3 路径。

## 验证

- 用现有测试框架验证 Babel 注入、旧浏览器目标的 polyfill 解析和现代 API 的实际行为。
- 执行两边库构建与相关测试；运行必要的 lint/typecheck。
- 对两边 React 16 demo 执行构建与页面冒烟验证，并检查 React 17–19 demo 的本地依赖解析。
- 区分现有问题和本次迁移导致的问题；没有实际 Chrome 49 环境时，明确报告其运行时验证未完成。

## 执行约束

- 长任务开始前启动全局 keep-awake 脚本，确认 `System sleep prevented`；结束时停止。
- 内部项目位于当前可写根目录之外，修改或安装时使用针对明确路径的权限提升请求。
- 不提交、推送或发布，不修改无关配置，不覆盖已有业务改动。

## 完成记录

- 两边根依赖均为 `core-js: ^3.50.0`，Babel 两个生产分支与 Chrome 49 fixture 均配置 `corejs: '3.50'`。
- 两边根锁文件、四个 React demo 锁文件及 fixture npm 锁文件均已更新；八个 demo 的实际安装路径均指向各自根项目。
- 两边库全量构建与类型产物生成通过；产物没有 core-js 2 模块路径，注入模块均能解析。
- 新增两个回归测试，验证依赖与配置契约，以及移除 Object.fromEntries、Array.flat、Promise.allSettled 后的实际 polyfill 行为。
- 修复开源版更名后的导出哈希和文档矛盾断言；添加根目录测试所需的样式插件版本；修复开源版 fixture bootstrap 脚本路径。两边 fixture 均处理预期的守卫 Promise 拒绝，其他异常继续暴露。
- 两边均为 109 个测试套件、1282 个测试全部通过。按用户确认，开源版不沿用内部 CHANGELOG.md，已移除 README、API 文档中的链接和对应发布清单测试要求；内部项目的记录保持不变。
- 两边 React 16 demo 生产构建及静态资源审计通过；两边 Chrome 49 fixture 打包与 ES5 语法检查通过。
- 现代 Chrome 下，两边 fixture 的守卫拒绝、懒加载和 POP 返回，以及两边 React 16 生产页面加载均通过，没有页面异常。
- 本次修改的 lint 通过。测试目录全量 TypeScript 检查仍有其他测试、组件和声明文件中的类型错误；新增 core-js 测试未报告类型错误。
- 本轮没有使用真实 Chrome 49；旧 verification.json 仍是升级前的历史记录，不能证明 core-js 3 的真实 Chrome 49 验证。
