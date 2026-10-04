import type ReactViewRouter, { Route } from 'react-view-router';

export interface SharedDemoProps {
  router?: ReactViewRouter;
}

export interface GuardEvent {
  label: string;
  navigationId: number;
  scope: 'router' | 'route' | 'component' | string;
  owner: string;
  hook: string;
  from: string;
  to: string;
  outcome: 'continue' | 'abort' | 'redirect' | 'completed' | 'callback' | 'observed';
  detail: string;
  sequence?: number;
}

// Keep this declaration independent from a specific @types/react major so the
// same source package can be consumed by the React 16–19 launchers.
declare const SharedDemo: (props: SharedDemoProps) => any;

export const routes: ReactViewRouter['routes'];
export const router: ReactViewRouter;
export function describeGuardRoute(route?: Route | null): string;
export function createGuardEvent(label: string, details?: Partial<GuardEvent>): GuardEvent;
export function getGuardEvents(): GuardEvent[];
export function resetGuardEvents(): void;
export function recordGuardEvent(event: GuardEvent | string): void;
export function subscribeGuardEvents(listener: (events: GuardEvent[]) => void): () => void;

export default SharedDemo;
