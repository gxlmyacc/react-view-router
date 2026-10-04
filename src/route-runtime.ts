import type { NavigationSignal } from './navigation-signal';

export { NavigationSignalController } from './navigation-signal';
export type { NavigationCancelListener, NavigationSignal } from './navigation-signal';

export const ROUTE_RUNTIME_PROTOCOL_VERSION = 1 as const;

export type RouteRuntimeOwner = 'browser' | 'standalone-ssr' | 'framework';

export interface RouteRuntimeDescriptor {
  protocolVersion: typeof ROUTE_RUNTIME_PROTOCOL_VERSION;
  routeId: string;
  owner: RouteRuntimeOwner;
  runtime?: string;
  container?: string;
  payloadRef?: string;
  checksum?: string;
}

export interface RouteRuntimeIdentity {
  path: string;
  depth?: number;
  name?: string;
}

export type CompatibilityStatus =
  | 'supported'
  | 'polyfilled'
  | 'degraded'
  | 'unavailable';

export type RouteFallback =
  | 'client-render'
  | 'legacy-hydrate'
  | 'static-html'
  | 'full-page-navigation'
  | 'error';

export interface RuntimeCompatibilityResult {
  status: CompatibilityStatus;
  fallback?: RouteFallback;
  reason?: string;
}

export type NavigationAction = 'push' | 'replace' | 'pop';

export interface NavigationTransaction<TLocation = unknown> {
  transactionId: string;
  action: NavigationAction;
  to: TLocation;
  from?: TLocation;
  signal: NavigationSignal;
}

export type NavigationResultStatus =
  | 'committed'
  | 'cancelled'
  | 'delegated'
  | 'rejected';

export interface NavigationResult {
  status: NavigationResultStatus;
  reason?: unknown;
}

export interface RouteRuntimeContext<TRoute = unknown, TComponent = unknown> {
  descriptor: RouteRuntimeDescriptor;
  transaction: NavigationTransaction;
  route?: TRoute;
  component?: TComponent;
  viewName?: string;
}

export interface RouteRuntimeAdapter<TContext extends RouteRuntimeContext = RouteRuntimeContext> {
  readonly name: string;
  readonly owner: RouteRuntimeOwner;
  readonly priority?: number;
  readonly supportsPopNavigation?: boolean;
  canHandle(context: TContext): boolean | Promise<boolean>;
  prepare?(context: TContext, signal: NavigationSignal): void | Promise<void>;
  activate(context: TContext): void | Promise<void>;
  update?(context: TContext): void | Promise<void>;
  deactivate?(context: TContext): void | Promise<void>;
  navigate?(transaction: NavigationTransaction): NavigationResult | Promise<NavigationResult>;
  dispose?(): void;
}

export class RouteRuntimeAdapterConflictError extends Error {

  readonly adapterNames: string[];

  constructor(adapterNames: string[]) {
    super(`Multiple route runtime adapters have the same priority: ${adapterNames.join(', ')}`);
    this.name = 'RouteRuntimeAdapterConflictError';
    this.adapterNames = adapterNames;
  }

}

function isRouteRuntimeOwner(owner: unknown): owner is RouteRuntimeOwner {
  return owner === 'browser' || owner === 'standalone-ssr' || owner === 'framework';
}

export function isRouteRuntimeDescriptor(value: unknown): value is RouteRuntimeDescriptor {
  if (!value || typeof value !== 'object') return false;
  const descriptor = value as Partial<RouteRuntimeDescriptor>;
  return descriptor.protocolVersion === ROUTE_RUNTIME_PROTOCOL_VERSION
    && typeof descriptor.routeId === 'string'
    && descriptor.routeId.length > 0
    && isRouteRuntimeOwner(descriptor.owner);
}

export function createRouteRuntimeDescriptor(
  route: RouteRuntimeIdentity,
  viewName = 'default',
  overrides: Partial<RouteRuntimeDescriptor> = {},
): RouteRuntimeDescriptor {
  const identity = `${route.depth || 0}|${route.name || route.path}|${viewName}`;
  return {
    ...overrides,
    protocolVersion: ROUTE_RUNTIME_PROTOCOL_VERSION,
    routeId: overrides.routeId || encodeURIComponent(identity),
    owner: overrides.owner || 'standalone-ssr',
  };
}

export function resolveRuntimeCompatibility(
  descriptor: unknown,
  required = false,
): RuntimeCompatibilityResult {
  if (isRouteRuntimeDescriptor(descriptor)) return { status: 'supported' };

  return {
    status: 'unavailable',
    fallback: required ? 'error' : 'client-render',
    reason: 'Invalid or unsupported route runtime descriptor',
  };
}

/**
 * Selects the highest-priority compatible adapter. Equal highest priorities
 * are treated as an ownership conflict instead of depending on array order.
 */
export function selectRouteRuntimeAdapter<TContext extends RouteRuntimeContext>(
  adapters: RouteRuntimeAdapter<TContext>[],
  context: TContext,
): Promise<RouteRuntimeAdapter<TContext> | null> {
  const accepted: RouteRuntimeAdapter<TContext>[] = [];

  return adapters.reduce<Promise<void>>((pending, adapter) => pending.then(() => (
    Promise.resolve(adapter.canHandle(context)).then((canHandle) => {
      if (canHandle) accepted.push(adapter);
    })
  )), Promise.resolve()).then(() => {
    if (accepted.length === 0) return null;

    let highestPriority = accepted[0].priority || 0;
    accepted.forEach((adapter) => {
      const priority = adapter.priority || 0;
      if (priority > highestPriority) highestPriority = priority;
    });

    const selected = accepted.filter((adapter) => (adapter.priority || 0) === highestPriority);
    if (selected.length > 1) {
      throw new RouteRuntimeAdapterConflictError(selected.map((adapter) => adapter.name));
    }
    return selected[0];
  });
}
