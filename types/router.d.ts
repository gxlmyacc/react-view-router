export default class ReactViewRouter {
    constructor({ mode, basename, base, ...options }?: {
        mode?: string | undefined;
        basename?: string | undefined;
        base?: string | undefined;
    });
    get history(): any;
    start({ mode, basename, base, ...options }?: {
        mode: any;
        basename: any;
        base: any;
    }): void;
    stop(): void;
    use({ routes, inheritProps, install, ...restOptions }: {
        [x: string]: any;
        routes: any;
        inheritProps: any;
        install: any;
    }): void;
    plugin(plugin: any): (() => void) | undefined;
    _callEvent(event: any, ...args: any[]): undefined;
    _getComponentGurads(r: any, guardName: any, bindInstance?: boolean): any[];
    _getRouteComponentGurads(matched: any, guardName: any, reverse?: boolean, bindInstance?: boolean): any[];
    _getSameMatched(route: any, compare: any): any[];
    _getChangeMatched(route: any, compare: any, options?: {}): any[];
    _getBeforeEachGuards(to: any, from: any, current: any): any[];
    _getRouteUpdateGuards(to: any, from: any): any[];
    _getAfterEachGuards(to: any, from: any): any[];
    _transformLocation(location: any): any;
    _handleRouteInterceptor(location: any, callback: any, ...args: any[]): Promise<any>;
    _routetInterceptors(interceptors: any, to: any, from: any, next: any): Promise<void>;
    _internalHandleRouteInterceptor(location: any, callback: any, isInit?: boolean): Promise<void>;
    _go(to: any, onComplete: any, onAbort: any, onInit: any, replace: any): Promise<unknown>;
    _replace(to: any, onComplete: any, onAbort: any, onInit: any): Promise<unknown>;
    _push(to: any, onComplete: any, onAbort: any, onInit: any): any;
    createMatchedRoute(route: any, match: any): {
        componentInstances: {};
        viewInstances: {};
    };
    getMatched(to: any, from: any, parent: any): any;
    getMatchedComponents(to: any, from: any, parent: any): any;
    getMatchedViews(to: any, from: any, parent: any): any;
    createRoute(to: any, from: any): {
        action: any;
        url: any;
        basename: any;
        path: any;
        fullPath: string;
        isRedirect: boolean;
        isReplace: boolean;
        query: any;
        params: any;
        matched: any;
        meta: any;
        onAbort: any;
        onComplete: any;
    };
    updateRoute(location: any): void;
    push(to: any, onComplete: any, onAbort: any): any;
    replace(to: any, onComplete: any, onAbort: any): any;
    redirect(to: any, onComplete: any, onAbort: any, onInit: any, from: any): any;
    go(n: any): any;
    back(): any;
    goBack(): any;
    forward(): any;
    goForward(): any;
    beforeEach(guard: any): void;
    afterEach(guard: any): void;
    addRoutes(routes: any, parentRoute: any, name?: string): void;
    parseQuery(query: any): {};
    stringifyQuery(obj: any): string;
    onError(callback: any): void;
    install(ReactVueLike: any, { App }: {
        App: any;
    }): void;
}
