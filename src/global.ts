import { ReactViewRouterGlobal } from './types';

const REACT_VIEW_ROUTER_KEY = '__REACT_VIEW_ROUTER_GLOBAL__';
if (!window[REACT_VIEW_ROUTER_KEY as any]) {
  Object.defineProperty(window, REACT_VIEW_ROUTER_KEY, {
    value: {
      contexts: {},
      historys: {}
    },
    configurable: true,
  });
}
const REACT_VIEW_ROUTER_GLOBAL: ReactViewRouterGlobal = window[REACT_VIEW_ROUTER_KEY as any] as any;

if (!REACT_VIEW_ROUTER_GLOBAL.contexts) REACT_VIEW_ROUTER_GLOBAL.contexts = {};

export {
  REACT_VIEW_ROUTER_GLOBAL
};
