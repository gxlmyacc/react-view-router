import ReactViewRouter from '../../src/router';
import { normalizeRoutes } from '../../src/util';
import { createTestRouter, syncNavigate, Home, About } from '../helpers/test-utils';

describe('router 公共接口边界', () => {
  afterEach(() => jest.restoreAllMocks());

  it('守卫忽略无效值、重复注册替换原位置并可重复卸载', () => {
    const router = createTestRouter();
    const guard = jest.fn();
    for (const method of ['beforeEach', 'beforeResolve', 'afterUpdate', 'afterEach'] as const) {
      expect(router[method](null as any)).toBeUndefined();
      expect(router[method]({} as any)).toBeUndefined();
      router[method](guard);
      const remove = router[method](guard);
      const key = `${method}Guards` as keyof ReactViewRouter;
      expect((router[key] as unknown as Function[]).filter((item) => item === guard)).toHaveLength(1);
      if (remove) { remove(); remove(); }
    }
    const onError = jest.fn();
    const remove = router.onError(onError);
    router.onError(onError);
    expect(router.errorCallbacks.filter((item) => item === onError)).toHaveLength(1);
    remove();
    remove();
    router.stop();
  });

  it('addRoutes 接受单对象、替换重复路径，并为父配置补齐 children', () => {
    const router = createTestRouter();
    expect(router.addRoutes(null as any)).toBeUndefined();
    const root = { setState: jest.fn() };
    router.viewRoot = root as any;
    router.addRoutes({ path: '/added', component: Home } as any);
    router.addRoutes([{ path: '/added', component: About }]);
    expect(router.routes.filter((route) => route.path === '/added')).toHaveLength(1);
    expect(root.setState).toHaveBeenCalledTimes(2);
    router.viewRoot = null;
    const parent = normalizeRoutes([{ path: '/parent' }])[0];
    delete (parent as any).children;
    router.addRoutes([{ path: 'child', component: Home }], parent);
    expect((parent.children as any[])[0].path).toBe('/parent/child');
    router.stop();
  });

  it('replaceQuery 忽略不变值并删除 undefined 字段', () => {
    const router = createTestRouter();
    syncNavigate(router, '/about?keep=1&remove=2');
    const replace = jest.spyOn(router.history, 'replace').mockImplementation(() => undefined);
    router.replaceQuery(null as any);
    router.replaceQuery('keep', '1');
    expect(replace).not.toHaveBeenCalled();
    router.replaceQuery({ remove: undefined, keep: '3' });
    expect(router.currentRoute!.query).toEqual({ keep: '3' });
    expect(replace).toHaveBeenCalledTimes(1);
    router.currentRoute = null;
    router.replaceQuery('keep', '4');
    expect(replace).toHaveBeenCalledTimes(1);
    router.stop();
  });

  it('空 route 和 redirect 回调可复用，fromEvent/onInit 强制 replace', () => {
    const router = createTestRouter();
    const empty = router.createRoute(null);
    expect(empty.matched).toEqual([]);
    expect(empty.path).toBe('');
    expect(router.getMatchedPath('/missing')).toBe('/missing');
    const from = router.createRoute('/about');
    from.onAbort = jest.fn();
    from.onComplete = jest.fn();
    const onInit = jest.fn();
    const redirected = router.createRoute({ path: '/', isRedirect: true, onInit } as any, { from });
    expect(redirected.onAbort).toBe(from.onAbort);
    expect(redirected.onComplete).toBe(from.onComplete);
    expect((redirected as any).onInit).toBe(onInit);
    const push = jest.spyOn(router, '_push').mockImplementation(() => undefined as any);
    const replace = jest.spyOn(router, '_replace').mockImplementation(() => undefined as any);
    expect(router.redirect(null)).toBeUndefined();
    router.redirect({ path: '/about', isReplace: false });
    expect(push).toHaveBeenCalledTimes(1);
    router.redirect({ path: '/', isReplace: false }, undefined, undefined, null, { ...from, fromEvent: true });
    router.redirect({ path: '/', isReplace: false }, undefined, undefined, onInit);
    expect(replace).toHaveBeenCalledTimes(2);
    router.stop();
  });

  it('replaceState 无能力时跳过，currentRoute 缺失时使用 initialRoute', () => {
    const router = createTestRouter();
    router.isRunning = false;
    expect(router.replaceState({ skipped: true })).toBeUndefined();
    router.isRunning = true;
    const replace = router.history.replaceState;
    (router.history as any).replaceState = null;
    expect(router.replaceState({ skipped: true })).toBeUndefined();
    router.history.replaceState = replace;
    const state = { initial: true };
    router.currentRoute = null;
    expect(router.replaceState(state)).toBe(state);
    expect(router.replaceState({}, undefined, { mergeState: true })).toBeUndefined();
    router.initialRoute = router.createRoute(null);
    expect(router.replaceState(state)).toBeUndefined();
    router.stop();
  });

  it('匿名插件错误原样传播，ReactView 标记兼容类和实例', () => {
    const router = createTestRouter();
    const error = new Error('anonymous plugin');
    router.plugin({ onRoutesChange: () => { throw error; } });
    expect(() => router._callEvent('onRoutesChange', [], [])).toThrow(error);
    expect(error.message).toBe('anonymous plugin');
    router.vuelike = {};
    expect(router._isReactViewComponent({ __vuelike: true })).toBe(true);
    expect(router._isReactViewComponent({ __vuelikeComponentClass: true })).toBe(true);
    expect(router._isReactViewComponent({ isVuelikeComponentInstance: true })).toBe(true);
    expect(router._isReactViewComponent(Object.assign(Object.create(null), { __vuelike: true }))).toBe(true);
    router.stop();
  });
});
