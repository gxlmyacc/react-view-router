import React from 'react';
import type { RouteRuntimeAdapter } from './route-runtime';
export type RouteRuntimeAdapterContextValue = RouteRuntimeAdapter | RouteRuntimeAdapter[] | null;
export declare const RouteRuntimeAdapterContext: React.Context<RouteRuntimeAdapterContextValue>;
export declare const RouteRuntimeAdapterProvider: React.Provider<RouteRuntimeAdapterContextValue>;
