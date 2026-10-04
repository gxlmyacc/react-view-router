import ReactViewRouter from './router';
import { RouteLazy } from './route-lazy';
import { ConfigRoute, MatchedRoute, NormalizedConfigRouteArray, ReactAllComponentType, UserConfigRoute } from './types';
import { RouteRuntimeDescriptor } from './route-runtime';
export interface HydratableRouteInfo {
    route: ConfigRoute;
    viewName: string;
    lazy: RouteLazy;
    descriptor: RouteRuntimeDescriptor;
}
export interface MatchedHydratableRouteInfo extends HydratableRouteInfo {
    matchedRoute: MatchedRoute;
    router: ReactViewRouter;
}
export interface ResolvedHydratableRouteInfo extends MatchedHydratableRouteInfo {
    component: ReactAllComponentType;
}
type RouteList = UserConfigRoute[] | ConfigRoute[] | NormalizedConfigRouteArray;
/** Returns every discoverable `hydrate: true` route view without loading it. */
export declare function collectHydratableRoutes(routes: RouteList): HydratableRouteInfo[];
/** Matches a request with ReactViewRouter's own nested-route matching rules. */
export declare function matchHydratableRoutes(routes: RouteList, requestUrl: string): MatchedHydratableRouteInfo[];
/** Matches and loads the hydratable components needed by one server request. */
export declare function resolveHydratableRoutes(routes: RouteList, requestUrl: string): Promise<ResolvedHydratableRouteInfo[]>;
/** Applies the same route component wrapper on the server and in hydration. */
export declare function wrapHydratableRouteElement(routeInfo: ResolvedHydratableRouteInfo, element: any): any;
export {};
