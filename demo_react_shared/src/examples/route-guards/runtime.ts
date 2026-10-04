import type { Route } from 'react-view-router';
import {
  createGuardEvent,
  recordGuardEvent,
} from './guard-events';
import type { GuardEvent, GuardEventDetails } from './guard-events';

export interface DemoStore {
  loggedIn: boolean;
}

export interface GuardRuntimeOptions {
  record?: (event: GuardEvent) => void;
  shouldBlock?: (owner: string, hook: string, to: Route, from: Route | null) => boolean;
  loggedIn?: boolean;
}

let eventSink: (event: GuardEvent) => void = recordGuardEvent;
let shouldBlock: NonNullable<GuardRuntimeOptions['shouldBlock']> = () => false;
let navigationId = 0;
const store: DemoStore = { loggedIn: false };

export function configureGuardRuntime(options: GuardRuntimeOptions = {}): void {
  eventSink = options.record || recordGuardEvent;
  shouldBlock = options.shouldBlock || (() => false);
  navigationId = 0;
  store.loggedIn = Boolean(options.loggedIn);
}

export function getGuardStore(): DemoStore {
  return store;
}

export function isGuardBlocked(owner: string, hook: string, to: Route, from: Route | null): boolean {
  return shouldBlock(owner, hook, to, from);
}

export function beginGuardNavigation(): void {
  navigationId += 1;
}

export function emitGuardEvent(label: string, details: GuardEventDetails = {}): void {
  eventSink(createGuardEvent(label, { ...details, navigationId }));
}
