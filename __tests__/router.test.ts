import ReactViewRouter from '../src/router';
import { HistoryType } from '../src/history/types';
import { normalizeRoutes } from '../src/util';

const Home = () => null;
const About = () => null;
const User = () => null;

/**
 * 在测试环境中同步触发路由更新（无需挂载 RouterView）。
 * @param router 路由器实例
 * @param path 目标路径
 * @returns 无返回值
 */
function syncNavigate(router: ReactViewRouter, path: string) {
  router.history.push(path);
  router.updateRoute(router.history.location as any);
}

describe('ReactViewRouter', () => {
  const createRouter = (options: Record<string, any> = {}) => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [
        { path: '/', component: Home, exact: true },
        { path: '/about', component: About },
        { path: '/users/:id', component: User },
        { path: '/redirect-test', redirect: '/about' },
        { path: '/named', component: About, name: 'namedRoute' },
      ],
      ...options,
    });
    router.start();
    return router;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('应创建路由器实例', () => {
    const router = createRouter();
    expect(router.isReactViewRouterInstance).toBe(true);
    expect(router.isMemoryMode).toBe(true);
    router.stop();
  });

  it('push 应导航到新路径', () => {
    const router = createRouter();
    syncNavigate(router, '/about');
    expect(router.currentRoute?.path).toBe('/about');
    router.stop();
  });

  it('replace 应替换当前路径', () => {
    const router = createRouter();
    syncNavigate(router, '/about');
    router.history.replace('/users/1');
    router.updateRoute(router.history.location as any);
    expect(router.currentRoute?.path).toBe('/users/1');
    router.stop();
  });

  it('应解析路由参数', () => {
    const router = createRouter();
    syncNavigate(router, '/users/42');
    expect(router.currentRoute?.params?.id).toBe('42');
    router.stop();
  });

  it('go/back 应支持历史导航', () => {
    const router = createRouter();
    syncNavigate(router, '/about');
    syncNavigate(router, '/users/1');
    router.back();
    router.updateRoute(router.history.location as any);
    expect(router.currentRoute?.path).toBe('/about');
    router.stop();
  });

  it('redirect 配置应存在于路由表', () => {
    const router = createRouter();
    const matched = router.getMatched('/redirect-test');
    expect(matched[0].config.redirect).toBe('/about');
    router.stop();
  });

  it('use 应更新路由配置', () => {
    const router = createRouter();
    const Contact = () => null;
    router.use({
      routes: [
        { path: '/', component: Home },
        { path: '/contact', component: Contact },
      ],
    });
    expect(router.routes.length).toBe(2);
    router.stop();
  });

  it('beforeEach 守卫应可注册', () => {
    const router = createRouter();
    const guard = jest.fn((to, from, next) => next());
    router.beforeEach(guard);
    expect(router.beforeEachGuards).toContain(guard);
    router.stop();
  });

  it('plugin 应注册路由插件', () => {
    const router = createRouter();
    const plugin = { name: 'test-plugin', onStart: jest.fn() };
    const unplugin = router.plugin(plugin);
    expect(router.plugins.some((p) => p.name === 'test-plugin')).toBe(true);
    unplugin?.();
    router.stop();
  });

  it('getMatched 应返回匹配结果', () => {
    const router = createRouter();
    const matched = router.getMatched('/users/5');
    expect(matched.length).toBeGreaterThan(0);
    expect(matched[0].params.id).toBe('5');
    router.stop();
  });

  it('memory 模式下 basename 为空', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      basename: '/app',
      routes: [{ path: '/', component: Home }],
    });
    router.start();
    expect(router.basename).toBe('');
    router.stop();
  });

  it('hash 模式下 basename 应正确设置', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.hash,
      basename: '/app',
      routes: [{ path: '/', component: Home }],
    });
    router._initRouter({ basename: '/app', mode: HistoryType.hash });
    expect(router.basename).toBe('/app/');
    expect(router.basenameNoSlash).toBe('/app');
    router.stop();
  });

  it('basename 含多余斜杠时 basenameNoSlash 应正确', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.hash,
      routes: [{ path: '/', component: Home }],
    });
    router._initRouter({ basename: '/foo///', mode: HistoryType.hash });
    expect(router.basename).toBe('/foo/');
    expect(router.basenameNoSlash).toBe('/foo');
    router.stop();
  });

  it('旧版本 Route 的无尾斜杠 basename 应在跨路由转换时规范化', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.hash,
      routes: [{ path: '/page', component: Home }],
    });
    router._initRouter({ basename: '/app', mode: HistoryType.hash });
    const legacyRoute = {
      isReactViewRoute: true,
      basename: '/app',
      path: '/page',
      pathname: '/page',
      search: '',
    } as any;

    const location = router._transformLocation(legacyRoute) as any;

    expect(location).not.toBe(legacyRoute);
    expect(location.basename).toBe('/app/');
    expect(location.pathname).toBe('/page');
    expect(location.path).toBe('/page');
    router.stop();
  });

  it('basename 匹配应识别根路径边界且不能误匹配相似前缀', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.hash,
      routes: [{ path: '/', component: Home }],
    });
    router._initRouter({ basename: '/app', mode: HistoryType.hash });

    expect(router._isMatchBasename({ path: '/app', pathname: '/app' } as any)).toBe(true);
    expect(router._isMatchBasename({ path: '/app/page', pathname: '/app/page' } as any)).toBe(true);
    expect(router._isMatchBasename({ path: '/application', pathname: '/application' } as any)).toBe(false);

    const root = router._transformLocation({
      isReactViewRoute: true,
      basename: '',
      path: '/app',
      pathname: '/app',
      search: '',
    } as any) as any;
    expect(root.basename).toBe('/app/');
    expect(root.path).toBe('/');
    router.stop();
  });

  it('stop 应清理路由器状态', () => {
    const router = createRouter();
    router.stop();
    expect(router.isRunning).toBe(false);
    expect(router.currentRoute).toBeNull();
  });

  it('top 应返回顶层路由器', () => {
    const parent = createRouter();
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      basename: '/child',
      routes: [{ path: '/', component: Home }],
    });
    child._updateParent(parent);
    expect(child.top).toBe(parent);
    parent.stop();
    child.stop();
  });

  it('createRoute 应生成完整路由对象', () => {
    const router = createRouter();
    const route = router.createRoute('/about?tab=info');
    expect(route.path).toBe('/about');
    expect(route.query.tab).toBe('info');
    router.stop();
  });

  it('nameToPath 应解析命名路由', () => {
    const router = createRouter();
    expect(router.nameToPath('namedRoute')).toBe('/named');
    router.stop();
  });

  it('parseQuery / stringifyQuery 应委托给 config', () => {
    const router = createRouter();
    expect(router.parseQuery('?a=1')).toEqual({ a: '1' });
    expect(router.stringifyQuery({ b: '2' })).toBe('?b=2');
    router.stop();
  });

  it('replaceQuery 应更新当前路由查询参数', () => {
    const router = createRouter();
    syncNavigate(router, '/about');
    router.replaceQuery('tab', 'info');
    expect(router.currentRoute?.query.tab).toBe('info');
    router.stop();
  });

  it('getMatchedPath 应返回匹配路径', () => {
    const router = createRouter();
    expect(router.getMatchedPath('/users/1')).toContain('/users');
    router.stop();
  });

  it('normalizeRoutes 缓存应正常工作', () => {
    const routes = normalizeRoutes([
      { path: '/a', component: Home },
    ]);
    const cached = normalizeRoutes(routes);
    expect(cached).toBe(routes);
  });

  it('onError 回调应可注册', () => {
    const router = createRouter();
    const cb = jest.fn();
    router.onError(cb);
    expect(router.errorCallbacks).toContain(cb);
    router.stop();
  });

  it('afterEach 守卫应可注册', () => {
    const router = createRouter();
    const guard = jest.fn();
    router.afterEach(guard);
    expect(router.afterEachGuards).toContain(guard);
    router.stop();
  });
});
