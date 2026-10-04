import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import ReactViewRouter from '../../src/router';
import { RouterContext } from '../../src/context';
import { HistoryType } from '../../src/history/types';
import { UserConfigRoute } from '../../src/types';
import renderUtils from '../../dom/src/index';

const Home = () => React.createElement('div', { 'data-testid': 'home' }, 'Home');
const About = () => React.createElement('div', { 'data-testid': 'about' }, 'About');

const defaultRoutes: UserConfigRoute[] = [
  { path: '/', component: Home, exact: true },
  { path: '/about', component: About },
  { path: '/users/:id', component: About },
];

/**
 * 创建用于集成测试的 memory 模式路由器。
 * @param routes 路由配置，默认使用内置示例路由
 * @param options 额外路由器选项
 * @returns 已 start 的 ReactViewRouter 实例
 */
export function createTestRouter(
  routes: UserConfigRoute[] = defaultRoutes,
  options: Record<string, any> = {},
) {
  const router = new ReactViewRouter({
    manual: true,
    mode: HistoryType.memory,
    routes,
    renderUtils,
    ...options,
  });
  router.start();
  return router;
}

/**
 * 在 RouterContext 中渲染组件。
 * @param ui 待渲染的 React 节点
 * @param router 路由器实例
 * @param options RTL render 选项
 * @returns RTL render 结果
 */
export function renderWithRouter(
  ui: ReactElement,
  router: ReactViewRouter,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    wrapper: ({ children }) =>
      React.createElement(RouterContext.Provider, { value: router }, children),
    ...options,
  });
}

/**
 * 同步触发 history push 并更新路由。
 * @param router 路由器实例
 * @param path 目标路径
 */
export function syncNavigate(router: ReactViewRouter, path: string) {
  router.history.push(path);
  router.updateRoute(router.history.location as any);
}

export { Home, About, defaultRoutes, renderUtils };
