import { createHashHistory, createBrowserHistory, createMemoryHistory } from 'history-fix';
import qs from './qs';
import {
  normalizeRoutes,
  normalizeLocation, matchRoutes,
  isFunction, isLocation,
  nextTick
} from './util';
import routeCache from './route-cache';
import { resolveRouteLazyList } from './route-lazy';

export async function routetInterceptors(interceptors, to, from, next) {
  async function routetInterceptor(interceptor, index, to, from, next) {
    if (!interceptor) return await next();
    return await interceptor(to, from, async f1 => {
      if (f1 !== undefined && f1 !== true && typeof f1 !== 'function') return await next(f1);
      if (typeof f1 === 'boolean') f1 = undefined;
      interceptor = interceptors[++index];
      return interceptor
        ? await routetInterceptor(
          interceptor,
          index,
          to,
          from,
          f2 => next(res => (isFunction(f2) && f2(res)) || (isFunction(f1) && f1(res)))
        )
        : await next(res => isFunction(f1) && f1(res));
    });
  }
  if (next) {
    return await routetInterceptor(interceptors[0], 0, to, from,
      f => (isFunction(f) ? next(res => f && f(res)) : next(f)));
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
    const ret = [];
    if (from) {
      const fm = this._getChangeMatched(from, to);
      ret.push(...this._getRouteComponentGurads(fm, 'beforeLeave', true));
    }
    if (to) {
      const tm = this._getChangeMatched(to, from);
      ret.push(...this._getRouteComponentGurads(tm, 'beforeEnter'));

      tm.forEach(r => {
        r.config._pending.afterEnterGuards = this._getComponentGurads(r, 'afterEnter', false).map(v => (function () {
          return v.call(this, to, from);
        }));
      });
    }
    ret.push(...this.beforeEachGuards);
    return ret.flat();
  }

  _getRouteUpdateGuards(to, from) {
    const ret = [];
    to && to.matched.some((tr, i) => {
      let guards = [];
      let fr = from.matched[i];
      if (!fr || fr.path !== tr.path) return true;
      if (fr.config.beforeUpdate) guards.push(fr.config.beforeUpdate);
      guards.push(...this._getComponentGurads(tr, 'beforeUpdate'));
      if (fr.componentInstance) guards = guards.map(v => v.bind(fr.componentInstance));
      ret.push(...guards);
    });
    return ret.flat().reverse();
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
        const toLast = to.matched.length && to.matched[to.matched.length - 1];
        if (isFunction(ok) && toLast && !toLast.redirect) {
          const cb = ok;
          toLast.config._pending.completeCallback = el => cb(el);
          ok = true;
        }
        callback(isContinue);
        if (!isContinue) {
          if (isLocation(ok)) this.replace(ok);
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

  createRoute(to) {
    const matched = matchRoutes(this.routes, to);
    const last = matched.length ? matched[matched.length - 1] : null;
    const from = this.currentRoute;
    function copyInstance(to, from) {
      if (!from) return;
      if (from.componentInstance) to.componentInstance = from.componentInstance;
      if (from.viewInstance) to.viewInstance = from.viewInstance;
    }
    const ret = last ? {
      ...last.match,
      query: to.search ? qs.parseQuery(to.search.substr(1)) : {},
      path: to.pathname,
      fullPath: `${to.path}${to.search}`,
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
      meta: last.route.meta || {}
    } : null;
    if (to.isRedirect) ret.redirectedFrom = from.redirectedFrom || from;
    return ret;
  }

  updateRoute(to) {
    if (!to) to = this.history.location;
    this.currentRoute = this.createRoute(to);
  }

  push(to, onComplete, onAbort) {
    if (isFunction(onComplete)) to.onComplete = onComplete;
    if (isFunction(onAbort)) to.onAbort = onAbort;
    this.history.push(normalizeLocation(to));
  }

  replace(to, onComplete, onAbort) {
    if (isFunction(onComplete)) to.onComplete = onComplete;
    if (isFunction(onAbort)) to.onAbort = onAbort;
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
