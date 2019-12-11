export declare class RouteLazy {
    constructor(ctor: any, options: any);
    toResolve(...args: any[]): Promise<unknown>;
    render(props: any, ref: any): any;
}
export declare function hasRouteLazy(route: any): boolean;
export declare function hasMatchedRouteLazy(matched: any): any;
export declare function lazyImport(importMethod: any, options: any): RouteLazy;
