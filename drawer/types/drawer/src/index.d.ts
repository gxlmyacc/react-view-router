import React from 'react';
import { RouterViewProps, RouterViewState, RouterViewDefaultProps, ConfigRoute } from 'react-view-router';
import '../style/drawer.css';
export interface RouterDrawerProps extends RouterViewProps {
    [key: string]: any;
}
export interface RouterDrawerState extends RouterViewState {
    openDrawer?: boolean;
    _routerDrawer?: boolean;
    prevRoute?: ConfigRoute | null;
}
export interface RouterDrawerDefaultProps extends RouterViewDefaultProps {
    prefixCls: string;
    position: string;
    touch: boolean;
}
declare const _default: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export default _default;
