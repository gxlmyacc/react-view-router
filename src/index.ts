import ReactViewRouter, { version } from './router';

export * from './types';

export {
  default as RouterView,
  RouterViewComponent,
}  from './router-view';
export type {
  RouterViewProps,
  RouterViewState,
  RouterViewDefaultProps,
  RouterViewPresenterProps
}  from './router-view';

export * from './hocs';
export * from './hooks';
export {
  KEEP_ALIVE_ANCHOR,
  KEEP_ALIVE_REPLACER,
  KEEP_ALIVE_KEEP_COPIES
} from './keep-alive';

export { default as createRouterLink, RouterLink, guardEvent } from './router-link';
export type { RouterLinkProps } from './router-link';

export { default as config,  parseQuery, stringifyQuery } from './config';

export { RouterContext, RouterViewContext } from './context';

export { withRouteGuards, REACT_FORWARD_REF_TYPE } from './route-guard';
export { lazyImport } from './route-lazy';
export type {
  RouteHydrationInfo,
  RouteHydrationMismatch,
  RouteLazyHydrateOption,
  RouteLazyHydrateOptions,
  RouteLazyOptions,
} from './route-lazy';
export * from './route-runtime';
export * from './route-runtime-context';
export * from './route-hydration-server';

export * from './history';
export * from './util';

export {
  version
};

export default ReactViewRouter;

export { default as defaultRenderUtils } from './render-utils';
