# React Native memory router 示例

[English](./README.md) | [简体中文](./README_CN.md)

这个示例把平台无关的路由能力与 React Native 集成分开，业务 screen 不直接操作 `BackHandler` 或 `Linking`。

```text
demo_native/
├─ App.js                                  # Expo 入口，仅 re-export
└─ src/
   ├─ App.jsx                              # JSX 组合入口
   ├─ screens/*.jsx                       # 消费 ReactViewRouter hooks 的页面
   ├─ components/
   │  ├─ NativeRouterLink.jsx              # Pressable 到 router.push 的桥接
   │  └─ RouteNavigation.jsx               # 导航 UI
   └─ navigation/
      ├─ routes.js                         # 路由表与 lazyImport
      ├─ createAppRouter.js                # memory router 工厂
      ├─ deepLinkConfig.js                 # 应用 URL prefixes
      ├─ getPathnameFromDeepLink.js        # 纯 deep-link 解析函数
      └─ useNativeNavigationBridge.js      # Linking/BackHandler 生命周期桥接
```

## 运行

```bash
npm install
npm start
```

## 可直接复用的原则

- 每个 App 实例创建一个 memory router，不使用模块级可变 router singleton。
- screen 使用 `useRoute` 等 client hooks，不感知 Native 系统导航 API。
- 只有 memory stack 可以返回时才消费 Android back 事件；栈底返回 `false`。
- initial URL 和运行期 Linking event 使用同一个纯解析函数。
- deep-link prefixes 属于应用配置，不写入 Router 核心。
- Native 没有 DOM hydration；可选 `hydrate` 退化到 client renderer，并且不要导入 standalone DOM adapter。

Expo 只用于方便运行，不代表已经完成最低 React Native/Hermes/JSC 兼容矩阵。生产应用还应为 navigation bridge、deep-link 映射和 Android 返回栈增加集成测试。
