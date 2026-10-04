# GitHub Pages 示例网站

网站地址：https://gxlmyacc.github.io/react-view-router/

网站发布 React 16 demo 的静态构建产物。SSR 和 React Native 示例提供源代码说明，不在 Pages 上运行服务端或原生应用。

## 首次启用

1. 将本次代码、`docs`、各示例目录和 `.github/workflows/demo-site.yml` 一起提交到公开 GitHub 仓库。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
3. 将代码合入并推送到 `master`，或在 **Actions → Deploy React 16 demo site → Run workflow** 中选择 `master` 手动部署。
4. 等待部署工作流成功，再打开上方地址。首次部署完成前，地址可能返回 404。

## 后续更新

推送 `master` 会自动执行依赖安装、库构建、共享 demo 类型检查和 lint、交互测试、静态网站构建与资源审计，然后上传并部署 `demo_react16/build`。

工作流通过 `PUBLIC_URL=/react-view-router` 配置项目站点的资源前缀。锁文件使用公共 npm 下载地址；本地 `link:..` 链接参与构建，部署产物只包含生成的静态文件。

README 的文档和源代码示例链接直接指向公开 GitHub 仓库，避免 npm 页面将相对路径解析到错误位置。npm 包包含 API 文档，但不包含完整 demo 或 fixture，因此这些示例链接依赖对应文件已提交到 GitHub。

## 本地检查

在根目录执行 `yarn build-demo-site` 可以构建并审计示例网站。需要模拟 Pages 子目录时，在构建 React 16 demo 前设置 `PUBLIC_URL=/react-view-router`。
