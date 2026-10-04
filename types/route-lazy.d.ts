import { LazyImportMethod, RouteLazyUpdater, MatchedRoute, ConfigRoute, ReactAllComponentType } from './types';
import ReactViewRouter from './router';
export type RouteHydrationMismatch = 'client-render' | 'preserve' | 'throw';
export interface RouteHydrationInfo {
    route?: ConfigRoute;
    router?: ReactViewRouter;
    viewName?: string;
    descriptor?: import('./route-runtime').RouteRuntimeDescriptor;
}
export interface RouteLazyHydrateOptions {
    required?: boolean;
    mismatch?: RouteHydrationMismatch;
    owner?: import('./route-runtime').RouteRuntimeOwner;
    runtime?: string;
    container?: string;
    payloadRef?: string;
    checksum?: string;
    wrapElement?: (element: any, info: RouteHydrationInfo) => any;
    onError?: (error: Error, info: RouteHydrationInfo) => void;
}
export type RouteLazyHydrateOption = boolean | RouteLazyHydrateOptions;
export interface RouteLazyOptions extends Partial<any> {
    hydrate?: RouteLazyHydrateOption;
}
export declare class RouteLazy<P = any> {
    private _ctor;
    private _result;
    private _pending;
    private resolved;
    routeLazyInstance: boolean;
    $$typeof: Symbol | number;
    options: RouteLazyOptions;
    updaters: RouteLazyUpdater[];
    constructor(ctor: ReactAllComponentType<P> | LazyImportMethod<P> | Promise<ReactAllComponentType<P>>, options?: RouteLazyOptions);
    get isResolved(): boolean;
    get resolvedComponent(): ReactAllComponentType<P> | null;
    get shouldHydrate(): boolean;
    toResolve(router: ReactViewRouter, route: ConfigRoute, key: string): Promise<ReactAllComponentType | null>;
    render(props: any, ref: any): import("react").DetailedReactHTMLElement<import("react").InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null;
}
export declare function hasRouteLazy(route: MatchedRoute | ConfigRoute): boolean;
export declare function hasMatchedRouteLazy(matched: MatchedRoute[]): boolean;
export declare function lazyImport<P = any>(importMethod: LazyImportMethod<P>, options?: RouteLazyOptions): RouteLazy<P>;
export declare function isRouteLazy(value: any): value is RouteLazy;
export declare function isPromise<P = any>(value: any): value is Promise<P>;
