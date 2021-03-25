import React from 'react';
import { RouteLazyUpdater, MatchedRoute, ConfigRoute } from './types';
export declare class RouteLazy {
    private _ctor;
    private _result;
    private resolved;
    $$typeof: Symbol | number;
    options: Partial<any>;
    updaters: RouteLazyUpdater[];
    constructor(ctor: React.ComponentType | Function | Promise<React.ComponentType>, options?: Partial<any>);
    toResolve(...args: any[]): Promise<React.ComponentType | null>;
    render(props: any, ref: any): React.ReactElement<{}, string | React.JSXElementConstructor<any>> | null;
}
export declare function hasRouteLazy(route: MatchedRoute | ConfigRoute): boolean;
export declare function hasMatchedRouteLazy(matched: MatchedRoute[]): boolean;
export declare function lazyImport(importMethod: Function, options?: Partial<any>): RouteLazy;
