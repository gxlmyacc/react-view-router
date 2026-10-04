# 示例网站 Chrome 49 生产兼容方案

## 已确认问题

- React 16 示例当前 browserslist 为 Chrome >=78；react-view-router 的 es 构建目标为 Chrome >=86，esm（CommonJS）构建目标为 Chrome >=49。
- 线上 main.7269be31.chunk.js 包含 async function，Chrome 49 无法解析，导致启动前空白。
- 示例通过别名引用库的 es 目录，因此仅修改页面源码的编译目标不足以覆盖全部脚本。

## 修改范围

- 示例 production 浏览器目标改为 Chrome 49，保留开发构建的现代目标。
- 生产示例优先复用 react-view-router 已有的 Chrome 49 esm（CommonJS）产物；默认 import/module 及当前别名会选择 es，需要同步调整核心与 dom 等相关别名。开发仍使用 es。react-view-router 的 CommonJS 目标目前为 Chrome 86，需协调使两边低版本产物一致。
- 生产构建转译页面及必要依赖，避免现代语法漏出；不降低 es 独立发布产物的现有目标。
- 检查按需加载的示例、playground worker 与 TypeScript 编译器等独立脚本，纳入相同语法要求或明确功能降级。
- 按实际使用补齐运行时能力；审查已有 polyfill 的覆盖，不只修复 async function。
- 增强现有 verify-demo-site，检查生产脚本兼容语法，并在 Pages 发布前执行。
- 同步 react-view-router 与 react-view-router，保留工作区已有修改。

## 验证与发布

- 构建 React 16 生产网站，审计入口、动态 chunk 与独立 worker 脚本。
- 运行相关检查与现代浏览器 smoke；若未获得真实 Chrome 49 运行环境，明确标注尚未做实际 Chrome 49 验证。
- 不自行部署；线上地址需在修复提交并重新运行 Pages workflow 后更新。
