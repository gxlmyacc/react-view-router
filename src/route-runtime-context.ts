import React from 'react';
import type { RouteRuntimeAdapter } from './route-runtime';

export type RouteRuntimeAdapterContextValue = RouteRuntimeAdapter | RouteRuntimeAdapter[] | null;

export const RouteRuntimeAdapterContext = React.createContext<RouteRuntimeAdapterContextValue>(
  null
);

export const RouteRuntimeAdapterProvider = RouteRuntimeAdapterContext.Provider;
