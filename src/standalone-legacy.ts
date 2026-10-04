import ReactDOM from 'react-dom';
import {
  StandaloneRouteSSRAdapterOptions,
  createStandaloneRouteSSRAdapter,
} from './standalone-route-ssr-adapter';

export type LegacyStandaloneRouteSSRAdapterOptions = Omit<StandaloneRouteSSRAdapterOptions, 'hydrateRoot'>;

export function createLegacyStandaloneRouteSSRAdapter(
  options: LegacyStandaloneRouteSSRAdapterOptions = {},
) {
  return createStandaloneRouteSSRAdapter({
    ...options,
    hydrateRoot(container, element) {
      ReactDOM.hydrate(element, container);
      return {
        render(nextElement) {
          ReactDOM.render(nextElement, container);
        },
        unmount() {
          ReactDOM.unmountComponentAtNode(container);
        },
      };
    },
  });
}

export * from './standalone-route-ssr-adapter';
