import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import ReactViewRouter, { RouterViewComponent } from '../src';
import { HistoryType } from '../src/history';
import { lazyImport } from '../src/route-lazy';
import { RouteRuntimeAdapter } from '../src/route-runtime';
import renderUtils from '../dom/src';

const Home = () => <div>Home</div>;
const BrowserPage = () => <div>Browser</div>;
const FrameworkBridge = () => <div>Framework bridge</div>;

async function mountRouter() {
  const router = new ReactViewRouter({
    manual: true,
    mode: HistoryType.memory,
    renderUtils,
    routes: [
      { path: '/', component: Home, exact: true },
      { path: '/browser', component: BrowserPage },
      {
        path: '/framework',
        component: lazyImport(() => Promise.resolve(FrameworkBridge), {
          hydrate: { owner: 'framework', runtime: 'gateway-test' },
        }),
      },
    ],
  });
  router.start();
  const view = render(<RouterViewComponent router={router} />);
  await waitFor(() => expect(router.isPrepared).toBe(true));
  return { router, view };
}

describe('framework navigation history gateway', () => {
  it('treats synchronized framework hrefs as absolute when a child router has a basename', () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [
        { path: '/', component: Home },
        { path: '/details', component: BrowserPage },
      ],
    });
    router.basename = '/dashboard/';
    router.basenameNoSlash = '/dashboard';
    router.start();

    router.syncRouteRuntimeLocation('/dashboard/details?tab=one');

    expect(router.currentRoute?.path).toBe('/details');
    expect(router.currentRoute?.query).toEqual({ tab: 'one' });
    router.stop();
  });

  it('runs guards in framework-owned headless mode without mounting RouterView', async () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [
        { path: '/', component: Home, exact: true },
        {
          path: '/framework',
          component: lazyImport(() => Promise.resolve(FrameworkBridge), {
            hydrate: { owner: 'framework', runtime: 'gateway-test' },
          }),
        },
      ],
    });
    const adapter: RouteRuntimeAdapter = {
      name: 'gateway-test',
      owner: 'framework',
      canHandle: () => true,
      activate: jest.fn(),
      navigate: jest.fn(() => ({ status: 'committed' })),
    };
    router.registerRouteRuntimeAdapter(adapter);
    router.beforeEach((_to, _from, next) => next(false));
    router.start();

    await expect(router.push('/framework', undefined, jest.fn())).rejects.toBe(false);

    expect(adapter.navigate).not.toHaveBeenCalled();
    expect(router.history.location.pathname).toBe('/');
    router.stop();
  });

  it('delegates accepted framework navigation in headless mode without committing ReactView history', async () => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [
        { path: '/', component: Home, exact: true },
        {
          path: '/framework',
          component: lazyImport(() => Promise.resolve(FrameworkBridge), {
            hydrate: { owner: 'framework', runtime: 'gateway-test' },
          }),
        },
      ],
    });
    const adapter: RouteRuntimeAdapter = {
      name: 'gateway-test',
      owner: 'framework',
      canHandle: () => true,
      activate: jest.fn(),
      navigate: jest.fn(() => ({ status: 'committed' })),
    };
    router.registerRouteRuntimeAdapter(adapter);
    router.start();

    await expect(new Promise((resolve, reject) => {
      router.push('/framework', resolve, reject);
    })).resolves.toBe(false);

    expect(adapter.navigate).toHaveBeenCalledTimes(1);
    expect(router.history.location.pathname).toBe('/');
    router.stop();
  });

  it('runs guards before delegation and prevents a duplicate ReactView history commit', async () => {
    const { router, view } = await mountRouter();
    const calls: string[] = [];
    router.beforeEach((_to, _from, next) => {
      calls.push('guard');
      next();
    });
    const adapter: RouteRuntimeAdapter = {
      name: 'gateway-test',
      owner: 'framework',
      canHandle: (context) => context.descriptor.runtime === 'gateway-test',
      activate: jest.fn(),
      navigate: jest.fn(() => {
        calls.push('adapter');
        return { status: 'committed' };
      }),
    };
    const unregister = router.registerRouteRuntimeAdapter(adapter);

    await act(async () => {
      await new Promise((resolve, reject) => {
        router.push('/framework', resolve, reject);
      });
    });

    expect(calls).toEqual(['guard', 'adapter']);
    expect(adapter.navigate).toHaveBeenCalledTimes(1);
    expect(router.history.location.pathname).toBe('/');
    expect(router.currentRoute?.path).toBe('/');

    const refresh = jest.spyOn(router.history, 'refresh');
    await act(async () => router.syncRouteRuntimeLocation(router.createRoute('/framework')));
    await waitFor(() => expect(router.currentRoute?.path).toBe('/framework'));
    expect(refresh).toHaveBeenCalledTimes(1);
    unregister();
    view.unmount();
    router.stop();
  });

  it('keeps ordinary browser-owned navigation on the existing history path', async () => {
    const { router, view } = await mountRouter();
    const adapter: RouteRuntimeAdapter = {
      name: 'gateway-test',
      owner: 'framework',
      canHandle: () => true,
      activate: jest.fn(),
      navigate: jest.fn(() => ({ status: 'committed' })),
    };
    router.registerRouteRuntimeAdapter(adapter);

    await act(async () => {
      await new Promise((resolve, reject) => {
        router.push('/browser', resolve, reject);
      });
    });
    await waitFor(() => expect(router.currentRoute?.path).toBe('/browser'));

    expect(router.history.location.pathname).toBe('/browser');
    expect(adapter.navigate).not.toHaveBeenCalled();
    view.unmount();
    router.stop();
  });

  it('does not delegate when a ReactView guard rejects navigation', async () => {
    const { router, view } = await mountRouter();
    const adapter: RouteRuntimeAdapter = {
      name: 'gateway-test',
      owner: 'framework',
      canHandle: () => true,
      activate: jest.fn(),
      navigate: jest.fn(() => ({ status: 'committed' })),
    };
    router.registerRouteRuntimeAdapter(adapter);
    router.beforeEach((_to, _from, next) => next(false));

    await expect(router.push('/framework', undefined, jest.fn())).rejects.toBe(false);
    expect(adapter.navigate).not.toHaveBeenCalled();
    expect(router.history.location.pathname).toBe('/');
    view.unmount();
    router.stop();
  });
});
