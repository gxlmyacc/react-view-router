import type { NavigationSignal } from './navigation-signal';
export { NavigationSignalController } from './navigation-signal';
export type { NavigationCancelListener, NavigationSignal } from './navigation-signal';
export declare const ROUTE_RUNTIME_PROTOCOL_VERSION: 1;
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
export type CompatibilityStatus = 'supported' | 'polyfilled' | 'degraded' | 'unavailable';
export type RouteFallback = 'client-render' | 'legacy-hydrate' | 'static-html' | 'full-page-navigation' | 'error';
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
export type NavigationResultStatus = 'committed' | 'cancelled' | 'delegated' | 'rejected';
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
export declare class RouteRuntimeAdapterConflictError extends Error {
    readonly adapterNames: string[];
    constructor(adapterNames: string[]);
}
export declare function isRouteRuntimeDescriptor(value: unknown): value is RouteRuntimeDescriptor;
export declare function createRouteRuntimeDescriptor(route: RouteRuntimeIdentity, viewName?: string, overrides?: Partial<RouteRuntimeDescriptor>): RouteRuntimeDescriptor;
export declare function resolveRuntimeCompatibility(descriptor: unknown, required?: boolean): RuntimeCompatibilityResult;
/**
 * Selects the highest-priority compatible adapter. Equal highest priorities
 * are treated as an ownership conflict instead of depending on array order.
 */
export declare function selectRouteRuntimeAdapter<TContext extends RouteRuntimeContext>(adapters: RouteRuntimeAdapter<TContext>[], context: TContext): Promise<RouteRuntimeAdapter<TContext> | null>;
