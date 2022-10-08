import { RouteGuardsInfoHOC, ReactAllComponentType } from './types';
export declare const REACT_FORWARD_REF_TYPE: number | symbol;
export declare const REACT_LAZY_TYPE: number | symbol;
export declare class RouteComponentGuards {
    $$typeof: Symbol | number;
    render: Function | null;
    __guards?: RouteGuardsInfoHOC;
    __component?: ReactAllComponentType | RouteComponentGuards;
    __componentClass?: ReactAllComponentType;
    __children?: any;
    constructor();
}
export declare function getGuardsComponent(v: RouteComponentGuards, useComponentClass?: boolean): ReactAllComponentType<any> | RouteComponentGuards;
export declare function withRouteGuards(component: ReactAllComponentType, guards: RouteGuardsInfoHOC, componentClass?: ReactAllComponentType | null, children?: any): RouteComponentGuards;
