import ReactViewRouter from '../src/router';
import { HistoryType } from '../src/history/types';
import config from '../src/config';

const Page = () => null;

describe('ReactViewRouter 导航与配置', () => {
  /**
   * 创建并启动测试路由器。
   * @param options 额外配置
   * @returns 路由器实例
   */
  function setup(options: Record<string, any> = {}) {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [
        { path: '/', component: Page, exact: true },
        { path: '/list', component: Page, name: 'list' },
        { path: '/detail/:id', component: Page, meta: { keepAlive: true } },
        { path: '/settings', component: Page, redirect: '/list' },
      ],
      ...options,
    });
    router.start();
    return router;
  }

  /**
   * 同步更新路由状态。
   * @param router 路由器
   * @param path 路径
   */
  function go(router: ReactViewRouter, path: string) {
    router.history.push(path);
    router.updateRoute(router.history.location as any);
  }

  afterEach(() => jest.restoreAllMocks());

  it('初始路由应匹配根路径', () => {
    const router = setup();
    expect(router.initialRoute.path).toBe('/');
    router.stop();
  });

  it('use 应设置 inheritProps 和 queryProps', () => {
    const router = setup();
    const parseFn = jest.fn((v: string) => v);
    router.use({ inheritProps: true, queryProps: { q: parseFn } });
    expect(config.inheritProps).toBe(true);
    expect(router.queryProps.q).toBe(parseFn);
    router.stop();
  });

  it('use 应设置 rememberInitialRoute', () => {
    const router = setup();
    router.use({ rememberInitialRoute: true });
    expect(router.rememberInitialRoute).toBe(true);
    router.stop();
  });

  it('getMatched 应包含 unmatchedPath', () => {
    const router = setup();
    const matched = router.getMatched('/detail/5/extra');
    expect(matched.unmatchedPath).toBeDefined();
    router.stop();
  });

  it('createMatchedRoute 应通过 getMatched 间接创建', () => {
    const router = setup();
    const matched = router.getMatched('/detail/7');
    expect(matched[0].params.id).toBe('7');
    expect(matched[0].config).toBeDefined();
    router.stop();
  });

  it('cloneMatchedRoute 应创建新快照并复用已挂载运行时绑定', () => {
    const router = setup();
    go(router, '/detail/7');
    const source = router.currentRoute!.matched[0];
    const componentInstances = source.componentInstances;
    const viewInstances = source.viewInstances;
    const guards = source.guards;

    const cloned = router.cloneMatchedRoute(source, {
      path: source.path,
      url: '/detail/8',
      regx: source.regx,
      params: { id: '8' },
    });

    expect(cloned).not.toBe(source);
    expect(cloned.params.id).toBe('8');
    expect(source.params.id).toBe('7');
    expect(cloned.componentInstances).toBe(componentInstances);
    expect(cloned.viewInstances).toBe(viewInstances);
    expect(cloned.guards).toBe(guards);
    const sameMatchClone = router.cloneMatchedRoute(source);
    expect(sameMatchClone.params).toEqual({ id: '7' });
    expect(sameMatchClone.params).not.toBe(source.params);
    router.stop();
  });

  it('replaceQuery 应支持对象参数', () => {
    const router = setup();
    go(router, '/list');
    router.replaceQuery({ a: '1', b: '2' });
    expect(router.currentRoute?.query).toMatchObject({ a: '1', b: '2' });
    router.stop();
  });

  it('replaceQuery 相同值不应触发变更', () => {
    const router = setup();
    go(router, '/list?x=1');
    const before = router.currentRoute?.fullPath;
    router.replaceQuery('x', '1');
    expect(router.currentRoute?.fullPath).toBe(before);
    router.stop();
  });

  it('nameToPath absolute 应拼接 basename', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.hash,
      basename: '/app',
      routes: [{ path: '/home', component: Page, name: 'home' }],
    });
    router._initRouter({ basename: '/app', mode: HistoryType.hash });
    router.routeNameMap.home = '/home';
    expect(router.nameToPath('home', { absolute: true })).toContain('/home');
    router.stop();
  });

  it('stop ignoreClearRoute 应保留路由', () => {
    const router = setup();
    go(router, '/list');
    router.stop({ ignoreClearRoute: true });
    expect(router.currentRoute).not.toBeNull();
  });

  it('history.block 应可通过路由器 history 注册', () => {
    const router = setup();
    const unblock = router.history.block(() => {});
    expect(typeof unblock).toBe('function');
    unblock();
    router.stop();
  });

  it('plugin onStart 应在 start 时触发', () => {
    const onStart = jest.fn();
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [{ path: '/', component: Page }],
    });
    router.plugin({ name: 'start-test', onStart });
    router.start();
    expect(onStart).toHaveBeenCalled();
    router.stop();
  });

  it('plugin onStop 应在 stop 时触发', () => {
    const router = setup();
    const onStop = jest.fn();
    router.plugin({ name: 'stop-test', onStop });
    router.stop();
    expect(onStop).toHaveBeenCalled();
  });

  it('plugin onRoutesChange 应在路由变更时触发', () => {
    const router = setup();
    const onRoutesChange = jest.fn();
    router.plugin({ name: 'routes-test', onRoutesChange });
    router.use({ routes: [{ path: '/new', component: Page }] });
    expect(onRoutesChange).toHaveBeenCalled();
    router.stop();
  });

  it('onError 应返回取消注册函数', () => {
    const router = setup();
    const cb = jest.fn();
    const off = router.onError(cb);
    off();
    expect(router.errorCallbacks).not.toContain(cb);
    router.stop();
  });

  it('beforeEach 重复注册应先移除再添加', () => {
    const router = setup();
    const guard = jest.fn();
    router.beforeEach(guard);
    router.beforeEach(guard);
    expect(router.beforeEachGuards.filter(g => g === guard).length).toBe(1);
    router.stop();
  });

  it('isBrowserMode / isHashMode 应反映模式', () => {
    const memory = setup();
    expect(memory.isBrowserMode).toBe(false);
    expect(memory.isHashMode).toBe(false);
    memory.stop();

    const hash = new ReactViewRouter({ manual: true, mode: HistoryType.hash, routes: [] });
    hash._initRouter({ mode: HistoryType.hash });
    expect(hash.isHashMode).toBe(true);
    hash.stop();
  });

  it('top 无 parent 时应返回自身', () => {
    const router = setup();
    expect(router.top).toBe(router);
    router.stop();
  });

  it('isReactViewRouterInstance 标识应存在', () => {
    const router = setup();
    expect(router.isReactViewRouterInstance).toBe(true);
    router.stop();
  });

  it('createRoute 应处理 preserveState', () => {
    const router = setup();
    const route = router.createRoute({
      path: '/list',
      preserveState: true,
      state: { saved: true },
    } as any);
    expect(route.path).toBe('/list');
    router.stop();
  });

  it('getMatchedPath 空路径应返回原值', () => {
    const router = setup();
    expect(router.getMatchedPath('')).toBe('');
    router.stop();
  });

  it('_updateParent 不应将自身设为 parent', () => {
    const router = setup();
    router._updateParent(router);
    expect(router.parent).toBeNull();
    router.stop();
  });
});
