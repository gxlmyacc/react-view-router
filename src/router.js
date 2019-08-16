import { createHashHistory, createBrowserHistory, createMemoryHistory } from 'history-fix';
import qs from './qs';
import {
  resolveRouteLazyList, routeCache, normalizeRoutes,
  normalizeLocation, matchRoutes,
  isFunction, isLocation
} from './util';

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

    this.routes = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.currentRoute = null;
    this.history.listen(location => this.updateRoute(location));
    this.history.block(location => routeCache.create(location));

    Object.keys(this.history).forEach(key => !HISTORY_METHODS.includes(key) && (this[key] = this.history[key]));
    HISTORY_METHODS.forEach(key => this[key] && (this[key] = this[key].bind(this)));

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

  _getComponentGurads(r, guardName) {
    const ret = [];
    if (r.config) r = r.config;
    if (!r.routeGuards || !r.routeGuards[guardName] || !r.routeGuards[guardName].length) return ret;
    ret.push(...r.routeGuards[guardName]);
    return ret;
  }

  _getRouteComponentGurads(route, guardName, reverse = false) {
    const ret = [];
    route.matched.forEach(r => ret.push(...this._getComponentGurads(r, guardName)));
    return reverse ? ret.reverse() : ret;
  }

  _getBeforeEachGuards(to, from) {
    const ret = [];
    if (from) {
      ret.push(...this._getRouteComponentGurads(from, 'beforeRouteLeave', true));
      ret.push(...from.matched.filter(r => r.config.beforeLeave).map(r => r.config.beforeLeave).reverse());
    }
    if (to) {
      ret.push(...this._getRouteComponentGurads(to, 'beforeRouteEnter'));
      ret.push(...to.matched.filter(r => r.config.beforeEnter).map(r => r.config.beforeEnter));
    }
    ret.push(...this.beforeEachGuards);
    return ret;
  }

  _getAfterEachGuards(to, from) {
    const ret = [];
    if (from) {
      ret.push(...this._getRouteComponentGurads(from, 'afterRouteLeave', true));
      ret.push(...from.matched.filter(r => r.config.afterLeave).map(r => r.config.afterLeave).reverse());
    }
    if (to) {
      ret.push(...this._getRouteComponentGurads(from, 'afterRouteEnter'));
      ret.push(...from.matched.filter(r => r.config.afterEnter).map(r => r.config.afterEnter));
    }
    ret.push(...this.afterEachGuards);
    return ret;
  }

  _getRouteUpdateGuards(to, from) {
    const ret = [];
    to.matched.some((tr, i) => {
      let fr = from.matched[i];
      if (!fr || fr.path !== tr.path) return true;
      ret.push(...this._getComponentGurads(tr, 'beforeRouteUpdate'));
      if (fr.config.beforeUpdate) ret.push(fr.config.beforeUpdate);
    });
    return ret;
  }

  async _handleRouteInterceptor(location, callback) {
    if (typeof location === 'string') location = routeCache.flush(location);
    if (!location) return callback(true);
    let isContinue = false;
    try {
      const to = this._createRoute(location);
      const from = this.currentRoute;

      await resolveRouteLazyList(to && to.matched);

      routetInterceptors(this._getBeforeEachGuards(to, from), to, from, ok => {
        if (ok && typeof ok === 'string') ok = { path: ok };
        isContinue = Boolean(ok === undefined || (ok && !isLocation(ok)));
        callback(isContinue);
        if (!isContinue) {
          if (isLocation(ok)) this.replace(ok);
          if (to && isFunction(to.onAbort)) to.onAbort(isLocation(ok) ? ok : undefined);
          return;
        }
        if (isFunction(ok)) ok(to);
        if (to && isFunction(to.onComplete)) to.onComplete();
        routetInterceptors(this._getAfterEachGuards(to, from), to, from);
        routetInterceptors(this._getRouteUpdateGuards(to, from), to, from);
      });
    } catch (ex) {
      console.error(ex);
      if (!isContinue) callback(isContinue);
    }
  }

  _createRoute(location) {
    const matched = matchRoutes(this.routes, location.pathname);
    const last = matched.length ? matched[matched.length - 1] : null;
    return last ? {
      ...last.match,
      query: location.search ? qs.parseQuery(location.search.substr(1)) : {},
      path: location.pathname,
      matched: matched.map(v => {
        let ret = {};
        Object.keys(v.route).forEach(key => [
          'path', 'name', 'subpath', 'meta', 'redirect', 'alias'
        ].includes(key) && (ret[key] = v.route[key]));
        ret.config = v.route;
        return ret;
      }),
      meta: last.route.meta || {}
    } : null;
  }

  updateRoute(location) {
    if (!location) location = this.history.location;
    this.currentRoute = this._createRoute(location);
  }

  push(location, onComplete, onAbort) {
    if (isFunction(onComplete)) location.onComplete = onComplete;
    if (isFunction(onAbort)) location.onAbort = onAbort;
    this.history.push(normalizeLocation(location));
  }

  replace(location, onComplete, onAbort) {
    if (isFunction(onComplete)) location.onComplete = onComplete;
    if (isFunction(onAbort)) location.onAbort = onAbort;
    this.history.replace(normalizeLocation(location));
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

  addRoutes(children, parentRoute) {
    if (!children) return;
    if (!parentRoute) parentRoute = { children: this.routes };
    if (!parentRoute.children) parentRoute.children = [];
    if (!Array.isArray(children)) children = [children];
    children = normalizeRoutes(children, parentRoute);
    children.forEach(r => {
      let i = parentRoute.children.findIndex(v => v.path === r.path);
      if (~i) parentRoute.children.splice(i, 1, r);
      else parentRoute.children.push(r);
    });
  }


  parseQuery(query) {
    return qs.parseQuery(query);
  }

  stringifyQuery(obj) {
    return qs.stringifyQuery(obj);
  }
}
