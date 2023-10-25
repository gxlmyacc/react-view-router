import React, { ReactNode } from 'react';
import { RouterViewComponent, MatchedRoute, RouterViewProps, RouterViewState, RouterViewDefaultProps } from '../..';
import Drawer from './drawer';
import '../style/drawer.css';
export interface RouterDrawerProps extends RouterViewProps {
    [key: string]: any;
}
export interface RouterDrawerState extends RouterViewState {
    openDrawer?: boolean;
    _routerDrawer?: boolean;
    prevRoute?: MatchedRoute | null;
}
export interface RouterDrawerDefaultProps extends RouterViewDefaultProps {
    prefixCls: string;
    position: string;
    touch: boolean;
}
declare class RouterDrawer<P extends RouterDrawerProps = RouterDrawerProps, S extends RouterDrawerState = RouterDrawerState, SS = any> extends RouterViewComponent<P, S, SS> {
    drawer?: Drawer | null;
    needAnimation: boolean;
    static defaultProps: RouterDrawerDefaultProps;
    constructor(props: P);
    _refreshCurrentRoute(state?: S, newState?: any, callback?: () => void): MatchedRoute | null;
    _handleAnimationEnd(): void;
    _handleClose(): void;
    getZindex(): any;
    shouldComponentUpdate(nextProps: P, nextState: S): boolean;
    renderCurrent(currentRoute: MatchedRoute | null): React.ReactNode;
    renderContainer(current: ReactNode | null, currentRoute: MatchedRoute | null): ReactNode | null;
}
declare const RouterDrawerWrapper: React.ForwardRefExoticComponent<RouterDrawerProps & React.RefAttributes<RouterDrawer>>;
export default RouterDrawerWrapper;
