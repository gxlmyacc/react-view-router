import { hydrateRoot } from 'react-dom/client';
import {
  StandaloneRouteSSRAdapterOptions,
  createStandaloneRouteSSRAdapter,
} from './standalone-route-ssr-adapter';

export type ModernStandaloneRouteSSRAdapterOptions = Omit<StandaloneRouteSSRAdapterOptions, 'hydrateRoot'>;

export function createModernStandaloneRouteSSRAdapter(
  options: ModernStandaloneRouteSSRAdapterOptions = {},
) {
  return createStandaloneRouteSSRAdapter({ ...options, hydrateRoot });
}

export * from './standalone-route-ssr-adapter';
