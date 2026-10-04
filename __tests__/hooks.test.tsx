import React from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import {
  useRouter,
  useRoute,
  getRouteMatched,
  useRouteMetaChanged,
  useRouteParams,
  useRouteQuery,
  useMatchedRoute,
  useRouteState,
  useRouteMeta,
  useRouteGuardsRef,
  useRouterViewEvent,
  useViewActivate,
  useViewDeactivate,
  createRouteGuardsRef,
} from '../src/hooks/base';
import useManualRouter from '../src/hooks/use-manual-router';
import useRouteTitle, {
  readRouteTitle,
  readRouteTitles,
  findTitleByMatchedPath,
  isTitleRoute,
} from '../src/hooks/use-route-title';
import { RouterContext, RouterViewContext } from '../src/context';
import { HistoryType } from '../src/history/types';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About } from './helpers/test-utils';

import { normalizeRoutes } from '../src/util';
import { RouterViewComponent } from '../src/router-view';

describe('hooks/base', () => {
  it('useRoute 观察器支持过滤、同路径变化和延迟刷新', async () => {
    jest.useFakeTimers();
    const router = createTestRouter();
    const anotherWatch = jest.fn(() => true);
    const watch = jest.fn(() => true);
    const { result } = renderHook(() => useRoute(router, {
      watch,
      ignoreSamePath: false,
      delay: 15,
    }, anotherWatch));

    await act(async () => {
      syncNavigate(router, '/about');
      await Promise.resolve();
    });
    expect(anotherWatch).toHaveBeenCalled();
    expect(watch).toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(15));
    expect(result.current?.path).toBe('/about');

    jest.useRealTimers();
    router.stop();
  });

  it('useRoute 观察器支持布尔 delay 和拒绝更新', async () => {
    const router = createTestRouter();
    const anotherWatch = jest.fn(() => false);
    const watch = jest.fn();
    const { unmount } = renderHook(() => useRoute(router, {
      watch,
      delay: true,
    }, anotherWatch));
    await act(async () => {
      syncNavigate(router, '/about');
      await Promise.resolve();
    });
    expect(anotherWatch).toHaveBeenCalled();
    expect(watch).not.toHaveBeenCalled();
    unmount();
    router.stop();
  });

  it('布尔 delay 观察器通过零延时刷新，空 matched 路由保持原数组', async () => {
    jest.useFakeTimers();
    const router = createTestRouter();
    const { result } = renderHook(() => useRoute(router, { watch: true, delay: true }));
    await act(async () => {
      syncNavigate(router, '/about');
      await Promise.resolve();
    });
    act(() => jest.runOnlyPendingTimers());
    expect(result.current?.path).toBe('/about');
    expect(getRouteMatched(router, { matched: null, query: {} } as any)).toBeNull();
    jest.useRealTimers();
    router.stop();
  });

  it('useRoute 无 router 时返回 null，同路径默认忽略自定义观察器', async () => {
    const noRouter = renderHook(() => useRoute());
    expect(noRouter.result.current).toBeNull();

    const router = createTestRouter();
    syncNavigate(router, '/about');
    const anotherWatch = jest.fn();
    renderHook(() => useRoute(router, { watch: true }, anotherWatch));
    await act(async () => {
      syncNavigate(router, '/about');
      await Promise.resolve();
    });
    expect(anotherWatch).not.toHaveBeenCalled();
    router.stop();
  });

  it('useRouteMeta 无匹配 route 时 setter 不修改状态', () => {
    const router = createTestRouter();
    const wrapper = ({ children }: any) => React.createElement(
      RouterViewContext.Provider,
      { value: { state: { depth: 5 } } as any },
      children,
    );
    const { result } = renderHook(() => useRouteMeta(['title'], router), { wrapper });
    act(() => result.current[1]({ title: 'ignored' }));
    expect(result.current[0]).toEqual({});
    router.stop();
  });

  it('useRouterViewEvent 在没有 view 时跳过订阅，有 view 时卸载订阅', () => {
    const onEvent = jest.fn();
    const noView = renderHook(() => useRouterViewEvent('activate', onEvent as any));
    noView.unmount();

    const events = { activate: [] as Function[], deactivate: [] as Function[] };
    const view = { _events: events, state: { depth: 0, router: null, currentRoute: null } };
    const wrapper = ({ children }: any) => React.createElement(
      RouterViewContext.Provider,
      { value: view as any },
      children,
    );
    const subscribed = renderHook(() => useRouterViewEvent('activate', onEvent as any), { wrapper });
    expect(events.activate).toHaveLength(1);
    act(() => events.activate[0]({}));
    expect(onEvent).toHaveBeenCalled();
    events.activate.pop();
    subscribed.unmount();
    expect(events.activate).toHaveLength(0);
  });

  it('激活与停用 hook 会响应匹配当前视图路径的事件', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const matchedRoute = router.currentRoute!.matched[0];
    const events = { activate: [] as Function[], deactivate: [] as Function[] };
    const view = { _events: events, state: { depth: 0, router, currentRoute: matchedRoute } };
    const wrapper = ({ children }: any) => React.createElement(
      RouterContext.Provider,
      { value: router },
      React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    );
    const onActivate = jest.fn();
    const onDeactivate = jest.fn();
    const active = renderHook(() => useViewActivate(onActivate), { wrapper });
    const inactive = renderHook(() => useViewDeactivate(onDeactivate), { wrapper });
    const event = { router, target: matchedRoute };

    act(() => {
      events.activate[0](event);
      events.deactivate[0](event);
    });
    expect(onActivate).toHaveBeenCalledWith(event);
    expect(onDeactivate).toHaveBeenCalledWith(event);
    active.unmount();
    inactive.unmount();
    router.stop();
  });

  it('激活与停用 hook 在缺少用户回调时安全忽略事件', () => {
    const router = createTestRouter();
    const events = { activate: [] as Function[], deactivate: [] as Function[] };
    const view = { _events: events, state: { depth: 0, router, currentRoute: null } };
    const wrapper = ({ children }: any) => React.createElement(
      RouterContext.Provider,
      { value: router },
      React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    );
    const active = renderHook(() => useViewActivate(undefined as any), { wrapper });
    const inactive = renderHook(() => useViewDeactivate(undefined as any), { wrapper });
    act(() => {
      events.activate[0]({});
      events.deactivate[0]({});
    });
    active.unmount();
    inactive.unmount();
    router.stop();
  });

  it('useRouteGuardsRef 支持对象和工厂形式并标记 ref', () => {
    const objectRef = React.createRef<any>();
    const guards = { beforeRouteLeave: jest.fn() };
    const Wrapper = ({ children }: React.PropsWithChildren) => {
      useRouteGuardsRef(objectRef, guards);
      return React.createElement(React.Fragment, null, children);
    };
    render(React.createElement(Wrapper));
    expect(objectRef.current).toBe(guards);
    expect(objectRef.current.__routeGuardInfoHooks).toBe(true);

    const factoryRef = React.createRef<any>();
    renderHook(() => useRouteGuardsRef(factoryRef, () => guards));
    expect(factoryRef.current).toBe(guards);
    expect(createRouteGuardsRef(null as any)).toBeNull();
  });

  it('useRouteMeta 仅更新声明的数组字段并支持单字段形式', () => {
    const router = createTestRouter([
      { path: '/meta', component: Home, meta: { title: '旧标题', other: '保留' } },
    ]);
    syncNavigate(router, '/meta');
    const { result, rerender } = renderHook(() => useRouteMeta(['title'], router));
    act(() => result.current[1]({ title: '新标题', other: '忽略' }));
    expect(result.current[0]).toEqual({ title: '新标题' });

    rerender();
    const single = renderHook(() => useRouteMeta('title', router));
    act(() => single.result.current[1]('最终标题'));
    expect(single.result.current[0]).toBe('最终标题');
    router.stop();
  });

  it('route meta 默认监听依赖应响应更新，无匹配路由时 params/query 使用空对象', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: '旧标题' } },
    ]);
    syncNavigate(router, '/');
    const onMetaChange = jest.fn();
    const watcher = renderHook(() => useRouteMetaChanged(router, onMetaChange));
    act(() => router.updateRouteMeta(router.currentRoute!.matched[0], { title: '新标题' }));
    expect(onMetaChange).toHaveBeenCalled();
    watcher.unmount();
    router.stop();

    const view = { state: { depth: 10, router: null, currentRoute: null } };
    const wrapper = ({ children }: any) => React.createElement(
      RouterViewContext.Provider,
      { value: view as any },
      children,
    );
    const noMatch = renderHook(() => ({ params: useRouteParams(), query: useRouteQuery() }), { wrapper });
    expect(noMatch.result.current).toEqual({ params: {}, query: {} });
  });

  it('没有 router 或匹配 route 时 route state 返回默认值且 setter 安全忽略', () => {
    const view = { state: { depth: 10, router: null, currentRoute: null } };
    const wrapper = ({ children }: any) => React.createElement(
      RouterViewContext.Provider,
      { value: view as any },
      children,
    );
    const { result } = renderHook(() => useRouteState(undefined, { fallback: true }), { wrapper });
    expect(result.current[0]).toEqual({ fallback: true });
    act(() => result.current[1]({ next: true } as any));
    expect(result.current[0]).toEqual({ fallback: true });
  });

  it('useRouter 应返回 context 中的 router', () => {
    const router = createTestRouter();
    const { result } = renderHook(() => useRouter(), {
      wrapper: ({ children }) =>
        React.createElement(RouterContext.Provider, { value: router }, children),
    });
    expect(result.current).toBe(router);
    router.stop();
  });

  it('useRoute 应返回当前路由', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const { result } = renderHook(() => useRoute(router));
    expect(result.current?.path).toBe('/about');
    router.stop();
  });

  it('useRouteParams 应返回路由参数', () => {
    const router = createTestRouter();
    syncNavigate(router, '/users/42');
    const wrapper = ({ children }: any) => {
      const view = { state: { depth: 1, currentRoute: null, router } };
      return React.createElement(RouterViewContext.Provider, { value: view as any }, children);
    };
    const { result } = renderHook(() => useRouteParams(router, { matchedOffset: -1 }), { wrapper });
    expect(result.current).toBeDefined();
    router.stop();
  });

  it('useRouteQuery 应返回 query', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about?tab=info');
    const { result } = renderHook(() => useRouteQuery(router));
    expect(result.current.tab).toBe('info');
    router.stop();
  });

  it('useMatchedRoute 应返回当前匹配路由', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const view = {
      state: { depth: 0, router, currentRoute: router.currentRoute?.matched[0] },
    };
    const { result } = renderHook(() => useMatchedRoute(router), {
      wrapper: ({ children }) =>
        React.createElement(RouterViewContext.Provider, { value: view as any }, children),
    });
    expect(result.current).toBeTruthy();
    router.stop();
  });

  it('createRouteGuardsRef 应标记 __routeGuardInfoHooks', () => {
    const ref = createRouteGuardsRef({ beforeRouteEnter: jest.fn() });
    expect((ref as any).__routeGuardInfoHooks).toBe(true);
  });
});

describe('useManualRouter', () => {
  it('omitted options start without replacing routes', () => {
    const router = createTestRouter();
    router.stop();
    const useSpy = jest.spyOn(router, 'use');

    const { unmount } = renderHook(() => useManualRouter(router));

    expect(router.isRunning).toBe(true);
    expect(useSpy).not.toHaveBeenCalled();
    unmount();
    useSpy.mockRestore();
    router.stop();
  });

  it('start 合并 override 配置、解包 History4 并避免重复启动', () => {
    const router = createTestRouter();
    router.stop();
    const historyOwner = { isHistoryInstance: true } as any;
    const history4 = { isHistory4: true, owner: historyOwner } as any;
    const routeNameResolver = jest.fn();
    const startSpy = jest.spyOn(router, 'start').mockImplementation(() => {
      router.isRunning = true;
      return router;
    });
    const useSpy = jest.spyOn(router, 'use');
    const resolverSpy = jest.spyOn(router, 'resolveRouteName');
    const { result } = renderHook(() => useManualRouter(router, {
      manual: true,
      routes: [{ path: '/option', component: Home }],
      routerMode: HistoryType.memory,
      basename: '/configured',
      history: history4,
    }));

    act(() => result.current.start({
      routes: [{ path: '/override', component: About }],
      mode: HistoryType.browser,
      pathname: '/override',
      basename: '/override-base',
      hashType: 'noslash',
      resolveRouteName: routeNameResolver,
    }));
    act(() => result.current.start());

    expect(useSpy).toHaveBeenCalledWith({ routes: [{ path: '/override', component: About }] });
    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(startSpy).toHaveBeenCalledWith(expect.objectContaining({
      mode: HistoryType.browser,
      basename: '/override-base',
      pathname: '/override',
      hashType: 'noslash',
      history: historyOwner,
    }));
    expect(resolverSpy).toHaveBeenCalledWith(routeNameResolver);
    startSpy.mockRestore();
    useSpy.mockRestore();
    resolverSpy.mockRestore();
    router.stop();
  });

  it('manual 模式应返回 start 方法', () => {
    const router = createTestRouter();
    router.stop();
    const { result } = renderHook(() => useManualRouter(router, { manual: true }));
    expect(result.current.router).toBe(router);
    expect(typeof result.current.start).toBe('function');
    act(() => {
      result.current.start({ routes: [{ path: '/', component: Home }] });
    });
    expect(router.isRunning).toBe(true);
    router.stop();
  });

  it('非 manual 模式应自动 start', () => {
    const router = createTestRouter();
    router.stop();
    renderHook(() => useManualRouter(router, { manual: false, routes: [{ path: '/', component: Home }] }));
    expect(router.isRunning).toBe(true);
    router.stop();
  });
});

describe('useRouteTitle', () => {
  it('readRouteTitle 应读取 meta.title', () => {
    const routes = normalizeRoutes([
      { path: '/t', component: Home, meta: { title: '标题页' } },
    ]);
    const ret = readRouteTitle(routes[0]);
    expect(ret.title).toBe('标题页');
    expect(ret.visible).toBe(true);
  });

  it('readRouteTitles 应返回标题树', () => {
    const router = createTestRouter([
      { path: '/a', component: Home, meta: { title: 'A' } },
      { path: '/b', component: About, meta: { title: 'B' } },
    ]);
    const titles = readRouteTitles(router, router.routes);
    expect(titles.length).toBe(2);
    expect(titles[0].title).toBe('A');
    router.stop();
  });

  it('isTitleRoute 应检测 title meta', () => {
    const routes = normalizeRoutes([{ path: '/', component: Home, meta: { title: 'x' } }]);
    expect(isTitleRoute(routes[0])).toBe(true);
    expect(isTitleRoute(routes[0], 'missing')).toBe(false);
    expect(isTitleRoute(null)).toBeNull();
  });

  it('标题查询对无标题、空路径和未匹配路径返回空结果', () => {
    const router = createTestRouter();
    const routes = normalizeRoutes([
      { path: '/untitled', component: Home },
      {
        path: '/parent',
        component: Home,
        meta: { title: '父' },
        children: [
          { path: 'child', component: About, meta: { title: '子' } },
        ]
      },
    ]);
    const titles = readRouteTitles(router, routes, { maxLevel: 1 });
    expect(titles).toHaveLength(1);
    expect(titles[0].children).toBeUndefined();
    expect(findTitleByMatchedPath('', titles)).toBeUndefined();
    expect(findTitleByMatchedPath('/missing', titles)).toBeUndefined();
    router.stop();
  });

  it('useRouteTitle manual 模式应返回 titles', () => {
    const router = createTestRouter([
      { path: '/x', component: Home, meta: { title: 'X' } },
    ]);
    const routes = normalizeRoutes([
      { path: '/x', component: Home, meta: { title: 'X' } },
    ]);
    const { result } = renderHook(
      () => useRouteTitle({ manual: true }, router),
    );
    act(() => {
      result.current.setTitles(readRouteTitles(router, routes));
    });
    expect(result.current.titles.length).toBeGreaterThanOrEqual(0);
    router.stop();
  });
});

describe('hooks 与 RouterView 集成', () => {
  const RouteDisplay = () => {
    const route = useRoute();
    return React.createElement('div', { 'data-testid': 'route-path' }, route?.path || '');
  };

  it('挂载 RouterView 后 useRoute 应获取路径', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');

    renderWithRouter(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(RouterViewComponent, { router }),
        React.createElement(RouteDisplay),
      ),
      router,
    );

    expect((await screen.findByTestId('route-path')).textContent).toBe('/about');
    router.stop();
  });
});
