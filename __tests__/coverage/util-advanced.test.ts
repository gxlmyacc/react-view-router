import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import {
  createLazyComponent,
  afterInterceptors,
  normalizeRouteChildrenFn,
  getHostRouterView,
  getCompleteRoute,
  getLocationAction,
  getRouterViewPath,
  getRouteChildren,
  normalizeRoutePath,
  normalizeLocation,
  getCurrentPageHash,
  resolveAbort,
  resolveRedirect,
  isMatchedRoutePropsChanged,
  getParentRoute,
  isReadonly,
  walkRoutes,
  readRouteMeta,
  renderRoute,
  normalizeRoutes,
  configRouteProps,
} from '../../src/util';
import { lazyImport } from '../../src/route-lazy';
import { withRouteGuards } from '../../src/route-guard';
import config from '../../src/config';
import ReactViewRouter from '../../src/router';
import { RouterViewComponent } from '../../src/router-view';
import { Action } from '../../src/history/types';
import { createTestRouter, syncNavigate, Home, About, renderUtils } from '../helpers/test-utils';

describe('util 高级覆盖', () => {
  it('renderRoute 对空 route、现成 React 元素、redirect 和无组件叶节点安全处理', () => {
    const routes = normalizeRoutes([
      { path: '/redirect', redirect: '/target' },
      { path: '/leaf' },
    ]);
    const element = React.createElement('strong', null, 'ready');
    expect(renderRoute(null, routes, {}, null)).toBeNull();
    expect(renderRoute(element as any, routes, {}, null)).toBe(element);
    expect(renderRoute(routes[0], routes, {}, null)).toBeNull();
    expect(renderRoute(routes[1], routes, {}, null)).toBeNull();
  });

  it('normalizeRoutePath 支持 route-relative、append 和 basename 路径', () => {
    const routes = normalizeRoutes([
      { path: '/parent', children: [{ path: 'child' }] },
    ]);
    const parent = routes[0];
    const child = (parent.children as any[])[0];
    expect(normalizeRoutePath('sibling', child)).toBe('/parent/sibling');
    expect(normalizeRoutePath('./sibling', child)).toBe('/parent/child/sibling');
    expect(normalizeRoutePath('/root', child, false, '/base')).toBe('/base/root');
    expect(normalizeRoutePath('https://example.com/a', child)).toBe('https://example.com/a');
  });

  it('getRouteChildren 同时支持数组、函数和空值', () => {
    const children = [{ path: '/child' }] as any;
    expect(getRouteChildren(children)).toBe(children);
    expect(getRouteChildren(() => children)).toBe(children);
    expect(getRouteChildren(null as any)).toEqual([]);
  });

  it('normalizeRoutes 复用同一路径的规范化数组并支持空配置', () => {
    const normalized = normalizeRoutes([{ path: '/cached', component: Home }]);
    expect(normalizeRoutes(normalized)).toBe(normalized);
    expect(normalizeRoutes(null)).toEqual([]);
    expect(normalizeRoutes(normalized, null, { force: true })).not.toBe(normalized);
  });

  it('normalizeLocation 清理 undefined query、支持 resolvePathCb 并复用 normalized location', () => {
    const input = { path: '/query', query: { kept: 'yes', removed: undefined } };
    const normalized = normalizeRoutes([{ path: '/query', component: Home }]);
    expect(normalized).toHaveLength(1);
    const location = normalizeLocation(input, {
      resolvePathCb: (path: string) => `${path}/resolved`,
    });
    expect(location?.path).toBe('/query/resolved');
    expect(location?.query).toEqual({ kept: 'yes' });
    expect(normalizeLocation(location)).toBe(location);
    expect(normalizeLocation({})).toBeNull();
  });

  it('resolveAbort 捕获回调异常，resolveRedirect 处理空目标和来源状态', () => {
    const route = { config: { path: '/from' } } as any;
    const thrown = new Error('abort');
    expect(resolveAbort(function throwAbort() { throw thrown; }, route)).toBe(thrown);
    expect(resolveRedirect(undefined, route)).toBe('');
    expect(resolveRedirect(() => undefined, route)).toBe('');
    const redirect = resolveRedirect('/target', route, {
      from: { query: { retained: true }, action: Action.Push } as any,
    });
    expect(redirect).toMatchObject({ isRedirect: true, isReplace: false, query: { retained: true } });
  });

  it('getHostRouterView 与 getParentRoute 支持 fiber 查找、提前停止和缺失树', () => {
    const matched = { path: '/matched' };
    const view = { state: { _routerRoot: true, currentRoute: matched } };
    const ctx = { _reactInternals: { return: { stateNode: view, return: null } } };
    expect(getHostRouterView(ctx)).toBe(view);
    expect(getParentRoute(ctx)).toBe(matched);
    expect(getHostRouterView(ctx, () => false)).toBeNull();
    expect(getHostRouterView({})).toBeNull();
    expect(getCurrentPageHash('')).toBe('');
    expect(getCurrentPageHash('http://unrelated.test/#/path')).toBe('');
  });

  it('isMatchedRoutePropsChanged 对无 route、无配置和 query props 进行短路', () => {
    const router = createTestRouter([{ path: '/props', component: Home }]);
    syncNavigate(router, '/props');
    const matched = router.currentRoute!.matched[0];
    expect(isMatchedRoutePropsChanged(null, router)).toBe(false);
    expect(isMatchedRoutePropsChanged(matched, router)).toBe(false);
    router.currentRoute = null;
    expect(isMatchedRoutePropsChanged({ ...matched, config: { ...matched.config, props: true } } as any, router)).toBe(false);
    router.stop();
  });

  it('createLazyComponent 应异步渲染组件', async () => {
    const Lazy = () => React.createElement('div', { 'data-testid': 'lazy' }, 'ok');
    const Wrapper = createLazyComponent(() => Promise.resolve(Lazy));
    render(React.createElement(Wrapper, {}));
    expect(await screen.findByTestId('lazy')).toBeTruthy();
  });

  it('createLazyComponent 应支持 ES Module 默认导出', async () => {
    const Lazy = () => React.createElement('div', { 'data-testid': 'esm' }, 'esm');
    const Wrapper = createLazyComponent(Promise.resolve({ __esModule: true, default: Lazy } as any));
    render(React.createElement(Wrapper, {}));
    expect(await screen.findByTestId('esm')).toBeTruthy();
  });

  it('afterInterceptors 应执行拦截器链', async () => {
    const fn = jest.fn();
    const interceptors = [
      { lazy: false, call: fn, route: {} },
    ] as any;
    await afterInterceptors(interceptors, { path: '/a' } as any, null);
    expect(fn).toHaveBeenCalled();
  });

  it('afterInterceptors 应解析 lazy 拦截器', async () => {
    const real = jest.fn();
    const interceptors = [
      {
        lazy: true,
        then: undefined,
      },
    ] as any;
    interceptors[0] = async (list: any[], i: number) => {
      list[i] = real;
      return real;
    };
    await afterInterceptors(interceptors, { path: '/b' } as any, { path: '/' } as any);
  });

  it('normalizeRouteChildrenFn checkDirty 为 true 时应刷新', () => {
    let n = 0;
    const fn = normalizeRouteChildrenFn(
      () => [{ path: '/c', component: Home }],
      () => n++ % 2 === 0,
    );
    const parent = normalizeRoutes([{ path: '/', component: Home }])[0];
    const r1 = fn(parent);
    const r2 = fn(parent);
    const r3 = fn(parent);
    expect(r1).toBe(r2);
    expect(r1).not.toBe(r3);
  });

  it('configRouteProps 应处理 default 工厂与类型转换', () => {
    const props: Record<string, any> = {};
    configRouteProps(props, {
      count: { type: Number, default: 0 },
      tags: { type: Array, default: () => [] },
      name: { type: String },
    }, { count: '5', tags: undefined, name: 'x' });
    expect(props.count).toBe(5);
    expect(props.tags).toEqual([]);
    expect(props.name).toBe('x');
  });

  it('renderRoute 无 component 有 children 应渲染 RouterViewWrapper', () => {
    const routes = normalizeRoutes([
      { path: '/', children: [{ path: '/child', component: About }] },
    ]);
    const router = createTestRouter(routes);
    const el = renderRoute(routes[0], routes[0].children as any, {}, null, { router });
    expect(el).toBeTruthy();
    router.stop();
  });

  it('renderRoute 带 RouteLazy 应警告并创建懒组件', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const LazyComp = () => React.createElement('div', { 'data-testid': 'rl' }, 'rl');
    const routes = normalizeRoutes([
      { path: '/lazy', component: lazyImport(() => Promise.resolve(LazyComp)) as any },
    ]);
    const router = createTestRouter(routes);
    syncNavigate(router, '/lazy');
    const matched = router.currentRoute!.matched[0];
    const el = renderRoute(matched, routes, {}, null, { router });
    expect(el).toBeTruthy();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    router.stop();
  });

  it('renderRoute 带 guards 组件应正确渲染', () => {
    const Guarded = withRouteGuards(Home, {});
    const routes = normalizeRoutes([{ path: '/g', component: Guarded as any }]);
    const router = createTestRouter(routes);
    syncNavigate(router, '/g');
    const matched = router.currentRoute!.matched[0];
    const el = renderRoute(matched, routes, {}, null, { router });
    expect(React.isValidElement(el)).toBe(true);
    router.stop();
  });

  it('renderRoute inheritProps 为 true 时应注入 route', () => {
    const orig = config.inheritProps;
    config.inheritProps = true;
    const routes = normalizeRoutes([{ path: '/ip', component: Home }]);
    const router = createTestRouter(routes);
    syncNavigate(router, '/ip');
    const matched = router.currentRoute!.matched[0];
    const el = renderRoute(matched, routes, {}, null, { router }) as any;
    expect(el?.props?.route).toBeDefined();
    config.inheritProps = orig;
    router.stop();
  });

  it('getCompleteRoute / getLocationAction 链式重定向', () => {
    const complete = { isComplete: true, path: '/done', action: Action.Replace } as any;
    const mid = { redirectedFrom: complete, isRedirect: true } as any;
    expect(getCompleteRoute(mid)).toBe(complete);
    expect(getLocationAction(mid)).toBe(Action.Replace);
  });

  it('isReadonly 应检测只读属性', () => {
    const obj: any = {};
    Object.defineProperty(obj, 'x', { get: () => 1, configurable: true });
    expect(isReadonly(obj, 'x')).toBe(true);
    expect(isReadonly(obj, 'y')).toBe(false);
  });

  it('walkRoutes 函数形式 children', () => {
    const paths: string[] = [];
    walkRoutes(
      (parent) => [{ path: 'dyn', component: Home }],
      (r) => paths.push(r.path),
    );
    expect(paths.length).toBeGreaterThan(0);
  });

  it('readRouteMeta 函数形式带 router', () => {
    const router = createTestRouter();
    const routes = normalizeRoutes([
      {
        path: '/m',
        component: Home,
        meta: {
          label: (route: any, routes: any, props: any) => `${route.path}-${props.router ? 'ok' : ''}`,
        },
      },
    ]);
    expect(readRouteMeta(routes[0], 'label', { router })).toContain('ok');
    router.stop();
  });
});

describe('util 与 RouterView 联动', () => {
  it('getRouterViewPath 应返回当前路径', async () => {
    const router = createTestRouter();
    render(React.createElement(RouterViewComponent, { router }));
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    syncNavigate(router, '/about');
    router.viewRoot!._refreshCurrentRoute();
    const path = getRouterViewPath(router.viewRoot!);
    expect(path).toBeTruthy();
    router.stop();
  });

  it('isMatchedRoutePropsChanged query 变化时应为 true', () => {
    const router = createTestRouter([
      { path: '/q', component: Home, queryProps: ['tab'] },
    ]);
    syncNavigate(router, '/q?tab=1');
    router.prevRoute = { ...router.currentRoute!, query: { tab: '0' } } as any;
    const matched = router.currentRoute!.matched[0];
    expect(isMatchedRoutePropsChanged(matched, router)).toBe(true);
    router.stop();
  });
});
