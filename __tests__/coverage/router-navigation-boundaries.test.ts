import config from '../../src/config';
import { createTestRouter, Home, About } from '../helpers/test-utils';

function prepare(router: ReturnType<typeof createTestRouter>) {
  router.viewRoot = {
    state: { inited: true },
    _isMounted: true,
    props: {},
    _refreshCurrentRoute: jest.fn(),
  } as any;
}

describe('导航决策的边界', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([false, true, new Error('blocked')])('abort %s 正确决定是否提交并报告错误', async (abort) => {
    const router = createTestRouter();
    prepare(router);
    const to = router.createRoute('/about');
    to.matched[0].abort = abort;
    const error = jest.fn();
    router.onError(error);
    const decision = await new Promise<any>((resolve) => {
      router._internalHandleRouteInterceptor(to, (ok) => resolve(ok));
    });
    expect(typeof decision === 'function').toBe(abort === false);
    if (abort instanceof Error) expect(error).toHaveBeenCalledWith(abort);
    else expect(error).not.toHaveBeenCalled();
    router.stop();
  });

  it.each(['resolve failed', new Error('resolve failed')])('beforeResolve 拒绝 %s 保持原路由', async (error) => {
    const router = createTestRouter();
    prepare(router);
    const from = router.currentRoute;
    router.beforeResolve(() => { throw error; });
    const onError = jest.fn();
    router.onError(onError);
    await new Promise<void>((resolve) => {
      router._internalHandleRouteInterceptor(router.createRoute('/about'), (ok) => {
        expect(ok).toBe(false);
        resolve();
      });
    });
    expect(router.currentRoute).toBe(from);
    expect(onError.mock.calls[0][0].message).toBe('resolve failed');
    router.stop();
  });

  it('onRouteing 插件可取消导航或改写目标，并收到完成通知', async () => {
    const router = createTestRouter();
    prepare(router);
    const done = jest.fn();
    const off = router.plugin({ onRouteing: (next) => next(false) });
    router.plugin({ onRouteing: (next) => next(done) });
    const callback = jest.fn();
    await router._handleRouteInterceptor(router._normalizeLocation('/about')!, callback);
    expect(callback).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith(true, undefined, expect.any(Object));
    off!();
    done.mockClear();
    router.plugin({ onRouteing: (next) => next(router._normalizeLocation('/users/42') as any) });
    await router._handleRouteInterceptor(router._normalizeLocation('/about')!, callback);
    expect(callback.mock.calls[0][1].path).toBe('/users/42');
    expect(done).toHaveBeenCalledWith(false, undefined, expect.any(Object));
    router.stop();
  });

  it('缺失目标和离开未激活 basename 时跳过拦截', async () => {
    const router = createTestRouter();
    const callback = jest.fn();
    expect(router._transformLocation(null as any)).toBeNull();
    await router._handleRouteInterceptor(null, callback);
    expect(callback).toHaveBeenCalledWith(true);
    router.stop();
    const scoped = createTestRouter([], { basename: '/app' });
    scoped.currentRoute = null;
    callback.mockClear();
    await scoped._handleRouteInterceptor({ pathname: '/outside' } as any, callback);
    expect(callback).toHaveBeenCalledWith(true);
    scoped.stop();
  });

  it('initial query 数组忽略未定义项，函数形式可返回空结果', async () => {
    const router = createTestRouter(undefined, { holdInitialQueryProps: ['absent'] });
    prepare(router);
    await router.push('/about');
    expect(router.currentRoute!.query).toEqual({});
    router.options.holdInitialQueryProps = () => undefined as any;
    await router.push('/users/1');
    expect(router.currentRoute!.query).toEqual({});
    router.stop();
  });

  it('空 redirect 配置继续提交，内部 redirect 无返回值也能完成原事务', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/about', component: About, exact: true, redirect: () => '' },
    ]);
    prepare(router);
    await router.push('/about');
    expect(router.currentRoute!.path).toBe('/about');
    router.beforeEach((_to, _from, next) => next('/'));
    const redirect = jest.spyOn(router, 'redirect').mockReturnValue(undefined);
    const callback = jest.fn();
    await router._internalHandleRouteInterceptor(router.createRoute('/users/1'), callback);
    expect(redirect).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(false, expect.any(Object));
    router.stop();
  });

  it('ReactView 路由通知同步实例和继承中的 router', () => {
    const router = createTestRouter();
    const previous = config.inheritProps;
    const inherit = jest.fn();
    const vuelike: any = {
      observable: Object.assign((value: any) => value, { ref: {}, shallow: {} }),
      action: (_name: string, fn: Function) => fn,
      inherit,
      inherits: {},
      config: { optionMergeStrategies: {} },
    };
    try {
      router.install(vuelike, { App: null });
      const app = { $route: null };
      router.apps.push(app);
      const route = router.createRoute('/about');
      router._callEvent('onRouteChange', route, null, router);
      expect(app.$route).toBe(route);
      expect(inherit).toHaveBeenCalledWith('$router', router);
      vuelike.inherits.$router = router;
      inherit.mockClear();
      router._callEvent('onRouteChange', route, null, router);
      expect(inherit).toHaveBeenCalledTimes(1);
    } finally {
      config.inheritProps = previous;
      router.stop();
    }
  });
});
