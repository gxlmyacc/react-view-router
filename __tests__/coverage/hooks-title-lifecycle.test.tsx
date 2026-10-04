import React from 'react';
import { act, renderHook } from '@testing-library/react';
import useRouteTitle from '../../src/hooks/use-route-title';
import { RouterContext } from '../../src/context';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';

describe('route title 生命周期与刷新', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('重复刷新合并到同一个定时任务', () => {
    jest.useFakeTimers();
    const router = createTestRouter([{ path: '/', component: Home, meta: { title: 'Home' } }]);
    const filter = jest.fn(() => true);
    const hook = renderHook(() => useRouteTitle({ filter }, router));
    filter.mockClear();
    act(() => hook.result.current.refreshTitles());
    act(() => hook.result.current.refreshTitles());
    act(() => jest.runOnlyPendingTimers());
    expect(filter).toHaveBeenCalledTimes(1);
    expect(hook.result.current.titles[0].title).toBe('Home');
    hook.unmount();
    router.stop();
  });

  it('再次更新取消旧 fallback 定时任务，卸载后不调用 fallback', () => {
    jest.useFakeTimers();
    const router = createTestRouter([{ path: '/', component: Home, meta: { title: 'Home' } }]);
    const fallback = jest.fn();
    const hook = renderHook(() => useRouteTitle({ onNoMatchedPath: fallback }, router));
    act(() => hook.result.current.setTitles([]));
    act(() => hook.result.current.setTitles([]));
    hook.unmount();
    act(() => jest.runOnlyPendingTimers());
    expect(fallback).not.toHaveBeenCalled();
    router.stop();
  });

  it('Context 模式通过 meta 变化重新读取子标题，未匹配时返回空列表', () => {
    const router = createTestRouter([{
      path: '/parent',
      component: Home,
      meta: { title: 'Parent' },
      children: [{ path: 'child', component: About, meta: { title: 'Child' } }],
    }]);
    syncNavigate(router, '/parent');
    const wrapper = ({ children }: React.PropsWithChildren) => React.createElement(RouterContext.Provider, { value: router }, children,);
    const hook = renderHook(() => useRouteTitle(), { wrapper });
    expect(hook.result.current.titles.map((title) => title.title)).toEqual(['Child']);
    act(() => router.updateRouteMeta(router.currentRoute!.matched[0], { title: 'New parent' }));
    expect(hook.result.current.titles.map((title) => title.title)).toEqual(['Child']);
    act(() => syncNavigate(router, '/missing'));
    // Meta notifications may arrive after the route stops matching the view.
    const metaPlugin = router.plugins.find((plugin) => plugin.onRouteMetaChange);
    act(() => metaPlugin!.onRouteMetaChange!({}, { title: 'Old' }, router.routes[0] as any, router));
    expect(hook.result.current.titles).toEqual([]);
    hook.unmount();
    router.stop();
  });

  it('卸载后的路由和 meta 通知不重新解析标题', () => {
    const router = createTestRouter([{ path: '/', component: Home, meta: { title: 'Home' } }]);
    const filter = jest.fn(() => true);
    const hook = renderHook(() => useRouteTitle({ filter }, router));
    const plugins = [...router.plugins];
    hook.unmount();
    filter.mockClear();
    act(() => {
      plugins.forEach((plugin) => {
        plugin.onRouteChange?.(router.currentRoute!, router.currentRoute!, router);
        plugin.onRouteMetaChange?.({}, { title: 'Old' }, router.currentRoute!.matched[0], router);
      });
    });
    expect(filter).not.toHaveBeenCalled();
    router.stop();
  });

  it('fallback 没有 currentRoute 时使用 initialRoute 判断目标', () => {
    jest.useFakeTimers();
    const router = createTestRouter([{ path: '/', component: Home, meta: { title: 'Home' } }]);
    const currentRoute = router.currentRoute;
    const replace = jest.spyOn(router, 'replace').mockImplementation(() => undefined as any);
    const hook = renderHook(() => useRouteTitle({
      onNoMatchedPath: (_path, _titles, fallback) => {
        router.currentRoute = null;
        fallback('/fallback');
        router.currentRoute = currentRoute;
      },
    }, router));
    act(() => hook.result.current.setTitles([]));
    act(() => jest.runOnlyPendingTimers());
    expect(replace).toHaveBeenCalledWith('/fallback');
    hook.unmount();
    router.stop();
  });
});
