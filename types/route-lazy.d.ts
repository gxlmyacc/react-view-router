import React from 'react';
import { LazyImportMethod, RouteLazyUpdater, MatchedRoute, ConfigRoute } from './types';
export declare class RouteLazy<P = any> {
    private _ctor;
    private _result;
    private resolved;
    $$typeof: Symbol | number;
    options: Partial<any>;
    updaters: RouteLazyUpdater[];
    constructor(ctor: React.ComponentType | LazyImportMethod<P> | Promise<React.ComponentType>, options?: Partial<any>);
    toResolve(route: ConfigRoute, key: string): Promise<React.ComponentType | null>;
    render(props: any, ref: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null;
}
export declare function hasRouteLazy(route: MatchedRoute | ConfigRoute): boolean;
export declare function hasMatchedRouteLazy(matched: MatchedRoute[]): boolean;
export declare function lazyImport<P = any>(importMethod: LazyImportMethod<P>, options?: Partial<any>): RouteLazy<P>;
export declare function isPromise<P = any>(value: any): value is Promise<P>;
