import { ReactViewRouterGlobal } from './types';

const REACT_VIEW_ROUTER_KEY = '__REACT_VIEW_ROUTER_GLOBAL__';
// @ts-ignore
if (!globalThis[REACT_VIEW_ROUTER_KEY as any]) {
  Object.defineProperty(globalThis, REACT_VIEW_ROUTER_KEY, {
    value: {
      contexts: {},
      historys: {}
    },
    configurable: true,
  });
}
// @ts-ignore
const REACT_VIEW_ROUTER_GLOBAL: ReactViewRouterGlobal = globalThis[REACT_VIEW_ROUTER_KEY] as any;

if (!REACT_VIEW_ROUTER_GLOBAL.contexts) REACT_VIEW_ROUTER_GLOBAL.contexts = {};

export {
  REACT_VIEW_ROUTER_GLOBAL
};
