import React from 'react';
declare class RouterView extends React.Component {
    constructor(props: any);
    get name(): any;
    _updateRef(ref: any): void;
    _filterRoutes(routes: any, state: any): any;
    _getRouteMatch(state: any, depth?: number): any;
    _refreshCurrentRoute(state: any, newState: any): any;
    _updateResolving(resolving: any): void;
    _resolveFallback(): any;
    isNull(route: any): boolean;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    push(...routes: any[]): any;
    splice(idx: any, len: any, ...routes: any[]): any;
    indexOf(route: any): any;
    remove(route: any): any;
    getComponent(currentRoute: any, excludeProps: any): any;
    renderCurrent(currentRoute: any): any;
    render(): any;
}
export { RouterView as RouterViewComponent };
declare const _default: any;
export default _default;
