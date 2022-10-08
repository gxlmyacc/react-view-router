import { ComponentType } from 'react';
import {
  createHashHistory, createBrowserHistory, createMemoryHistory,
  getPossibleHistory, HistoryFix
} from './history-fix';
import config from './config';
import {
  flatten, isAbsoluteUrl, innumerable, isPlainObject, getRouterViewPath, getCompleteRoute,
  normalizeRoutes, normalizeLocation, resolveRedirect, resolveAbort, copyOwnProperties,
  matchRoutes, isFunction, isLocation, nextTick, once, isRouteGuardInfoHooks, isReadonly,
  afterInterceptors, getRouteChildren, readRouteMeta, readonly, getLoactionAction,
  getHostRouterView, camelize, reverseArray,
  isRoute, walkRoutes, warn,
  DEFAULT_STATE_NAME,
  hasOwnProp
} from './util';
import { RouteLazy, hasRouteLazy, hasMatchedRouteLazy } from './route-lazy';
import { getGuardsComponent } from './route-guard';
import { RouterViewComponent as RouterView } from './router-view';
import {
  ReactViewRouterOptions, ReactViewRouterMoreOptions, ConfigRouteArray,
  RouteBeforeGuardFn, RouteAfterGuardFn, RouteNextFn, RouteHistoryLocation,
  RouteGuardInterceptor, RouteEvent, RouteChildrenFn, RouteNextResult, RouteLocation, RouteBranchInfo,
  matchPathResult, ConfigRoute, RouteErrorCallback,
  ReactViewRoutePlugin, Route, MatchedRoute, MatchedRouteArray, LazyResolveFn, OnBindInstance,
  OnGetLazyResovle, RouteComponentToResolveFn,
  VuelikeComponent, RouteInterceptorCallback, HistoryStackInfo, MatchedRouteGuard,
  RouteResolveNameFn, onRouteChangeEvent, UserConfigRoute, ParseQueryProps, RouteInterceptorItem,
  onRouteingNextCallback,
  RouteComputedMeta,
} from './types';
import { Action, createHashHref, HistoryType } from './history';

const HISTORY_METHS = ['push', 'replace', 'redirect', 'go', 'back', 'forward', 'block'];

let idSeed = 1;

class ReactViewRouter {

  isReactViewRouterInstance: boolean = true;

  parent: ReactViewRouter | null = null;

  children: ReactViewRouter[] = [];

  options: ReactViewRouterMoreOptions = {};

  mode: HistoryType = HistoryType.hash;

  basename: string = '';

  basenameNoSlash: string = '';

  name: string = '';

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

  errorCallbacks: RouteErrorCallback[] = [];

  apps: any[] = [];

  Apps: React.ComponentClass[] = [];

  isRunning: boolean = false;

  isHistoryCreater: boolean = false;

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

  constructor(options: ReactViewRouterOptions = {}) {
    this.id = idSeed++;

    this._initRouter(options);

    this.getHostRouterView = getHostRouterView;
    this.nextTick = nextTick.bind(this);
    this._handleRouteInterceptor = this._handleRouteInterceptor.bind(this);

    this.use(this.options);

    if (!options.manual) this.start(undefined, true);
  }

  _initRouter(options: ReactViewRouterOptions) {
    let { name, mode, basename, ...moreOptions  } = options;
    if (name != null) this.name = name;

    if (mode != null) {
      if (typeof mode !== 'string') {
        moreOptions.history = mode;
        mode = mode.type;
      }
      if (this.mode !== mode) this.mode = mode;
    }

    if (basename !== undefined) {
      if (basename && !/\/$/.test(basename)) basename += '/';
      this.basename = (this.mode === HistoryType.memory && (!moreOptions.history || moreOptions.history.type !== HistoryType.memory))
        ? ''
        : basename.replace(/\/{2,}/g, '/');
      this.basenameNoSlash = this.basename
        ? (this.basename.endsWith('/') ? this.basename.substr(0, basename.length - 1) : this.basename)
        : this.basename;
    }

    Object.assign(this.options, moreOptions);
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

  get history(): HistoryFix {
    if (this._history) return this._history;
    switch (this.mode) {
      case HistoryType.browser:
        this._history = createBrowserHistory(this.options as any, this);
        break;
      case HistoryType.memory:
        this._history = createMemoryHistory(this.options as any, this);
        break;
      default: this._history = createHashHistory(this.options as any, this);
    }
    HISTORY_METHS.forEach(key => {
      if (!this[key] || !this[key].bindThis) return;
      this[key] = this[key].bind(this);
      innumerable(this[key], 'bindThis', true);
    });

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
    return this.mode === HistoryType.browser;
  }

  get isHashMode() {
    return this.mode === HistoryType.hash;
  }

  get isMemoryMode() {
    return this.mode === HistoryType.memory;
  }

  get isPrepared() {
    return this.isRunning && Boolean(this.currentRoute && this.viewRoot && this.viewRoot.state._routerInited && this.viewRoot._isMounted);
  }

  _startHistory() {
    if (this._history && this._history.destroy) this._history.destroy();

    this._unlisten = this.history.listen(({ location }, interceptors?: RouteInterceptorItem[]) => {
      let to = location;
      if (interceptors && Array.isArray(interceptors)) {
        let interceptorItem = interceptors.find(v => v.router === this);
        if (interceptorItem && interceptorItem.payload) to = interceptorItem.payload;
      }
      this.updateRoute(to as any);
    });
    this._uninterceptor = this.history.interceptorTransitionTo(this._handleRouteInterceptor, this);

    this._refreshInitialRoute();
  }

  start(routerOptions: ReactViewRouterOptions = {}, isInit = false) {
    this.stop({ isInit });

    this._callEvent('onStart', this, routerOptions, isInit);

    this._initRouter(routerOptions);

    this._startHistory();

    this.isRunning = true;
  }

  stop(options: {
    ignoreClearRoute?: boolean,
    isInit?: boolean
  } = {}) {
    this._callEvent('onStop', this, options);

    if (this._unlisten) { this._unlisten(); this._unlisten = undefined; }
    if (this._uninterceptor) { this._uninterceptor(); this._uninterceptor = undefined; }
    if (this._history && this._history.destroy) { this._history.destroy(); }

    this._history = null;
    this._interceptorCounter = 0;
    this.isRunning = false;
    this.isHistoryCreater = false;

    if (!options.ignoreClearRoute) {
      this.initialRoute = { location: {} } as any;
      this.prevRoute = null;
      this.currentRoute = null;
      this.pendingRoute = null;
    }
  }

  use({ routes, inheritProps, rememberInitialRoute, install, queryProps, ...restOptions }: ReactViewRouterMoreOptions) {
    if (rememberInitialRoute !== undefined) this.rememberInitialRoute = rememberInitialRoute;

    if (queryProps) this.queryProps = queryProps;

    if (routes) {
      const originRoutes = this.routes;
      this.routes = routes ? normalizeRoutes(routes) : [];

      this._callEvent('onRoutesChange', this.routes, originRoutes);

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

  _walkRoutes(routes: ConfigRouteArray|RouteChildrenFn, parent?: ConfigRoute) {
    walkRoutes(routes, (route, routeIndex, rs) => {
      this._callEvent('onWalkRoute', route, routeIndex, rs);

      if (route.name) {
        let name = camelize(route.name);
        if (this.routeNameMap[name]) {
          warn(`[react-view-router] route name '${route.name}'(path is [${route.path}]) is duplicate with [${this.routeNameMap[name]}]`);
        }
        this.routeNameMap[name] = route.path;
      }
    }, parent);
  }

  _refreshInitialRoute() {
    let historyLocation = { ...this.history.location } as RouteHistoryLocation;
    if (!this.isMemoryMode && window && window.location && window.location.search !== historyLocation.search) {
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
        const stacks = reverseArray(this.history.stacks.concat(historyLocation as any));
        const basename = this.basenameNoSlash;
        for (let i = 0; i < stacks.length; i++) {
          let currentStack = stacks[i];
          if (!currentStack.pathname.startsWith(basename)) break;
          if (i === stacks.length - 1 || !stacks[i + 1].pathname.startsWith(basename)) {
            stack = currentStack;
            break;
          }
        }
      } else if (this.history.stacks.length) {
        stack = this.history.stacks[0];
      }
      if (stack) {
        historyLocation = normalizeLocation({
          pathname: stack.pathname,
          search: stack.search,
        }, { queryProps: this.queryProps }) as RouteHistoryLocation;
        if (!this.isMemoryMode && window?.location?.search) {
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

  _getComponentGurads<T extends RouteGuardInterceptor>(
    mr: MatchedRoute,
    guardName: string,
    onBindInstance?: OnBindInstance<Exclude<T, 'LazyResolveFn'>>,
    onGetLazyResovle?: OnGetLazyResovle|null
  ) {
    let ret: T[] = [];

    const componentInstances = mr.componentInstances;

    const getGuard = (obj: any, guardName: string): T => {
      let guard = obj && obj[guardName];
      if (guard) innumerable(guard, 'instance', obj);
      return guard;
    };

    // route config
    const routeGuardName = guardName.replace('Route', '');
    const r = mr.config;

    const guards = r[routeGuardName];
    if (guards) ret.push(guards);

    const toResovle: RouteComponentToResolveFn<T> = (c, componentKey) => {
      let ret: T[] = [];
      if (c) {
        const cc = c.__component ? getGuardsComponent(c, true) : c;

        const cg = getGuard(c.__guards, guardName);
        if (cg) ret.push(cg);

        let ccg = cc && getGuard(cc.prototype, guardName);
        if (ccg) {
          if (this.vuelike && !ccg.isMobxFlow && cc.__flows && ~cc.__flows.indexOf(guardName)) ccg = this.vuelike.flow(ccg);
          ret.push(ccg);
        }
        if (this._isVuelikeComponent(cc) && Array.isArray(cc.mixins)) {
          cc.mixins.forEach((m: any) => {
            let ccg = m && (getGuard(m, guardName) || getGuard(m.prototype, guardName));
            if (!ccg) return;
            if (this.vuelike && !ccg.isMobxFlow && m.__flows && ~m.__flows.indexOf(guardName)) ccg = this.vuelike.flow(ccg);
            ret.push(ccg);
          });
        }
      }

      const ci = componentInstances[componentKey];
      if (isRouteGuardInfoHooks(ci)) {
        const cig = getGuard(ci, guardName);
        if (cig) ret.push(cig);
      }
      if (onBindInstance) ret = ret.map(v => onBindInstance(v as any, componentKey, ci, mr)).filter(Boolean) as T[];
      else if (ci) {
        ret = ret.map(v => {
          let ret = v.bind(ci) as T;
          ret.instance = v.instance;
          return ret;
        });
      }
      ret = flatten(ret);
      ret.forEach(v => v.route = mr);
      return ret;
    };

    const replaceInterceptors = (newInterceptors: T[], interceptors:  T[], index: number) => {
      interceptors.splice(index, 1, ...newInterceptors);
      return interceptors[index] as any;
    };

    // route component
    r.components && Object.keys(r.components).forEach(key => {
      const c = r.components[key];
      if (!c) return;

      const isResolved = this._callEvent(
        'onGetRouteComponentGurads',
        ret,
        r,
        c,
        key,
        guardName,
        {
          router: this,
          onBindInstance,
          onGetLazyResovle,
          toResovle,
          getGuard,
          replaceInterceptors
        }
      );
      if (isResolved === true) return ret;

      if (c instanceof RouteLazy) {
        let lazyResovleCb: () => void;
        const lazyResovle: LazyResolveFn = async (interceptors: any[], index: number) => {
          lazyResovleCb && lazyResovleCb();
          let nc = await c.toResolve(this, r, key);
          nc = this._callEvent('onLazyResolveComponent', nc, r) || nc;
          let ret = toResovle(nc, key);
          return replaceInterceptors(ret, interceptors, index);
        };
        lazyResovle.lazy = true;
        lazyResovle.route = mr;
        onGetLazyResovle && onGetLazyResovle(lazyResovle, cb => lazyResovleCb = cb);
        ret.push(lazyResovle as any);
        return;
      }

      ret.push(...toResovle(c, key));
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

  _getChangeMatched(route: Route, route2?: Route | null, options: {
    containLazy?: boolean,
    count?: number,
    compare?: (tr: MatchedRoute, fr: MatchedRoute) => boolean
  } = {}) {
    const ret: MatchedRoute[] = [];
    if (!route2) return [...route.matched];
    let start = false;
    route && route.matched.some((tr, i) => {
      let fr = route2.matched[i];
      if (!start) {
        start = (options.containLazy && hasRouteLazy(tr))
          || !fr
          || fr.path !== tr.path
          || Boolean(options.compare && options.compare(tr, fr));
        if (!start) return;
      }
      ret.push(tr);
      return typeof options.count === 'number' && ret.length === options.count;
    });
    return ret.filter(r => !r.redirect);
  }

  _getBeforeEachGuards(to: Route, from: Route | null, current: Route | null = null) {
    const ret: (RouteBeforeGuardFn|LazyResolveFn)[] = [...this.beforeEachGuards];

    if (this.viewRoot && this.viewRoot.props.beforeEach) {
      ret.push(this.viewRoot.props.beforeEach);
    }
    // to.matched.forEach(mr => {
    //   Object.keys(mr.viewInstances).forEach(key => {
    //     let view = mr.viewInstances[key];
    //     if (!view || view === this.viewRoot) return;
    //     const beforeEach = view.props.beforeEach;
    //     if (beforeEach) ret.push(beforeEach);
    //   });
    // });

    if (from) {
      let fm = this._getChangeMatched(from, to).filter(r => Object.keys(r.viewInstances).some(key => r.viewInstances[key]));

      reverseArray(fm).forEach(mr => {
        reverseArray(mr.guards.beforeLeave).forEach(g => {
          if (g.called) return;
          if (g.instance) {
            const beforeEnterGuard = mr.guards.beforeEnter.find(g2 => g2.instance === g.instance);
            if (beforeEnterGuard && !beforeEnterGuard.called) return;
          }
          ret.push(g.guard);
        });
      });
    }
    if (to) {
      let tm = this._getChangeMatched(to, from, {
        containLazy: true,
        compare: (tr, fr) => fr.guards.beforeEnter.some(g => !g.called)
      });
      tm.forEach(mr =>
        mr.guards.beforeEnter.forEach(g => {
          if (!g.lazy && g.called) return;
          ret.push(g.guard);
        }));
    }
    return flatten(ret);
  }

  _getBeforeResolveGuards(to: Route, from: Route | null) {
    let ret = [...this.beforeResolveGuards];
    if (to) {
      let tm = this._getChangeMatched(to, from, {
        compare: (tr, fr) => fr.guards.beforeResolve.some(g => !g.called)
      });
      tm.forEach(mr => {
        mr.guards.beforeResolve.forEach(g => {
          if (g.called) return;
          ret.push(g.guard);
        });
      });
    }
    return flatten(ret);
  }

  _getRouteUpdateGuards(to: Route, from: Route | null) {
    const ret: RouteAfterGuardFn[] = [];
    const fm: MatchedRoute[] = [];
    to && to.matched.some((tr, i) => {
      let fr = from && from.matched[i];
      if (!fr || fr.path !== tr.path) return true;
      fm.push(fr);
    });
    reverseArray(fm.filter(r => !r.redirect)).forEach(mr =>
      reverseArray(mr.guards.update).forEach(g => {
        if (g.called) return;
        ret.push(g.guard);
      }));
    return ret;
  }

  _getAfterEachGuards(to: Route, from: Route | null) {
    const ret: RouteAfterGuardFn[] = [];
    if (from) {
      const fm = this._getChangeMatched(from, to).filter(r => Object.keys(r.viewInstances)
        .some(key => r.viewInstances[key]));
      reverseArray(fm.filter(r => !r.redirect)).forEach(mr =>
        reverseArray(mr.guards.afterLeave).forEach(g => {
          if (g.called) return;
          ret.push(g.guard);
        }));
    }
    if (this.viewRoot && this.viewRoot.props.afterEach) {
      ret.push(this.viewRoot.props.afterEach);
    }
    ret.push(...this.afterEachGuards);
    return flatten(ret);
  }

  _transformLocation(location: RouteHistoryLocation|Route) {
    if (!location || isRoute(location)) return location;
    if (this.basename) {
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

  async _getInterceptor(interceptors: RouteGuardInterceptor[], index: number) {
    let interceptor = interceptors[index];
    while (interceptor && (interceptor as LazyResolveFn).lazy) {
      interceptor = await (interceptor as LazyResolveFn)(interceptors, index);
    }

    const newInterceptor = this._callEvent('onGetRouteInterceptor', interceptor, interceptors, index);
    if (newInterceptor && (isFunction(newInterceptor) || newInterceptor.then)) interceptor = newInterceptor;

    return interceptor as any;
  }


  async _routetInterceptors(
    interceptors: RouteGuardInterceptor[],
    to: Route,
    from: Route | null,
    next?: RouteNextFn
  ) {
    let throwError = false;
    const isBlock = (v: any, interceptor: RouteBeforeGuardFn, update: (v: Route) => void) => {
      if (throwError) return true;

      let _isLocation = typeof v === 'string' || isLocation(v);
      if (_isLocation && interceptor) {
        let _to = isRoute(v) ? v : normalizeLocation(v, { route: interceptor.route, queryProps: this.queryProps });
        v = _to && this.createRoute(_to, {
          action: getLoactionAction(to),
          from: to,
          matchedProvider: getCompleteRoute(to) || getCompleteRoute(from),
          isRedirect: true,
        });
        if (v && v.fullPath === to.fullPath) {
          v = undefined;
          _isLocation = false;
        } else if (v) update(v);
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

      const nextWrapper: RouteNextFn = this._nexting = once(async (f1: any) => {
        if (isBlock.call(this, f1, interceptor, v => {
          f1 = v;
        })) return next(f1);
        if (f1 === true) f1 = undefined;
        try {
          let nextInterceptor = await this._getInterceptor(interceptors, ++index);
          if (!nextInterceptor) return next((res: any) => isFunction(f1) && f1(res));

          return await beforeInterceptor.call(
            this,
            nextInterceptor,
            index,
            to,
            from,
            res => {
              let ret = next(res);
              if ((interceptor as RouteBeforeGuardFn).global) isFunction(f1) && f1(res);
              return ret;
            }
          );
        } catch (ex) {
          throwError = true;
          console.error(ex);
          next(typeof ex === 'string' ? new Error(ex) : ex);
        }
      });
      return await (interceptor as RouteBeforeGuardFn)(to, from, nextWrapper, { route: interceptor.route, router: this });
    }
    if (next) await beforeInterceptor.call(this, await this._getInterceptor(interceptors, 0), 0, to, from, next);
    else afterInterceptors.call(this, interceptors, to, from);
  }

  async _handleRouteInterceptor(
    location: null | RouteHistoryLocation | Route,
    callback: (ok: boolean | RouteInterceptorCallback, route?: Route | null) => void,
    isInit = false
  ) {
    if (!this.isRunning) return callback(true);

    if (location) {
      let pathname = location.path || (location as RouteHistoryLocation).pathname;
      if (isInit && this.basename && !location.basename
        && this.history.location.pathname === pathname) {
        if (this.parent && this.parent.currentRoute) {
          let url = this.parent.currentRoute.url;
          if (url && this.parent.basename) url = this.parent.basename.substr(0, this.parent.basename.length - 1) + url;
          if (!pathname.startsWith(url)) {
            if ((location as RouteHistoryLocation).pathname != null) (location as RouteHistoryLocation).pathname = url;
            if (location.path != null) location.path = url;
            if (location.query) location.query = this.parent.currentRoute.query;
            if (!isReadonly(location, 'search')) location.search = this.parent.currentRoute.search;
          }
        }
      }

      if (this.pendingRoute
        && this.pendingRoute.fullPath === (location as RouteHistoryLocation).fullPath) return callback(!this._nexting);

      if (this.basename
        && (location as RouteHistoryLocation).absolute
        && !pathname.startsWith(this.basename)) return callback(true);

      location = this._transformLocation(location as RouteHistoryLocation);
    }

    if (!location || (!(location as RouteHistoryLocation).pathname && (this.currentRoute && !this.currentRoute.path))) {
      return callback(true);
    }

    if ((!isInit && !location.onInit) && (
      !this.viewRoot || !this.viewRoot.state._routerInited
    )) return callback(true);


    const nexts: onRouteingNextCallback[] = [];
    let error: unknown;
    let isContinue = true;
    this._callEvent('onRouteing', (ok: boolean|onRouteingNextCallback|Route) => {
      if (ok === false) isContinue = false;
      else if (isLocation(ok)) location = ok as any;
      else if (isFunction(ok)) nexts.push(ok);
    });
    try {
      return isContinue && (await this._internalHandleRouteInterceptor(location, callback, isInit));
    } catch (ex) {
      error = ex;
    } finally {
      nexts.forEach(next => next(Boolean(!isContinue || error), error, { location, isInit }));
    }
  }

  _internalHandleRouteInterceptor(
    location: RouteHistoryLocation|Route,
    callback: (ok: boolean | RouteInterceptorCallback, route?: Route | null) => void,
    isInit = false,
  ) {
    let isContinue = false;
    let interceptorCounter = ++this._interceptorCounter;
    try {
      let to = this.createRoute(
        location,
        {
          matchedProvider: (hasOwnProp(location, 'basename') && location.basename !== this.basename) ? this.currentRoute : null
        }
      );
      const from = isInit
        ? null
        : to.redirectedFrom && to.redirectedFrom.basename === this.basename
          ? to.redirectedFrom
          : this.currentRoute;
      const current = this.currentRoute;
      const checkIsContinue = () => !to.path || (this.isRunning
        && interceptorCounter === this._interceptorCounter
        && Boolean(this.viewRoot && this.viewRoot._isMounted));
      const afterCallback = (isContinue: boolean, to: Route, isRouteAbort: boolean = true, ok: any = undefined) => {
        if (isContinue) to.onInit && to.onInit(isContinue, to);
        else if (isRouteAbort) {
          this._callEvent('onRouteAbort', to, ok);
          to.onAbort && to.onAbort(isContinue, to, ok);
        }

        this.nextTick(() => {
          if (!checkIsContinue()) return;
          if (!isInit && (!current || current.fullPath !== to.fullPath)) {
            this._routetInterceptors(this._getRouteUpdateGuards(to, current), to, current);
          }
        });
      };

      if (!to) return;

      const realtimeLocation = this.history.realtimeLocation;
      if (from && from.isComplete
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
        reverseArray(this._getSameMatched(isInit ? null : this.currentRoute, to)).some(m => {
          let keys = Object.keys(m.viewInstances).filter(key => m.viewInstances[key] && m.viewInstances[key].props.fallback);
          if (!keys.length) return;
          return fallbackViews = keys.map(key => m.viewInstances[key]);
        });
      }

      fallbackViews.forEach(fallbackView => fallbackView._updateResolving(true));
      this._routetInterceptors(this._getBeforeEachGuards(to, from, current), to, from, ok => {
        this._nexting = null;
        fallbackViews.length && setTimeout(() => fallbackViews.forEach(
          fallbackView => fallbackView._updateResolving(false)
        ), 0);
        const resolveOptions = { from: to, isInit: Boolean(isInit || to.onInit) };

        if (resolveOptions.isInit && this.pendingRoute && to.fullPath !== this.pendingRoute.fullPath) {
          ok = this.pendingRoute;
          this.pendingRoute = null;
        }

        // if (typeof ok === 'string') ok = { path: ok };
        isContinue = checkIsContinue()
          && Boolean(ok === undefined || (ok && !(ok instanceof Error) && !isLocation(ok)));

        if (isContinue) {
          const toLast = to.matched[to.matched.length - 1];
          if (toLast && toLast.config.exact && toLast.redirect) {
            ok = resolveRedirect(toLast.redirect, toLast, resolveOptions);
            if (ok) isContinue = false;
          }
        }
        if (isContinue && !isLocation(ok)) {
          to.matched
            .filter((mr: MatchedRoute) => mr.abort)
            .some(r => {
              const abort = resolveAbort(r.abort, r, resolveOptions);
              if (abort) {
                ok = typeof abort === 'string'
                  ? new Error(abort)
                  : (abort === true ? undefined : abort);
                isContinue = false;
              }
              return abort;
            });
        }

        const onNext = (newOk: boolean) => {
          isContinue = newOk;
          if (isContinue) this._routetInterceptors(this._getBeforeResolveGuards(to, current), to, current);

          // callback(isContinue, to);
          let okIsLocation = isLocation(ok);
          let isRouteAbort = !isContinue && !okIsLocation;
          afterCallback(isContinue, to, isRouteAbort, ok);

          if (!isContinue) {
            if (okIsLocation) {
              return this.redirect(
                (ok as RouteLocation),
                isRouteAbort ? undefined : to.onComplete,
                isRouteAbort ? undefined : to.onAbort,
                to.onInit || (isInit ? callback : null),
                to
              );
            }
            if (ok instanceof Error) this.errorCallbacks.forEach(cb => cb(ok as Error));
            return;
          }

          this.nextTick(() => {
            if (isFunction(ok)) ok = ok(to);
            if (to && isFunction(to.onComplete)) to.onComplete(Boolean(ok), to);
            this._routetInterceptors(this._getAfterEachGuards(to, current), to, current);
          });
        };

        if (!isContinue) {
          try {
            onNext(isContinue);
          } finally {
            callback(isContinue, to);
          }
          return;
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
      function doComplete(res: any, _to: Route|null) {
        onComplete && onComplete(res, _to);
        resolve(res);
      }
      function doAbort(res: any, _to: Route|null) {
        onAbort && onAbort(res, _to);
        reject(res === false && _to === null ? new Error('to path cannot be empty!') : res);
      }
      if (!this.isRunning) {
        doAbort(new Error('router is not running!'), null);
        return;
      }

      let _to: RouteHistoryLocation|null;
      try {
        _to = normalizeLocation(to, {
          route: (to && (to as RouteLocation).route) || this.currentRoute,
          basename: this.basename,
          mode: this.mode,
          queryProps: this.queryProps,
          resolvePathCb: (path, to) => {
            const newPath: string = path.replace(
              /\[([A-z0-9.\-_#@$%^&*():|?<>=+]+)\]/g,
              (m, name) => {
                let ret = this.nameToPath(name, to, {
                  onComplete: onInit || onComplete,
                  onAbort,
                });
                if (ret == null) throw new Error(`route name [${name}]not be found!`);
                if (ret === true) throw 'cancel';

                return ret;
              }
            );
            return newPath;
          }
        });
      } catch (ex) {
        if (ex === 'cancel') return;
        throw ex;
      }

      if (!_to) {
        doAbort(false, null);
        return;
      }

      if (isFunction(onComplete)) _to.onComplete = once(doComplete);
      if (isFunction(onAbort)) _to.onAbort = once(doAbort);
      if (onInit) _to.onInit = onInit;

      _to.isReplace = Boolean(replace);
      if (this._nexting && (!(to as RouteLocation).pendingIfNotPrepared || this.isPrepared)) {
        this._nexting(_to);
        return;
      }

      if (_to.fullPath && isAbsoluteUrl(_to.fullPath) && window?.location) {
        if (replace) window.location.replace(_to.fullPath);
        else window.location.href = _to.fullPath;
        return;
      }

      if (!this.isPrepared && !onInit) {
        this.pendingRoute = _to;
        let location = this.history.location;
        if (_to.fullPath === `${location.pathname}${location.search}`) return;
      } else {
        this.pendingRoute = null;
      }

      let isContinue = onInit || this._callEvent('onRouteGo', to, doComplete, doAbort, replace);
      if (isContinue === false) return;

      let history = this.history;

      if ((_to as RouteLocation).absolute) {
        if (this.basename) {
          if (this.top && !this.top.basename) {
            history = this.top.history;
          } else if (!this.isMemoryMode) {
            let url = history.createHref(_to);

            if (replace) window.location.replace(url);
            else window.location.href = url;
            return;
          }
        } else if (this.isMemoryMode) {
          let url = '';
          let mode = typeof _to.absolute === 'string'
            ? _to.absolute
            : '';
          if (!mode || mode === HistoryType.memory) {
            let guessHistory = getPossibleHistory(this.options);
            if (guessHistory) {
              if (guessHistory.type === HistoryType.memory) history = guessHistory;
              else {
                mode = guessHistory.type;
                url = guessHistory.createHref(_to);
              }
            } else {
              mode = HistoryType.hash;
              url = createHashHref(_to, this.options.hashType);
            }
            warn(`[react-view-router] warning: parent router mode is ${mode || 'unknown'}, it could be '${mode}' mode that to go!`);
          } else url = history.createHref(_to);

          // if (mode === HistoryType.hash) url = getBaseHref() + (url.startsWith('#') ? '' : '#') + url;

          if (url) {
            if (replace) window.location.replace(url);
            else window.location.href = url;
            return;
          }
        }
      }

      if ((_to as RouteLocation).backIfVisited && _to.basename === this.basename) {
        const historyIndex = this.history.index;
        const isMatch: (to: RouteHistoryLocation, s: HistoryStackInfo) => boolean
          = (_to as RouteLocation).backIfVisited === 'full-matcth'
            ? (to, s) => to.search === s.search
            : (to, s) =>  Object.keys(to.query).every(key => to.query[key] == s.query[key]);
        const stack = reverseArray(this.stacks).find(s => {
          const stackPath = this.getMatchedPath(s.pathname);
          let toPath = (_to as RouteLocation).path || '';
          if (this.basename) toPath = toPath.substr(this.basenameNoSlash.length, toPath.length);
          return stackPath === this.getMatchedPath(toPath)
            && isMatch(to as RouteHistoryLocation, s)
            && s.index <= historyIndex;
        });
        if (stack) {
          this.go(stack);
          return;
        }
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
  }|RouteHistoryLocation = {}, events: {
    onComplete?: RouteEvent,
    onAbort?: RouteEvent
  } = {}): string|true|null {
    name = camelize(name);

    let path: string|true|null = this.routeNameMap[name];
    if (path == null) {
      this.resolveNameFns.some(fn => {
        let newPath = fn(name, options, this, events);
        if (typeof newPath !== 'string' && newPath !== true) return;
        path = newPath;
        return true;
      });
    } else if (options.absolute) {
      if (this.basename) path = `${this.basename}${path}`;
    }

    if (path == null && options.absolute && this.parent) {
      path = this.parent.nameToPath(name, options, events);
      if (path != null && this.parent.basename) {
        path = `${this.parent.basename}${path}`;
      }
    }

    return path;
  }

  updateRouteMeta(route: ConfigRoute|MatchedRoute, newValue: Partial<any>, options: {
    ignoreConfigRoute?: boolean
  } = {}) {
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
    route.metaComputed = null;
    // if (route.config && !options.ignoreConfigRoute) Object.assign(route.config.meta, newValue);

    this._callEvent('onRouteMetaChange', newValue, oldValue, route, this);
    return changed;
  }

  createMatchedRoute(route: ConfigRoute, match: matchPathResult): MatchedRoute {
    let { url, path = route.path, regx, params } = match || {};
    let { subpath, meta = {}, redirect, depth } = route;

    function guardToGuardInfo<T extends Function>(originGuard: T, instance?: any): MatchedRouteGuard<T> {
      const guardInfo: MatchedRouteGuard<T> = {
        guard: (function matchedRouteGuardWrapper() {
          guardInfo.called = true;
          return originGuard.apply(this, arguments);
        }) as any,
        instance: instance || (originGuard as any).instance,
        called: false
      };
      copyOwnProperties(guardInfo.guard, originGuard);
      return guardInfo;
    }
    function guardsToMatchedRouteGuards<T extends Function>(guards: T[]): MatchedRouteGuard<T>[] {
      return guards.filter((v: any) => !v.lazy).map((v: any) => guardToGuardInfo(v));
    }

    let beforeEnter: MatchedRouteGuard<RouteBeforeGuardFn|LazyResolveFn>[];
    let beforeResolve: MatchedRouteGuard<RouteAfterGuardFn>[];
    let update: MatchedRouteGuard<RouteAfterGuardFn>[];
    let beforeLeave: MatchedRouteGuard<RouteBeforeGuardFn>[];
    let afterLeave: MatchedRouteGuard<RouteAfterGuardFn>[];

    let that = this;
    const ret: MatchedRoute = {
      url,
      path,
      subpath,
      depth,
      regx,
      redirect,
      params,
      componentInstances: {},
      viewInstances: {},
      guards: {
        get beforeEnter() {
          if (beforeEnter) return beforeEnter;
          beforeEnter = [];
          that._getComponentGurads<RouteBeforeGuardFn|LazyResolveFn>(
            ret,
            'beforeRouteEnter',
            (fn, name, ci, r) => {
              const ret = function beforeRouteEnterWraper(to: Route, from: Route | null, next: RouteNextFn) {
                return fn(to as any, from as any, (cb, ...args) => {
                  if (isFunction(cb)) {
                    const _cb = cb;
                    r.config._pending && (r.config._pending.completeCallbacks[name] = ci => {
                      const res = _cb(ci);
                      that._callEvent('onRouteEnterNext', r, ci, res);
                      return res;
                    });
                    cb = undefined;
                  }
                  return next(cb, ...args);
                }, { route: r, router: that });
              };
              const guardInfo = guardToGuardInfo(ret, fn.instance);
              beforeEnter.push(guardInfo);
              return guardInfo.guard;
            },
            (lazyResovleFn, hook) => {
              const guardInfo = {
                lazy: true,
                guard: lazyResovleFn,
              };
              hook(() => {
                const idx = beforeEnter.indexOf(guardInfo);
                if (~idx) beforeEnter.splice(idx, 1);
              });
              return beforeEnter.push(guardInfo);
            }
          );
          return beforeEnter;
        },
        get beforeResolve() {
          if (beforeResolve) return beforeResolve;
          beforeResolve = guardsToMatchedRouteGuards(that._getComponentGurads<RouteAfterGuardFn>(ret, 'beforeRouteResolve'));
          return beforeResolve;
        },
        get update() {
          if (update) return update;
          update = guardsToMatchedRouteGuards(that._getComponentGurads<RouteAfterGuardFn>(ret, 'beforeRouteUpdate'));
          return update;
        },
        get beforeLeave() {
          if (beforeLeave) return beforeLeave;
          beforeLeave = [];
          that._getComponentGurads<RouteBeforeGuardFn>(
            ret,
            'beforeRouteLeave',
            (fn, name, ci, r) => {
              const ret = function beforeRouteLeaveWraper(to: Route, from: Route | null, next: RouteNextFn) {
                return fn.call(ci, to, from, (cb?: RouteNextResult, ...args: any[]) => {
                  if (isFunction(cb)) {
                    const _cb = cb;
                    cb = (...as: any[]) => {
                      const res = _cb(...as);
                      that._callEvent('onRouteLeaveNext', r, ci, res);
                      return res;
                    };
                  }
                  return next(cb, ...args);
                }, { route: r, router: that });
              };
              const guardInfo = guardToGuardInfo(ret, fn.instance);
              beforeLeave.push(guardInfo);
              return guardInfo.guard;
            }
          );
          return beforeLeave;
        },
        get afterLeave() {
          if (afterLeave) return afterLeave;
          afterLeave = guardsToMatchedRouteGuards(that._getComponentGurads<RouteAfterGuardFn>(ret, 'afterRouteLeave'));
          return afterLeave;
        },
      },
      config: route
    } as any;

    readonly(ret, 'meta', () => meta);

    let metaComputed: RouteComputedMeta|undefined;
    Object.defineProperty(ret, 'metaComputed', {
      get() {
        if (metaComputed) return metaComputed;
        metaComputed = Object.keys(meta).reduce((p, key) => {
          readonly(p, key, () => readRouteMeta(route, key, { router: this }));
          return p;
        }, {} as any);
        return metaComputed;
      },
      set(v) {
        metaComputed = v;
      },
      enumerable: true,
      configurable: true
    });

    if (match.isNull) ret.isNull = true;
    return ret;
  }

  getMatched(to: Route | RouteHistoryLocation | string, from?: Route | null, parent?: ConfigRoute): MatchedRouteArray {
    if (!from) from = this.currentRoute;
    // function copyInstance(to: MatchedRoute, from: MatchedRoute | null) {
    //   if (!from) return;
    //   if (from.componentInstances) to.componentInstances = from.componentInstances;
    //   if (from.viewInstances) to.viewInstances = from.viewInstances;
    // }
    function isSameMatch(tr: RouteBranchInfo, fr: MatchedRoute): boolean {
      return fr && tr && fr.path === tr.match.path;
    }
    let matched = matchRoutes(this.routes, to, parent, { queryProps: this.queryProps });
    let isHistoryLocation = !isRoute(to) && typeof to !== 'string';
    let state = (isHistoryLocation && (to as any).state && (to as any).state[this.basename || DEFAULT_STATE_NAME]) || {};
    let isSameMatchedRoute = true;
    let ret = matched.map(({ route, match }, i) => {
      let ret;
      let viewInstances: MatchedRoute['viewInstances']|undefined;
      if (isSameMatchedRoute && from && i < from.matched.length) {
        const fr: MatchedRoute = from.matched[i];
        const tr = matched[i];
        isSameMatchedRoute = isSameMatch(tr, fr);
        if (isSameMatchedRoute) ret = fr;
        else if (i && isSameMatch(matched[i - 1], from.matched[i - 1])) viewInstances = fr.viewInstances;
      }
      if (!ret) {
        ret = this.createMatchedRoute(route, match);
        if (viewInstances) ret.viewInstances = viewInstances;
        ret.state = state[ret.url] || {};
      }
      return ret;
    });
    innumerable(ret, 'unmatchedPath', matched.unmatchedPath || '');
    innumerable(ret, 'first', ret[0]);
    innumerable(ret, 'last', ret[ret.length - 1]);
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

  getMatchedPath(path: string = '') {
    let matched = this.getMatched(path);
    return matched.length
      ? `${this.basenameNoSlash}${matched[matched.length - 1].path}${matched.unmatchedPath}`
      : path;
  }

  createRoute(to: RouteHistoryLocation | string | Route | null, options: {
    action?: Action,
    from?: Route | null,
    matchedProvider?: Route|null,
    isRedirect?: boolean,
  } = {}): Route {
    if (isRoute(to)) return to;
    if (typeof to === 'string') to = normalizeLocation(to, { queryProps: this.queryProps });
    let { from, matchedProvider, action } = options;
    if (!from && to) from = (to as RouteHistoryLocation).redirectedFrom || this.currentRoute;
    const matched = to ? this.getMatched(to as RouteHistoryLocation, matchedProvider || from) : [];
    const last = matched.length ? matched[matched.length - 1] : { url: '', path: '', params: {}, meta: {}, metaComputed: {}, state: {} };

    const {
      search = '', query, path = '', delta = 0, onAbort, onComplete, isRedirect, isReplace, onInit,
      fromEvent = false,
    } = to || {};

    const params = to?.params || {};
    Object.assign(params, last.params);

    const ret: any = {
      action: action || getLoactionAction(to as any) || this.history.action,
      url: last.url,
      basename: this.basename,
      path,
      search,
      fullPath: `${path}${search}`,
      isRedirect: Boolean(isRedirect || options.isRedirect),
      isReplace: Boolean(isReplace),
      fromEvent,
      query: query || (search ? config.parseQuery(search, this.queryProps) : {}),
      params,
      matched,
      matchedPath: last.path,
      delta,
      onAbort,
      onComplete,
      isComplete: false,
    };
    readonly(ret, 'meta', () => last.meta);
    readonly(ret, 'metaComputed', () => last.metaComputed);
    readonly(ret, 'state', () => last.state);
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

  updateRoute(location: RouteHistoryLocation| Route | null) {
    location = location && this._transformLocation(location);
    if (!location) return;

    if (!this.isRunning && (location.path || (this.currentRoute && !this.currentRoute.path))) return;

    let prevRoute = this.currentRoute;
    let realtimeLocation = this.history.realtimeLocation;
    if (prevRoute && realtimeLocation && realtimeLocation !== this.history.location) {
      prevRoute = this.createRoute(realtimeLocation as any, { from: prevRoute });
    }

    const currentRoute = isRoute(location) ? location : this.createRoute(location, { from: prevRoute });
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
      currentRoute.isComplete = true;
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
    return (_to.isReplace !== false) || (from && from.fromEvent) || onInit
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
    this._walkRoutes(routes as ConfigRouteArray, parentRoute);

    let children: ConfigRouteArray = this.routes;
    if (parentRoute) {
      if (!parentRoute.children) parentRoute.children = [];
      children = getRouteChildren(parentRoute.children, parentRoute);
    }
    (routes as ConfigRouteArray).forEach(r => {
      let i = children.findIndex(v => v.path === r.path);
      if (~i) children.splice(i, 1, r);
      else children.push(r);
    });

    this._callEvent('onRoutesChange', this.routes, this.routes, parentRoute, children);

    if (!parentRoute && this.viewRoot) this.viewRoot.setState({ routes: routes as ConfigRouteArray });
  }

  parseQuery(query: string, queryProps?: ParseQueryProps) {
    return config.parseQuery(query, queryProps);
  }

  stringifyQuery(obj: Partial<any>) {
    return config.stringifyQuery(obj);
  }

  onError(callback: RouteErrorCallback) {
    let unwatch = () => {
      const idx = this.errorCallbacks.findIndex(cb => cb === callback);
      if (~idx) this.errorCallbacks.splice(idx, 1);
    };
    const idx = this.errorCallbacks.findIndex(cb => cb === callback);
    if (~idx) return unwatch;
    this.errorCallbacks.push(callback);
    return unwatch;
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

export default ReactViewRouter;
