import React from 'react';
import matchPath from './match-path';
import { ConfigRouteArray, ConfigRoute, MatchedRoute, RouteHistoryLocation, Route, RouteGuardInterceptor, RouteRedirectFn, RouteLocation, matchPathResult, NormalizeRouteOptions, RouteGuardsInfoHooks, UserConfigRoute } from './types';
import { ReactViewContainer, RouterViewComponent as RouterView } from './router-view';
import ReactViewRouter from '.';
import { HistoryFix } from './history-fix';
declare function nextTick(cb: () => void, ctx?: object): Promise<unknown> | undefined;
declare function readonly(obj: object, key: string, value: any, options?: PropertyDescriptor): object;
declare function innumerable(obj: object, key: string, value: any, options?: PropertyDescriptor): object;
declare function normalizePath(path: string): string;
declare function normalizeRoute(route: UserConfigRoute, parent?: ConfigRoute | null, options?: NormalizeRouteOptions): ConfigRoute;
declare function walkRoutes(routes: ConfigRouteArray, walkFn: (route: ConfigRoute, routeIndex: number, routes: ConfigRouteArray) => boolean | void): boolean;
declare function normalizeRoutes(routes: UserConfigRoute[], parent?: ConfigRoute | null, options?: NormalizeRouteOptions): ConfigRouteArray;
declare function normalizeRoutePath(path: string, route?: Route | MatchedRoute | ConfigRoute | RouteHistoryLocation | RouteLocation | null, append?: boolean, basename?: string): string;
declare type RouteBranchInfo = {
    route: any;
    match: matchPathResult;
};
interface RouteBranchArray extends Array<RouteBranchInfo> {
    unmatchedPath?: string;
}
declare type RoutesHandlerCacheHandler = (props: {
    to: RouteHistoryLocation | Route | string;
    parent?: ConfigRoute;
    level: number;
    prevChildren?: ConfigRouteArray;
}) => boolean;
interface RoutesHandler {
    (r: {
        to: RouteHistoryLocation;
        parent?: ConfigRoute;
        branch: RouteBranchArray;
        prevChildren?: ConfigRouteArray;
    }): ConfigRouteArray;
    _ctx?: Partial<any>;
    _normalized?: boolean;
    cache?: boolean | RoutesHandlerCacheHandler;
}
declare function matchRoutes(routes: ConfigRouteArray | RoutesHandler, to: RouteHistoryLocation | Route | string, parent?: ConfigRoute, branch?: RouteBranchArray, level?: number): RouteBranchArray;
declare function normalizeLocation(to: any, route?: Route | MatchedRoute | ConfigRoute | RouteHistoryLocation | RouteLocation | null, { append, basename, mode, resolvePathCb }?: {
    append?: boolean;
    basename?: string;
    mode?: string;
    resolvePathCb?: (path: string, to: RouteHistoryLocation) => string;
}): RouteHistoryLocation | null;
declare function isPlainObject(obj: any): obj is {
    [key: string]: any;
};
declare function isFunction(value: any): value is Function;
declare function isNull(value: any): value is (null | undefined);
declare function isMatchedRoute(value: any): value is MatchedRoute;
declare function isLocation(v: any): v is RouteLocation;
declare function isHistoryLocation(v: any): v is RouteHistoryLocation;
declare function normalizeProps(props: {
    [key: string]: any;
} | any[]): {
    [key: string]: any;
};
declare function once(fn: ((...args: any) => any) | null, ctx?: any): (...args: any[]) => any;
declare function isAcceptRef(v: any): boolean;
declare function mergeFns(...fns: any[]): (...args: any) => undefined;
declare function resolveRedirect(to: string | RouteRedirectFn, route: MatchedRoute, from?: Route): "" | RouteHistoryLocation<import("./history").State>;
declare function warn(...args: any[]): void;
declare function afterInterceptors(interceptors: RouteGuardInterceptor[], to: Route, from: Route | null): Promise<void>;
declare type RenderRouteOption = {
    router?: ReactViewRouter;
    container?: ReactViewContainer;
    name?: string;
    ref?: any;
    params?: Partial<any>;
    query?: Partial<any>;
};
declare function renderRoute(route: ConfigRoute | MatchedRoute | null | undefined, routes: ConfigRoute[], props: any, children: React.ReactNode | null, options?: RenderRouteOption): any;
declare function flatten(array: any[]): any[];
declare function camelize(str: string): string;
declare function isPropChanged(prev: {
    [key: string]: any;
}, next: {
    [key: string]: any;
}, onChanged?: (key: string, newVal: any, oldVal: any) => boolean): boolean;
declare function isRouteChanged(prev: ConfigRoute | MatchedRoute | null, next: ConfigRoute | MatchedRoute | null): boolean;
declare function isRoutesChanged(prevs: ConfigRoute[], nexts: ConfigRoute[]): boolean;
declare function getHostRouterView(ctx: any, continueCb?: any): RouterView<import("./router-view").RouterViewProps, import("./router-view").RouterViewState, any> | null;
declare function getParentRoute(ctx: any): MatchedRoute | null;
declare function isAbsoluteUrl(to: any): boolean;
declare function getCurrentPageHash(to: string): string;
declare function getSessionStorage(key: string, json?: boolean): any;
declare function setSessionStorage(key: string, value?: any): void;
declare function isRoute(route: any): route is Route;
declare function isReactViewRouter(v: any): v is ReactViewRouter;
declare function isHistory(v: any): v is HistoryFix;
declare function isRouteGuardInfoHooks(v: any): v is RouteGuardsInfoHooks;
declare function isReadonly(obj: any, key: string): boolean;
export { camelize, flatten, warn, once, mergeFns, isAcceptRef, nextTick, isNull, isPlainObject, isFunction, isMatchedRoute, isLocation, isHistoryLocation, isPropChanged, isRouteChanged, isRoutesChanged, isAbsoluteUrl, isRoute, isReactViewRouter, isRouteGuardInfoHooks, isHistory, isReadonly, resolveRedirect, normalizePath, normalizeRoute, normalizeRoutes, walkRoutes, normalizeRoutePath, normalizeLocation, normalizeProps, matchPath, matchRoutes, renderRoute, innumerable, readonly, afterInterceptors, getParentRoute, getHostRouterView, getCurrentPageHash, getSessionStorage, setSessionStorage, };
