import {
  camelize,
  flatten,
  once,
  mergeFns,
  normalizePath,
  normalizeProps,
  omitProps,
  isMatchRegxList,
  isPropChanged,
  isRouteChanged,
  isRoutesChanged,
  isAbsoluteUrl,
  reverseArray,
  createEmptyRouteState,
  isEmptyRouteState,
  isPlainObject,
  isFunction,
  isString,
  isNumber,
  isBoolean,
  isNull,
  normalizeLocation,
  normalizeRoute,
  normalizeRoutes,
  matchRoutes,
  resolveIndex,
  resolveRedirect,
  resolveAbort,
  configRouteProps,
  walkRoutes,
  walkConfigRoutes,
  readRouteMeta,
  ignoreCatch,
  createUserConfigRoute,
  createUserConfigRoutes,
  isReactViewRouter,
  isHistory,
  isRoute,
  getSessionStorage,
  setSessionStorage,
} from '../src/util';
import ReactViewRouter from '../src/router';
import { createMemoryHistory } from '../src/history/memory';
import { HistoryType } from '../src/history/types';

describe('util 工具函数', () => {
  describe('camelize', () => {
    it('应将 kebab-case 转为 camelCase', () => {
      expect(camelize('foo-bar')).toBe('fooBar');
      expect(camelize('Foo-Bar')).toBe('fooBar');
    });
  });

  describe('flatten', () => {
    it('应展平嵌套数组', () => {
      expect(flatten([1, [2, [3, 4]], 5])).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('once', () => {
    it('函数只应执行一次', () => {
      const fn = jest.fn((x: number) => x * 2);
      const wrapped = once(fn);
      expect(wrapped(2)).toBe(4);
      expect(wrapped(3)).toBe(4);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('mergeFns', () => {
    it('应依次调用所有函数并返回最后结果', () => {
      const fn1 = jest.fn(() => 1);
      const fn2 = jest.fn(() => 2);
      const merged = mergeFns(fn1, fn2);
      expect(merged()).toBe(2);
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalled();
    });
  });

  describe('normalizePath', () => {
    it('应规范化路径中的 . 和 ..', () => {
      expect(normalizePath('/foo/./bar/../baz')).toBe('/foo/baz');
      expect(normalizePath('/foo//bar')).toBe('/foo/bar');
    });
  });

  describe('normalizeProps', () => {
    it('布尔 true 应原样返回', () => {
      expect(normalizeProps(true)).toBe(true);
    });

    it('数组应转为 props 映射', () => {
      expect(normalizeProps(['id', 'name'])).toEqual({
        id: { type: null },
        name: { type: null },
      });
    });

    it('对象应规范化类型', () => {
      expect(normalizeProps({ count: Number })).toEqual({
        count: { type: Number },
      });
    });
  });

  describe('omitProps', () => {
    it('应排除匹配的属性', () => {
      const props = { a: 1, b: 2, onClick: () => {} };
      const result = omitProps(props, /^on/);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('应支持字符串和数组排除规则', () => {
      expect(omitProps({ a: 1, b: 2 }, 'a')).toEqual({ b: 2 });
      expect(omitProps({ a: 1, b: 2 }, ['a', 'b'])).toEqual({});
    });
  });

  describe('isMatchRegxList', () => {
    it('应匹配字符串和正则', () => {
      expect(isMatchRegxList('foo', 'foo')).toBe(true);
      expect(isMatchRegxList('foo', /^f/)).toBe(true);
      expect(isMatchRegxList('foo', 'bar')).toBe(false);
      expect(isMatchRegxList('foo', ['bar', /^f/])).toBe(true);
    });
  });

  describe('isPropChanged', () => {
    it('应检测属性变化', () => {
      expect(isPropChanged({ a: 1 }, { a: 2 })).toBe(true);
      expect(isPropChanged({ a: 1 }, { a: 1 })).toBe(false);
      expect(isPropChanged(null, { a: 1 })).toBe(true);
    });
  });

  describe('isRouteChanged / isRoutesChanged', () => {
    const route1 = { path: '/a', subpath: 'a' } as any;
    const route2 = { path: '/b', subpath: 'b' } as any;

    it('isRouteChanged 应比较 path 和 subpath', () => {
      expect(isRouteChanged(route1, route2)).toBe(true);
      expect(isRouteChanged(route1, route1)).toBe(false);
    });

    it('isRoutesChanged 应比较路由数组', () => {
      expect(isRoutesChanged([route1], [route1, route2])).toBe(true);
      expect(isRoutesChanged([route1], [route1])).toBe(false);
    });
  });

  describe('isAbsoluteUrl', () => {
    it('应识别绝对 URL', () => {
      expect(isAbsoluteUrl('https://example.com')).toBe(true);
      expect(isAbsoluteUrl('//cdn.example.com')).toBe(true);
      expect(isAbsoluteUrl('/relative')).toBe(false);
    });
  });

  describe('reverseArray', () => {
    it('应反转数组', () => {
      expect(reverseArray([1, 2, 3])).toEqual([3, 2, 1]);
    });
  });

  describe('createEmptyRouteState / isEmptyRouteState', () => {
    it('应创建并识别空路由状态', () => {
      const state = createEmptyRouteState();
      expect(isEmptyRouteState(state)).toBe(true);
      expect(isEmptyRouteState({ foo: 1 })).toBeFalsy();
    });
  });

  describe('类型判断函数', () => {
    it('isPlainObject / isFunction / isString / isNumber / isBoolean / isNull', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject([])).toBe(false);
      expect(isFunction(() => {})).toBe(true);
      expect(isString('a')).toBe(true);
      expect(isNumber(1)).toBe(true);
      expect(isBoolean(true)).toBe(true);
      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(true);
    });
  });

  describe('ignoreCatch', () => {
    it('应捕获异常并调用 onCatch', () => {
      const onCatch = jest.fn();
      const fn = ignoreCatch(() => { throw new Error('test'); }, onCatch);
      fn();
      expect(onCatch).toHaveBeenCalled();
    });

    it('正常执行应返回结果', () => {
      const fn = ignoreCatch(() => 42);
      expect(fn()).toBe(42);
    });
  });

  describe('createUserConfigRoute / createUserConfigRoutes', () => {
    it('应原样返回配置', () => {
      const route = { path: '/test', component: () => null };
      expect(createUserConfigRoute(route)).toBe(route);
      expect(createUserConfigRoutes([route])).toEqual([route]);
    });
  });
});

describe('路由规范化与匹配', () => {
  const Home = () => null;
  const About = () => null;

  const routes = normalizeRoutes([
    { path: '/', component: Home, exact: true },
    { path: '/about', component: About },
    { path: '/users/:id', component: About },
  ]);

  it('normalizeRoute 应生成规范化路由', () => {
    const route = routes[1];
    expect(route.path).toBe('/about');
    expect(route.subpath).toBe('/about');
    expect(route.components.default).toBe(About);
  });

  it('normalizeLocation 应解析字符串路径', () => {
    const loc = normalizeLocation('/about?foo=bar');
    expect(loc).toMatchObject({
      path: '/about',
      pathname: '/about',
    });
    expect(loc!.query).toEqual({ foo: 'bar' });
    expect(loc!.search).toBe('?foo=bar');
    expect(loc!.fullPath).toBe('/about?foo=bar');
  });

  it('normalizeLocation 应处理对象形式', () => {
    const loc = normalizeLocation({ path: '/test', query: { a: 1 } });
    expect(loc!.path).toBe('/test');
    expect(loc!.query).toEqual({ a: 1 });
  });

  it('matchRoutes 应匹配嵌套路由', () => {
    const branch = matchRoutes(routes, '/about');
    expect(branch.length).toBe(1);
    expect(branch[0].route.path).toBe('/about');
  });

  it('matchRoutes 应提取路由参数', () => {
    const branch = matchRoutes(routes, '/users/123');
    expect(branch[0].match.params.id).toBe('123');
  });

  it('resolveIndex 应通过 subpath 匹配路由', () => {
    const indexRoutes = normalizeRoutes([
      {
        path: '/parent',
        component: Home,
        children: [
          { path: '/child', component: About },
        ]
      },
    ]);
    const parent = indexRoutes[0];
    const childRoutes = parent.children as any[];
    const resolved = resolveIndex('/child', childRoutes);
    expect(resolved?.path).toBe('/parent/child');
  });

  it('walkRoutes 应遍历所有路由', () => {
    const paths: string[] = [];
    walkRoutes(routes, route => { paths.push(route.path); });
    expect(paths).toContain('/about');
    expect(paths).toContain('/users/:id');
  });

  it('walkConfigRoutes 应正规化并遍历静态和函数型 children', () => {
    const visited: Array<[string, number]> = [];
    const stopped = walkConfigRoutes([
      {
        path: '/root',
        children: [
          {
            path: 'client',
            children: () => [
              { path: 'hydrate' },
              { path: 'after-stop' },
            ],
          },
        ],
      },
    ], (route, index) => {
      visited.push([route.path, index]);
      return route.path === '/root/client/hydrate';
    });

    expect(stopped).toBe(true);
    expect(visited).toEqual([
      ['/root', 0],
      ['/root/client', 0],
      ['/root/client/hydrate', 0],
    ]);
  });

  it('readRouteMeta 应读取 meta 值', () => {
    const metaRoutes = normalizeRoutes([
      { path: '/meta', component: Home, meta: { title: 'Test' } },
    ]);
    expect(readRouteMeta(metaRoutes[0], 'title')).toBe('Test');
  });

  it('configRouteProps / getConfigRouteProps', () => {
    const props: Record<string, any> = {};
    configRouteProps(props, true, { a: 1, b: 2 });
    expect(props).toEqual({ a: 1, b: 2 });

    const props2: Record<string, any> = {};
    configRouteProps(props2, { id: { type: String } }, { id: 42 });
    expect(props2.id).toBe('42');

    const namedProps: Record<string, any> = {};
    configRouteProps(namedProps, {
      sidebar: {
        id: { type: String },
        missing: { type: String },
      },
    }, { id: 7 }, 'sidebar');
    expect(namedProps).toEqual({ id: '7' });
  });

  it('resolveRedirect 应解析重定向', () => {
    const matched = { config: routes[0], meta: {} } as any;
    const result = resolveRedirect('/about', matched);
    expect(result).toMatchObject({ path: '/about', isRedirect: true });
  });

  it('resolveAbort 应解析中止', () => {
    const matched = { config: routes[0] } as any;
    expect(resolveAbort(true, matched)).toBe(true);
    expect(resolveAbort(() => 'error', matched)).toBe('error');
  });
});

describe('sessionStorage 工具', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('setSessionStorage / getSessionStorage 应读写数据', () => {
    setSessionStorage('rr_test_key', 'value');
    expect(getSessionStorage('rr_test_key')).toBe('value');
    setSessionStorage('rr_json_key', { a: 1 });
    expect(getSessionStorage('rr_json_key', true)).toEqual({ a: 1 });
    setSessionStorage('rr_remove_key');
    expect(getSessionStorage('rr_remove_key')).toBe('');
  });
});

describe('类型守卫', () => {
  it('isReactViewRouter / isHistory / isRoute', () => {
    const router = new ReactViewRouter({ manual: true, mode: HistoryType.memory });
    expect(isReactViewRouter(router)).toBe(true);
    expect(isReactViewRouter({})).toBeFalsy();
    expect(isHistory(router.history)).toBe(true);
    expect(isRoute({ isReactViewRoute: true })).toBe(true);
  });
});
