import type { Route } from 'react-view-router';

export type GuardOutcome = 'continue' | 'abort' | 'redirect' | 'completed' | 'callback' | 'observed';

export interface GuardEvent {
  label: string;
  navigationId: number;
  scope: string;
  owner: string;
  hook: string;
  from: string;
  to: string;
  outcome: GuardOutcome;
  detail: string;
  sequence?: number;
}

export interface GuardEventDetails {
  navigationId?: number;
  scope?: string;
  owner?: string;
  hook?: string;
  from?: Route | null;
  to?: Route | null;
  outcome?: GuardOutcome;
  detail?: string;
}

type GuardEventListener = (events: GuardEvent[]) => void;

const listeners: GuardEventListener[] = [];
let events: GuardEvent[] = [];
let sequence = 0;

export function describeGuardRoute(route?: Route | null): string {
  if (!route) return '(none)';
  return route.fullPath || route.path || '(empty route)';
}

export function createGuardEvent(label: string, details: GuardEventDetails = {}): GuardEvent {
  const parts = label.split(':');
  return {
    label,
    navigationId: details.navigationId || 0,
    scope: details.scope || parts[0] || 'unknown',
    owner: details.owner || parts.slice(0, -1).join(':') || 'unknown',
    hook: details.hook || parts[parts.length - 1] || label,
    from: describeGuardRoute(details.from),
    to: describeGuardRoute(details.to),
    outcome: details.outcome || 'observed',
    detail: details.detail || '',
  };
}

export function getGuardEvents(): GuardEvent[] {
  return events.slice();
}

export function resetGuardEvents(): void {
  events = [];
  sequence = 0;
  listeners.slice().forEach(listener => listener(getGuardEvents()));
}

export function recordGuardEvent(event: GuardEvent | string): void {
  const normalized = typeof event === 'string' ? createGuardEvent(event) : event;
  events = events.concat({ ...normalized, sequence: ++sequence });
  listeners.slice().forEach(listener => listener(getGuardEvents()));
}

export function subscribeGuardEvents(listener: GuardEventListener): () => void {
  if (!listeners.includes(listener)) listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  };
}
