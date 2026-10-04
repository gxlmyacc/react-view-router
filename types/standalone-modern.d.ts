import { StandaloneRouteSSRAdapterOptions } from './standalone-route-ssr-adapter';
export type ModernStandaloneRouteSSRAdapterOptions = Omit<StandaloneRouteSSRAdapterOptions, 'hydrateRoot'>;
export declare function createModernStandaloneRouteSSRAdapter(options?: ModernStandaloneRouteSSRAdapterOptions): import("./standalone-route-ssr-adapter").StandaloneRouteSSRAdapter;
export * from './standalone-route-ssr-adapter';
