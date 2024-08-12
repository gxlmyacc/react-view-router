import { ReactViewRouterGlobal } from './types';

const REACT_VIEW_ROUTER_KEY = '__REACT_VIEW_ROUTER_GLOBAL__';

/** @type {Window & typeof globalThis & { [RAINBOW_ROUTER_KEY]: RainbowRouterGlobal }} */
let _global = null;


if (typeof globalThis === 'undefined') {
  if (typeof window !== 'undefined') {
    _global = window;
    // @ts-ignore
    window.globalThis = window;
  }
  if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
    // @ts-ignore
    global.globalThis = global;
    _global = global;
  }
  if (typeof globalThis === 'undefined' && typeof self !== 'undefined') {
    // @ts-ignore
    self.globalThis = self;
    _global = self;
  }
  if (typeof globalThis === 'undefined' && typeof this !== 'undefined') {
    // @ts-ignore
    this.globalThis = this;
    _global = self;
  }
} else {
  _global = globalThis;
}

// @ts-ignore
if (!_global[REACT_VIEW_ROUTER_KEY]) {
  Object.defineProperty(_global, REACT_VIEW_ROUTER_KEY, {
    value: {
      contexts: {},
      historys: {}
    },
    configurable: true,
  });
}
// @ts-ignore
const REACT_VIEW_ROUTER_GLOBAL: ReactViewRouterGlobal = _global[REACT_VIEW_ROUTER_KEY] as any;

if (!REACT_VIEW_ROUTER_GLOBAL.contexts) {
  REACT_VIEW_ROUTER_GLOBAL.contexts = {};
}

export {
  REACT_VIEW_ROUTER_GLOBAL
};
