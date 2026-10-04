import React from 'react';
import ReactViewRouter, { lazyImport, withRouteGuards } from '../src';
import { HistoryType } from '../src/history';
import { normalizeRoutes } from '../src/util';
import { About, Home, renderUtils } from './helpers/test-utils';

function createRouter(routes: any[] = [{ path: '/', exact: true, component: Home }]) {
  return new ReactViewRouter({
    manual: true,
    mode: HistoryType.memory,
    routes,
    renderUtils,
  });
}

function mockPreparedView(router: ReactViewRouter) {
  router.viewRoot = {
    state: { inited: true },
    _isMounted: true,
    props: {},
    _refreshCurrentRoute: jest.fn(),
  } as any;
}

describe('ReactViewRoutePlugin event contract', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registration and event dispatch', () => {
    it('installs, replaces, and uninstalls named plugins exactly once', () => {
      const router = createRouter();
      const calls: string[] = [];
      const first = {
        name: 'same',
        install(this: any, value: ReactViewRouter) {
          expect(this).toBe(first);
          expect(value).toBe(router);
          calls.push('first:install');
        },
        uninstall: () => calls.push('first:uninstall'),
      };
      const second = {
        name: 'same',
        install: () => calls.push('second:install'),
        uninstall: () => calls.push('second:uninstall'),
      };

      router.plugin(first);
      const uninstall = router.plugin(second)!;
      expect(router.plugin(second)).toBeUndefined();
      uninstall();
      uninstall();

      expect(calls).toEqual([
        'first:install',
        'first:uninstall',
        'second:install',
        'second:uninstall',
      ]);
      expect(router.plugins).not.toContain(first);
      expect(router.plugins).not.toContain(second);

      router.plugin({ name: 'without-uninstall' });
      expect(() => router.plugin({ name: 'without-uninstall' })).not.toThrow();
    });

    it('dispatches in registration order and chains only defined results', () => {
      const router = createRouter();
      const calls: string[] = [];
      const first = {
        name: 'first',
        custom(this: any, value: string, previous?: string) {
          expect(this).toBe(first);
          calls.push(`first:${value}:${previous}`);
          return 'first-result';
        },
      };
      router.plugin(first);
      router.plugin({
        name: 'second',
        custom: (value: string, previous?: string) => {
          calls.push(`second:${value}:${previous}`);
          return undefined;
        },
      });
      router.plugin({
        name: 'third',
        custom: (value: string, previous?: string) => {
          calls.push(`third:${value}:${previous}`);
          return 'final-result';
        },
      });

      expect((router._callEvent as any)('custom', 'payload')).toBe('final-result');
      expect(calls).toEqual([
        'first:payload:undefined',
        'second:payload:first-result',
        'third:payload:first-result',
      ]);
    });

    it('stops dispatch and identifies the plugin and event when a hook throws', () => {
      const router = createRouter();
      const later = jest.fn();
      router.plugin({ name: 'broken', custom: () => { throw new Error('boom'); } });
      router.plugin({ name: 'later', custom: later });

      expect(() => (router._callEvent as any)('custom')).toThrow('[broken:custom]boom');
      expect(later).not.toHaveBeenCalled();

      const unnamedRouter = createRouter();
      unnamedRouter.plugin({ custom: () => { throw new Error('plain'); } });
      expect(() => (unnamedRouter._callEvent as any)('custom')).toThrow('plain');

      const stringErrorRouter = createRouter();
      const messageLessError = new Error();
      stringErrorRouter.plugin({ name: 'message-less-error', custom: () => { throw messageLessError; } });
      expect(() => (stringErrorRouter._callEvent as any)('custom')).toThrow(messageLessError);
    });
  });

  describe('lifecycle and route tree events', () => {
    it('passes lifecycle arguments and preserves restart ordering', () => {
      const router = createRouter();
      const calls: string[] = [];
      const onStart = jest.fn((_router, options, isInit) => calls.push(`start:${options.basename || ''}:${isInit}`));
      const onStop = jest.fn((_router, options) => calls.push(`stop:${Boolean(options.ignoreClearRoute)}:${Boolean(options.isInit)}`));
      router.plugin({ name: 'lifecycle', onStart, onStop });

      router.start({ basename: '/app' }, true);
      router.start({}, false);
      router.stop({ ignoreClearRoute: true });

      expect(calls).toEqual([
        'start:/app:true',
        'stop:false:false',
        'start::false',
        'stop:true:false',
      ]);
      expect(onStart).toHaveBeenCalledTimes(2);
      expect(onStop).toHaveBeenCalledTimes(2);
    });

    it('reports replacement/addition details and walks nested routes parent-first', () => {
      const router = createRouter();
      const changes: any[][] = [];
      const walked: string[] = [];
      const customInstall = jest.fn();
      router.use({ install: customInstall } as any);
      expect(router.install).not.toBe(customInstall);
      router.plugin({
        name: 'routes',
        onRoutesChange: (...args: any[]) => changes.push(args),
        onWalkRoute: (route, index, routes) => walked.push(`${route.path}:${index}:${routes.length}`),
      });

      router.use({
        routes: [{
          path: '/parent',
          component: Home,
          children: [{ path: 'child', component: About }],
        }],
      });
      const parent = router.routes[0];
      router.addRoutes([{ path: 'second', component: About }], parent);

      expect(walked).toEqual(['/parent:0:1', '/parent/child:0:1', '/parent/second:0:1']);
      expect(changes).toHaveLength(2);
      expect(changes[0][0]).toBe(router.routes);
      expect(changes[0][1]).not.toBe(router.routes);
      expect(changes[1][2]).toBe(parent);
      expect(changes[1][3]).toBe(parent.children);
    });
  });

  describe('navigation and metadata events', () => {
    it('lets onRouteGo take over push/replace and settle through supplied callbacks', async () => {
      const router = createRouter();
      router.start();
      mockPreparedView(router);
      const calls: string[] = [];
      router.plugin({
        name: 'go',
        onRouteGo(to, complete, _abort, isReplace) {
          calls.push(`${to.path || to.pathname}:${isReplace}`);
          complete('handled', router.createRoute(to));
          return false;
        },
      });

      await expect(router.push('/taken')).resolves.toBe('handled');
      await expect(router.replace('/replaced')).resolves.toBe('handled');

      expect(calls).toEqual(['/taken:false', '/replaced:true']);
      expect(router.history.location.pathname).toBe('/');
      router.stop();
    });

    it('emits onRouteAbort once and does not emit onRouteChange when a guard blocks', async () => {
      const router = createRouter([
        { path: '/', exact: true, component: Home },
        { path: '/blocked', component: About },
      ]);
      router.start();
      mockPreparedView(router);
      router.beforeEach((_to, _from, next) => next(false));
      const onRouteAbort = jest.fn();
      const onRouteChange = jest.fn();
      router.plugin({ name: 'navigation', onRouteAbort, onRouteChange });

      await new Promise<void>((resolve) => {
        router._internalHandleRouteInterceptor(router._normalizeLocation('/blocked')!, (ok) => {
          expect(ok).toBe(false);
          resolve();
        });
      });

      expect(onRouteAbort).toHaveBeenCalledTimes(1);
      expect(onRouteAbort.mock.calls[0][0].path).toBe('/blocked');
      expect(onRouteAbort.mock.calls[0][1]).toBe(false);
      expect(onRouteChange).not.toHaveBeenCalled();
      router.stop();
    });

    it('allows onRouteing to rewrite a target and runs completion callbacks once', async () => {
      const router = createRouter([
        { path: '/', exact: true, component: Home },
        { path: '/actual', component: About },
      ]);
      router.start();
      mockPreparedView(router);
      const done = jest.fn();
      router.plugin({
        name: 'routeing',
        onRouteing(next) {
          next({ path: '/actual' } as any);
          next(done);
        },
      });

      let routedPath: string | undefined;
      await new Promise<void>((resolve) => {
        router._handleRouteInterceptor(router._normalizeLocation('/requested')!, (ok, route) => {
          routedPath = route?.path;
          if (typeof ok === 'function') ok(true);
          resolve();
        });
      });

      expect(done).toHaveBeenCalledTimes(1);
      expect(done.mock.calls[0][0]).toBe(false);
      expect(done.mock.calls[0][2].location.path).toBe('/actual');
      expect(routedPath).toBe('/actual');
      router.stop();
    });

    it('emits metadata changes only when values actually change', () => {
      const router = createRouter([{ path: '/', component: Home, meta: { title: 'old' } }]);
      const onRouteMetaChange = jest.fn();
      router.plugin({ name: 'meta', onRouteMetaChange });
      const route = router.routes[0];

      expect(router.updateRouteMeta(route, { title: 'old' })).toBeUndefined();
      expect(router.updateRouteMeta(route, { title: 'new' })).toBe(true);

      expect(onRouteMetaChange).toHaveBeenCalledTimes(1);
      expect(onRouteMetaChange).toHaveBeenCalledWith(
        { title: 'new' },
        { title: 'old' },
        route,
        router,
        undefined,
      );
    });

    it('emits a completed route change once with current and previous routes', () => {
      const router = createRouter([
        { path: '/', exact: true, component: Home },
        { path: '/about', component: About },
      ]);
      router.start();
      const previous = router.currentRoute;
      const onRouteChange = jest.fn();
      router.plugin({ name: 'change', onRouteChange });

      router.history.push('/about');
      router.updateRoute(router.history.location as any);

      expect(onRouteChange).toHaveBeenCalledTimes(1);
      expect(onRouteChange).toHaveBeenCalledWith(router.currentRoute, previous, router, undefined);
      router.stop();
    });
  });

  describe('guard and lazy-component extension events', () => {
    it('can replace a resolved lazy component before its guards are collected', async () => {
      const originalGuard = jest.fn();
      const replacementGuard = jest.fn();
      const Original = withRouteGuards(Home, { beforeRouteEnter: originalGuard });
      const Replacement = withRouteGuards(About, { beforeRouteEnter: replacementGuard });
      const route = normalizeRoutes([{
        path: '/lazy',
        component: lazyImport(() => Promise.resolve({ __esModule: true, default: Original } as any)),
      }])[0];
      const router = createRouter(route ? [route] : []);
      const onLazyResolveComponent = jest.fn(() => Replacement as any);
      router.plugin({ name: 'lazy', onLazyResolveComponent });
      const matched = router.getMatched('/lazy')[0];
      const interceptors = router._getComponentGuards(matched, 'beforeRouteEnter') as any[];

      await router._getInterceptor(interceptors, 0);

      expect(onLazyResolveComponent).toHaveBeenCalledWith(Original, matched.config, undefined);
      expect(interceptors[0]).toBeDefined();
      expect(originalGuard).not.toHaveBeenCalled();
    });

    it('can fully handle component guard discovery and replace resolved interceptors', async () => {
      const route = normalizeRoutes([{ path: '/guard', component: Home }])[0];
      const router = createRouter([route]);
      const supplied = jest.fn();
      const replacement = jest.fn();
      const onGetRouteComponentGuards = jest.fn((interceptors: any[]) => {
        interceptors.push(supplied);
        return true;
      });
      const onGetRouteInterceptor = jest.fn(() => replacement);
      router.plugin({
        name: 'guards',
        onGetRouteComponentGuards,
        onGetRouteInterceptor,
      });
      const matched = router.getMatched('/guard')[0];
      const guards = router._getComponentGuards(matched, 'beforeRouteEnter');

      expect(guards).toEqual([supplied]);
      await expect(router._getInterceptor(guards, 0)).resolves.toBe(replacement);
      expect(onGetRouteComponentGuards.mock.calls[0][1]).toBe(matched.config);
      expect(onGetRouteComponentGuards.mock.calls[0][4]).toBe('beforeRouteEnter');
      expect(onGetRouteComponentGuards.mock.calls[0][5].router).toBe(router);
      expect(onGetRouteInterceptor).toHaveBeenCalledWith(supplied, guards, 0, undefined);
    });

    it('emits enter/leave next results with their matched route and instance', () => {
      const enterResult = { entered: true };
      const leaveResult = { left: true };
      const Guarded = withRouteGuards(Home, {
        beforeRouteEnter: (_to, _from, next) => next(() => enterResult),
        beforeRouteLeave: (_to, _from, next) => next(() => leaveResult),
      });
      const router = createRouter([{ path: '/', component: Guarded as any }]);
      const onRouteEnterNext = jest.fn();
      const onRouteLeaveNext = jest.fn();
      router.plugin({ name: 'next', onRouteEnterNext, onRouteLeaveNext });
      const matched = router.getMatched('/')[0];
      const instance = {} as React.Component;
      matched.componentInstances.default = instance;

      matched.guards.beforeEnter[0].guard(router.createRoute('/'), null, () => undefined);
      matched.config._pending!.completeCallbacks.default!(instance);
      matched.guards.beforeLeave[0].guard(router.createRoute('/other'), router.createRoute('/'), (cb: any) => cb(instance));

      expect(onRouteEnterNext).toHaveBeenCalledWith(matched, instance, enterResult, undefined);
      expect(onRouteLeaveNext).toHaveBeenCalledWith(matched, instance, leaveResult, undefined);
    });
  });
});
