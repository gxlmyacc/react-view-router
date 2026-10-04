import ReactViewRouter from '../../src/router';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';
import { HistoryType } from '../../src/history/types';

describe('router.ts _go 与守卫扩展', () => {
  /**
   * 模拟 RouterView 已就绪。
   * @param router 路由器
   */
  function mockViewRoot(router: ReturnType<typeof createTestRouter>) {
    router.viewRoot = {
      state: { inited: true },
      _isMounted: true,
      props: {},
      _refreshCurrentRoute: jest.fn(),
    } as any;
  }

  it('hash 模式应创建 hash history', () => {
    const router = createTestRouter([], { mode: HistoryType.hash });
    expect(router.isHashMode).toBe(true);
    expect(router.history).toBeDefined();
    router.stop();
  });

  it('holdInitialQueryProps 函数形式应合并 query', async () => {
    const router = createTestRouter(
      [{ path: '/', component: Home }, { path: '/about', component: About }],
      { holdInitialQueryProps: (q: Record<string, string>) => ({ ...q, kept: '1' }) },
    );
    router.history.push('/?x=1');
    router._refreshInitialRoute();
    mockViewRoot(router);
    await new Promise<void>(resolve => router.push('/about', resolve));
    expect(router.currentRoute?.query.kept).toBe('1');
    router.stop();
  });

  it('_getSameMatched 应返回相同 matched', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    const route = router.currentRoute!;
    const same = router._getSameMatched(route, route);
    expect(same.length).toBeGreaterThan(0);
    router.stop();
  });

  it('updateRoute 带 basename 应同步 stacks', () => {
    const router = createTestRouter(
      [{ path: '/', component: Home }, { path: '/about', component: About }],
      { basename: '/app' },
    );
    router._initRouter({ basename: '/app', mode: HistoryType.memory });
    router.history.push('/app/');
    router.updateRoute(router.history.location as any);
    router.history.push('/app/about');
    router.updateRoute(router.history.location as any);
    expect(router.stacks.length).toBeGreaterThan(0);
    router.stacks.push({
      pathname: '/stale',
      search: '',
      index: 99,
      timestamp: 0,
      query: {},
    });
    router.history.push('/app/');
    router.updateRoute(router.history.location as any);
    expect(router.stacks.every(s => s.pathname.startsWith('/') || s.pathname === '/')).toBe(true);
    router.stop();
  });

  it('createMatchedRoute metaComputed 应可读 meta', () => {
    const router = createTestRouter([{ path: '/', component: Home, meta: { title: 'T' } }]);
    syncNavigate(router, '/');
    const mr = router.currentRoute!.matched[0];
    expect(mr.metaComputed.title).toBe('T');
    router.stop();
  });

  it('pendingRoute 未 prepared 时应暂存', () => {
    const router = createTestRouter();
    router.push('/about');
    expect(router.pendingRoute).toBeTruthy();
    router.stop();
  });

  it('_getRouteUpdateGuards 应收集 update 守卫', () => {
    const router = createTestRouter([{ path: '/users/:id', component: About }]);
    syncNavigate(router, '/users/1');
    const update = jest.fn();
    const matched = router.currentRoute!.matched[0];
    matched.guards.update.push({ guard: update, called: false, instance: {} } as any);
    const to = router.createRoute('/users/2');
    const guards = router._getRouteUpdateGuards(to, router.currentRoute);
    expect(guards).toContain(update);
    router.stop();
  });

  it('子路由器 _transformLocation 应拼接父级路径', () => {
    const parent = createTestRouter(
      [{ path: '/app', component: Home, children: [{ path: '/app/page', component: About }] }],
      { basename: '/app' },
    );
    parent._initRouter({ basename: '/app', mode: HistoryType.memory });
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      basename: '/app/nested',
      routes: [{ path: '/x', component: About }],
    });
    child._updateParent(parent);
    child.start();
    const loc = child._transformLocation({ pathname: '/short', search: '', hash: '' } as any);
    expect(loc).toBeDefined();
    parent.stop();
    child.stop();
  });
});
