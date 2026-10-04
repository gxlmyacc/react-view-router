import type { Route, RouteNextFn } from 'react-view-router';
import router from './history';
import {
  beginGuardNavigation,
  getGuardNavigationId,
  observeGuardNavigationPromise,
  recordGuardNavigation,
} from './events';

export function beforeEach(to: Route, from: Route|null, next: RouteNextFn): void {
  const id = beginGuardNavigation();
  if (to.path === '/global-replace') {
    recordGuardNavigation('authInterceptor', to, from, 'takeover', "router.replace('/login')", id);
    observeGuardNavigationPromise(router.replace('/login'), 'router.replace.promise', to, from, id,);
    recordGuardNavigation(
      'router.beforeEach.next',
      to,
      from,
      'ignored',
      'next() is called by the outer guard and ignored',
      id,
    );
    next();
    return;
  }
  if (to.path === '/same-target') {
    recordGuardNavigation('sharedInterceptor', to, from, 'allow', 'router.replace(to.fullPath)', id,);
    observeGuardNavigationPromise(router.replace(to.fullPath), 'router.replace.promise', to, from, id,);
    recordGuardNavigation('router.beforeEach.next', to, from, 'allow', 'next(callback) registers a completion callback', id,);
    next((route: Route) => recordGuardNavigation('next(callback)', route, from, 'complete', 'original target entered', id,));
    return;
  }
  if (to.path === '/query-target' && to.query.version === '1') {
    recordGuardNavigation('queryNormalizer', to, from, 'takeover', "router.replace('/query-target?version=2')", id,);
    observeGuardNavigationPromise(router.replace('/query-target?version=2'), 'router.replace.promise', to, from, id,);
    recordGuardNavigation('router.beforeEach.next', to, from, 'ignored', 'original fullPath callback is not registered', id,);
    next(() => recordGuardNavigation('next(callback)', to, from, 'complete', 'must not run for the old query target', id,));
    return;
  }
  recordGuardNavigation('router.beforeEach', to, from, 'allow', 'next()', id);
  next();
}

export function afterEach(to: Route, from: Route|null): void {
  recordGuardNavigation(
    'router.afterEach',
    to,
    from,
    'complete',
    'navigation committed',
    getGuardNavigationId(),
  );
}
