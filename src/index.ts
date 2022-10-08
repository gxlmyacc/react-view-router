import ReactViewRouter from './router';

export * from './types';

export {
  default as RouterView,
  RouterViewComponent,
  RouterViewProps,
  RouterViewState,
  RouterViewDefaultProps
}  from './router-view';
export * from './hocs';
export * from './hooks';

export { default as createRouterLink, RouterLink, guardEvent, RouterLinkProps } from './router-link';
export { default as config,  parseQuery, stringifyQuery } from './config';

export { withRouteGuards, REACT_FORWARD_REF_TYPE } from './route-guard';
export { lazyImport } from './route-lazy';

export * from './history';
export * from './util';

// eslint-disable-next-line no-undef
const version = typeof __packageversion__ === 'undefined' ? undefined : __packageversion__;

export {
  version
};


export default ReactViewRouter;
