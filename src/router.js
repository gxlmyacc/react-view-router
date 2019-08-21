import { createHashHistory, createBrowserHistory, createMemoryHistory } from 'history-fix';
import qs from './qs';
import {
  normalizeRoutes, normalizeLocation, resolveRedirect,
  matchRoutes,  isFunction, isLocation, nextTick, once
} from './util';
import routeCache from './route-cache';
import { resolveRouteLazyList } from './route-lazy';

export async function routetInterceptors(interceptors, to, from, next) {
  function isBlock(v) {
    return v === false || typeof v === 'string' || isLocation(v) || v instanceof Error;
  }
  async function routetInterceptor(interceptor, index, to, from, next) {
    if (!interceptor) return next();
    return await interceptor(to, from, async f1 => {
      let nextInterceptor = interceptors[++index];
      if (isBlock(f1) || !nextInterceptor) return next(f1);
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

    this.mode = options.mode;
    this.basename = options.basename;
    this.routes = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.currentRoute = null;
    this.viewRoot = null;
    this.listenerInstalled = false;
    this.history.listen(location => this.updateRoute(location));
    this.history.block(location => routeCache.create(location));

    Object.keys(this.history).forEach(key => !HISTORY_METHODS.includes(key) && (this[key] = this.history[key]));
    HISTORY_METHODS.forEach(key => this[key] && (this[key] = this[key].bind(this)));
    this.nextTick = nextTick.bind(this);

    this.use(options);
  }

  use({ routes, parseQuery, stringifyQuery }) {
    if (routes) {
      this.routes = routes ? normalizeRoutes(routes) : [];
      this.updateRoute(this.history.location);
    }

    if (parseQuery) qs.parseQuery = parseQuery;
    if (stringifyQuery) qs.stringifyQuery = stringifyQuery;
  }

  _getComponentGurads(r, guardName, bindInstance = true) {
    let ret = [];
    const componentInstance = r.componentInstance;
    if (r.config) r = r.config;
    const guards = r.guards && r.guards[guardName];
    if (!guards || !guards || !guards.length) return ret;
    ret.push(...guards);
    if (bindInstance && componentInstance) ret = ret.map(v => v.bind(componentInstance));
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
      const fm = this._getChangeMatched(from, to);
      ret.push(...this._getRouteComponentGurads(fm, 'beforeLeave', true));
    }
    if (to) {
      const tm = this._getChangeMatched(to, from);
      tm.forEach(r => {
        let guards = this._getComponentGurads(r, 'beforeEnter', false);
        guards = guards.map(v => (function (to, from, next) {
          return v(to, from, cb => {
            if (isFunction(cb)) {
              const _cb = cb;
              r.config._pending.completeCallback = el => _cb(el);
              cb = undefined;
            }
            return next(cb);
          });
        }));
        ret.push(...guards);
      });

      tm.forEach(r => {
        r.config._pending.afterEnterGuards = this._getComponentGurads(r, 'afterEnter', false).map(v => (function () {
          return v.call(this, to, from);
        }));
      });
    }
    return ret.flat();
  }

  _getRouteUpdateGuards(to, from) {
    const ret = [];
    const fm = [];
    to && to.matched.some((tr, i) => {
      let fr = from.matched[i];
      if (!fr || fr.path !== tr.path) return true;
      fm.push(fr);
    });
    ret.push(...this._getRouteComponentGurads(fm, 'beforeUpdate', true));
    return ret;
  }

  _getAfterEachGuards(to, from) {
    const ret = [];
    if (from) {
      const fm = this._getChangeMatched(from, to);
      ret.push(...this._getRouteComponentGurads(fm, 'afterLeave', true));
    }
    // if (to) {
    //   const tm = this._getChangeMatched(to, from);
    // }
    ret.push(...this.afterEachGuards);
    return ret.flat();
  }

  async _handleRouteInterceptor(location, callback, isInit = false) {
    if (typeof location === 'string') location = routeCache.flush(location);
    if (!location) return callback(true);
    let isContinue = false;
    try {
      const to = this.createRoute(location);
      const from = isInit ? null : this.currentRoute;

      await resolveRouteLazyList(to && to.matched);

      routetInterceptors(this._getBeforeEachGuards(to, from), to, from, ok => {
        if (ok && typeof ok === 'string') ok = { path: ok };
        isContinue = Boolean(ok === undefined || (ok && !(ok instanceof Error) && !isLocation(ok)));

        const toLast = to.matched[to.matched.length - 1];
        if (isContinue && toLast && toLast.redirect) {
          ok = resolveRedirect(toLast.redirect, toLast);
          isContinue = false;
        }

        callback(isContinue);

        if (!isContinue) {
          if (isLocation(ok)) {
            if (to.onAbort) ok.onAbort = to.onAbort;
            if (to.onComplete) ok.onComplete = to.onComplete;
            return this.redirect(ok);
          }
          if (to && isFunction(to.onAbort)) to.onAbort(ok);
          return;
        }

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

  createRoute(to, from) {
    const matched = matchRoutes(this.routes, to);
    const last = matched.length ? matched[matched.length - 1] : null;
    if (!from) from = this.currentRoute;
    function copyInstance(to, from) {
      if (!from) return;
      if (from.componentInstance) to.componentInstance = from.componentInstance;
      if (from.viewInstance) to.viewInstance = from.viewInstance;
    }
    const { search, path, onAbort, onComplete } = to;
    const ret = last ? {
      ...last.match,
      query: search ? qs.parseQuery(to.search.substr(1)) : {},
      path,
      hash: search,
      fullPath: `${path}${search}`,
      matched: matched.map(({ route }, i) => {
        let ret = {};
        Object.keys(route).forEach(key => [
          'path', 'name', 'subpath', 'meta', 'redirect', 'alias'
        ].includes(key) && (ret[key] = route[key]));
        ret.config = route;

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
      }),
      meta: last.route.meta || {},
      onAbort,
      onComplete
    } : null;
    if (to.isRedirect && from) {
      ret.redirectedFrom = from.redirectedFrom || from;
      if (!ret.onAbort && from.onAbort) ret.onAbort = from.onAbort;
      if (!ret.onComplete && from.onComplete) ret.onComplete = from.onComplete;
    }
    return ret;
  }

  updateRoute(to) {
    if (!to) to = this.history.location;
    this.currentRoute = this.createRoute(to);
  }

  push(to, onComplete, onAbort) {
    if (isFunction(onComplete)) to.onComplete = once(onComplete);
    if (isFunction(onAbort)) to.onAbort = once(onAbort);
    this.history.push(normalizeLocation(to));
  }

  replace(to, onComplete, onAbort) {
    if (isFunction(onComplete)) to.onComplete = once(onComplete);
    if (isFunction(onAbort)) to.onAbort = once(onAbort);
    this.history.replace(normalizeLocation(to));
  }

  redirect(to, onComplete, onAbort) {
    to = normalizeLocation(to);
    to.isRedirect = true;
    return this.replace(to, onComplete, onAbort);
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


  parseQuery(query) {
    return qs.parseQuery(query);
  }

  stringifyQuery(obj) {
    return qs.stringifyQuery(obj);
  }
}
