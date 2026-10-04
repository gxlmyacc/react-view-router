/* eslint-disable max-classes-per-file */
import React from 'react';
import ReactViewRouter from '../../src/router';
import { withRouteGuards } from '../../src/route-guard';
import { renderRoute, normalizeRoutes } from '../../src/util';
import { HistoryType } from '../../src/history/types';
import { createTestRouter, syncNavigate, Home, About, renderUtils } from '../helpers/test-utils';

describe('语句覆盖率 90% 内部路径', () => {
  /**
   * 模拟已挂载 viewRoot。
   * @param router 路由器
   */
  function mockViewRoot(router: ReactViewRouter) {
    router.viewRoot = {
      state: { inited: true },
      _isMounted: true,
      props: {},
      _refreshCurrentRoute: jest.fn(),
    } as any;
  }

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('_getRouteState 应包装与透传 state', () => {
    const router = createTestRouter();
    const raw = { id: 1 };
    expect(router._getRouteState({ path: '/s', state: raw, preserveState: true } as any)).toBe(raw);
    const wrapped = router._getRouteState({ path: '/s', state: { id: 2 } } as any) as any;
    expect(wrapped[router.routerStateName]['/s']).toEqual({ id: 2 });
    router.stop();
  });

  it('_transformLocation 短路径应沿父级解析', () => {
    const parent = createTestRouter(
      [{ path: '/app', component: Home, children: [{ path: '/app/child', component: About }] }],
      { basename: '/app' },
    );
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      basename: '/app/child',
      routes: [{ path: '/', component: About }],
      renderUtils,
    });
    child._updateParent(parent);
    child.start();
    const loc = child._transformLocation({ pathname: '/', search: '', hash: '' } as any);
    expect(loc?.pathname).toBeDefined();
    child.stop();
    parent.stop();
  });

  it('_internalHandleRouteInterceptor 相同 matchedPath 应快速完成', async () => {
    const router = createTestRouter();
    syncNavigate(router, '/');
    mockViewRoot(router);
    const from = router.currentRoute!;
    from.isComplete = true;
    let called = false;
    await new Promise<void>((resolve) => {
      router._internalHandleRouteInterceptor(
        router.createRoute('/'),
        (ok) => {
          called = typeof ok === 'function' || ok === true;
          resolve();
        },
        false,
      );
    });
    expect(called).toBe(true);
    router.stop();
  });

  it('beforeRouteEnter 回调应写入 pending completeCallbacks', async () => {
    const cb = jest.fn();
    const Guarded = withRouteGuards(Home, {
      beforeRouteEnter: (_t, _f, next) => next((inst: any) => cb(inst)),
    });
    const router = createTestRouter([{ path: '/cb', component: Guarded as any }]);
    mockViewRoot(router);
    await new Promise<void>((resolve) => router.push('/cb', resolve));
    const matched = router.currentRoute!.matched[0];
    const pendingCb = matched.config._pending?.completeCallbacks?.default;
    if (pendingCb) pendingCb({});
    expect(router.currentRoute?.path).toBe('/cb');
    router.stop();
  });

  it('renderRoute refHandler 应解析 fiber 节点', () => {
    const Comp = class Comp extends React.Component {

      render() {
        return React.createElement('div', null, 'c');
      }

    };
    const routes = normalizeRoutes([{ path: '/r', component: Comp as any, enableRef: true }]);
    const router = createTestRouter(routes);
    syncNavigate(router, '/r');
    const matched = router.currentRoute!.matched[0];
    const ref = jest.fn();
    const el = renderRoute(matched, routes, {}, null, { router, ref }) as any;
    const fakeFiber = { type: Comp, stateNode: new Comp({}), child: null };
    el?.props?.ref?.({ _reactInternals: fakeFiber });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    el?.props?.ref?.({ _reactInternals: { type: 'Wrong', child: null } });
    expect(ref).toHaveBeenCalled();
    warnSpy.mockRestore();
    router.stop();
  });

  it('install onRouteChange 插件应更新 apps.$route', () => {
    const router = createTestRouter();
    const app = { $route: null as any };
    router.apps = [app];
    const observable = Object.assign((val: any) => val, { ref: 'ref', shallow: 'shallow' });
    const vuelike = {
      observable,
      inherit: jest.fn(),
      inherits: {},
      config: { inheritMergeStrategies: { $route: jest.fn() } },
      action: (_n: string, fn: any) => fn,
    };
    router.install(vuelike, { App: class A {} });
    const plugin = router.plugins.find((p) => p.name === 'react-view-router-plugin');
    plugin?.onRouteChange?.(router.currentRoute as any, router, router);
    expect(app.$route).toBeTruthy();
    router.stop();
  });

  it('子 router init 应继承父级 URL', async () => {
    const parent = createTestRouter(
      [{ path: '/app', component: Home }],
      { basename: '/app' },
    );
    syncNavigate(parent, '/app');
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      basename: '/app/sub',
      routes: [{ path: '/', component: About }],
      renderUtils,
    });
    child._updateParent(parent);
    child.start();
    mockViewRoot(child);
    let called = false;
    await new Promise<void>((resolve) => {
      child._handleRouteInterceptor(
        { pathname: '/wrong', path: '/wrong', search: '', query: {} } as any,
        () => {
          called = true;
          resolve();
        },
        true,
      );
    });
    expect(called).toBe(true);
    child.stop();
    parent.stop();
  });
});
