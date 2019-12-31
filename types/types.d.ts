/// <reference types="react" />
/// <reference types="node" />
import { Location, History } from 'history-fix';
import ReactViewRouter from './router';
export declare type RouteEvent = (ok: boolean, to: Route | null) => void;
export declare type ReactVueRouterMode = 'hash' | 'browser' | 'history' | 'memory' | 'abstract';
export interface ReactVueRouterOptions extends Partial<any> {
    basename?: string;
    base?: string;
    mode?: ReactVueRouterMode;
    manual?: boolean;
    history?: History;
    initialEntries?: string[];
    initialIndex?: number;
    keyLength?: number;
}
export declare type RouteNextResult = boolean | Error | Function | string | null | RouteLocation;
export declare type RouteRedirectFn = (this: ConfigRoute, from?: Route) => string;
export declare type RouteIndexFn = (routes: ConfigRouteArray) => string;
export declare type RouteNextFn = (ok?: RouteNextResult, ...args: any[]) => void;
export declare type RouteChildrenFn = () => ConfigRoute[];
export declare type RouteErrorCallback = (error: Error) => void;
export interface RouteBeforeGuardFn {
    (to: Route, from: Route | null, next: RouteNextFn, route?: MatchedRoute): void;
    route?: MatchedRoute;
    global?: boolean;
}
export interface RouteAfterGuardFn {
    (to: Route, from: Route | null, route?: MatchedRoute): void;
    route?: MatchedRoute;
    global?: boolean;
}
export declare type RouteGuardInterceptor = RouteBeforeGuardFn | RouteAfterGuardFn | lazyResovleFn;
export declare type RouteBindInstanceFn = (fn: RouteGuardInterceptor, name: string, ci?: any, r?: MatchedRoute) => RouteGuardInterceptor | null;
export declare type RouteLocation = {
    path?: string;
    query?: Partial<any>;
    params?: Partial<any>;
    append?: boolean;
    _routeNormalized?: boolean;
};
export interface RouteHistoryLocation extends Location {
    path: string;
    fullPath: string;
    query: Partial<any>;
    isReplace: boolean;
    isRedirect: boolean;
    onComplete?: RouteEvent;
    onAbort?: RouteEvent;
    onInit?: RouteEvent;
    redirectedFrom?: Route | null;
    _routeNormalized?: boolean;
}
export interface UseRouteGuardsInfo {
    componentClass?: React.ComponentType;
    children?: any;
    beforeRouteEnter?: RouteBeforeGuardFn;
    beforeRouteLeave?: RouteBeforeGuardFn;
    afterRouteEnter?: RouteAfterGuardFn;
    afterRouteLeave?: RouteAfterGuardFn;
    beforeRouteUpdate?: RouteAfterGuardFn;
}
export interface RouteLazyUpdater {
    (component: (React.ComponentType) & {
        __children?: any[] | ((r: any) => any[]);
    }): React.ComponentType | undefined;
}
export declare type matchPathResult = {
    path?: string;
    url: string;
    isExact?: boolean;
    params: Partial<any>;
};
export interface CommonRoute {
    path: string;
    subpath: string;
    depth: number;
    meta: Partial<any>;
    index?: string | RouteIndexFn;
    redirect?: string | RouteRedirectFn;
    [key: string]: any;
}
export interface ConfigRoute extends CommonRoute {
    exact: boolean;
    parent?: ConfigRoute;
    children?: ConfigRoute[] | RouteChildrenFn;
    component?: React.Component;
    components: {
        default?: any;
        [key: string]: any;
    };
    props?: Partial<any>;
    paramsProps?: Partial<any>;
    queryProps?: Partial<any>;
    _pending: {
        completeCallbacks: {
            [key: string]: ((ci: any) => any) | null;
        };
    };
    [guardName: string]: any | ((to: Route, from: Route, next?: RouteNextFn) => void);
}
export declare type matchRoutesResult = {
    match: matchPathResult;
    route: ConfigRoute;
};
export interface MatchedRoute extends CommonRoute {
    config: ConfigRoute;
    params: Partial<any>;
    componentInstances: {
        [key: string]: any;
    };
    viewInstances: {
        [key: string]: any;
    };
}
export interface Route {
    action: string;
    url: string;
    basename: string;
    path: string;
    fullPath: string;
    search: string;
    isRedirect: boolean;
    isReplace: boolean;
    query: Partial<any>;
    params: Partial<any>;
    matched: MatchedRoute[];
    meta: Partial<any>;
    onAbort?: RouteEvent;
    onComplete?: RouteEvent;
    onInit?: RouteEvent;
    redirectedFrom?: Route;
}
export interface ConfigRouteArray extends Array<ConfigRoute> {
    _normalized?: boolean;
}
export interface ReactViewRoutePlugin {
    name: string;
    install?(router: any): void;
    uninstall?(router: any): void;
    onRouteEnterNext?(route: MatchedRoute, ci: React.Component, prevRes: any): any;
    onRouteLeaveNext?(route: MatchedRoute, ci: React.Component, prevRes: any): any;
    onRouteing?(isRouting: boolean): void;
    onRouteChange?(route: Route, router: ReactViewRouter): void;
    onResolveComponent?(nc: React.ComponentType, route: ConfigRoute): React.ComponentType | undefined;
    [event: string]: any | ((...args: any[]) => any);
}
export interface lazyResovleFn {
    (interceptors: RouteGuardInterceptor[], index: number): Promise<RouteBeforeGuardFn>;
    lazy?: boolean;
    route?: MatchedRoute;
}
export interface ReactVueLike {
    _willUnmount(): void;
    readonly $route: Route | null;
    readonly $routeIndex: number;
    readonly $matchedRoute: MatchedRoute | null;
}
export interface ReactVueLikeClass {
    new (props: any): ReactVueLike;
    flow(fn: Function): Function;
}
declare global {
    interface EsModule extends NodeModule {
        __esModule?: boolean;
        default: any;
    }
}
