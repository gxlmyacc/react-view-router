import React from 'react';
import { render, waitFor, act, cleanup } from '@testing-library/react';
import { RouterViewComponent } from '../../src/router-view';
import { createTestRouter, renderWithRouter, syncNavigate, Home, About } from '../helpers/test-utils';
import { withRouteGuards } from '../../src/route-guard';

describe('Router 完整导航流', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  /**
   * 挂载 RouterView 并等待就绪。
   */
  async function mount(routes?: Parameters<typeof createTestRouter>[0]) {
    const router = createTestRouter(routes);
    syncNavigate(router, '/');
    renderWithRouter(React.createElement(RouterViewComponent, { router }), router);
    await waitFor(() => expect(router.viewRoot).toBeTruthy());
    await waitFor(() => expect(router.isPrepared).toBe(true));
    return router;
  }

  it('push 带 query 应更新', async () => {
    const router = await mount();
    await act(async () => {
      await new Promise<void>(resolve => router.push('/about?tab=1', resolve));
    });
    expect(router.currentRoute?.query.tab).toBe('1');
    router.stop();
  });

  it('replace 应替换路由', async () => {
    const router = await mount();
    await act(async () => {
      await new Promise<void>(resolve => router.replace('/users/1', resolve));
    });
    expect(router.currentRoute?.path).toBe('/users/1');
    router.stop();
  });

  it('组件守卫 beforeRouteEnter 应执行', async () => {
    const enter = jest.fn((_t, _f, next) => next());
    const Guarded = withRouteGuards(About, { beforeRouteEnter: enter });
    const router = await mount([
      { path: '/', component: Home },
      { path: '/g', component: Guarded as any },
    ]);
    await act(async () => {
      await new Promise<void>(resolve => router.push('/g', resolve));
    });
    expect(enter).toHaveBeenCalled();
    router.stop();
  });

  it('redirect 路由应跳转', async () => {
    const router = await mount([
      { path: '/', component: Home },
      { path: '/redir', redirect: '/about' },
      { path: '/about', component: About },
    ]);
    await act(async () => {
      await new Promise<void>(resolve => router.push('/redir', resolve));
    });
    await waitFor(() => expect(router.currentRoute?.path).toBe('/about'));
    router.stop();
  });

  it('updateRouteMeta 应更新 meta', async () => {
    const router = await mount([{ path: '/', component: Home, meta: { t: 'a' } }]);
    router.updateRouteMeta(router.currentRoute!.matched[0], { t: 'b' });
    expect(router.currentRoute!.matched[0].meta.t).toBe('b');
    router.stop();
  });

  it('afterEach 全局守卫应执行', async () => {
    const router = await mount();
    const afterEach = jest.fn();
    router.afterEach(afterEach);
    await act(async () => {
      await new Promise<void>(resolve => router.push('/about', resolve));
    });
    await waitFor(() => expect(afterEach).toHaveBeenCalled());
    router.stop();
  });

  it('push 按 name 括号语法应导航', async () => {
    const router = await mount([
      { path: '/', component: Home },
      { path: '/named', component: About, name: 'aboutPage' },
    ]);
    await act(async () => {
      await new Promise<void>(resolve => router.push('[aboutPage]', resolve));
    });
    expect(router.currentRoute?.path).toBe('/named');
    router.stop();
  });

  it('replaceQuery 单 key 应更新', async () => {
    const router = await mount();
    router.replaceQuery('k', 'v');
    expect(router.currentRoute?.query.k).toBe('v');
    router.stop();
  });
});
