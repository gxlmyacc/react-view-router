import React from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import ReactViewRouter, { RouterViewComponent, withRouteGuards } from '../src';
import { HistoryType } from '../src/history';
import renderUtils from '../dom/src';

const HostHome = () => <div>Host home</div>;
const HostMiddle = () => <div>Host middle</div>;
const MiddlePage = () => <div>Middle page</div>;

function push(router: ReactViewRouter, path: string) {
  return new Promise((resolve, reject) => {
    // ReactViewRouter reports through both callbacks and its returned Promise.
    // This helper asserts the callback-facing public contract and consumes the
    // duplicate rejection from the returned Promise.
    router.push(path, resolve, reject).catch(() => undefined);
  });
}

async function mountRouter(router: ReactViewRouter) {
  const view = render(<RouterViewComponent router={router} />);
  await waitFor(() => expect(router.isPrepared).toBe(true));
  return view;
}

async function mountHostAndMiddle(middleBeforeLeave?: (...args: any[]) => any) {
  const host = new ReactViewRouter({
    manual: true,
    mode: HistoryType.memory,
    renderUtils,
    routes: [
      { path: '/', exact: true, component: HostHome },
      { path: '/middle/a', component: HostMiddle },
      { path: '/middle/b', component: HostMiddle },
      { path: '/target/a', component: HostMiddle },
    ],
  });
  host.start();

  const middle = new ReactViewRouter({
    manual: true,
    mode: host.history,
    basename: '/middle',
    renderUtils,
    routes: [
      { path: '/a', component: MiddlePage, beforeLeave: middleBeforeLeave },
      { path: '/b', component: MiddlePage },
    ],
  });
  middle.start();

  const view = render(
    <>
      <RouterViewComponent router={host} />
      <RouterViewComponent router={middle} />
    </>,
  );
  await waitFor(() => {
    expect(host.isPrepared).toBe(true);
    expect(middle.isPrepared).toBe(true);
  });

  return { host, middle, view };
}

describe('route guard behavior contracts', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('runs the successful guard pipeline in order', async () => {
    const calls: string[] = [];
    const GuardedPage = withRouteGuards(MiddlePage, {
      beforeRouteEnter: (_to, _from, next) => {
        calls.push('route:beforeEnter');
        next();
      },
      beforeRouteResolve: () => calls.push('route:beforeResolve'),
    });
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      renderUtils,
      routes: [
        { path: '/', exact: true, component: HostHome },
        {
          path: '/guarded',
          component: GuardedPage,
          beforeResolve: () => calls.push('route-config:beforeResolve'),
        },
      ],
    });
    router.start();
    const view = await mountRouter(router);
    router.beforeEach((_to, _from, next) => {
      calls.push('router:beforeEach:1');
      next();
    });
    router.beforeEach((_to, _from, next) => {
      calls.push('router:beforeEach:2');
      next();
    });
    router.beforeResolve(() => calls.push('router:beforeResolve'));
    router.afterEach(() => calls.push('router:afterEach'));

    await act(async () => {
      await push(router, '/guarded');
    });
    await waitFor(() => expect(calls).toContain('router:afterEach'));

    expect(calls).toEqual([
      'router:beforeEach:1',
      'router:beforeEach:2',
      'route:beforeEnter',
      'router:beforeResolve',
      'route-config:beforeResolve',
      'route:beforeResolve',
      'router:afterEach',
    ]);
    expect(router.currentRoute?.path).toBe('/guarded');

    view.unmount();
    router.stop();
  });

  it('short-circuits later guards and leaves route state unchanged after rejection', async () => {
    const calls: string[] = [];
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      renderUtils,
      routes: [
        { path: '/', exact: true, component: HostHome },
        { path: '/blocked', component: MiddlePage },
      ],
    });
    router.start();
    const view = await mountRouter(router);
    router.beforeEach((_to, _from, next) => {
      calls.push('before:allow');
      next();
    });
    router.beforeEach((_to, _from, next) => {
      calls.push('before:block');
      next(false);
    });
    router.beforeEach((_to, _from, next) => {
      calls.push('before:must-not-run');
      next();
    });
    router.beforeResolve(() => calls.push('resolve:must-not-run'));
    router.afterEach(() => calls.push('after:must-not-run'));

    await expect(push(router, '/blocked')).rejects.toBe(false);

    expect(calls).toEqual(['before:allow', 'before:block']);
    expect(router.history.location.pathname).toBe('/');
    expect(router.currentRoute?.path).toBe('/');

    view.unmount();
    router.stop();
  });

  it('aborts before commit when a beforeResolve guard throws', async () => {
    const error = new Error('resolve failed');
    const onError = jest.fn();
    const afterEach = jest.fn();
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      renderUtils,
      routes: [
        { path: '/', exact: true, component: HostHome },
        { path: '/broken', component: MiddlePage },
      ],
    });
    router.start();
    const view = await mountRouter(router);
    router.beforeResolve(() => {
      throw error;
    });
    router.afterEach(afterEach);
    router.onError(onError);

    await expect(push(router, '/broken')).rejects.toBe(false);

    expect(onError).toHaveBeenCalledWith(error);
    expect(afterEach).not.toHaveBeenCalled();
    expect(router.history.location.pathname).toBe('/');
    expect(router.currentRoute?.path).toBe('/');

    view.unmount();
    router.stop();
  });
});

describe('host and middle-platform routers sharing one history', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('commits only after both routers allow the navigation', async () => {
    const { host, middle, view } = await mountHostAndMiddle();
    const calls: string[] = [];
    host.beforeEach((to, from, next) => {
      calls.push(`host:before:${from?.path}->${to.path}`);
      next();
    });
    middle.beforeEach((to, from, next) => {
      calls.push(`middle:before:${from?.path}->${to.path}`);
      next();
    });
    host.afterEach(() => calls.push('host:after'));
    middle.afterEach(() => calls.push('middle:after'));

    await act(async () => {
      await push(host, '/middle/a');
    });
    await waitFor(() => expect(calls).toContain('middle:after'));

    expect(calls).toEqual([
      'host:before:/->/middle/a',
      'middle:before:->/a',
      'host:after',
      'middle:after',
    ]);
    expect(host.history).toBe(middle.history);
    expect(middle.parent).toBe(host);
    expect(host.currentRoute?.path).toBe('/middle/a');
    expect(middle.currentRoute?.path).toBe('/a');

    view.unmount();
    middle.stop();
    host.stop();
  });

  it('aborts the whole transaction when the host router rejects first', async () => {
    const { host, middle, view } = await mountHostAndMiddle();
    const calls: string[] = [];
    host.beforeEach((_to, _from, next) => {
      calls.push('host:before:block');
      next(false);
    });
    middle.beforeEach((_to, _from, next) => {
      calls.push('middle:before:must-not-run');
      next();
    });
    host.afterEach(() => calls.push('host:after:must-not-run'));
    middle.afterEach(() => calls.push('middle:after:must-not-run'));

    await expect(push(host, '/middle/a')).rejects.toBe(false);

    expect(calls).toEqual(['host:before:block']);
    expect(host.history.location.pathname).toBe('/');
    expect(host.currentRoute?.path).toBe('/');
    expect(middle.currentRoute?.path).toBe('');

    view.unmount();
    middle.stop();
    host.stop();
  });

  it('rolls back the host decision when the middle router rejects later', async () => {
    const { host, middle, view } = await mountHostAndMiddle();
    const calls: string[] = [];
    host.beforeEach((_to, _from, next) => {
      calls.push('host:before:allow');
      next();
    });
    middle.beforeEach((_to, _from, next) => {
      calls.push('middle:before:block');
      next(false);
    });
    host.afterEach(() => calls.push('host:after:must-not-run'));
    middle.afterEach(() => calls.push('middle:after:must-not-run'));

    await expect(push(host, '/middle/a')).rejects.toBe(false);

    expect(calls).toEqual(['host:before:allow', 'middle:before:block']);
    expect(host.history.location.pathname).toBe('/');
    expect(host.currentRoute?.path).toBe('/');
    expect(middle.currentRoute?.path).toBe('');

    view.unmount();
    middle.stop();
    host.stop();
  });

  it('keeps the middle router mounted and runs both pipelines between middle pages', async () => {
    const { host, middle, view } = await mountHostAndMiddle();
    await act(async () => {
      await push(host, '/middle/a');
    });

    const middleView = middle.viewRoot;
    const calls: string[] = [];
    host.beforeEach((_to, _from, next) => {
      calls.push('host:before');
      next();
    });
    middle.beforeEach((_to, _from, next) => {
      calls.push('middle:before');
      next();
    });
    host.afterEach(() => calls.push('host:after'));
    middle.afterEach(() => calls.push('middle:after'));

    await act(async () => {
      await push(middle, '/b');
    });
    await waitFor(() => expect(calls).toContain('middle:after'));

    expect(calls).toEqual(['host:before', 'middle:before', 'host:after', 'middle:after']);
    expect(middle.viewRoot).toBe(middleView);
    expect(middle.viewRoot?._isMounted).toBe(true);
    expect(host.currentRoute?.path).toBe('/middle/b');
    expect(middle.currentRoute?.path).toBe('/b');

    view.unmount();
    middle.stop();
    host.stop();
  });

  it('lets the active middle router veto navigation back to a host page', async () => {
    const calls: string[] = [];
    const { host, middle, view } = await mountHostAndMiddle((_to, _from, next) => {
      calls.push('middle:route-beforeLeave:block');
      next(false);
    });
    await act(async () => {
      await push(host, '/middle/a');
    });
    expect(middle.currentRoute?.matched[0].guards.beforeLeave).toHaveLength(1);

    host.beforeEach((_to, _from, next) => {
      calls.push('host:before:allow');
      next();
    });
    middle.beforeEach((to, from, next) => {
      calls.push(`middle:before:allow:${from?.path}->${to.path}`);
      next();
    });
    host.afterEach(() => calls.push('host:after:must-not-run'));
    middle.afterEach(() => calls.push('middle:after:must-not-run'));

    await expect(push(host, '/')).rejects.toBe(false);

    expect(calls).toEqual([
      'host:before:allow',
      'middle:before:allow:/a->',
      'middle:route-beforeLeave:block',
    ]);
    expect(host.history.location.pathname).toBe('/middle/a');
    expect(host.currentRoute?.path).toBe('/middle/a');
    expect(middle.currentRoute?.path).toBe('/a');

    view.unmount();
    middle.stop();
    host.stop();
  });

  it('runs the leaving and entering middle-platform routers in one transaction', async () => {
    const { host, middle, view } = await mountHostAndMiddle();
    await act(async () => {
      await push(host, '/middle/a');
    });

    const target = new ReactViewRouter({
      manual: true,
      mode: host.history,
      basename: '/target',
      renderUtils,
      routes: [{ path: '/a', component: MiddlePage }],
    });
    target.start();
    view.rerender(
      <>
        <RouterViewComponent router={host} />
        <RouterViewComponent router={middle} />
        <RouterViewComponent router={target} />
      </>,
    );
    await waitFor(() => expect(target.isPrepared).toBe(true));

    const calls: string[] = [];
    host.beforeEach((_to, _from, next) => {
      calls.push('host:before');
      next();
    });
    middle.beforeEach((to, from, next) => {
      calls.push(`middle:leave:${from?.path}->${to.path}`);
      next();
    });
    target.beforeEach((to, from, next) => {
      calls.push(`target:enter:${from?.path}->${to.path}`);
      next();
    });
    host.afterEach(() => calls.push('host:after'));
    middle.afterEach(() => calls.push('middle:after'));
    target.afterEach(() => calls.push('target:after'));

    await act(async () => {
      await push(host, '/target/a');
    });
    await waitFor(() => expect(calls).toContain('target:after'));

    expect(calls).toEqual([
      'host:before',
      'middle:leave:/a->',
      'target:enter:->/a',
      'host:after',
      'middle:after',
      'target:after',
    ]);
    expect(host.currentRoute?.path).toBe('/target/a');
    expect(middle.currentRoute?.path).toBe('');
    expect(target.currentRoute?.path).toBe('/a');
    expect(target.viewRoot?._isMounted).toBe(true);

    view.unmount();
    target.stop();
    middle.stop();
    host.stop();
  });
});
