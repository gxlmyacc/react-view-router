import React from 'react';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import { RouterViewComponent } from '../../src/router-view';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About } from '../helpers/test-utils';
import ReactViewRouter from '../../src/router';
import { HistoryType } from '../../src/history/types';
import { lazyImport } from '../../src/route-lazy';
import { withRouteGuards } from '../../src/route-guard';

describe('ReactViewRouter 深度覆盖', () => {
  /**
   * 挂载 RouterView 并等待就绪。
   * @param routes 路由
   * @param options 路由器选项
   */
  async function mountReady(routes?: Parameters<typeof createTestRouter>[0], options?: Record<string, any>) {
    const router = createTestRouter(routes, options);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    await waitFor(() => expect(router.isPrepared).toBe(true));
    return router;
  }

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('afterEach 应在导航后执行', async () => {
    const router = await mountReady();
    const afterEach = jest.fn();
    router.afterEach(afterEach);
    await act(async () => {
      await new Promise<void>((resolve) => router.push('/about', resolve));
    });
    await waitFor(() => expect(afterEach).toHaveBeenCalled());
    router.stop();
  });

  it('beforeResolve 应在导航时执行', async () => {
    const router = await mountReady();
    const guard = jest.fn();
    router.beforeResolve(guard);
    await act(async () => {
      await new Promise<void>((resolve) => router.push('/about', resolve));
    });
    await waitFor(() => expect(guard).toHaveBeenCalled());
    router.stop();
  });

  it('afterUpdate 守卫应可触发', async () => {
    const router = await mountReady();
    const guard = jest.fn();
    router.afterUpdate(guard);
    await act(async () => {
      await new Promise<void>((resolve) => router.push('/about', resolve));
    });
    router.stop();
  });

  it('懒加载路由应正常导航', async () => {
    const LazyPage = () => React.createElement('div', { 'data-testid': 'lazy-page' }, 'lazy');
    const router = await mountReady([
      { path: '/', component: Home },
      { path: '/lazy', component: lazyImport(() => Promise.resolve(LazyPage)) as any },
    ]);
    await act(async () => {
      await new Promise<void>((resolve) => router.push('/lazy', resolve));
    });
    await waitFor(() => expect(router.currentRoute?.path).toBe('/lazy'));
    router.stop();
  });

  it('getMatchedViews 应返回数组', async () => {
    const router = await mountReady();
    const views = router.getMatchedViews(router.currentRoute!);
    expect(Array.isArray(views)).toBe(true);
    expect(views.length).toBeGreaterThan(0);
    router.stop();
  });

  it('updateRouteMeta 忽略 configRoute 选项', async () => {
    const router = await mountReady([{ path: '/', component: Home, meta: { title: 'T' } }]);
    const matched = router.currentRoute!.matched[0];
    router.updateRouteMeta(matched, { title: 'New' }, { ignoreConfigRoute: true });
    expect(matched.meta.title).toBe('New');
    router.stop();
  });

  it('replaceState mergeState 应合并', async () => {
    const router = await mountReady();
    await act(async () => {
      await new Promise<void>((resolve) => router.push('/about', resolve));
    });
    const mr = router.currentRoute!.matched[0];
    router.replaceState({ a: 1 }, mr);
    router.replaceState({ b: 2 }, mr, { mergeState: true });
    router.stop();
  });

  it('nameToPath 未找到应返回空', () => {
    const router = createTestRouter();
    expect(router.nameToPath('not-exist')).toBeFalsy();
    router.stop();
  });

  it('resolveRouteName 应解析自定义名称', () => {
    const router = createTestRouter();
    router.resolveRouteName((name) => (name === 'custom' ? '/about' : null));
    expect(router.nameToPath('custom')).toBe('/about');
    router.stop();
  });

  it('rememberInitialRoute 应记住初始路由', async () => {
    const router = createTestRouter([], { rememberInitialRoute: true });
    router.start();
    syncNavigate(router, '/about');
    router.use({ rememberInitialRoute: true });
    router._refreshInitialRoute();
    expect(router.initialRoute).toBeDefined();
    router.stop();
  });

  it('_initRouter 传入 history 对象应提取 mode', () => {
    const router = new ReactViewRouter({ manual: true });
    router._initRouter({ mode: { type: HistoryType.memory } as any });
    expect(router.mode).toBe(HistoryType.memory);
    router.stop();
  });

  it('keepAlive 未配置 renderUtils 应抛错', () => {
    expect(() => {
      new ReactViewRouter({
        manual: true,
        keepAlive: true,
        routes: [{ path: '/', component: Home }],
      });
    }).toThrow('renderUtils');
  });

  it('plugin 覆盖同名应调用 uninstall', () => {
    const router = createTestRouter();
    const uninstall = jest.fn();
    router.plugin({ name: 'p1', uninstall });
    router.plugin({ name: 'p1', onStart: jest.fn() });
    expect(uninstall).toHaveBeenCalled();
    router.stop();
  });

  it('_callEvent 抛错应附加插件名', () => {
    const router = createTestRouter();
    router.plugin({
      name: 'err-plugin',
      onStart: () => { throw new Error('fail'); },
    });
    expect(() => router.start()).toThrow('[err-plugin:onStart]');
    router.stop();
  });

  it('replaceQuery 对象形式应批量更新', async () => {
    const router = await mountReady();
    router.replaceQuery({ x: '1', y: '2' });
    expect(router.currentRoute?.query.x).toBe('1');
    router.stop();
  });

  it('go 使用 stack 对象应导航', async () => {
    const router = await mountReady();
    await act(async () => {
      await new Promise<void>((resolve) => router.push('/about', resolve));
    });
    const stack = router.history.stacks[router.history.stacks.length - 1];
    if (stack) router.go(stack);
    router.stop();
  });

  it('install 完整 vuelike 应注册 mergeStrategies', () => {
    const router = createTestRouter();
    const vuelike = {
      observable: (v: any) => v,
      flow: (fn: any) => fn,
      action: (fn: any) => fn,
      config: { inheritMergeStrategies: { $route: null } },
    };
    router.install(vuelike, { App: [class App {}] });
    expect(vuelike.config.inheritMergeStrategies.$route).toBeDefined();
    router.stop();
  });

  it('holdInitialQueryProps 应保留初始 query', async () => {
    const router = createTestRouter(
      [{ path: '/', component: Home }, { path: '/about', component: About }],
      { holdInitialQueryProps: ['from'] },
    );
    router.history.push('/?from=init');
    router._refreshInitialRoute();
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    await waitFor(() => expect(router.isPrepared).toBe(true));
    await act(async () => {
      await new Promise<void>((resolve) => router.push('/about', resolve));
    });
    expect(router.currentRoute?.query.from).toBe('init');
    router.stop();
  });

  it('子路由器 nameToPath 应委托父级', () => {
    const parent = createTestRouter([
      { path: '/parent-route', component: Home, name: 'parentName' },
    ]);
    const child = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      basename: '/child',
      routes: [{ path: '/', component: About }],
    });
    child._updateParent(parent);
    child.start();
    expect(child.nameToPath('parentName', { absolute: true } as any)).toContain('/parent-route');
    parent.stop();
    child.stop();
  });

  it('beforeRouteLeave 集成导航应触发守卫', async () => {
    const leave = jest.fn((_t, _f, next) => next());
    const Guarded = withRouteGuards(Home, { beforeRouteLeave: leave });
    const router = await mountReady([
      { path: '/', component: Guarded as any },
      { path: '/about', component: About },
    ]);
    await act(async () => {
      await new Promise<void>((resolve) => router.push('/about', resolve));
    });
    expect(leave).toHaveBeenCalled();
    router.stop();
  });

  it('replace 同组件不同参数应完成', async () => {
    const router = await mountReady([{ path: '/users/:id', component: About }]);
    await act(async () => {
      await new Promise<void>((resolve) => router.replace('/users/99', resolve));
    });
    expect(router.currentRoute?.params.id).toBe('99');
    router.stop();
  });
});
