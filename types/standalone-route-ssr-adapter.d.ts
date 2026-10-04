import type { NavigationSignal, RouteRuntimeAdapter, RouteRuntimeContext, RouteRuntimeDescriptor } from './route-runtime';
export interface StandaloneHydrationRoot {
    render?(element: any): void;
    unmount(): void;
}
export type StandaloneHydrateRoot = (container: any, element: any) => StandaloneHydrationRoot;
export interface StandaloneRouteSSRAdapterOptions {
    hydrateRoot: StandaloneHydrateRoot;
    document?: {
        querySelector(selector: string): any;
    };
    findContainer?: (descriptor: RouteRuntimeDescriptor) => any;
    priority?: number;
}
/**
 * React-version-neutral standalone adapter. The modern entry injects
 * react-dom/client's hydrateRoot; a legacy entry can inject ReactDOM.hydrate
 * without making the core package resolve either API.
 */
export declare class StandaloneRouteSSRAdapter implements RouteRuntimeAdapter {
    readonly name = "standalone-ssr";
    readonly owner: "standalone-ssr";
    readonly priority: number;
    private options;
    private records;
    constructor(options: StandaloneRouteSSRAdapterOptions);
    private findContainer;
    private findRecord;
    canHandle(context: RouteRuntimeContext): boolean;
    prepare(context: RouteRuntimeContext, signal: NavigationSignal): void;
    activate(context: RouteRuntimeContext): void;
    update(context: RouteRuntimeContext): void;
    deactivate(context: RouteRuntimeContext): void;
    dispose(): void;
}
export declare function createStandaloneRouteSSRAdapter(options: StandaloneRouteSSRAdapterOptions): StandaloneRouteSSRAdapter;
