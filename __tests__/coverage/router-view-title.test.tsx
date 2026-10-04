import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { RouterViewComponent } from '../../src/router-view';
import useRouteTitle, { readRouteTitles } from '../../src/hooks/use-route-title';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';
import { HistoryType } from '../../src/history/types';
import { normalizeRoutes } from '../../src/util';

describe('RouterView 嵌套与生命周期', () => {
  /**
   * 构造带父级 fiber 的子 RouterView。
   * @param router 路由器
   * @param parentView 父级视图
   */
  function createChildView(router: ReturnType<typeof createTestRouter>, parentView: any) {
    const child = new (RouterViewComponent as any)({ router });
    child._reactInternals = {
      return: {
        memoizedState: { _routerRoot: true },
        stateNode: parentView,
        return: null,
      },
    };
    child.state = { ...child.state, router, inited: false };
    return child;
  }

  it('嵌套 componentDidMount 应设置 depth', async () => {
    const router = createTestRouter(
      [{ path: '/', component: Home, children: [{ path: '/child', component: About }] }],
      { basename: '/app' },
    );
    router._initRouter({ basename: '/app', mode: HistoryType.hash });
    syncNavigate(router, '/child');
    const parent = new (RouterViewComponent as any)({ router });
    parent._reactInternals = {};
    parent.state = {
      inited: true,
      depth: 0,
      router,
      _routerRoot: true,
      routes: router.routes,
      currentRoute: router.currentRoute,
    };
    parent._events = { activate: [], deactivate: [] };
    const child = createChildView(router, parent);
    child._isMounted = true;
    const setStateSpy = jest.spyOn(child, 'setState').mockImplementation((partial: any) => {
      Object.assign(child.state, partial);
    });
    await child.componentDidMount();
    expect(child.state.depth).toBe(1);
    setStateSpy.mockRestore();
    router.stop();
  });

  it('componentWillUnmount 应移除父级事件', () => {
    const router = createTestRouter();
    const parent = new (RouterViewComponent as any)({ router });
    parent._events = { activate: [], deactivate: [] };
    parent.state = { parent: null, _routerRoot: true, router };
    router.viewRoot = parent;
    const child = createChildView(router, parent);
    child.state = { ...child.state, parent, router };
    parent._events.activate.push(child._kaActivate);
    parent._events.deactivate.unshift(child._kaDeactivate);
    child.componentWillUnmount();
    expect(parent._events.activate).not.toContain(child._kaActivate);
    router.stop();
  });

  it('shouldComponentUpdate 路由变化应更新', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const view = new (RouterViewComponent as any)({ router });
    view._isMounted = true;
    view.state = { ...view.state, router, currentRoute: router.currentRoute, inited: true };
    syncNavigate(router, '/about');
    const nextState = { ...view.state, currentRoute: router.currentRoute };
    expect(view.shouldComponentUpdate(view.props, nextState)).toBe(true);
    router.stop();
  });
});

describe('useRouteTitle 深度覆盖', () => {
  it('传入 defaultRouter 应解析 titles', () => {
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: '首页' } },
      { path: '/about', component: About, meta: { title: '关于' } },
    ]);
    const { result } = renderHook(() => useRouteTitle({}, router));
    expect(result.current.titles.length).toBe(2);
    expect(result.current.parsed).toBe(true);
    router.stop();
  });

  it('嵌套 titles 应包含子路由', () => {
    const router = createTestRouter();
    const routes = normalizeRoutes([
      {
        path: '/p',
        component: Home,
        meta: { title: '父' },
        children: [{ path: '/p/c', component: About, meta: { title: '子' } }],
      },
    ]);
    const titles = readRouteTitles(router, routes);
    expect(titles[0]?.children?.some(t => t.title === '子')).toBe(true);
    router.stop();
  });

  it('onNoMatchedPath 字符串 :first 应触发 fallback', async () => {
    jest.useFakeTimers();
    const router = createTestRouter([
      { path: '/', component: Home, meta: { title: 'H' } },
      { path: '/fb', component: About, meta: { title: 'FB' } },
    ]);
    renderHook(
      () => useRouteTitle({ onNoMatchedPath: ':first', manual: true }, router),
    );
    act(() => jest.runAllTimers());
    jest.useRealTimers();
    router.stop();
  });

  it('_updateKARef 应保存 ref', () => {
    const router = createTestRouter();
    const view = new (RouterViewComponent as any)({ router });
    const kaRef = { activeName: '/x', nodes: [] };
    view._updateKARef(kaRef as any);
    expect(view._kaRef).toBe(kaRef);
    router.stop();
  });

  it('renderCurrent 有匹配路由应渲染', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const view = new (RouterViewComponent as any)({ router });
    view.state = {
      ...view.state,
      router,
      inited: true,
      routes: router.routes,
      currentRoute: router.currentRoute!.matched[0],
    };
    const result = view.renderCurrent(router.currentRoute!.matched[0]);
    expect(result).toBeTruthy();
    router.stop();
  });
});
