import { ReactViewRouterGlobal } from './types';

declare const global: any;

const REACT_VIEW_ROUTER_KEY = '__REACT_VIEW_ROUTER_GLOBAL__';

/** @type {Window & typeof globalThis & { [REACT_VIEW_ROUTER_KEY]: ReactViewRouterGlobal }} */
let _global = null;


/* istanbul ignore next -- 兼容无 globalThis 的旧运行环境 */
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

/* istanbul ignore if -- 已有 global 对象但缺少 contexts 时补全 */
if (!REACT_VIEW_ROUTER_GLOBAL.contexts) {
  REACT_VIEW_ROUTER_GLOBAL.contexts = {};
}

export {
  REACT_VIEW_ROUTER_GLOBAL
};
