/// <reference types="react" />
export declare type RouteEvent = (ok: boolean, to: Route) => void;
export declare type ReactVueRouterMode = 'hash' | 'browser' | 'history' | 'memory' | 'abstract';
export declare type ReactVueRouterOptions = {
    basename?: string;
    base?: string;
    mode?: ReactVueRouterMode;
    manual?: boolean;
    history?: any;
    [key: string]: any;
};
export declare type RouteRedirectFn = (this: ConfigRoute, from?: Route) => string;
export declare type RouteIndexFn = (routes: ConfigRouteArray) => string;
export declare type RouteNextFn = (ok?: any, ...args: any[]) => void;
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
export interface RouteHistoryLocation {
    path?: string;
    pathname: string;
    search: string;
    fullPath: string;
    query: Partial<any>;
    isReplace: boolean;
    isRedirect: boolean;
    onComplete?: RouteEvent;
    onAbort?: RouteEvent;
    onInit?: RouteEvent;
    redirectedFrom?: Route | null;
}
export interface UseRouteGuardsInfo {
    componentClass?: React.FunctionComponent | React.ComponentClass;
    children?: any;
    beforeRouteEnter?: RouteBeforeGuardFn;
    beforeRouteLeave?: RouteBeforeGuardFn;
    afterRouteEnter?: RouteAfterGuardFn;
    afterRouteLeave?: RouteAfterGuardFn;
    beforeRouteUpdate?: RouteAfterGuardFn;
}
export interface RouteLazyUpdater {
    (component: (React.FunctionComponent | React.ComponentClass) & {
        __children?: any[] | ((r: any) => any[]);
    }): React.FunctionComponent | React.ComponentClass | undefined;
}
export declare type matchPathResult = {
    path?: string;
    url: string;
    isExact?: boolean;
    params: Partial<any>;
};
export interface ConfigRoute {
    path: string;
    subpath: string;
    depth: number;
    exact: boolean;
    meta: Partial<any>;
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
    redirect?: string | RouteRedirectFn;
    index?: string | RouteIndexFn;
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
export declare type MatchedRoute = {
    path: string;
    subpath: string;
    depth: number;
    meta: Partial<any>;
    index?: string | RouteIndexFn;
    redirect?: string | RouteRedirectFn;
    config: ConfigRoute;
    params: Partial<any>;
    componentInstances: {
        [key: string]: any;
    };
    viewInstances: {
        [key: string]: any;
    };
    [key: string]: any;
};
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
    name?: string;
    install?(router: any): void;
    uninstall?(router: any): void;
    [event: string]: any | ((...args: any[]) => any);
}
export interface lazyResovleFn {
    (interceptors: RouteGuardInterceptor[], index: number): Promise<RouteBeforeGuardFn>;
    lazy?: boolean;
    route?: MatchedRoute;
}
declare global {
}
