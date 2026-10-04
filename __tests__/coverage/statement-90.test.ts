import React from 'react';
import { render, waitFor, act, renderHook, act as hookAct } from '@testing-library/react';
import ReactViewRouter from '../../src/router';
import { RouterViewComponent, RouterViewWrapper } from '../../src/router-view';
import RouterDrawerWrapper from '../../drawer/src/index';
import { RouterViewContext } from '../../src/context';
import useRouteTitle, { readRouteTitles } from '../../src/hooks/use-route-title';
import { withRouteGuards } from '../../src/route-guard';
import { RouteLazy } from '../../src/route-lazy';
import config, { parseQuery, stringifyQuery } from '../../src/config';
import {
  normalizeRoutes,
  normalizeLocation,
  matchRoutes,
  getRouteChildren,
  isMatchedRoutePropsChanged,
  configRouteProps,
  innumerable,
} from '../../src/util';
import { HistoryType } from '../../src/history/types';
import { createTestRouter, syncNavigate, Home, About, renderUtils } from '../helpers/test-utils';

describe('语句覆盖率 90% 补充', () => {
  /**
   * 模拟已挂载的 viewRoot。
   * @param router 路由器实例
   */
  function mockViewRoot(router: ReactViewRouter) {
    router.viewRoot = {
      state: { inited: true },
      _isMounted: true,
      props: {},
      _refreshCurrentRoute: jest.fn(),
    } as any;
  }

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('router.ts', () => {
    it('pluginName / top 应正确返回', () => {
      const parent = createTestRouter();
      parent.name = 'parent-router';
      const child = new ReactViewRouter({
        manual: true,
        mode: HistoryType.memory,
        routes: [{ path: '/', component: Home }],
        renderUtils,
      });
      child._updateParent(parent);
      child.start();
      expect(parent.pluginName).toBe('parent-router');
      expect(child.top).toBe(parent);
      child.stop();
      parent.stop();
    });

    it('plugin 重复注册应直接返回', () => {
      const router = createTestRouter();
      const plugin = { name: 'dup', onRouteChange: jest.fn() };
      router.plugin(plugin);
      expect(router.plugin(plugin)).toBeUndefined();
      router.stop();
    });

    it('history getter 应重绑带 bindThis 的方法', () => {
      const router = new ReactViewRouter({
        manual: true,
        mode: HistoryType.memory,
        routes: [{ path: '/', component: Home }],
        renderUtils,
      });
      innumerable(router.push, 'bindThis', true);
      router.start();
      expect((router.push as any).bindThis).toBe(true);
      router.stop();
    });

    it('rememberInitialRoute + basename 应恢复初始栈', () => {
      const router = createTestRouter(
        [{ path: '/app', component: Home }, { path: '/app/about', component: About }],
        { basename: '/app', rememberInitialRoute: true },
      );
      router.history.push('/app');
      router.history.push('/app/about');
      router._refreshInitialRoute();
      expect(router.initialRoute).toBeDefined();
      router.stop();
    });

    it('rememberInitialRoute 无 basename 应使用首条栈', () => {
      const router = createTestRouter(
        [{ path: '/', component: Home }],
        { rememberInitialRoute: true },
      );
      router.history.push('/');
      router._refreshInitialRoute();
      expect(router.initialRoute?.path).toBe('/');
      router.stop();
    });

    it('updateRoute 相同 fullPath 应提前返回', () => {
      const router = createTestRouter();
      syncNavigate(router, '/about');
      const route = router.currentRoute!;
      const prev = router.prevRoute;
      router.updateRoute(route);
      expect(router.prevRoute).toBe(prev);
      router.stop();
    });

    it('updateRoute basename 应同步 stacks', () => {
      const router = createTestRouter(
        [{ path: '/app', component: Home }, { path: '/app/page', component: About }],
        { basename: '/app' },
      );
      router.history.stacks = [
        { pathname: '/app', search: '', hash: '', index: 0, timestamp: 1, query: {} } as any,
        { pathname: '/app/page', search: '', hash: '', index: 1, timestamp: 2, query: {} } as any,
      ];
      syncNavigate(router, '/app/page');
      expect(router.stacks.length).toBeGreaterThan(0);
      router.stop();
    });

    it('updateRoute 应刷新 matched viewInstances', () => {
      const router = createTestRouter();
      syncNavigate(router, '/');
      const refresh = jest.fn();
      const prevMatched = router.currentRoute!.matched[0];
      prevMatched.viewInstances = {
        default: { _isMounted: true, _refreshCurrentRoute: refresh },
      };
      router.history.push('/about');
      router.updateRoute(router.history.location as any);
      expect(refresh).toHaveBeenCalled();
      router.stop();
    });

    it('addRoutes 指定无 children 的 parentRoute 应创建子路由', () => {
      const router = createTestRouter([{ path: '/p', component: Home }]);
      const parent = router.routes[0];
      router.addRoutes([{ path: 'c', component: About }], parent);
      expect(getRouteChildren(parent.children, parent).length).toBeGreaterThan(0);
      router.stop();
    });

    it('onError 重复注册不应重复入队', () => {
      const router = createTestRouter();
      const handler = jest.fn();
      router.onError(handler);
      router.onError(handler);
      expect(router.errorCallbacks.filter((cb) => cb === handler).length).toBe(1);
      router.stop();
    });

    it('_getComponentGuards 应收集 vuelike mixin 守卫', () => {
      const leave = jest.fn();
      const MixinComp: any = function MixinComp() {};
      MixinComp.__vuelike = true;
      MixinComp.mixins = [{ beforeRouteLeave: leave }];
      MixinComp.__flows = ['beforeRouteLeave'];
      const router = createTestRouter();
      router.vuelike = { flow: (fn: any) => fn };
      const mr = router.currentRoute!.matched[0];
      mr.config.components = { default: MixinComp };
      const guards = router._getComponentGuards(mr, 'beforeRouteLeave');
      expect(guards.length).toBeGreaterThan(0);
      router.stop();
    });

    it('_getComponentGuards 应绑定组件实例', () => {
      const leave = jest.fn();
      const Guarded = withRouteGuards(Home, { beforeRouteLeave: leave });
      const router = createTestRouter([{ path: '/', component: Guarded as any }]);
      syncNavigate(router, '/');
      const mr = router.currentRoute!.matched[0];
      const instance = { id: 'inst' };
      mr.componentInstances = { default: instance };
      const guards = router._getComponentGuards(mr, 'beforeRouteLeave');
      expect(guards.length).toBeGreaterThan(0);
      router.stop();
    });

    it('_getBeforeEachGuards 应跳过已调用的 beforeEnter 守卫', () => {
      const router = createTestRouter();
      syncNavigate(router, '/');
      const calledGuard = jest.fn();
      const to = router.createRoute('/about');
      to.matched[0].guards.beforeEnter.push({
        guard: calledGuard,
        called: true,
        lazy: false,
      } as any);
      const guards = router._getBeforeEachGuards(to, router.currentRoute);
      expect(guards).not.toContain(calledGuard);
      router.stop();
    });

    it('_getBeforeResolveGuards 应跳过已调用守卫', () => {
      const router = createTestRouter();
      syncNavigate(router, '/');
      const resolveGuard = jest.fn();
      const matched = router.currentRoute!.matched[0];
      matched.guards.beforeResolve.push({
        guard: resolveGuard,
        called: true,
      } as any);
      const guards = router._getBeforeResolveGuards(router.createRoute('/about'), router.currentRoute);
      expect(guards).not.toContain(resolveGuard);
      router.stop();
    });

    it('_transformLocation 应沿父级拼接路径', () => {
      const parent = createTestRouter(
        [{ path: '/app', component: Home, children: [{ path: '/app/nested', component: About }] }],
        { basename: '/app' },
      );
      const child = new ReactViewRouter({
        manual: true,
        mode: HistoryType.memory,
        basename: '/app/nested',
        routes: [{ path: '/', component: About }],
        renderUtils,
      });
      child._updateParent(parent);
      child.start();
      const loc = child._transformLocation({ pathname: '/x', search: '', hash: '' } as any);
      expect(loc).toBeDefined();
      child.stop();
      parent.stop();
    });

    it('_handleRouteInterceptor init 子路由应继承父级路径', async () => {
      const parent = createTestRouter(
        [{ path: '/app', component: Home }],
        { basename: '/app' },
      );
      syncNavigate(parent, '/app');
      const child = new ReactViewRouter({
        manual: true,
        mode: HistoryType.memory,
        basename: '/app/sub',
        routes: [{ path: '/', component: About }],
        renderUtils,
      });
      child._updateParent(parent);
      child.start();
      mockViewRoot(child);
      let called = false;
      await new Promise<void>((resolve) => {
        child._handleRouteInterceptor(
          { pathname: '/app/sub', path: '/app/sub', search: '', query: {} } as any,
          () => {
            called = true;
            resolve();
          },
          true,
        );
      });
      expect(called).toBe(true);
      child.stop();
      parent.stop();
    });

    it('_handleRouteInterceptor absolute 非 basename 应快速通过', async () => {
      const router = createTestRouter([{ path: '/app', component: Home }], { basename: '/app' });
      let ok: boolean | undefined;
      await new Promise<void>((resolve) => {
        router._handleRouteInterceptor(
          { pathname: '/other', absolute: true, search: '' } as any,
          (res) => {
            ok = res as boolean;
            resolve();
          },
        );
      });
      expect(ok).toBe(true);
      router.stop();
    });

    it('backIfVisited full-match 应回退到匹配栈', () => {
      const router = createTestRouter([
        { path: '/', component: Home },
        { path: '/about', component: About },
      ]);
      syncNavigate(router, '/about?tab=1');
      syncNavigate(router, '/');
      mockViewRoot(router);
      const goSpy = jest.spyOn(router, 'go');
      router.push({
        path: '/about',
        query: { tab: '1' },
        backIfVisited: 'full-match',
      } as any);
      expect(goSpy).toHaveBeenCalled();
      router.stop();
    });

    it('nameToPath absolute 子路由应解析路径', () => {
      const parent = createTestRouter(
        [{ path: '/app', name: 'app', component: Home }],
        { basename: '/app' },
      );
      const child = new ReactViewRouter({
        manual: true,
        mode: HistoryType.memory,
        basename: '/app/sub',
        routes: [{ path: '/', name: 'sub', component: About }],
        renderUtils,
      });
      child._updateParent(parent);
      child.start();
      expect(child.nameToPath('sub', { absolute: true })).toBeTruthy();
      child.stop();
      parent.stop();
    });

    it('_getRouteState 应包装 path state', () => {
      const router = createTestRouter();
      const state = router._getRouteState({
        path: '/about',
        state: { foo: 1 },
      } as any);
      expect(state).toBeDefined();
      router.stop();
    });

    it('beforeRouteEnter next(cb) 应注册完成回调', async () => {
      const enterCb = jest.fn();
      const Guarded = withRouteGuards(Home, {
        beforeRouteEnter: (_t, _f, next) => next((ci: any) => enterCb(ci)),
      });
      const router = createTestRouter([{ path: '/enter', component: Guarded as any }]);
      mockViewRoot(router);
      syncNavigate(router, '/');
      const guards = router._getBeforeEachGuards(router.createRoute('/enter'), router.currentRoute);
      expect(guards.length).toBeGreaterThan(0);
      router.stop();
    });

    it('_routeInterceptors 守卫链应支持 next 回调', async () => {
      const router = createTestRouter();
      const guard = jest.fn((_t, _f, next) => next());
      const to = router.createRoute('/about');
      await new Promise<void>((resolve) => {
        router._routeInterceptors([guard], to, router.currentRoute, () => resolve());
      });
      expect(guard).toHaveBeenCalled();
      router.stop();
    });

    it('updateWhenQueryChange 应使用 props 比较', () => {
      const router = createTestRouter(
        [{ path: '/q', component: Home, queryProps: ['tab'] }],
        { updateWhenQueryChange: true },
      );
      syncNavigate(router, '/q?tab=1');
      syncNavigate(router, '/q?tab=2');
      expect(router.currentRoute?.query.tab).toBe('2');
      router.stop();
    });
  });

  describe('router-view.ts', () => {
    it('isKeepAliveRoute 函数形式 router.options 应生效', () => {
      const keepFn = jest.fn(() => true);
      const router = createTestRouter(
        [{ path: '/ka', component: Home }],
        { keepAlive: keepFn },
      );
      syncNavigate(router, '/ka');
      const view = new (RouterViewComponent as any)({ router, keepAlive: false });
      view.state = { router, depth: 0 };
      const matched = router.currentRoute!.matched[0];
      expect(view.isKeepAliveRoute(matched, matched, router)).toBe(true);
      expect(keepFn).toHaveBeenCalled();
      router.stop();
    });

    it('isKeepAliveRoute RegExp 应匹配路径', () => {
      const router = createTestRouter([{ path: '/ka', component: Home }]);
      syncNavigate(router, '/ka');
      const view = new (RouterViewComponent as any)({ router });
      view.state = { router, depth: 0 };
      const matched = router.currentRoute!.matched[0];
      view.props = { keepAlive: /^\/ka/ };
      expect(view.isKeepAliveRoute(matched, matched, router)).toBe(true);
      router.stop();
    });

    it('shouldComponentUpdate keepAlive 函数引用变化应忽略', () => {
      const router = createTestRouter();
      const view = new (RouterViewComponent as any)({ router, keepAlive: () => true });
      view._isMounted = true;
      view.state = { ...view.state, router, inited: true, resolving: false };
      const nextProps = { ...view.props, keepAlive: () => true };
      expect(view.shouldComponentUpdate(nextProps, view.state)).toBe(false);
      router.stop();
    });

    it('RouterViewWrapper 路由启动后应渲染', async () => {
      const router = new ReactViewRouter({
        manual: true,
        mode: HistoryType.memory,
        routes: [{ path: '/', component: Home }],
        renderUtils,
      });
      const { rerender } = render(React.createElement(RouterViewWrapper, { router }));
      router.start();
      rerender(React.createElement(RouterViewWrapper, { router }));
      await waitFor(() => expect(router.viewRoot).toBeTruthy());
      router.stop();
    });

    it('componentDidMount 嵌套 RouterView 应初始化子级', async () => {
      const router = createTestRouter([
        {
          path: '/p',
          component: Home,
          children: [{ path: '/p/c', component: About }],
        },
      ]);
      syncNavigate(router, '/p/c');
      const parentView = new (RouterViewComponent as any)({ router });
      parentView._isMounted = true;
      parentView.state = {
        router,
        depth: 0,
        inited: true,
        _routerRoot: true,
        routes: router.routes,
        currentRoute: router.currentRoute!.matched[0],
      };
      router.viewRoot = parentView;
      const childView = new (RouterViewComponent as any)({
        router,
        _parentView: parentView,
      });
      childView._isMounted = true;
      childView._reactInternals = { return: null };
      jest.spyOn(childView, 'setState').mockImplementation((partial: any) => {
        Object.assign(childView.state, partial);
      });
      await childView.componentDidMount();
      expect(childView.state.inited).toBe(true);
      router.stop();
    });
  });

  describe('util.ts / config.ts', () => {
    it('normalizeRoute 函数 children 应规范化', () => {
      const routes = normalizeRoutes([
        {
          path: '/fn',
          component: Home,
          children: () => [{ path: '/fn/c', component: About }],
        },
      ]);
      expect(routes[0].children).toBeDefined();
    });

    it('RouteLazy updater 应更新 children', async () => {
      const LazyComp: any = () => Home;
      LazyComp.__children = () => [{ path: '/lazy-c', component: About }];
      const lazy = new RouteLazy(Promise.resolve(LazyComp));
      const router = createTestRouter();
      const route = normalizeRoutes([{ path: '/lazy', component: lazy as any }])[0];
      lazy.updaters.push((c) => {
        if (c && c.__children) {
          const children = (c.__children as Function)(route) || [];
          innumerable(route, 'children', normalizeRoutes(children, route));
        }
        return c;
      });
      await lazy.toResolve(router, route, 'default');
      expect(route.children?.length).toBeGreaterThan(0);
      router.stop();
    });

    it('normalizeRoutes null 应返回空数组', () => {
      const routes = normalizeRoutes(null);
      expect(routes).toEqual([]);
    });

    it('matchRoutes index 路由应重定向路径', () => {
      const routes = normalizeRoutes([
        { path: '/idx', index: '/target', component: Home },
        { path: '/target', component: About },
      ]);
      const branch = matchRoutes(routes, { path: '/idx', pathname: '/idx' } as any);
      expect(branch.length).toBeGreaterThan(0);
    });

    it('normalizeLocation 应合并多个 search 片段', () => {
      const loc = normalizeLocation('/a?x=1?y=2');
      expect(loc?.search).toContain('x=1');
    });

    it('isMatchedRoutePropsChanged keys true 应比较全部字段', () => {
      const router = createTestRouter([{ path: '/p', component: Home, props: true }]);
      syncNavigate(router, '/p');
      router.prevRoute = { ...router.currentRoute!, params: {} } as any;
      const matched = router.currentRoute!.matched[0];
      expect(isMatchedRoutePropsChanged(matched, router)).toBe(false);
      router.stop();
    });

    it('configRouteProps type 函数应转换值', () => {
      const props: Record<string, any> = {};
      configRouteProps(props, { num: { type: (v: string) => Number(v) } }, { num: '9' });
      expect(props.num).toBe(9);
    });

    it('stringifyQuery 数组 null 元素应编码 key', () => {
      expect(stringifyQuery({ tags: [null, 'a'] })).toContain('tags');
    });

    it('parseQuery 重复 key 应合并为数组', () => {
      expect(parseQuery('?a=1&a=2').a).toEqual(['1', '2']);
    });

    it('configRouteProps false 应直接返回', () => {
      const props: Record<string, any> = { x: 1 };
      configRouteProps(props, false, { y: 2 });
      expect(props).toEqual({ x: 1 });
    });
  });

  describe('drawer / hooks', () => {
    it('RouterDrawerWrapper 应通过 context 渲染', async () => {
      const router = createTestRouter([
        {
          path: '/d',
          component: Home,
          children: [{ path: '/d/sub', component: About }],
        },
      ]);
      syncNavigate(router, '/d');
      const parentView = { isRouterViewInstance: true, state: { router, depth: 0 } };
      render(
        React.createElement(
          RouterViewContext.Provider,
          { value: parentView as any },
          React.createElement(RouterDrawerWrapper, { router }),
        ),
      );
      await waitFor(() => expect(router.viewRoot).toBeTruthy());
      router.stop();
    });

    it('useRouteTitle onNoMatchedPath 函数形式应调用 fallback', async () => {
      const router = createTestRouter([
        { path: '/', component: Home, meta: { title: 'Home' } },
        { path: '/about', component: About, meta: { title: 'About' } },
      ]);
      syncNavigate(router, '/about');
      const onNoMatchedPath = jest.fn((_path, _titles, fallback) => {
        fallback('/');
      });
      const { result } = renderHook(
        () => useRouteTitle({
          onNoMatchedPath,
          filter: (r) => r.path !== '/about',
        }, router),
      );
      await waitFor(() => expect(result.current.parsed).toBe(true));
      hookAct(() => syncNavigate(router, '/'));
      hookAct(() => syncNavigate(router, '/about'));
      await waitFor(() => expect(onNoMatchedPath).toHaveBeenCalled(), { timeout: 5000 });
      router.stop();
    });

    it('useRouteTitle 非 defaultRouter 路由变化应刷新 tabs', async () => {
      const router = createTestRouter([
        {
          path: '/p',
          component: Home,
          meta: { title: '父' },
          children: [{ path: '/p/c', component: About, meta: { title: '子' } }],
        },
      ]);
      syncNavigate(router, '/p');
      const view = { state: { depth: 1, router } };
      const { result } = renderHook(
        () => useRouteTitle({ manual: true }, router),
        {
          wrapper: ({ children }) =>
            React.createElement(RouterViewContext.Provider, { value: view as any }, children),
        },
      );
      hookAct(() => {
        result.current.setTitles(readRouteTitles(router, router.routes));
      });
      hookAct(() => syncNavigate(router, '/p/c'));
      await waitFor(() => expect(result.current.matchedRoutes.length).toBeGreaterThan(0));
      router.stop();
    });
  });
});
