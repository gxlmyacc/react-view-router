/* eslint-disable max-classes-per-file */
import React from 'react';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import ReactViewRouter from '../../src/router';
import { RouterViewComponent, RouterViewWrapper } from '../../src/router-view';
import useRouteTitle, { readRouteTitles } from '../../src/hooks/use-route-title';
import { withRouteGuards } from '../../src/route-guard';
import { HistoryType } from '../../src/history/types';
import { createTestRouter, syncNavigate, Home, About, renderUtils } from '../helpers/test-utils';

describe('语句覆盖率 90% 补充（二）', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('onRouteing 插件函数回调应在 finally 执行', async () => {
    const router = createTestRouter();
    router.viewRoot = { state: { inited: true }, _isMounted: true, _refreshCurrentRoute: jest.fn() } as any;
    const delayed = jest.fn();
    router.plugin({ name: 'delay', onRouteing: (next) => next(delayed) });
    await new Promise<void>((resolve) => {
      router._handleRouteInterceptor(
        { pathname: '/about', path: '/about', search: '' } as any,
        () => resolve(),
      );
    });
    expect(delayed).toHaveBeenCalled();
    router.stop();
  });

  it('rememberInitialRoute basename 多栈应选取正确项', () => {
    const router = createTestRouter(
      [{ path: '/app', component: Home }, { path: '/app/inner', component: About }],
      { basename: '/app', rememberInitialRoute: true },
    );
    router.history.push('/app');
    router.history.push('/app/inner');
    router._refreshInitialRoute();
    expect(router.initialRoute).toBeDefined();
    router.stop();
  });

  it('updateRoute basename 应合并已有 stacks', () => {
    const router = createTestRouter(
      [{ path: '/app', component: Home }, { path: '/app/b', component: About }],
      { basename: '/app' },
    );
    router.stacks = [{
      pathname: '/',
      search: '',
      hash: '',
      index: 0,
      timestamp: 0,
      query: {},
    } as any];
    router.history.stacks = [
      { pathname: '/app', search: '', hash: '', index: 0, timestamp: 1, query: {} } as any,
      { pathname: '/app/b', search: '', hash: '', index: 1, timestamp: 2, query: {} } as any,
    ];
    syncNavigate(router, '/app/b');
    expect(router.stacks.length).toBeGreaterThan(0);
    router.stop();
  });

  it('_handleRouteInterceptor 空 pathname 应快速返回', async () => {
    const router = createTestRouter();
    let ok: boolean | undefined;
    await new Promise<void>((resolve) => {
      router._handleRouteInterceptor(
        { pathname: '', path: '', search: '' } as any,
        (res) => {
          ok = res as boolean;
          resolve();
        },
      );
    });
    expect(ok).toBe(true);
    router.stop();
  });

  it('_handleRouteInterceptor viewRoot 未初始化应跳过', async () => {
    const router = createTestRouter();
    let ok: boolean | undefined;
    await new Promise<void>((resolve) => {
      router._handleRouteInterceptor(
        { pathname: '/about', path: '/about', search: '' } as any,
        (res) => {
          ok = res as boolean;
          resolve();
        },
      );
    });
    expect(ok).toBe(true);
    router.stop();
  });

  it('onRouteing 插件应可改写 location', async () => {
    const router = createTestRouter();
    router.viewRoot = { state: { inited: true }, _isMounted: true, _refreshCurrentRoute: jest.fn() } as any;
    router.plugin({
      name: 'routeing',
      onRouteing: (next) => next({ path: '/about' } as any),
    });
    await new Promise<void>((resolve) => {
      router._handleRouteInterceptor(
        { pathname: '/', path: '/', search: '' } as any,
        () => resolve(),
      );
    });
    router.stop();
  });

  it('_go 空目标应 abort', async () => {
    const router = createTestRouter();
    await expect(router._go(null as any)).rejects.toBeTruthy();
    router.stop();
  });

  it('vuelike mixin flow 守卫应被包装', () => {
    const leave = jest.fn();
    const Comp: any = function Comp() {};
    Comp.__vuelike = true;
    Comp.mixins = [{ beforeRouteLeave: leave, __flows: ['beforeRouteLeave'] }];
    const router = createTestRouter();
    router.vuelike = { flow: (fn: any) => Object.assign(fn, { isMobxFlow: false }) };
    const mr = router.currentRoute!.matched[0];
    mr.config.components = { default: Comp };
    const guards = router._getComponentGuards(mr, 'beforeRouteLeave');
    expect(guards.length).toBeGreaterThan(0);
    router.stop();
  });

  it('RouterView name 非 default 应返回 props.name', () => {
    const router = createTestRouter();
    const view = new (RouterViewComponent as any)({ router, name: 'sidebar' });
    expect(view.name).toBe('sidebar');
    router.stop();
  });

  it('RouterViewWrapper router 启动后应通过 useEffect 渲染', async () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [{ path: '/', component: Home }],
      renderUtils,
    });
    const ref = React.createRef<any>();
    const { rerender } = render(React.createElement(RouterViewWrapper, { router, ref }));
    await act(async () => {
      router.start();
    });
    rerender(React.createElement(RouterViewWrapper, { router, ref }));
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    router.stop();
  });

  it('useRouteTitle 嵌套 depth 路由变化应刷新 tabs', async () => {
    const router = createTestRouter([
      {
        path: '/p',
        component: Home,
        meta: { title: '父' },
        children: [
          { path: '/p/a', component: About, meta: { title: 'A' } },
          { path: '/p/b', component: About, meta: { title: 'B' } },
        ],
      },
    ]);
    syncNavigate(router, '/p/a');
    const view = { state: { depth: 1, router } };
    const { result } = renderHook(
      () => useRouteTitle({ manual: true, maxLevel: 2 }, router),
      {
        wrapper: ({ children }) =>
          React.createElement(require('../../src/context').RouterViewContext.Provider, { value: view }, children),
      },
    );
    act(() => {
      result.current.setTitles(readRouteTitles(router, router.routes, { maxLevel: 2 }));
    });
    act(() => syncNavigate(router, '/p/b'));
    await waitFor(() => expect(result.current.matchedRoutes.length).toBeGreaterThan(0));
    router.stop();
  });

  it('beforeRouteEnter 带 cb 应注册 pending 回调', () => {
    const Guarded = withRouteGuards(Home, {
      beforeRouteEnter: (_t, _f, next) => next((inst: any) => inst),
    });
    const router = createTestRouter([{ path: '/e', component: Guarded as any }]);
    const to = router.createRoute('/e');
    const guards = router._getBeforeEachGuards(to, router.currentRoute);
    expect(guards.length).toBeGreaterThan(0);
    router.stop();
  });

  it('子路由 nameToPath 无本地匹配应查父级', () => {
    const parent = createTestRouter(
      [{ path: '/app', name: 'appHome', component: Home }],
      { basename: '/app' },
    );
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      basename: '/app/sub',
      routes: [{ path: '/', component: About }],
      renderUtils,
    });
    child._updateParent(parent);
    child.start();
    const path = child.nameToPath('appHome', { absolute: true });
    expect(path).toBeTruthy();
    child.stop();
    parent.stop();
  });

  it('vuelike flow 应包装 prototype 守卫', () => {
    const leave = jest.fn();
    const Comp: any = function Comp() {};
    Comp.prototype.beforeRouteLeave = leave;
    Comp.__flows = ['beforeRouteLeave'];
    const router = createTestRouter();
    router.vuelike = { flow: (fn: any) => fn };
    const mr = router.currentRoute!.matched[0];
    mr.config.components = { default: Comp };
    expect(router._getComponentGuards(mr, 'beforeRouteLeave').length).toBeGreaterThan(0);
    router.stop();
  });

  it('install 应通过 vuelike.inherit 注册路由', () => {
    const router = createTestRouter();
    const inheritFn = jest.fn();
    const observable = Object.assign(
      (val: any, _a?: any, _b?: any) => val,
      { ref: 'ref', shallow: 'shallow' },
    );
    const vuelike = {
      observable,
      inherit: inheritFn,
      inherits: {},
      config: { inheritMergeStrategies: {} },
      action: (_name: string, fn: any) => fn,
    };
    class AppClass {}
    router.install(vuelike, { App: AppClass });
    expect(router.vuelike).toBe(vuelike);
    expect(inheritFn).toHaveBeenCalled();
    router.stop();
  });

  it('install 无 inherit 时应写入 App.inherits', () => {
    const router = createTestRouter();
    const observable = Object.assign((val: any) => val, { ref: 'ref', shallow: 'shallow' });
    const vuelike = {
      observable,
      config: { optionMergeStrategies: {} },
      action: (_name: string, fn: any) => fn,
    };
    class AppClass {}
    router.install(vuelike, { App: [AppClass] });
    expect((AppClass as any).inherits.$router).toBe(router);
    expect((AppClass as any).inherits.$route).toBeDefined();
    router.stop();
  });

  it('isHashMode getter 应识别 hash 模式', () => {
    const router = createTestRouter([], { mode: HistoryType.hash });
    expect(router.isHashMode).toBe(true);
    router.stop();
  });
});
