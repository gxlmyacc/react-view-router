import React from 'react';
import { Location, History, State, HashType, TransitionCallback, Action, To, HistoryType } from '../history';
import { RouteLazy } from '../route-lazy';
import { RouteComponentGuards } from '../route-guard';
import ReactViewRouter from '../router';
import { RouterViewComponent } from '../router-view';
export * from './utils';
export declare type ReactViewRouterGlobal = {
    contexts: {
        [key: string]: React.Context<any>;
    };
    historys: {
        hash?: HistoryFix;
        browser?: HistoryFix;
    };
};
export declare type ParseQueryProps = {
    [key: string]: (val: string, key?: string, query?: string) => any;
};
export declare type RouteEvent = (ok: boolean, to: Route | null, reason?: any) => void;
export declare type RouteInterceptorCallback<T = boolean, S = any> = (ok: T, payload?: S | null) => void;
export declare type RouteInterceptor = (location: RouteHistoryLocation | Route, callback: (ok: boolean | RouteInterceptorCallback) => void) => void;
export declare type RouteInterceptorItem = {
    interceptor: RouteInterceptor;
    router: ReactViewRouter | null;
    payload?: any;
};
export interface LazyImportMethod<P = any> {
    (route: ConfigRoute, key: string, router: ReactViewRouter, options: Partial<any>): P | Promise<P>;
    readonly __lazyImportMethod?: true;
}
export declare type ReactAllComponentType<P = any> = React.ComponentType<P> | React.ForwardRefExoticComponent<P>;
export interface HistoryStackInfo {
    pathname: string;
    search: string;
    index: number;
    timestamp: number;
    query: RouteQuery;
}
export declare type History4Options = {
    getUserConfirmation?: GetUserConfirmation;
};
export interface HistoryFix extends History {
    isHistoryInstance: boolean;
    interceptors: RouteInterceptorItem[];
    stacks: HistoryStackInfo[];
    _unblock?: () => void;
    interceptorTransitionTo: (interceptor: RouteInterceptor, router: ReactViewRouter) => () => void;
    createHistory4: (options?: History4Options) => History4;
    destroy?: () => void;
}
export interface NormalizeRouteOptions {
    force?: boolean;
}
export interface ReactViewRouterMoreOptions extends Partial<any> {
    manual?: boolean;
    rememberInitialRoute?: boolean;
    inheritProps?: boolean;
    routes?: ConfigRouteArray;
    hashType?: HashType;
    queryProps?: ParseQueryProps;
    history?: HistoryFix;
    pathname?: string;
    install?: (vuelike: any, options: {
        App?: any;
    }) => void;
}
export interface ReactViewRouterOptions extends ReactViewRouterMoreOptions {
    name?: string;
    basename?: string;
    mode?: HistoryType | HistoryFix;
}
export declare type RouteNextResult = unknown | boolean | Error | Function | string | null | RouteLocation;
export declare type RouteRedirectFn = (this: ConfigRoute, from?: Route, isInit?: boolean) => string;
export declare type RouteIndexFn = (routes: ConfigRouteArray) => string;
export declare type RouteAbortFn = (this: ConfigRoute, from?: Route, isInit?: boolean) => boolean | string | Error;
export declare type RouteNextFn = (ok?: RouteNextResult, ...args: any[]) => void;
export interface RouteChildrenFn {
    (parent: ConfigRoute | undefined | null): ConfigRouteArray;
}
export interface NormalizedRouteChildrenFn extends RouteChildrenFn {
    (this: ConfigRoute | undefined): ConfigRouteArray;
    _normalized?: boolean;
    cache?: {
        routes?: ConfigRouteArray;
    };
}
export declare type RouteErrorCallback = (error: Error) => void;
export declare type RouteResolveNameFn = (name: string, options: any | RouteHistoryLocation, router: ReactViewRouter, events?: {
    onComplete?: RouteEvent;
    onAbort?: RouteEvent;
}) => string | true | null | void;
export interface RouteBeforeGuardFn {
    (to: Route, from: Route | null, next: RouteNextFn, options?: {
        route?: MatchedRoute;
        router?: ReactViewRouter;
    }): void;
    instance?: any;
    route?: MatchedRoute;
    global?: boolean;
}
export interface RouteAfterGuardFn {
    (to: Route, from: Route | null, route?: MatchedRoute): void;
    instance?: any;
    route?: MatchedRoute;
    global?: boolean;
}
export declare type RouteGuardInterceptor = RouteBeforeGuardFn | RouteAfterGuardFn | LazyResolveFn;
export declare type OnBindInstance<T = any> = (fn: T, name: string, ci: any, r: MatchedRoute) => RouteGuardInterceptor | null;
export declare type OnGetLazyResovle = (lazyResovleFn: LazyResolveFn, hook: (cb: () => void) => void) => void;
export declare type RouteComponentToResolveFn<T = any> = (c: any, componentKey: string) => T[];
export declare type RouteLocation = {
    path?: string;
    query?: RouteQuery;
    params?: RouteParams;
    append?: boolean;
    absolute?: boolean | HistoryType;
    delta?: number;
    route?: ConfigRoute;
    backIfVisited?: boolean | 'full-matcth';
    pendingIfNotPrepared?: boolean;
    _routeNormalized?: boolean;
};
export interface RouteHistoryLocation<S extends State = State> extends Location<S> {
    action?: Action;
    basename?: string;
    path: string;
    fullPath: string;
    query: RouteQuery;
    params?: Record<string, any>;
    delta: number;
    absolute?: boolean;
    isReplace: boolean;
    isRedirect: boolean;
    onComplete?: RouteEvent;
    onAbort?: RouteEvent;
    onInit?: RouteEvent;
    redirectedFrom?: Route | null;
    fromEvent?: boolean;
    _routeNormalized?: boolean;
}
export interface RouteGuardsInfo extends Partial<any> {
    beforeRouteLeave?: RouteBeforeGuardFn;
    beforeRouteResolve?: RouteAfterGuardFn;
    afterRouteLeave?: RouteAfterGuardFn;
    beforeRouteUpdate?: RouteAfterGuardFn;
}
export interface RouteGuardsInfoHOC extends RouteGuardsInfo {
    componentClass?: ReactAllComponentType;
    children?: any;
    beforeRouteEnter?: RouteBeforeGuardFn;
}
export interface RouteGuardsInfoHooks extends RouteGuardsInfo {
    __routeGuardInfoHooks: true;
}
export interface RouteLazyUpdater {
    (component: (ReactAllComponentType) & {
        __children?: any[] | ((r: any) => any[]);
    }): ReactAllComponentType | undefined;
}
export declare type matchPathResult = {
    path: string;
    url: string;
    regx: RegExp;
    isExact?: boolean;
    isNull?: boolean;
    params: RouteParams;
};
export interface CommonRoute {
    path: string;
    name?: string;
    index?: ':first' | string | RouteIndexFn;
    redirect?: string | RouteRedirectFn;
    abort?: boolean | string | RouteAbortFn;
    [key: string]: any;
}
export declare type UserConfigRoutePropsNormalItem = {
    type: boolean | null | ((value: any) => any);
    default?: string | number | boolean | null | undefined | (() => any);
};
export declare type UserConfigRoutePropsNormal = Record<string, UserConfigRoutePropsNormalItem> | Record<string, Record<string, UserConfigRoutePropsNormalItem | boolean | Array<string>>>;
export declare type UserConfigRouteProps = boolean | UserConfigRoutePropsNormal | Array<string>;
export interface UserConfigRoute extends CommonRoute {
    exact?: boolean;
    parent?: ConfigRoute;
    children?: UserConfigRoute[] | ConfigRouteArray | RouteChildrenFn | NormalizedRouteChildrenFn;
    component?: ReactAllComponentType | RouteLazy | RouteComponentGuards;
    components?: {
        default?: any;
        [key: string]: any;
    };
    props?: UserConfigRouteProps;
    paramsProps?: UserConfigRouteProps;
    queryProps?: UserConfigRouteProps;
    meta?: RouteMeta;
    beforeLeave?: RouteBeforeGuardFn;
    beforeResolve?: RouteAfterGuardFn;
    afterLeave?: RouteAfterGuardFn;
    beforeUpdate?: RouteAfterGuardFn;
}
export interface ConfigRoute extends UserConfigRoute {
    subpath: string;
    depth: number;
    components: {
        default?: any;
        [key: string]: any;
    };
    meta: RouteMeta;
    children: ConfigRouteArray | RouteChildrenFn;
    _pending: {
        completeCallbacks: {
            [key: string]: ((ci: any) => any) | null;
        };
    };
}
export declare type matchRoutesResult = {
    match: matchPathResult;
    route: ConfigRoute;
};
export declare type RouteBranchInfo = {
    route: any;
    match: matchPathResult;
};
export interface RouteBranchArray extends Array<RouteBranchInfo> {
    unmatchedPath?: string;
}
export declare type MatchedRouteGuard<T> = {
    guard: T;
    instance?: any;
    called?: boolean;
    lazy?: boolean;
};
export interface MatchedRoute extends CommonRoute {
    subpath: string;
    depth: number;
    config: ConfigRoute;
    params: RouteParams;
    readonly meta: RouteMeta;
    metaComputed: RouteComputedMeta;
    regx: RegExp;
    isNull?: boolean;
    componentInstances: {
        [key: string]: any;
    };
    viewInstances: {
        [key: string]: RouterViewComponent;
    };
    guards: {
        readonly beforeEnter: MatchedRouteGuard<RouteBeforeGuardFn | LazyResolveFn>[];
        readonly beforeResolve: MatchedRouteGuard<RouteAfterGuardFn>[];
        readonly update: MatchedRouteGuard<RouteAfterGuardFn>[];
        readonly beforeLeave: MatchedRouteGuard<RouteBeforeGuardFn>[];
        readonly afterLeave: MatchedRouteGuard<RouteAfterGuardFn>[];
    };
}
export interface MatchedRouteArray extends Array<MatchedRoute> {
    unmatchedPath: string;
    first: MatchedRoute | undefined;
    last: MatchedRoute | undefined;
}
export interface RouteQuery {
    redirect?: string;
    [key: string]: any;
}
export declare type RouteMetaFunction<T = any> = (route: ConfigRoute, routes: ConfigRouteArray, props: {
    router?: ReactViewRouter | null;
    level?: number;
    maxLevel?: number;
    refresh?: () => void;
    [key: string]: any;
}) => T;
export interface RouteMeta {
    title?: string | RouteMetaFunction<string>;
    visible?: boolean | RouteMetaFunction<boolean>;
    commonPage?: boolean | RouteMetaFunction<boolean>;
    [key: string]: any | RouteMetaFunction;
}
export interface RouteComputedMeta {
    readonly title?: string;
    readonly visible?: boolean;
    readonly commonPage?: boolean;
    readonly [key: string]: any;
}
export interface RouteParams {
    [key: string]: any;
}
export interface Route {
    action: Action;
    url: string;
    basename: string;
    path: string;
    fullPath: string;
    search: string;
    isRedirect: boolean;
    isReplace: boolean;
    fromEvent: boolean;
    query: RouteQuery;
    params: RouteParams;
    matched: MatchedRouteArray;
    matchedPath: string;
    readonly meta: RouteMeta;
    readonly metaComputed: RouteComputedMeta;
    delta: number;
    readonly state: Partial<any>;
    onAbort?: RouteEvent;
    onComplete?: RouteEvent;
    onInit?: RouteEvent;
    redirectedFrom?: Route;
    isReactViewRoute: true;
    isComplete: boolean;
}
export interface ConfigRouteArray extends Array<ConfigRoute> {
    _normalized?: boolean;
}
export declare type onRouteChangeEvent = (route: Route, prevRoute: Route, router: ReactViewRouter, prevRes?: any) => void;
export declare type onRouteMetaChangeEvent = (newVal: any, oldVal: any, route: ConfigRoute, router: ReactViewRouter, prevRes?: any) => void;
export declare type onRouteingNextCallback = (ok: boolean, error: any | undefined, options: {
    location: RouteHistoryLocation | Route | null;
    isInit?: boolean;
}) => void;
export declare type ReactViewContainer = (result: React.ReactNode | null, route: ConfigRoute | MatchedRoute, props: Record<string, any>, view: RouterViewComponent) => React.ReactElement;
export interface ReactViewRoutePlugin {
    name?: string;
    install?(router: ReactViewRouter): void;
    uninstall?(router: ReactViewRouter): void;
    onStart?(router: ReactViewRouter, routerOptions: ReactViewRouterOptions, isInit: boolean | undefined, prevRes?: any): void;
    onStop?(router: ReactViewRouter, isInit: boolean | undefined, prevRes?: any): void;
    onRoutesChange?(routes: ConfigRouteArray, originRoutes: ConfigRouteArray, parent?: ConfigRoute | null, parentChildren?: ConfigRouteArray, prevRes?: any): void;
    onRouteGo?(to: RouteHistoryLocation, onComplete: (res: any, _to: Route | null) => void, onAbort: (res: any, _to: Route | null) => void, isReplace: boolean, prevRes?: any): void;
    onRouteEnterNext?(route: MatchedRoute, ci: React.Component, prevRes?: any): void;
    onRouteLeaveNext?(route: MatchedRoute, ci: React.Component, prevRes?: any): void;
    onRouteing?(next: boolean | onRouteingNextCallback | Route, prevRes?: any): void;
    onRouteChange?: onRouteChangeEvent;
    onRouteMetaChange?: onRouteMetaChangeEvent;
    onLazyResolveComponent?(nc: ReactAllComponentType, route: ConfigRoute, prevRes?: any): ReactAllComponentType | undefined;
    onWalkRoute?(route: ConfigRoute, routeIndex: number, routes: ConfigRouteArray, prevRes?: any): void;
    onGetRouteComponentGurads?(interceptors: RouteGuardInterceptor[], route: ConfigRoute, component: any, componentKey: string, guardName: string, options: {
        router: ReactViewRouter;
        onBindInstance?: OnBindInstance;
        onGetLazyResovle?: OnGetLazyResovle;
        toResovle: RouteComponentToResolveFn;
        getGuard: (obj: any, guardName: string) => any;
        replaceInterceptors: (newInterceptors: any[], interceptors: RouteGuardInterceptor[], index: number) => any[];
    }, prevRes?: any): void | boolean;
    onGetRouteInterceptor?(interceptor: any, interceptors: RouteGuardInterceptor[], index: number, prevRes?: any): any;
    onRouteAbort?(to: Route, reason?: any, prevRes?: any): void;
    onViewContainer?(container: ReactViewContainer | undefined, options: {
        routes: MatchedRoute[];
        route: MatchedRoute;
        depth: number;
        router: ReactViewRouter;
        view: RouterViewComponent;
    }, prevRes?: ReactViewContainer): ReactViewContainer | void;
    [event: string]: any | ((...args: any[]) => any);
}
export interface LazyResolveFn {
    (interceptors: RouteGuardInterceptor[], index: number): Promise<RouteBeforeGuardFn>;
    instance?: any;
    lazy?: boolean;
    route?: MatchedRoute;
}
export declare type GetUserConfirmation = (result: string, callback: TransitionCallback) => void;
export interface History4<S extends State = State> {
    readonly isHistory4: true;
    readonly owner: HistoryFix;
    readonly length: number;
    readonly type: HistoryType;
    /**
     * The last action that modified the current location. This will always be
     * Action.Pop when a history instance is first created. This value is mutable.
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.action
     */
    readonly action: Action;
    /**
     * The current location. This value is mutable.
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.location
     */
    readonly location: Location<S>;
    /**
     * Returns a valid href for the given `to` value that may be used as
     * the value of an <a href> attribute.
     *
     * @param to - The destination URL
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.createHref
     */
    createHref(to: To): string;
    /**
     * Pushes a new location onto the history stack, increasing its length by one.
     * If there were any entries in the stack after the current one, they are
     * lost.
     *
     * @param to - The new URL
     * @param state - Data to associate with the new location
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.push
     */
    push(to: To, state?: S): void;
    /**
     * Replaces the current location in the history stack with a new one.  The
     * location that was replaced will no longer be available.
     *
     * @param to - The new URL
     * @param state - Data to associate with the new location
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.replace
     */
    replace(to: To, state?: S): void;
    /**
     * Navigates `n` entries backward/forward in the history stack relative to the
     * current index. For example, a "back" navigation would use go(-1).
     *
     * @param delta - The delta in the stack index
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.go
     */
    go(delta: number): void;
    /**
     * Navigates to the previous entry in the stack. Identical to go(-1).
     *
     * Warning: if the current location is the first location in the stack, this
     * will unload the current document.
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.back
     */
    goBack(): void;
    /**
     * Navigates to the next entry in the stack. Identical to go(1).
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.forward
     */
    goForward(): void;
    /**
     * Sets up a listener that will be called whenever the current location
     * changes.
     *
     * @param listener - A function that will be called when the location changes
     * @returns unlisten - A function that may be used to stop listening
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.listen
     */
    listen(listener: (location: Location, action: Action) => void): () => void;
    /**
     * Prevents the current location from changing and sets up a listener that
     * will be called instead.
     *
     * @param blocker - A function that will be called when a transition is blocked
     * @returns unblock - A function that may be used to stop blocking
     *
     * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#history.block
     */
    block(prompt: (location: Location, action: Action) => string | boolean, options?: {
        getUserConfirmation?: GetUserConfirmation;
    }): () => void;
}
export interface VuelikeComponent {
    _willUnmount(): void;
    readonly $route: Route | null;
    readonly $routeIndex: number;
    readonly $matchedRoute: MatchedRoute | null;
    flow(fn: Function): Function;
}
declare global {
    interface EsModule<T = any> {
        readonly __esModule?: boolean;
        readonly default: T;
        readonly [key: string]: any;
    }
    const __packageversion__: any;
    interface window {
        __REACT_VIEW_ROUTER_GLOBAL__?: ReactViewRouterGlobal;
    }
}
