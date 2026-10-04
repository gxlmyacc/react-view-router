import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useRoute,
  useRouteMeta,
  useRouteParams,
  useRouteState,
  useRouteChanged,
  useRouteMetaChanged,
  useRouterView,
  useMatchedRouteAndIndex,
  useRouterViewEvent,
  useViewActivate,
  useViewDeactivate,
  useRouteGuardsRef,
  isCommonPage,
  getRouteMatched,
} from '../../src/hooks/base';
import { RouterContext, RouterViewContext } from '../../src/context';
import { RouterViewComponent } from '../../src/router-view';
import { createTestRouter, syncNavigate, Home, About, renderWithRouter } from '../helpers/test-utils';
import { normalizeRoutes } from '../../src/util';

describe('hooks/base 深度覆盖', () => {
  it('useRoute watch 为 true 时路由变化应触发重渲染', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const { result } = renderHook(() => useRoute(router, { watch: true }));
    expect(result.current?.path).toBe('/');
    act(() => syncNavigate(router, '/about'));
    await waitFor(() => expect(result.current?.path).toBe('/about'));
    router.stop();
  });

  it('useRoute watch 函数返回 false 应跳过重渲染', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const watch = jest.fn(() => false);
    renderHook(() => useRoute(router, { watch }), {
      wrapper: ({ children }) =>
        React.createElement(RouterContext.Provider, { value: router }, children),
    });
    act(() => syncNavigate(router, '/about'));
    expect(watch).toHaveBeenCalled();
    router.stop();
  });

  it('useRoute delay 选项应延迟更新', async () => {
    jest.useFakeTimers();
    const router = createTestRouter();
    syncNavigate(router, '/');
    const { result } = renderHook(() => useRoute(router, { watch: true, delay: 100 }));
    act(() => syncNavigate(router, '/about'));
    expect(result.current?.path).toBe('/');
    act(() => jest.advanceTimersByTime(100));
    await waitFor(() => expect(result.current?.path).toBe('/about'));
    jest.useRealTimers();
    router.stop();
  });

  it('useRouteMeta 应读写 meta', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: '首页' } },
    ]);
    syncNavigate(router, '/');
    const view = { state: { depth: 0, router } };
    const { result } = renderHook(() => useRouteMeta('title', router), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    expect(result.current[0]).toBe('首页');
    act(() => result.current[1]('新标题'));
    expect(router.currentRoute!.matched[0].meta.title).toBe('新标题');
    router.stop();
  });

  it('useRouteMeta 数组 key 应批量读取', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { a: 1, b: 2 } },
    ]);
    syncNavigate(router, '/');
    const view = { state: { depth: 0, router } };
    const { result } = renderHook(() => useRouteMeta(['a', 'b'], router), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    expect(result.current[0]).toEqual({ a: 1, b: 2 });
    router.stop();
  });

  it('useRouteMeta 数组 key 部分更新应过滤未声明字段', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { a: 1, b: 2 } },
    ]);
    syncNavigate(router, '/');
    const view = { state: { depth: 0, router } };
    const { result } = renderHook(() => useRouteMeta(['a', 'b'], router), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    act(() => result.current[1]({ a: 10, c: 99 } as any));
    expect(router.currentRoute!.matched[0].meta.a).toBe(10);
    expect(router.currentRoute!.matched[0].meta.b).toBe(2);
    router.stop();
  });

  it('useRouteMeta setAll 应批量写入全部字段', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { a: 1, b: 2 } },
    ]);
    syncNavigate(router, '/');
    const view = { state: { depth: 0, router } };
    const { result } = renderHook(() => useRouteMeta(['a', 'b'], router), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    act(() => result.current[1]({ a: 9, b: 8, extra: 1 } as any, true));
    expect(router.currentRoute!.matched[0].meta.a).toBe(9);
    expect(router.currentRoute!.matched[0].meta.b).toBe(8);
    router.stop();
  });

  it('useRouteMeta 空数组应抛错', () => {
    const router = createTestRouter();
    expect(() =>
      renderHook(() => useRouteMeta([], router)),
    ).toThrow('metaKey is Empty');
    router.stop();
  });

  it('useRouteState setRouteState 应调用 replaceState', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const view = { state: { depth: 0, router } };
    const spy = jest.spyOn(router, 'replaceState');
    const { result } = renderHook(() => useRouteState(router, { count: 0 }), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    act(() => result.current[1]({ count: 5 }));
    expect(spy).toHaveBeenCalledWith({ count: 5 }, expect.anything());
    router.stop();
  });

  it('useRouteChanged 应注册插件回调', () => {
    const router = createTestRouter();
    const onChange = jest.fn();
    renderHook(() => useRouteChanged(router, onChange));
    act(() => syncNavigate(router, '/about'));
    expect(onChange).toHaveBeenCalled();
    router.stop();
  });

  it('useRouteMetaChanged 应在 meta 变化时触发', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { label: 'L' } },
    ]);
    syncNavigate(router, '/');
    const onChange = jest.fn();
    renderHook(() => useRouteMetaChanged(router, onChange, ['label']));
    act(() => router.updateRouteMeta(router.currentRoute!.matched[0], { label: 'N' }));
    expect(onChange).toHaveBeenCalled();
    router.stop();
  });

  it('useRouteMetaChanged 未监听字段变化应忽略', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { label: 'L', title: 'T' } },
    ]);
    syncNavigate(router, '/');
    const onChange = jest.fn();
    renderHook(() => useRouteMetaChanged(router, onChange, ['label']));
    act(() => router.updateRouteMeta(router.currentRoute!.matched[0], { title: 'N' }));
    expect(onChange).not.toHaveBeenCalled();
    router.stop();
  });

  it('useRouterView 应返回 context', () => {
    const view = { state: { depth: 1 } };
    const { result } = renderHook(() => useRouterView(), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    expect(result.current).toBe(view);
  });

  it('useMatchedRouteAndIndex 应返回匹配项与索引', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const view = { state: { depth: 0, router } };
    const { result } = renderHook(() => useMatchedRouteAndIndex(router), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    expect(result.current[0]).toBeTruthy();
    expect(result.current[1]).toBe(0);
    router.stop();
  });

  it('useRouteParams watch 应响应同一配置路由的动态参数变化', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/users/42');
    const view = { state: { depth: 0, router } };
    const { result } = renderHook(() => useRouteParams<{ id: string }>(router, { watch: true }), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });

    expect(result.current.id).toBe('42');
    act(() => syncNavigate(router, '/users/7'));
    await waitFor(() => expect(result.current.id).toBe('7'));
    router.stop();
  });

  it('isCommonPage / getRouteMatched 应处理 commonPage 重定向', () => {
    const router = createTestRouter([
      { path: '/cp', component: Home, meta: { commonPage: true } },
      { path: '/target', component: About },
    ]);
    syncNavigate(router, '/cp?redirect=/target');
    const matched = getRouteMatched(router, router.currentRoute, 'commonPage');
    expect(matched.length).toBeGreaterThan(0);
    expect(isCommonPage(router.currentRoute!.matched, 'commonPage')).toBe(true);
    router.stop();
  });

  it('useRouterViewEvent 应注册 activate 事件', () => {
    const events = { activate: [] as Function[], deactivate: [] as Function[] };
    const view = { _events: events, state: { depth: 0 } };
    const handler = jest.fn();
    renderHook(() => useRouterViewEvent('activate', handler), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    events.activate[0]?.({ target: { path: '/' } });
    expect(handler).toHaveBeenCalled();
  });

  it('useViewActivate 应在匹配时触发', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const events = { activate: [] as Function[], deactivate: [] as Function[] };
    const matched = router.currentRoute!.matched[0];
    const view = {
      _events: events,
      state: { depth: 0, router },
    };
    const handler = jest.fn();
    renderHook(() => useViewActivate(handler), {
      wrapper: ({ children }) =>
        React.createElement(
          RouterContext.Provider,
          { value: router },
          React.createElement(RouterViewContext.Provider, { value: view as any }, children),
        ),
    });
    events.activate.forEach(fn => fn({ router, target: matched }));
    router.stop();
  });

  it('useViewDeactivate 应在离开时触发', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const events = { activate: [] as Function[], deactivate: [] as Function[] };
    const matched = router.currentRoute!.matched[0];
    const view = {
      _events: events,
      state: { depth: 0, router },
    };
    const handler = jest.fn();
    renderHook(() => useViewDeactivate(handler), {
      wrapper: ({ children }) =>
        React.createElement(
          RouterContext.Provider,
          { value: router },
          React.createElement(RouterViewContext.Provider, { value: view as any }, children),
        ),
    });
    events.deactivate.forEach(fn => fn({ router, target: matched }));
    expect(handler).toHaveBeenCalled();
    router.stop();
  });

  it('useRouteGuardsRef 应暴露守卫信息', () => {
    const ref = React.createRef<any>();
    const guards = { beforeRouteEnter: jest.fn() };
    renderHook(() => useRouteGuardsRef(ref, guards));
    expect(ref.current?.__routeGuardInfoHooks).toBe(true);
  });
});
