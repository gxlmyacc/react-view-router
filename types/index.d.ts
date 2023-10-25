import ReactViewRouter, { version } from './router';
export * from './types';
export { default as RouterView, RouterViewComponent, RouterViewProps, RouterViewState, RouterViewDefaultProps } from './router-view';
export * from './hocs';
export * from './hooks';
export { KEEP_ALIVE_ANCHOR, KEEP_ALIVE_REPLACOR, KEEP_ALIVE_KEEP_COPIES } from './keep-alive';
export { default as createRouterLink, RouterLink, guardEvent, RouterLinkProps } from './router-link';
export { default as config, parseQuery, stringifyQuery } from './config';
export { withRouteGuards, REACT_FORWARD_REF_TYPE } from './route-guard';
export { lazyImport } from './route-lazy';
export * from './history';
export * from './util';
export { version };
export default ReactViewRouter;
