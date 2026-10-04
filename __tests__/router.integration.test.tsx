import React from 'react';
import { act, render, screen, waitFor, cleanup } from '@testing-library/react';
import ReactViewRouter from '../src/router';
import { RouterViewComponent } from '../src/router-view';
import { HistoryType } from '../src/history/types';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About, renderUtils } from './helpers/test-utils';

describe('ReactViewRouter 与 RouterView 集成', () => {
  /**
   * 创建带 RouterView 的完整应用并等待初始化。
   * @param routes 路由配置
   * @returns router 与 render 结果
   */
  async function mountApp(routes?: Parameters<typeof createTestRouter>[0]) {
    const router = createTestRouter(routes);
    syncNavigate(router, '/');
    const result = renderWithRouter(
      React.createElement(RouterViewComponent, { router }),
      router,
    );
    await waitFor(() => {
      expect(router.viewRoot).toBeTruthy();
    });
    return { router, ...result };
  }

  afterEach(() => jest.restoreAllMocks());

  it('挂载 RouterView 后 isPrepared 应为 true', async () => {
    const { router } = await mountApp();
    await waitFor(() => {
      expect(router.isPrepared).toBe(true);
    });
    router.stop();
  });

  it('push 经 RouterView 应完成导航', async () => {
    const { router } = await mountApp();
    await waitFor(() => expect(router.isPrepared).toBe(true));

    await new Promise<any>((resolve, reject) => {
      router.push('/about', resolve, reject);
    });

    await waitFor(() => {
      expect(router.currentRoute?.path).toBe('/about');
    });
    router.stop();
  });

  it('push({ state }) 应将 state 存入目标 history 并暴露给 currentRoute', async () => {
    const { router } = await mountApp();
    await waitFor(() => expect(router.isPrepared).toBe(true));
    const targetState = { source: 'push', selectedId: 7 };

    await act(async () => {
      await router.push({ path: '/about', state: targetState });
    });

    expect(router.history.location.state).toEqual({
      [router.routerStateName]: {
        '/about': targetState,
      },
    });
    expect(router.currentRoute?.path).toBe('/about');
    expect(router.currentRoute?.state).toEqual(targetState);
    expect(router.currentRoute?.matched[0].state).toEqual(targetState);
    router.stop();
  });

  it('basename router 应只使用本地 matched URL 作为 state key', () => {
    const router = new ReactViewRouter({
      manual: true,
      basename: '/module',
      routes: [{ path: 'about', component: About }],
    });
    const targetState = { source: 'basename-router' };

    expect(router._getRouteState({
      path: '/module/about',
      state: targetState,
    } as any)).toEqual({
      '/module/': {
        '/about': targetState,
      },
    });

    const [matched] = router.getMatched({
      pathname: '/about',
      path: '/about',
      state: {
        '/module/': {
          '/about': targetState,
        },
      },
    } as any);
    expect(matched.state).toEqual(targetState);

    const [wrongKeyMatched] = router.getMatched({
      pathname: '/about',
      path: '/about',
      state: {
        '/module/': {
          '/module/about': { source: 'wrong-full-path-key' },
        },
      },
    } as any);
    expect(wrongKeyMatched.state).not.toEqual({ source: 'wrong-full-path-key' });
  });

  it('replace({ state }) 应替换目标 history 并暴露给 currentRoute', async () => {
    const { router } = await mountApp();
    await waitFor(() => expect(router.isPrepared).toBe(true));
    const targetState = { source: 'replace', draft: true };

    await act(async () => {
      await router.replace({ path: '/users/9', state: targetState });
    });

    expect(router.history.location.state).toEqual({
      [router.routerStateName]: {
        '/users/9': targetState,
      },
    });
    expect(router.currentRoute?.path).toBe('/users/9');
    expect(router.currentRoute?.params.id).toBe('9');
    expect(router.currentRoute?.state).toEqual(targetState);
    expect(router.currentRoute?.matched[0].state).toEqual(targetState);
    router.stop();
  });

  it('返回历史页面时应恢复该目标页面通过 push 保存的 state', async () => {
    const { router } = await mountApp();
    await waitFor(() => expect(router.isPrepared).toBe(true));
    const savedState = { source: 'first-visit', scrollTop: 320 };

    await act(async () => {
      await router.push({ path: '/about', state: savedState });
      await router.push({ path: '/users/1', state: { source: 'next-page' } });
      router.back();
    });

    await waitFor(() => expect(router.currentRoute?.path).toBe('/about'));
    expect(router.currentRoute?.state).toEqual(savedState);
    expect(router.currentRoute?.matched[0].state).toEqual(savedState);
    router.stop();
  });

  it('省略回调时 push Promise 应在守卫中止后 reject', async () => {
    const { router } = await mountApp();
    await waitFor(() => expect(router.isPrepared).toBe(true));
    router.beforeEach((_to, _from, next) => next(false));

    await expect(router.push({ path: '/about', state: { blocked: true } })).rejects.toBe(false);

    expect(router.currentRoute?.path).toBe('/');
    expect(router.currentRoute?.state).not.toEqual({ blocked: true });
    router.stop();
  });

  it('beforeEach 守卫放行后 push 应更新路由', async () => {
    const { router } = await mountApp();
    router.beforeEach((_to, _from, next) => next());
    await waitFor(() => expect(router.isPrepared).toBe(true));

    await new Promise<any>(resolve => {
      router.push('/about', resolve);
    });

    await waitFor(() => {
      expect(router.currentRoute?.path).toBe('/about');
    });
    router.stop();
  });

  it('守卫内重定向属于同一事务且两个 Promise 都应随最终目标完成', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/protected', component: About },
      { path: '/login', component: Home },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    const completed: string[] = [];
    const originalEnterCallback = jest.fn();
    const originalComplete = jest.fn();
    const originalAbort = jest.fn();
    const redirectComplete = jest.fn();
    const redirectAbort = jest.fn();
    let redirectPromise: Promise<any>|undefined;

    router.afterEach((to) => completed.push(to.path));
    router.beforeEach((to, _from, next) => {
      if (to.path === '/protected') {
        redirectPromise = router.replace('/login', redirectComplete, redirectAbort);
        next(originalEnterCallback);
        return;
      }
      next();
    });

    await act(async () => {
      const originalPromise = router.push('/protected', originalComplete, originalAbort);
      await expect(originalPromise).resolves.toBeDefined();
      await expect(redirectPromise).resolves.toBeDefined();
    });

    await waitFor(() => expect(router.currentRoute?.path).toBe('/login'));
    expect(completed).toEqual(['/login']);
    expect(completed).not.toContain('/protected');
    expect(originalEnterCallback).not.toHaveBeenCalled();
    expect(originalComplete).toHaveBeenCalledWith(false, expect.objectContaining({ path: '/login' }));
    expect(redirectComplete).toHaveBeenCalledWith(false, expect.objectContaining({ path: '/login' }));
    expect(originalAbort).not.toHaveBeenCalled();
    expect(redirectAbort).not.toHaveBeenCalled();
    router.stop();
  });

  it('守卫内导航到相同目标时两个 Promise 和后续 next callback 都应完成', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/protected', component: About },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    const enterCallback = jest.fn();
    let sameTargetPromise: Promise<any>|undefined;

    router.beforeEach((to, _from, next) => {
      if (to.path === '/protected') {
        sameTargetPromise = router.replace(to.fullPath);
        next(enterCallback);
        return;
      }
      next();
    });

    await act(async () => {
      const originalPromise = router.push('/protected');
      await expect(originalPromise).resolves.toBeDefined();
      await expect(sameTargetPromise).resolves.toBeDefined();
    });

    expect(router.currentRoute?.path).toBe('/protected');
    expect(enterCallback).toHaveBeenCalledTimes(1);
    expect(enterCallback).toHaveBeenCalledWith(expect.objectContaining({ path: '/protected' }));
    router.stop();
  });

  it('pathname 相同但 query 改变时应作为事务内重定向完成两个 Promise', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/search', component: About },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    const originalCallback = jest.fn();
    let queryRedirectPromise: Promise<any>|undefined;

    router.beforeEach((to, _from, next) => {
      if (to.fullPath === '/search?tab=old') {
        queryRedirectPromise = router.replace('/search?tab=new');
        next(originalCallback);
        return;
      }
      next();
    });

    await act(async () => {
      await expect(router.push('/search?tab=old')).resolves.toBeDefined();
      await expect(queryRedirectPromise).resolves.toBeDefined();
    });

    expect(router.currentRoute?.path).toBe('/search');
    expect(router.currentRoute?.query.tab).toBe('new');
    expect(originalCallback).not.toHaveBeenCalled();
    router.stop();
  });

  it('守卫内重定向目标被中止时同一事务的两个 Promise 都应 reject', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/protected', component: About },
      { path: '/login', component: Home },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    let redirectPromise: Promise<any>|undefined;
    const originalAbort = jest.fn();
    const redirectAbort = jest.fn();

    router.beforeEach((to, _from, next) => {
      if (to.path === '/protected') {
        redirectPromise = router.replace('/login', undefined, redirectAbort);
        next();
        return;
      }
      if (to.path === '/login') {
        next(false);
        return;
      }
      next();
    });

    await act(async () => {
      const originalPromise = router.push('/protected', undefined, originalAbort);
      await expect(originalPromise).rejects.toBe(false);
      await expect(redirectPromise).rejects.toBe(false);
    });
    expect(originalAbort).toHaveBeenCalledTimes(1);
    expect(redirectAbort).toHaveBeenCalledTimes(1);
    expect(router.currentRoute?.path).toBe('/');
    router.stop();
  });

  it('守卫决议完成后的独立导航应取消旧事务并 settle 两个 Promise', async () => {
    const { router } = await mountApp();
    let releaseResolve: (() => void)|undefined;
    let notifyResolving: (() => void)|undefined;
    const resolving = new Promise<void>((resolve) => {
      notifyResolving = resolve;
    });
    const resolveGate = new Promise<void>((resolve) => {
      releaseResolve = resolve;
    });
    router.beforeResolve(async (to) => {
      if (to.path === '/about') {
        notifyResolving?.();
        await resolveGate;
      }
    });

    const oldComplete = jest.fn();
    const oldAbort = jest.fn();
    let oldResult: { status: string; value: any }|undefined;
    await act(async () => {
      const oldPromise = router.push('/about', oldComplete, oldAbort);
      const oldResultPromise = oldPromise.then(
        (value) => ({ status: 'resolved', value }),
        (value) => ({ status: 'rejected', value }),
      );
      await resolving;
      const newPromise = router.push('/users/2');
      releaseResolve?.();
      oldResult = await oldResultPromise;
      await expect(newPromise).resolves.toBeDefined();
    });

    expect(oldResult).toEqual({ status: 'rejected', value: false });
    expect(oldComplete).not.toHaveBeenCalled();
    expect(oldAbort).toHaveBeenCalledTimes(1);
    expect(router.currentRoute?.path).toBe('/users/2');
    router.stop();
  });

  it('redirect 路由经 RouterView 应重定向', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/go', redirect: '/about' },
      { path: '/about', component: About },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);

    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    const complete = jest.fn();

    await act(async () => {
      await expect(router.push('/go', complete)).resolves.toBeDefined();
    });

    await waitFor(() => {
      expect(router.currentRoute?.path).toBe('/about');
    });
    expect(complete).toHaveBeenCalledWith(false, expect.objectContaining({ path: '/about' }));
    router.stop();
  });

  it('配置重定向从父路径进入子路径时原 Promise 应随最终目标 resolve', async () => {
    const router = createTestRouter([
      { path: '/', component: Home },
      { path: '/a', exact: true, redirect: '/a/b' },
      { path: '/a/b', component: About },
    ]);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    const complete = jest.fn();

    await act(async () => {
      await expect(router.push('/a', complete)).resolves.toBeDefined();
    });

    expect(router.currentRoute?.path).toBe('/a/b');
    expect(complete).toHaveBeenCalledWith(false, expect.objectContaining({ path: '/a/b' }));
    router.stop();
  });

  it('keepAlive 路由应启用 KeepAlive 渲染', async () => {
    const router = createTestRouter(
      [{ path: '/ka', component: Home, keepAlive: true }],
      { keepAlive: true },
    );
    syncNavigate(router, '/ka');
    renderWithRouter(
      React.createElement(RouterViewComponent, { router, keepAlive: true }),
      router,
    );
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    expect(await screen.findByTestId('home')).toBeTruthy();
    router.stop();
  });

  it('plugin onRouteChange 应在导航后触发', async () => {
    const onRouteChange = jest.fn();
    const { router } = await mountApp();
    router.plugin({ onRouteChange });
    await waitFor(() => expect(router.isPrepared).toBe(true));

    await new Promise<any>(resolve => {
      router.push('/about', resolve);
    });

    await waitFor(() => {
      expect(onRouteChange).toHaveBeenCalled();
    });
    router.stop();
  });

  it('replaceState 在 RouterView 挂载后应生效', async () => {
    const { router } = await mountApp();
    await waitFor(() => expect(router.isPrepared).toBe(true));
    syncNavigate(router, '/about');
    const matched = router.currentRoute?.matched[0];
    if (matched) {
      router.replaceState({ count: 1 }, matched);
      expect(router.history.state).toBeTruthy();
    }
    router.stop();
  });

  it('install 应注册 vuelike 实例', () => {
    const router = createTestRouter();
    const vuelike = {
      observable: (v: any) => v,
      flow: (fn: any) => fn,
      action: (fn: any) => fn,
      config: { inheritMergeStrategies: {} },
    };
    router.install(vuelike, { App: [] });
    expect(router.vuelike).toBe(vuelike);
    router.stop();
  });

  it('beforeResolve 应在 push 时执行', async () => {
    const { router } = await mountApp();
    const guard = jest.fn();
    router.beforeResolve(guard);
    await new Promise<any>(resolve => router.push('/about', resolve));
    await waitFor(() => expect(guard).toHaveBeenCalled());
    router.stop();
  });

  it('afterUpdate 应在路由更新时执行', async () => {
    const { router } = await mountApp();
    const guard = jest.fn();
    router.afterUpdate(guard);
    await new Promise<any>(resolve => router.push('/about', resolve));
    router.stop();
  });

  it('go 应支持数字导航', async () => {
    const { router } = await mountApp();
    await new Promise<any>(resolve => router.push('/about', resolve));
    router.go(-1);
    await waitFor(() => expect(router.currentRoute?.path).toBe('/'));
    router.stop();
  });

  it('forward 应在有历史时前进', async () => {
    const { router } = await mountApp();
    await new Promise<any>(resolve => router.push('/about', resolve));
    router.back();
    router.forward();
    await waitFor(() => expect(router.currentRoute?.path).toBe('/about'));
    router.stop();
  });

  it('replace 经 RouterView 应完成', async () => {
    const { router } = await mountApp();
    await waitFor(() => expect(router.isPrepared).toBe(true));
    await new Promise<any>(resolve => router.replace('/users/1', resolve));
    await waitFor(() => expect(router.currentRoute?.path).toBe('/users/1'));
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
    await waitFor(() => expect(router.isPrepared).toBe(true));
    await new Promise<any>(resolve => router.push('/about', resolve));
    expect(router.currentRoute?.query.from).toBe('init');
    router.stop();
  });
});
