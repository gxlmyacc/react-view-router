import { createHashHistory, createBrowserHistory, createMemoryHistory } from 'history-fix';
import config from './config';
import {
  flatten, isAbsoluteUrl,
  normalizeRoutes, normalizeLocation, resolveRedirect,
  matchRoutes, isFunction, isLocation, nextTick, once,
  afterInterceptors,
  innumerable
} from './util';
import routeCache from './route-cache';
import { RouteLazy, hasMatchedRouteLazy } from './route-lazy';
import { getGuardsComponent } from './route-guard';
import RouterLink from './router-link';

let ReactVueLike;
let nexting = null;

async function routetInterceptors(interceptors, to, from, next) {
  function isBlock(v, interceptor) {
    let _isLocation = typeof v === 'string' || isLocation(v);
    if (_isLocation && interceptor && interceptor.route) v = normalizeLocation(v, interceptor.route);
    return v === false || _isLocation || v instanceof Error;
  }
  async function routetInterceptor(interceptor, index, to, from, next) {
    while (interceptor && interceptor.lazy) interceptor = await interceptor(interceptors, index);
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
      } catch (ex) {
        console.error(ex);
        next(ex);
      }
    });
    return await interceptor(to, from, nextWrapper);
  }
  if (next) await routetInterceptor(interceptors[0], 0, to, from, next);
  else afterInterceptors(interceptors, to, from);
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
    this.plugins = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.currentRoute = null;
    this.viewRoot = null;

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

  plugin(plugin) {
    if (this.plugins.indexOf(plugin) < 0) this.plugins.push(plugin);
    return function () {
      const idx = this.plugins.indexOf(plugin);
      if (~idx) this.plugins.splice(idx, 1);
    };
  }

  get RouterLink() {
    if (this._RouterLink) return this._RouterLink;
    innumerable(this, '_RouterLink', RouterLink(this));
    return this._RouterLink;
  }

  _callEvent(event, ...args) {
    let plugin;
    try {
      let ret = this.plugins.map(p => {
        plugin = p;
        return p[event] && p[event].call(p, ...args);
      }).filter(v => v !== undefined);
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
      let ccg = cc && cc.prototype && cc.prototype[guardName];
      if (ccg) {
        if (ReactVueLike && !ccg.isMobxFlow && cc.__flows && cc.__flows.includes(guardName)) ccg = ReactVueLike.flow(ccg);
        ret.push(ccg);
      }

      if (cg) ret.push(cg);

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
    Object.keys(r.components).forEach(key => {
      const c = r.components[key];
      if (!c) return;

      if (c instanceof RouteLazy) {
        const lazyResovle = async (interceptors, index) => {
          let nc = await c.toResolve(r, key);
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

  _getChangeMatched(route, compare, count) {
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
      return count !== undefined && ret.length === count;
    });
    return ret.filter(r => !r.redirect);
  }

  _getBeforeEachGuards(to, from, current) {
    const ret = [...this.beforeEachGuards];
    if (from) {
      const fm = this._getChangeMatched(from, to)
        .filter(r => Object.keys(r.componentInstances).some(key => r.componentInstances[key]));
      ret.push(...this._getRouteComponentGurads(fm, 'beforeRouteLeave', true));
    }
    if (to) {
      let tm = this._getChangeMatched(to, from);
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

      if (from !== current) tm = this._getChangeMatched(to, current);
      tm.forEach(r => {
        const compGuards = {};
        const allGuards = this._getComponentGurads(
          r,
          'afterRouteEnter',
          (fn, name) => {
            if (!compGuards[name]) compGuards[name] = [];
            compGuards[name].push(function () {
              return fn.call(this, to, current);
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

  async _handleRouteInterceptor(...args) {
    this._callEvent('onRouteing', true);
    try {
      return await this._internalHandleRouteInterceptor(...args);
    } finally {
      this._callEvent('onRouteing', false);
    }
  }

  async _internalHandleRouteInterceptor(location, callback, isInit = false) {
    if (typeof location === 'string') location = routeCache.flush(location);
    if (!location) return callback(true);
    let isContinue = false;
    try {
      const to = this.createRoute(location);
      const from = isInit ? null : to.redirectedFrom || this.currentRoute;
      const current = this.currentRoute;

      if (to && from && to.fullPath === from.fullPath) return callback(true);

      let fallbackView;
      if (hasMatchedRouteLazy(to.matched)) {
        fallbackView = this.viewRoot;
        this._getSameMatched(isInit ? null : this.currentRoute, to).reverse().some(m => {
          if (!m.viewInstances.default || !m.viewInstances.default.props.fallback) return;
          return fallbackView = m.viewInstances.default;
        });
      }

      fallbackView && fallbackView._updateResolving(true);
      routetInterceptors(this._getBeforeEachGuards(to, from, current), to, from, ok => {
        nexting = null;
        fallbackView && setTimeout(() => fallbackView._updateResolving(false), 0);

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
          if (!isInit && current.fullPath !== to.fullPath) routetInterceptors(this._getRouteUpdateGuards(to, current), to, current);
          if (to && isFunction(to.onComplete)) to.onComplete();
          routetInterceptors(this._getAfterEachGuards(to, current), to, current);
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
    if (nexting) return nexting(to);
    if (to.origin && isAbsoluteUrl(to.origin)) location.replace(to.origin);
    else this.history.replace(to);
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
      let ret = { componentInstances: {}, viewInstances: {} };
      Object.keys(route).forEach(key => [
        'path', 'name', 'subpath', 'meta', 'redirect', 'alias'
      ].includes(key) && (ret[key] = route[key]));
      ret.config = route;
      ret.url = match.url;
      ret.params = match.params;

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
    const current = this.currentRoute;
    this.currentRoute = this.createRoute(to, current);

    let tm = current && this._getChangeMatched(current, this.currentRoute, 1)[0];
    if (tm) {
      Object.keys(tm.viewInstances).forEach(key => tm.viewInstances[key]._refreshCurrentRoute());
    } else if (this.viewRoot) this.viewRoot._refreshCurrentRoute();

    this._callEvent('onRouteChange', this.currentRoute, this);
  }

  push(to, onComplete, onAbort) {
    to = normalizeLocation(to);
    if (isFunction(onComplete)) to.onComplete = once(onComplete);
    if (isFunction(onAbort)) to.onAbort = once(onAbort);
    if (nexting) return nexting(to);
    if (to.origin && isAbsoluteUrl(to.origin)) location.href = to.origin;
    else this.history.push(to);
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
    this.plugin({
      name: 'react-view-router-vue-like-plugin',
      onRouteChange: ReactVueLike.action('[react-view-router]onRouteChange', function (newVal) {
        if (app) app.$route = ReactVueLike.observable(newVal, {}, { deep: false });
        else Object.assign(App.inherits.$route, ReactVueLike.observable(newVal, {}, { deep: false }));
      })
    });
  }

}
