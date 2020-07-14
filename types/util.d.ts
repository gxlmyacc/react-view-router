import React from 'react';
import matchPath from './match-path';
import { ConfigRouteArray, ConfigRoute, MatchedRoute, RouteHistoryLocation, Route, RouteGuardInterceptor, RouteRedirectFn, RouteLocation } from './types';
import { ReactViewContainer, RouterViewComponent as RouterView } from './router-view';
declare function nextTick(cb: () => void, ctx?: object): Promise<unknown> | undefined;
declare function innumerable(obj: object, key: string, value: any, options?: PropertyDescriptor): object;
declare function normalizePath(path: string): string;
declare function normalizeRoute(route: any, parent: any, depth?: number, force?: any): ConfigRoute;
declare function normalizeRoutes(routes: ConfigRouteArray, parent?: any, depth?: number, force?: boolean): ConfigRouteArray;
declare function normalizeRoutePath(path: string, route?: any, append?: boolean, basename?: string): string;
declare type RoutesHandler = (r: any) => ConfigRouteArray;
declare function matchRoutes(routes: ConfigRouteArray | RoutesHandler, to: any, parent?: any, branch?: {
    route: any;
    match: any;
}[]): {
    route: any;
    match: any;
}[];
declare function normalizeLocation(to: any, route?: any, append?: boolean, basename?: string, mode?: string): RouteHistoryLocation | null;
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
declare function resolveRedirect(to: string | RouteRedirectFn, route: MatchedRoute, from?: Route): "" | RouteHistoryLocation;
declare function warn(...args: any[]): void;
declare function afterInterceptors(interceptors: RouteGuardInterceptor[], to: Route, from: Route | null): Promise<void>;
declare type RenderRouteOption = {
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
}): boolean;
declare function isRouteChanged(prev: ConfigRoute | MatchedRoute | null, next: ConfigRoute | MatchedRoute | null): boolean;
declare function isRoutesChanged(prevs: ConfigRoute[], nexts: ConfigRoute[]): boolean;
declare function getHostRouterView(ctx: any, continueCb?: any): RouterView<import("./router-view").RouterViewProps, import("./router-view").RouterViewState, any> | null;
declare function getParentRoute(ctx: any): MatchedRoute | null;
declare function isAbsoluteUrl(to: any): boolean;
declare function getCurrentPageHash(to: string): string;
declare function getSessionStorage(key: string, json?: boolean): any;
declare function setSessionStorage(key: string, value?: string): void;
declare function isRoute(route: any): route is Route;
export { camelize, flatten, warn, once, mergeFns, isAcceptRef, nextTick, isNull, isPlainObject, isFunction, isMatchedRoute, isLocation, isHistoryLocation, isPropChanged, isRouteChanged, isRoutesChanged, isAbsoluteUrl, isRoute, resolveRedirect, normalizePath, normalizeRoute, normalizeRoutes, normalizeRoutePath, normalizeLocation, normalizeProps, matchPath, matchRoutes, renderRoute, innumerable, afterInterceptors, getParentRoute, getHostRouterView, getCurrentPageHash, getSessionStorage, setSessionStorage, };
