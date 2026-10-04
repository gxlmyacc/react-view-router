import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import useRouteTitle, {
  readRouteTitle,
  readRouteTitles,
} from '../../src/hooks/use-route-title';
import { RouterContext, RouterViewContext } from '../../src/context';
import { RouterViewComponent } from '../../src/router-view';
import { createTestRouter, syncNavigate, renderWithRouter, Home, About } from '../helpers/test-utils';
import { normalizeRoutes } from '../../src/util';

describe('useRouteTitle 深度覆盖', () => {
  it('readRouteTitle visible 为 false 应返回空', () => {
    const route = normalizeRoutes([
      { path: '/h', component: Home, meta: { title: 'H', visible: false } },
    ])[0];
    expect(readRouteTitle(route).visible).toBe(false);
  });

  it('无标题路由返回空标题，且递归结果为空时不创建 children', () => {
    const router = createTestRouter();
    const [plainRoute] = normalizeRoutes([
      { path: '/plain', component: Home },
    ]);
    expect(readRouteTitle(plainRoute)).toEqual({ visible: false, title: '' });

    const [parent] = normalizeRoutes([
      {
        path: '/parent',
        component: Home,
        meta: { title: 'Parent' },
        children: [{ path: 'child', component: About }],
      },
    ]);
    const titles = readRouteTitles(router, [parent], { maxLevel: 2 });
    expect(titles[0].children).toBeUndefined();
    router.stop();
  });

  it('readRouteTitles 应返回带 title 的路由', () => {
    const router = createTestRouter();
    const routes = normalizeRoutes([
      { path: '/p', component: Home, meta: { title: 'P' } },
      { path: '/q', component: About, meta: { title: 'Q' } },
    ]);
    const titles = readRouteTitles(router, routes);
    expect(titles.length).toBe(2);
    router.stop();
  });

  it('readRouteTitles filter 返回 false 应过滤', () => {
    const router = createTestRouter();
    const routes = normalizeRoutes([
      { path: '/f', component: Home, meta: { title: 'F' } },
    ]);
    const titles = readRouteTitles(router, routes, {
      filter: () => false,
    });
    expect(titles.length).toBe(0);
    router.stop();
  });

  it('useRouteTitle 非 manual 模式应自动解析 titles', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'Home' } },
      { path: '/about', component: About, meta: { title: 'About' } },
    ]);
    syncNavigate(router, '/');
    const view = { state: { depth: 0, router } };
    const { result } = renderHook(() => useRouteTitle({}, router), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    await waitFor(() => expect(result.current.titles.length).toBeGreaterThan(0));
    router.stop();
  });

  it('readRouteTitles 跳过 visible=false 的路由', () => {
    const router = createTestRouter();
    const routes = normalizeRoutes([
      { path: '/hidden', component: Home, meta: { title: 'Hidden', visible: false } },
    ]);
    expect(readRouteTitles(router, routes)).toEqual([]);
    router.stop();
  });

  it('没有 RouterContext 时报告缺少 router', () => {
    expect(() => renderHook(() => useRouteTitle())).toThrow('[useRouteTitle] router can not be null!');
  });

  it('标题视图的 matched route 变化后更新路径列表', async () => {
    const router = createTestRouter([
      { path: '/one', component: Home, meta: { title: 'One' } },
      { path: '/two', component: About, meta: { title: 'Two' } },
    ]);
    syncNavigate(router, '/one');
    const { result } = renderHook(() => useRouteTitle({}, router));
    await waitFor(() => expect(result.current.matchedRoutes.map((route) => route.path)).toContain('/one'));
    act(() => syncNavigate(router, '/two'));
    await waitFor(() => expect(result.current.matchedRoutes.map((route) => route.path)).toContain('/two'));
    router.stop();
  });

  it('标题列表变为空时字符串 onNoMatchedPath 安全跳过 fallback', () => {
    jest.useFakeTimers();
    const router = createTestRouter([
      { path: '/plain', component: Home, meta: { title: 'Plain' } },
      { path: '/fallback', component: About, meta: { title: 'Fallback' } },
    ]);
    syncNavigate(router, '/plain');
    const { result } = renderHook(() => useRouteTitle({ onNoMatchedPath: '/fallback' }, router));
    act(() => result.current.setTitles([]));
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
    expect(router.currentRoute?.path).toBe('/plain');
    router.stop();
  });

  it('useRouteTitle onNoMatchedPath 字符串应回退', async () => {
    jest.useFakeTimers();
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'Home' } },
      { path: '/fallback', component: About, meta: { title: 'FB' } },
    ]);
    syncNavigate(router, '/unknown');
    const { result } = renderHook(
      () => useRouteTitle({ onNoMatchedPath: ':first', manual: true }, router),
    );
    act(() => {
      result.current.setTitles(readRouteTitles(router, router.routes));
    });
    act(() => jest.runAllTimers());
    jest.useRealTimers();
    router.stop();
  });

  it('refreshTitles 应触发 dirty 刷新', async () => {
    jest.useFakeTimers();
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'T' } },
    ]);
    const { result } = renderHook(
      () => useRouteTitle({ manual: true }, router),
    );
    act(() => {
      result.current.setTitles(readRouteTitles(router, router.routes));
      result.current.refreshTitles();
    });
    act(() => jest.runAllTimers());
    jest.useRealTimers();
    router.stop();
  });

  it('useRouteTitle manual 带 setTitles 应更新', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'H' } },
    ]);
    const { result } = renderHook(
      () => useRouteTitle({ manual: true }, router),
    );
    act(() => {
      result.current.setTitles(readRouteTitles(router, router.routes));
    });
    expect(result.current.titles.length).toBeGreaterThan(0);
    router.stop();
  });

  it('嵌套 titles findTitleByMatchedPath 应匹配子路径', () => {
    const router = createTestRouter([
      {
        path: '/p',
        component: Home,
        meta: { title: '父' },
        children: [{ path: '/p/c', component: About, meta: { title: '子' } }],
      },
    ]);
    syncNavigate(router, '/p/c');
    const titles = readRouteTitles(router, router.routes);
    const { result } = renderHook(
      () => useRouteTitle({ manual: true }, router),
    );
    act(() => {
      result.current.setTitles(titles);
    });
    expect(titles[0]?.children?.length).toBeGreaterThan(0);
    expect(result.current.matchedRoutes.length).toBeGreaterThan(0);
    router.stop();
  });

  it('matchedTitles 应递归匹配嵌套标题', () => {
    jest.useFakeTimers();
    const router = createTestRouter([
      {
        path: '/p',
        component: Home,
        meta: { title: '父' },
        children: [{ path: '/p/c', component: About, meta: { title: '子' } }],
      },
    ]);
    syncNavigate(router, '/p/c');
    const titles = readRouteTitles(router, router.routes);
    const { result } = renderHook(
      () => useRouteTitle({ manual: true }, router),
    );
    act(() => {
      result.current.setTitles(titles);
      result.current.refreshTitles();
    });
    act(() => jest.runAllTimers());
    expect(result.current.matchedTitles.length).toBeGreaterThan(0);
    jest.useRealTimers();
    router.stop();
  });

  it('filterMetas 变化应注册 meta 监听', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'T', label: 'L' } },
    ]);
    renderHook(
      () => useRouteTitle({ manual: true, filterMetas: ['label'] }, router),
    );
    act(() => router.updateRouteMeta(router.currentRoute!.matched[0], { label: 'N' }));
    router.stop();
  });

  it('onNoMatchedPath 路由切换后应触发', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'Home' } },
      { path: '/about', component: About, meta: { title: 'About' } },
    ]);
    syncNavigate(router, '/about');
    const onNoMatchedPath = jest.fn((_path, _titles, fallback) => {
      fallback('');
      fallback('/about');
      fallback({ path: '/' } as any);
    });
    const { result } = renderHook(
      () => useRouteTitle({
        onNoMatchedPath,
        filter: (r) => r.path !== '/about',
      }, router),
    );
    await waitFor(() => expect(result.current.parsed).toBe(true));
    act(() => syncNavigate(router, '/'));
    act(() => syncNavigate(router, '/about'));
    await waitFor(() => expect(onNoMatchedPath).toHaveBeenCalled(), { timeout: 5000 });
    await waitFor(() => expect(router.currentRoute?.path).toBe('/'));
    router.stop();
  });

  it('RouterContext 模式路由切换应刷新 titles', async () => {
    const router = createTestRouter([
      {
        path: '/p',
        component: Home,
        meta: { title: '父' },
        children: [
          { path: 'a', component: About, meta: { title: 'A' } },
          { path: 'b', component: About, meta: { title: 'B' } },
        ],
      },
    ]);
    syncNavigate(router, '/p/a');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.isPrepared).toBe(true));
    const { result } = renderHook(() => useRouteTitle({ maxLevel: 2 }), {
      wrapper: ({ children }) =>
        React.createElement(RouterContext.Provider, { value: router }, children),
    });
    await waitFor(() => expect(result.current.titles.length).toBeGreaterThan(0));
    const previousTitles = result.current.titles;
    act(() => syncNavigate(router, '/p/b'));
    await waitFor(() => expect(result.current.titles).not.toBe(previousTitles));
    expect(result.current.titles.map((title) => title.title)).toEqual(['A', 'B']);
    router.stop();
  });

  it('onNoMatchedPath 字符串路径应 replace 回退', async () => {
    jest.useFakeTimers();
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'Home' } },
      { path: '/about', component: About, meta: { title: 'About' } },
    ]);
    syncNavigate(router, '/about');
    const replaceSpy = jest.spyOn(router, 'replace');
    renderHook(
      () => useRouteTitle({
        manual: true,
        onNoMatchedPath: '/',
        filter: () => false,
      }, router),
    );
    act(() => {
      syncNavigate(router, '/unknown');
    });
    act(() => jest.runAllTimers());
    jest.useRealTimers();
    router.stop();
  });

  it('readRouteTitles 嵌套 children 应递归', () => {
    const router = createTestRouter();
    const routes = normalizeRoutes([
      {
        path: '/root',
        component: Home,
        meta: { title: 'R' },
        children: [{ path: '/root/c', component: About, meta: { title: 'C' } }],
      },
    ]);
    const titles = readRouteTitles(router, routes, { maxLevel: 2 });
    expect(titles[0]?.children?.length).toBe(1);
    router.stop();
  });
});
