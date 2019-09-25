import { createHashHistory, createBrowserHistory, createMemoryHistory } from 'history-fix';
import config from './config';
import {
  flatten,
  normalizeRoutes, normalizeLocation, resolveRedirect,
  matchRoutes,  isFunction, isLocation, nextTick, once
} from './util';
import routeCache from './route-cache';
import { resolveRouteLazyList, hasRouteLazy } from './route-lazy';
import { getGuardsComponent } from './route-guard';

let ReactVueLike;
let nexting = null;

export async function routetInterceptors(interceptors, to, from, next) {
  function isBlock(v, interceptor) {
    let _isLocation = typeof v === 'string' || isLocation(v);
    if (_isLocation && interceptor && interceptor.route) v = normalizeLocation(v, interceptor.route);
    return v === false || _isLocation || v instanceof Error;
  }
  async function routetInterceptor(interceptor, index, to, from, next) {
    if (!interceptor) return next();
    const nextWrapper = nexting = once(async f1 => {
      let nextInterceptor = interceptors[++index];
      if (isBlock(f1, interceptor) || !nextInterceptor) return next(f1);
      if (typeof f1 === 'boolean') f1 = undefined;
      try {
        return nextInterceptor
          ? await routetInterceptor(
            nextInterceptor,
            index,
            to,
            from,
            next
          )
          : next(res => isFunction(f1) && f1(res));
      } catch (ex) { next(ex); }
    });
    return await interceptor(to, from, nextWrapper);
  }
  if (next) {
    return await routetInterceptor(interceptors[0], 0, to, from, next);
  }

  for (let interceptor of interceptors) {
    interceptor && await interceptor(to, from);
  }
}

const HISTORY_METHODS = ['push', 'replace', 'go', 'back', 'goBack', 'forward', 'goForward', 'block'];

export default class ReactViewRouter {

  constructor(options = {}) {
    if (!options.mode) options.mode = 'hash';
    options.getUserConfirmation = this._handleRouteInterceptor.bind(this);

    if (options.base) options.basename = options.base;
    if (options.history) {
      if (options.history instanceof ReactViewRouter) {
        this.history = options.history.history;
        this.mode = options.history.mode;
      } else this.history = options.history;
    } else {
      switch (options.mode) {
        case 'browser':
        case 'history':
          this.history = createBrowserHistory(options);
          break;
        case 'memory':
        case 'abstract':
          this.history = createMemoryHistory(options);
          break;
        default: this.history = createHashHistory(options);
      }
    }

    this.mode = options.mode;
    this.basename = options.basename || '';
    this.routes = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.currentRoute = null;
    this.viewRoot = null;
    this.routeChangeListener = [];
    this.routeingListener = [];

    this._unlisten = this.history.listen(location => this.updateRoute(location));
    this.history.block(location => routeCache.create(location));

    Object.keys(this.history).forEach(key => !HISTORY_METHODS.includes(key) && (this[key] = this.history[key]));
    HISTORY_METHODS.forEach(key => this[key] && (this[key] = this[key].bind(this)));
    this.nextTick = nextTick.bind(this);

    this.use(options);
  }

  use({ routes, parseQuery, stringifyQuery, inheritProps, install }) {
    if (routes) {
      this.routes = routes ? normalizeRoutes(routes) : [];
      this.updateRoute(this.history.location);
    }

    if (inheritProps !== undefined) config.inheritProps = inheritProps;

    if (parseQuery) config.parseQuery = parseQuery;
    if (stringifyQuery) config.stringifyQuery = stringifyQuery;

    if (install) this.install = install.bind(this);
  }

  _getComponentGurads(r, guardName, bindInstance = true) {
    let ret = [];
    const componentInstances = r.componentInstances;
    // route config
    const routeGuardName = guardName.replace('Route', '');
    if (r.config) r = r.config;
    const guards = r[routeGuardName];
    if (guards) ret.push(guards);

    // route component
    Object.keys(r.components).forEach(key => {
      let g = [];
      const c = r.components[key];
      if (!c) return;
      const cc = c.__component ? getGuardsComponent(c, true) : c;
      const cg = c.__guards && c.__guards[guardName];
      let ccg = cc && cc.prototype && cc.prototype[guardName];
      if (ccg) {
        if (ReactVueLike && !ccg.isMobxFlow && cc.__flows && cc.__flows.includes(guardName)) ccg = ReactVueLike.flow(ccg);
        g.push(ccg);
      }
      if (cg) g.push(cg);

      const ci = componentInstances[key];
      if (bindInstance) {
        if (isFunction(bindInstance)) g = g.map(v => bindInstance(v, key, ci, r)).filter(Boolean);
        else if (ci) g = g.map(v => v.bind(ci));
      }
      ret.push(...g);
    });

    ret.forEach(v => v.route = r);

    return flatten(ret);
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
    return ret;
  }

  _getChangeMatched(route, compare) {
    const ret = [];
    if (!compare) return [...route.matched];
    let start = false;
    route && route.matched.some((tr, i) => {
      let fr = compare.matched[i];
      if (!start) {
        start = !fr || fr.path !== tr.path;
        if (!start) return;
      }
      ret.push(tr);
    });
    return ret;
  }

  _getBeforeEachGuards(to, from) {
    const ret = [...this.beforeEachGuards];
    if (from) {
      const fm = this._getChangeMatched(from, to).filter(r => Object.keys(r.componentInstances).some(v => v));
      ret.push(...this._getRouteComponentGurads(fm, 'beforeRouteLeave', true));
    }
    if (to) {
      const tm = this._getChangeMatched(to, from);
      tm.forEach(r => {
        let guards = this._getComponentGurads(
          r,
          'beforeRouteEnter',
          (fn, name) => (function (to, from, next) {
            return fn(to, from, cb => {
              if (isFunction(cb)) {
                const _cb = cb;
                r.config._pending.completeCallbacks[name] = el => _cb(el);
                cb = undefined;
              }
              return next(cb);
            });
          })
        );
        ret.push(...guards);
      });

      tm.forEach(r => {
        const compGuards = {};
        const allGuards = this._getComponentGurads(
          r,
          'afterRouteEnter',
          (fn, name) => {
            if (!compGuards[name]) compGuards[name] = [];
            compGuards[name].push(function () {
              return fn.call(this, to, from);
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
    ret.push(...this._getRouteComponentGurads(fm, 'beforeRouteUpdate', true));
    return ret;
  }

  _getAfterEachGuards(to, from) {
    const ret = [];
    if (from) {
      const fm = this._getChangeMatched(from, to).filter(r => Object.keys(r.componentInstances).some(v => v));
      ret.push(...this._getRouteComponentGurads(fm, 'afterRouteLeave', true));
    }
    // if (to) {
    //   const tm = this._getChangeMatched(to, from);
    // }
    ret.push(...this.afterEachGuards);
    return flatten(ret);
  }

  async _handleRouteInterceptor(...args) {
    this.routeingListener.forEach(handler => handler(true));
    try {
      return await this._internalHandleRouteInterceptor(...args);
    } finally {
      this.routeingListener.forEach(handler => handler(false));
    }
  }

  async _internalHandleRouteInterceptor(location, callback, isInit = false, defaultFallbackView) {
    if (typeof location === 'string') location = routeCache.flush(location);
    if (!location) return callback(true);
    let isContinue = false;
    try {
      let to = this.createRoute(location);
      const from = isInit ? null : to.redirectedFrom || this.currentRoute;

      let fallbackView = defaultFallbackView;
      if (hasRouteLazy(to.matched)) {
        this._getSameMatched(isInit ? null : this.currentRoute, to).reverse().some(m => {
          if (m.viewInstance && m.viewInstance.props.fallback) fallbackView = m.viewInstance;
          return fallbackView;
        });
      }

      fallbackView && fallbackView._updateResolving(true);
      try {
        if (await resolveRouteLazyList(to.matched)) to = this.createRoute(location);
      } finally {
        fallbackView && setTimeout(() => fallbackView._updateResolving(false), 0);
      }

      // const toLast = to.matched[to.matched.length - 1];
      // if (toLast && toLast.config.exact && toLast.redirect) {
      //   let newTo = resolveRedirect(toLast.redirect, toLast, to);
      //   if (newTo) {
      //     callback(false);
      //     if (newTo.onAbort) newTo.onAbort = to.onAbort;
      //     if (newTo.onComplete) newTo.onComplete = to.onComplete;
      //     return this.redirect(newTo, null, null, to.onInit || (isInit ? callback : null));
      //   }
      // }

      routetInterceptors(this._getBeforeEachGuards(to, from), to, from, ok => {
        nexting = null;

        if (ok && typeof ok === 'string') ok = { path: ok };
        isContinue = Boolean(ok === undefined || (ok && !(ok instanceof Error) && !isLocation(ok)));

        const toLast = to.matched[to.matched.length - 1];
        if (isContinue && toLast && toLast.config.exact && toLast.redirect) {
          ok = resolveRedirect(toLast.redirect, toLast, to);
          if (ok) isContinue = false;
        }

        callback(isContinue);

        if (!isContinue) {
          if (isLocation(ok)) {
            if (to.onAbort) ok.onAbort = to.onAbort;
            if (to.onComplete) ok.onComplete = to.onComplete;
            return this.redirect(ok, null, null, to.onInit || (isInit ? callback : null), to);
          }
          if (to && isFunction(to.onAbort)) to.onAbort(ok);
          return;
        }

        if (to.onInit) to.onInit(to);

        this.nextTick(() => {
          if (isFunction(ok)) ok(to);
          if (!isInit && from.fullPath !== to.fullPath) routetInterceptors(this._getRouteUpdateGuards(to, from), to, from);
          if (to && isFunction(to.onComplete)) to.onComplete();
          routetInterceptors(this._getAfterEachGuards(to, from), to, from);
        });
      });
    } catch (ex) {
      console.error(ex);
      if (!isContinue) callback(isContinue);
    }
  }

  _replace(to, onComplete, onAbort, onInit) {
    to = normalizeLocation(to);
    if (isFunction(onComplete)) to.onComplete = once(onComplete);
    if (isFunction(onAbort)) to.onAbort = once(onAbort);
    if (onInit) to.onInit = onInit;
    nexting ? nexting(to) : this.history.replace(to);
  }

  getMatched(to, from, parent) {
    if (!from) from = this.currentRoute;
    function copyInstance(to, from) {
      if (!from) return;
      if (from.componentInstances) to.componentInstances = from.componentInstances;
      if (from.viewInstance) to.viewInstance = from.viewInstance;
    }
    let matched = matchRoutes(this.routes, to, parent);
    return matched.map(({ route, match }, i) => {
      let ret = { componentInstances: {} };
      Object.keys(route).forEach(key => [
        'path', 'name', 'subpath', 'meta', 'redirect', 'alias'
      ].includes(key) && (ret[key] = route[key]));
      ret.config = route;
      ret.url = match.url;
      ret.params = match.params;

      if (from) {
        const fr = from.matched[i];
        if (!i) copyInstance(ret, fr);
        else {
          const pfr = from.matched[i - 1];
          const ptr = matched[i - 1];
          if (pfr && ptr && pfr.path === ptr.route.path) copyInstance(ret, fr);
        }
      }
      return ret;
    });
  }

  getMatchedComponents(to, from, parent) {
    return this.getMatched(to, from, parent).map(r => r.componentInstances.default).filter(Boolean);
  }

  getMatchedViews(to, from, parent) {
    return this.getMatched(to, from, parent).map(r => r.viewInstance).filter(Boolean);
  }

  createRoute(to, from) {
    if (!from) from = to.redirectedFrom || this.currentRoute;
    const matched = this.getMatched(to, from);
    const last = matched.length ? matched[matched.length - 1] : { url: '', params: {}, meta: {} };

    const { search, query, path, onAbort, onComplete } = to;
    const ret = Object.assign({
      url: last.url,
      basename: this.basename,
      path,
      fullPath: `${path}${search}`,
      query: query || (search ? config.parseQuery(to.search.substr(1)) : {}),
      params: last.params || {},
      matched,
      meta: last.meta || {},
      onAbort,
      onComplete
    });
    if (to.isRedirect && from) {
      ret.redirectedFrom = from;
      if (!ret.onAbort && from.onAbort) ret.onAbort = from.onAbort;
      if (!ret.onComplete && from.onComplete) ret.onComplete = from.onComplete;
      if (!ret.onInit && to.onInit) ret.onInit = to.onInit;
    }
    return ret;
  }

  updateRoute(to) {
    if (!to) to = this.history.location;
    this.currentRoute = this.createRoute(to);
    this.routeChangeListener.forEach(handler => handler(this.currentRoute, this));
  }

  push(to, onComplete, onAbort) {
    to = normalizeLocation(to);
    if (isFunction(onComplete)) to.onComplete = once(onComplete);
    if (isFunction(onAbort)) to.onAbort = once(onAbort);
    nexting ? nexting(to) : this.history.push(to);
  }

  replace(to, onComplete, onAbort) {
    return this._replace(to, onComplete, onAbort);
  }

  redirect(to, onComplete, onAbort, onInit, from) {
    to = normalizeLocation(to);
    to.isRedirect = true;
    to.redirectedFrom = from || this.currentRoute;
    return this._replace(to, onComplete, onAbort, onInit);
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
    this.beforeEachGuards.push(guard);
  }

  afterEach(guard) {
    if (!guard || typeof guard !== 'function') return;
    let i = this.afterEachGuards.indexOf(guard);
    if (~i) this.afterEachGuards.splice(i, 1);
    this.afterEachGuards.push(guard);
  }

  addRoutes(routes, parentRoute) {
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
    if (parentRoute && parentRoute.viewInstance) parentRoute.viewInstance.setState({ routes });
    else if (this.state.viewRoot) this.state.viewRoot.setState({ routes });
  }

  onRouteing(handler) {
    if (this.routeingListener.indexOf(handler) < 0) this.routeingListener.push(handler);
    return function () {
      const idx = this.routeingListener.indexOf(handler);
      if (~idx) this.routeingListener.splice(idx, 1);
    };
  }

  onRouteChange(handler) {
    if (this.routeChangeListener.indexOf(handler) < 0) this.routeChangeListener.push(handler);
    return function () {
      const idx = this.routeChangeListener.indexOf(handler);
      if (~idx) this.routeChangeListener.splice(idx, 1);
    };
  }

  parseQuery(query) {
    return config.parseQuery(query);
  }

  stringifyQuery(obj) {
    return config.stringifyQuery(obj);
  }

  install(_ReactVueLike, { App }) {
    ReactVueLike = _ReactVueLike;

    if (!App.inherits) App.inherits = {};
    App.inherits.$router = this;
    App.inherits.$route = ReactVueLike.observable(this.currentRoute || {});

    config.inheritProps = false;

    let app;
    ReactVueLike.config.inheritMergeStrategies.$route = function (parent, child, vm) {
      if (vm._isVueLikeRoot) {
        vm.$set(vm, '$route', parent);
        app = vm;
      } else {
        vm.$computed(vm, '$route', function () {
          return this.$root ? this.$root.$route : null;
        });
      }
    };
    this.onRouteChange(ReactVueLike.action('[react-view-router]onRouteChange', newVal => {
      if (app) app.$route = ReactVueLike.observable(newVal, {}, { deep: false });
      else Object.assign(App.inherits.$route, ReactVueLike.observable(newVal, {}, { deep: false }));
    }));
  }

}
