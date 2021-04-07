import React from 'react';
import { MatchedRoute, RouterViewProps, RouterViewState, RouterViewDefaultProps } from 'react-view-router';
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
declare const _default: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export default _default;
