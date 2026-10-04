/* eslint-disable max-classes-per-file */
import React from 'react';
import { RouterLink } from '../../src/router-link';
import { RouterViewComponent } from '../../src/router-view';
import config, { parseQuery } from '../../src/config';
import { RouteLazy } from '../../src/route-lazy';
import { getPossibleHistory, REACT_VIEW_ROUTER_GLOBAL } from '../../src/history-fix';
import { createHistory } from '../../src/history/history';
import {
  normalizeLocation,
  normalizeRoutes,
  configRouteProps,
} from '../../src/util';
import { HistoryType } from '../../src/history/types';
import { createHeavyHistoryWindow } from '../helpers/heavy-history-mock';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';

describe('语句覆盖率清零补充', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('parseQuery 第三次重复 key 应 push 到数组', () => {
    expect(parseQuery('?a=1&a=2&a=3').a).toEqual(['1', '2', '3']);
  });

  it('RouterLink _remount 应调用 unplugin', () => {
    const router = createTestRouter();
    const uninstall = jest.fn();
    jest.spyOn(router, 'plugin').mockImplementation(() => uninstall);
    const link = new RouterLink({ to: '/about', tag: 'a', router });
    link.state = {
      seed: 1, router, routerView: null, inited: true, isMatched: false,
    };
    jest.spyOn(link, 'setState').mockImplementation((partial: any) => {
      Object.assign(link.state, partial);
    });
    link._remount();
    link._remount();
    expect(uninstall).toHaveBeenCalled();
    router.stop();
  });

  it('normalizeLocation 多段 search 第二段应拼接', () => {
    const loc = normalizeLocation('/p?a=1?b=2');
    expect(loc?.search).toMatch(/b=2|%3Fb%3D2/);
  });

  it('configRouteProps 标量 default 分支应执行', () => {
    const props: Record<string, any> = {};
    expect(() => configRouteProps(props, { role: { default: 'guest' } }, {})).not.toThrow();
  });

  it('RouteLazy import 失败应 reject', async () => {
    const lazy = new RouteLazy(Promise.reject(new Error('load fail')));
    const router = createTestRouter();
    const route = normalizeRoutes([{ path: '/err', component: lazy as any }])[0];
    await expect(lazy.toResolve(router, route, 'default')).rejects.toThrow('load fail');
    router.stop();
  });

  it('getPossibleHistory 无缓存时应回退 options.history', () => {
    const router = createTestRouter([], { mode: HistoryType.memory });
    const savedHash = REACT_VIEW_ROUTER_GLOBAL.historys.hash;
    const savedBrowser = REACT_VIEW_ROUTER_GLOBAL.historys.browser;
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = undefined;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = undefined;
    expect(getPossibleHistory({ history: router.history })).toBe(router.history);
    REACT_VIEW_ROUTER_GLOBAL.historys.hash = savedHash;
    REACT_VIEW_ROUTER_GLOBAL.historys.browser = savedBrowser;
    router.stop();
  });

  it('_refreshInitialRoute rememberInitialRoute basename 应回溯', () => {
    const router = createTestRouter(
      [{ path: '/app', component: Home }, { path: '/app/inner', component: About }],
      { basename: '/app', rememberInitialRoute: true },
    );
    router.history.stacks = [
      { pathname: '/', search: '', hash: '', index: 0, timestamp: 0, query: {} } as any,
      { pathname: '/app', search: '', hash: '', index: 1, timestamp: 1, query: {} } as any,
      { pathname: '/app/inner', search: '', hash: '', index: 2, timestamp: 2, query: {} } as any,
    ];
    router._refreshInitialRoute();
    expect(router.initialRoute?.path).toBeDefined();
    router.stop();
  });

  it('_refreshInitialRoute hash 模式应合并浏览器 query', () => {
    const router = createTestRouter(
      [{ path: '/app', component: Home }, { path: '/app/inner', component: About }],
      { basename: '/app', rememberInitialRoute: true, mode: HistoryType.hash },
    );
    router.history.stacks = [
      { pathname: '/app', search: '', hash: '', index: 1, timestamp: 1, query: {} } as any,
      { pathname: '/app/inner', search: '', hash: '', index: 2, timestamp: 2, query: {} } as any,
    ];
    const prev = window.location.href;
    window.history.replaceState({}, '', '/#/?from=browser');
    router._refreshInitialRoute();
    expect(router.initialRoute?.query?.from).toBe('browser');
    window.history.replaceState({}, '', prev);
    router.stop();
  });

  it('updateRoute 应同步 basename stacks', () => {
    const router = createTestRouter(
      [{ path: '/app', component: Home }, { path: '/app/x', component: About }],
      { basename: '/app' },
    );
    router.history.stacks = [
      { pathname: '/app', search: '', hash: '', index: 0, timestamp: 10, query: {} } as any,
      { pathname: '/app/x', search: '', hash: '', index: 1, timestamp: 20, query: {} } as any,
    ];
    router.currentRoute = router.createRoute('/app');
    router.updateRoute(router.createRoute('/app/x'));
    expect(router.stacks.length).toBeGreaterThan(0);
    router.stop();
  });

  it('绝对路径不在 basename 下应跳过', async () => {
    const router = createTestRouter([{ path: '/app', component: Home }], { basename: '/app' });
    let ok: boolean | undefined;
    await new Promise<void>((resolve) => {
      router._handleRouteInterceptor(
        { pathname: '/other', path: '/other', search: '', absolute: true } as any,
        (res) => { ok = res as boolean; resolve(); },
      );
    });
    expect(ok).toBe(true);
    router.stop();
  });

  it('_getComponentGuards 应读取实例 __routeGuardInfoHooks', () => {
    const router = createTestRouter([{ path: '/', component: Home }]);
    syncNavigate(router, '/');
    const mr = router.currentRoute!.matched[0];
    const leave = jest.fn();
    const instance = { __routeGuardInfoHooks: true, beforeRouteLeave: leave };
    mr.componentInstances = { default: instance };
    const guards = router._getComponentGuards(mr, 'beforeRouteLeave');
    expect(guards.some((g: any) => g.instance === instance)).toBe(true);
    router.stop();
  });

  it('_getBeforeEachGuards 应包含 to 未调用的 beforeEnter', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const enter = jest.fn();
    const to = router.createRoute('/about');
    to.matched[0].guards.beforeEnter.push({
      guard: enter, called: false, lazy: false,
    } as any);
    const guards = router._getBeforeEachGuards(to, router.currentRoute);
    expect(guards).toContain(enter);
    router.stop();
  });

  it('_getBeforeResolveGuards 应包含 to 未调用的 beforeResolve', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const resolveGuard = jest.fn();
    const to = router.createRoute('/about');
    to.matched[0].guards.beforeResolve.push({
      guard: resolveGuard, called: false,
    } as any);
    const guards = router._getBeforeResolveGuards(to, router.currentRoute);
    expect(guards).toContain(resolveGuard);
    router.stop();
  });

  it('_routeInterceptors 多守卫链应依次执行', async () => {
    const router = createTestRouter();
    const guard2 = jest.fn((_t, _f, next) => next());
    const guard1 = jest.fn((_t, _f, next) => next());
    const to = router.createRoute('/about');
    await new Promise<void>((resolve) => {
      router._routeInterceptors([guard1, guard2], to, router.currentRoute, () => resolve());
    });
    expect(guard1).toHaveBeenCalled();
    expect(guard2).toHaveBeenCalled();
    router.stop();
  });

  it('_routeInterceptors 守卫抛错应进入 catch', async () => {
    const router = createTestRouter();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const guard2 = jest.fn(() => { throw new Error('guard error'); });
    const guard1 = jest.fn((_t, _f, next) => { next(); });
    const to = router.createRoute('/about');
    await new Promise<void>((resolve) => {
      router._routeInterceptors([guard1, guard2], to, router.currentRoute, (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve();
      });
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    router.stop();
  });

  it('parentRouterView getter 应读取 context', () => {
    const router = createTestRouter();
    const parent = new (RouterViewComponent as any)({ router });
    const child = new (RouterViewComponent as any)({ router });
    child.context = parent;
    expect((child as any).parentRouterView).toBe(parent);
    router.stop();
  });

  it('componentDidMount 应通过 parentRouterView 关联父级', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, children: [{ path: '/child', component: About }] },
    ]);
    const parent = new (RouterViewComponent as any)({ router });
    parent.state = {
      inited: true, router, depth: 0, parent: null, routes: router.routes, currentRoute: null,
    };
    const child = new (RouterViewComponent as any)({ router });
    child.context = parent;
    child.state = { inited: false, router: null, depth: 0, parent: null, routes: [] };
    child.setState = jest.fn((partial: any) => { Object.assign(child.state, partial); });
    await child.componentDidMount();
    expect(child.state.parent).toBe(parent);
    router.stop();
  });

  it('createMergeStrategies $routeIndex 应从 RouterView depth 读取', () => {
    const router = createTestRouter();
    const merge = config.createMergeStrategies(router);
    const computed: Record<string, Function> = {};
    const vm: any = {
      _isReactViewRoot: false,
      $computed: jest.fn((_t: any, key: string, fn: Function) => { computed[key] = fn; }),
    };
    jest.spyOn(router, 'getHostRouterView').mockReturnValue({ state: { depth: 3 } } as any);
    merge(null, null, vm);
    expect(computed.$routeIndex.call(vm)).toBe(3);
    router.stop();
  });

  it('popstate block 允许后应应用导航', () => {
    const win = createHeavyHistoryWindow({ pathname: '/' });
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    history.push('/b');
    history.block(({ callback }) => callback(true));
    win.history.go(-1);
    expect(history.location.pathname).not.toBe('/b');
    history.block(null as any);
  });

  it('popstate 无 idx 时应 rebuild index', () => {
    const win = createHeavyHistoryWindow({ pathname: '/' });
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    history.push('/a');
    win.__heavyHistory.stripStateIdx();
    win.__heavyHistory.setPath('/b');
    win.__heavyHistory.firePopState();
    expect(win.history.replaceState).toHaveBeenCalled();
  });

  it('hashchange 忽略相同位置并处理真实路径变化', () => {
    const win = createHeavyHistoryWindow({ pathname: '/', hashMode: true });
    const history = createHistory({
      window: win,
      type: HistoryType.hash,
      getLocationPath: () => ({ pathname: win.location.hash.slice(1), search: '', hash: '' }),
      createHref: (to) => `#${typeof to === 'string' ? to : to.pathname || '/'}`,
    });
    const listener = jest.fn();
    history.listen(listener);

    win.__heavyHistory.fireHashChange();
    expect(listener).not.toHaveBeenCalled();

    win.__heavyHistory.setPath('/', '', '#/next');
    win.__heavyHistory.fireHashChange();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(history.location.pathname).toBe('/next');
  });

  it('NaN 的 history index 在 popstate 时重建', () => {
    const win = createHeavyHistoryWindow({ pathname: '/', initialIdx: Number.NaN });
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    win.__heavyHistory.stripStateIdx();
    win.__heavyHistory.setPath('/next');
    win.__heavyHistory.firePopState();
    expect(win.history.replaceState).toHaveBeenCalled();
  });

  it('hashchange 在 popstate blocker 等待时不重复处理', () => {
    const win = createHeavyHistoryWindow({ pathname: '/', hashMode: true });
    const history = createHistory({
      window: win,
      type: HistoryType.hash,
      getLocationPath: () => ({ pathname: win.location.hash.slice(1), search: '', hash: '' }),
      createHref: (to) => `#${typeof to === 'string' ? to : to.pathname || '/'}`,
    });
    let approve: ((ok: boolean) => void) | undefined;
    const listener = jest.fn();
    history.listen(listener);
    history.block(({ callback }) => { approve = callback; });
    win.__heavyHistory.setState({ idx: 1 });
    win.__heavyHistory.setPath('/', '', '#/next');
    win.__heavyHistory.firePopState();
    win.__heavyHistory.fireHashChange();
    expect(listener).not.toHaveBeenCalled();
    approve?.(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('push 被拒绝时会回滚正在等待的 popstate', () => {
    const win = createHeavyHistoryWindow({ pathname: '/' });
    const history = createHistory({
      window: win,
      type: HistoryType.browser,
      getLocationPath: () => win.location,
      createHref: (to) => (typeof to === 'string' ? to : '/'),
    });
    const callbacks: Array<(ok: boolean) => void> = [];
    history.block(({ callback }) => { callbacks.push(callback); });
    jest.spyOn(win.history, 'go').mockImplementation(() => undefined);

    win.__heavyHistory.setState({ idx: 1 });
    win.__heavyHistory.setPath('/pop');
    win.__heavyHistory.firePopState();
    history.push('/next');
    callbacks[1](false);
    expect(win.history.go).toHaveBeenCalled();
  });
});
