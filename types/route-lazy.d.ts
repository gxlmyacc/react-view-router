import React from 'react';
import { LazyImportMethod, RouteLazyUpdater, MatchedRoute, ConfigRoute, ReactAllComponentType } from './types';
import ReactViewRouter from './router';
export declare class RouteLazy<P = any> {
    private _ctor;
    private _result;
    private resolved;
    routeLazyInstance: boolean;
    $$typeof: Symbol | number;
    options: Partial<any>;
    updaters: RouteLazyUpdater[];
    constructor(ctor: ReactAllComponentType<P> | LazyImportMethod<P> | Promise<ReactAllComponentType<P>>, options?: Partial<any>);
    toResolve(router: ReactViewRouter, route: ConfigRoute, key: string): Promise<ReactAllComponentType | null>;
    render(props: any, ref: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null;
}
export declare function hasRouteLazy(route: MatchedRoute | ConfigRoute): boolean;
export declare function hasMatchedRouteLazy(matched: MatchedRoute[]): boolean;
export declare function lazyImport<P = any>(importMethod: LazyImportMethod<P>, options?: Partial<any>): RouteLazy<P>;
export declare function isRouteLazy(value: any): value is RouteLazy;
export declare function isPromise<P = any>(value: any): value is Promise<P>;
