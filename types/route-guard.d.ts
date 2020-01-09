import React from 'react';
import { UseRouteGuardsInfo } from './types';
export declare const REACT_FORWARD_REF_TYPE: number | symbol;
export declare const REACT_LAZY_TYPE: number | symbol;
export declare class RouteComponentGuards {
    $$typeof: Symbol | number;
    render: Function | null;
    __guards?: UseRouteGuardsInfo;
    __component?: React.ComponentType | RouteComponentGuards;
    __componentClass?: React.ComponentType;
    __children?: any;
    constructor();
}
export declare function getGuardsComponent(v: RouteComponentGuards, useComponentClass?: boolean): React.ComponentClass<{}, any> | React.FunctionComponent<{}> | RouteComponentGuards;
export declare function useRouteGuards(component: React.ComponentType, guards?: UseRouteGuardsInfo, componentClass?: React.ComponentType | null, children?: any): RouteComponentGuards;
