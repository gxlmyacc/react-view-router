import React from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import ReactViewRouter, {
  RouterView,
  RouterViewComponent,
  lazyImport,
  withRouteGuards,
} from '../src';
import { HistoryType } from '../src/history';
import renderUtils from '../dom/src';

const PlainPage = () => <div>Plain page</div>;

function push(router: ReactViewRouter, path: string) {
  return new Promise((resolve, reject) => {
    router.push(path, resolve, reject).catch(() => undefined);
  });
}

async function mount(router: ReactViewRouter) {
  router.start();
  const view = render(<RouterViewComponent router={router} />);
  await waitFor(() => expect(router.isPrepared).toBe(true));
  return view;
}

function createGuardedComponent(
  name: string,
  Component: React.ComponentType<any>,
  calls: string[],
  blockEnter = false,
) {
  return withRouteGuards(Component, {
    beforeRouteEnter: (_to, _from, next) => {
      calls.push(`${name}:beforeEnter`);
      next(blockEnter ? false : undefined);
    },
    beforeRouteResolve: () => calls.push(`${name}:beforeResolve`),
    beforeRouteLeave: (_to, _from, next) => {
      calls.push(`${name}:beforeLeave`);
      next();
    },
    afterRouteLeave: () => calls.push(`${name}:afterLeave`),
  });
}

describe('complete route guard pipeline', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('runs next(callback) only after every beforeEach guard allows and history commits', async () => {
    const calls: string[] = [];
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      renderUtils,
      routes: [
        { path: '/', exact: true, component: PlainPage },
        { path: '/next-callback', component: PlainPage },
      ],
    });
    const view = await mount(router);
    router.beforeEach((_to, _from, next) => {
      calls.push('before:1');
      next((route) => calls.push(`complete:1:${route.path}:${router.currentRoute?.path}`));
    });
    router.beforeEach((_to, _from, next) => {
      calls.push('before:2');
      next((route) => calls.push(`complete:2:${route.path}:${router.currentRoute?.path}`));
    });
    router.afterEach(() => calls.push('afterEach'));

    await act(async () => {
      await push(router, '/next-callback');
    });
    await waitFor(() => expect(calls).toContain('afterEach'));

    expect(calls).toEqual([
      'before:1',
      'before:2',
      'complete:1:/next-callback:/next-callback',
      'complete:2:/next-callback:/next-callback',
      'afterEach',
    ]);

    view.unmount();
    router.stop();
  });

  it('discards earlier next callbacks and resolve/after hooks when a later guard aborts', async () => {
    const calls: string[] = [];
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      renderUtils,
      routes: [
        { path: '/', exact: true, component: PlainPage },
        { path: '/blocked', component: PlainPage },
      ],
    });
    const view = await mount(router);
    router.beforeEach((_to, _from, next) => {
      calls.push('before:callback');
      next(() => calls.push('complete:must-not-run'));
    });
    router.beforeEach((_to, _from, next) => {
      calls.push('before:block');
      next(false);
    });
    router.beforeResolve(() => calls.push('resolve:must-not-run'));
    router.afterEach(() => calls.push('after:must-not-run'));

    await expect(push(router, '/blocked')).rejects.toBe(false);

    expect(calls).toEqual(['before:callback', 'before:block']);
    expect(router.history.location.pathname).toBe('/');
    expect(router.currentRoute?.path).toBe('/');

    view.unmount();
    router.stop();
  });

  it('discards a beforeRouteEnter instance callback when guard navigation changes the target', async () => {
    const staleCallback = jest.fn();
    const enteredCallback = jest.fn();
    let shouldRedirect = true;
    let replacementPromise: Promise<any>|undefined;
    class RedirectedPage extends React.Component {

      render() {
        return <div>Redirected page</div>;
      }

    }
    const GuardedPage = withRouteGuards(RedirectedPage, {
      beforeRouteEnter: (_to, _from, next) => {
        if (shouldRedirect) {
          replacementPromise = router.replace('/target');
          next(staleCallback);
          return;
        }
        next(enteredCallback);
      },
    });
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      renderUtils,
      routes: [
        { path: '/', exact: true, component: PlainPage },
        { path: '/guarded', component: GuardedPage },
        { path: '/target', component: PlainPage },
      ],
    });
    const view = await mount(router);

    await act(async () => {
      await expect(router.push('/guarded')).resolves.toBeDefined();
      await expect(replacementPromise).resolves.toBeDefined();
    });
    expect(router.currentRoute?.path).toBe('/target');
    expect(staleCallback).not.toHaveBeenCalled();

    shouldRedirect = false;
    await act(async () => {
      await expect(router.push('/guarded')).resolves.toBeDefined();
    });
    await waitFor(() => expect(enteredCallback).toHaveBeenCalledTimes(1));
    expect(staleCallback).not.toHaveBeenCalled();

    view.unmount();
    router.stop();
  });

  it('resolves lazy parent/child guards in enter order and leave guards in reverse order', async () => {
    const calls: string[] = [];
    const ParentView = () => <div>Parent<RouterView /></div>;
    const ChildView = () => <div>Child<RouterView /></div>;
    const Parent = createGuardedComponent('parent', ParentView, calls);
    const Child = createGuardedComponent('child', ChildView, calls);
    const Grandchild = createGuardedComponent('grandchild', PlainPage, calls);
    const childLoader = jest.fn(() => Promise.resolve({ __esModule: true, default: Child }));
    const grandchildLoader = jest.fn(() => Promise.resolve({ __esModule: true, default: Grandchild }));
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      renderUtils,
      routes: [
        { path: '/', exact: true, component: PlainPage },
        {
          path: '/parent',
          component: Parent,
          children: [{
            path: 'child',
            component: lazyImport(childLoader),
            children: [{
              path: 'grandchild',
              component: lazyImport(grandchildLoader),
            }],
          }],
        },
      ],
    });
    const view = await mount(router);
    router.beforeEach((_to, _from, next) => {
      calls.push('router:beforeEach');
      next();
    });
    router.beforeResolve(() => calls.push('router:beforeResolve'));
    router.afterEach(() => calls.push('router:afterEach'));

    await act(async () => {
      await push(router, '/parent/child/grandchild');
    });
    await waitFor(() => expect(calls).toContain('router:afterEach'));

    expect(childLoader).toHaveBeenCalledTimes(1);
    expect(grandchildLoader).toHaveBeenCalledTimes(1);
    expect(calls).toEqual([
      'router:beforeEach',
      'parent:beforeEnter',
      'child:beforeEnter',
      'grandchild:beforeEnter',
      'router:beforeResolve',
      'parent:beforeResolve',
      'child:beforeResolve',
      'grandchild:beforeResolve',
      'router:afterEach',
    ]);

    calls.length = 0;
    await act(async () => {
      await push(router, '/');
    });
    await waitFor(() => expect(calls).toContain('router:afterEach'));

    expect(calls).toEqual([
      'router:beforeEach',
      'grandchild:beforeLeave',
      'child:beforeLeave',
      'parent:beforeLeave',
      'router:beforeResolve',
      'grandchild:afterLeave',
      'child:afterLeave',
      'parent:afterLeave',
      'router:afterEach',
    ]);

    view.unmount();
    router.stop();
  });

  it('lets a guard loaded from a lazy component abort before resolve and commit', async () => {
    const calls: string[] = [];
    const BlockedLazyPage = createGuardedComponent('lazy', PlainPage, calls, true);
    const loader = jest.fn(() => Promise.resolve({ __esModule: true, default: BlockedLazyPage }));
    const router = new ReactViewRouter({
      manual: true,
      mode: HistoryType.memory,
      renderUtils,
      routes: [
        { path: '/', exact: true, component: PlainPage },
        { path: '/lazy-blocked', component: lazyImport(loader) },
      ],
    });
    const view = await mount(router);
    router.beforeEach((_to, _from, next) => {
      calls.push('router:beforeEach');
      next();
    });
    router.beforeResolve(() => calls.push('router:beforeResolve:must-not-run'));
    router.afterEach(() => calls.push('router:afterEach:must-not-run'));

    await expect(push(router, '/lazy-blocked')).rejects.toBe(false);

    expect(loader).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['router:beforeEach', 'lazy:beforeEnter']);
    expect(router.history.location.pathname).toBe('/');
    expect(router.currentRoute?.path).toBe('/');

    view.unmount();
    router.stop();
  });
});
