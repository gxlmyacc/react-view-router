import ReactViewRouter from '../../src/router';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';
import { HistoryType } from '../../src/history/types';
import { withRouteGuards } from '../../src/route-guard';

describe('router.ts 内部方法覆盖', () => {
  /**
   * 模拟 RouterView 已就绪。
   * @param router 路由器实例
   */
  function mockViewRoot(router: ReturnType<typeof createTestRouter>) {
    router.viewRoot = {
      state: { inited: true },
      _isMounted: true,
      props: {},
      _refreshCurrentRoute: jest.fn(),
    } as any;
  }

  it('_routeInterceptors 应执行 beforeEach 守卫', async () => {
    const router = createTestRouter();
    const guard = jest.fn((_t, _f, next) => next());
    router.beforeEach(guard);
    const to = router.createRoute('/about');
    await new Promise<void>((resolve) => {
      router._routeInterceptors(
        router._getBeforeEachGuards(to, router.currentRoute),
        to,
        router.currentRoute,
        () => resolve(),
      );
    });
    expect(guard).toHaveBeenCalled();
    router.stop();
  });

  it('_routeInterceptors 重定向应更新目标路由', async () => {
    const router = createTestRouter();
    router.beforeEach((_t, _f, next) => next('/users/1'));
    const to = router.createRoute('/about');
    let redirected: string | undefined;
    await new Promise<void>((resolve) => {
      router._routeInterceptors(
        router._getBeforeEachGuards(to, router.currentRoute),
        to,
        router.currentRoute,
        (res) => {
          if (res && typeof res !== 'boolean' && res.path) redirected = res.path;
          resolve();
        },
      );
    });
    expect(redirected).toBe('/users/1');
    router.stop();
  });

  it('_getInterceptor 应解析 lazy 守卫', async () => {
    const router = createTestRouter();
    const lazyFn = Object.assign(
      async () => jest.fn((_t: any, _f: any, next: any) => next()),
      { lazy: true },
    );
    const resolved = await router._getInterceptor([lazyFn as any], 0);
    expect(typeof resolved).toBe('function');
    router.stop();
  });

  it('_transformLocation 子路由应拼接父级路径', () => {
    const parent = createTestRouter(
      [{ path: '/app', component: Home, children: [{ path: '/app/page', component: About }] }],
      { basename: '/app' },
    );
    parent._initRouter({ basename: '/app', mode: HistoryType.hash });
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.hash,
      basename: '/app/nested',
      routes: [{ path: '/', component: About }],
    });
    child._updateParent(parent);
    child.start();
    const loc = child._transformLocation({ pathname: '/short', search: '', hash: '' } as any);
    expect(loc).toBeDefined();
    parent.stop();
    child.stop();
  });

  it('go 数字应后退', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    syncNavigate(router, '/users/1');
    router.go(-1);
    router.updateRoute(router.history.location as any);
    expect(router.currentRoute?.path).toBe('/about');
    router.stop();
  });

  it('getMatchedViews 应收集视图实例', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const views = router.getMatchedViews(router.currentRoute!);
    expect(Array.isArray(views)).toBe(true);
    router.stop();
  });

  it('组件 beforeRouteEnter 应注册守卫', () => {
    const enter = jest.fn((_t, _f, next) => next());
    const Guarded = withRouteGuards(About, { beforeRouteEnter: enter });
    const router = createTestRouter([{ path: '/g', component: Guarded as any }]);
    syncNavigate(router, '/g');
    expect(router.currentRoute!.matched[0].guards.beforeEnter.length).toBeGreaterThan(0);
    router.stop();
  });

  it('holdInitialQueryProps 数组形式应合并', async () => {
    const router = createTestRouter(
      [{ path: '/', component: Home }, { path: '/about', component: About }],
      { holdInitialQueryProps: ['from'] },
    );
    router.history.push('/?from=init');
    router._refreshInitialRoute();
    mockViewRoot(router);
    await new Promise<void>((resolve) => router.push('/about', resolve));
    expect(router.currentRoute?.query.from).toBe('init');
    router.stop();
  });

  it('resolveRouteName 异步解析应返回 true', () => {
    const router = createTestRouter();
    router.resolveRouteName(() => true);
    expect(router.nameToPath('async')).toBe(true);
    router.stop();
  });

  it('addRoutes 应追加单条路由', () => {
    const router = createTestRouter([{ path: '/', component: Home }]);
    router.addRoutes([{ path: '/added', component: About }]);
    expect(router.routes.some((r) => r.path === '/added')).toBe(true);
    router.stop();
  });

  it('use 应更新 queryProps', () => {
    const router = createTestRouter();
    router.use({ queryProps: { arrayFormat: 'bracket' } });
    expect(router.queryProps.arrayFormat).toBe('bracket');
    router.stop();
  });

  it('重复路由 name 应输出警告', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    createTestRouter([
      { path: '/a', component: Home, name: 'dup' },
      { path: '/b', component: About, name: 'dup' },
    ]).stop();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('_getBeforeResolveGuards 应包含全局守卫', () => {
    const router = createTestRouter();
    const guard = jest.fn();
    router.beforeResolve(guard);
    const to = router.createRoute('/about');
    const guards = router._getBeforeResolveGuards(to, router.currentRoute);
    expect(guards).toContain(guard);
    router.stop();
  });

  it('_getAfterEachGuards 应包含全局守卫', () => {
    const router = createTestRouter();
    const guard = jest.fn();
    router.afterEach(guard);
    const to = router.createRoute('/about');
    const guards = router._getAfterEachGuards(to, router.currentRoute);
    expect(guards).toContain(guard);
    router.stop();
  });

  it('redirect 应同步更新路由', () => {
    const router = createTestRouter();
    router.redirect('/about');
    router.updateRoute(router.history.location as any);
    expect(router.currentRoute?.path).toBe('/about');
    router.stop();
  });

  it('_isMatchBasename 应判断 basename', () => {
    const router = createTestRouter([], { basename: '/app' });
    router._initRouter({ basename: '/app', mode: HistoryType.memory });
    expect(router._isMatchBasename({ pathname: '/app/home' } as any)).toBe(true);
    router.stop();
  });

  it('browser 模式应懒创建 history', () => {
    const router = createTestRouter([], { mode: HistoryType.browser });
    expect(router.isBrowserMode).toBe(true);
    expect(router.history).toBeDefined();
    router.stop();
  });

  it('_getChangeMatched 应返回差异 matched', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const to = router.createRoute('/about');
    const changed = router._getChangeMatched(to, router.currentRoute, { containLazy: true });
    expect(changed.length).toBeGreaterThan(0);
    router.stop();
  });

  it('_getBeforeEachGuards 应包含 viewRoot beforeEach', () => {
    const router = createTestRouter();
    const beforeEach = jest.fn();
    router.viewRoot = { props: { beforeEach } } as any;
    const guards = router._getBeforeEachGuards(router.createRoute('/about'), router.currentRoute);
    expect(guards).toContain(beforeEach);
    router.stop();
  });

  it('_getBeforeEachGuards 应收集 beforeLeave 守卫', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const leave = jest.fn((_t, _f, next) => next());
    const matched = router.currentRoute!.matched[0];
    matched.viewInstances = { default: {} as any };
    matched.guards.beforeLeave.push({ guard: leave, called: false, instance: {} } as any);
    const guards = router._getBeforeEachGuards(router.createRoute('/about'), router.currentRoute);
    expect(guards).toContain(leave);
    router.stop();
  });

  it('beforeRouteLeave getter 应懒加载守卫', () => {
    const leave = jest.fn((_t, _f, next) => next());
    const Guarded = withRouteGuards(Home, { beforeRouteLeave: leave });
    const router = createTestRouter([{ path: '/', component: Guarded as any }]);
    syncNavigate(router, '/');
    expect(router.currentRoute!.matched[0].guards.beforeLeave.length).toBeGreaterThan(0);
    router.stop();
  });

  it('updateWhenQueryChange 应触发 update 守卫链', () => {
    const router = createTestRouter(
      [{ path: '/users/:id', component: About }],
      { updateWhenQueryChange: true },
    );
    syncNavigate(router, '/users/1');
    syncNavigate(router, '/users/2');
    expect(router.currentRoute?.path).toBe('/users/2');
    router.stop();
  });

  it('stop 后 push 应拒绝', async () => {
    const router = createTestRouter();
    router.stop();
    await expect(router.push('/about')).rejects.toBeTruthy();
  });

  it('push 未知名称括号语法应失败', async () => {
    const router = createTestRouter();
    await expect(router.push('[unknownRouteName]')).rejects.toThrow();
    router.stop();
  });

  it('_handleRouteInterceptor 相同路径应快速回调', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    mockViewRoot(router);
    const from = router.currentRoute!;
    from.isComplete = true;
    let called = false;
    await new Promise<void>((resolve) => {
      router._handleRouteInterceptor(
        router.createRoute('/'),
        (ok) => {
          called = true;
          resolve();
        },
      );
    });
    expect(called).toBe(true);
    router.stop();
  });

  it('backIfVisited 应回退到已访问路径', () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);
    syncNavigate(router, '/about?tab=1');
    syncNavigate(router, '/');
    mockViewRoot(router);
    const goSpy = jest.spyOn(router, 'go');
    router.push({ path: '/about', query: { tab: '1' }, backIfVisited: true } as any);
    expect(goSpy).toHaveBeenCalled();
    const stack = goSpy.mock.calls[0][0] as { pathname: string; query: Record<string, string> };
    expect(stack.pathname).toBe('/about');
    expect(stack.query.tab).toBe('1');
    router.stop();
  });

  it('backIfVisited 应优先通过 Navigation API 精确穿过 iframe history', async () => {
    const previousNavigation = Object.getOwnPropertyDescriptor(globalThis, 'navigation');
    const traverseTo = jest.fn(() => ({
      committed: Promise.reject(new Error('navigation superseded')),
      finished: Promise.reject(new Error('navigation superseded')),
    }));
    Object.defineProperty(globalThis, 'navigation', {
      configurable: true,
      value: {
        entries: () => [{ key: 'about-entry' }, { key: 'current-entry' }],
        traverseTo,
      },
    });

    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);
    try {
      // Use memory history as the transport double while exercising the
      // browser-mode backIfVisited selection branch.
      router.mode = HistoryType.browser;
      syncNavigate(router, '/about?tab=1');
      syncNavigate(router, '/');
      mockViewRoot(router);
      const stack = router.stacks.find(item => item.pathname === '/about')!;
      stack.navigationKey = 'about-entry';
      const goSpy = jest.spyOn(router, 'go');

      router.push({ path: '/about', query: { tab: '1' }, backIfVisited: true } as any);

      expect(traverseTo).toHaveBeenCalledWith('about-entry');
      expect(goSpy).not.toHaveBeenCalled();
      await Promise.resolve();
    } finally {
      router.stop();
      if (previousNavigation) {
        Object.defineProperty(globalThis, 'navigation', previousNavigation);
      } else {
        delete (globalThis as any).navigation;
      }
    }
  });

  it('backIfVisited 在 Navigation API key 失效时应降级到原 go(stack)', () => {
    const previousNavigation = Object.getOwnPropertyDescriptor(globalThis, 'navigation');
    Object.defineProperty(globalThis, 'navigation', {
      configurable: true,
      value: {
        entries: () => [{ key: 'current-entry' }],
        traverseTo: jest.fn(),
      },
    });

    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);
    try {
      router.mode = HistoryType.browser;
      syncNavigate(router, '/about');
      syncNavigate(router, '/');
      mockViewRoot(router);
      const stack = router.stacks.find(item => item.pathname === '/about')!;
      stack.navigationKey = 'disposed-entry';
      const goSpy = jest.spyOn(router, 'go');

      router.push({ path: '/about', backIfVisited: true } as any);

      expect(goSpy).toHaveBeenCalledWith(stack);
    } finally {
      router.stop();
      if (previousNavigation) {
        Object.defineProperty(globalThis, 'navigation', previousNavigation);
      } else {
        delete (globalThis as any).navigation;
      }
    }
  });

  it('backIfVisited 共享旧版无 navigationKey history 时应降级到原 go(stack)', () => {
    const previousNavigation = Object.getOwnPropertyDescriptor(globalThis, 'navigation');
    const traverseTo = jest.fn();
    Object.defineProperty(globalThis, 'navigation', {
      configurable: true,
      value: {
        entries: () => [{ key: 'about-entry' }, { key: 'current-entry' }],
        traverseTo,
      },
    });

    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);
    try {
      router.mode = HistoryType.browser;
      syncNavigate(router, '/about');
      syncNavigate(router, '/');
      mockViewRoot(router);
      // Simulate a HistoryFix instance created and shared by an older
      // ReactViewRouter version, whose stacks never contained navigationKey.
      router.stacks.forEach(stack => delete stack.navigationKey);
      const target = router.stacks.find(item => item.pathname === '/about')!;
      const goSpy = jest.spyOn(router, 'go');

      router.push({ path: '/about', backIfVisited: true } as any);

      expect(traverseTo).not.toHaveBeenCalled();
      expect(goSpy).toHaveBeenCalledWith(target);
    } finally {
      router.stop();
      if (previousNavigation) {
        Object.defineProperty(globalThis, 'navigation', previousNavigation);
      } else {
        delete (globalThis as any).navigation;
      }
    }
  });

  it('backIfVisited 在 memory 模式下即使出现 navigationKey 也不得使用 Navigation API', () => {
    const previousNavigation = Object.getOwnPropertyDescriptor(globalThis, 'navigation');
    const traverseTo = jest.fn();
    Object.defineProperty(globalThis, 'navigation', {
      configurable: true,
      value: {
        entries: () => [{ key: 'about-entry' }],
        traverseTo,
      },
    });

    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);
    try {
      syncNavigate(router, '/about');
      syncNavigate(router, '/');
      mockViewRoot(router);
      const target = router.stacks.find(item => item.pathname === '/about')!;
      target.navigationKey = 'about-entry';
      const goSpy = jest.spyOn(router, 'go');

      router.push({ path: '/about', backIfVisited: true } as any);

      expect(traverseTo).not.toHaveBeenCalled();
      expect(goSpy).toHaveBeenCalledWith(target);
      expect(router.history.type).toBe(HistoryType.memory);
    } finally {
      router.stop();
      if (previousNavigation) {
        Object.defineProperty(globalThis, 'navigation', previousNavigation);
      } else {
        delete (globalThis as any).navigation;
      }
    }
  });

  it('backIfVisited 在 Navigation API 查询抛错时应降级到原 go(stack)', () => {
    const previousNavigation = Object.getOwnPropertyDescriptor(globalThis, 'navigation');
    Object.defineProperty(globalThis, 'navigation', {
      configurable: true,
      value: {
        entries: () => { throw new Error('entries unavailable'); },
        traverseTo: jest.fn(),
      },
    });

    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/about', component: About },
    ]);
    try {
      router.mode = HistoryType.browser;
      syncNavigate(router, '/about');
      syncNavigate(router, '/');
      mockViewRoot(router);
      const stack = router.stacks.find(item => item.pathname === '/about')!;
      stack.navigationKey = 'about-entry';
      const goSpy = jest.spyOn(router, 'go');

      router.push({ path: '/about', backIfVisited: true } as any);

      expect(goSpy).toHaveBeenCalledWith(stack);
    } finally {
      router.stop();
      if (previousNavigation) {
        Object.defineProperty(globalThis, 'navigation', previousNavigation);
      } else {
        delete (globalThis as any).navigation;
      }
    }
  });

  it('_getAfterEachGuards 应收集 afterLeave 守卫', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const afterLeave = jest.fn();
    const matched = router.currentRoute!.matched[0];
    matched.viewInstances = { default: {} as any };
    matched.guards.afterLeave.push({ guard: afterLeave, called: false, instance: {} } as any);
    const to = router.createRoute('/about');
    const guards = router._getAfterEachGuards(to, router.currentRoute);
    expect(guards).toContain(afterLeave);
    router.stop();
  });

  it('matched abort 应中断导航', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/blocked', component: About },
    ]);
    syncNavigate(router, '/');
    mockViewRoot(router);
    const to = router.createRoute('/blocked');
    (to.matched[to.matched.length - 1] as any).abort = 'navigation blocked';
    let aborted = false;
    await new Promise<void>((resolve) => {
      router._internalHandleRouteInterceptor(to, (ok) => {
        aborted = ok instanceof Error || ok === false;
        resolve();
      });
    });
    expect(aborted).toBe(true);
    expect(router.currentRoute?.path).toBe('/');
    router.stop();
  });

  it('global beforeEach 应触发 global 回调', async () => {
    const router = createTestRouter();
    const followUp = jest.fn();
    const guard = jest.fn((_t, _f, next) => next(followUp));
    (guard as any).global = true;
    router.beforeEach(guard);
    const to = router.createRoute('/about');
    await new Promise<void>((resolve) => {
      router._routeInterceptors([guard], to, router.currentRoute, () => resolve());
    });
    expect(guard).toHaveBeenCalled();
    router.stop();
  });

  it('_handleRouteInterceptor 未挂载 viewRoot 应快速返回', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    let result: boolean | undefined;
    await new Promise<any>((resolve) => {
      router._handleRouteInterceptor(router.createRoute('/'), (ok) => {
        result = ok as boolean;
        resolve();
      });
    });
    expect(result).toBe(true);
    router.stop();
  });

  it('_getAfterEachGuards 应包含 viewRoot afterEach', () => {
    const router = createTestRouter();
    const afterEach = jest.fn();
    router.viewRoot = { props: { afterEach } } as any;
    const guards = router._getAfterEachGuards(router.createRoute('/about'), router.currentRoute);
    expect(guards).toContain(afterEach);
    router.stop();
  });

  it('beforeRouteLeave wrapper 应触发 onRouteLeaveNext', () => {
    const onRouteLeaveNext = jest.fn();
    const leave = jest.fn(function (_t, _f, next) {
      next((vm: unknown) => vm);
    });
    const Guarded = withRouteGuards(Home, { beforeRouteLeave: leave });
    const router = createTestRouter([{ path: '/', component: Guarded as any }]);
    router.plugin({ name: 'leave-next', onRouteLeaveNext });
    syncNavigate(router, '/');
    const matched = router.currentRoute!.matched[0];
    matched.componentInstances.default = {} as any;
    const wrapper = matched.guards.beforeLeave[0].guard;
    wrapper(router.createRoute('/about'), router.currentRoute, (cb) => {
      if (typeof cb === 'function') cb(matched.componentInstances.default);
    });
    expect(leave).toHaveBeenCalled();
    expect(onRouteLeaveNext).toHaveBeenCalled();
    router.stop();
  });

  it('_transformLocation 短路径应委托父级匹配', () => {
    const parent = createTestRouter(
      [{ path: '/app', component: Home, children: [{ path: '/app/child', component: About }] }],
      { basename: '/app' },
    );
    parent._initRouter({ basename: '/app', mode: HistoryType.memory });
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      basename: '/app/nested',
      routes: [{ path: '/local', component: About }],
    });
    child._updateParent(parent);
    child.start();
    const loc = child._transformLocation({ pathname: '/c', search: '', hash: '' } as any);
    expect(loc).toBeDefined();
    parent.stop();
    child.stop();
  });
});
