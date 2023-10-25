import {
  HashHistoryOptions,
  BrowserHistoryOptions,

  createHashHistory,
  createBrowserHistory,
  createMemoryHistory,
  getBaseHref,
  History,
  Location,
  HistoryType,
  readonly,
  To,
  Path,
  PartialPath,
} from './history';
import {
  innumerable,
  isHistory,
  once,
  getSessionStorage,
  setSessionStorage,
  isFunction,
  isString
} from './util';
import {
  HistoryFix,
  HistoryStackInfo,
  RouteInterceptor,
  RouteHistoryLocation,
  RouteInterceptorItem,
  RouteInterceptorCallback,
  History4,
  History4Options,
  ReactViewRouterMoreOptions
} from './types';
import ReactViewRouter from './router';
import { REACT_VIEW_ROUTER_GLOBAL } from './global';
import { parseQuery } from './config';


function eachInterceptor<T = any>(
  interceptors: RouteInterceptorItem[],
  location: RouteHistoryLocation,
  callback: (ok: boolean, payload?: T|null) => void,
  index: number,
  nexts: RouteInterceptorCallback[],
  payload?: T|null
) {
  let item = interceptors[index];
  if (!item) return callback(true, payload);
  if (isFunction(item)) item = { interceptor: item as any, router: null };
  const cb: RouteInterceptorCallback<any, T> = once((ok, payload) => {
    item.payload = payload;
    if (!ok) return callback(ok);
    if (isFunction(ok)) nexts.push(ok);
    eachInterceptor(interceptors, location, callback, index + 1, nexts, payload);
  });
  if (item.router && item.router.isRunning) item.interceptor(location, cb);
  else cb(true, payload);
}

function confirmInterceptors(
  interceptors: RouteInterceptorItem[],
  location: RouteHistoryLocation,
  callback: (ok: boolean, payload: RouteInterceptorItem[]) => void
) {
  if (isHistory(interceptors)) interceptors = interceptors.interceptors;
  const nexts: RouteInterceptorCallback[] = [];
  interceptors = [...interceptors];
  return eachInterceptor(interceptors, location, ok => {
    nexts.forEach(next => next(ok));
    callback(ok, interceptors);
  }, 0, nexts);
}

function createStackInfo(index: number, location: Location) {
  return {
    pathname: location.pathname,
    search: location.search,
    index,
    timestamp: Date.now(),
    query: parseQuery(location.search)
  };
}

function createHistory4(history: HistoryFix, options: History4Options = {}) {
  let { basename = '' } = options;
  if (basename && basename.endsWith('/')) basename = basename.substr(0, basename.length - 1);

  const ensurceSlash = (pathname?: string) => pathname && (pathname.startsWith('/') ? pathname : '/' + pathname);
  const encodeLocation = (location: To) => {
    if (!basename) return location;
    if (isString(location)) return basename + ensurceSlash(location);
    return {
      ...location,
      pathname: basename + ensurceSlash(location.pathname)
    };
  };
  const decodeLocation = (location: string|PartialPath|Path) => {
    if (!basename) return location;
    if (isString(location) && location.startsWith(basename)) return location.replace(basename, '');
    const ret = { ...(location as PartialPath) };
    if (ret.pathname?.startsWith(basename)) {
      ret.pathname = ret.pathname.replace(basename, '');
    }
    return ret;
  };

  const history4 = {
    isHistory4: true,
    goBack: () => history.back(),
    goForward: () => history.forward(),
    listen: (listener) => history.listen(({ location, action }) => listener(decodeLocation(location) as any, action)),
    block: (prompt) => history.block(({ location, action, callback }) => {
      if (prompt != null) {
        const result = typeof prompt === 'function' ? prompt(decodeLocation(location) as any, action) : prompt;

        if (isString(result)) {
          if (typeof options.getUserConfirmation === 'function') {
            options.getUserConfirmation(result, callback);
          } else {
            // if (process.env.NODE_ENV !== 'production') warn('A history needs a getUserConfirmation function in order to use a prompt message');
            callback(true);
          }
        } else {
          // Return false from a transition hook to cancel the transition.
          callback(result !== false);
        }
      } else {
        callback(true);
      }
    })
  } as History4;
  innumerable(history4, 'owner', history);

  innumerable(history, 'locationCached', null);
  readonly(history4, 'location', function () {
    const newLocation = history.location;
    const locationCached = this.locationCached;
    if (!locationCached
      || locationCached.pathname !== newLocation.pathname
      || locationCached.search !== newLocation.search
      || locationCached.hash !== newLocation.hash) {
      this.locationCached = encodeLocation(newLocation);
    }
    return this.locationCached;
  });
  history4.createHref = location => history.createHref(encodeLocation(location));
  history4.push = (path, state) => history.push(encodeLocation(path), state);
  history4.replace = (path, state) => history.replace(encodeLocation(path), state);

  ['length', 'type', 'action', 'go'].forEach(key => {
    const get = () => (history as any)[key];
    Object.defineProperty(history4, key, {
      get,
      enumerable: true,
      configurable: true
    });
  });

  return history4 as History4;
}

function isHistory4(history: any): history is History4 {
  return history && history.isHistory4;
}


function createHistory(options: any, fn: () => HistoryFix, type: HistoryType) {
  const interceptors: RouteInterceptorItem[] = [];
  const history = fn();

  history.createHistory4 = (options = {}) => createHistory4(history, options);
  history.isHistoryInstance = true;
  history.interceptors = interceptors;
  history.interceptorTransitionTo = function (interceptor: RouteInterceptor, router: ReactViewRouter) {
    const idx = this.interceptors.findIndex((v: any) => v.interceptor === interceptor);
    let newRouter: ReactViewRouter|null = null;
    if (idx < 0) {
      this.interceptors.push({ interceptor, router });
      newRouter = router;
    } else {
      console.error(`[react-view-router][interceptorTransitionTo]interceptor was already exist in index: ${idx}!`, router);
      if (router && router !== this.interceptors[idx].router) {
        const oldRouter: ReactViewRouter = this.interceptors[idx].router;
        oldRouter && oldRouter.stop();

        this.interceptors[idx].router = router;
        newRouter = router;

        console.error('[react-view-router][interceptorTransitionTo] router was replaced by same interceptor!', oldRouter, router);
      }
    }
    if (newRouter && newRouter.basename) {
      const basename = newRouter.basename;
      let parentRouter: ReactViewRouter | null = null;
      this.interceptors.forEach((v: RouteInterceptorItem) => {
        if (!v.router || v.router === newRouter || !basename.includes(v.router.basename)) return;
        if (!parentRouter || parentRouter.basename < v.router.basename) parentRouter = v.router;
      });
      if (newRouter._updateParent) newRouter._updateParent(parentRouter);
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
  const SessionStacksKey = `_REACT_VIEW_ROUTER_${type.toUpperCase()}_STACKS_`;
  const SessionStacksKeys = ['index', 'pathname', 'search', 'timestamp'];
  history.stacks = needSession
    ? getSessionStorage(SessionStacksKey, true) || []
    : [];
  history.stacks.forEach(s => !s.query && (s.query = parseQuery(s.search)));

  const lastStackInfo: HistoryStackInfo = history.stacks[history.stacks.length - 1];
  if (!lastStackInfo || lastStackInfo.index !== history.index) {
    history.stacks.push(createStackInfo(history.index, history.location));
    if (needSession) setSessionStorage(SessionStacksKey, history.stacks, SessionStacksKeys);
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
    if (needSession) setSessionStorage(SessionStacksKey, history.stacks, SessionStacksKeys);
    // console.log('[createHistory][listen]', location, action, index);
  }));
  innumerable(history, '_unblock', history.block(({ action, location, callback }) => {
    location = { action, ...location } as RouteHistoryLocation;
    confirmInterceptors(interceptors, location as RouteHistoryLocation, callback);
  }));
  return history;
}

function createHashHistoryNew(options: HashHistoryOptions & {
  history?: HistoryFix
}, router: ReactViewRouter) {
  if (options.history && options.history.type === HistoryType.hash) {
    return isHistory4(options.history) ? options.history.owner : options.history;
  }
  if (REACT_VIEW_ROUTER_GLOBAL.historys.hash) {
    router.isHistoryCreater = REACT_VIEW_ROUTER_GLOBAL.historys.hash.extra === router;
    return REACT_VIEW_ROUTER_GLOBAL.historys.hash;
  }
  return REACT_VIEW_ROUTER_GLOBAL.historys.hash = createHistory(
    options,
    () => {
      router.isHistoryCreater = true;
      return createHashHistory({ ...options, extra: router }) as any;
    },
    HistoryType.hash
  );
}


function createBrowserHistoryNew(options: BrowserHistoryOptions & {
  history?: HistoryFix
}, router: ReactViewRouter) {
  if (options.history && options.history.type === HistoryType.browser) {
    return isHistory4(options.history) ? options.history.owner : options.history;
  }
  if (REACT_VIEW_ROUTER_GLOBAL.historys.browser) {
    router.isHistoryCreater = REACT_VIEW_ROUTER_GLOBAL.historys.browser.extra === router;
    return REACT_VIEW_ROUTER_GLOBAL.historys.browser;
  }
  return REACT_VIEW_ROUTER_GLOBAL.historys.browser = createHistory(
    options,
    () => {
      router.isHistoryCreater = true;
      return createBrowserHistory({ ...options, extra: router }) as any;
    },
    HistoryType.browser,
  );
}

function createMemoryHistoryNew(options: {
  history?: HistoryFix,
  pathname?: string,
}, router: ReactViewRouter) {
  if (options.history && options.history.type === HistoryType.memory) {
    return isHistory4(options.history) ? options.history.owner : options.history;
  }
  return createHistory(
    options,
    () => {
      router.isHistoryCreater = true;
      return createMemoryHistory({
        initialEntries: options.pathname ? [options.pathname] : ['/'],
        extra: router
      }) as any;
    },
    HistoryType.memory,
  );
}

function getPossibleHistory(options?: ReactViewRouterMoreOptions) {
  if (REACT_VIEW_ROUTER_GLOBAL.historys.hash) {
    return REACT_VIEW_ROUTER_GLOBAL.historys.hash;
  }
  if (REACT_VIEW_ROUTER_GLOBAL.historys.browser) {
    return REACT_VIEW_ROUTER_GLOBAL.historys.browser;
  }
  if (options && options.history) return options.history;
  return null;
}

export {
  createHashHistoryNew as createHashHistory,
  createBrowserHistoryNew as createBrowserHistory,
  createMemoryHistoryNew as createMemoryHistory,
  getBaseHref,
  getPossibleHistory,
  History,
  HistoryFix,
  confirmInterceptors,
  REACT_VIEW_ROUTER_GLOBAL,

  isHistory4
};

// export {
//   createHashHistory,
//   createBrowserHistory,
//   createMemoryHistory,
//   History,
//   HistoryFix,
//   LocationState
// };
