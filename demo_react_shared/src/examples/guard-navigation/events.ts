import type { Route } from 'react-view-router';

export type GuardNavigationOutcome = 'allow'|'takeover'|'ignored'|'abort'|'complete'|'resolved'|'rejected';

export interface GuardNavigationEvent {
  id: number;
  hook: string;
  from: string;
  to: string;
  outcome: GuardNavigationOutcome;
  detail: string;
}

type Listener = (events: GuardNavigationEvent[]) => void;

let navigationId = 0;
let events: GuardNavigationEvent[] = [];
const listeners: Listener[] = [];

function routeLabel(route: Route|null): string {
  return route ? route.fullPath || route.path || '(empty)' : '(none)';
}

function notify(): void {
  const snapshot = events.slice();
  listeners.slice().forEach(listener => listener(snapshot));
}

export function beginGuardNavigation(): number {
  navigationId += 1;
  return navigationId;
}

export function getGuardNavigationId(): number {
  return navigationId;
}

export function recordGuardNavigation(
  hook: string,
  to: Route,
  from: Route|null,
  outcome: GuardNavigationOutcome,
  detail: string,
  id = navigationId,
): void {
  events = events.concat({
    id,
    hook,
    from: routeLabel(from),
    to: routeLabel(to),
    outcome,
    detail,
  });
  notify();
}

export function observeGuardNavigationPromise(
  promise: Promise<any>|void,
  hook: string,
  to: Route,
  from: Route|null,
  id = navigationId,
): void {
  if (!promise) return;
  promise.then(
    () => recordGuardNavigation(hook, to, from, 'resolved', 'navigation transaction resolved', id),
    () => recordGuardNavigation(hook, to, from, 'rejected', 'navigation transaction rejected', id),
  );
}

export function getGuardNavigationEvents(): GuardNavigationEvent[] {
  return events.slice();
}

export function resetGuardNavigationEvents(): void {
  events = [];
  navigationId = 0;
  notify();
}

export function subscribeGuardNavigationEvents(listener: Listener): () => void {
  if (!listeners.includes(listener)) listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  };
}
