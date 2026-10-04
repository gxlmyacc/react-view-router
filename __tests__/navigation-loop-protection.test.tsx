import React, { useEffect } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { RouterView } from '../src';
import { HistoryType } from '../src/history';
import NavigationLoopProtection from '../src/navigation-loop-protection';
import { createTestRouter, Home } from './helpers/test-utils';

function prepare(router: ReturnType<typeof createTestRouter>) {
  router.viewRoot = {
    state: { inited: true }, _isMounted: true, props: {}, _refreshCurrentRoute: jest.fn(),
  } as any;
  router.currentRoute = router.createRoute('/');
  return router;
}

describe('navigation loop protection', () => {
  afterEach(() => jest.restoreAllMocks());

  it('detects the tenth attempt, clears every path and expires records at the exact boundary', () => {
    let time = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => time);
    const protection = new NavigationLoopProtection();
    protection.configure();
    for (let i = 0; i < 9; i += 1) expect(protection.check('/A')).toBeUndefined();
    expect(protection.check('/B')).toBeUndefined();
    expect(protection.check('/A')).toMatchObject({
      code: 'NAVIGATION_LOOP_DETECTED', pathname: '/A', windowMs: 1000, maxVisits: 10,
    });
    for (let i = 0; i < 9; i += 1) expect(protection.check('/B')).toBeUndefined();
    time = 1000;
    expect(protection.check('/B')).toBeUndefined();
    expect(protection.check('')).toBeUndefined();
  });

  it.each([
    { windowMs: 0 }, { windowMs: -1 }, { windowMs: Infinity }, { windowMs: NaN },
    { maxVisits: 0 }, { maxVisits: -1 }, { maxVisits: 1.5 }, { maxVisits: Infinity },
    { maxVisits: NaN }, { windowMs: '1000' }, { maxVisits: '10' },
  ])('rejects invalid configuration %p at initialization', (navigationLoopProtection) => {
    expect(() => createTestRouter([], { navigationLoopProtection })).toThrow('navigationLoopProtection');
  });

  it('supports custom limits and disabling protection', () => {
    const protection = new NavigationLoopProtection();
    protection.configure({ maxVisits: 1, windowMs: 50 });
    expect(protection.check('/A')).toMatchObject({ maxVisits: 1, windowMs: 50 });
    protection.configure(false);
    for (let i = 0; i < 20; i += 1) expect(protection.check('/A')).toBeUndefined();
  });

  it.each(['config', 'guard'])('settles a %s redirect cycle once and recovers immediately', async (kind) => {
    const routes = [{ path: '/', component: Home }, ...['A', 'B', 'C'].map((name, i) => ({
      path: `/${name}`,
      component: Home,
      exact: true,
      ...(kind === 'config' ? { redirect: `/${['B', 'C', 'A'][i]}` } : {}),
    }))];
    const router = prepare(createTestRouter(routes));
    if (kind === 'guard') router.beforeEach((to, _from, next) => {
      const target: Record<string, string> = { '/A': '/B', '/B': '/C', '/C': '/A' };
      next(target[to.path]);
    });
    const error = jest.fn();
    const abort = jest.fn();
    const pluginAbort = jest.fn();
    router.onError(error);
    router.plugin({ onRouteAbort: pluginAbort });
    const complete = jest.fn();
    await router.push('/A', complete, abort);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0]).toMatchObject({ code: 'NAVIGATION_LOOP_DETECTED', pathname: '/A' });
    expect(complete).toHaveBeenCalledTimes(1);
    expect(abort).not.toHaveBeenCalled();
    expect(pluginAbort).not.toHaveBeenCalled();
    expect(router.history.location.pathname).toBe('/A');
    expect(router.currentRoute!.path).toBe('/A');
    if (kind === 'config') expect(router.routes.find((route) => route.path === '/A')!.redirect).toBe('/B');
    await router.push('/A');
    expect(router.currentRoute!.path).toBe('/A');
    expect(error).toHaveBeenCalledTimes(kind === 'config' ? 2 : 1);
    await router.push('/');
    expect(router.currentRoute!.path).toBe('/');
    router.stop();
  });

  it('counts query changes together, keeps concrete paths and instances separate, and clears on restart', async () => {
    const router = prepare(createTestRouter());
    const other = prepare(createTestRouter());
    for (let i = 0; i < 9; i += 1) await router.replace(`/about?n=${i}`);
    await other.push('/about');
    const error = jest.fn();
    router.onError(error);
    await router.replace('/about?n=9');
    expect(error).toHaveBeenCalledTimes(1);
    expect(router.history.location.search).toBe('?n=9');
    await router.replace('/about?n=10');
    expect(error).toHaveBeenCalledTimes(1);
    for (let i = 0; i < 15; i += 1) await router.push(`/users/${i}`);
    expect(error).toHaveBeenCalledTimes(1);
    router.stop();
    router.start();
    prepare(router);
    await router.push('/about');
    router.stop();
    other.stop();
  });

  it('enters the target of an initial redirect cycle and becomes ready for new navigation', async () => {
    const router = createTestRouter([
      { path: '/', component: Home, exact: true, redirect: '/A' },
      { path: '/A', component: Home, exact: true, redirect: '/B' },
      { path: '/B', component: Home, exact: true, redirect: '/C' },
      { path: '/C', component: Home, exact: true, redirect: '/A' },
      { path: '/safe', component: Home },
    ], { pathname: '/' });
    const error = jest.fn();
    router.onError(error);
    const view = render(<RouterView router={router} />);
    await waitFor(() => expect(error).toHaveBeenCalledTimes(1));
    expect(router.history.location.pathname).toBe('/A');
    expect(view.getByTestId('home')).toBeInTheDocument();
    await act(async () => { await router.push('/safe'); });
    expect(router.currentRoute!.path).toBe('/safe');
    view.unmount();
    router.stop();
  });

  it('stops a redirect chain started by a component effect and allows new navigation', async () => {
    const router = createTestRouter();
    const error = jest.fn();
    router.onError(error);
    function StartPage() {
      useEffect(() => { router.push('/A').catch(() => undefined); }, []);
      return <div>Start</div>;
    }
    router.use({
      routes: [
        { path: '/', component: Home },
        { path: '/start', component: StartPage },
        ...['A', 'B', 'C'].map((name, i) => ({
          path: `/${name}`, component: Home, exact: true, redirect: `/${['B', 'C', 'A'][i]}`,
        })),
      ],
    });
    const view = render(<RouterView router={router} />);
    await waitFor(() => expect(router.viewRoot!.state.inited).toBe(true));
    await act(async () => { await router.push('/start'); });
    await waitFor(() => expect(error).toHaveBeenCalledTimes(1));
    expect(router.currentRoute!.path).toBe('/A');
    await act(async () => { await router.push('/'); });
    expect(router.currentRoute!.path).toBe('/');
    view.unmount();
    router.stop();
  });

  it('still runs subsequent guards and preserves rejection decisions at the threshold', async () => {
    const router = prepare(createTestRouter(undefined, { navigationLoopProtection: { maxVisits: 1 } }));
    const afterRedirect = jest.fn((_to, _from, next) => next(false));
    router.beforeEach((_to, _from, next) => next('/users/1'));
    router.beforeEach(afterRedirect);
    await expect(router.push('/about')).rejects.toBe(false);
    expect(afterRedirect).toHaveBeenCalledTimes(1);
    expect(router.currentRoute!.path).toBe('/');
    router.stop();
  });

  it('ignores navigation outside a basename and allows new navigation after a detected loop', async () => {
    const router = prepare(createTestRouter(undefined, { basename: '/app', navigationLoopProtection: { maxVisits: 2 } }));
    const error = jest.fn();
    router.onError(error);
    for (let i = 0; i < 4; i += 1) {
      await new Promise<void>((resolve) => {
        const target = router._normalizeLocation({ pathname: '/outside', absolute: true })!;
        router._internalHandleRouteInterceptor(target, () => resolve());
      });
    }
    expect(error).not.toHaveBeenCalled();
    router.stop();
  });

  it.each([HistoryType.browser, HistoryType.hash])('enters the POP target at the threshold in %s mode', async (mode) => {
    window.history.replaceState({ idx: 0 }, '', mode === HistoryType.hash ? '/#/' : '/');
    const router = prepare(createTestRouter(undefined, {
      mode, navigationLoopProtection: { maxVisits: 2 },
    }));
    const error = jest.fn();
    router.onError(error);
    try {
      await router.push('/about');
      await router.push('/users/1');
      router.back();
      await waitFor(() => expect(router.currentRoute!.path).toBe('/about'));
      expect(error).toHaveBeenCalledTimes(1);
      expect(router.history.location.pathname).toBe('/about');
      router.forward();
      await waitFor(() => expect(router.currentRoute!.path).toBe('/users/1'));
      expect(error).toHaveBeenCalledTimes(1);
    } finally {
      router.stop();
    }
  });
});
