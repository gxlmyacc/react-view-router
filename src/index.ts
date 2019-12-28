

import ReactViewRouter from './router';

export * from './types';

export {
  default as RouterView,
  RouterViewComponent,
  RouterViewProps,
  RouterViewState,
  RouterViewDefaultProps
}  from './router-view';
export { default as withRouter }  from './with-router';
export { default as createRouterLink } from './router-link';
export { default as config } from './config';

export { useRouteGuards, REACT_FORWARD_REF_TYPE } from './route-guard';
export { lazyImport } from './route-lazy';

export * from './util';


export default ReactViewRouter;
