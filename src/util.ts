import React from 'react';
import config from './config';
import { RouteLazy } from './route-lazy';
import { REACT_FORWARD_REF_TYPE, getGuardsComponent } from './route-guard';
import matchPath, { computeRootMatch } from './match-path';
import {
  ConfigRouteArray, RouteIndexFn, ConfigRoute, MatchedRoute, RouteHistoryLocation, Route,
  RouteAfterGuardFn, RouteGuardInterceptor, lazyResovleFn, RouteRedirectFn, RouteLocation,
  matchPathResult, NormalizeRouteOptions, RouteGuardsInfoHooks, UserConfigRoute
} from './types';
import { ReactViewContainer, RouterViewComponent as RouterView, RouterViewWrapper  } from './router-view';
import ReactViewRouter from '.';
import { HistoryFix } from './history-fix';

function nextTick(cb: () => void, ctx?: object) {
  if (!cb) return;
  return new Promise(function (resolve) {
    setTimeout(() => resolve(ctx ? cb.call(ctx) : cb()), 0);
  });
}

function readonly(obj: object,
  key: string,
  value: any,
  options: PropertyDescriptor = { configurable: true, enumerable: true }) {
  Object.defineProperty(obj, key, { get() { return value; }, ...options });
  return obj;
}

function innumerable(
  obj: object,
  key: string,
  value: any,
  options: PropertyDescriptor = { configurable: true }
) {
  Object.defineProperty(obj, key, { value, ...options });
  return obj;
}

function normalizePath(path: string) {
  const paths = path.split('/');
  if (paths.length > 2 && !paths[paths.length - 1]) paths.splice(paths.length - 1, 1);
  for (let i = paths.length - 1; i > -1; i--) {
    if (paths[i + 1] === '..') paths.splice(i, 2);
    else if (paths[i] === '.') paths.splice(i, 1);
  }
  return paths.join('/').replace(/\/{2,}/, '/');
}

function normalizeRoute(
  route: UserConfigRoute,
  parent?: ConfigRoute | null,
  options: NormalizeRouteOptions = {}
): ConfigRoute {
  let routePath = route.path || '/';
  let path = normalizePath(parent ? `${parent.path}${routePath === '/' ? '' : '/'}${routePath.replace(/^(\/)/, '')}` : routePath);
  let r: Partial<any> = {
    ...route,
    subpath: routePath,
    path: parent
      ? path
      : path[0] === '/'
        ? path
        : `/${path}`,
    depth: parent ? (parent.depth + 1) : 0
  };
  if (parent) innumerable(r, 'parent', parent);
  if (!r.children) r.children = [];
  if (isFunction(r.children)) {
    if (!(r.children as RoutesHandler)._normalized) {
      const fn: Function = r.children;
      const ctx = {};
      r.children = function () { return fn.apply(ctx, arguments); };
      Object.getOwnPropertyNames(fn).forEach(key => {
        const p =  Object.getOwnPropertyDescriptor(fn, key);
        p && Object.defineProperty(r.children, key, p);
      });
      innumerable(r.children, '_ctx', ctx);
      innumerable(r.children, '_normalized', true);
    }
  } else {
    innumerable(r, 'children', normalizeRoutes(r.children, r as ConfigRoute, options));
  }
  r.exact = r.exact !== undefined ? r.exact : Boolean(r.redirect || r.index);
  if (!r.components) r.components = {};
  if (r.component) {
    r.components.default = r.component;
    delete r.component;
  }
  Object.keys(r.components).forEach(key => {
    let comp = (r as ConfigRoute).components[key];
    if (comp instanceof RouteLazy) {
      (comp as RouteLazy).updaters.push(c => {
        if (c && c.__children) {
          let children = c.__children || [];
          if (isFunction(children)) children = (children as ((r: any) => any[]))(r) || [];
          innumerable(r, 'children', normalizeRoutes(children as ConfigRouteArray, r as ConfigRoute));
          r.exact = !(r as ConfigRoute).children.length;
        }
        return (r as ConfigRoute).components[key] = c;
      });
    }
  });
  readonly(r, 'meta', r.meta || {});
  if (r.props) innumerable(r, 'props', normalizeProps(r.props));
  if (r.paramsProps) innumerable(r, 'paramsProps', normalizeProps(r.paramsProps));
  if (r.queryProps) innumerable(r, 'queryProps', normalizeProps(r.queryProps));
  innumerable(r, '_pending', { completeCallbacks: {} });
  return r as ConfigRoute;
}

function walkRoutes(
  routes: ConfigRouteArray,
  walkFn: (route: ConfigRoute, routeIndex: number, routes: ConfigRouteArray) => boolean|void
): boolean {
  return routes.some((route, routeIndex) => {
    if (walkFn(route, routeIndex, routes)) return true;
    if (!route.children || !Array.isArray(route.children)) return;
    return walkRoutes(route.children, walkFn);
  });
}

function normalizeRoutes(
  routes: UserConfigRoute[],
  parent?: ConfigRoute | null,
  options: NormalizeRouteOptions = {}
) {
  if (!routes) routes = [] as ConfigRouteArray;
  if (!options.force && (routes as ConfigRouteArray)._normalized) return routes as ConfigRouteArray;
  routes = routes.map((route: any) => route && normalizeRoute(route, parent, options)).filter(Boolean);
  Object.defineProperty(routes, '_normalized', { value: true });
  return routes as ConfigRouteArray;
}

function normalizeRoutePath(
  path: string,
  route?: Route|MatchedRoute|ConfigRoute|RouteHistoryLocation|RouteLocation|null,
  append?: boolean,
  basename = ''
) {
  if (isAbsoluteUrl(path)) return path;
  if (isRoute(route)) route = route.matched[route.matched.length - 1];
  if (!path || ['/', '#'].includes(path[0]) || !route) return normalizePath(basename + (path || ''));
  if (isMatchedRoute(route)) route = route.config;
  let parent: any = (append || /^\.\//.test(path)) ? route : ((route as ConfigRoute).parent || { path: '' });
  while (parent && path[0] !== '/') {
    path = `${parent.path}/${path}`;
    parent = (route as ConfigRoute).parent;
  }
  if (basename && path[0] === '/') path = basename + path;
  return normalizePath(path);
}

function resloveIndex(_index: string | RouteIndexFn, routes: ConfigRouteArray): ConfigRoute | null {
  let index = isFunction(_index) ? (_index as RouteIndexFn)(routes) : _index;
  if (!index) return null;

  let r = routes.find((r: ConfigRoute) => {
    let path1 = r.subpath[0] === '/' ? r.subpath : `/${r.subpath}`;
    let path2 = (index as string)[0] === '/' ? index : `/${index}`;
    return path1 === path2;
  }) || null;
  if (r && r.index) {
    if (r.index === _index) return null;
    return resloveIndex(r.index, routes);
  }
  return r;
}


type RouteBranchInfo = { route: any, match: matchPathResult };
interface RouteBranchArray extends Array<RouteBranchInfo> {
  unmatchedPath?: string
}

type RoutesHandlerCacheHandler = (props: {
  to: RouteHistoryLocation | Route | string,
  parent?: ConfigRoute,
  level: number,
  prevChildren?: ConfigRouteArray
}) => boolean;
interface RoutesHandler {
  (r: {
    to: RouteHistoryLocation,
    parent?: ConfigRoute,
    branch: RouteBranchArray,
    prevChildren?: ConfigRouteArray
  }): ConfigRouteArray;
  _ctx?: Partial<any>;
  _normalized?: boolean;
  cache?: boolean | RoutesHandlerCacheHandler;
}

function matchRoutes(
  routes: ConfigRouteArray | RoutesHandler,
  to: RouteHistoryLocation | Route | string,
  parent?: ConfigRoute,
  branch: RouteBranchArray = [],
  level: number = 0
) {
  to = normalizeLocation(to) as RouteHistoryLocation;
  if (!to || to.path === '') return [];

  if (isFunction(routes)) {
    let fn = (routes as RoutesHandler);

    let cache = fn._ctx && fn._ctx.prevChildren && fn.cache;
    if (cache && isFunction(cache)) {
      cache = cache.call(fn._ctx, {
        to,
        parent,
        level,
        prevChildren: fn._ctx && fn._ctx.prevChildren
      });
    }

    if (cache) {
      routes = (fn._ctx && fn._ctx.prevChildren) || [];
    } else {
      routes = normalizeRoutes(fn({
        to,
        parent,
        branch,
        prevChildren: fn._ctx && fn._ctx.prevChildren
      }), parent);
      if (fn._ctx) fn._ctx.prevChildren = routes;
    }
  }

  (routes as ConfigRouteArray).some(route => {
    let match = route.path
      ? matchPath((to as RouteHistoryLocation).path, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        : computeRootMatch((to as RouteHistoryLocation).path); // use default "root" match

    if (match && route.index) {
      route = resloveIndex(route.index, routes as ConfigRouteArray) as ConfigRoute;
      if (!route) return;
      (to as RouteHistoryLocation).pathname = (to as RouteHistoryLocation).path = route.path;
      match = matchPath(route.path, route);
    }

    if (!match) return;

    branch.push({ route,  match });

    if (route.children
      && (route.children.length || isFunction(route.children))
    ) matchRoutes(route.children as any, to, route, branch, level + 1);

    return true;
  });

  if (!level && branch.length) {
    const lastRouteBranch = branch[branch.length - 1];
    branch.unmatchedPath = to.pathname.substr(lastRouteBranch.match.path.length, to.pathname.length);
  }

  return branch;
}

function normalizeLocation(
  to: any,
  route?: Route|MatchedRoute|ConfigRoute|RouteHistoryLocation|RouteLocation|null,
  {
    append = false,
    basename = '',
    mode = '',
    resolvePathCb
  }: {
    append?: boolean,
    basename?: string,
    mode?: string,
    resolvePathCb?: (path: string, to: RouteHistoryLocation) => string
  } = {}
): RouteHistoryLocation | null {
  if (!to || (isPlainObject(to) && !to.path && !to.pathname)) return null;
  if (to._routeNormalized) return to;
  if (typeof to === 'string') {
    const searchs = to.match(/\?[^#]+/g) || [];
    const pathname = searchs.reduce((p, v) => p.replace(v, ''), to);
    const search = searchs.reduce((p, v, i) => {
      if (!i) return v;
      const s = v.substr(1);
      return p + (s ? `&${s}` : '');
    }, '');
    to = { pathname, path: pathname, search, fullPath: to };
  }
  if (to.query) Object.keys(to.query).forEach(key => (to.query[key] === undefined) && (delete to.query[key]));
  else if (to.search) to.query = config.parseQuery(to.search);

  let isAbsolute = isAbsoluteUrl(to.pathname);
  if (isAbsolute && mode !== 'browser') {
    let hash = getCurrentPageHash(to.pathname);
    if (hash) {
      to.pathname = hash;
      isAbsolute = false;
    }
  }

  if (to.basename == null && basename) to.basename = to.absolute ? '' : basename;

  if (!isAbsolute) {
    let path = to.pathname || to.path;
    if (resolvePathCb) path = resolvePathCb(path, to);
    path = normalizeRoutePath(
      path,
      route,
      to.append || append,
      to.absolute ? '' : basename
    ) || '/';
    to.pathname = to.path = path;
  }
  Object.defineProperty(to, 'search', {
    enumerable: true,
    configurable: true,
    get() {
      return config.stringifyQuery(this.query);
    }
  });
  Object.defineProperty(to, 'fullPath', {
    enumerable: true,
    configurable: true,
    get() {
      return `${this.path}${this.search || ''}` || '/';
    }
  });
  if (!to.query) to.query = {};
  innumerable(to, '_normalized', true);
  return to;
}

const _toString = Object.prototype.toString;
function isPlainObject(obj: any): obj is { [key: string]: any } {
  return _toString.call(obj) === '[object Object]';
}
function isFunction(value: any): value is Function {
  return typeof value === 'function';
}
function isNull(value: any): value is (null | undefined) {
  return value === null || value === undefined;
}
function isMatchedRoute(value: any): value is MatchedRoute {
  return Boolean(value && value.config);
}
function isLocation(v: any): v is RouteLocation {
  return isPlainObject(v) && (v.path || v.pathname);
}
function isHistoryLocation(v: any): v is RouteHistoryLocation {
  return isLocation(v) && Boolean(v._routeNormalized);
}

function normalizeProps(props: { [key: string]: any } | any[]) {
  let res: { [key: string]: any } = {};
  if (Array.isArray(props)) {
    props.forEach(key => res[key] = { type: null });
  } else if (isPlainObject(props)) {
    Object.keys(props).forEach(key => {
      let val = props[key];
      res[key] = isPlainObject(val)
        ? val.type !== undefined
          ? val
          : normalizeProps(val)
        : { type: val };
    });
  } else return props;
  return res;
}

function once(fn: ((...args: any) => any) | null, ctx?: any) {
  let ret: any;
  return function _once(...args: any[]) {
    if (!fn) return ret;
    const _fn = fn;
    fn = null;
    ret = _fn.call(ctx || this, ...args);
    return ret;
  };
}


function isAcceptRef(v: any) {
  if (!v) return false;
  if (v.$$typeof === REACT_FORWARD_REF_TYPE && v.__componentClass) return true;
  if (v.__component) v = getGuardsComponent(v);

  let ret = false;
  if (v.prototype) {
    if (v.prototype instanceof React.Component || v.prototype.componentDidMount !== undefined) ret = true;
  } else if (v.$$typeof === REACT_FORWARD_REF_TYPE && !v.__guards) ret = true;
  return ret;
}

function mergeFns(...fns: any[]) {
  return function (...args: any) {
    let ret;
    fns.forEach(fn => {
      ret = fn && fn.call(this, ...args);
    });
    return ret;
  };
}

function resolveRedirect(to: string | RouteRedirectFn, route: MatchedRoute, from?: Route) {
  if (isFunction(to)) to = (to as RouteRedirectFn).call(route.config, from);
  if (!to) return '';
  let ret = normalizeLocation(to, route);
  if (!ret) return '';
  from && Object.assign(ret.query, from.query);
  ret.isRedirect = true;
  return ret;
}

function warn(...args: any[]) {
  console.warn(...args);
}

async function afterInterceptors(interceptors: RouteGuardInterceptor[], to: Route, from: Route | null) {
  for (let i = 0; i < interceptors.length; i++) {
    let interceptor = interceptors[i];
    while (interceptor && (interceptor as lazyResovleFn).lazy) {
      interceptor = await (interceptor as lazyResovleFn)(interceptors, i);
    }
    if (!interceptor) return;

    interceptor && await (interceptor as RouteAfterGuardFn).call(this, to, from, interceptor.route);
  }
}

type RenderRouteOption = {
  router?: ReactViewRouter,
  container?: ReactViewContainer
  name?: string;
  ref?: any,
  params?: Partial<any>,
  query?: Partial<any>,
}

function renderRoute(
  route: ConfigRoute | MatchedRoute | null | undefined,
  routes: ConfigRoute[],
  props: any,
  children: React.ReactNode | null,
  options: RenderRouteOption = { }
) {
  if (props === undefined) props = {};
  if (!route) return null;
  if (React.isValidElement(route)) return route;
  if (route.config) route = route.config;

  function configProps(_props: any, configs: any, obj: any, name?: string) {
    if (!obj) return;
    if (name && configs[name] !== undefined) configs = configs[name];
    if (configs === true) Object.assign(_props, obj);
    else if (isPlainObject(configs)) {
      Object.keys(configs).forEach(key => {
        const prop = configs[key];
        const type = prop.type;
        let val = obj[key];
        if (val === undefined) {
          if (prop.default) {
            if (isFunction(prop.default) && (type === Object || type === Array)) {
              _props[key] = prop.default();
            } else _props[key] = prop.default;
          } else return;
        }
        if (type !== null) _props[key] = type(val);
        else _props[key] = val;
      });
    }
  }
  function createComp(route: ConfigRoute | MatchedRoute, props: any, children: React.ReactNode, options: RenderRouteOption) {
    let component = route.components && route.components[options.name || 'default'];
    if (!component) {
      if (route.children && route.children.length && options.router) {
        component = RouterViewWrapper;
      } else  return null;
    }
    if (isMatchedRoute(route)) route = route.config;

    const _props = { key: route.path };
    if (route.defaultProps) {
      Object.assign(_props, isFunction(route.defaultProps) ? route.defaultProps(props) : route.defaultProps);
    }
    if (route.props) configProps(_props, route.props, options.params, options.name);
    if (route.paramsProps) configProps(_props, route.paramsProps, options.params, options.name);
    if (route.queryProps) configProps(_props, route.queryProps, options.query, options.name);

    let ref: any = null;
    if (component) {
      if (isAcceptRef(component)) ref = options.ref;
      else if (route.enableRef) {
        if (!isFunction(route.enableRef) || route.enableRef(component)) ref = options.ref;
      }
    }
    const _pending = route._pending;
    const completeCallback = _pending && _pending.completeCallbacks[options.name || 'default'];
    let refHandler = once((el, componentClass) => {
      if (el || !ref) {
        // if (isFunction(componentClass)) componentClass = componentClass(el, route);
        if (componentClass && el && (el._reactInternalFiber || el._reactInternals)) {
          let refComp = null;
          let comp = el._reactInternalFiber || el._reactInternals;
          while (comp && !refComp) {
            if (comp.type === componentClass) {
              refComp = comp;
              break;
            }
            comp = comp.child;
          }
          if (refComp && refComp.stateNode instanceof componentClass) el = refComp.stateNode;
          else warn('componentClass', componentClass, 'not found in route component: ', el);
        }
        completeCallback && completeCallback(el);
      }
    });
    _pending && (_pending.completeCallbacks[options.name || 'default'] = null);
    if (ref) ref = mergeFns(ref, (el: any) => el && refHandler && refHandler(el, component.__componentClass));
    if (component.__component) component = getGuardsComponent(component);
    let ret;
    if (component instanceof RouteLazy) {
      ret = null;
      warn(`route [${route.path}] component should not be RouteLazy instance!`);
    } else {
      ret = React.createElement(
        component,
        Object.assign(
          _props,
          props,
          config.inheritProps ? { route } : null,
          { ref }
        ),
        ...(Array.isArray(children) ? children : [children])
      );
    }
    if (!ref) nextTick(refHandler);
    return ret;
  }

  let renderRoute = route;
  if (route && route.redirect) return null;
  if (route && route.index) renderRoute = resloveIndex(route.index, routes);
  if (!renderRoute) return null;

  let result = createComp(renderRoute, props, children, options) as any;
  if (route && options.container) result = options.container(result, route, props);
  return result;
}

function flatten(array: any[]) {
  let flattend: any[] = [];
  (function flat(array) {
    array.forEach(function (el) {
      if (Array.isArray(el)) flat(el);
      else flattend.push(el);
    });
  })(array);
  return flattend;
}

function camelize(str: string): string {
  let ret = str.replace(/[-](\w)/g, function (_, c) { return c ? c.toUpperCase() : ''; });
  if (/^[A-Z]/.test(ret)) ret = ret.charAt(0).toLowerCase() + ret.substr(1);
  return ret;
}

function isPropChanged(
  prev: { [key: string]: any },
  next: { [key: string]: any },
  onChanged?: (key: string, newVal: any, oldVal: any) => boolean,
) {
  if ((!prev || !next) && prev !== next) return true;
  return Object.keys(next).some(key => {
    let newVal = next[key];
    let oldVal = prev[key];
    let changed = newVal !== oldVal;
    if (changed && onChanged) changed = onChanged(key, newVal, oldVal);
    return changed;
  });
}

function isRouteChanged(prev: ConfigRoute | MatchedRoute | null, next: ConfigRoute | MatchedRoute | null) {
  if (prev && next) return prev.path !== next.path || prev.subpath !== next.subpath;
  if ((!prev || !next) && prev !== next) return true;
  return false;
}

function isRoutesChanged(prevs: ConfigRoute[], nexts: ConfigRoute[]) {
  if (!prevs || !nexts) return true;
  if (prevs.length !== nexts.length) return true;
  let changed = false;
  prevs.some((prev, i) => {
    changed = isRouteChanged(prev, nexts[i]);
    return changed;
  });
  return changed;
}

function getHostRouterView(ctx: any, continueCb?: any) {
  let parent = (ctx._reactInternalFiber || ctx._reactInternals).return;
  while (parent) {
    if (continueCb && continueCb(parent) === false) return null;

    const memoizedState = parent.memoizedState;
    // const memoizedProps = parent.memoizedProps;
    if (memoizedState && memoizedState._routerView) return parent.stateNode as RouterView;
    parent = parent.return;
  }
  return null;
}

function getParentRoute(ctx: any): MatchedRoute | null {
  const view = getHostRouterView(ctx);
  return (view && view.state.currentRoute) || null;
}

function isAbsoluteUrl(to: any) {
  return typeof to === 'string' && /^(https?:)?\/\/.+/.test(to);
}

function getCurrentPageHash(to: string) {
  if (!to || !window || !window.location) return '';
  let [, host = '', hash = ''] = to.match(/(.+)#(.+)$/) || [];
  return window.location.href.startsWith(host) ? hash : '';
}

function getSessionStorage(key: string, json: boolean = false) {
  if (!window || !window.sessionStorage) return null;

  let v = window.sessionStorage[key];
  if (v === undefined) return json ? null : '';
  return json ? JSON.parse(v) : v;
}

function setSessionStorage(key: string, value?: any) {
  if (!window || !window.sessionStorage) return;

  let isNull = value === undefined || value === null;
  let v = typeof value === 'string' ? value : JSON.stringify(value);
  if (!v || isNull) window.sessionStorage.removeItem(key);
  else window.sessionStorage[key] = v;
}

function isRoute(route: any): route is Route {
  return Boolean(route && route.isViewRoute);
}

function isReactViewRouter(v: any): v is ReactViewRouter {
  return v && v.isReactViewRouterInstance;
}

function isHistory(v: any): v is HistoryFix {
  return v && v.isHistoryInstance;
}

function isRouteGuardInfoHooks(v: any): v is RouteGuardsInfoHooks {
  return v && v.__routeGuardInfoHooks;
}

function isReadonly(obj: any, key: string) {
  let d = obj && Object.getOwnPropertyDescriptor(obj, key);
  return Boolean(!obj || (d && !d.writable));
}

export {
  camelize,
  flatten,
  warn,
  once,
  mergeFns,
  isAcceptRef,
  nextTick,
  isNull,
  isPlainObject,
  isFunction,
  isMatchedRoute,
  isLocation,
  isHistoryLocation,
  isPropChanged,
  isRouteChanged,
  isRoutesChanged,
  isAbsoluteUrl,
  isRoute,
  isReactViewRouter,
  isRouteGuardInfoHooks,
  isHistory,
  isReadonly,
  resolveRedirect,
  normalizePath,
  normalizeRoute,
  normalizeRoutes,
  walkRoutes,
  normalizeRoutePath,
  normalizeLocation,
  normalizeProps,
  matchPath,
  matchRoutes,
  renderRoute,
  innumerable,
  readonly,
  afterInterceptors,
  getParentRoute,
  getHostRouterView,
  getCurrentPageHash,

  getSessionStorage,
  setSessionStorage,
};
