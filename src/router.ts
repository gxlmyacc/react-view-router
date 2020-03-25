import { createHashHistory, createBrowserHistory, createMemoryHistory, History, LocationState } from 'history-fix';
import config from './config';
import {
  flatten, isAbsoluteUrl,
  normalizeRoutes, normalizeLocation, resolveRedirect,
  matchRoutes, isFunction, isLocation, nextTick, once,
  afterInterceptors,
  getHostRouterView,
} from './util';
import routeCache from './route-cache';
import { RouteLazy, hasRouteLazy, hasMatchedRouteLazy } from './route-lazy';
import { getGuardsComponent } from './route-guard';
import { RouterViewComponent as RouterView } from './router-view';
import {
  ReactVueRouterMode, ReactVueRouterOptions, ConfigRouteArray,
  RouteBeforeGuardFn, RouteAfterGuardFn, RouteNextFn, RouteHistoryLocation,
  RouteGuardInterceptor, RouteEvent, RouteChildrenFn, RouteNextResult, RouteLocation,
  matchPathResult, ConfigRoute, RouteErrorCallback,
  ReactViewRoutePlugin, Route, MatchedRoute, lazyResovleFn, RouteBindInstanceFn,
  ReactVueLikeClass
} from './types';


const HISTORY_METHS = ['push', 'replace', 'go', 'back', 'goBack', 'forward', 'goForward', 'block'];

let idSeed = 1;

export default class ReactViewRouter {

  parent: ReactViewRouter | null;

  options: ReactVueRouterOptions;

  mode: ReactVueRouterMode;

  basename: string;

  routes: ConfigRouteArray;

  plugins: ReactViewRoutePlugin[];

  beforeEachGuards: RouteBeforeGuardFn[];

  afterEachGuards: RouteAfterGuardFn[];

  prevRoute: Route | null;

  currentRoute: Route | null;

  pendingRoute: RouteHistoryLocation | null;

  initialRoute: Route;

  viewRoot: RouterView | null;

  errorCallback: RouteErrorCallback | null;

  app: any; // React.ComponentClass | null;

  isRunning: boolean;

  getHostRouterView: typeof getHostRouterView;

  nextTick: typeof nextTick;

  protected _history: History | null;

  protected _unlisten?: () => void;

  protected __unblock?: () => void;

  protected id: number;

  protected _nexting: RouteNextFn | null;

  protected ReactVueLike?: ReactVueLikeClass;

  protected _interceptorCounter: number;

  [key: string]: any;

  constructor({ parent = null, mode = 'hash', basename = '', base = '', ...options  }: ReactVueRouterOptions = {}) {
    options.getUserConfirmation = this._handleRouteInterceptor.bind(this);

    this.parent = parent !== this ? parent : null;
    this.id = idSeed++;
    this.options = options;
    this.mode = mode;
    this.basename = basename || base;
    this.routes = [];
    this.plugins = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.initialRoute = {} as any;
    this.prevRoute = null;
    this.currentRoute = null;
    this.pendingRoute = null;
    this.viewRoot = null;
    this.errorCallback = null;
    this.app = null;
    this._nexting = null;
    this._history = null;
    this.isRunning = false;
    this._interceptorCounter = 0;

    this.getHostRouterView = getHostRouterView;
    this.nextTick = nextTick.bind(this);

    // this.states = [];
    // this.stateOrigin = this.history.length;

    this.use(options);

    if (!options.manual) this.start();
  }

  get history(): History {
    if (this._history) return this._history;

    const options = this.options;
    if (options.history) {
      if (options.history instanceof ReactViewRouter) {
        this._history = options.history.history;
        this.mode = options.history.mode;
      } else this._history = options.history;
    } else {
      switch (this.mode) {
        case 'browser':
        case 'history':
          this._history = createBrowserHistory(this.options);
          break;
        case 'memory':
        case 'abstract':
          this._history = createMemoryHistory(this.options);
          break;
        default: this._history = createHashHistory(this.options);
      }
    }
    HISTORY_METHS.forEach(key => this[key] && (this[key] = this[key].bind(this)));

    return this._history as History<LocationState>;
  }

  start({ parent, mode, basename, base, ...options  }: ReactVueRouterOptions = {}) {
    this.stop();

    Object.assign(this.options, options);
    if (parent !== undefined && parent !== this) this.parent = parent;
    if (basename !== undefined) this.basename = basename;
    if (base !== undefined) this.basename = base;
    if (mode !== undefined) this.mode = mode;

    this._unlisten = this.history.listen((location: any) => this.updateRoute(location));
    this._unblock = this.history.block((location: any) => routeCache.create(location, this.id));

    if (this.routes.length) this._refreshInitialRoute();

    this.isRunning = true;
  }

  stop() {
    if (this._unlisten) { this._unlisten(); this._unlisten = undefined; }
    if (this._unblock) { this._unblock(); this._unblock = undefined; }
    this._history = null;
    this.isRunning = false;
    this._interceptorCounter = 0;
  }

  use({ routes, inheritProps, install, ...restOptions }: ReactVueRouterOptions) {
    if (routes) {
      this.routes = routes ? normalizeRoutes(routes) : [];
      if (this._history) this._refreshInitialRoute();
    }

    if (inheritProps !== undefined) config.inheritProps = inheritProps;

    Object.assign(config, restOptions);

    if (install) this.install = install.bind(this);
  }

  plugin(plugin: ReactViewRoutePlugin) {
    if (~this.plugins.indexOf(plugin)) return;
    this.plugins.push(plugin);
    if (plugin.install) plugin.install(this);
    return function () {
      const idx = this.plugins.indexOf(plugin);
      if (~idx) {
        this.plugins.splice(idx, 1);
        if (plugin.uninstall) plugin.uninstall(this);
      }
    };
  }

  _refreshInitialRoute() {
    const location = { ...this.history.location } as RouteHistoryLocation;
    if (window && window.location && window.location.search !== location.search) {
      let search = window.location.search;
      if (window.location.hash) {
        let [, hashSearch] = window.location.hash.match(/#[a-z0-9-_/]+\?(.+)/i) || [];
        if (hashSearch) search = search + (search ? '&' : '?') + hashSearch;
        location.search = search;
      }
    }
    this.updateRoute(location);
    this.initialRoute = this.createRoute(this._transformLocation(location));
  }

  _callEvent(event: string, ...args: any[]) {
    let plugin: ReactViewRoutePlugin | null = null;
    try {
      let ret: any;
      this.plugins.forEach(p => {
        plugin = p;
        const newRet = p[event] && p[event].call(p, ...args, ret);
        if (newRet !== undefined) ret = newRet;
      });
      return ret;
    } catch (ex) {
      if (plugin && (plugin as ReactViewRoutePlugin).name && ex && ex.message) {
        ex.message = `[${(plugin as ReactViewRoutePlugin).name}:${event}]${ex.message}`;
      }
      throw ex;
    }
  }

  _isReactVueLike(comp: any) {
    return comp && this.ReactVueLike && (
      // eslint-disable-next-line no-proto
      (comp.__proto__ && comp._isVueLike)
        || (comp.__vuelike || comp.__vuelikeClass || comp.prototype instanceof this.ReactVueLike)
    );
  }

  _getComponentGurads(mr: MatchedRoute, guardName: string,
    bindInstance: boolean | RouteBindInstanceFn = true) {
    let ret: RouteGuardInterceptor[] = [];

    const componentInstances = mr.componentInstances;

    // route config
    const routeGuardName = guardName.replace('Route', '');
    const r = mr.config;

    const guards = r[routeGuardName];
    if (guards) ret.push(guards);

    const toResovle = (c: any, key: string) => {
      let ret: RouteGuardInterceptor[] = [];
      const cc = c.__component ? getGuardsComponent(c, true) : c;

      const cg = c.__guards && c.__guards[guardName];
      if (cg) ret.push(cg);

      let ccg = cc && cc.prototype && cc.prototype[guardName];
      if (ccg) {
        if (this.ReactVueLike && !ccg.isMobxFlow && cc.__flows && ~cc.__flows.indexOf(guardName)) ccg = this.ReactVueLike.flow(ccg);
        ret.push(ccg);
      }
      if (this._isReactVueLike(cc) && Array.isArray(cc.mixins)) {
        cc.mixins.forEach((m: any) => {
          let ccg = m[guardName] || (m.prototype && m.prototype[guardName]);
          if (!ccg) return;
          if (this.ReactVueLike && !ccg.isMobxFlow && m.__flows && ~m.__flows.indexOf(guardName)) ccg = this.ReactVueLike.flow(ccg);
          ret.push(ccg);
        });
      }

      const ci = componentInstances[key];
      if (bindInstance) {
        if (isFunction(bindInstance)) ret = ret.map(v => bindInstance(v, key, ci, mr)).filter(Boolean) as RouteGuardInterceptor[];
        else if (ci) ret = ret.map(v => v.bind(ci));
      }
      ret = flatten(ret);
      ret.forEach(v => v.route = mr);
      return ret;
    };

    // route component
    r.components && Object.keys(r.components).forEach(key => {
      const c = r.components[key];
      if (!c) return;

      if (c instanceof RouteLazy) {
        const lazyResovle: lazyResovleFn = async (interceptors: any[], index: number) => {
          let nc = await c.toResolve(r, key);
          nc = this._callEvent('onResolveComponent', nc, r) || nc;
          let ret = toResovle(nc, key);
          interceptors.splice(index, 1, ...ret);
          return interceptors[index];
        };
        lazyResovle.lazy = true;
        lazyResovle.route = mr;
        ret.push(lazyResovle);
      } else ret.push(...toResovle(c, key));
    });

    return ret;
  }

  _getRouteComponentGurads(
    matched: MatchedRoute[],
    guardName: string,
    reverse: boolean = false,
    bindInstance: boolean | RouteBindInstanceFn = true
  ) {
    let ret: RouteGuardInterceptor[] = [];
    if (reverse) matched = matched.reverse();
    matched.forEach(r => {
      let guards = this._getComponentGurads(r, guardName, bindInstance);
      ret.push(...guards);
    });
    return ret;
  }

  _getSameMatched(route: Route | null, compare?: Route) {
    const ret: MatchedRoute[] = [];
    if (!compare) return [];
    route && route.matched.some((tr, i) => {
      let fr = compare.matched[i];
      if (tr.path !== fr.path) return true;
      ret.push(tr);
    });
    return ret.filter(r => !r.redirect);
  }

  _getChangeMatched(route: Route, compare?: Route | null, options: {
    containLazy?: boolean
    count?: number
  } = {}) {
    const ret: MatchedRoute[] = [];
    if (!compare) return [...route.matched];
    let start = false;
    route && route.matched.some((tr, i) => {
      let fr = compare.matched[i];
      if (!start) {
        start = (options.containLazy && hasRouteLazy(tr)) || !fr || fr.path !== tr.path;
        if (!start) return;
      }
      ret.push(tr);
      return typeof options.count === 'number' && ret.length === options.count;
    });
    return ret.filter(r => !r.redirect);
  }

  _getBeforeEachGuards(to: Route, from: Route | null, current: Route | null = null) {
    const ret = [...this.beforeEachGuards];
    const view = this;
    if (from) {
      const fm = this._getChangeMatched(from, to)
        .filter(r => Object.keys(r.componentInstances).some(key => r.componentInstances[key]));
      ret.push(...(this._getRouteComponentGurads(
        fm,
        'beforeRouteLeave',
        true,
        (fn, name, ci, r) => (function beforeRouteLeaveWraper(to: Route, from: Route | null, next: RouteNextFn) {
          return (fn as RouteBeforeGuardFn).call(ci, to, from, (cb?: RouteNextResult, ...args: any[]) => {
            if (isFunction(cb)) {
              const _cb = cb;
              cb = (...as: any[]) => {
                const res = _cb(...as);
                view._callEvent('onRouteLeaveNext', r, ci, res);
                return res;
              };
            }
            return next(cb, ...args);
          }, r);
        })
      ) as RouteBeforeGuardFn[]));
    }
    if (to) {
      let tm = this._getChangeMatched(to, from, { containLazy: true });
      tm.forEach(r => {
        let guards = this._getComponentGurads(
          r,
          'beforeRouteEnter',
          (fn, name) => (function beforeRouteEnterWraper(to: Route, from: Route | null, next: RouteNextFn) {
            return (fn as RouteBeforeGuardFn)(to, from, (cb, ...args) => {
              if (isFunction(cb)) {
                const _cb = cb;
                r.config._pending.completeCallbacks[name] = ci => {
                  const res = _cb(ci);
                  view._callEvent('onRouteEnterNext', r, ci, res);
                  return res;
                };
                cb = undefined;
              }
              return next(cb, ...args);
            }, r);
          })
        ) as RouteBeforeGuardFn[];
        ret.push(...guards);
      });
    }
    return flatten(ret);
  }

  // _getBeforeResolveGuards(to: Route, from: Route | null) {
  //   const ret = [...this.beforeResolveGuards];
  //   const view = this;
  //   if (from) {
  //     const fm = this._getChangeMatched(from, to)
  //       .filter(r => Object.keys(r.componentInstances).some(key => r.componentInstances[key]));
  //     ret.push(...(this._getRouteComponentGurads(fm, 'beforeRouteResolve'));
  //   }
  //   if (to) {
  //     let tm = this._getChangeMatched(to, from, { containLazy: true });
  //     tm.forEach(r => {
  //       let guards = this._getComponentGurads(
  //         r,
  //         'beforeRouteEnter',
  //         (fn, name) => (function beforeRouteEnterWraper(to: Route, from: Route | null, next: RouteNextFn) {
  //           return (fn as RouteBeforeGuardFn)(to, from, (cb, ...args) => {
  //             if (isFunction(cb)) {
  //               const _cb = cb;
  //               r.config._pending.completeCallbacks[name] = ci => {
  //                 const res = _cb(ci);
  //                 view._callEvent('onRouteEnterNext', r, ci, res);
  //                 return res;
  //               };
  //               cb = undefined;
  //             }
  //             return next(cb, ...args);
  //           }, r);
  //         })
  //       ) as RouteBeforeGuardFn[];
  //       ret.push(...guards);
  //     });
  //   }
  //   return flatten(ret);
  // }

  _getRouteUpdateGuards(to: Route, from: Route | null) {
    const ret = [];
    const fm: MatchedRoute[] = [];
    to && to.matched.some((tr, i) => {
      let fr = from && from.matched[i];
      if (!fr || fr.path !== tr.path) return true;
      fm.push(fr);
    });
    ret.push(...this._getRouteComponentGurads(fm.filter(r => !r.redirect), 'beforeRouteUpdate', true));
    return ret;
  }

  _getAfterEachGuards(to: Route, from: Route | null) {
    const ret = [];
    if (from) {
      const fm = this._getChangeMatched(from, to).filter(r => Object.keys(r.componentInstances)
        .some(key => r.componentInstances[key]));
      ret.push(...this._getRouteComponentGurads(fm, 'afterRouteLeave', true));
    }
    ret.push(...this.afterEachGuards);
    return flatten(ret);
  }

  _transformLocation(location: RouteHistoryLocation) {
    if (!location) return location;
    if (this.basename) {
      if (location.pathname.indexOf(this.basename) !== 0) return null;
      location = { ...location };
      location.pathname = location.pathname.substr(this.basename.length) || '/';
      if (location.path !== undefined) location.path = location.pathname;
    }
    return location;
  }

  async _handleRouteInterceptor(
    location: null | string | RouteHistoryLocation,
    callback: (ok: boolean, route?: Route | null) => void,
    isInit = false
  ) {
    if (!this.isRunning) return callback(false);
    if (typeof location === 'string') location = routeCache.flush(location);
    location = this._transformLocation(location as RouteHistoryLocation);
    if (!location) return callback(true);

    if ((!isInit && !location.onInit) && (
      !this.viewRoot || !this.viewRoot.state._routerInited
    )) return callback(false);

    this._callEvent('onRouteing', true);
    try {
      return await this._internalHandleRouteInterceptor(location, callback, isInit);
    } finally {
      this._callEvent('onRouteing', false);
    }
  }

  async _getInterceptor(interceptors: RouteGuardInterceptor[], index: number) {
    let interceptor = interceptors[index];
    while (interceptor && (interceptor as lazyResovleFn).lazy) {
      interceptor = await (interceptor as lazyResovleFn)(interceptors, index);
    }
    return interceptor as RouteBeforeGuardFn;
  }


  async _routetInterceptors(
    interceptors: RouteGuardInterceptor[],
    to: Route,
    from: Route | null,
    next?: RouteNextFn
  ) {
    const isBlock = (v: any, interceptor: RouteBeforeGuardFn) => {
      let _isLocation = typeof v === 'string' || isLocation(v);
      if (_isLocation && interceptor) {
        let _to = normalizeLocation(v, interceptor.route);
        v = _to && this.createRoute(_to);
        if (v && v.fullPath === to.fullPath) {
          v = undefined;
          _isLocation = false;
        }
      }
      return !this._history || v === false || _isLocation || v instanceof Error;
    };

    async function beforeInterceptor(
      interceptor: RouteBeforeGuardFn,
      index: number,
      to: Route,
      from: Route | null,
      next: RouteNextFn
    ) {
      if (!interceptor) return next();

      const nextWrapper: RouteNextFn = this._nexting = once(async f1 => {
        if (isBlock.call(this, f1, interceptor)) return next(f1);
        if (f1 === true) f1 = undefined;
        let nextInterceptor = await this._getInterceptor(interceptors, ++index);
        if (!nextInterceptor) return next((res: any) => isFunction(f1) && f1(res));
        try {
          return await beforeInterceptor.call(this,
            nextInterceptor,
            index,
            to,
            from,
            res => {
              let ret = next(res);
              if ((interceptor as RouteBeforeGuardFn).global) isFunction(f1) && f1(res);
              return ret;
            });
        } catch (ex) {
          console.error(ex);
          next(typeof ex === 'string' ? new Error(ex) : ex);
        }
      });
      return await (interceptor as RouteBeforeGuardFn)(to, from, nextWrapper, interceptor.route);
    }
    if (next) await beforeInterceptor.call(this, await this._getInterceptor(interceptors, 0), 0, to, from, next);
    else afterInterceptors.call(this, interceptors, to, from);
  }

  _internalHandleRouteInterceptor(
    location: RouteHistoryLocation,
    callback: (ok: boolean, route: Route | null) => void,
    isInit = false
  ) {
    let isContinue = false;
    let interceptorCounter = ++this._interceptorCounter;
    try {
      const to = this.createRoute(location);
      const from = isInit ? null : to.redirectedFrom || this.currentRoute;
      const current = this.currentRoute;
      const checkIsContinue = () => this.isRunning
          && interceptorCounter === this._interceptorCounter
          && Boolean(this.viewRoot && this.viewRoot._isMounted);
      const afterCallback = (isContinue: boolean, to: Route) => {
        if (isContinue) to.onInit && to.onInit(isContinue, to);
        else to.onAbort && to.onAbort(isContinue, to);

        this.nextTick(() => {
          if (!isInit && (!current || current.fullPath !== to.fullPath)) {
            this._routetInterceptors(this._getRouteUpdateGuards(to, current), to, current);
          }
        });
      };

      if (!to) return;

      if (from && to.path === from.path) {
        isContinue = checkIsContinue();
        callback(isContinue, null);
        afterCallback(isContinue, to);
        return;
      }

      let fallbackView: RouterView | null = null;
      if (hasMatchedRouteLazy(to.matched)) {
        fallbackView = this.viewRoot;
        this._getSameMatched(isInit ? null : this.currentRoute, to).reverse().some(m => {
          if (!m.viewInstances.default || !m.viewInstances.default.props.fallback) return;
          return fallbackView = m.viewInstances.default;
        });
      }

      fallbackView && fallbackView._updateResolving(true);
      this._routetInterceptors(this._getBeforeEachGuards(to, from, current), to, from, ok => {
        this._nexting = null;
        fallbackView && setTimeout(() => fallbackView && fallbackView._isMounted && fallbackView._updateResolving(false), 0);

        if (typeof ok === 'string') ok = { path: ok };
        isContinue = checkIsContinue()
          && Boolean(ok === undefined || (ok && !(ok instanceof Error) && !isLocation(ok)));

        const toLast = to.matched[to.matched.length - 1];
        if (isContinue && toLast && toLast.config.exact && toLast.redirect) {
          ok = resolveRedirect(toLast.redirect, toLast, to);
          if (ok) isContinue = false;
        }

        callback(isContinue, to);
        afterCallback(isContinue, to);

        if (!isContinue) {
          if (isLocation(ok)) {
            return this.redirect(ok, to.onComplete, to.onAbort, to.onInit || (isInit ? callback : null), to);
          }
          if (ok instanceof Error) this.errorCallback && this.errorCallback(ok);
          return;
        }

        this.nextTick(() => {
          if (isFunction(ok)) ok = ok(to);
          if (to && isFunction(to.onComplete)) to.onComplete(Boolean(ok), to);
          this._routetInterceptors(this._getAfterEachGuards(to, current), to, current);
        });
      });
    } catch (ex) {
      console.error(ex);
      if (!isContinue) callback(isContinue, null);
    }
  }

  _go(
    to: string | RouteLocation | Route | null,
    onComplete?: RouteEvent,
    onAbort?: RouteEvent,
    onInit?: RouteEvent | null,
    replace?: boolean
  ) {
    return new Promise((resolve, reject) => {
      let _to = normalizeLocation(to, this.currentRoute, false, this.basename);
      function doComplete(res: any, _to: Route | null) {
        onComplete && onComplete(res, _to);
        resolve(res);
      }
      function doAbort(res: any, _to: Route | null) {
        onAbort && onAbort(res, _to);
        reject(res === false && _to === null ? new Error('to path cannot be empty!') : res);
      }
      if (!this.isRunning) return doAbort(new Error('router is not running!'), null);
      if (!_to) return doAbort(false, null);

      if (isFunction(onComplete)) _to.onComplete = once(doComplete);
      if (isFunction(onAbort)) _to.onAbort = once(doAbort);
      if (onInit) _to.onInit = onInit;
      if (this._nexting) return this._nexting(_to);
      if (replace) _to.isReplace = true;

      if (!this.viewRoot || (!onInit && !this.viewRoot.state._routerInited)) {
        return this.pendingRoute = _to;
      }

      if (replace) {
        if (_to.fullPath && isAbsoluteUrl(_to.fullPath)) location.replace(_to.fullPath);
        else this.history.replace(_to);
      } else {
        if (_to.fullPath && isAbsoluteUrl(_to.fullPath)) location.href = _to.fullPath;
        else this.history.push(_to);
      }
    });
  }

  _replace(
    to: string | RouteLocation | Route,
    onComplete?: RouteEvent,
    onAbort?: RouteEvent,
    onInit?: RouteEvent | null
  ) {
    return this._go(to, onComplete, onAbort, onInit, true);
  }

  _push(
    to: string | RouteLocation | Route,
    onComplete?: RouteEvent,
    onAbort?: RouteEvent,
    onInit?: RouteEvent | null
  ) {
    return this._go(to, onComplete, onAbort, onInit);
  }

  createMatchedRoute(route: ConfigRoute, match?: matchPathResult | null): MatchedRoute {
    let { url, params } = match || { url: '', params: {} };
    let { path, subpath, meta, redirect, index, depth } = route;
    return {
      url,
      path,
      subpath,
      depth,
      meta,
      index,
      redirect,
      params,
      componentInstances: {},
      viewInstances: {},
      config: route
    };
  }

  getMatched(to: Route, from: Route | null, parent: ConfigRoute | null = null) {
    if (!from) from = this.currentRoute;
    function copyInstance(to: MatchedRoute, from: MatchedRoute | null) {
      if (!from) return;
      if (from.componentInstances) to.componentInstances = from.componentInstances;
      if (from.viewInstances) to.viewInstances = from.viewInstances;
    }
    let matched = matchRoutes(this.routes, to, parent);
    return matched.map(({ route, match }, i) => {
      let ret = this.createMatchedRoute(route, match);
      if (from) {
        const fr = from.matched[i];
        const tr = matched[i];
        if (fr && tr && fr.path === tr.route.path) copyInstance(ret, fr);
      }
      return ret;
    });
  }

  getMatchedComponents(to: Route, from: Route | null, parent: ConfigRoute | null) {
    return this.getMatched(to, from, parent).map(r => r.componentInstances.default).filter(Boolean);
  }

  getMatchedViews(to: Route, from: Route | null, parent: ConfigRoute | null) {
    return this.getMatched(to, from, parent).map(r => r.viewInstances.default).filter(Boolean);
  }

  createRoute(to: RouteHistoryLocation | Route | null, from: Route | null = null): Route {
    if (!from && to) from = (to as Route).redirectedFrom || this.currentRoute;
    const matched = to ? this.getMatched(to as Route, from) : [];
    const last = matched.length ? matched[matched.length - 1] : { url: '', params: {}, meta: {} };

    const { search = '', query, path = '', onAbort, onComplete, isRedirect, isReplace, onInit } = to || {};
    const ret: Route = {
      action: this.history.action,
      url: last.url,
      basename: this.basename,
      path,
      search,
      fullPath: `${path}${search}`,
      isRedirect: Boolean(isRedirect),
      isReplace: Boolean(isReplace),
      query: query || (search ? config.parseQuery(search.substr(1)) : {}),
      params: last.params || {},
      matched,
      meta: last.meta || {},
      onAbort,
      onComplete
    };
    // Object.defineProperty(ret, 'fullPath', {
    //   enumerable: true,
    //   configurable: true,
    //   get() {
    //     return `${to.path}${to.search}`;
    //   }
    // });
    Object.defineProperty(ret, 'origin', { configurable: true, value: to });
    if (isRedirect && from) {
      ret.redirectedFrom = from;
      if (!ret.onAbort && from.onAbort) ret.onAbort = from.onAbort;
      if (!ret.onComplete && from.onComplete) ret.onComplete = from.onComplete;
      if (!ret.onInit && onInit) ret.onInit = onInit;
    }
    return ret;
  }

  updateRoute(location: RouteHistoryLocation | null) {
    location = location && this._transformLocation(location);
    if (!location) return;

    this.prevRoute = this.currentRoute;
    this.currentRoute = this.createRoute(location, this.prevRoute);

    // const statesLen = this.states.length + this.stateOrigin;
    // const historyLen = this.history.length - this.stateOrigin;
    // if (this.history.action === 'POP') {
    //   this.currentRoute.state = this.states[historyLen];
    //   if (statesLen > this.history.length) this.states.splice(historyLen);
    // } else {
    //   if (statesLen > this.history.length) this.states.splice(historyLen - 1);
    //   this.states.push(this.currentRoute.state);
    // }

    let tm = this.prevRoute && this._getChangeMatched(this.prevRoute, this.currentRoute, {
      count: 1
    })[0];

    let callback = () => this._callEvent('onRouteChange', this.currentRoute, this);
    if (tm) {
      let keys = Object.keys(tm.viewInstances);
      if (keys.length) {
        keys.forEach((key, i) => {
          tm && tm.viewInstances[key]._refreshCurrentRoute(undefined, undefined,
            i === keys.length - 1  ? callback : undefined);
        });
      } else callback();
    } else if (this.viewRoot) this.viewRoot._refreshCurrentRoute(undefined, undefined, callback);
    else callback();
  }

  push(
    to: string | RouteLocation | Route,
    onComplete?: RouteEvent,
    onAbort?: RouteEvent
  ) {
    return this._push(to, onComplete, onAbort);
  }

  replace(
    to: string | RouteLocation | Route,
    onComplete?: RouteEvent,
    onAbort?: RouteEvent
  ) {
    return this._replace(to, onComplete, onAbort);
  }

  redirect(
    to: string | RouteLocation | Route | null,
    onComplete?: RouteEvent,
    onAbort?: RouteEvent,
    onInit?: RouteEvent | null,
    from?: Route | null
  ) {
    let _to = normalizeLocation(to);
    if (!_to) return;
    _to.isRedirect = true;
    _to.redirectedFrom = from || this.currentRoute;
    return _to.isReplace
      ? this._replace(_to, onComplete, onAbort, onInit)
      : this._push(_to, onComplete, onAbort, onInit);
  }

  go(n: number) {
    return this.history.go(n);
  }

  back() {
    return this.history.goBack();
  }

  goBack() {
    return this.history.goBack();
  }

  forward() {
    return this.history.goForward();
  }

  goForward() {
    return this.history.goForward();
  }

  beforeEach(guard: RouteBeforeGuardFn) {
    if (!guard || typeof guard !== 'function') return;
    let i = this.beforeEachGuards.indexOf(guard);
    if (~i) this.beforeEachGuards.splice(i, 1);
    guard.global = true;
    this.beforeEachGuards.push(guard);
  }

  afterEach(guard: RouteAfterGuardFn) {
    if (!guard || typeof guard !== 'function') return;
    let i = this.afterEachGuards.indexOf(guard);
    if (~i) this.afterEachGuards.splice(i, 1);
    guard.global = true;
    this.afterEachGuards.push(guard);
  }

  addRoutes(routes: ConfigRoute[], parentRoute: ConfigRoute, name = 'default') {
    if (!routes) return;
    if (!Array.isArray(routes)) routes = [routes];
    routes = normalizeRoutes(routes, parentRoute);
    let children = parentRoute ? parentRoute.children : this.routes;
    if (isFunction(children)) children = (children as RouteChildrenFn)();
    if (!children) return;
    routes.forEach(r => {
      let i = (children as  ConfigRoute[]).findIndex(v => v.path === r.path);
      if (~i) (children as  ConfigRoute[]).splice(i, 1, r);
      else (children as  ConfigRoute[]).push(r);
    });
    if (parentRoute && parentRoute.viewInstances[name]) parentRoute.viewInstances[name].setState({ routes });
    else if (this.state.viewRoot) this.state.viewRoot.setState({ routes });
  }

  parseQuery(query: string) {
    return config.parseQuery(query);
  }

  stringifyQuery(obj:  Partial<any>) {
    return config.stringifyQuery(obj);
  }

  onError(callback: RouteErrorCallback) {
    this.errorCallback = callback;
  }

  install(ReactVueLike: any, { App }: { App: any }) {
    this.ReactVueLike = ReactVueLike;
    this.App = App;

    if (!App.inherits) App.inherits = {};
    App.inherits.$router = this;
    App.inherits.$route = ReactVueLike.observable(this.currentRoute || {});

    config.inheritProps = false;

    if (!ReactVueLike.config.inheritMergeStrategies.$route) {
      ReactVueLike.config.inheritMergeStrategies.$route = config.routeMergeStrategie;
    }

    const router = this;
    this.plugin({
      name: 'react-view-router-vue-like-plugin',
      onRouteChange: ReactVueLike.action(`[react-view-router][${this.id}]onRouteChange`, function (newVal: any) {
        if (router.app) {
          router.app.$route = ReactVueLike.observable(newVal, {}, { deep: false });
        } else {
          App.inherits.$route = ReactVueLike.observable(newVal, {}, { deep: false });
          if (App.inherits.$router !== router) App.inherits.$router = router;
        }
      })
    });
  }

}
