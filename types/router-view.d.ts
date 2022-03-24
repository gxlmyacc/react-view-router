import React from 'react';
import ReactViewRouter from './router';
import { MatchedRoute, ConfigRoute, RouteBeforeGuardFn, RouteAfterGuardFn, ConfigRouteArray } from './types';
declare type RouterViewUpdateRef = (vm: React.Component | null) => void;
export interface RouterViewProps {
    name?: string;
    filter?: RouterViewFilter;
    fallback?: ReactViewFallback | React.Component;
    container?: ReactViewContainer;
    router?: ReactViewRouter;
    depth?: number;
    _updateRef?: RouterViewUpdateRef;
    excludeProps: string[];
    beforeEach?: RouteBeforeGuardFn;
    beforeResolve?: RouteAfterGuardFn;
    afterEach?: RouteAfterGuardFn;
    [key: string]: any;
}
export interface RouterViewState {
    _routerView: RouterView;
    _routerRoot: boolean;
    _routerParent: RouterView | null;
    _routerDepth: number;
    _routerInited: boolean;
    _routerResolving: boolean;
    router?: ReactViewRouter;
    parentRoute: MatchedRoute | null;
    currentRoute: MatchedRoute | null;
    routes: ConfigRouteArray;
}
export interface RouterViewDefaultProps {
    excludeProps: string[];
}
export declare type RouterViewFilter = (route: ConfigRouteArray, state: RouterViewState) => ConfigRoute[];
export declare type ReactViewFallback = (state: {
    parentRoute: MatchedRoute | null;
    currentRoute: MatchedRoute | null;
    inited: boolean;
    resolving: boolean;
    depth: number;
}) => React.ReactElement;
export declare type ReactViewContainer = (result: React.ReactElement | null, route: ConfigRoute | MatchedRoute, props: RouterViewProps) => React.ReactElement;
declare class RouterView<P extends RouterViewProps = RouterViewProps, S extends RouterViewState = RouterViewState, SS = any> extends React.Component<P, S, SS> {
    _isMounted: boolean;
    target: typeof RouterView;
    _reactInternalFiber?: any;
    _reactInternals?: any;
    static defaultProps: RouterViewDefaultProps;
    constructor(props: RouterViewProps);
    get name(): string;
    get currentRef(): any;
    _updateRef(ref: React.Component): void;
    _filterRoutes(routes: ConfigRoute[], state?: RouterViewState): ConfigRoute[];
    _getRouteMatch(state: RouterViewState, depth?: number): MatchedRoute | null;
    _refreshCurrentRoute(state?: S, newState?: S, callback?: () => void): MatchedRoute | null;
    _updateResolving(resolving: any): void;
    _resolveFallback(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
    isNull(route: any): boolean;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: RouterViewProps, nextState: RouterViewState): boolean;
    push(...routes: ConfigRoute[]): S["routes"];
    splice(idx: number, len: number, ...routes: ConfigRoute[]): S["routes"];
    indexOf(route: string | ConfigRoute): number;
    remove(route: string | ConfigRoute): ConfigRoute | undefined;
    getComponent(currentRoute: MatchedRoute | null, excludeProps?: Partial<any>): any;
    renderCurrent(currentRoute: MatchedRoute | null): any;
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.FunctionComponentElement<any> | null;
}
declare const RouterViewWrapper: React.ForwardRefExoticComponent<Pick<RouterViewProps, string | number> & React.RefAttributes<unknown>>;
export { RouterViewWrapper, RouterView as RouterViewComponent };
export default RouterViewWrapper;
