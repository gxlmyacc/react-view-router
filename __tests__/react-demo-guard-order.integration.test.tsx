import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import ReactViewRouter, { RouterViewComponent, useRouteTitle } from '../src';
import { HistoryType } from '../src/history';
import renderUtils from '../dom/src';
import {
  createDemoRouter,
  createWorkspaceRouter,
} from '../demo_react_shared/src/testing/create-demo-router';
import GuardLog from '../demo_react_shared/src/examples/route-guards/components/GuardLog';
import guardModuleRouter from '../demo_react_shared/src/examples/route-guards/history';
import { configureGuardRuntime } from '../demo_react_shared/src/examples/route-guards/runtime';
import WorkspaceApp from '../demo_react_shared/src/workspace/App';
import workspaceRoutes from '../demo_react_shared/src/workspace/routes';
import {
  createGuardEvent,
  recordGuardEvent,
  resetGuardEvents,
} from '../demo_react_shared/src/examples/route-guards/guard-events';

interface DemoGuardEvent {
  label: string;
  navigationId: number;
  scope: 'router'|'route'|'component';
  owner: string;
  hook: string;
  from: string;
  to: string;
  outcome: 'continue'|'abort'|'redirect'|'completed'|'callback';
  detail: string;
}

function push(router: ReturnType<typeof createDemoRouter>, path: string) {
  return new Promise((resolve, reject) => {
    router.push(path, resolve, reject).catch(() => undefined);
  });
}

async function mountDemo(
  calls: string[],
  shouldBlock?: (name: string, event: string) => boolean,
) {
  const events: DemoGuardEvent[] = [];
  const router = createDemoRouter({
    manual: true,
    mode: HistoryType.memory,
    pathname: '/login',
    renderUtils,
    loggedIn: true,
    record: (event: DemoGuardEvent) => {
      events.push(event);
      calls.push(event.label);
    },
    shouldBlock,
  });
  router.start();
  const view = render(<RouterViewComponent router={router} />);
  await waitFor(() => expect(router.isPrepared).toBe(true));
  calls.length = 0;
  events.length = 0;
  return { router, view, events };
}

describe('shared React 16/17/18/19 demo guard contracts', () => {
  afterEach(() => {
    cleanup();
    resetGuardEvents();
    jest.restoreAllMocks();
  });

  it.each([
    ['workspace index', '/', '/home'],
    ['nested module route', '/examples/guards/login', '/examples/guards'],
  ])('resolves currentPath on the first render for %s', (_label, pathname, expectedPath) => {
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname,
      renderUtils,
      routes: workspaceRoutes,
    });
    router.start();
    const renders: Array<string | undefined> = [];
    function CurrentPathProbe(): null {
      const { currentPaths: [currentPath] } = useRouteTitle({
        matchedOffset: 1,
        maxLevel: 1,
      }, router);
      renders.push(currentPath);
      return null;
    }

    const view = render(<CurrentPathProbe />);
    expect(renders[0]).toBe(expectedPath);

    view.unmount();
    router.stop();
  });

  it('groups guard decisions by navigation and shows its final result compactly', () => {
    recordGuardEvent(createGuardEvent('router:beforeEach', {
      navigationId: 4,
      scope: 'router',
      owner: 'router',
      hook: 'beforeEach',
      from: { fullPath: '/login' },
      to: { fullPath: '/home/main/some?tab=details' },
      outcome: 'continue',
    }));
    recordGuardEvent(createGuardEvent('router:afterEach', {
      navigationId: 4,
      scope: 'router',
      owner: 'router',
      hook: 'afterEach',
      from: { fullPath: '/login' },
      to: { fullPath: '/home/main/some?tab=details' },
      outcome: 'completed',
    }));
    recordGuardEvent(createGuardEvent('main:beforeEnter', {
      navigationId: 5,
      scope: 'component',
      owner: 'main',
      hook: 'beforeEnter',
      from: { fullPath: '/login' },
      to: { fullPath: '/home/main/some' },
      outcome: 'abort',
    }));

    const view = render(<GuardLog />);

    expect(screen.getByText('#4')).toBeTruthy();
    expect(screen.getByText('ENTERED')).toBeTruthy();
    expect(screen.getByText('router.beforeEach')).toBeTruthy();
    expect(screen.getByText('router.afterEach')).toBeTruthy();
    expect(screen.getByText('/home/main/some?tab=details')).toBeTruthy();
    expect(screen.getByText('#5')).toBeTruthy();
    expect(screen.getByText('BLOCKED')).toBeTruthy();
    expect(screen.getByText('component:main.beforeEnter → BLOCK')).toBeTruthy();

    const scroller = view.container.querySelector('.guard-navigation-list') as HTMLElement;
    Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 420 });
    act(() => {
      recordGuardEvent(createGuardEvent('router:beforeEach', {
        navigationId: 6,
        scope: 'router',
        owner: 'router',
        hook: 'beforeEach',
        from: { fullPath: '/login' },
        to: { fullPath: '/home/main/other' },
        outcome: 'continue',
      }));
    });
    expect(scroller.scrollTop).toBe(420);
  });

  it('runs the guard example as a basename module router inside the workspace router', async () => {
    const guardRouter = createWorkspaceRouter({
      mode: HistoryType.memory,
      pathname: '/examples/guards/login',
      renderUtils,
      loggedIn: true,
    });
    const workspaceRouter = guardRouter.workspaceRouter;
    const view = render(
      <>
        <RouterViewComponent router={workspaceRouter} />
        <RouterViewComponent router={guardRouter} />
      </>,
    );
    await waitFor(() => {
      expect(workspaceRouter.isPrepared).toBe(true);
      expect(guardRouter.isPrepared).toBe(true);
    });

    expect(guardRouter.history === workspaceRouter.history).toBe(true);
    expect(guardRouter.basename).toBe('/examples/guards/');
    await act(async () => {
      await push(guardRouter, '/home/main/some');
    });
    await waitFor(() => expect(guardRouter.currentRoute?.path).toBe('/home/main/some'));
    expect(workspaceRouter.history.location.pathname).toBe('/examples/guards/home/main/some');
    expect(workspaceRouter.currentRoute).toBeTruthy();

    view.unmount();
    guardRouter.stop();
    workspaceRouter.stop();
  });

  it('renders the module with basename and mode supplied by the workspace host', async () => {
    configureGuardRuntime({ loggedIn: true });
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/guards/',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(view.container.querySelector('.guard-example')).toBeTruthy());
    await waitFor(() => expect(guardModuleRouter.isPrepared).toBe(true));

    expect(workspaceRouter.routes.length).toBeGreaterThanOrEqual(8);
    expect(workspaceRouter.routes.some(route => route.path === '/examples/guards/home/main/some'))
      .toBe(false);
    expect(guardModuleRouter.basename).toBe('/examples/guards/');
    expect(guardModuleRouter.history).toBe(workspaceRouter.history);
    await waitFor(() => expect(guardModuleRouter.currentRoute?.path).toBe('/home/main/some'));
    expect(workspaceRouter.history.location.pathname).toBe('/examples/guards/home/main/some');
    expect(view.container.querySelectorAll('.guard-example')).toHaveLength(1);

    view.unmount();
    workspaceRouter.stop();
  });

  it('keeps the module basename when an async component guard redirects', async () => {
    configureGuardRuntime({ loggedIn: false });
    const workspaceRouter = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/examples/guards/home/main/other',
      renderUtils,
      routes: workspaceRoutes,
    });
    workspaceRouter.start();
    const view = render(<WorkspaceApp router={workspaceRouter} />);

    await waitFor(() => expect(guardModuleRouter.isPrepared).toBe(true));
    await act(async () => {
      guardModuleRouter.push('/home/main/some').catch(() => undefined);
      await Promise.resolve();
    });
    await waitFor(() => expect(guardModuleRouter.currentRoute?.path).toBe('/login'));

    expect(guardModuleRouter.basename).toBe('/examples/guards/');
    expect(workspaceRouter.history.location.pathname).toBe('/examples/guards/login');

    view.unmount();
    workspaceRouter.stop();
  });

  it('executes the real demo lazy parent, child, and named-outlet guards in order', async () => {
    const calls: string[] = [];
    const { router, view, events } = await mountDemo(calls);

    await act(async () => {
      await push(router, '/home/main/some');
    });
    await waitFor(() => expect(calls).toContain('footer:enterCallback'));

    expect(calls).toEqual([
      'router:beforeEach',
      'login:beforeLeave',
      'home:beforeEnter',
      'main:beforeEnter',
      'route:some:beforeEnter',
      'some:beforeEnter',
      'footer:beforeEnter',
      'router:beforeResolve',
      'home:beforeResolve',
      'main:beforeResolve',
      'some:beforeResolve',
      'footer:beforeResolve',
      'login:afterLeave',
      'router:afterEach',
      'some:enterCallback',
      'footer:enterCallback',
    ]);
    expect(Array.from(new Set(events.map((event) => event.navigationId)))).toEqual([2]);
    expect(events.find((event) => event.label === 'route:some:beforeEnter')).toMatchObject({
      scope: 'route',
      owner: 'some',
      hook: 'beforeEnter',
      from: '/login',
      to: '/home/main/some',
      outcome: 'continue',
    });
    expect(events.find((event) => event.label === 'footer:beforeEnter')).toMatchObject({
      scope: 'component',
      owner: 'footer',
      outcome: 'continue',
    });

    calls.length = 0;
    events.length = 0;
    await act(async () => {
      await push(router, '/login');
    });
    await waitFor(() => expect(calls).toContain('router:afterEach'));

    expect(calls).toEqual([
      'router:beforeEach',
      'footer:beforeLeave',
      'some:beforeLeave',
      'route:some:beforeLeave',
      'main:beforeLeave',
      'home:beforeLeave',
      'login:beforeEnter',
      'router:beforeResolve',
      'login:beforeResolve',
      'footer:afterLeave',
      'some:afterLeave',
      'route:some:afterLeave',
      'main:afterLeave',
      'home:afterLeave',
      'router:afterEach',
    ]);
    expect(Array.from(new Set(events.map((event) => event.navigationId)))).toEqual([3]);
    expect(events[0]).toMatchObject({
      label: 'router:beforeEach',
      from: '/home/main/some',
      to: '/login',
      outcome: 'continue',
    });

    view.unmount();
    router.stop();
  });

  it('stops resolving later lazy children when the demo main guard aborts', async () => {
    const calls: string[] = [];
    const { router, view, events } = await mountDemo(
      calls,
      (name, event) => name === 'main' && event === 'beforeEnter',
    );

    let rejection: unknown;
    await act(async () => {
      try {
        await push(router, '/home/main/some');
      } catch (error) {
        rejection = error;
      }
    });

    expect(rejection).toBe(false);
    expect(calls).toEqual([
      'router:beforeEach',
      'login:beforeLeave',
      'home:beforeEnter',
      'main:beforeEnter',
    ]);
    expect(events[events.length - 1]).toMatchObject({
      label: 'main:beforeEnter',
      navigationId: 2,
      from: '/login',
      to: '/home/main/some',
      outcome: 'abort',
    });
    expect(router.history.location.pathname).toBe('/login');
    expect(router.currentRoute?.path).toBe('/login');

    view.unmount();
    router.stop();
  });

  it('starts a fresh global guard chain after an async component guard redirects', async () => {
    const calls: string[] = [];
    const events: DemoGuardEvent[] = [];
    const router = createDemoRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/home/main/other',
      renderUtils,
      loggedIn: false,
      record: (event: DemoGuardEvent) => {
        events.push(event);
        calls.push(event.label);
      },
    });
    router.start();
    const view = render(<RouterViewComponent router={router} />);
    await waitFor(() => expect(router.isPrepared).toBe(true));
    calls.length = 0;
    events.length = 0;

    await act(async () => {
      router.push('/home/main/some').catch(() => undefined);
      await Promise.resolve();
    });
    await waitFor(() => expect(events.some(
      (event) => event.label === 'some:beforeEnter' && event.outcome === 'redirect',
    )).toBe(true));
    await waitFor(() => expect(router.history.location.pathname).toBe('/login'));

    expect(events.filter((event) => event.label === 'router:beforeEach')).toMatchObject([
      { from: '/home/main/other', to: '/home/main/some', outcome: 'continue' },
      { from: '/home/main/other', to: '/login', outcome: 'continue' },
    ]);
    expect(events.find((event) => event.label === 'some:beforeEnter')).toMatchObject({
      from: '/home/main/other',
      to: '/home/main/some',
      outcome: 'redirect',
      detail: '/login',
    });

    view.unmount();
    router.stop();
  });

  it('reruns the global guard chain when initial async component resolution redirects', async () => {
    const events: DemoGuardEvent[] = [];
    const router = createDemoRouter({
      manual: true,
      mode: HistoryType.memory,
      pathname: '/home/main/some',
      renderUtils,
      loggedIn: false,
      record: (event: DemoGuardEvent) => events.push(event),
    });
    router.start();
    const view = render(<RouterViewComponent router={router} />);

    await waitFor(() => expect(router.history.location.pathname).toBe('/login'));
    await waitFor(() => expect(router.isPrepared).toBe(true));

    expect(events.filter((event) => event.label === 'router:beforeEach')).toMatchObject([
      { from: '(none)', to: '/home/main/some', outcome: 'continue' },
      { to: '/login', outcome: 'continue' },
    ]);

    view.unmount();
    router.stop();
  });
});
