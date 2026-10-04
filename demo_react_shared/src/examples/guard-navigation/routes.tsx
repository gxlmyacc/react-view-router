import React from 'react';
import { normalizeRoutes, withRouteGuards } from 'react-view-router';
import type { Route, RouteNextFn } from 'react-view-router';
import router from './history';
import GuardNavigationPage from './pages';
import {
  getGuardNavigationId,
  observeGuardNavigationPromise,
  recordGuardNavigation,
} from './events';

const page = (titleKey: string) => function Page(): React.ReactElement {
  return <GuardNavigationPage titleKey={titleKey} />;
};

function createTakeoverPage(method: 'push'|'redirect') {
  const Component = page(method === 'push' ? 'guardPushPending' : 'guardRedirectPending');
  return withRouteGuards(Component, {
    beforeRouteEnter(to: Route, from: Route|null, _next: RouteNextFn) {
      const target = method === 'push' ? '/push-target' : '/redirect-target';
      recordGuardNavigation(
        'component.beforeRouteEnter',
        to,
        from,
        'takeover',
        `router.${method}('${target}')`,
        getGuardNavigationId(),
      );
      const navigating = method === 'push' ? router.push(target) : router.redirect(target);
      observeGuardNavigationPromise(navigating, `router.${method}.promise`, to, from, getGuardNavigationId(),);
      recordGuardNavigation(
        'component.beforeRouteEnter.next',
        to,
        from,
        'ignored',
        'next() is still called and ignored because the navigation is already handled',
        getGuardNavigationId(),
      );
      _next();
    },
  });
}

export default normalizeRoutes([
  { path: '/', index: 'home' },
  { path: 'home', component: page('guardNavigationHome') },
  { path: 'login', component: page('guardNavigationLogin') },
  { path: 'same-target', component: page('guardSameTarget') },
  { path: 'parent', exact: true, redirect: 'parent/child' },
  { path: 'parent/child', component: page('guardChildRedirectTarget') },
  { path: 'query-target', component: page('guardQueryTarget') },
  { path: 'push-target', component: page('guardPushTarget') },
  { path: 'redirect-target', component: page('guardRedirectTarget') },
  { path: 'global-replace', component: page('guardReplacePending') },
  { path: 'component-push', component: createTakeoverPage('push') },
  { path: 'component-redirect', component: createTakeoverPage('redirect') },
  {
    path: 'blocked',
    component: page('guardBlockedPending'),
    beforeEnter(to: Route, from: Route|null, next: RouteNextFn) {
      recordGuardNavigation(
        'route.beforeEnter',
        to,
        from,
        'abort',
        'next(false)',
        getGuardNavigationId(),
      );
      next(false);
    },
  },
]);
