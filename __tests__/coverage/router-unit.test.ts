import ReactViewRouter from '../../src/router';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';
import { withRouteGuards } from '../../src/route-guard';
import renderUtils from '../../dom/src/index';

describe('ReactViewRouter 方法深度覆盖', () => {
  it('stop 应清理运行状态', () => {
    const router = createTestRouter();
    router.stop();
    expect(router.isRunning).toBe(false);
  });

  it('createRoute 应解析路径', () => {
    const router = createTestRouter();
    const resolved = router.createRoute('/about');
    expect(resolved.path).toBe('/about');
    router.stop();
  });

  it('getMatched 应返回匹配路由', () => {
    const router = createTestRouter();
    const m = router.getMatched('/users/99');
    expect(m[0]?.params?.id).toBe('99');
    router.stop();
  });

  it('nameToPath 应按 name 解析', () => {
    const router = createTestRouter([
      { path: '/n', component: Home, name: 'home-page' },
    ]);
    expect(router.nameToPath('home-page')).toBe('/n');
    router.stop();
  });

  it('addRoutes 应追加路由', () => {
    const router = createTestRouter([{ path: '/', component: Home }]);
    router.addRoutes([{ path: '/new', component: About }]);
    expect(router.routes.some(r => r.path === '/new')).toBe(true);
    router.stop();
  });

  it('onError 应注册错误处理器', () => {
    const router = createTestRouter();
    const handler = jest.fn();
    router.onError(handler);
    router.errorCallbacks.forEach(cb => cb(new Error('test')));
    expect(handler).toHaveBeenCalled();
    router.stop();
  });

  it('beforeResolve 取消注册应移除守卫', () => {
    const router = createTestRouter();
    const guard = jest.fn();
    const unwatch = router.beforeResolve(guard);
    expect(router.beforeResolveGuards).toContain(guard);
    unwatch();
    expect(router.beforeResolveGuards).not.toContain(guard);
    router.stop();
  });

  it('_getBeforeEachGuards 应包含 viewRoot beforeEach', () => {
    const router = createTestRouter();
    const guard = jest.fn();
    router.viewRoot = { props: { beforeEach: guard } } as any;
    const guards = router._getBeforeEachGuards(router.currentRoute!, null);
    expect(guards).toContain(guard);
    router.stop();
  });

  it('replace 应替换当前路由', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    router.replace('/users/1');
    expect(router.currentRoute?.path).toBe('/users/1');
    router.stop();
  });

  it('back 应后退', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about');
    router.back();
    router.updateRoute(router.history.location as any);
    expect(router.currentRoute?.path).toBe('/');
    router.stop();
  });

  it('forward 在无历史时应安全', () => {
    const router = createTestRouter();
    router.forward();
    expect(router.currentRoute).toBeDefined();
    router.stop();
  });

  it('带守卫组件路由应注册守卫', () => {
    const Guarded = withRouteGuards(Home, {
      beforeRouteEnter: (_t, _f, next) => next(),
    });
    const router = createTestRouter([{ path: '/g', component: Guarded as any }]);
    syncNavigate(router, '/g');
    const matched = router.currentRoute!.matched[0];
    expect(matched.guards.beforeEnter.length).toBeGreaterThan(0);
    router.stop();
  });

  it('plugin onRouteChange 应在导航时触发', () => {
    const router = createTestRouter();
    const onRouteChange = jest.fn();
    router.plugin({ name: 'rc', onRouteChange });
    syncNavigate(router, '/about');
    expect(onRouteChange).toHaveBeenCalled();
    router.stop();
  });

  it('keepAlive 配置应要求 renderUtils', () => {
    expect(() =>
      new ReactViewRouter({
        manual: true,
        keepAlive: true,
        routes: [{ path: '/', component: Home }],
      }),
    ).toThrow();
  });

  it('keepAlive 合法配置应正常启动', () => {
    const router = new ReactViewRouter({
      manual: true,
      keepAlive: true,
      routes: [{ path: '/', component: Home }],
      renderUtils,
    });
    router.start();
    expect(router.options.keepAlive).toBe(true);
    router.stop();
  });

  it('getMatchedPath 应拼接路径', () => {
    const router = createTestRouter();
    expect(router.getMatchedPath('/sub')).toContain('/sub');
    router.stop();
  });

  it('parseQuery / stringifyQuery 应代理 config', () => {
    const router = createTestRouter();
    expect(router.parseQuery('?a=1').a).toBe('1');
    expect(router.stringifyQuery({ b: 2 })).toContain('b=2');
    router.stop();
  });

  it('getMatched 应复用相同 matched 的 state', () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    const from = router.currentRoute!;
    from.matched[0].state = { count: 1 };
    syncNavigate(router, '/about');
    syncNavigate(router, '/');
    expect(router.currentRoute?.matched[0].state).toBeDefined();
    router.stop();
  });
});
