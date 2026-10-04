import React, { ReactNode } from 'react';
import ReactViewRouter from './router';
import { MatchedRoute, ConfigRoute, ReactViewContainer, RouteBeforeGuardFn, RouteAfterGuardFn, RouterViewName, Route, CheckKeepAliveFunction, CheckKeepAliveResultFunction, RouteSavedPosition } from './types';
import { KeepAliveRefObject } from './keep-alive';
export interface RouterViewProps<TContainer = HTMLElement> extends React.HTMLAttributes<any> {
    getContainerRef?: () => TContainer | null;
    onSavePosition?: (container: TContainer, options: {
        to: Route;
        from: Route | null;
    }) => RouteSavedPosition | null | undefined;
    onScrollToPosition?: (container: TContainer, position: RouteSavedPosition) => void;
    name?: RouterViewName;
    filter?: RouterViewFilter;
    fallback?: ReactViewFallback | React.ReactNode;
    container?: ReactViewContainer;
    viewPresenter?: React.ComponentType<RouterViewPresenterProps>;
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
export interface RouterViewPresenterProps {
    children?: React.ReactNode;
    route: MatchedRoute | null;
    router: ReactViewRouter;
    view: RouterView;
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
    view: RouterView;
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
declare class RouterView<P extends RouterViewProps<any> = RouterViewProps, S extends RouterViewState = RouterViewState, SS = any> extends React.Component<P, S, SS> {
    static defaultProps: RouterViewDefaultProps;
    static contextType: React.Context<RouterView<RouterViewProps<HTMLElement>, RouterViewState, any> | null>;
    target: typeof RouterView;
    readonly isRouterViewInstance: true;
    _isMounted: boolean;
    _events: RouterViewEvents;
    protected _reactInternalFiber?: any;
    protected _reactInternals?: any;
    private _viewPosition;
    private _positionRoute;
    getSnapshotBeforeUpdate(previousProps: P, previousState: S): SS;
    componentDidUpdate(_previousProps: P, previousState: S, snapshot: SS): void;
    protected _kaRef: KeepAliveRefObject | null;
    protected _isActivate: boolean;
    /**
     * 从 React context 读取父级 RouterView 实例。
     * @returns 父级 RouterView，无则 null
     */
    private get parentRouterView();
    constructor(props: RouterViewProps);
    get name(): string;
    get currentRef(): any;
    get isActivate(): boolean;
    _updateRef: (ref: RouterView) => void;
    _updateKARef: (ref: KeepAliveRefObject) => void;
    /** Shared event/lifecycle dispatch for cached views and presenter visibility changes. */
    _notifyViewActivation(event: Parameters<KeepAliveChangeEvent>[0], instance?: any): void;
    _kaActivate: (event: Parameters<KeepAliveChangeEvent>[0]) => void;
    _kaDeactivate: (event: Parameters<KeepAliveChangeEvent>[0]) => void;
    _checkEnableKeepAlive(route?: MatchedRoute | null): boolean;
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
            children?: ReactNode;
        }>, "children">;
        children: (P["children"] & (boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null)) | undefined;
    };
    getComponent(currentRoute: MatchedRoute | null): React.ReactNode;
    renderCurrent(currentRoute: MatchedRoute | null): React.ReactNode;
    renderContainer(current: ReactNode | null, currentRoute: MatchedRoute | null): ReactNode | null;
    getViewPresenter(): React.ComponentType<RouterViewPresenterProps> | undefined;
    render(): React.ReactNode;
}
export interface RouterViewWrapperComponent extends React.ForwardRefExoticComponent<RouterViewProps<any> & React.RefAttributes<RouterView>> {
    <TContainer = HTMLElement>(props: RouterViewProps<TContainer> & React.RefAttributes<RouterView>): React.ReactElement | null;
}
declare const RouterViewWrapper: RouterViewWrapperComponent;
export { RouterViewWrapper, RouterView as RouterViewComponent };
export default RouterViewWrapper;
