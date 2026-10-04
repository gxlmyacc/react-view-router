import React from 'react';
import {
  normalizeRoutePath,
  normalizeLocation,
  normalizeRouteChildrenFn,
  normalizeRoutes,
  getCompleteRoute,
  getLocationAction,
  nextTick,
  innumerable,
  reverseArray,
  omitProps,
  resolveRedirect,
  resolveAbort,
  resolveIndex,
  matchRoutes,
  isHistoryLocation,
  isConfigRoute,
  isNormalizedConfigRouteArray,
  isMatchedRoute,
  isLocation,
  createLazyComponent,
  readRouteMeta,
} from '../src/util';
import { Action } from '../src/history/types';
import ReactViewRouter from '../src/router';

const Comp = () => null;

describe('util 扩展测试', () => {
  describe('normalizeRoutePath', () => {
    const routes = normalizeRoutes([
      {
        path: '/parent',
        component: Comp,
        children: [
          { path: 'child', component: Comp },
        ]
      },
    ]);
    const parent = routes[0];
    const child = (parent.children as any[])[0];

    it('相对路径应拼接父路径', () => {
      expect(normalizeRoutePath('sub', child)).toBe('/parent/sub');
    });

    it('绝对路径应保持不变', () => {
      expect(normalizeRoutePath('/absolute', child)).toBe('/absolute');
    });

    it('绝对路径应支持 basename', () => {
      expect(normalizeRoutePath('/absolute', child, false, '/app')).toBe('/app/absolute');
    });

    it('绝对 URL 应原样返回', () => {
      expect(normalizeRoutePath('https://example.com')).toBe('https://example.com');
    });

    it('append 模式应基于当前路由', () => {
      expect(normalizeRoutePath('./sibling', child, true)).toContain('parent');
    });

    it('多层嵌套相对路径应沿父链拼接', () => {
      const deepRoutes = normalizeRoutes([
        {
          path: '/a',
          component: Comp,
          children: [
            {
              path: 'b',
              component: Comp,
              children: [{ path: 'c', component: Comp }],
            },
          ],
        },
      ]);
      const grandchild = ((deepRoutes[0].children as any[])[0].children as any[])[0];
      expect(normalizeRoutePath('leaf', grandchild)).toBe('/a/b/leaf');
    });
  });

  describe('normalizeLocation 扩展', () => {
    it('空值应返回 null', () => {
      expect(normalizeLocation(null)).toBeNull();
      expect(normalizeLocation({})).toBeNull();
    });

    it('已规范化的位置应直接返回', () => {
      const loc = normalizeLocation('/test');
      const again = normalizeLocation(loc);
      expect(again).toBe(loc);
    });

    it('isHistoryLocation 应识别规范化位置', () => {
      const loc = normalizeLocation('/foo');
      expect(isHistoryLocation(loc)).toBe(true);
      expect(isHistoryLocation({ path: '/foo' })).toBe(false);
    });

    it('isLocation 应识别位置对象', () => {
      expect(isLocation({ path: '/a' })).toBeTruthy();
      expect(isLocation({})).toBeFalsy();
    });
  });

  describe('normalizeRouteChildrenFn', () => {
    it('应缓存子路由函数结果', () => {
      const fn = jest.fn((parent: any) => [
        { path: 'a', component: Comp },
      ]);
      const normalized = normalizeRouteChildrenFn(fn);
      const parent = normalizeRoutes([{ path: '/', component: Comp }])[0];
      const result1 = normalized(parent);
      const result2 = normalized(parent);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });

    it('已规范化函数应直接返回', () => {
      const fn = normalizeRouteChildrenFn(() => []);
      expect(normalizeRouteChildrenFn(fn)).toBe(fn);
    });
  });

  describe('getCompleteRoute / getLocationAction', () => {
    it('getCompleteRoute 应沿 redirectedFrom 查找', () => {
      const complete = { isComplete: true, path: '/done' } as any;
      const route = { redirectedFrom: complete } as any;
      expect(getCompleteRoute(route)).toBe(complete);
    });

    it('getLocationAction 应解析重定向动作', () => {
      const from = { action: Action.Push, isRedirect: true, redirectedFrom: { action: Action.Replace } } as any;
      expect(getLocationAction(from)).toBe(Action.Replace);
    });
  });

  describe('nextTick', () => {
    it('应在微任务中执行回调', async () => {
      const cb = jest.fn();
      await nextTick(cb);
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('innumerable', () => {
    it('应定义不可枚举属性', () => {
      const obj: any = {};
      innumerable(obj, 'hidden', 42);
      expect(obj.hidden).toBe(42);
      expect(Object.keys(obj)).not.toContain('hidden');
    });
  });

  describe('resolveIndex', () => {
    it(':first 应返回第一个可见路由', () => {
      const routes = normalizeRoutes([
        { path: '/index-holder', index: '/b' },
        { path: '/a', component: Comp, meta: { visible: false } },
        { path: '/b', component: Comp },
      ]);
      const result = resolveIndex(':first', routes);
      expect(result?.path).toBe('/b');
    });

    it('无匹配时应返回 null', () => {
      expect(resolveIndex('/notfound', normalizeRoutes([{ path: '/a', component: Comp }]))).toBeNull();
      expect(resolveIndex(() => '', normalizeRoutes([{ path: '/a', component: Comp }]))).toBeNull();
      expect(resolveIndex(() => ({ path: '' }) as any, normalizeRoutes([{ path: '/a', component: Comp }]))).toBeNull();
    });

    it('应使用具体 index 值匹配动态 subpath', () => {
      const routes = normalizeRoutes([
        { path: ':reportId', component: Comp },
      ]);

      expect(resolveIndex('monthly', routes)?.subpath).toBe(':reportId');
    });

    it('静态 subpath 应优先于动态 subpath', () => {
      const routes = normalizeRoutes([
        { path: ':reportId', component: Comp },
        { path: 'monthly', component: Comp },
      ]);

      expect(resolveIndex('monthly', routes)?.subpath).toBe('monthly');
    });

    it('循环 index 链应安全终止', () => {
      const routes = normalizeRoutes([
        { path: '/a', index: '/b' },
        { path: '/b', index: '/a' },
      ]);

      expect(resolveIndex('/a', routes)).toBeNull();
    });
  });

  describe('resolveRedirect / resolveAbort', () => {
    const routes = normalizeRoutes([{ path: '/', component: Comp }]);
    const matched = { config: routes[0] } as any;

    it('函数形式 redirect 应被调用', () => {
      const fn = jest.fn(() => '/target');
      const result = resolveRedirect(fn, matched);
      expect(fn).toHaveBeenCalled();
      expect(result).toMatchObject({ path: '/target' });
    });

    it('abort 函数抛错时应返回异常', () => {
      const err = new Error('abort');
      const result = resolveAbort(() => { throw err; }, matched);
      expect(result).toBe(err);
    });
  });

  describe('readRouteMeta 函数形式', () => {
    it('meta 为函数时应计算值', () => {
      const routes = normalizeRoutes([
        { path: '/fn-meta', component: Comp, meta: { title: (route: any) => route.path } },
      ]);
      expect(readRouteMeta(routes[0], 'title')).toBe('/fn-meta');
    });
  });

  describe('isConfigRoute / isNormalizedConfigRouteArray', () => {
    it('应识别规范化路由', () => {
      const routes = normalizeRoutes([{ path: '/', component: Comp }]);
      expect(isConfigRoute(routes[0])).toBeTruthy();
      expect(isNormalizedConfigRouteArray(routes)).toBeTruthy();
      expect(isNormalizedConfigRouteArray([])).toBeFalsy();
    });

    it('isMatchedRoute 应识别匹配路由', () => {
      expect(isMatchedRoute({ config: {} })).toBe(true);
      expect(isMatchedRoute({})).toBe(false);
    });
  });

  describe('createLazyComponent', () => {
    it('应异步加载并渲染组件', async () => {
      const LazyComp = () => React.createElement('span', null, 'loaded');
      const CompWrapper = createLazyComponent(() => Promise.resolve(LazyComp));
      const element = React.createElement(CompWrapper, {});
      expect(element).toBeDefined();
    });
  });

  describe('matchRoutes 带 index 路由', () => {
    it('应解析 index 重定向', () => {
      const routes = normalizeRoutes([
        {
          path: '/dashboard',
          component: Comp,
          children: [
            { path: '/dashboard/home', component: Comp, index: '/dashboard/home' },
          ],
        },
      ]);
      const branch = matchRoutes(routes, '/dashboard');
      expect(branch.length).toBeGreaterThan(0);
    });

    it('index 找不到可匹配路由时不应产生分支', () => {
      const routes = normalizeRoutes([
        { path: '/missing', index: '/not-found' },
      ]);

      expect(matchRoutes(routes, '/missing')).toHaveLength(0);
    });

    it('动态 index 应保留具体参数值', () => {
      const routes = normalizeRoutes([
        {
          path: '/reports',
          component: Comp,
          children: [
            {
              path: 'finance',
              component: Comp,
              children: [
                { path: '/', index: 'monthly' },
                { path: ':reportId', component: Comp },
              ],
            },
          ],
        },
      ]);

      const branch = matchRoutes(routes, '/reports/finance');
      expect(branch[branch.length - 1].route.subpath).toBe(':reportId');
      expect(branch[branch.length - 1].match.params.reportId).toBe('monthly');
      expect(branch[branch.length - 1].match.url).toBe('/reports/finance/monthly');
    });

    it('函数型动态 index 应合并 RouteLocation 查询参数且不触发 history 导航', () => {
      const router = new ReactViewRouter({
        manual: true,
        mode: 'memory',
        routes: [
          {
            path: '/reports',
            component: Comp,
            children: [
              {
                path: 'finance',
                component: Comp,
                children: [
                  { path: '/', index: () => ({ path: 'monthly', query: { view: 'summary' } }) },
                  { path: ':reportId', component: Comp },
                ],
              },
            ],
          },
        ],
      });
      const push = jest.spyOn(router.history, 'push');
      const replace = jest.spyOn(router.history, 'replace');

      const route = router.createRoute('/reports/finance');

      expect(route.path).toBe('/reports/finance/monthly');
      expect(route.params.reportId).toBe('monthly');
      expect(route.query).toEqual({ view: 'summary' });
      expect(push).not.toHaveBeenCalled();
      expect(replace).not.toHaveBeenCalled();
    });
  });

  describe('omitProps 边界', () => {
    it('excludes 为空时应返回原对象', () => {
      const props = { a: 1 };
      expect(omitProps(props, null as any)).toBe(props);
    });
  });
});

describe('ReactViewRouter 扩展', () => {
  const Home = () => null;

  /**
   * 创建测试用路由器。
   * @returns ReactViewRouter 实例
   */
  function createRouter() {
    const router = new ReactViewRouter({
      manual: true,
      mode: 'memory',
      routes: [
        { path: '/', component: Home },
        { path: '/page/:id', component: Home, meta: { title: 'Page' } },
      ],
    });
    router.start();
    return router;
  }

  /**
   * 同步导航辅助。
   * @param router 路由器
   * @param path 路径
   */
  function navigate(router: ReactViewRouter, path: string) {
    router.history.push(path);
    router.updateRoute(router.history.location as any);
  }

  it('redirect 方法应触发重定向', () => {
    const router = createRouter();
    router.history.push('/');
    router.updateRoute(router.history.location as any);
    router.redirect('/page/1');
    router.updateRoute(router.history.location as any);
    expect(router.currentRoute?.path).toBe('/page/1');
    router.stop();
  });

  it('replaceState 应更新路由状态', () => {
    const router = createRouter();
    navigate(router, '/page/1');
    const matched = router.currentRoute?.matched[0];
    router.replaceState({ count: 1 }, matched);
    expect(router.history.state).toBeTruthy();
    router.stop();
  });

  it('updateRouteMeta 应更新 meta', () => {
    const router = createRouter();
    navigate(router, '/page/1');
    const matched = router.currentRoute?.matched[0];
    if (matched) {
      const changed = router.updateRouteMeta(matched, { title: 'New' });
      expect(changed).toBe(true);
      expect(matched.meta.title).toBe('New');
    }
    router.stop();
  });

  it('getMatchedComponents 应返回组件列表', () => {
    const router = createRouter();
    navigate(router, '/page/2');
    const route = router.currentRoute!;
    const comps = router.getMatchedComponents(route);
    expect(Array.isArray(comps)).toBe(true);
    router.stop();
  });

  it('beforeResolve 应可注册和注销', () => {
    const router = createRouter();
    const guard = jest.fn();
    const unwatch = router.beforeResolve(guard);
    expect(router.beforeResolveGuards).toContain(guard);
    unwatch?.();
    expect(router.beforeResolveGuards).not.toContain(guard);
    router.stop();
  });

  it('afterUpdate 应可注册', () => {
    const router = createRouter();
    const guard = jest.fn();
    router.afterUpdate(guard);
    expect(router.afterUpdateGuards).toContain(guard);
    router.stop();
  });

  it('_transformLocation 应转换路径', () => {
    const router = createRouter();
    const loc = router._transformLocation({ pathname: '/page/3', path: '/page/3' } as any);
    expect(loc).toBeTruthy();
    router.stop();
  });

  it('resolveNameFns 应解析自定义名称', () => {
    const router = createRouter();
    const off = router.resolveRouteName(name => (name === 'custom' ? '/page/99' : null));
    expect(router.nameToPath('custom')).toBe('/page/99');
    off();
    router.stop();
  });

  it('go 应支持数字导航', () => {
    const router = createRouter();
    navigate(router, '/page/1');
    navigate(router, '/page/2');
    router.go(-1);
    router.updateRoute(router.history.location as any);
    expect(router.currentRoute?.params?.id).toBe('1');
    router.stop();
  });

  it('isPrepared 无 viewRoot 时应为 false', () => {
    const router = createRouter();
    expect(router.isPrepared).toBe(false);
    router.stop();
  });

  it('plugin 函数形式应包装为 onRouteChange', () => {
    const router = createRouter();
    const onChange = jest.fn();
    const unplugin = router.plugin(onChange);
    expect(typeof unplugin).toBe('function');
    unplugin?.();
    router.stop();
  });
});
