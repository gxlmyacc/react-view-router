import { ComponentType } from 'react';
import { HistoryFix } from './history-fix';
import { nextTick, getHostRouterView } from './util';
import { RouterViewComponent as RouterView } from './router-view';
import { ReactViewRouterMode, ReactViewRouterOptions, ConfigRouteArray, RouteBeforeGuardFn, RouteAfterGuardFn, RouteNextFn, RouteHistoryLocation, RouteGuardInterceptor, RouteEvent, RouteLocation, matchPathResult, ConfigRoute, RouteErrorCallback, ReactViewRoutePlugin, Route, MatchedRoute, MatchedRouteArray, lazyResovleFn, RouteBindInstanceFn, VuelikeComponent, RouteInterceptorCallback, HistoryStackInfo, RouteResolveNameFn, onRouteChangeEvent, UserConfigRoute } from './types';
export default class ReactViewRouter {
    isReactViewRouterInstance: boolean;
    parent: ReactViewRouter | null;
    children: ReactViewRouter[];
    options: ReactViewRouterOptions;
    mode: ReactViewRouterMode;
    basename: string;
    basenameNoSlash: string;
    name: string;
    routeNameMap: {
        [key: string]: string;
    };
    routes: ConfigRouteArray;
    stacks: HistoryStackInfo[];
    plugins: ReactViewRoutePlugin[];
    beforeEachGuards: RouteBeforeGuardFn[];
    beforeResolveGuards: RouteAfterGuardFn[];
    afterEachGuards: RouteAfterGuardFn[];
    resolveNameFns: RouteResolveNameFn[];
    prevRoute: Route | null;
    currentRoute: Route | null;
    pendingRoute: RouteHistoryLocation | null;
    initialRoute: Route;
    viewRoot: RouterView | null;
    errorCallback: RouteErrorCallback | null;
    apps: any[];
    Apps: React.ComponentClass[];
    isRunning: boolean;
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
    constructor({ name, mode, basename, ...options }?: ReactViewRouterOptions);
    _updateParent(parent: ReactViewRouter | null): void;
    _clear(isInit?: boolean): void;
    get history(): HistoryFix;
    get pluginName(): string;
    get top(): ReactViewRouter;
    get isBrowserMode(): boolean;
    get isHashMode(): boolean;
    get isMemoryMode(): boolean;
    start({ mode, basename, ...options }?: ReactViewRouterOptions, isInit?: boolean): void;
    stop(isInit?: boolean): void;
    use({ routes, inheritProps, rememberInitialRoute, install, ...restOptions }: ReactViewRouterOptions): void;
    plugin(plugin: ReactViewRoutePlugin | onRouteChangeEvent): (() => void) | undefined;
    _walkRoutes(routes: ConfigRouteArray): void;
    _refreshInitialRoute(): void;
    _callEvent(event: string, ...args: any[]): any;
    _isVuelikeComponent(comp: any): any;
    _getComponentGurads(mr: MatchedRoute, guardName: string, bindInstance?: boolean | RouteBindInstanceFn): RouteGuardInterceptor[];
    _getRouteComponentGurads(matched: MatchedRoute[], guardName: string, reverse?: boolean, bindInstance?: boolean | RouteBindInstanceFn): RouteGuardInterceptor[];
    _getSameMatched(route: Route | null, compare?: Route): MatchedRoute[];
    _getChangeMatched(route: Route, compare?: Route | null, options?: {
        containLazy?: boolean;
        count?: number;
    }): MatchedRoute[];
    _getBeforeEachGuards(to: Route, from: Route | null, current?: Route | null): any[];
    _getBeforeResolveGuards(to: Route, from: Route | null): any[];
    _getRouteUpdateGuards(to: Route, from: Route | null): (RouteBeforeGuardFn | RouteAfterGuardFn | lazyResovleFn)[];
    _getAfterEachGuards(to: Route, from: Route | null): any[];
    _transformLocation(location: RouteHistoryLocation): RouteHistoryLocation<import("./history").State>;
    _handleRouteInterceptor(location: null | RouteHistoryLocation, callback: (ok: boolean | RouteInterceptorCallback, route?: Route | null) => void, isInit?: boolean): Promise<void>;
    _getInterceptor(interceptors: RouteGuardInterceptor[], index: number): Promise<RouteBeforeGuardFn>;
    _routetInterceptors(interceptors: RouteGuardInterceptor[], to: Route, from: Route | null, next?: RouteNextFn): Promise<void>;
    _internalHandleRouteInterceptor(location: RouteHistoryLocation, callback: (ok: boolean | RouteInterceptorCallback, route: Route | null) => void, isInit?: boolean): void;
    _go(to: string | RouteLocation | Route | null, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null, replace?: boolean): Promise<unknown>;
    _replace(to: string | RouteLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null): Promise<unknown>;
    _push(to: string | RouteLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null): Promise<unknown>;
    resolveRouteName(fn: RouteResolveNameFn): () => void;
    nameToPath(name: string, options?: {
        absolute?: boolean;
    } | RouteHistoryLocation): string;
    updateRouteMeta(route: ConfigRoute, newValue: Partial<any>): undefined;
    createMatchedRoute(route: ConfigRoute, match: matchPathResult): MatchedRoute;
    getMatched(to: Route | RouteHistoryLocation | string, from?: Route | null, parent?: ConfigRoute): MatchedRouteArray;
    getMatchedComponents(to: Route, from?: Route, parent?: ConfigRoute): ComponentType<{}>[];
    getMatchedViews(to: Route, from?: Route, parent?: ConfigRoute): RouterView<import("./router-view").RouterViewProps, import("./router-view").RouterViewState, any>[];
    createRoute(to: RouteHistoryLocation | string | Route | null, from?: Route | null): Route;
    updateRoute(location: RouteHistoryLocation | null): void;
    push(to: string | RouteLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent): Promise<unknown>;
    replace(to: string | RouteLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent): Promise<unknown>;
    redirect(to: string | RouteLocation | Route | null, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null, from?: Route | null): Promise<unknown> | undefined;
    go(n: number | HistoryStackInfo): void;
    back(): void;
    forward(): void;
    replaceState(newState: Partial<any>, matchedRoute?: MatchedRoute): Partial<any> | undefined;
    replaceQuery(keyOrObj: string, value?: any): void;
    beforeEach(guard: RouteBeforeGuardFn): void;
    beforeResolve(guard: RouteAfterGuardFn): void;
    afterEach(guard: RouteAfterGuardFn): void;
    addRoutes(routes: UserConfigRoute[] | ConfigRouteArray, parentRoute?: ConfigRoute): void;
    parseQuery(query: string): any;
    stringifyQuery(obj: Partial<any>): any;
    onError(callback: RouteErrorCallback): void;
    install(vuelike: any, { App }: {
        App: any;
    }): void;
}
