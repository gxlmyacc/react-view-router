import React, { ReactNode } from 'react';
import ReactViewRouter from './router';
import { RouterViewComponent } from './router-view';
import { MatchedRoute, ConfigRoute, ReactViewContainer, RouteBeforeGuardFn, RouteAfterGuardFn, RouterViewName, Route, CheckKeepAliveFunction, CheckKeepAliveResultFunction } from './types';
import { KeepAliveRefObject } from './keep-alive';
export interface RouterViewProps extends React.HTMLAttributes<any> {
    name?: RouterViewName;
    filter?: RouterViewFilter;
    fallback?: ReactViewFallback | React.ReactNode;
    container?: ReactViewContainer;
    router?: ReactViewRouter;
    depth?: number;
    excludeProps?: string[];
    beforeEach?: RouteBeforeGuardFn;
    afterEach?: RouteAfterGuardFn;
    keepAlive?: boolean | CheckKeepAliveFunction;
    onRouteChange?: (newRoute: MatchedRoute | null, prevRoute: MatchedRoute | null) => void;
    beforeActivate?: CheckKeepAliveResultFunction;
    _updateRef?: React.RefCallback<RouterView> | null;
    [key: string]: any;
}
export interface RouterViewState {
    _routerRoot: boolean;
    toRoute: Route | null;
    parent: RouterView | null;
    depth: number;
    inited: boolean;
    resolving: boolean;
    router?: ReactViewRouter;
    parentRoute: MatchedRoute | null;
    currentRoute: MatchedRoute | null;
    routes: ConfigRoute[];
    enableKeepAlive: boolean;
    renderKeepAlive: boolean | CheckKeepAliveResultFunction;
}
export interface RouterViewDefaultProps {
    excludeProps: string[];
}
export type RouterViewFilter = (route: ConfigRoute[], state: RouterViewState) => ConfigRoute[];
export type ReactViewFallback = (state: {
    parentRoute: MatchedRoute | null;
    currentRoute: MatchedRoute | null;
    toRoute: Route | null;
    inited: boolean;
    resolving: boolean;
    depth: number;
    router: ReactViewRouter | undefined;
    view: RouterViewComponent;
}) => React.ReactNode;
interface KeepAliveEventObject {
    type: keyof RouterViewEvents;
    router: ReactViewRouter;
    source: RouterView;
    target: MatchedRoute;
    to: MatchedRoute | null;
    from: MatchedRoute | null;
}
export type KeepAliveChangeEvent = (event: KeepAliveEventObject) => void;
export type RouterViewEvents = {
    activate: KeepAliveChangeEvent[];
    deactivate: KeepAliveChangeEvent[];
};
export declare function _checkActivate(router: ReactViewRouter | null | undefined, matchedRoute: MatchedRoute | null, event: KeepAliveEventObject): boolean | undefined;
export declare function _checkDeactivate(router: ReactViewRouter | null | undefined, matchedRoute: MatchedRoute | null, event: KeepAliveEventObject): boolean | undefined;
declare class RouterView<P extends RouterViewProps = RouterViewProps, S extends RouterViewState = RouterViewState, SS = any> extends React.Component<P, S, SS> {
    static defaultProps: RouterViewDefaultProps;
    target: typeof RouterView;
    readonly isRouterViewInstance: true;
    _isMounted: boolean;
    _events: RouterViewEvents;
    protected _reactInternalFiber?: any;
    protected _reactInternals?: any;
    protected _kaRef: KeepAliveRefObject | null;
    protected _isActivate: boolean;
    constructor(props: RouterViewProps);
    get name(): string;
    get currentRef(): any;
    get isActivate(): boolean;
    _updateRef: (ref: RouterView) => void;
    _updateKARef: (ref: KeepAliveRefObject) => void;
    _kaActivate: (event: Parameters<KeepAliveChangeEvent>[0]) => void;
    _kaDeactivate: (event: Parameters<KeepAliveChangeEvent>[0]) => void;
    _checkEnableKeepAlive(): boolean;
    _filterRoutes(routes: ConfigRoute[], state?: RouterViewState): ConfigRoute[];
    getMatchedRoute(route: Route | null | undefined, depth?: number): MatchedRoute | null;
    isKeepAliveRoute(currentRoute: MatchedRoute | null, toRoute: MatchedRoute | null, router?: ReactViewRouter): boolean | CheckKeepAliveResultFunction;
    _refreshCurrentRoute(state?: S, pendingState?: S, callback?: () => void): MatchedRoute | null;
    _updateResolving(resolving: boolean, toRoute?: Route | null): void;
    _resolveFallback(): any;
    isNull(route: any): any;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: RouterViewProps, nextState: RouterViewState): boolean;
    static getDerivedStateFromProps(nextProps: RouterViewProps): null;
    getComponentProps(): {
        props: Omit<Readonly<P> & Readonly<{
            children?: React.ReactNode;
        }>, "children">;
        children: (P["children"] & (boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null)) | undefined;
    };
    getComponent(currentRoute: MatchedRoute | null): React.ReactNode;
    renderCurrent(currentRoute: MatchedRoute | null): React.ReactNode;
    renderContainer(current: ReactNode | null, currentRoute: MatchedRoute | null): ReactNode | null;
    render(): React.ReactNode;
}
declare const RouterViewWrapper: React.ForwardRefExoticComponent<RouterViewProps & React.RefAttributes<RouterView>>;
export { RouterViewWrapper, RouterView as RouterViewComponent };
export default RouterViewWrapper;
