import React from 'react';
import { UseRouteGuardsInfo } from './types';
export declare const REACT_FORWARD_REF_TYPE: number | symbol;
export declare const REACT_LAZY_TYPE: number | symbol;
export declare class RouteComponentGuards {
    $$typeof: Symbol | number;
    render: Function | null;
    __guards?: UseRouteGuardsInfo;
    __component?: React.FunctionComponent | React.ComponentClass | RouteComponentGuards;
    __componentClass?: React.FunctionComponent | React.ComponentClass;
    __children?: any;
    constructor();
}
export declare function getGuardsComponent(v: RouteComponentGuards, useComponentClass?: boolean): React.FunctionComponent<{}> | React.ComponentClass<{}, any> | RouteComponentGuards;
export declare function useRouteGuards(component: React.FunctionComponent | React.ComponentClass, guards?: UseRouteGuardsInfo, componentClass?: React.FunctionComponent | React.ComponentClass | null, children?: any): RouteComponentGuards;
