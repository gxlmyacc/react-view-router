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
  HISTORY_PROTOCOL_VERSION,
  Action,
  readonly,
  To,
  PartialPath,
} from './history';
import {
  innumerable,
  isHistory,
  once,
  getSessionStorage,
  setSessionStorage,
  isFunction,
  isString,
  warn,
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
  return eachInterceptor(interceptors, location, (ok) => {
    const finish = (isContinue: boolean, skipHistoryCommit = false) => {
      nexts.forEach((next) => next(isContinue));
      callback(skipHistoryCommit && !location.fromEvent ? false : isContinue, interceptors);
    };
    if (!ok) return finish(false);

    const runtimeItems = interceptors.filter((item) => (
      item.router
      && item.payload
      && isFunction(item.router._hasRouteRuntimeNavigationAdapters)
      && item.router._hasRouteRuntimeNavigationAdapters()
      && isFunction(item.router._commitRouteRuntimeNavigation)
    ));
    const tryRuntimeCommit = (index: number): any => {
      const item = runtimeItems[index];
      if (!item) return null;
      const runtimeCommit = item.router!._commitRouteRuntimeNavigation(location, item.payload);
      if (!runtimeCommit) return tryRuntimeCommit(index + 1);
      return Promise.resolve(runtimeCommit)
        .then((result) => result || tryRuntimeCommit(index + 1));
    };

    const runtimeCommit = tryRuntimeCommit(0);
    if (!runtimeCommit) return finish(true);
    return Promise.resolve(runtimeCommit).then((result) => {
      if (!result) return finish(true);
      if (result.status === 'committed' || result.status === 'delegated') {
        return finish(true, true);
      }
      return finish(false);
    }, () => finish(false));
  }, 0, nexts);
}

function createStackInfo(index: number, location: Location, navigation?: any) {
  const stackInfo: HistoryStackInfo = {
    pathname: location.pathname,
    search: location.search,
    index,
    timestamp: Date.now(),
    query: parseQuery(location.search)
  };
  const navigationKey = navigation && navigation.currentEntry && navigation.currentEntry.key;
  if (isString(navigationKey)) stackInfo.navigationKey = navigationKey;
  return stackInfo;
}

function resolveHistory4Pathname(to: string, from: string) {
  const toParts = to ? to.split('/') : [];
  let fromParts = from ? from.split('/') : [];
  if (toParts.length) {
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }
  if (!fromParts.length) return '/';

  const last = fromParts[fromParts.length - 1];
  const hasTrailingSlash = last === '.' || last === '..' || last === '';
  let up = 0;
  for (let index = fromParts.length - 1; index >= 0; index--) {
    const part = fromParts[index];
    if (part === '.') fromParts.splice(index, 1);
    else if (part === '..') {
      fromParts.splice(index, 1);
      up++;
    } else if (up) {
      fromParts.splice(index, 1);
      up--;
    }
  }
  if (fromParts[0] !== '') fromParts.unshift('');

  let result = fromParts.join('/');
  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';
  return result;
}

function parseHistory4Path(path: string) {
  let pathname = path || '/';
  let search = '';
  let hash = '';
  const hashIndex = pathname.indexOf('#');
  if (~hashIndex) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }
  const searchIndex = pathname.indexOf('?');
  if (~searchIndex) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }
  return {
    pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash,
  };
}

function createHistory4(history: HistoryFix, options: History4Options) {
  let { basename = '' } = options;
  if (basename && !basename.startsWith('/')) basename = '/' + basename;
  if (basename && basename.endsWith('/')) basename = basename.substr(0, basename.length - 1);

  const hasBasename = (pathname: string) => pathname.toLowerCase().indexOf(basename.toLowerCase()) === 0
    && '/?#'.indexOf(pathname.charAt(basename.length)) !== -1;
  const encodeLocation = (location: PartialPath) => {
    if (!basename) return location;
    const pathname = location.pathname || '/';
    return { ...location, pathname: basename + pathname };
  };
  const decodeLocation = (location: Location) => {
    if (!basename) return location;
    const ret = { ...location };
    if (hasBasename(ret.pathname)) {
      ret.pathname = ret.pathname.substr(basename.length) || '/';
    }
    return ret as Location;
  };
  let sourceLocationCached: Location|null = null;
  let locationCached: Location|null = null;
  let pendingLocation: any = null;
  const getLocation = (sourceLocation: Location = history.location) => {
    if (sourceLocation !== sourceLocationCached) {
      sourceLocationCached = sourceLocation;
      const decodedLocation = decodeLocation(sourceLocation);
      if (pendingLocation) {
        const normalizedPathname = pendingLocation.pathname.length > 1 && pendingLocation.pathname.endsWith('/')
          ? pendingLocation.pathname.substr(0, pendingLocation.pathname.length - 1)
          : pendingLocation.pathname;
        if (decodedLocation.pathname === normalizedPathname
          && decodedLocation.search === pendingLocation.search
          && decodedLocation.hash === pendingLocation.hash) {
          locationCached = {
            ...pendingLocation,
            key: decodedLocation.key,
            state: decodedLocation.state,
          };
        } else locationCached = decodedLocation;
        pendingLocation = null;
      } else locationCached = decodedLocation;
    }
    return locationCached as Location;
  };
  const createLocation = (to: To, state?: any) => {
    const location: any = isString(to) ? parseHistory4Path(to) : { ...to };
    if (isString(to)) location.state = state;
    else if (state !== undefined && location.state === undefined) location.state = state;

    if (location.pathname === undefined) location.pathname = '';
    try {
      location.pathname = decodeURI(location.pathname);
    } catch (error) {
      if (error instanceof URIError) {
        throw new URIError(`Pathname "${location.pathname}" could not be decoded. This is likely caused by an invalid percent-encoding.`);
      }
      throw error;
    }
    const currentLocation = getLocation();
    if (!location.pathname) location.pathname = currentLocation.pathname;
    else if (!location.pathname.startsWith('/')) {
      location.pathname = resolveHistory4Pathname(location.pathname, currentLocation.pathname);
    }
    if (location.search === '?') location.search = '';
    else if (location.search) {
      if (!location.search.startsWith('?')) location.search = '?' + location.search;
    } else location.search = '';
    if (location.hash === '#') location.hash = '';
    else if (location.hash) {
      if (!location.hash.startsWith('#')) location.hash = '#' + location.hash;
    } else location.hash = '';
    return location;
  };

  let prompt: any = null;
  let isBlocked = false;
  let removeBlocker: (() => void)|null = null;
  const getUserConfirmation = options.getUserConfirmation || (
    history.type !== HistoryType.memory && isFunction((globalThis as any).confirm)
      ? (message: string, callback: (ok: boolean) => void) => callback((globalThis as any).confirm(message))
      : null
  );
  const history4 = {
    isHistory4: true,
    goBack: () => history.back(),
    goForward: () => history.forward(),
    listen: (listener) => history.listen(({ location, action }) => listener(getLocation(location), action)),
    block: (nextPrompt = false) => {
      if (prompt != null) warn('A history supports only one prompt at a time');
      prompt = nextPrompt;
      const clearPrompt = () => {
        if (prompt === nextPrompt) prompt = null;
      };
      if (!isBlocked) {
        removeBlocker = history.block(({ location, action, callback }) => {
          const result = isFunction(prompt) ? prompt(getLocation(location), action) : prompt;
          if (isString(result)) {
            if (getUserConfirmation) getUserConfirmation(result, callback);
            else {
              warn('A history needs a getUserConfirmation function in order to use a prompt message');
              callback(true);
            }
          } else callback(result !== false);
        });
        isBlocked = true;
      }
      return () => {
        if (isBlocked) {
          isBlocked = false;
          if (removeBlocker) removeBlocker();
          removeBlocker = null;
        }
        clearPrompt();
      };
    }
  } as History4;
  innumerable(history4, 'owner', history);
  readonly(history4, 'location', () => getLocation());
  const initialOwnerLocation = history.location;
  readonly(history4, 'action', () => (
    history.location === initialOwnerLocation ? Action.Pop : history.action
  ));
  history4.createHref = (to) => {
    const location: any = isString(to) ? createLocation(to) : { ...to };
    if (location.search === '?') location.search = '';
    else if (location.search) {
      if (!location.search.startsWith('?')) location.search = '?' + location.search;
    } else location.search = '';
    if (location.hash === '#') location.hash = '';
    else if (location.hash) {
      if (!location.hash.startsWith('#')) location.hash = '#' + location.hash;
    } else location.hash = '';
    return history.createHref(encodeLocation(location));
  };
  history4.push = (to, state) => {
    const location = createLocation(to, state);
    pendingLocation = location;
    history.push(encodeLocation(location), location.state);
  };
  history4.replace = (to, state) => {
    const location = createLocation(to, state);
    pendingLocation = location;
    history.replace(encodeLocation(location), location.state);
  };

  ['length', 'type', 'go', 'state'].forEach((key) => {
    readonly(history4, key, () => (history as any)[key]);
  });

  return history4 as History4;
}

function isHistory4(history: any): history is History4 {
  return history && history.isHistory4;
}

function ensureHistoryProtocol(history: HistoryFix) {
  const version = typeof history.version === 'number' ? history.version : 1;
  if (version >= HISTORY_PROTOCOL_VERSION) return history;

  if (isFunction(history._unblock)) history._unblock();
  innumerable(history, '_unblock', history.block(({ action, location, callback }) => {
    const routeLocation = { action, ...location } as RouteHistoryLocation;
    confirmInterceptors(history.interceptors, routeLocation, callback);
  }));
  innumerable(history, 'version', HISTORY_PROTOCOL_VERSION);
  return history;
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
      /* istanbul ignore if -- 同 interceptor 替换 router 的边界场景 */
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
  const navigation = needSession
    ? ((options.window && options.window.navigation) || (globalThis as any).navigation)
    : null;
  const SessionStacksKey = `_REACT_VIEW_ROUTER_${type.toUpperCase()}_STACKS_`;
  const SessionStacksKeys = ['index', 'pathname', 'search', 'timestamp', 'navigationKey'];
  history.stacks = needSession
    ? getSessionStorage(SessionStacksKey, true) || []
    : [];
  history.stacks.forEach((s) => !s.query && (s.query = parseQuery(s.search)));

  const lastStackInfo: HistoryStackInfo = history.stacks[history.stacks.length - 1];
  if (!lastStackInfo || lastStackInfo.index !== history.index) {
    history.stacks.push(createStackInfo(history.index, history.location, navigation));
    if (needSession) setSessionStorage(SessionStacksKey, history.stacks, SessionStacksKeys);
  }
  innumerable(history, '_unlisten', history.listen((state) => {
    if (!state) return;
    const { location, index } = state;
    const lastStackInfo: HistoryStackInfo = history.stacks[history.stacks.length - 1];
    if (lastStackInfo && index > lastStackInfo.index) {
      history.stacks.push(createStackInfo(index, location, navigation));
    } else {
      const idx = history.stacks.findIndex((v) => v.index === index);
      if (~idx) {
        history.stacks.splice(idx, history.stacks.length, createStackInfo(index, location, navigation));
      }
    }
    if (needSession) setSessionStorage(SessionStacksKey, history.stacks, SessionStacksKeys);
    // console.log('[createHistory][listen]', location, action, index);
  }));
  return ensureHistoryProtocol(history);
}

function createHashHistoryNew(options: HashHistoryOptions & {
  history?: HistoryFix
}, router: ReactViewRouter) {
  if (options.history && options.history.type === HistoryType.hash) {
    return ensureHistoryProtocol(isHistory4(options.history) ? options.history.owner : options.history);
  }
  if (REACT_VIEW_ROUTER_GLOBAL.historys.hash) {
    router.isHistoryCreator = REACT_VIEW_ROUTER_GLOBAL.historys.hash.extra === router;
    return ensureHistoryProtocol(REACT_VIEW_ROUTER_GLOBAL.historys.hash);
  }
  return REACT_VIEW_ROUTER_GLOBAL.historys.hash = createHistory(
    options,
    () => {
      router.isHistoryCreator = true;
      return createHashHistory({ ...options, extra: router }) as any;
    },
    HistoryType.hash
  );
}


function createBrowserHistoryNew(options: BrowserHistoryOptions & {
  history?: HistoryFix
}, router: ReactViewRouter) {
  if (options.history && options.history.type === HistoryType.browser) {
    return ensureHistoryProtocol(isHistory4(options.history) ? options.history.owner : options.history);
  }
  if (REACT_VIEW_ROUTER_GLOBAL.historys.browser) {
    router.isHistoryCreator = REACT_VIEW_ROUTER_GLOBAL.historys.browser.extra === router;
    return ensureHistoryProtocol(REACT_VIEW_ROUTER_GLOBAL.historys.browser);
  }
  return REACT_VIEW_ROUTER_GLOBAL.historys.browser = createHistory(
    options,
    () => {
      router.isHistoryCreator = true;
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
    return ensureHistoryProtocol(isHistory4(options.history) ? options.history.owner : options.history);
  }
  return createHistory(
    options,
    () => {
      router.isHistoryCreator = true;
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

export type {
  History,
  HistoryFix,
};

export {
  createHashHistoryNew as createHashHistory,
  createBrowserHistoryNew as createBrowserHistory,
  createMemoryHistoryNew as createMemoryHistory,
  getBaseHref,
  getPossibleHistory,
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
