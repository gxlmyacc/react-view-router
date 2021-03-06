import React from 'react';
import config from './config';
import { RouteLazy } from './route-lazy';
import { REACT_FORWARD_REF_TYPE, getGuardsComponent } from './route-guard';
import matchPath, { computeRootMatch } from './match-path';
import {
  ConfigRouteArray, RouteIndexFn, ConfigRoute, MatchedRoute, RouteHistoryLocation, Route,
  RouteAfterGuardFn, RouteGuardInterceptor, lazyResovleFn, RouteRedirectFn, RouteLocation
} from './types';
import { ReactViewContainer, RouterViewComponent as RouterView  } from './router-view';

function nextTick(cb: () => void, ctx?: object) {
  if (!cb) return;
  return new Promise(function (resolve) {
    setTimeout(() => resolve(ctx ? cb.call(ctx) : cb()), 0);
  });
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
  return paths.join('/');
}

function normalizeRoute(route: any, parent: any, depth: number = 0, force?: any): ConfigRoute {
  let path = normalizePath(parent ? `${parent.path}/${route.path.replace(/^(\/)/, '')}` : route.path);
  let r = { ...route, subpath: route.path, path, depth };
  if (parent) innumerable(r, 'parent', parent);
  if (r.children && !isFunction(r.children)) {
    innumerable(r, 'children', normalizeRoutes(r.children, r, depth + 1, force));
  }
  r.depth = depth;
  r.exact = r.exact !== undefined ? r.exact : Boolean(r.redirect || r.index);
  if (!r.components) r.components = {};
  if (r.component) {
    r.components.default = r.component;
    delete r.component;
  }
  Object.keys(r.components).forEach(key => {
    let comp = r.components[key];
    if (comp instanceof RouteLazy) {
      (comp as RouteLazy).updaters.push(c => {
        if (c.__children) {
          let children = c.__children || [];
          if (isFunction(children)) children = (children as ((r: any) => any[]))(r) || [];
          innumerable(r, 'children', normalizeRoutes(children as ConfigRouteArray, r, depth + 1));
          r.exact = !r.children.length;
        }
        return r.components[key] = c;
      });
    }
  });
  if (!r.meta) r.meta = {};
  if (r.props) innumerable(r, 'props', normalizeProps(r.props));
  if (r.paramsProps) innumerable(r, 'paramsProps', normalizeProps(r.paramsProps));
  if (r.queryProps) innumerable(r, 'queryProps', normalizeProps(r.queryProps));
  innumerable(r, '_pending', { completeCallbacks: {} });
  return r;
}

function normalizeRoutes(routes: ConfigRouteArray, parent?: any, depth = 0, force = false) {
  if (!routes) routes = [] as ConfigRouteArray;
  if (!force && routes._normalized) return routes;
  routes = routes.map((route: any) => route && normalizeRoute(route, parent, depth || 0, force)).filter(Boolean);
  Object.defineProperty(routes, '_normalized', { value: true });
  return routes;
}

function normalizeRoutePath(path: string, route?: any, append?: boolean, basename = '') {
  if (isAbsoluteUrl(path)) return path;
  if (route && route.matched) route = route.matched[route.matched.length - 1];
  if (!path || path[0] === '/' || !route) return basename + (path || '');
  if (route.config) route = route.config;
  let parent = (append || /^\.\//.test(path)) ? route : route.parent;
  while (parent && path[0] !== '/') {
    path = `${parent.path}/${path}`;
    parent = route.parent;
  }
  if (basename && path[0] === '/') path = basename + path;
  return normalizePath(path);
}

function resloveIndex(index: string | RouteIndexFn, routes: ConfigRouteArray): any {
  index = isFunction(index) ? (index as RouteIndexFn)(routes) : index;
  let r = routes.find((r: ConfigRoute) => r.subpath === index);
  if (r && r.index) {
    if (r.index === index) return null;
    return resloveIndex(r.index, routes);
  }
  return r;
}


type RoutesHandler = (r: any) => ConfigRouteArray;

function matchRoutes(
  routes: ConfigRouteArray | RoutesHandler,
  to: any,
  parent?: any,
  branch: { route: any, match: any }[] = []
) {
  to = normalizeLocation(to);

  if (isFunction(routes)) {
    routes = normalizeRoutes((routes as RoutesHandler)({
      location,
      parent,
      branch,
      prevChildren: parent && parent.prevChildren
    }), parent);
    if (parent) parent.prevChildren = routes;
  }

  (routes as ConfigRouteArray).some(route => {
    let match = route.path
      ? matchPath(to.path, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        : computeRootMatch(to.path); // use default "root" match

    if (match && route.index) {
      route = resloveIndex(route.index, routes as ConfigRouteArray);
      if (!route) return;
      to.pathname = to.path = route.path;
    }

    if (match) {
      branch.push({ route,  match });

      if (route.children) matchRoutes(route.children, to, route, branch);
    }
    if (match) return true;
  });

  return branch;
}

function normalizeLocation(to: any, route?: any, append?: boolean, basename = ''): RouteHistoryLocation | null {
  if (!to || (isPlainObject(to) && !to.path && !to.pathname)) return null;
  if (to._routeNormalized) return to;
  if (typeof to === 'string') {
    const [pathname, search] = to.split('?');
    to = { pathname, path: pathname, search: search ? `?${search}` : '', fullPath: to };
  }
  if (to.query) Object.keys(to.query).forEach(key => (to.query[key] === undefined) && (delete to.query[key]));
  else if (to.search) to.query = config.parseQuery(to.search.substr(1));

  if (!isAbsoluteUrl(to.pathname)) {
    to.pathname = to.path = normalizeRoutePath(to.pathname || to.path, route, to.append || append, basename) || '/';
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
      let s = this.search;
      return `${this.path}${s || ''}` || '/';
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
  return Boolean(value.config);
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
            if (typeof prop.default === 'function' && (type === Object || type === Array)) {
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
    if (!component) return null;
    if (isMatchedRoute(route)) route = route.config;

    const _props = {};
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
    const completeCallback = _pending.completeCallbacks[options.name || 'default'];
    let refHandler = once((el, componentClass) => {
      if (el || !ref) {
        // if (isFunction(componentClass)) componentClass = componentClass(el, route);
        if (componentClass && el && el._reactInternalFiber) {
          let refComp = null;
          let comp = el._reactInternalFiber;
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
    _pending.completeCallbacks[options.name || 'default'] = null;
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
  let ret = str.replace(/[-|:](\w)/g, function (_, c) { return c ? c.toUpperCase() : ''; });
  if (/^[A-Z]/.test(ret)) ret = ret.charAt(0).toLowerCase() + ret.substr(1);
  return ret;
}

function isPropChanged(prev: { [key: string]: any }, next: { [key: string]: any }) {
  if ((!prev || !next) && prev !== next) return true;
  return Object.keys(next).some(key => next[key] !== prev[key]);
}

function isRouteChanged(prev: ConfigRoute | MatchedRoute | null, next: ConfigRoute | MatchedRoute | null) {
  if (prev && next) return prev.path !== next.path && prev.subpath !== next.subpath;
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
  let parent = ctx._reactInternalFiber.return;
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
  resolveRedirect,
  normalizePath,
  normalizeRoute,
  normalizeRoutes,
  normalizeRoutePath,
  normalizeLocation,
  normalizeProps,
  matchPath,
  matchRoutes,
  renderRoute,
  innumerable,
  afterInterceptors,
  getParentRoute,
  getHostRouterView
};
