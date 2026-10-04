import { StandaloneRouteSSRAdapterOptions } from './standalone-route-ssr-adapter';
export type LegacyStandaloneRouteSSRAdapterOptions = Omit<StandaloneRouteSSRAdapterOptions, 'hydrateRoot'>;
export declare function createLegacyStandaloneRouteSSRAdapter(options?: LegacyStandaloneRouteSSRAdapterOptions): import("./standalone-route-ssr-adapter").StandaloneRouteSSRAdapter;
export * from './standalone-route-ssr-adapter';
