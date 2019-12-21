import React from 'react';
import { RouteLazyUpdater } from './types';
export declare class RouteLazy {
    private _ctor;
    private _result;
    private resolved;
    $$typeof: Symbol | number;
    options: any;
    updaters: RouteLazyUpdater[];
    constructor(ctor: any, options?: any);
    toResolve(...args: any[]): Promise<React.FunctionComponent | React.ComponentClass>;
    render(props: object, ref: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null;
}
export declare function hasRouteLazy(route: any): boolean;
export declare function hasMatchedRouteLazy(matched: any[]): boolean;
export declare function lazyImport(importMethod: Function, options?: any): RouteLazy;
