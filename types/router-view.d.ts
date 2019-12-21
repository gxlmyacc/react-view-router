import React from 'react';
import ReactViewRouter from './router';
import { ConfigRoute, ConfigRouteArray } from './types';
declare type RouterViewUpdateRef = (vm: React.Component | null) => void;
declare type RouterViewProps = {
    name?: string;
    filter?: RouterViewFilter;
    fallback?: ReactViewFallback;
    container?: ReactViewContainer;
    router?: ReactViewRouter;
    depth?: number;
    _updateRef?: RouterViewUpdateRef;
    excludeProps: string[];
} & {
    [key: string]: any;
};
declare type RouterViewState = {
    _routerView: RouterView;
    _routerRoot: boolean;
    _routerParent: RouterView | null;
    _routerDepth: number;
    _routerInited: boolean;
    _routerResolving: boolean;
    router?: ReactViewRouter;
    parentRoute: ConfigRoute | null;
    currentRoute: ConfigRoute | null;
    routes: ConfigRoute[];
};
export declare type RouterViewFilter = (route: ConfigRoute[], state: RouterViewState) => ConfigRoute[];
export declare type ReactViewFallback = (state: {
    parentRoute: ConfigRoute | null;
    currentRoute: ConfigRoute | null;
    inited: boolean;
    resolving: boolean;
    depth: number;
}) => React.ReactElement;
export declare type ReactViewContainer = (result: React.ReactElement | null, route: ConfigRoute, props: RouterViewProps) => React.ReactElement;
declare class RouterView extends React.Component<RouterViewProps, RouterViewState> {
    _isMounted: boolean;
    target: typeof RouterView;
    _reactInternalFiber: any;
    static defaultProps: {
        excludeProps: string[];
    };
    constructor(props: RouterViewProps);
    get name(): string;
    _updateRef(ref: React.Component): void;
    _filterRoutes(routes: ConfigRouteArray, state?: RouterViewState): ConfigRoute[];
    _getRouteMatch(state: RouterViewState, depth?: number): ConfigRoute | null;
    _refreshCurrentRoute(state?: any, newState?: any): ConfigRoute | null;
    _updateResolving(resolving: any): void;
    _resolveFallback(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
    isNull(route: any): boolean;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: RouterViewProps, nextState: RouterViewState): boolean;
    push(...routes: ConfigRoute[]): ConfigRoute[];
    splice(idx: number, len: number, ...routes: ConfigRoute[]): ConfigRoute[];
    indexOf(route: string | ConfigRoute): number;
    remove(route: string | ConfigRoute): ConfigRoute | undefined;
    getComponent(currentRoute: ConfigRoute | null, excludeProps?: Partial<any>): any;
    renderCurrent(currentRoute: ConfigRoute | null): any;
    render(): any;
}
export { RouterView as RouterViewComponent };
declare const _default: React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & React.RefAttributes<unknown>>;
export default _default;
