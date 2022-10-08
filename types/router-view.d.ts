import React, { ReactNode } from 'react';
import ReactViewRouter from './router';
import { MatchedRoute, ConfigRoute, ReactViewContainer, RouteBeforeGuardFn, RouteAfterGuardFn, ConfigRouteArray } from './types';
export interface RouterViewProps extends React.HTMLAttributes<any> {
    name?: string;
    filter?: RouterViewFilter;
    fallback?: ReactViewFallback | React.Component;
    container?: ReactViewContainer;
    router?: ReactViewRouter;
    depth?: number;
    excludeProps: string[];
    beforeEach?: RouteBeforeGuardFn;
    afterEach?: RouteAfterGuardFn;
    _updateRef?: React.RefCallback<RouterView> | null;
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
declare class RouterView<P extends RouterViewProps = RouterViewProps, S extends RouterViewState = RouterViewState, SS = any> extends React.Component<P, S, SS> {
    _isMounted: boolean;
    target: typeof RouterView;
    _reactInternalFiber?: any;
    _reactInternals?: any;
    static defaultProps: RouterViewDefaultProps;
    constructor(props: RouterViewProps);
    get name(): string;
    get currentRef(): any;
    _updateRef(ref: RouterView): void;
    _filterRoutes(routes: ConfigRoute[], state?: RouterViewState): ConfigRoute[];
    _getRouteMatch(state: RouterViewState, depth?: number): MatchedRoute | null;
    _refreshCurrentRoute(state?: S, newState?: S, callback?: () => void): MatchedRoute | null;
    _updateResolving(resolving: any): void;
    _resolveFallback(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
    isNull(route: any): any;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: RouterViewProps, nextState: RouterViewState): boolean;
    static getDerivedStateFromProps(nextProps: RouterViewProps): null;
    push(...routes: ConfigRoute[]): S["routes"];
    splice(idx: number, len: number, ...routes: ConfigRoute[]): ConfigRoute[];
    indexOf(route: string | ConfigRoute): number;
    remove(route: string | ConfigRoute): ConfigRoute | undefined;
    getComponentProps(): {
        props: Omit<Readonly<P> & Readonly<{
            children?: React.ReactNode;
        }>, "children">;
        children: (P["children"] & (boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null)) | undefined;
    };
    getComponent(currentRoute: MatchedRoute | null): React.ReactNode;
    renderCurrent(currentRoute: MatchedRoute | null): React.ReactNode;
    renderContainer(current: ReactNode | null, currentRoute: MatchedRoute | null): ReactNode | null;
    render(): {} | null;
}
declare const RouterViewWrapper: React.ForwardRefExoticComponent<Pick<RouterViewProps, keyof RouterViewProps> & React.RefAttributes<RouterView<RouterViewProps, RouterViewState, any>>>;
export { RouterViewWrapper, RouterView as RouterViewComponent };
export default RouterViewWrapper;
