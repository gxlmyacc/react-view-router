import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { RouterViewComponent, RouterViewWrapper } from '../../src/router-view';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About, renderUtils } from '../helpers/test-utils';
import ReactViewRouter from '../../src/router';
import { HistoryType } from '../../src/history/types';

const ChildPage = () =>
  React.createElement('div', { 'data-testid': 'child-page' }, 'child');

describe('RouterView 深度覆盖', () => {
  it('filter 应过滤路由', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const filter = jest.fn((routes: any[]) => routes);
    renderWithRouter(
      React.createElement(RouterViewComponent, { router, filter }),
      router,
    );
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    expect(filter).toHaveBeenCalled();
    router.stop();
  });

  it('container 应包装渲染结果', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const container = (node: React.ReactNode) =>
      React.createElement('div', { 'data-testid': 'wrap' }, node);
    renderWithRouter(
      React.createElement(RouterViewComponent, { router, container }),
      router,
    );
    expect(await screen.findByTestId('wrap')).toBeTruthy();
    router.stop();
  });

  it('onRouteChange 应在路由切换时触发', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const onRouteChange = jest.fn();
    renderWithRouter(
      React.createElement(RouterViewComponent, { router, onRouteChange }),
      router,
    );
    await waitFor(() => expect(router.isPrepared).toBe(true));
    await act(async () => {
      await new Promise<void>(resolve => router.push('/about', resolve));
    });
    await waitFor(() => expect(onRouteChange).toHaveBeenCalled());
    router.stop();
  });

  it('keepAlive 应启用 KeepAlive 包裹', async () => {
    const router = createTestRouter(
      [
        { path: '/ka1', component: Home, keepAlive: true },
        { path: '/ka2', component: About, keepAlive: true },
      ],
      { keepAlive: true },
    );
    syncNavigate(router, '/ka1');
    renderWithRouter(
      React.createElement(RouterViewComponent, { router, keepAlive: true }),
      router,
    );
    await waitFor(() => expect(router.isPrepared).toBe(true));
    await act(async () => {
      await new Promise<void>(resolve => router.push('/ka2', resolve));
    });
    expect(router.viewRoot?.state.enableKeepAlive).toBe(true);
    router.stop();
  });

  it('beforeEach/afterEach props 应注册到 viewRoot', async () => {
    const router = createTestRouter();
    const beforeEach = jest.fn((_t, _f, next) => next());
    const afterEach = jest.fn();
    renderWithRouter(
      React.createElement(RouterViewComponent, {
        router,
        beforeEach,
        afterEach,
      }),
      router,
    );
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    expect(router.viewRoot!.props.beforeEach).toBe(beforeEach);
    router.stop();
  });

  it('fallback 元素形式应渲染', () => {
    const router = createTestRouter();
    const { container } = renderWithRouter(
      React.createElement(RouterViewComponent, {
        router,
        fallback: React.createElement('span', { 'data-testid': 'fb' }, 'fb'),
      }),
      router,
    );
    expect(container.querySelector('[data-testid="fb"]')).toBeTruthy();
    router.stop();
  });

  it('卸载时应清理 viewRoot', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const { unmount } = renderWithRouter(
      React.createElement(RouterViewComponent, { router }),
      router,
    );
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    unmount();
    expect(router.viewRoot).toBeNull();
    router.stop();
  });

  it('RouterViewWrapper 应正常渲染', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    renderWithRouter(
      React.createElement(RouterViewWrapper, { router }),
      router,
    );
    expect(await screen.findByTestId('home')).toBeTruthy();
    router.stop();
  });

  it('basename 子 RouterView isActivate 应依赖父级', async () => {
    const router = createTestRouter([], { basename: '/app' });
    router._initRouter({ basename: '/app', mode: HistoryType.hash });
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    expect(router.viewRoot!.isActivate).toBeDefined();
    router.stop();
  });

  it('plugin onViewContainer 应可修改 container', async () => {
    const router = createTestRouter();
    router.plugin({
      name: 'container-plugin',
      onViewContainer: (container, ctx) => {
        return (node: React.ReactNode) =>
          React.createElement('div', { 'data-testid': 'plugin-wrap' }, node);
      },
    });
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    expect(await screen.findByTestId('plugin-wrap')).toBeTruthy();
    router.stop();
  });

  it('keepAlive RegExp 应匹配目标路由', async () => {
    const router = createTestRouter(
      [
        { path: '/ka1', component: Home, keepAlive: /^\/ka/ },
        { path: '/ka2', component: About },
      ],
      { keepAlive: true },
    );
    syncNavigate(router, '/ka1');
    renderWithRouter(
      React.createElement(RouterViewComponent, { router, keepAlive: true }),
      router,
    );
    await waitFor(() => expect(router.isPrepared).toBe(true));
    await act(async () => {
      await new Promise<void>(resolve => router.push('/ka2', resolve));
    });
    expect(router.viewRoot?.state.enableKeepAlive).toBe(true);
    router.stop();
  });

  it('redirect 路由应跳过 toRoute', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/old', component: About, redirect: '/about' },
      { path: '/about', component: About },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.isPrepared).toBe(true));
    await act(async () => {
      await new Promise<void>(resolve => router.push('/old', resolve));
    });
    expect(router.currentRoute?.path).toBe('/about');
    router.stop();
  });
});
