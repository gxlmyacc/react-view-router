import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import RouterViewDefault, {
  RouterViewComponent,
  RouterViewWrapper,
  _checkActivate,
  _checkDeactivate,
} from '../src/router-view';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About, renderUtils } from './helpers/test-utils';
import { normalizeRoutes } from '../src/util';
import ReactViewRouter from '../src/router';
import { HistoryType } from '../src/history/types';

describe('RouterView 工具函数', () => {
  it('_checkActivate 路径一致时应返回 true', () => {
    const router = { basenameNoSlash: '' } as ReactViewRouter;
    const matched = { path: '/a' } as any;
    const event = {
      router,
      target: { path: '/a' },
    } as any;
    expect(_checkActivate(router, matched, event)).toBe(true);
  });

  it('_checkDeactivate 子路径应匹配', () => {
    const router = { basenameNoSlash: '' } as ReactViewRouter;
    const matched = { path: '/parent/child' } as any;
    const event = {
      router,
      target: { path: '/parent' },
    } as any;
    expect(_checkDeactivate(router, matched, event)).toBe(true);
  });

  it('父路由或 router 缺失时不匹配激活/停用事件', () => {
    const router = { basenameNoSlash: '' } as ReactViewRouter;
    const event = { router, target: { path: '/a' } } as any;
    expect(_checkActivate(router, null, event)).toBeUndefined();
    expect(_checkActivate(null, { path: '/a' } as any, event)).toBeUndefined();
    expect(_checkDeactivate(router, null, event)).toBeUndefined();
    expect(_checkDeactivate(null, { path: '/a' } as any, event)).toBeUndefined();
    expect(_checkActivate(router, { path: '/b' } as any, event)).toBe(false);
    expect(_checkDeactivate(router, { path: '/elsewhere' } as any, event)).toBe(false);
  });
});

describe('RouterView 类方法', () => {
  /**
   * 创建未挂载的 RouterView 实例用于单元测试。
   * @param props 组件 props
   * @returns RouterView 实例与 router
   */
  function createView(props: Record<string, any> = {}) {
    const router = createTestRouter();
    const view = new (RouterViewComponent as any)({ router, ...props });
    return { view, router };
  }

  it('_filterRoutes 应过滤具名视图路由', () => {
    const routes = normalizeRoutes([
      { path: '/', component: Home, components: { sidebar: About } },
      { path: '/about', component: About },
    ]);
    const { view, router } = createView({ name: 'sidebar' });
    const filtered = view._filterRoutes(routes);
    expect(filtered.length).toBe(1);
    router.stop();
  });

  it('isNull 应识别空路由', () => {
    const { view, router } = createView();
    expect(view.isNull(null)).toBe(true);
    expect(view.isNull({ path: '/a', subpath: 'a' })).toBeFalsy();
    expect(view.isNull({ path: '/', subpath: '' })).toBe(true);
    router.stop();
  });

  it('getMatchedRoute 应按 depth 返回匹配项', () => {
    const { view, router } = createView();
    syncNavigate(router, '/users/1');
    const matched = view.getMatchedRoute(router.currentRoute, 0);
    expect(matched?.params?.id).toBe('1');
    router.stop();
  });

  it('getMatchedRoute 默认使用根深度，KeepAlive 可从 view 配置读取', () => {
    const { view, router } = createView({ keepAlive: true });
    syncNavigate(router, '/users/1');
    const route = router.currentRoute!.matched[0];
    expect(view.getMatchedRoute(router.currentRoute)).toBe(route);
    expect(view.isKeepAliveRoute(route, null)).toBe(true);
    router.stop();
  });

  it('_refreshCurrentRoute 使用深层 matched 作为当前视图路由', () => {
    const { view, router } = createView();
    syncNavigate(router, '/users/1');
    const route = router.currentRoute!.matched[0];
    jest.spyOn(view, 'getMatchedRoute').mockReturnValue(null);
    const nextState: any = { ...view.state, router, depth: 0, inited: false };
    expect(view._refreshCurrentRoute(nextState)).toBe(route);
    expect(nextState.currentRoute).toBe(route);
    router.stop();
  });

  it('isKeepAliveRoute 应根据 config.keepAlive 判断', () => {
    const routes = normalizeRoutes([
      { path: '/ka', component: Home, keepAlive: true },
      { path: '/other', component: About },
    ]);
    const router = createTestRouter(routes);
    syncNavigate(router, '/ka');
    const { view } = createView({ router });
    const current = router.currentRoute!.matched[0];
    const to = router.getMatched('/other')[0];
    expect(view.isKeepAliveRoute(current, to, router)).toBe(true);
    router.stop();
  });

  it('_checkEnableKeepAlive props 含 keepAlive 时应为 true', () => {
    const { view, router } = createView({ keepAlive: true });
    expect(view._checkEnableKeepAlive()).toBe(true);
    router.stop();
  });

  it('getComponentProps 应排除内部 props', () => {
    const { view, router } = createView({ className: 'wrap', name: 'default' });
    const { props } = view.getComponentProps();
    expect(props.className).toBe('wrap');
    expect(props.name).toBeUndefined();
    router.stop();
  });

  it('renderCurrent 无路由时应返回 null', () => {
    const { view, router } = createView();
    view.state.inited = true;
    const result = view.renderCurrent(null);
    expect(result).toBeNull();
    router.stop();
  });
});

describe('RouterView 集成渲染', () => {
  it('viewPresenter 应包装当前路由视图且不改变路由组件挂载', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const presenter = jest.fn(({ children, route }: any) =>
      React.createElement('div', { 'data-testid': 'presenter', 'data-route': route?.path }, children));
    renderWithRouter(React.createElement(RouterViewComponent, {
      router,
      viewPresenter: presenter,
    }), router);
    expect(await screen.findByTestId('home')).toBeTruthy();
    expect(screen.getByTestId('presenter').getAttribute('data-route')).toBe('/');
    syncNavigate(router, '/about');
    await screen.findByTestId('about');
    expect(screen.getByTestId('presenter').getAttribute('data-route')).toBe('/about');
    expect(presenter).toHaveBeenCalled();
    router.stop();
  });

  it('应渲染匹配路由组件', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');

    renderWithRouter(
      React.createElement(RouterViewComponent, { router }),
      router,
    );

    expect(await screen.findByTestId('home')).toBeTruthy();
    router.stop();
  });

  it('导航后应切换组件', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');

    renderWithRouter(
      React.createElement(RouterViewComponent, { router }),
      router,
    );

    await screen.findByTestId('home');
    syncNavigate(router, '/about');

    await waitFor(() => {
      expect(screen.getByTestId('about')).toBeTruthy();
    });
    router.stop();
  });

  it('RouterViewWrapper 应在 router 运行后渲染', async () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [{ path: '/', component: Home }],
      renderUtils,
    });
    router.start();
    syncNavigate(router, '/');

    renderWithRouter(
      React.createElement(RouterViewWrapper, { router }),
      router,
    );

    expect(await screen.findByTestId('home')).toBeTruthy();
    router.stop();
  });

  it('fallback 函数应在未初始化时渲染', () => {
    const router = createTestRouter();
    const { container } = renderWithRouter(
      React.createElement(RouterViewComponent, {
        router,
        fallback: () => React.createElement('div', { 'data-testid': 'loading' }, 'loading'),
      }),
      router,
    );
    expect(container.querySelector('[data-testid="loading"]')).toBeTruthy();
    router.stop();
  });

  it('默认导出应为 RouterViewWrapper', () => {
    expect(RouterViewDefault).toBe(RouterViewWrapper);
  });
});

describe('RouterView 类方法扩展', () => {
  function createView(props: Record<string, any> = {}) {
    const router = createTestRouter();
    const view = new (RouterViewComponent as any)({ router, ...props });
    return { view, router };
  }

  it('_kaActivate 路径匹配应激活', () => {
    const { view, router } = createView();
    syncNavigate(router, '/');
    view.state = {
      ...view.state,
      router,
      parentRoute: router.currentRoute!.matched[0],
      currentRoute: router.currentRoute,
    };
    view._kaActivate({
      router,
      target: { path: '/' },
    } as any);
    expect(view._isActivate).toBe(true);
    router.stop();
  });

  it('_kaDeactivate 应停用', () => {
    const { view, router } = createView();
    view._isActivate = true;
    view.state = {
      ...view.state,
      router,
      parentRoute: { path: '/parent' },
    };
    view._events = { activate: [], deactivate: [jest.fn()] };
    view._kaDeactivate({
      router,
      target: { path: '/parent' },
    } as any);
    expect(view._isActivate).toBe(false);
    router.stop();
  });

  it('位置快照只对已提交且实际变化的导航创建', () => {
    const { view, router } = createView();
    syncNavigate(router, '/');
    const current = router.currentRoute!;
    const before = { ...view.state, inited: true, currentRoute: { path: '/old' } } as any;
    view.state.currentRoute = { path: '/new' } as any;
    (view as any)._positionRoute = current;
    expect(view.getSnapshotBeforeUpdate(view.props, before)).toBeNull();
    (view as any)._positionRoute = null;
    expect(view.getSnapshotBeforeUpdate(view.props, before)).toMatchObject({ to: current });
    expect(view.getSnapshotBeforeUpdate(view.props, { ...before, inited: false })).toBeNull();
    router.stop();
  });

  it('挂载后更新位置游标，但无导航快照时不执行恢复', () => {
    const { view, router } = createView();
    syncNavigate(router, '/');
    view.state.inited = true;
    view.componentDidUpdate(view.props, { ...view.state, inited: false } as any, null as any);
    expect((view as any)._positionRoute).toBe(router.currentRoute);
    view.componentDidUpdate(view.props, view.state, null as any);
    expect((view as any)._positionRoute).toBe(router.currentRoute);
    router.stop();
  });

  it('视图失活时不参与父级激活状态，ref 回调和缓存 ref 均可选', () => {
    const updateRef = jest.fn();
    const { view, router } = createView({ _updateRef: updateRef });
    view._isActivate = false;
    expect(view.isActivate).toBe(false);
    view._updateRef({ id: 'instance' } as any);
    expect(updateRef).toHaveBeenCalledTimes(1);
    view._updateKARef({ activeNode: { instance: null } } as any);
    view._updateRef({ id: 'cached' } as any);
    expect((view._kaRef as any).activeNode.instance).toBeTruthy();
    view._updateKARef(null as any);
    expect(view._kaRef).toBeNull();
    router.stop();
  });

  it('无 KeepAlive 配置时关闭缓存，router 函数和正则配置可启用缓存', () => {
    const { view, router } = createView();
    expect(view._checkEnableKeepAlive(null)).toBe(false);
    router.options.keepAlive = () => true;
    expect(view._checkEnableKeepAlive(null)).toBe(true);
    router.options.keepAlive = /users/;
    expect(view._checkEnableKeepAlive(null)).toBe(true);
    router.stop();
  });

  it('fallback 可接收上下文、渲染元素或安全回退为空', () => {
    const element = React.createElement('span', null, 'fallback');
    const fallback = jest.fn(() => element);
    const { view, router } = createView({ fallback });
    expect(view._resolveFallback()).toBe(element);
    expect(fallback).toHaveBeenCalledWith(expect.objectContaining({ view, router }));
    (view as any).props = { fallback: element };
    expect(view._resolveFallback()).toBe(element);
    (view as any).props = { fallback: () => null };
    expect(view._resolveFallback()).toBeNull();
    expect(view.getComponent(null)).toBeNull();
    router.stop();
  });

  it('卸载时清理父级监听器，且 resolving 更新忽略未挂载实例', () => {
    const { view, router } = createView();
    const parent = { _events: { activate: [view._kaActivate], deactivate: [view._kaDeactivate] } };
    view.state = { ...view.state, parent, _routerRoot: true, router };
    view.componentWillUnmount();
    expect(parent._events.activate).toEqual([]);
    expect(parent._events.deactivate).toEqual([]);
    expect(router.viewRoot).toBeNull();
    expect(() => view._updateResolving(true)).not.toThrow();
    router.stop();
  });

  it('覆盖 view 可选配置与嵌套路由状态回退', () => {
    const { view, router } = createView({ depth: 2 });
    syncNavigate(router, '/users/1');
    expect(view.state.depth).toBe(2);
    expect(view.getMatchedRoute(router.currentRoute, 2)).toBeNull();
    expect(view.isKeepAliveRoute(null, null, router)).toBe(false);

    const parent = { isRouterViewInstance: true, isActivate: false, state: { _routerRoot: true } };
    (view as any)._reactInternals = { return: { stateNode: parent } };
    view.state = { ...view.state, _routerRoot: true };
    view._isActivate = true;
    router.basename = '/app/';
    expect(view.isActivate).toBe(false);

    view._kaRef = {} as any;
    expect(view._checkEnableKeepAlive(null)).toBe(true);
    const currentRoute = router.currentRoute!.matched[0];
    view.state = { ...view.state, currentRoute };
    const kaRef = { activeNode: { instance: null } } as any;
    view._updateKARef(kaRef);
    view._updateRef({ id: 'fallback-ref' } as any);
    expect(kaRef.activeNode.instance).toBeTruthy();
    router.stop();
  });

  it('刷新 route 遇到 redirect 会清空匹配，挂载态 resolver 更新会提交状态', () => {
    const { view, router } = createView();
    syncNavigate(router, '/');
    const redirect = { ...router.currentRoute!.matched[0], redirect: true };
    jest.spyOn(view, 'getMatchedRoute').mockReturnValue(redirect as any);
    const state: any = { ...view.state, router, inited: false, depth: 0 };
    expect(view._refreshCurrentRoute(state)).toBeNull();

    const setState = jest.fn();
    view.setState = setState;
    view._isMounted = true;
    view._updateResolving(true, router.currentRoute);
    expect(setState).toHaveBeenCalledWith({ resolving: true, toRoute: router.currentRoute });
    view._isMounted = false;
    router.stop();
  });

  it('renderContainer 支持路由容器回调及空路由回退', () => {
    const container = jest.fn(() => React.createElement('div', { 'data-testid': 'wrapped' }));
    const { view, router } = createView({ container });
    syncNavigate(router, '/');
    const currentRoute = router.currentRoute!.matched[0];
    expect(view.renderContainer(null, currentRoute)).toEqual(expect.objectContaining({ type: 'div' }));
    expect(container).toHaveBeenCalled();
    expect(view.renderContainer('child' as any, null)).toBe('child');
    router.stop();
  });

  it('_kaActivate/_kaDeactivate 忽略自身来源与不匹配的父路径', () => {
    const { view, router } = createView();
    const deactivate = jest.fn();
    view._events = { activate: [], deactivate: [deactivate] };
    view.state = { ...view.state, router, parentRoute: { path: '/parent' } as any };
    const ownEvent = { source: view, router, target: { path: '/parent' } } as any;
    view._kaActivate(ownEvent);
    view._kaDeactivate(ownEvent);
    const unrelated = { source: {}, router, target: { path: '/other' } } as any;
    view._kaActivate(unrelated);
    view._kaDeactivate(unrelated);
    expect(view._isActivate).toBe(true);
    expect(deactivate).not.toHaveBeenCalled();
    router.stop();
  });

  it('_notifyViewActivation 按事件先后派发监听器和实例生命周期', () => {
    const { view, router } = createView();
    const calls: string[] = [];
    const instance = {
      componentWillUnactivate: () => calls.push('will-unactivate'),
      componentDidActivate: () => calls.push('did-activate'),
    };
    view._events = {
      activate: [() => calls.push('activate-listener')],
      deactivate: [() => calls.push('deactivate-listener')],
    };
    const target: any = { componentInstances: { default: instance } };
    view._notifyViewActivation({ type: 'deactivate', router, source: view, target, to: null, from: null } as any);
    view._notifyViewActivation({ type: 'activate', router, source: view, target, to: null, from: null } as any);
    expect(calls).toEqual([
      'deactivate-listener', 'will-unactivate', 'did-activate', 'activate-listener',
    ]);
    router.stop();
  });

  it('_updateRef 应写入 componentInstances', () => {
    const { view, router } = createView();
    syncNavigate(router, '/');
    const currentRoute = {
      ...router.currentRoute,
      componentInstances: {} as Record<string, any>,
    };
    view.state = { ...view.state, currentRoute };
    view._updateRef({ id: 'ref1' } as any);
    expect(currentRoute.componentInstances.default).toBeTruthy();
    router.stop();
  });

  it('getDerivedStateFromProps 应规范化 props', () => {
    const props: any = { beforeEach: jest.fn() };
    RouterViewComponent.getDerivedStateFromProps(props);
    expect(props.beforeEach.global).toBe(true);
  });

  it('shouldComponentUpdate 覆盖挂载守卫和常见 state/props 变化', () => {
    const { view, router } = createView();
    const nextRouter = createTestRouter();
    const state = { ...view.state, currentRoute: null, routes: [] } as any;
    view.state = state;

    view._isMounted = false;
    expect(view.shouldComponentUpdate(view.props, state)).toBe(false);
    view._isMounted = true;
    expect(view.shouldComponentUpdate(view.props, state)).toBe(false);
    expect(view.shouldComponentUpdate(view.props, { ...state, resolving: !state.resolving })).toBe(true);
    expect(view.shouldComponentUpdate(view.props, { ...state, inited: !state.inited })).toBe(true);
    expect(view.shouldComponentUpdate(view.props, { ...state, depth: state.depth + 1 })).toBe(true);
    expect(view.shouldComponentUpdate(view.props, { ...state, router: nextRouter })).toBe(true);
    expect(view.shouldComponentUpdate({ ...view.props, className: 'changed' }, state)).toBe(true);
    expect(view.shouldComponentUpdate(view.props, {
      ...state,
      currentRoute: { path: '/b', matched: [] },
    })).toBe(true);
    expect(view.shouldComponentUpdate(view.props, { ...state, routes: [{}] })).toBe(true);

    nextRouter.stop();
    router.stop();
  });

  it('render 在 router 不可用时返回 null，位置路由刷新需要 router', () => {
    const { view, router } = createView();
    view.state = { ...view.state, inited: true, router: null };
    expect(view.render()).toBeNull();
    expect(() => view._refreshCurrentRoute({ ...view.state, router: null } as any))
      .toThrow('state.router is null!');
    router.stop();
  });

  it('componentDidMount 对已初始化或没有 root router 的 view 提前返回', async () => {
    const initialized = createView();
    initialized.view.state = { ...initialized.view.state, inited: true };
    await initialized.view.componentDidMount();
    expect(initialized.view._isMounted).toBe(true);
    initialized.router.stop();

    const orphan = createView();
    orphan.view.state = { ...orphan.view.state, inited: false, router: null };
    await orphan.view.componentDidMount();
    expect(orphan.view._isMounted).toBe(true);
    orphan.router.stop();
  });

  it('根 view 可从 history.index/location 初始化，且无 router 时容器直接返回内容', async () => {
    const { view, router } = createView();
    const getIndexAndLocation = router.history.getIndexAndLocation;
    const handleRouteInterceptor = router._handleRouteInterceptor;
    (router.history as any).getIndexAndLocation = undefined;
    router._handleRouteInterceptor = ((location: any, callback: Function) => {
      expect(location).toEqual(expect.objectContaining({ pathname: router.history.location.pathname }));
      callback(false, null);
    }) as any;
    try {
      await view.componentDidMount();
    } finally {
      (router.history as any).getIndexAndLocation = getIndexAndLocation;
      router._handleRouteInterceptor = handleRouteInterceptor;
      view.componentWillUnmount();
      router.stop();
    }
  });

  it('container 容器事件和 fallback/keepAlive 的特例 props 不触发更新', () => {
    const { view, router } = createView({
      fallback: React.createElement('div'),
      keepAlive: () => true,
    });
    view._isMounted = true;
    const currentProps = view.props;
    const currentState = { ...view.state, resolving: true } as any;
    view.state = currentState;
    expect(view.shouldComponentUpdate({ ...currentProps, fallback: React.createElement('span') }, currentState)).toBe(false);
    expect(view.shouldComponentUpdate({ ...currentProps, keepAlive: () => false }, currentState)).toBe(false);
    view.props = { ...view.props, container: undefined };
    view.state = { ...view.state, router: null };
    expect(view.renderContainer('child' as any, null)).toBe('child');
    router.stop();
  });
});
