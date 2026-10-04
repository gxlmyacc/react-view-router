import ReactViewRouter from '../../src/router';
import config from '../../src/config';
import { createTestRouter, Home, About } from '../helpers/test-utils';

describe('router 生命周期与适配边界', () => {
  afterEach(() => jest.restoreAllMocks());

  it('未进入的组件和已执行的守卫不会再次执行离开或更新', () => {
    const router = createTestRouter();
    const from = router.createRoute('/about');
    const to = router.createRoute('/');
    const mr = from.matched[0];
    mr.viewInstances.default = {} as any;
    const instance = {};
    const leave = jest.fn();
    mr.guards.beforeLeave.push({ guard: leave, instance, called: false });
    mr.guards.beforeEnter.push({ guard: jest.fn(), instance, called: false });
    expect(router._getBeforeEachGuards(to, from)).not.toContain(leave);
    mr.guards.beforeEnter[0].called = true;
    expect(router._getBeforeEachGuards(to, from)).toContain(leave);
    const update = jest.fn();
    const afterLeave = jest.fn();
    mr.guards.update.push({ guard: update, called: true });
    mr.guards.afterLeave.push({ guard: afterLeave, called: true });
    expect(router._getRouteUpdateGuards(from, from)).not.toContain(update);
    expect(router._getAfterEachGuards(to, from)).not.toContain(afterLeave);
    expect(router._getAfterEachGuards(to, null)).toEqual([]);
    expect(router._getBeforeEachGuards(null as any, null)).toEqual([]);
    expect(router._getBeforeResolveGuards(null as any, null)).toEqual([]);
    expect(router._getSameMatched(from)).toEqual([]);
    router.stop();
  });

  it('组件守卫支持空插槽、无守卫 mixin 和由插件接管的解析', () => {
    const router = createTestRouter();
    const mr = router.createRoute('/about').matched[0];
    const guard = jest.fn();
    mr.config.beforeEnter = guard;
    mr.config.components = { default: null } as any;
    expect(router._getComponentGuards(mr, 'beforeRouteEnter', () => null as any)).toEqual([]);
    const component = Object.assign(() => null, {
      __vuelike: true,
      mixins: [null, {}, { prototype: { beforeRouteLeave: guard } }],
    });
    router.vuelike = {};
    mr.config.components.default = component;
    expect(router._getComponentGuards(mr, 'beforeRouteLeave')).toEqual([guard]);
    router.plugin({
      onGetRouteComponentGuards: (ret, _r, _c, _key, _name, utils) => {
        expect(utils.toResolve(null, 'default')).toEqual([]);
        ret.push(guard);
        return true;
      }
    });
    expect(router._getComponentGuards(mr, 'beforeRouteLeave')).toEqual([guard]);
    router.stop();
  });

  it('更新通知忽略失效视图，多个有效视图只完成一次导航', () => {
    const router = createTestRouter();
    router.updateRoute(router.createRoute('/about'));
    const event = jest.fn();
    router.plugin({ onRouteChange: event });
    const refresh = jest.fn((_a, _b, complete) => { complete?.(); complete?.(); });
    const mr = router.currentRoute!.matched[0];
    mr.viewInstances = {
      missing: null,
      inactive: { _isMounted: false, state: {} },
      first: { _isMounted: true, _refreshCurrentRoute: refresh },
      last: { _isMounted: true, _refreshCurrentRoute: refresh },
    } as any;
    const report = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    router.updateRoute(router.createRoute('/'));
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(refresh.mock.calls[0][2]).toBeUndefined();
    expect(event).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledTimes(1);
    const current = router.currentRoute;
    router.updateRoute(null);
    router.isRunning = false;
    router.updateRoute(router.createRoute('/about'));
    expect(router.currentRoute).toBe(current);
    router.stop();
  });

  it('路由名称解析器可忽略未知值并回退到父路由', () => {
    const parent = createTestRouter([{ path: '/page', name: 'page', component: Home }]);
    const child = createTestRouter();
    child._updateParent(parent);
    child.resolveRouteName(() => undefined as any);
    expect(child.nameToPath('page', { absolute: true })).toBe('/page');
    expect(child.nameToPath('unknown', { absolute: true })).toBeUndefined();
    child.updateRouteMeta(null as any, {});
    expect(child.updateRouteMeta({} as any, {})).toBeUndefined();
    const route = { ...child.routes[0] };
    delete route.meta;
    const matched = child.createMatchedRoute(route, {} as any);
    expect(matched.path).toBe(route.path);
    expect(matched.meta).toEqual({});
    child.stop();
    parent.stop();
  });

  it('syncRouteRuntimeLocation 只在匹配视图改变时刷新', () => {
    const router = createTestRouter();
    const refresh = jest.fn();
    const next = router.createRoute('/about').matched[0];
    router.viewRoot = {
      _isMounted: true,
      state: { depth: 0, currentRoute: next },
      getMatchedRoute: () => next,
      _refreshCurrentRoute: refresh,
    } as any;
    router.syncRouteRuntimeLocation('/about');
    expect(refresh).not.toHaveBeenCalled();
    router.viewRoot!.state.currentRoute = router.createRoute('/').matched[0];
    router.syncRouteRuntimeLocation('/about');
    expect(refresh).toHaveBeenCalledTimes(1);
    router.stop();
  });

  it('初始化校验 KeepAlive 渲染能力并提示重复路由名', () => {
    expect(() => new ReactViewRouter({ manual: true, keepAlive: true })).toThrow();
    const warning = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const router = createTestRouter([
      { path: '/', name: 'same', component: Home },
      { path: '/about', name: 'same', component: About },
    ]);
    expect(router.nameToPath('same')).toBe('/about');
    expect(warning).toHaveBeenCalled();
    router.stop();
  });

  it('ReactView App 继承支持已有配置、缺失 App 及不同合并策略', () => {
    const oldInherit = config.inheritProps;
    const router = createTestRouter();
    const observable = Object.assign(jest.fn((value) => value), { shallow: {}, ref: {} });
    const vuelike: any = {
      observable,
      action: (_name: string, fn: Function) => fn,
      config: { optionMergeStrategies: { $route: jest.fn() } },
    };
    try {
      router.currentRoute = null;
      const App = { inherits: {} };
      router.install(vuelike, { App });
      expect((App.inherits as any).$route).toEqual({ query: {}, meta: {} });
      router.install(vuelike, { App: null });
      vuelike.config = {};
      router.install(vuelike, { App: {} });
      expect(observable).toHaveBeenCalledTimes(2);
    } finally {
      config.inheritProps = oldInherit;
      router.stop();
    }
  });
});
