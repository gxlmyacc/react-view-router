import React from 'react';
import { RouteGuardsInfoHOC } from './types';
export declare const REACT_FORWARD_REF_TYPE: number | symbol;
export declare const REACT_LAZY_TYPE: number | symbol;
export declare class RouteComponentGuards {
    $$typeof: Symbol | number;
    render: Function | null;
    __guards?: RouteGuardsInfoHOC;
    __component?: React.ComponentType | RouteComponentGuards;
    __componentClass?: React.ComponentType;
    __children?: any;
    constructor();
}
export declare function getGuardsComponent(v: RouteComponentGuards, useComponentClass?: boolean): RouteComponentGuards | React.ComponentType<{}>;
export declare function withRouteGuards(component: React.ComponentType, guards?: RouteGuardsInfoHOC, componentClass?: React.ComponentType | null, children?: any): RouteComponentGuards;
