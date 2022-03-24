import { ComponentType } from 'react';
import {
  createHashHistory, createBrowserHistory, createMemoryHistory,
  getBaseHref, getPossibleRouterMode, HistoryFix
} from './history-fix';
import config from './config';
import {
  flatten, isAbsoluteUrl, innumerable, isPlainObject, getRouterViewPath,
  normalizeRoutes, normalizeLocation, resolveRedirect,
  matchRoutes, isFunction, isLocation, nextTick, once, isRouteGuardInfoHooks, isReadonly,
  afterInterceptors,
  getHostRouterView, camelize,
  isRoute, walkRoutes, warn,
} from './util';
import { RouteLazy, hasRouteLazy, hasMatchedRouteLazy } from './route-lazy';
import { getGuardsComponent } from './route-guard';
import { RouterViewComponent as RouterView } from './router-view';
import {
  ReactViewRouterMode, ReactViewRouterOptions, ConfigRouteArray,
  RouteBeforeGuardFn, RouteAfterGuardFn, RouteNextFn, RouteHistoryLocation,
  RouteGuardInterceptor, RouteEvent, RouteChildrenFn, RouteNextResult, RouteLocation,
  matchPathResult, ConfigRoute, RouteErrorCallback,
  ReactViewRoutePlugin, Route, MatchedRoute, MatchedRouteArray, lazyResovleFn, RouteBindInstanceFn,
  VuelikeComponent, RouteInterceptorCallback, HistoryStackInfo,
  RouteResolveNameFn, onRouteChangeEvent, UserConfigRoute, ParseQueryProps
} from './types';


const DEFAULT_STATE_NAME = '[root]';
const HISTORY_METHS = ['push', 'replace', 'redirect', 'go', 'back', 'forward', 'block'];

let idSeed = 1;

export default class ReactViewRouter {

  isReactViewRouterInstance: boolean = true;

  parent: ReactViewRouter | null = null;

  children: ReactViewRouter[] = [];

  options: ReactViewRouterOptions;

  mode: ReactViewRouterMode;

  basename: string;

  basenameNoSlash: string;

  name: string;

  routeNameMap: { [key: string]: string } = {};

  routes: ConfigRouteArray = [];

  stacks: HistoryStackInfo[] = [];

  plugins: ReactViewRoutePlugin[] = [];

  beforeEachGuards: RouteBeforeGuardFn[] = [];

  beforeResolveGuards: RouteAfterGuardFn[] = [];

  afterEachGuards: RouteAfterGuardFn[] = [];

  resolveNameFns: RouteResolveNameFn[] = [];

  prevRoute: Route | null = null;

  currentRoute: Route | null = null;

  pendingRoute: RouteHistoryLocation | null = null;

  initialRoute: Route = { } as any;

  queryProps: ParseQueryProps = {};

  viewRoot: RouterView | null = null;

  errorCallback: RouteErrorCallback | null = null;

  apps: any[] = [];

  Apps: React.ComponentClass[] = [];

  isRunning: boolean = false;

  rememberInitialRoute: boolean = false;

  getHostRouterView: typeof getHostRouterView;

  nextTick: typeof nextTick;

  protected _history: HistoryFix | null = null;

  protected _unlisten?: () => void;

  protected _uninterceptor?: () => void;

  protected id: number;

  protected _nexting: RouteNextFn | null = null;

  protected vuelike?: VuelikeComponent;

  protected _interceptorCounter: number = 0;

  [key: string]: any;

  constructor({ name = '', mode = 'hash', basename = '', ...options  }: ReactViewRouterOptions = {}) {
    this.name = name || '';
    this.id = idSeed++;
    this.options = options;
    this.mode = mode;
    this.basename = basename;
    this.basenameNoSlash = basename
      ? (basename.endsWith('/') ? basename.substr(0, basename.length - 1) : basename)
      : basename;

    this.getHostRouterView = getHostRouterView;
    this.nextTick = nextTick.bind(this);

    this.use(options);

    if (!options.manual) this.start(undefined, true);
  }

  _updateParent(parent: ReactViewRouter | null) {
    if (parent === this) parent = null;
    if (this.parent === parent) return;
    if (parent) {
      if (parent.children && !parent.children.includes(this)) parent.children.push(this);
    } else if (this.parent && this.parent.children) {
      const idx = this.parent.children.indexOf(this);
      if (~idx) this.parent.children.splice(idx, 1);
    }
    this.parent = parent;
  }

  _clear(isInit = false) {
    this.initialRoute = { location: {} } as any;
    this.prevRoute = null;
    this.currentRoute = null;
    this.pendingRoute = null;
    this._history = null;
    this.isRunning = false;
    this._interceptorCounter = 0;
  }

  get history(): HistoryFix {
    if (this._history) return this._history;
    switch (this.mode) {
      case 'browser':
        this._history = createBrowserHistory(this.options as any);
        break;
      case 'memory':
        this._history = createMemoryHistory(this.options as any);
        break;
      default: this._history = createHashHistory(this.options as any);
    }
    HISTORY_METHS.forEach(key => this[key] && (this[key] = this[key].bind(this)));

    this._history && (this._history.destroy = () => this._history = null);

    return this._history as HistoryFix;
  }

  get pluginName(): string {
    return this.name;
  }

  get top(): ReactViewRouter {
    return this.parent ? this.parent.top : this;
  }

  get isBrowserMode() {
    return this.mode === 'browser';
  }

  get isHashMode() {
    return this.mode === 'hash';
  }

  get isMemoryMode() {
    return this.mode === 'memory';
  }

  start({ mode, basename, ...options  }: ReactViewRouterOptions = {}, isInit = false) {
    this.stop(isInit);

    Object.assign(this.options, options);
    if (mode !== undefined) this.mode = mode;
    if (basename !== undefined) this.basename = this.isMemoryMode ? '' : basename.replace(/\/{2,}/g, '/');

    if (this.basename && !/\/$/.test(this.basename)) this.basename += '/';
    this.basenameNoSlash = this.basename ? this.basename.substr(0, this.basename.length - 1) : this.basename;

    this._unlisten = this.history.listen(({ location }) => {
      this.updateRoute({ ...location } as any);
    });
    this._uninterceptor = this.history.interceptorTransitionTo(this._handleRouteInterceptor.bind(this), this);

    this._refreshInitialRoute();

    this.isRunning = true;
  }

  stop(isInit = false) {
    if (this._unlisten) { this._unlisten(); this._unlisten = undefined; }
    if (this._uninterceptor) { this._uninterceptor(); this._uninterceptor = undefined; }
    if (this._history && this._history.destroy) { this._history.destroy(); }
    this._clear(isInit = false);
  }

  use({ routes, inheritProps, rememberInitialRoute, install, queryProps = {}, ...restOptions }: ReactViewRouterOptions) {
    if (rememberInitialRoute !== undefined) this.rememberInitialRoute = rememberInitialRoute;

    this.queryProps = queryProps;

    if (routes) {
      this.routes = routes ? normalizeRoutes(routes) : [];
      this._walkRoutes(this.routes);
      if (this._history && this.initialRoute) this._refreshInitialRoute();
    }

    if (inheritProps !== undefined) config.inheritProps = inheritProps;

    Object.assign(config, restOptions);

    if (install) this.install = install.bind(this);
  }

  plugin(plugin: ReactViewRoutePlugin|onRouteChangeEvent) {
    if (isFunction(plugin)) {
      plugin = this.plugins.find(p => p.onRouteChange === plugin)
        || { onRouteChange: plugin } as ReactViewRoutePlugin;
    } else if (~this.plugins.indexOf(plugin)) return;

    const idx = this.plugins.findIndex(p => {
      if (plugin.name) return p.name === plugin.name;
      return p === plugin;
    });
    if (~idx) {
      const [old] = this.plugins.splice(idx, 1, plugin);
      if (old && old.uninstall) old.uninstall(this);
    } else this.plugins.push(plugin);

    if ((plugin as ReactViewRoutePlugin).install) (plugin as any).install(this);
    return () => {
      const idx = this.plugins.indexOf(plugin);
      if (~idx) {
        this.plugins.splice(idx, 1);
        if ((plugin as ReactViewRoutePlugin).uninstall) (plugin as any).uninstall(this);
      }
    };
  }

  _walkRoutes(routes: ConfigRouteArray) {
    walkRoutes(routes, (route, routeIndex, rs) => {
      this._callEvent('onWalkRoute', route, routeIndex, rs);

      if (route.name) {
        let name = camelize(route.name);
        if (this.routeNameMap[name]) {
          warn(`[react-view-router] route name '${route.name}'(path is [${route.path}]) is duplicate with [${this.routeNameMap[name]}]`);
        }
        this.routeNameMap[name] = route.path;
      }
    });
  }

  _refreshInitialRoute() {
    let historyLocation = { ...this.history.location } as RouteHistoryLocation;
    if (window && window.location && window.location.search !== historyLocation.search) {
      let search = window.location.search;
      if (window.location.hash) {
        let [, hashSearch] = window.location.hash.match(/#[a-z0-9-_/]+\?(.+)/i) || [];
        if (hashSearch) search = search + (search ? '&' : '?') + hashSearch;
      }
      historyLocation.search = search;
    }
    this.updateRoute(historyLocation);

    if (this.rememberInitialRoute) {
      let stack;
      if (this.basename) {
        const stacks = this.history.stacks.concat(historyLocation as any).reverse();
        const basename = this.basenameNoSlash;
        for (let i = 0; i < stacks.length; i++) {
          let currentStack = stacks[i];
          if (!currentStack.pathname.startsWith(basename)) break;
          if (i === stacks.length - 1 || !stacks[i + 1].pathname.startsWith(basename)) {
            stack = currentStack;
            break;
          }
        }
      } else if (!this.isMemoryMode && this.history.stacks.length) {
        stack = this.history.stacks[0];
      }
      if (stack) {
        historyLocation = normalizeLocation({
          pathname: stack.pathname,
          search: stack.search,
        }, { queryProps: this.queryProps }) as RouteHistoryLocation;
        if (window.location.search) {
          const query = this.parseQuery(window.location.search, this.queryProps);
          if (this.isHashMode) {
            Object.assign(historyLocation.query, query);
          } else if (this.isBrowserMode) {
            Object.keys(historyLocation.query).forEach(key => {
              if (query[key] !== undefined) historyLocation.query[key] = query[key];
            });
          }
        }
      }
    }

    this.initialRoute = this.createRoute(this._transformLocation(historyLocation));
    // innumerable(this.initialRoute, 'location', location);
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
      if (plugin && (plugin as ReactViewRoutePlugin).name && ex && (ex as any).message) {
        (ex as any).message = `[${(plugin as ReactViewRoutePlugin).name}:${event}]${(ex as any).message}`;
      }
      throw ex;
    }
  }

  _isVuelikeComponent(comp: any) {
    return comp && this.vuelike && (
      // eslint-disable-next-line no-proto
      (comp.__proto__ && comp.isVuelikeComponentInstance)
        || (comp.__vuelike || comp.__vuelikeComponentClass)
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
      if (c) {
        const cc = c.__component ? getGuardsComponent(c, true) : c;

        const cg = c.__guards && c.__guards[guardName];
        if (cg) ret.push(cg);

        let ccg = cc && cc.prototype && cc.prototype[guardName];
        if (ccg) {
          if (this.vuelike && !ccg.isMobxFlow && cc.__flows && ~cc.__flows.indexOf(guardName)) ccg = this.vuelike.flow(ccg);
          ret.push(ccg);
        }
        if (this._isVuelikeComponent(cc) && Array.isArray(cc.mixins)) {
          cc.mixins.forEach((m: any) => {
            let ccg = m[guardName] || (m.prototype && m.prototype[guardName]);
            if (!ccg) return;
            if (this.vuelike && !ccg.isMobxFlow && m.__flows && ~m.__flows.indexOf(guardName)) ccg = this.vuelike.flow(ccg);
            ret.push(ccg);
          });
        }
      }

      const ci = componentInstances[key];
      if (isRouteGuardInfoHooks(ci)) {
        const cig = ci[guardName];
        if (cig) ret.push(cig);
      }
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
    if (this.viewRoot && this.viewRoot.props.beforeEach) {
      this.viewRoot.props.beforeEach.global = true;
      ret.push(this.viewRoot.props.beforeEach);
    }

    const view = this;
    if (from) {
      const fm = this._getChangeMatched(from, to)
        .filter(r => Object.keys(r.viewInstances).some(key => r.viewInstances[key]));
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
          }, { route: r, router: this });
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
                r.config._pending && (r.config._pending.completeCallbacks[name] = ci => {
                  const res = _cb(ci);
                  view._callEvent('onRouteEnterNext', r, ci, res);
                  return res;
                });
                cb = undefined;
              }
              return next(cb, ...args);
            }, { route: r, router: this });
          })
        ) as RouteBeforeGuardFn[];
        ret.push(...guards);
      });
    }
    return flatten(ret);
  }

  _getBeforeResolveGuards(to: Route, from: Route | null) {
    let ret = [...this.beforeResolveGuards];
    if (this.viewRoot && this.viewRoot.props.beforeResolve) {
      this.viewRoot.props.beforeResolve.global = true;
      ret.push(this.viewRoot.props.beforeResolve);
    }
    if (to) {
      let tm = this._getChangeMatched(to, from);
      ret.push(...(this._getRouteComponentGurads(tm.filter(r => !r.redirect), 'beforeRouteResolve', true) as RouteAfterGuardFn[]));
    }
    return flatten(ret);
  }

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
    const ret: RouteAfterGuardFn[] = [];
    if (from) {
      const fm = this._getChangeMatched(from, to).filter(r => Object.keys(r.viewInstances)
        .some(key => r.viewInstances[key]));
      ret.push(...(this._getRouteComponentGurads(fm, 'afterRouteLeave', true) as RouteAfterGuardFn[]));
    }
    if (this.viewRoot && this.viewRoot.props.afterEach) {
      this.viewRoot.props.afterEach.global = true;
      ret.push(this.viewRoot.props.afterEach);
    }
    ret.push(...this.afterEachGuards);
    return flatten(ret);
  }

  _transformLocation(location: RouteHistoryLocation) {
    if (!location || isRoute(location)) return location;
    if (this.basename && !this.isMemoryMode) {
      let pathname = location.pathname;
      if (location.basename != null) pathname = location.basename + pathname;
      else if (pathname.length < this.basename.length) {
        let parent: ReactViewRouter | null = this.parent;
        while (parent) {
          if (pathname.length >= parent.basename.length) {
            const parentMatched = parent.getMatched(pathname);
            if (parentMatched.length) {
              pathname = parentMatched[parentMatched.length - 1].path + parentMatched.unmatchedPath;
              break;
            }
          }
          parent = parent.parent;
        }
      }
      if (!/\/$/.test(pathname)) pathname += '/';
      const isCurrentBasename = pathname.indexOf(this.basename) === 0;
      location = { ...location };
      location.pathname = isCurrentBasename
        ? (location.pathname.substr(this.basename.length - 1) || '/')
        : '';
      if (location.path !== undefined) location.path = location.pathname;
      location.fullPath = isCurrentBasename
        ? location.pathname + location.search
        : '';
    }
    return location;
  }

  async _handleRouteInterceptor(
    location: null | RouteHistoryLocation,
    callback: (ok: boolean | RouteInterceptorCallback, route?: Route | null) => void,
    isInit = false
  ) {
    if (!this.isRunning) return callback(true);

    if (location) {
      let pathname = location.path || location.pathname;
      if (isInit && this.basename && !this.isMemoryMode && !location.basename
        && this.history.location.pathname === pathname) {
        if (this.parent && this.parent.currentRoute) {
          let url = this.parent.currentRoute.url;
          if (url && this.parent.basename) url = this.parent.basename.substr(0, this.parent.basename.length - 1) + url;
          if (!pathname.startsWith(url)) {
            if (location.pathname != null) location.pathname = url;
            if (location.path != null) location.path = url;
            if (location.query) location.query = this.parent.currentRoute.query;
            if (!isReadonly(location, 'search')) location.search = this.parent.currentRoute.search;
          }
        }
      }

      if (this.pendingRoute
        && this.pendingRoute.fullPath === (location as RouteHistoryLocation).fullPath) return callback(true);
      if (this.basename && location.absolute) return callback(true);

      location = this._transformLocation(location as RouteHistoryLocation);
    }

    if (!location || (!location.pathname && (this.currentRoute && !this.currentRoute.path))) return callback(true);

    if ((!isInit && !location.onInit) && (
      !this.viewRoot || !this.viewRoot.state._routerInited
    )) return callback(true);

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
    const isBlock = (v: any, interceptor: RouteBeforeGuardFn, update: (v: any) => void) => {
      let _isLocation = typeof v === 'string' || isLocation(v);
      if (_isLocation && interceptor) {
        let _to = normalizeLocation(v, { route: interceptor.route, queryProps: this.queryProps });
        if (_to) update(_to);
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
        if (isBlock.call(this, f1, interceptor, v => f1 = v)) return next(f1);
        if (f1 === true) f1 = undefined;
        try {
          let nextInterceptor = await this._getInterceptor(interceptors, ++index);
          if (!nextInterceptor) return next((res: any) => isFunction(f1) && f1(res));

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
      return await (interceptor as RouteBeforeGuardFn)(to, from, nextWrapper, { route: interceptor.route, router: this });
    }
    if (next) await beforeInterceptor.call(this, await this._getInterceptor(interceptors, 0), 0, to, from, next);
    else afterInterceptors.call(this, interceptors, to, from);
  }

  _internalHandleRouteInterceptor(
    location: RouteHistoryLocation,
    callback: (ok: boolean | RouteInterceptorCallback, route: Route | null) => void,
    isInit = false,
  ) {
    let isContinue = false;
    let interceptorCounter = ++this._interceptorCounter;
    try {
      const to = this.createRoute(location);
      const from = isInit
        ? null
        : to.redirectedFrom && to.redirectedFrom.basename === this.basename
          ? to.redirectedFrom
          : this.currentRoute;
      const current = this.currentRoute;
      const checkIsContinue = () => !to.path || (this.isRunning
        && interceptorCounter === this._interceptorCounter
        && Boolean(this.viewRoot && this.viewRoot._isMounted));
      const afterCallback = (isContinue: boolean, to: Route) => {
        if (isContinue) to.onInit && to.onInit(isContinue, to);
        else to.onAbort && to.onAbort(isContinue, to);

        this.nextTick(() => {
          if (!checkIsContinue()) return;
          if (!isInit && (!current || current.fullPath !== to.fullPath)) {
            this._routetInterceptors(this._getRouteUpdateGuards(to, current), to, current);
          }
        });
      };

      if (!to) return;

      const realtimeLocation = this.history.realtimeLocation;
      if (from
        && (!realtimeLocation || (realtimeLocation.pathname === this.history.location.pathname))
        && (to.matchedPath === from.matchedPath)) {
        isContinue = checkIsContinue();
        if (isContinue) {
          callback(newIsContinue => {
            afterCallback(newIsContinue, to);
          }, to);
        } else callback(isContinue, to);
        return;
      }

      let fallbackViews: RouterView[] = [];
      if (hasMatchedRouteLazy(to.matched)) {
        this.viewRoot && fallbackViews.push(this.viewRoot);
        this._getSameMatched(isInit ? null : this.currentRoute, to).reverse().some(m => {
          let keys = Object.keys(m.viewInstances).filter(key => m.viewInstances[key] && m.viewInstances[key].props.fallback);
          if (!keys.length) return;
          return fallbackViews = keys.map(key => m.viewInstances[key]);
        });
      }

      fallbackViews.forEach(fallbackView => fallbackView._updateResolving(true));
      this._routetInterceptors(this._getBeforeEachGuards(to, from, current), to, from, ok => {
        this._nexting = null;
        fallbackViews.length && setTimeout(() => fallbackViews.forEach(
          fallbackView => fallbackView._isMounted && fallbackView._updateResolving(false)
        ), 0);

        if (typeof ok === 'string') ok = { path: ok };
        isContinue = checkIsContinue()
          && Boolean(ok === undefined || (ok && !(ok instanceof Error) && !isLocation(ok)));

        const toLast = to.matched[to.matched.length - 1];
        if (isContinue && toLast && toLast.config.exact && toLast.redirect) {
          ok = resolveRedirect(toLast.redirect, toLast, { from: to });
          if (ok) isContinue = false;
        }

        const onNext = (newOk: boolean) => {
          isContinue = newOk;
          if (isContinue) this._routetInterceptors(this._getBeforeResolveGuards(to, current), to, current);

          // callback(isContinue, to);
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
        };

        if (!isContinue) {
          callback(isContinue, to);
          return onNext(isContinue);
        }

        return callback(onNext, to);
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
      let _to = normalizeLocation(to, {
        route: (to && (to as RouteLocation).route) || this.currentRoute,
        basename: this.basename,
        mode: this.mode,
        queryProps: this.queryProps,
        resolvePathCb: (path, to) => {
          // if (/^\/[A-z0-9.\-_#@$%^&*():|?<>=+]+$/.test(path)) {
          //   let newPath = this.nameToPath(path.substr(1), to);
          //   if (newPath) newPath = `/${newPath}`;
          //   if (newPath !== path) return newPath;
          // }
          const newPath = path.replace(
            /\[([A-z0-9.\-_#@$%^&*():|?<>=+]+)\]/g,
            (m, name) => {
              let ret = this.nameToPath(name, to);
              if (ret == null) throw new Error(`route name [${name}]not be found!`);
              return ret;
            }
          );
          return newPath;
        }
      });
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

      if (_to.fullPath && isAbsoluteUrl(_to.fullPath)) {
        if (replace) window.location.replace(_to.fullPath);
        else window.location.href = _to.fullPath;
        return;
      }

      if (!this.viewRoot || (!onInit && (!this.viewRoot.state._routerInited || !this.viewRoot._isMounted))) {
        this.pendingRoute = _to;
        let location = this.history.location;
        if (_to.fullPath === `${location.pathname}${location.search}`) return;
      }

      let history = this.history;

      if ((this.basename || this.isMemoryMode)
        && (_to as RouteLocation).absolute) {
        if (this.top && !this.top.basename && !this.top.isMemoryMode) {
          history = this.top.history;
        } else {
          let url = history.createHref(_to);
          if (this.isMemoryMode) {
            let mode = typeof _to.absolute === 'string'
              ? _to.absolute
              : '';
            if (!mode || mode === 'memory') {
              let guessMode = getPossibleRouterMode() || 'hash';
              warn(`[react-view-router] warning: parent router mode is ${mode || 'unknown'}, it could be '${guessMode}' mode that to go!`);
              mode = guessMode;
            }
            if (mode === 'hash') url = getBaseHref() + (url.startsWith('#') ? '' : '#') + url;
          }
          if (replace) location.replace(url);
          else location.href = url;
          return;
        }
      }

      if ((_to as RouteLocation).backIfVisited && _to.basename === this.basename) {
        const getPath = (path: string = '') => {
          let matched = this.getMatched(path);
          return matched.length
            ? `${this.basenameNoSlash}${matched[matched.length - 1].path}${matched.unmatchedPath}`
            : path;
        };
        const historyIndex = this.history.index;
        const stack = this.stacks.reverse().find(s => {
          const stackPath = getPath(s.pathname);
          let toPath = (_to as RouteLocation).path || '';
          if (this.basename) toPath = toPath.substr(this.basenameNoSlash.length, toPath.length);
          return stackPath === getPath(toPath) && s.index <= historyIndex;
        });
        if (stack) return this.go(stack);
      }

      if (replace) history.replace(_to);
      else history.push(_to);
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

  resolveRouteName(fn: RouteResolveNameFn) {
    const _off = () => {
      const idx = this.resolveNameFns.indexOf(fn);
      if (~idx) this.resolveNameFns.splice(idx, 1);
    };
    _off();
    this.resolveNameFns.push(fn);
    return _off;
  }

  nameToPath(name: string, options: {
    absolute?: boolean,
  }|RouteHistoryLocation = {}) {
    name = camelize(name);

    let path = this.routeNameMap[name];
    if (path == null) {
      this.resolveNameFns.some(fn => {
        let newPath = fn(name, options, this);
        if (typeof newPath !== 'string') return;
        path = newPath;
        return true;
      });
    } else if (options.absolute) {
      if (this.basename) path = `${this.basename}${path}`;
    }

    if (path == null && options.absolute && this.parent) {
      path = this.parent.nameToPath(name, options);
      if (path !== null && this.parent.basename) {
        path = `${this.parent.basename}${path}`;
      }
    }

    return path;
  }

  updateRouteMeta(route: ConfigRoute, newValue: Partial<any>) {
    if (!route || !route.meta) return;
    let changed = false;
    const oldValue: Partial<any> = {};
    Object.keys(newValue).forEach(key => {
      if (route.meta[key] === newValue[key]) return;
      oldValue[key] = route.meta[key];
      changed = true;
    });
    if (!changed) return;
    Object.assign(route.meta, newValue);
    this._callEvent('onRouteMetaChange', newValue, oldValue, route, this);
    return changed;
  }

  createMatchedRoute(route: ConfigRoute, match: matchPathResult): MatchedRoute {
    let { url, path = route.path, regx, params } = match || {};
    let { subpath, meta = {}, redirect, depth } = route;
    return {
      url,
      path,
      subpath,
      depth,
      regx,
      meta,
      redirect,
      params,
      componentInstances: {},
      viewInstances: {},
      config: route
    };
  }

  getMatched(to: Route | RouteHistoryLocation | string, from?: Route | null, parent?: ConfigRoute): MatchedRouteArray {
    if (!from) from = this.currentRoute;
    function copyInstance(to: MatchedRoute, from: MatchedRoute | null) {
      if (!from) return;
      if (from.componentInstances) to.componentInstances = from.componentInstances;
      if (from.viewInstances) to.viewInstances = from.viewInstances;
    }
    let matched = matchRoutes(this.routes, to, parent, { queryProps: this.queryProps });
    let isHistoryLocation = !isRoute(to) && typeof to !== 'string';
    let state = (isHistoryLocation && (to as any).state && (to as any).state[this.basename || DEFAULT_STATE_NAME]) || {};
    let ret = matched.map(({ route, match }, i) => {
      let ret = this.createMatchedRoute(route, match);
      ret.state = state[ret.url] || {};
      if (from) {
        const fr = from.matched[i];
        const tr = matched[i];
        if (fr && tr && fr.path === tr.match.path) copyInstance(ret, fr);
      }
      return ret;
    });
    innumerable(ret, 'unmatchedPath', matched.unmatchedPath || '');
    return ret as MatchedRouteArray;
  }

  getMatchedComponents(to: Route, from?: Route, parent?: ConfigRoute) {
    const ret: ComponentType[] = [];
    this.getMatched(to, from, parent).forEach(r => {
      Array.prototype.push.apply(ret, Object.values(r.componentInstances));
    });
    return ret.filter(Boolean);
  }

  getMatchedViews(to: Route, from?: Route, parent?: ConfigRoute) {
    const ret: RouterView[] = [];
    this.getMatched(to, from, parent).map(r => {
      Array.prototype.push.apply(Object.values(r.viewInstances));
    });
    return ret.filter(Boolean);
  }

  createRoute(to: RouteHistoryLocation | string | Route | null, from?: Route | null): Route {
    if (isRoute(to)) return to;
    if (typeof to === 'string') to = normalizeLocation(to, { queryProps: this.queryProps });
    if (!from && to) from = (to as RouteHistoryLocation).redirectedFrom || this.currentRoute;
    const matched = to ? this.getMatched(to as RouteHistoryLocation, from) : [];
    const last = matched.length ? matched[matched.length - 1] : { url: '', path: '', params: {}, meta: {}, state: {} };

    const { search = '', query, path = '', delta = 0, onAbort, onComplete, isRedirect, isReplace, onInit } = to || {};
    const ret: any = {
      action: this.history.action,
      url: last.url,
      basename: this.basename,
      path,
      search,
      fullPath: `${path}${search}`,
      isRedirect: Boolean(isRedirect),
      isReplace: Boolean(isReplace),
      query: query || (search ? config.parseQuery(search, this.queryProps) : {}),
      params: last.params || {},
      matched,
      matchedPath: last.path,
      meta: last.meta || {},
      get state() {
        return last.state;
      },
      delta,
      onAbort,
      onComplete,
    };
    // Object.defineProperty(ret, 'fullPath', {
    //   enumerable: true,
    //   configurable: true,
    //   get() {
    //     return `${to.path}${to.search}`;
    //   }
    // });
    innumerable(ret, 'isViewRoute', true);
    Object.defineProperty(ret, 'origin', { configurable: true, value: to });
    if (isRedirect && from && from.basename === this.basename) {
      ret.redirectedFrom = from;
      if (!ret.onAbort && from.onAbort) ret.onAbort = from.onAbort;
      if (!ret.onComplete && from.onComplete) ret.onComplete = from.onComplete;
      if (!ret.onInit && onInit) ret.onInit = onInit;
    }
    return ret as Route;
  }

  updateRoute(location: RouteHistoryLocation | null) {
    location = location && this._transformLocation(location);
    if (!location) return;

    if (!this.isRunning && (location.path || (this.currentRoute && !this.currentRoute.path))) return;

    let prevRoute = this.currentRoute;
    let realtimeLocation = this.history.realtimeLocation;
    if (prevRoute && realtimeLocation && realtimeLocation !== this.history.location) {
      prevRoute = this.createRoute(realtimeLocation as any, this.currentRoute);
    }

    const currentRoute = isRoute(location) ? location : this.createRoute(location, prevRoute);
    if (prevRoute
        && prevRoute.fullPath === currentRoute.fullPath
        && prevRoute.matched.length === currentRoute.matched.length
        && prevRoute.matched.every((v, i) => v.path === currentRoute.matched[i].path)) return;

    this.prevRoute = prevRoute;
    this.currentRoute = currentRoute;

    if (this.basename) {
      let basename = this.basenameNoSlash;
      let stacks: HistoryStackInfo[] = [];
      let prevStack = null;
      for (let i = this.history.stacks.length - 1; i >= 0; i--) {
        let info = this.history.stacks[i];
        if (!info.pathname.startsWith(basename) || (prevStack && prevStack.index <= info.index)) break;
        let pathname = info.pathname.substr(basename.length, info.pathname.length);
        if (!pathname) pathname = '/';
        prevStack = { ...info, pathname };
        stacks.unshift(prevStack);
      }
      if (!this.stacks.length && stacks.length) {
        this.stacks.splice(0, this.stacks.length, ...stacks);
      } else {
        let idx = this.stacks.findIndex((currentStack, i) => {
          let newStack = stacks[i];
          if (newStack && currentStack.timestamp === newStack.timestamp) return;
          return true;
        });
        if (idx < 0) idx = 0;
        this.stacks.splice(idx, this.stacks.length - idx, ...stacks.slice(idx, stacks.length));
      }
    } else this.stacks = this.history.stacks;

    let tm = this.prevRoute && this._getChangeMatched(this.prevRoute, this.currentRoute, {
      count: 1
    })[0];

    let called = false;
    let callback = () => {
      called = true;
      this._callEvent('onRouteChange', this.currentRoute, this.prevRoute, this);
    };

    if (tm) {
      let keys = Object.keys(tm.viewInstances);
      if (keys.length) {
        keys.forEach((key, i) => {
          const vm = tm && tm.viewInstances[key];
          if (!vm) return;
          if (!vm._isMounted) {
            console.error(`[react-view-router]router-view[${getRouterViewPath(vm)}] is not mounted!`, vm);
            return;
          }
          // let el = findDOMNode(vm);
          // if (!el || !document.body.contains(el)) {
          //   console.error(`[react-view-router]router-view[${getRouterViewPath(vm)}] is removed from dom!`, vm, el);
          // }
          vm._refreshCurrentRoute(undefined, undefined, i === keys.length - 1  ? callback : undefined);
        });
      } else callback();
    } else if (this.viewRoot && this.viewRoot._isMounted) {
      this.viewRoot._refreshCurrentRoute(undefined, undefined, callback);
    }

    if (!called) callback();
  }

  push(
    to: string | RouteLocation | Route,
    onComplete?: RouteEvent,
    onAbort?: RouteEvent,
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
    let _to = normalizeLocation(to, { queryProps: this.queryProps });
    if (!_to) return;
    _to.isRedirect = true;
    _to.redirectedFrom = from || this.currentRoute;
    return _to.isReplace || onInit
      ? this._replace(_to, onComplete, onAbort, onInit)
      : this._push(_to, onComplete, onAbort, onInit);
  }

  go(n: number | HistoryStackInfo) {
    if (typeof n !== 'number') {
      n = n.index - this.history.index;
      if (!n) return;
    }
    return this.history.go(n);
  }

  back() {
    return this.history.back();
  }

  forward() {
    return this.history.forward();
  }

  replaceState(newState: Partial<any>, matchedRoute?: MatchedRoute) {
    if (!this.isRunning || !this.history.replaceState) return;

    let currentRoute = this.currentRoute || this.initialRoute;
    let mr = matchedRoute || (currentRoute && currentRoute.matched[currentRoute.matched.length - 1]);
    if (!mr) return;

    let state = (this.history.location.state || {}) as Partial<any>;
    let routerStateName = this.basename || DEFAULT_STATE_NAME;
    let routeState = state[routerStateName];
    if (!routeState) routeState = state[routerStateName] = {};
    mr.state = routeState[mr.url] = newState;

    this.history.replaceState(state);
    return newState;
  }

  replaceQuery(keyOrObj: string|Partial<any>, value?: any) {
    const currentRoute = this.currentRoute;
    if (!keyOrObj || !currentRoute) return;

    let changed = false;
    const _replaceQuery = (key: string, value: any) => {
      if (currentRoute.query[key] === value) return;
      if (value === undefined) delete currentRoute.query[key];
      else currentRoute.query[key] = value;
      changed = true;
    };
    if (isPlainObject(keyOrObj)) Object.keys(keyOrObj).forEach(key => _replaceQuery(key, keyOrObj[key]));
    else _replaceQuery(keyOrObj, value);
    if (!changed) return;

    currentRoute.search = this.stringifyQuery(currentRoute.query);
    currentRoute.fullPath = `${currentRoute.path}${currentRoute.search}`;

    this.history.replace(`${this.basenameNoSlash}${currentRoute.fullPath}`, currentRoute.state);
  }

  beforeEach(guard: RouteBeforeGuardFn) {
    if (!guard || typeof guard !== 'function') return;
    let i = this.beforeEachGuards.indexOf(guard);
    if (~i) this.beforeEachGuards.splice(i, 1);
    guard.global = true;
    this.beforeEachGuards.push(guard);
  }

  beforeResolve(guard: RouteAfterGuardFn) {
    if (!guard || typeof guard !== 'function') return;
    let i = this.beforeResolveGuards.indexOf(guard);
    if (~i) this.beforeResolveGuards.splice(i, 1);
    guard.global = true;
    this.beforeResolveGuards.push(guard);
  }

  afterEach(guard: RouteAfterGuardFn) {
    if (!guard || typeof guard !== 'function') return;
    let i = this.afterEachGuards.indexOf(guard);
    if (~i) this.afterEachGuards.splice(i, 1);
    guard.global = true;
    this.afterEachGuards.push(guard);
  }

  addRoutes(routes: UserConfigRoute[] | ConfigRouteArray, parentRoute?: ConfigRoute) {
    if (!routes) return;
    if (!Array.isArray(routes)) routes = [routes];
    routes = normalizeRoutes(routes, parentRoute);
    this._walkRoutes(routes as ConfigRouteArray);

    const _next = (children: ConfigRouteArray | UserConfigRoute[]) => {
      children && (routes as ConfigRouteArray).forEach(r => {
        let i = children.findIndex(v => v.path === r.path);
        if (~i) children.splice(i, 1, r);
        else children.push(r);
      });
      return children;
    };

    let children: ConfigRouteArray | RouteChildrenFn = this.routes;
    if (parentRoute) {
      if (!parentRoute.children) parentRoute.children = [];
      children = parentRoute.children;
    }

    if (isFunction(children)) {
      if (parentRoute) parentRoute.children = () => _next((children as RouteChildrenFn).call(parentRoute));
    } else {
      _next(children);
    }

    if (!parentRoute && this.viewRoot) this.viewRoot.setState({ routes: routes as ConfigRouteArray });
  }

  parseQuery(query: string, queryProps?: ParseQueryProps) {
    return config.parseQuery(query, queryProps);
  }

  stringifyQuery(obj: Partial<any>) {
    return config.stringifyQuery(obj);
  }

  onError(callback: RouteErrorCallback) {
    this.errorCallback = callback;
  }

  install(vuelike: any, { App }: { App: any }) {
    this.vuelike = vuelike;
    if (App) {
      if (!Array.isArray(App)) App = [App];
      this.Apps.push(...App);
    }

    const observableRoute = () => {
      let currentRoute = this.currentRoute || { query: {}, meta: {} };
      currentRoute = vuelike.observable(
        currentRoute,
        Object.keys(currentRoute).reduce((p: Partial<any>, key: string) => {
          let d = Object.getOwnPropertyDescriptor(currentRoute, key);
          if (!d || d.get || d.set) return p;
          let v: any = (currentRoute as any)[key];
          if (d.get || d.set) p[key] = vuelike.observable.ref;
          else {
            p[key] = isPlainObject(v) || Array.isArray(v)
              ? vuelike.observable.shallow
              : vuelike.observable;
          }
          return p;
        }, {})
      );
      return currentRoute;
    };

    if (vuelike.inherit) {
      vuelike.inherit({
        $router: this,
        $route: observableRoute()
      });
    } else if (App) {
      App.forEach((v: any) => {
        if (!v.inherits) v.inherits = {};
        v.inherits.$router = this;
        v.inherits.$route = observableRoute();
      });
    }

    config.inheritProps = false;

    if (vuelike.config.inheritMergeStrategies) {
      if (!vuelike.config.inheritMergeStrategies.$route) {
        vuelike.config.inheritMergeStrategies.$route = config.createMergeStrategie(this);
      }
    } else if (vuelike.config.optionMergeStrategies) {
      if (!vuelike.config.optionMergeStrategies.$route) {
        vuelike.config.optionMergeStrategies.$route = config.createMergeStrategie(this);
      }
    }

    const router = this;
    this.plugin({
      name: 'react-view-router-plugin',
      onRouteChange: vuelike.action(`[react-view-router][${this.id}]onRouteChange`, function (newVal: any) {
        const route = vuelike.observable(newVal, { }, { deep: false });
        router.apps.forEach(app => app.$route = route);
        vuelike.inherit('$route', route);
        if (vuelike.inherits.$router !== router) vuelike.inherit('$router', router);
      })
    });
  }

}
