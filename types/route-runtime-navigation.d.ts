import { Action } from './history';
import { RouteLazy } from './route-lazy';
import { NavigationResult, RouteRuntimeAdapter } from './route-runtime';
import type { MatchedRoute, Route } from './types';
export declare function getFrameworkRouteRuntimeTarget(route: Route): {
    lazy: RouteLazy<any>;
    matched: MatchedRoute;
    viewName: string;
} | null;
export declare class RouteRuntimeNavigationGateway {
    private adapters;
    private activeController;
    get hasAdapters(): boolean;
    register(adapter: RouteRuntimeAdapter): () => void;
    cancel(reason?: unknown): void;
    navigate(route: Route, action?: Action, from?: Route | null, fromEvent?: boolean): Promise<NavigationResult | null> | null;
}
