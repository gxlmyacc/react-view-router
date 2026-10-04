import type { Route, RouteNextFn } from 'react-view-router';
import {
  beginGuardNavigation,
  emitGuardEvent,
  isGuardBlocked,
} from './runtime';

export function beforeEach(to: Route, from: Route | null, next: RouteNextFn): void {
  beginGuardNavigation();
  const blocked = isGuardBlocked('router', 'beforeEach', to, from);
  emitGuardEvent('router:beforeEach', {
    scope: 'router', owner: 'router', hook: 'beforeEach', to, from,
    outcome: blocked ? 'abort' : 'continue',
  });
  next(blocked ? false : undefined);
}

export function beforeResolve(to: Route, from: Route | null): void {
  emitGuardEvent('router:beforeResolve', {
    scope: 'router', owner: 'router', hook: 'beforeResolve', to, from, outcome: 'continue',
  });
}

export function afterEach(to: Route, from: Route | null): void {
  emitGuardEvent('router:afterEach', {
    scope: 'router', owner: 'router', hook: 'afterEach', to, from, outcome: 'completed',
  });
}
