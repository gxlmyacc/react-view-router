import { nextTick, getHostRouterView } from './util';
import { RouterViewComponent as RouterView } from './router-view';
import { ReactVueRouterMode, ReactVueRouterOptions, ConfigRouteArray, RouteBeforeGuardFn, RouteAfterGuardFn, RouteNextFn, RouteHistoryLocation, RouteGuardInterceptor, RouteEvent, matchPathResult, ConfigRoute, RouteErrorCallback, ReactViewRoutePlugin, Route, MatchedRoute, RouteBindInstanceFn } from './globals';
export default class ReactViewRouter {
    private id;
    options: ReactVueRouterOptions;
    mode: ReactVueRouterMode;
    basename: string;
    routes: ConfigRouteArray;
    plugins: ReactViewRoutePlugin[];
    beforeEachGuards: RouteBeforeGuardFn[];
    afterEachGuards: RouteAfterGuardFn[];
    prevRoute: Route | null;
    currentRoute: Route | null;
    viewRoot: RouterView | null;
    errorCallback: RouteErrorCallback | null;
    app: any;
    getHostRouterView: typeof getHostRouterView;
    nextTick: typeof nextTick;
    _history?: any;
    _unlisten?: () => void;
    __unblock?: () => void;
    [key: string]: any;
    constructor({ mode, basename, base, ...options }?: ReactVueRouterOptions);
    get history(): any;
    start({ mode, basename, base, ...options }?: ReactVueRouterOptions): void;
    stop(): void;
    use({ routes, inheritProps, install, ...restOptions }: ReactVueRouterOptions): void;
    plugin(plugin: ReactViewRoutePlugin): (() => void) | undefined;
    _callEvent(event: string, ...args: any[]): any;
    _getComponentGurads(mr: MatchedRoute, guardName: string, bindInstance?: boolean | RouteBindInstanceFn): RouteGuardInterceptor[];
    _getRouteComponentGurads(matched: MatchedRoute[], guardName: string, reverse?: boolean, bindInstance?: boolean | RouteBindInstanceFn): RouteGuardInterceptor[];
    _getSameMatched(route: Route | null, compare?: Route): MatchedRoute[];
    _getChangeMatched(route: Route, compare?: Route | null, options?: {
        containLazy?: boolean;
        count?: number;
    }): MatchedRoute[];
    _getBeforeEachGuards(to: Route, from: Route | null, current?: Route | null): any[];
    _getRouteUpdateGuards(to: Route, from: Route | null): RouteGuardInterceptor[];
    _getAfterEachGuards(to: Route, from: Route | null): any[];
    _transformLocation(location: RouteHistoryLocation): RouteHistoryLocation | null;
    _handleRouteInterceptor(location: null | string | RouteHistoryLocation, callback: (ok: boolean, route?: Route | null) => void, ...args: any[]): Promise<void>;
    _getInterceptor(interceptors: RouteGuardInterceptor[], index: number): Promise<RouteBeforeGuardFn>;
    _routetInterceptors(interceptors: RouteGuardInterceptor[], to: Route, from: Route | null, next?: RouteNextFn): Promise<void>;
    _internalHandleRouteInterceptor(location: RouteHistoryLocation, callback: (ok: boolean, route: Route | null) => void, isInit?: boolean): Promise<void>;
    _go(to: string | RouteHistoryLocation | Route | null, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null, replace?: boolean): Promise<unknown>;
    _replace(to: string | RouteHistoryLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null): Promise<unknown>;
    _push(to: string | RouteHistoryLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null): Promise<unknown>;
    createMatchedRoute(route: ConfigRoute, match?: matchPathResult | null): MatchedRoute;
    getMatched(to: Route, from: Route | null, parent?: ConfigRoute | null): MatchedRoute[];
    getMatchedComponents(to: Route, from: Route | null, parent: ConfigRoute | null): any[];
    getMatchedViews(to: Route, from: Route | null, parent: ConfigRoute | null): any[];
    createRoute(to: RouteHistoryLocation | Route, from?: Route | null): Route;
    updateRoute(location: RouteHistoryLocation | null): void;
    push(to: string | RouteHistoryLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent): Promise<unknown>;
    replace(to: string | RouteHistoryLocation | Route, onComplete?: RouteEvent, onAbort?: RouteEvent): Promise<unknown>;
    redirect(to: string | RouteHistoryLocation | Route | null, onComplete?: RouteEvent, onAbort?: RouteEvent, onInit?: RouteEvent | null, from?: Route | null): Promise<unknown> | undefined;
    go(n: number): any;
    back(): any;
    goBack(): any;
    forward(): any;
    goForward(): any;
    beforeEach(guard: RouteBeforeGuardFn): void;
    afterEach(guard: RouteAfterGuardFn): void;
    addRoutes(routes: ConfigRoute[], parentRoute: ConfigRoute, name?: string): void;
    parseQuery(query: string): any;
    stringifyQuery(obj: Partial<any>): any;
    onError(callback: RouteErrorCallback): void;
    install(ReactVueLike: any, { App }: {
        App: any;
    }): void;
}
