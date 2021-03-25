import {
  MemoryHistoryOptions,
  HashHistoryOptions,
  BrowserHistoryOptions,

  createHashHistory,
  createBrowserHistory,
  createMemoryHistory,
  getBaseHref,
  History,
  Location,
} from './history';
import {
  innumerable,
  isHistory,
  once,
  getSessionStorage,
  setSessionStorage,
} from './util';
import {
  HistoryFix,
  HistoryStackInfo,
  RouteInterceptor,
  RouteHistoryLocation,
  RouteInterceptorItem,
  RouteInterceptorCallback,
} from './types';
import ReactViewRouter, { isFunction } from '.';

export enum HistoryType {
  // eslint-disable-next-line no-unused-vars
  hash = 'hash',
  // eslint-disable-next-line no-unused-vars
  browser = 'browser',
  // eslint-disable-next-line no-unused-vars
  memory = 'memory'
}

const RAINBOW_ROUTER_KEY = '__RAINBOW_ROUTER_GLOBAL__';
if (!window[RAINBOW_ROUTER_KEY as any]) {
  innumerable(window, RAINBOW_ROUTER_KEY, { historys: {} });
}
const RAINBOW_ROUTER_GLOBAL: {
  historys: {
    hash?: HistoryFix,
    browser?: HistoryFix,
    memory?: HistoryFix,
  }
} = window[RAINBOW_ROUTER_KEY as any] as any;

function eachInterceptor(
  interceptors: RouteInterceptorItem[],
  location: RouteHistoryLocation,
  callback: (ok: boolean) => void,
  index: number,
  nexts: RouteInterceptorCallback[]
) {
  let item = interceptors[index];
  if (!item) return callback(true);
  if (isFunction(item)) item = { interceptor: item as any, router: null };
  const cb = once(ok => {
    if (!ok) return callback(ok);
    if (isFunction(ok)) nexts.push(ok);
    eachInterceptor(interceptors, location, callback, index + 1, nexts);
  });
  if (item.router && item.router.isRunning) item.interceptor(location, cb);
  else cb(true);
}

function confirmInterceptors(
  interceptors: HistoryFix | RouteInterceptorItem[],
  location: string | RouteHistoryLocation,
  callback: (ok: boolean) => void
) {
  if (isHistory(interceptors)) interceptors = interceptors.interceptors;
  const nexts: RouteInterceptorCallback[] = [];
  interceptors = [...interceptors];
  return eachInterceptor(interceptors, location as RouteHistoryLocation, ok => {
    nexts.forEach(next => next(ok));
    callback(ok);
  }, 0, nexts);
}

function createStackInfo(index: number, location: Location) {
  return {
    pathname: location.pathname,
    search: location.search,
    index,
    timestamp: Date.now(),
  };
}

function createHistory(options: any, fn: () => HistoryFix, type: HistoryType) {
  const interceptors: RouteInterceptorItem[] = [];
  const history = fn();

  history.isHistoryInstance = true;
  history.interceptors = interceptors;
  history.interceptorTransitionTo = function (interceptor: RouteInterceptor, router: ReactViewRouter) {
    const idx = this.interceptors.findIndex((v: any) => v.interceptor === interceptor);
    if (idx < 0) {
      if (router && router.basename) {
        let parentRouter: ReactViewRouter | null = null;
        this.interceptors.forEach((v: RouteInterceptorItem) => {
          if (v.router && router.basename.includes(v.router.basename)) {
            if (!parentRouter || parentRouter.basename < v.router.basename) parentRouter = v.router;
          }
        });
        if (router._updateParent) router._updateParent(parentRouter);
      }
      this.interceptors.push({ interceptor, router });
    }
    return () => {
      const idx = this.interceptors.findIndex((v: RouteInterceptorItem) => v.interceptor === interceptor);
      if (~idx) {
        this.interceptors.splice(idx, 1);
        if (router.parent && router._updateParent) router._updateParent(null);
      }
    };
  };

  const needSession = type !== HistoryType.memory;
  const SessionStacksKey = `_RAINBOW_ROUTER_${type.toUpperCase()}_STACKS_`;

  history.stacks = needSession
    ? getSessionStorage(SessionStacksKey, true) || []
    : [];
  const lastStackInfo: HistoryStackInfo = history.stacks[history.stacks.length - 1];
  if (!lastStackInfo || lastStackInfo.index !== history.index) {
    history.stacks.push(createStackInfo(history.index, history.location));
    if (needSession) setSessionStorage(SessionStacksKey, history.stacks);
  }
  innumerable(history, '_unlisten', history.listen(state => {
    if (!state) return;
    const { location, index } = state;
    const lastStackInfo: HistoryStackInfo = history.stacks[history.stacks.length - 1];
    if (lastStackInfo && index > lastStackInfo.index) {
      history.stacks.push(createStackInfo(index, location));
    } else {
      const idx = history.stacks.findIndex(v => v.index === index);
      if (~idx) {
        history.stacks.splice(idx, history.stacks.length, createStackInfo(index, location));
      }
    }
    if (needSession) setSessionStorage(SessionStacksKey, history.stacks);
    // console.log('[createHistory][listen]', location, action, index);
  }));
  innumerable(history, '_unblock', history.block(({ action, location, callback }) => {
    if (Object.isFrozen(location)) location = { ...location };
    confirmInterceptors(interceptors, location as RouteHistoryLocation, callback);
  }));
  return history;
}

function createHashHistoryNew(options: HashHistoryOptions) {
  if (RAINBOW_ROUTER_GLOBAL.historys.hash) {
    return RAINBOW_ROUTER_GLOBAL.historys.hash;
  }
  return RAINBOW_ROUTER_GLOBAL.historys.hash = createHistory(
    options,
    () => createHashHistory(options) as any,
    HistoryType.hash
  );
}


function createBrowserHistoryNew(options: BrowserHistoryOptions) {
  if (RAINBOW_ROUTER_GLOBAL.historys.browser) {
    return RAINBOW_ROUTER_GLOBAL.historys.browser;
  }
  return RAINBOW_ROUTER_GLOBAL.historys.browser = createHistory(
    options,
    () => createBrowserHistory(options) as any,
    HistoryType.browser
  );
}

function createMemoryHistoryNew(options: MemoryHistoryOptions) {
  return createHistory(
    options,
    () => createMemoryHistory(options) as any,
    HistoryType.memory
  );
}

function getPossibleRouterMode() {
  if (RAINBOW_ROUTER_GLOBAL.historys.hash) return 'hash';
  if (RAINBOW_ROUTER_GLOBAL.historys.browser) return 'browser';
  return '';
}

export {
  createHashHistoryNew as createHashHistory,
  createBrowserHistoryNew as createBrowserHistory,
  createMemoryHistoryNew as createMemoryHistory,
  getBaseHref,
  getPossibleRouterMode,
  History,
  HistoryFix,
  confirmInterceptors
};

// export {
//   createHashHistory,
//   createBrowserHistory,
//   createMemoryHistory,
//   History,
//   HistoryFix,
//   LocationState
// };
