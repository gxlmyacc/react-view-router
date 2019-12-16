import { createHashHistory, createBrowserHistory, createMemoryHistory } from 'history-fix';
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


const HISTORY_METHS = ['push', 'replace', 'go', 'back', 'goBack', 'forward', 'goForward', 'block'];

let idSeed = 1;

export default class ReactViewRouter {

  constructor({ mode = 'hash', basename = '', base = '', ...options  } = {}) {
    options.getUserConfirmation = this._handleRouteInterceptor.bind(this);

    this.id = idSeed++;
    this.options = options;
    this.mode = mode;
    this.basename = basename || base;
    this.routes = [];
    this.plugins = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.prevRoute = null;
    this.currentRoute = null;
    this.viewRoot = null;
    this.errorCallback = null;
    this.app = null;
    this.getHostRouterView = getHostRouterView;
    // this.states = [];
    // this.stateOrigin = this.history.length;

    this.use(options);
    this.nextTick = nextTick.bind(this);

    if (!options.manual) this.start();
  }

  get history() {
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
    Object.keys(this._history).forEach(key => !~HISTORY_METHS.indexOf(key) && (this[key] = this._history[key]));
    HISTORY_METHS.forEach(key => this[key] && (this[key] = this[key].bind(this)));

    return this._history;
  }

  start({ mode, basename, base, ...options  } = {}) {
    this.stop();

    Object.assign(this.options, options);
    if (basename !== undefined) this.basename = basename;
    if (base !== undefined) this.basename = base;
    if (mode !== undefined) this.mode = mode;

    this._unlisten = this.history.listen(location => this.updateRoute(location));
    this._unblock = this.history.block(location => routeCache.create(location, this.id));

    if (this.routes.length) this.updateRoute(this.history.location);
  }

  stop() {
    if (this._unlisten) this._unlisten();
    if (this._unblock) this._unblock();
    this._history = null;
    this.app = null;
  }

  use({ routes, inheritProps, install, ...restOptions }) {
    if (routes) {
      this.routes = routes ? normalizeRoutes(routes) : [];
      this._history && this.updateRoute(this._history.location);
    }

    if (inheritProps !== undefined) config.inheritProps = inheritProps;

    Object.assign(config, restOptions);

    if (install) this.install = install.bind(this);
  }

  plugin(plugin) {
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

  _callEvent(event, ...args) {
    let plugin;
    try {
      let ret;
      this.plugins.forEach(p => {
        plugin = p;
        const newRet = p[event] && p[event].call(p, ...args, ret);
        if (newRet !== undefined) ret = newRet;
      });
      return ret;
    } catch (ex) {
      if (plugin && plugin.name && ex && ex.message) ex.message = `[${plugin.name}:${event}]${ex.message}`;
      throw ex;
    }
  }

  _getComponentGurads(r, guardName, bindInstance = true) {
    let ret = [];
    const componentInstances = r.componentInstances;

    // route config
    const routeGuardName = guardName.replace('Route', '');
    if (r.config) r = r.config;

    const guards = r[routeGuardName];
    if (guards) ret.push(guards);

    const toResovle = (c, key) => {
      let ret = [];
      const cc = c.__component ? getGuardsComponent(c, true) : c;

      const cg = c.__guards && c.__guards[guardName];
      if (cg) ret.push(cg);

      let ccg = cc && cc.prototype && cc.prototype[guardName];
      if (ccg) {
        if (this.ReactVueLike && !ccg.isMobxFlow && cc.__flows && ~cc.__flows.indexOf(guardName)) ccg = this.ReactVueLike.flow(ccg);
        ret.push(ccg);
      }
      if (cc && this.ReactVueLike && cc.prototype instanceof this.ReactVueLike && Array.isArray(cc.mixins)) {
        cc.mixins.forEach(m => {
          let ccg = m[guardName] || (m.prototype && m.prototype[guardName]);
          if (!ccg) return;
          if (!ccg.isMobxFlow && m.__flows && ~m.__flows.indexOf(guardName)) ccg = this.ReactVueLike.flow(ccg);
          ret.push(ccg);
        });
      }

      const ci = componentInstances[key];
      if (bindInstance) {
        if (isFunction(bindInstance)) ret = ret.map(v => bindInstance(v, key, ci, r)).filter(Boolean);
        else if (ci) ret = ret.map(v => v.bind(ci));
      }
      ret = flatten(ret);
      ret.forEach(v => v.route = r);
      return ret;
    };

    // route component
    r.components && Object.keys(r.components).forEach(key => {
      const c = r.components[key];
      if (!c) return;

      if (c instanceof RouteLazy) {
        const lazyResovle = async (interceptors, index) => {
          let nc = await c.toResolve(r, key);
          nc = this._callEvent('onResolveComponent', nc, r) || nc;
          let ret = toResovle(nc, key);
          interceptors.splice(index, 1, ...ret);
          return interceptors[index];
        };
        lazyResovle.lazy = true;
        lazyResovle.route = r;
        ret.push(lazyResovle);
      } else ret.push(...toResovle(c, key));
    });

    return ret;
  }

  _getRouteComponentGurads(matched, guardName, reverse = false, bindInstance = true) {
    let ret = [];
    if (reverse) matched = matched.reverse();
    matched.forEach(r => {
      let guards = this._getComponentGurads(r, guardName, bindInstance);
      ret.push(...guards);
    });
    return ret;
  }

  _getSameMatched(route, compare) {
    const ret = [];
    if (!compare) return [];
    route && route.matched.some((tr, i) => {
      let fr = compare.matched[i];
      if (tr.path !== fr.path) return true;
      ret.push(tr);
    });
    return ret.filter(r => !r.redirect);
  }

  _getChangeMatched(route, compare, options = {}) {
    const ret = [];
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

  _getBeforeEachGuards(to, from, current) {
    const ret = [...this.beforeEachGuards];
    const view = this;
    if (from) {
      const fm = this._getChangeMatched(from, to)
        .filter(r => Object.keys(r.componentInstances).some(key => r.componentInstances[key]));
      ret.push(...this._getRouteComponentGurads(
        fm,
        'beforeRouteLeave',
        (fn, name, ci, r) => (function beforeRouteLeaveWraper(to, from, next) {
          return fn(to, from, (cb, ...args) => {
            if (isFunction(cb)) {
              const _cb = cb;
              cb = (...as) => {
                const res = _cb(...as);
                view._callEvent('onRouteLeaveNext', r, ci, res);
                return res;
              };
            }
            return next(cb, ...args);
          }, r);
        })
      ));
    }
    if (to) {
      let tm = this._getChangeMatched(to, from, { containLazy: true });
      tm.forEach(r => {
        let guards = this._getComponentGurads(
          r,
          'beforeRouteEnter',
          (fn, name) => (function beforeRouteEnterWraper(to, from, next) {
            return fn(to, from, (cb, ...args) => {
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
        );
        ret.push(...guards);
      });

      if (from !== current) tm = this._getChangeMatched(to, current);
      tm.forEach(r => {
        const compGuards = {};
        const allGuards = this._getComponentGurads(
          r,
          'afterRouteEnter',
          (fn, name) => {
            if (!compGuards[name]) compGuards[name] = [];
            compGuards[name].push(function () {
              return fn.call(this, to, current, r);
            });
            return null;
          }
        );
        Object.keys(compGuards).forEach(name => compGuards[name].push(...allGuards));
        r.config._pending.afterEnterGuards = compGuards;
      });
    }
    return flatten(ret);
  }

  _getRouteUpdateGuards(to, from) {
    const ret = [];
    const fm = [];
    to && to.matched.some((tr, i) => {
      let fr = from.matched[i];
      if (!fr || fr.path !== tr.path) return true;
      fm.push(fr);
    });
    ret.push(...this._getRouteComponentGurads(fm.filter(r => !r.redirect), 'beforeRouteUpdate', true));
    return ret;
  }

  _getAfterEachGuards(to, from) {
    const ret = [];
    if (from) {
      const fm = this._getChangeMatched(from, to).filter(r => Object.keys(r.componentInstances)
        .some(key => r.componentInstances[key]));
      ret.push(...this._getRouteComponentGurads(fm, 'afterRouteLeave', true));
    }
    ret.push(...this.afterEachGuards);
    return flatten(ret);
  }

  _transformLocation(location) {
    if (!location) return location;
    if (this.basename) {
      if (location.pathname.indexOf(this.basename) !== 0) return null;
      location = { ...location };
      location.pathname = location.pathname.substr(this.basename.length) || '/';
      if (location.path !== undefined) location.path = location.pathname;
    }
    return location;
  }

  async _handleRouteInterceptor(location, callback, ...args) {
    if (typeof location === 'string') location = routeCache.flush(location);
    location = this._transformLocation(location);
    if (!location) return callback(true);
    this._callEvent('onRouteing', true);
    try {
      return await this._internalHandleRouteInterceptor(location, callback, ...args);
    } finally {
      this._callEvent('onRouteing', false);
    }
  }

  async _routetInterceptors(interceptors, to, from, next) {
    const isBlock = (v, interceptor) => {
      let _isLocation = typeof v === 'string' || isLocation(v);
      if (_isLocation && interceptor) {
        v = this.createRoute(normalizeLocation(v, interceptor.route));
        if (v.fullPath === to.fullPath) {
          v = undefined;
          _isLocation = false;
        }
      }
      return !this._history || v === false || _isLocation || v instanceof Error;
    };

    async function beforeInterceptor(interceptor, index, to, from, next) {
      while (interceptor && interceptor.lazy) interceptor = await interceptor(interceptors, index);
      if (!interceptor) return next();

      const nextWrapper = this._nexting = once(async f1 => {
        let nextInterceptor = interceptors[++index];
        if (isBlock.call(this, f1, interceptor)) return next(f1);
        if (f1 === true) f1 = undefined;
        if (!nextInterceptor) return next(res => isFunction(f1) && f1(res));
        try {
          return await beforeInterceptor.call(this,
            nextInterceptor,
            index,
            to,
            from,
            res => {
              let ret = next(res);
              if (interceptor.global) isFunction(f1) && f1(res);
              return ret;
            });
        } catch (ex) {
          console.error(ex);
          next(typeof ex === 'string' ? new Error(ex) : ex);
        }
      });
      return await interceptor(to, from, nextWrapper, interceptor.route);
    }
    if (next) await beforeInterceptor.call(this, interceptors[0], 0, to, from, next);
    else afterInterceptors.call(this, interceptors, to, from);
  }

  async _internalHandleRouteInterceptor(location, callback, isInit = false) {
    let isContinue = false;
    try {
      const to = this.createRoute(location);
      const from = isInit ? null : to.redirectedFrom || this.currentRoute;
      const current = this.currentRoute;

      if (to && from && to.fullPath === from.fullPath) {
        callback(true);
        if (to.onInit) to.onInit(Boolean(to), to);
        return;
      }

      let fallbackView;
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
        fallbackView && setTimeout(() => fallbackView._isMounted && fallbackView._updateResolving(false), 0);

        if (ok && typeof ok === 'string') ok = { path: ok };
        isContinue = Boolean(ok === undefined || (ok && !(ok instanceof Error) && !isLocation(ok)));

        const toLast = to.matched[to.matched.length - 1];
        if (isContinue && toLast && toLast.config.exact && toLast.redirect) {
          ok = resolveRedirect(toLast.redirect, toLast, to);
          if (ok) isContinue = false;
        }

        callback(isContinue, to);

        if (!isContinue) {
          if (isLocation(ok)) {
            if (to.onAbort) ok.onAbort = to.onAbort;
            if (to.onComplete) ok.onComplete = to.onComplete;
            return this.redirect(ok, null, null, to.onInit || (isInit ? callback : null), to);
          }
          if (to && isFunction(to.onAbort)) to.onAbort(ok, to);
          if (ok instanceof Error) this.errorCallback && this.errorCallback(ok);
          return;
        }

        if (to.onInit) to.onInit(Boolean(to), to);

        this.nextTick(() => {
          if (isFunction(ok)) ok = ok(to);
          if (!isInit && (!current || current.fullPath !== to.fullPath)) {
            this._routetInterceptors(this._getRouteUpdateGuards(to, current), to, current);
          }
          if (to && isFunction(to.onComplete)) to.onComplete(ok, to);
          this._routetInterceptors(this._getAfterEachGuards(to, current), to, current);
        });
      });
    } catch (ex) {
      console.error(ex);
      if (!isContinue) callback(isContinue);
    }
  }

  _go(to, onComplete, onAbort, onInit, replace) {
    return new Promise((resolve, reject) => {
      to = normalizeLocation(to, this.currentRoute, false, this.basename);
      function doComplete(res, _to) {
        onComplete && onComplete(res, _to);
        resolve(res);
      }
      function doAbort(res, _to) {
        onAbort && onAbort(res, _to);
        reject(res);
      }
      if (isFunction(onComplete)) to.onComplete = once(doComplete);
      if (isFunction(onAbort)) to.onAbort = once(doAbort);
      if (onInit) to.onInit = onInit;
      if (this._nexting) return this._nexting(to);
      if (replace) {
        to.isReplace = true;
        if (to.fullPath && isAbsoluteUrl(to.fullPath)) location.replace(to.fullPath);
        else this.history.replace(to);
      } else {
        if (to.fullPath && isAbsoluteUrl(to.fullPath)) location.href = to.fullPath;
        else this.history.push(to);
      }
    });
  }

  _replace(to, onComplete, onAbort, onInit) {
    return this._go(to, onComplete, onAbort, onInit, true);
  }

  _push(to, onComplete, onAbort, onInit) {
    return this._go(to, onComplete, onAbort, onInit);
  }

  createMatchedRoute(route, match) {
    let ret = { componentInstances: {}, viewInstances: {} };
    Object.keys(route).forEach(key => ~[
      'path', 'name', 'subpath', 'meta', 'redirect', 'depth'
    ].indexOf(key) && (ret[key] = route[key]));
    ret.config = route;
    if (!match) match = {};
    ret.url = match.url || '';
    ret.params = match.params || {};
    return ret;
  }

  getMatched(to, from, parent) {
    if (!from) from = this.currentRoute;
    function copyInstance(to, from) {
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

  getMatchedComponents(to, from, parent) {
    return this.getMatched(to, from, parent).map(r => r.componentInstances.default).filter(Boolean);
  }

  getMatchedViews(to, from, parent) {
    return this.getMatched(to, from, parent).map(r => r.viewInstances.default).filter(Boolean);
  }

  createRoute(to, from) {
    if (!from) from = (to.redirectedFrom) || this.currentRoute;
    const matched = this.getMatched(to, from);
    const last = matched.length ? matched[matched.length - 1] : { url: '', params: {}, meta: {} };

    const { search, query, path, onAbort, onComplete } = to;
    const ret = {
      action: this.history.action,
      url: last.url,
      basename: this.basename,
      path,
      fullPath: `${path}${search}`,
      isRedirect: Boolean(to.isRedirect),
      isReplace: Boolean(to.isReplace),
      query: query || (search ? config.parseQuery(to.search.substr(1)) : {}),
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
    if (to.isRedirect && from) {
      ret.redirectedFrom = from;
      if (!ret.onAbort && from.onAbort) ret.onAbort = from.onAbort;
      if (!ret.onComplete && from.onComplete) ret.onComplete = from.onComplete;
      if (!ret.onInit && to.onInit) ret.onInit = to.onInit;
    }
    return ret;
  }

  updateRoute(location) {
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

    let tm = this.prevRoute && this._getChangeMatched(this.prevRoute, this.currentRoute, { count: 1 })[0];
    if (tm) {
      Object.keys(tm.viewInstances).forEach(key => tm.viewInstances[key]._refreshCurrentRoute());
    } else if (this.viewRoot) this.viewRoot._refreshCurrentRoute();

    this._callEvent('onRouteChange', this.currentRoute, this);
  }

  push(to, onComplete, onAbort) {
    return this._push(to, onComplete, onAbort);
  }

  replace(to, onComplete, onAbort) {
    return this._replace(to, onComplete, onAbort);
  }

  redirect(to, onComplete, onAbort, onInit, from) {
    to = normalizeLocation(to);
    to.isRedirect = true;
    to.redirectedFrom = from || this.currentRoute;
    return to.isReplace
      ? this._replace(to, onComplete, onAbort, onInit)
      : this._push(to, onComplete, onAbort, onInit);
  }

  go(n) {
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

  beforeEach(guard) {
    if (!guard || typeof guard !== 'function') return;
    let i = this.beforeEachGuards.indexOf(guard);
    if (~i) this.beforeEachGuards.splice(i, 1);
    guard.global = true;
    this.beforeEachGuards.push(guard);
  }

  afterEach(guard) {
    if (!guard || typeof guard !== 'function') return;
    let i = this.afterEachGuards.indexOf(guard);
    if (~i) this.afterEachGuards.splice(i, 1);
    guard.global = true;
    this.afterEachGuards.push(guard);
  }

  addRoutes(routes, parentRoute, name = 'default') {
    if (!routes) return;
    if (!Array.isArray(routes)) routes = [routes];
    routes = normalizeRoutes(routes, parentRoute);
    const children = parentRoute ? parentRoute.children : this.routes;
    if (!children) return;
    routes.forEach(r => {
      let i = children.findIndex(v => v.path === r.path);
      if (~i) children.splice(i, 1, r);
      else children.push(r);
    });
    if (parentRoute && parentRoute.viewInstances[name]) parentRoute.viewInstances[name].setState({ routes });
    else if (this.state.viewRoot) this.state.viewRoot.setState({ routes });
  }

  parseQuery(query) {
    return config.parseQuery(query);
  }

  stringifyQuery(obj) {
    return config.stringifyQuery(obj);
  }

  onError(callback) {
    this.errorCallback = callback;
  }

  install(ReactVueLike, { App }) {
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
      onRouteChange: ReactVueLike.action(`[react-view-router][${this.id}]onRouteChange`, function (newVal) {
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
