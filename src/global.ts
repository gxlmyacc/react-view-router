import { ReactViewRouterGlobal } from './types';

const REACT_VIEW_ROUTER_KEY = '__REACT_VIEW_ROUTER_GLOBAL__';
// @ts-ignore
if (!global[REACT_VIEW_ROUTER_KEY as any]) {
  Object.defineProperty(window, REACT_VIEW_ROUTER_KEY, {
    value: {
      contexts: {},
      historys: {}
    },
    configurable: true,
  });
}
// @ts-ignore
const REACT_VIEW_ROUTER_GLOBAL: ReactViewRouterGlobal = global[REACT_VIEW_ROUTER_KEY] as any;

if (!REACT_VIEW_ROUTER_GLOBAL.contexts) REACT_VIEW_ROUTER_GLOBAL.contexts = {};

export {
  REACT_VIEW_ROUTER_GLOBAL
};
