import matchPath, { computeRootMatch } from '../src/match-path';

describe('matchPath', () => {
  it('应匹配静态路径', () => {
    const result = matchPath('/users', { path: '/users' });
    expect(result).toMatchObject({
      path: '/users',
      url: '/users',
      isExact: true,
      params: {},
    });
  });

  it('应提取动态参数', () => {
    const result = matchPath('/users/42', { path: '/users/:id' });
    expect(result).toMatchObject({
      path: '/users/:id',
      url: '/users/42',
      params: { id: '42' },
    });
  });

  it('exact 为 true 时不应部分匹配', () => {
    const result = matchPath('/users/42/edit', { path: '/users/:id', exact: true });
    expect(result).toBeNull();
  });

  it('应支持字符串形式的 options', () => {
    const result = matchPath('/about', '/about');
    expect(result).toMatchObject({ path: '/about', isExact: true });
  });

  it('应支持数组形式的 path', () => {
    const result = matchPath('/home', { path: ['/other', '/home'] });
    expect(result).toMatchObject({ path: '/home' });
  });

  it('subpath 为 * 时应匹配 fallback', () => {
    const result = matchPath('/any/path', { path: '/any/*', subpath: '*' });
    expect(result).not.toBeNull();
    expect(result!.params.fallback).toBe('path');
  });

  it('应支持数组作为 options 入参', () => {
    const result = matchPath('/home', ['/other', '/home'] as any);
    expect(result?.path).toBe('/home');
  });

  it('未传 options 时安全返回不匹配，首个匹配项后不再遍历', () => {
    expect(matchPath('/any')).toBeNull();
    expect(matchPath('/home', { path: ['/home', '/other'] })?.path).toBe('/home');
  });

  it('处理 path 编译器返回空匹配及非 exact 匹配的边界结果', () => {
    let isolatedMatchPath: typeof matchPath = matchPath;
    try {
      jest.doMock('path-to-regexp', () => ({
        pathToRegexp(path: string) {
          return path === '/' ? /(?:)/ : /^\/partial/;
        },
      }));
      jest.isolateModules(() => {
        isolatedMatchPath = require('../src/match-path').default;
      });
    } finally {
      jest.dontMock('path-to-regexp');
    }
    expect(isolatedMatchPath!('/anything', { path: '/' })?.url).toBe('/');
    expect(isolatedMatchPath!('/partial/tail', { path: '/partial', exact: true })).toBeNull();
  });

  it('strict 与 sensitive 选项应影响匹配', () => {
    expect(matchPath('/Case', { path: '/case', sensitive: true })).toBeNull();
    expect(matchPath('/trailing/', { path: '/trailing', strict: true, exact: true })).toBeNull();
  });

  it('同 path 重复匹配应命中缓存', () => {
    const opts = { path: '/cache-me', strict: false, sensitive: false };
    matchPath('/cache-me', opts);
    expect(matchPath('/cache-me', opts)?.isExact).toBe(true);
  });

  it('根路径应正确匹配', () => {
    const result = matchPath('/', { path: '/', exact: true });
    expect(result).toMatchObject({ url: '/', isExact: true });
  });
});

describe('computeRootMatch', () => {
  it('应返回根匹配结果', () => {
    const result = computeRootMatch('/');
    expect(result).toMatchObject({
      path: '/',
      url: '/',
      params: {},
      isExact: true,
      isNull: true,
    });
  });

  it('非根路径时 isExact 应为 false', () => {
    const result = computeRootMatch('/foo');
    expect(result.isExact).toBe(false);
  });

  it('无 subpath 时不应改写 path 模式', () => {
    const result = matchPath('/users/1', { path: '/users/:id' });
    expect(result?.params.id).toBe('1');
  });

  it('path 缓存超过上限后仍应正常匹配', () => {
    const baseOpts = { strict: false, sensitive: false };
    for (let i = 0; i < 10000; i += 1) {
      matchPath(`/cache-${i}`, { path: `/cache-${i}`, ...baseOpts });
    }
    expect(matchPath('/overflow-path', { path: '/overflow-path', ...baseOpts })?.path).toBe('/overflow-path');
    expect(matchPath('/cache-0', { path: '/cache-0', ...baseOpts })?.path).toBe('/cache-0');
  });

  it('path 未定义时应使用空路径', () => {
    expect(matchPath('/any', {})).toBeNull();
  });

  it('exact 为 true 时更长 pathname 不应匹配', () => {
    expect(matchPath('/foo/bar', { path: '/foo', exact: true })).toBeNull();
  });

  it('根路径匹配时 url 为空应规范为 /', () => {
    const result = matchPath('/', { path: '/' });
    expect(result?.url).toBe('/');
  });

  it('path 数组含空值应跳过', () => {
    expect(matchPath('/hit', { path: [null as any, '/hit'] })?.path).toBe('/hit');
  });

  it('多 path 首项未命中应尝试下一项', () => {
    expect(matchPath('/second', { path: ['/first', '/second'] })?.path).toBe('/second');
  });
});
