import { ComponentType } from 'react';
import { HistoryFix } from './history-fix';
import { normalizeLocation, nextTick, getHostRouterView } from './util';
import { RouterViewComponent as RouterView } from './router-view';
import { ReactViewRouterOptions, ReactViewRouterMoreOptions, NormalizedConfigRouteArray, RouteBeforeGuardFn, RouteAfterGuardFn, RouteNextFn, RouteHistoryLocation, RouteGuardInterceptor, RouteEvent, RouteChildrenFn, RouteLocation, matchPathResult, ConfigRoute, RouteErrorCallback, ReactViewRoutePlugin, Route, MatchedRoute, MatchedRouteArray, LazyResolveFn, OnBindInstance, OnGetLazyResovle, VuelikeComponent, RouteInterceptorCallback, HistoryStackInfo, RouteResolveNameFn, onRouteChangeEvent, UserConfigRoute, ParseQueryProps } from './types';
import { Action, HistoryType } from './history';
declare const version: string;
declare class ReactViewRouter {
    static version: string;
    version: string;
    isReactViewRouterInstance: boolean;
    parent: ReactViewRouter | null;
    children: ReactViewRouter[];
    options: ReactViewRouterMoreOptions;
    mode: HistoryType;
    basename: string;
    basenameNoSlash: string;
    name: string;
    routeNameMap: {
        [key: string]: string;
    };
    routes: NormalizedConfigRouteArray;
    stacks: HistoryStackInfo[];
    plugins: ReactViewRoutePlugin[];
    beforeEachGuards: RouteBeforeGuardFn[];
    afterUpdateGuards: RouteAfterGuardFn[];
    beforeResolveGuards: RouteAfterGuardFn[];
    afterEachGuards: RouteAfterGuardFn[];
    resolveNameFns: RouteResolveNameFn[];
    prevRoute: Route | null;
    currentRoute: Route | null;
    pendingRoute: RouteHistoryLocation | null;
    initialRoute: Route;
    queryProps: ParseQueryProps;
    viewRoot: RouterView | null;
    errorCallbacks: RouteErrorCallback[];
    apps: any[];
    Apps: React.ComponentClass[];
    isRunning: boolean;
    isHistoryCreater: boolean;
    rememberInitialRoute: boolean;
    getHostRouterView: typeof getHostRouterView;
    nextTick: typeof nextTick;
    protected _history: HistoryFix | null;
    protected _unlisten?: () => void;
    protected _uninterceptor?: () => void;
    protected id: number;
    protected _nexting: RouteNextFn | null;
    protected vuelike?: VuelikeComponent;
    protected _interceptorCounter: number;
    [key: string]: any;
    constructor(options?: ReactViewRouterOptions);
    _initRouter(options: ReactViewRouterOptions): void;
    _updateParent(parent: ReactViewRouter | null): void;
    get history(): HistoryFix;
    get pluginName(): string;
    get top(): ReactViewRouter;
    get isBrowserMode(): boolean;
    get isHashMode(): boolean;
    get isMemoryMode(): boolean;
    get isPrepared(): boolean;
    _startHistory(): void;
    start(routerOptions?: ReactViewRouterOptions, isInit?: boolean): void;
    stop(options?: {
        ignoreClearRoute?: boolean;
        isInit?: boolean;
    }): void;
    use({ routes, inheritProps, rememberInitialRoute, install, queryProps, ...restOptions }: ReactViewRouterMoreOptions): void;
    plugin(plugin: ReactViewRoutePlugin | onRouteChangeEvent): (() => void) | undefined;
    _walkRoutes(routes: ConfigRoute[] | RouteChildrenFn, parent?: ConfigRoute): void;
    _refreshInitialRoute(): void;
    _callEvent<E extends Exclude<keyof ReactViewRoutePlugin, 'name' | 'install' | 'uninstall'>>(event: E, ...args: Parameters<ReactViewRoutePlugin[E]>): ReturnType<ReactViewRoutePlugin[E]>;
    _isVuelikeComponent(comp: any): any;
    _getComponentGurads<T extends RouteGuardInterceptor>(mr: MatchedRoute, guardName: string, onBindInstance?: OnBindInstance<Exclude<T, 'LazyResolveFn'>>, onGetLazyResovle?: OnGetLazyResovle | null): T[];
    _getSameMatched(route: Route | null, compare?: Route): MatchedRoute[];
    _getChangeMatched(route: Route, route2?: Route | null, options?: {
        containLazy?: boolean;
        count?: number | ((ret: MatchedRoute[], tr: MatchedRoute, fr: MatchedRoute) => number);
        compare?: null | ((tr: MatchedRoute, fr: MatchedRoute) => boolean);
    }): MatchedRoute[];
    _getBeforeEachGuards(to: Route, from: Route | null, current?: Route | null): (RouteBeforeGuardFn | LazyResolveFn)[];
    _getBeforeResolveGuards(to: Route, from: Route | null): RouteAfterGuardFn[];
    _getRouteUpdateGuards(to: Route, from: Route | null): RouteAfterGuardFn[];
    _getAfterEachGuards(to: Route, from: Route | null): RouteAfterGuardFn[];
    _isMatchBasename(location: RouteHistoryLocation | Route): boolean;
    _transformLocation(location: RouteHistoryLocation | Route): Route | RouteHistoryLocation<import("./history").State>;
    _getInterceptor(interceptors: RouteGuardInterceptor[], index: number): Promise<any>;
    _routetInterceptors(interceptors: RouteGuardInterceptor[], to: Route, from: Route | null, next?: RouteNextFn): Promise<void>;
    _handleRouteInterceptor(location: null | RouteHistoryLocation | Route, callback: (ok: boolean | RouteInterceptorCallback, route?: Route | null) => void, isInit?: boolean): Promise<void>;
    _normalizeLocation(to: Parameters<typeof normalizeLocation>[0], options?: Parameters<typeof normalizeLocation>[1]): RouteHistoryLocation<import("./history").State> | null;
    _internalHandleRouteInterceptor(location: RouteHistoryLocation | Route, callback: (ok: boolean | RouteInterceptorCallback, route?: Route | null) => void, isInit?: boolean): void;
    _go(to: string | RouteLocation | Route | null, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null, replace?: boolean): Promise<unknown>;
    _replace(to: string | RouteLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null): Promise<unknown>;
    _push(to: string | RouteLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null): Promise<unknown>;
    resolveRouteName(fn: RouteResolveNameFn): () => void;
    nameToPath(name: string, options?: {
        absolute?: boolean;
    } | RouteHistoryLocation, events?: {
        onComplete?: RouteEvent;
        onAbort?: RouteEvent;
    }): string | true | null;
    updateRouteMeta(route: ConfigRoute | MatchedRoute, newValue: Partial<any>, options?: {
        ignoreConfigRoute?: boolean;
    }): undefined;
    createMatchedRoute(route: ConfigRoute, match: matchPathResult): MatchedRoute;
    getMatched(to: Route | RouteHistoryLocation | string, from?: Route | null, parent?: ConfigRoute): MatchedRouteArray;
    getMatchedComponents(to: Route, from?: Route, parent?: ConfigRoute): ComponentType<{}>[];
    getMatchedViews(to: Route, from?: Route, parent?: ConfigRoute): RouterView<import("./router-view").RouterViewProps, import("./router-view").RouterViewState, any>[];
    getMatchedPath(path?: string): string;
    createRoute(to: RouteHistoryLocation | string | Route | null, options?: {
        action?: Action;
        from?: Route | null;
        matchedProvider?: Route | null;
        isRedirect?: boolean;
    }): Route;
    updateRoute(location: RouteHistoryLocation | Route | null): void;
    push(to: string | RouteLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent): Promise<unknown>;
    replace(to: string | RouteLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent): Promise<unknown>;
    redirect(to: string | RouteLocation | Route | null, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null, from?: Route | null): Promise<unknown> | undefined;
    go(n: number | HistoryStackInfo): void;
    back(): void;
    forward(): void;
    replaceState(newState: Partial<any>, matchedRoute?: MatchedRoute | null, options?: {
        mergeState?: boolean;
    }): Partial<any> | undefined;
    replaceQuery(keyOrObj: string | Partial<any>, value?: any): void;
    beforeEach(guard: RouteBeforeGuardFn): void;
    beforeResolve(guard: RouteAfterGuardFn): (() => void) | undefined;
    afterUpdate(guard: RouteAfterGuardFn): (() => void) | undefined;
    afterEach(guard: RouteAfterGuardFn, options?: {
        watchUpdate?: boolean;
    }): (() => void) | undefined;
    addRoutes(routes: UserConfigRoute[] | ConfigRoute[], parentRoute?: ConfigRoute): void;
    parseQuery(query: string, queryProps?: ParseQueryProps): any;
    stringifyQuery(obj: Partial<any>): any;
    onError(callback: RouteErrorCallback): () => void;
    install(vuelike: any, { App }: {
        App: any;
    }): void;
}
export { version };
export default ReactViewRouter;
