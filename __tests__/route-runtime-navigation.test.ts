import ReactViewRouter from '../src/router';
import { Action, HistoryType } from '../src/history';
import { lazyImport } from '../src/route-lazy';
import { RouteRuntimeAdapter } from '../src/route-runtime';
import {
  RouteRuntimeNavigationGateway,
  getFrameworkRouteRuntimeTarget,
} from '../src/route-runtime-navigation';

const Page = () => null;

function createRouter(component: any) {
  return new ReactViewRouter({
    manual: true,
    mode: HistoryType.memory,
    routes: [{ path: '/framework', component }],
  });
}

function createAdapter(navigate: RouteRuntimeAdapter['navigate']): RouteRuntimeAdapter {
  return {
    name: 'framework-test',
    owner: 'framework',
    canHandle: (context) => context.descriptor.runtime === 'test-framework',
    activate: jest.fn(),
    navigate,
  };
}

describe('RouteRuntimeNavigationGateway', () => {
  it('selects a framework RouteLazy and delegates push/replace', async () => {
    const lazy = lazyImport(() => Promise.resolve(Page), {
      hydrate: { owner: 'framework', runtime: 'test-framework' },
    });
    const router = createRouter(lazy);
    const gateway = new RouteRuntimeNavigationGateway();
    const navigate = jest.fn(() => ({ status: 'committed' as const }));
    const unregister = gateway.register(createAdapter(navigate));
    const route = router.createRoute('/framework');

    expect(router.isFrameworkRouteRuntime('/framework')).toBe(true);
    expect(router.isFrameworkRouteRuntime(route, 'test-framework')).toBe(true);
    expect(router.isFrameworkRouteRuntime(route, 'another-runtime')).toBe(false);
    expect(router.isFrameworkRouteRuntime('/missing')).toBe(false);

    await expect(gateway.navigate(route, Action.Push)).resolves.toEqual({ status: 'committed' });
    await expect(gateway.navigate(route, Action.Replace)).resolves.toEqual({ status: 'committed' });
    expect(navigate.mock.calls.map((call) => call[0].action)).toEqual(['push', 'replace']);
    expect(navigate.mock.calls[0][0].to).toBe(route);

    unregister();
    unregister();
    expect(gateway.navigate(route, Action.Push)).toBeNull();
  });

  it('supports named views and ignores browser-owned, plain and pop routes', async () => {
    const framework = lazyImport(() => Page, {
      hydrate: { owner: 'framework', runtime: 'test-framework' },
    });
    const browser = lazyImport(() => Page, { hydrate: { owner: 'browser' } });
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      routes: [
        { path: '/named', components: { header: Page, sidebar: framework } },
        { path: '/browser', component: browser },
        { path: '/plain', component: Page },
      ],
    });
    const gateway = new RouteRuntimeNavigationGateway();
    const adapter = createAdapter(() => ({ status: 'delegated' }));
    gateway.register(adapter);

    await expect(gateway.navigate(router.createRoute('/named'), Action.Push))
      .resolves.toEqual({ status: 'delegated' });
    expect(gateway.navigate(router.createRoute('/browser'), Action.Push)).toBeNull();
    expect(gateway.navigate(router.createRoute('/plain'), Action.Push)).toBeNull();
    expect(gateway.navigate(router.createRoute('/named'), Action.Pop)).toBeNull();
  });

  it('supports a direct RouteLazy component shape and skips adapters without navigation', async () => {
    const lazy = lazyImport(() => Page, {
      hydrate: { owner: 'framework', runtime: 'test-framework' },
    });
    const router = createRouter(lazy);
    const route = router.createRoute('/framework');
    route.matched[0].config.components = lazy as any;
    const gateway = new RouteRuntimeNavigationGateway();
    gateway.register({
      name: 'render-only-framework',
      owner: 'framework',
      canHandle: () => true,
      activate: jest.fn(),
    });

    await expect(gateway.navigate(route, Action.Push)).resolves.toBeNull();

    route.matched[0].config.components = lazyImport(() => Page, {
      hydrate: { owner: 'browser' },
    }) as any;
    expect(getFrameworkRouteRuntimeTarget(route)).toBeNull();
    route.matched[0].config.components = undefined as any;
    expect(getFrameworkRouteRuntimeTarget(route)).toBeNull();
  });

  it('deduplicates adapter registration', () => {
    const gateway = new RouteRuntimeNavigationGateway();
    const adapter = createAdapter(() => ({ status: 'delegated' }));
    const unregister = gateway.register(adapter);
    gateway.register(adapter);
    expect(gateway.hasAdapters).toBe(true);
    unregister();
    expect(gateway.hasAdapters).toBe(false);
  });

  it('delegates browser POP only to an adapter that declares rollback support', async () => {
    const lazy = lazyImport(() => Page, {
      hydrate: { owner: 'framework', runtime: 'test-framework' },
    });
    const router = createRouter(lazy);
    const route = router.createRoute('/framework');
    const gateway = new RouteRuntimeNavigationGateway();
    const navigate = jest.fn(() => ({ status: 'committed' as const }));
    gateway.register({
      ...createAdapter(navigate),
      supportsPopNavigation: true,
    });

    await expect(gateway.navigate(route, Action.Push, null, true))
      .resolves.toEqual({ status: 'committed' });
    await expect(gateway.navigate(route, Action.Pop))
      .resolves.toEqual({ status: 'committed' });
    expect(navigate.mock.calls.map((call) => call[0].action)).toEqual(['pop', 'pop']);
  });

  it('uses latest-navigation-wins and exposes explicit cancellation', async () => {
    const lazy = lazyImport(() => Page, {
      hydrate: { owner: 'framework', runtime: 'test-framework' },
    });
    const router = createRouter(lazy);
    const route = router.createRoute('/framework');
    const gateway = new RouteRuntimeNavigationGateway();
    const completions: Array<(value: any) => void> = [];
    gateway.register(createAdapter(() => new Promise((resolve) => {
      completions.push(resolve);
    })));

    const first = gateway.navigate(route, Action.Push);
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    const second = gateway.navigate(route, Action.Push);
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    completions[0]({ status: 'committed' });
    completions[1]({ status: 'delegated' });

    await expect(first).resolves.toEqual({
      status: 'cancelled',
      reason: 'superseded by a newer framework navigation',
    });
    await expect(second).resolves.toEqual({ status: 'delegated' });
    gateway.cancel('disposed');
    gateway.cancel();
  });
});
