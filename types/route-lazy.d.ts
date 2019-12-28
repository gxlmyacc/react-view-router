import React from 'react';
import { RouteLazyUpdater, MatchedRoute, ConfigRoute } from './types';
export declare class RouteLazy {
    private _ctor;
    private _result;
    private resolved;
    $$typeof: Symbol | number;
    options: Partial<any>;
    updaters: RouteLazyUpdater[];
    constructor(ctor: any, options?: Partial<any>);
    toResolve(...args: any[]): Promise<React.ComponentType>;
    render(props: object, ref: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null;
}
export declare function hasRouteLazy(route: MatchedRoute | ConfigRoute): boolean;
export declare function hasMatchedRouteLazy(matched: MatchedRoute[]): boolean;
export declare function lazyImport(importMethod: Function, options?: Partial<any>): RouteLazy;
