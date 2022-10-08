import React, { useState, useEffect, ReactNode } from 'react';
import config from './config';
import { RouteLazy, isPromise, isRouteLazy } from './route-lazy';
import { REACT_FORWARD_REF_TYPE, getGuardsComponent } from './route-guard';
import matchPath, { computeRootMatch } from './match-path';
import {
  ConfigRouteArray, RouteIndexFn, ConfigRoute, MatchedRoute, RouteHistoryLocation, Route,
  RouteAfterGuardFn, RouteGuardInterceptor, LazyResolveFn, RouteRedirectFn, RouteAbortFn, RouteLocation,
  NormalizeRouteOptions, RouteGuardsInfoHooks, UserConfigRoute, RouteBranchArray, ReactAllComponentType,
  RouteChildrenFn, NormalizedRouteChildrenFn, ParseQueryProps, RouteMetaFunction,
  UserConfigRouteProps, UserConfigRoutePropsNormal, UserConfigRoutePropsNormalItem
} from './types';
import { RouterViewComponent as RouterView, RouterViewWrapper  } from './router-view';
import ReactViewRouter from './router';
import { HistoryFix } from './history-fix';
import { HistoryType, Action, readonly } from './history';

const DEFAULT_STATE_NAME = '[root]';

function nextTick(cb: () => void, ctx?: object) {
  if (!cb) return;
  return new Promise<any>(resolve => { resolve(null); }).then(() => (ctx ? cb.call(ctx) : cb()));
}

const _hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwnProp(obj: any, key: PropertyKey) {
  return Boolean(obj) && _hasOwnProperty.call(obj, key);
}

function innumerable<T extends object>(
  obj: T,
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
  let path = normalizePath(parent ? `${parent.path || '/'}${routePath === '/' ? '' : '/'}${
    routePath.replace(/^(\/)/, '')
  }` : routePath);
  let r: ConfigRoute = ({
    ...route,
    subpath: routePath,
    path: parent
      ? path
      : path[0] === '/'
        ? path
        : `/${path}`,
    depth: parent ? (parent.depth + 1) : 0
  }) as any;
  if (parent) innumerable(r, 'parent', parent);
  if (!r.children) r.children = [];
  if (isFunction(r.children)) {
    if (!isRouteChildrenNormalized(r.children)) {
      r.children = normalizeRouteChildrenFn(r.children);
    }
  } else {
    innumerable(r, 'children', normalizeRoutes(r.children, r as ConfigRoute, options));
  }
  r.exact = r.exact !== undefined ? (r.exact || false) : Boolean(r.redirect || r.index);
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
          // r.exact = !(r as ConfigRoute).children.length;
        }
        return (r as ConfigRoute).components[key] = c;
      });
    }
  });
  const meta = r.meta || {};
  readonly(r, 'meta', () => meta);
  if (r.props) innumerable(r, 'props', normalizeProps(r.props));
  if (r.paramsProps) innumerable(r, 'paramsProps', normalizeProps(r.paramsProps));
  if (r.queryProps) innumerable(r, 'queryProps', normalizeProps(r.queryProps));
  innumerable(r, '_pending', { completeCallbacks: {} });
  return r as ConfigRoute;
}

function walkRoutes(
  routes: ConfigRouteArray|RouteChildrenFn,
  walkFn: (route: ConfigRoute, routeIndex: number, routes: ConfigRouteArray) => boolean|void,
  parent?: ConfigRoute
): boolean {
  if (isFunction(routes)) routes = normalizeRoutes(routes(parent));
  return routes.some((route, routeIndex) => {
    if (walkFn(route, routeIndex, routes as ConfigRouteArray)) return true;
    if (!route.children || !Array.isArray(route.children)) return;
    return walkRoutes(route.children, walkFn, route);
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


function matchRoutes(
  routes: ConfigRouteArray | RouteChildrenFn,
  to: RouteHistoryLocation | Route | string,
  parent?: ConfigRoute,
  options: {
    branch?: RouteBranchArray,
    level?: number,
    queryProps?: ParseQueryProps,
  } = {}
) {
  const { queryProps } = options;
  to = normalizeLocation(to, { queryProps }) as RouteHistoryLocation;
  if (!to || to.path === '') return [];

  const { branch = [], level = 0 } = options;

  routes = getRouteChildren(routes, parent);

  routes.some(route => {
    let match = route.path
      ? matchPath((to as RouteHistoryLocation).path, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        : computeRootMatch((to as RouteHistoryLocation).path); // use default "root" match

    if (match && route.index) {
      route = resolveIndex(route.index, routes as ConfigRouteArray) as ConfigRoute;
      if (!route) return;
      (to as RouteHistoryLocation).pathname = (to as RouteHistoryLocation).path = route.path;
      match = matchPath(route.path, route);
    }

    if (!match) return;

    branch.push({ route,  match });

    if (route.children
      && (route.children.length || isFunction(route.children))
    ) matchRoutes(route.children as any, to, route, { branch, level: level + 1, queryProps });

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
  {
    route,
    append = false,
    basename = '',
    mode = '',
    resolvePathCb,
    queryProps
  }: {
    route?: Route|MatchedRoute|ConfigRoute|RouteHistoryLocation|RouteLocation|null,
    append?: boolean,
    basename?: string,
    mode?: string,
    resolvePathCb?: (path: string, to: RouteHistoryLocation) => string,
    queryProps?: ParseQueryProps
  } = {}
): RouteHistoryLocation | null {
  if (!to || (isPlainObject(to) && !to.path && !to.pathname)) return null;
  if (to._routeNormalized) return to;
  if (typeof to === 'string') {
    const searchs = to.match(/\?[^#]+/g) || [];
    const pathname = searchs.reduce((p, v) => p.replace(v, ''), to);
    const search = searchs.sort().reduce((p, v, i) => {
      if (!i) return v;
      const s = v.substr(1);
      return p + (s ? `&${s}` : '');
    }, '');
    to = { pathname, path: pathname, search, fullPath: to };
  }
  if (to.query) Object.keys(to.query).forEach(key => (to.query[key] === undefined) && (delete to.query[key]));
  else if (to.search) to.query = config.parseQuery(to.search, queryProps);

  let isAbsolute = isAbsoluteUrl(to.pathname);
  if (isAbsolute && mode !== HistoryType.browser) {
    let hash = getCurrentPageHash(to.pathname);
    if (hash) {
      to.pathname = hash;
      isAbsolute = false;
    }
  }

  if (to.basename == null && basename != null) to.basename = to.absolute ? '' : basename;

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
function isPlainObject(obj: any): obj is Record<string, any> {
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

function normalizeProps(props: UserConfigRouteProps) {
  let res: UserConfigRoutePropsNormal = {};
  if (typeof props === 'boolean') return props;
  if (Array.isArray(props)) {
    props.forEach(key => res[key] = { type: null });
  } else if (isPlainObject(props)) {
    Object.keys(props).forEach(key => {
      let val = props[key];
      res[key] = isPlainObject(val)
        ? val.type !== undefined
          ? val as UserConfigRoutePropsNormalItem
          : normalizeProps(val as any) as Record<string, UserConfigRoutePropsNormalItem>
        : { type: val };
    });
  } else return false;
  return res;
}

function copyOwnProperties(target: object, source: object) {
  if (!target || !source) return target;
  Object.getOwnPropertyNames(source).forEach(key => {
    if (hasOwnProp(target, key)) return;
    const d = Object.getOwnPropertyDescriptor(source, key);
    if (!d) return;
    Object.defineProperty(target, key, d);
  });
}

type MatchRegxList =RegExp|string|(RegExp|string)[];
function isMatchRegxList(key: string, regx: MatchRegxList): boolean {
  if (Array.isArray(regx)) return regx.some(v => isMatchRegxList(key, v));
  return regx instanceof RegExp ? regx.test(key) : regx === key;
}

function omitProps<T extends Record<string, any>>(props: T, excludes: RegExp|string|(string|RegExp)[]) {
  if (!excludes) return props;
  let ret: Record<string, any> = {};
  Object.getOwnPropertyNames(props).forEach(key => {
    if (isMatchRegxList(key, excludes)) return;
    ret[key] = props[key];
  });

  return ret;
}

function once<T extends Function>(fn: T, ctx?: any) {
  if (!fn) return fn;
  let ret: any;
  let called = false;
  const fnWrapper: T = (function _once() {
    if (called) return ret;
    called = true;
    ret = fn.apply(ctx || this, arguments);
    return ret;
  }) as any;
  copyOwnProperties(fnWrapper, fn);
  return fnWrapper;
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

function resolveIndex(originIndex: string | RouteIndexFn, routes: ConfigRouteArray): ConfigRoute | null {
  let index = isFunction(originIndex) ? (originIndex as RouteIndexFn)(routes) : originIndex;
  if (!index) return null;

  let r = routes.find((r: ConfigRoute) => {
    if (index === ':first' && !r.index) {
      const visible = readRouteMeta(r, 'visible');
      if (visible !== false) return true;
    }

    let path1 = r.subpath[0] === '/' ? r.subpath : `/${r.subpath}`;
    let path2 = (index as string)[0] === '/' ? index : `/${index}`;
    return path1 === path2;
  }) || null;
  if (r && r.index) {
    if (r.index === originIndex) return null;
    return resolveIndex(r.index, routes);
  }
  return r;
}

function resolveRedirect(to: string | RouteRedirectFn | undefined, route: MatchedRoute, options: {
  isInit?: boolean,
  from?: Route,
  queryProps?: ParseQueryProps,
} = {}) {
  if (isFunction(to)) to = (to as RouteRedirectFn).call(route.config, options.from, options.isInit);
  if (!to) return '';
  let ret = normalizeLocation(to, { route, queryProps: options.queryProps });
  if (!ret) return '';
  options.from && Object.assign(ret.query, options.from.query);
  ret.isRedirect = true;
  return ret;
}

function resolveAbort(
  abort: boolean|string|RouteAbortFn|undefined|Error,
  route: MatchedRoute,
  options: {
    isInit?: boolean,
    from?: Route,
  } = {}
) {
  if (isFunction(abort)) {
    try {
      abort = (abort as RouteAbortFn).call(route.config, options.from, options.isInit);
    } catch (ex: any) {
      abort = ex;
    }
  }
  return abort;
}

function warn(...args: any[]) {
  console.error(...args);
}

async function afterInterceptors(interceptors: RouteGuardInterceptor[], to: Route, from: Route | null) {
  for (let i = 0; i < interceptors.length; i++) {
    let interceptor = interceptors[i];
    while (interceptor && (interceptor as LazyResolveFn).lazy) {
      interceptor = await (interceptor as LazyResolveFn)(interceptors, i);
    }
    if (!interceptor) return;

    interceptor && await (interceptor as RouteAfterGuardFn).call(this, to, from, interceptor.route);
  }
}

type LazyMethod<T extends ReactAllComponentType = ReactAllComponentType> = () => Promise<T|EsModule<T>|null>;

function createLazyComponent<T extends ReactAllComponentType = ReactAllComponentType>(
  lazyMethodOrPromise: LazyMethod<T>|ReturnType<LazyMethod<T>>
) {
  return React.forwardRef<T>(
    (props, ref) => {
      const [$refs] = useState({ mounted: false });
      const [comp, setComp] = useState<{ App: null|ReactAllComponentType }>({ App: null });
      const { App } = comp;

      useEffect(() => {
        $refs.mounted = true;
        (isPromise(lazyMethodOrPromise) ? lazyMethodOrPromise : lazyMethodOrPromise()).then(App => {
          if (!$refs.mounted) return;
          if ((App as EsModule).__esModule) App = (App as EsModule).default;
          setComp({ App: App as any });
        });
        return () => {
          $refs.mounted = false;
        };
      }, [$refs]);

      if (!App) return null;

      return React.createElement(
        App,
        {
          ...props,
          ...(ref ? { ref } : {})
        },
        props.children
      );
    }
  );
}

type RenderRouteOption = {
  router?: ReactViewRouter,
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
): ReactNode|null {
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
        if (type != null && typeof type !== 'boolean') _props[key] = type(val);
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
    let refHandler = once((el?: any, componentClass?: any) => {
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
    if (isRouteLazy(component)) {
      const routeLazy = component;
      component = createLazyComponent(() => routeLazy.toResolve(
        options.router as any,
        isMatchedRoute(route) ? route.config : route,
        options.name as string
      ));
      warn(`route [${route.path}] component should not be RouteLazy instance!`);
    }
    ret = React.createElement(
      component,
      Object.assign(
        _props,
        config.inheritProps ? { route } : null,
        props,
        { ref }
      ),
      ...(Array.isArray(children) ? children : [children])
    );
    if (!ref) nextTick(refHandler);
    return ret;
  }

  let renderRoute = route;
  if (route && route.redirect) return null;
  if (route && route.index) renderRoute = resolveIndex(route.index, routes);
  if (!renderRoute) return null;

  let result = createComp(renderRoute, props, children, options) as any;
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
  if (!prev || !next) return prev !== next;
  return Object.keys(next).some(key => {
    let newVal = next[key];
    let oldVal = prev[key];
    let changed = newVal !== oldVal;
    if (changed && onChanged) changed = onChanged(key, newVal, oldVal);
    return changed;
  });
}

function isRouteChanged(prev: ConfigRoute | MatchedRoute | null, next: ConfigRoute | MatchedRoute | null) {
  if (!prev || !next) return prev !== next;
  return prev.path !== next.path || prev.subpath !== next.subpath;
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

function setSessionStorage(key: string, value?: any, replacer?: (number | string)[]|((this: any, key: string, value: any) => any)) {
  if (!window || !window.sessionStorage) return;

  let isNull = value === undefined || value === null;
  let v = typeof value === 'string' ? value : JSON.stringify(value, replacer as any);
  if (!v || isNull) window.sessionStorage.removeItem(key);
  else window.sessionStorage[key] = v;
}

function getRouterViewPath(routerView: RouterView) {
  if (!routerView || !routerView.state.currentRoute) return '';
  return routerView.state.currentRoute.path;
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

function isRouteChildrenNormalized(fn: any): fn is NormalizedRouteChildrenFn {
  return fn && fn._normalized;
}

function normalizeRouteChildrenFn(
  childrenFn: RouteChildrenFn | NormalizedRouteChildrenFn,
  checkDirty?: (oldRoutes?: ConfigRouteArray) => boolean
): NormalizedRouteChildrenFn {
  if (!childrenFn || isRouteChildrenNormalized(childrenFn)) return childrenFn;

  const cache: NormalizedRouteChildrenFn['cache'] = {};
  const ret: RouteChildrenFn = function (parent) {
    const isDirty = checkDirty && checkDirty(cache.routes);
    if (!isDirty && cache.routes) return cache.routes || [];
    return cache.routes = normalizeRoutes(childrenFn(parent));
  };
  innumerable(cache, 'cache', cache);
  innumerable(ret, '_normalized', true);
  Object.getOwnPropertyNames(childrenFn).forEach(key => {
    if (['cache', '_normalized'].includes(key)) return;
    const p =  Object.getOwnPropertyDescriptor(childrenFn, key);
    p && Object.defineProperty(ret, key, p);
  });
  return ret as NormalizedRouteChildrenFn;
}

function getRouteChildren(children: ConfigRouteArray|RouteChildrenFn, parent?: ConfigRoute|null) {
  if (isFunction(children)) children = children(parent);
  return children || [];
}

function readRouteMeta(configOrMatchedRoute: ConfigRoute|MatchedRoute, key: string = '', props: {
  router?: ReactViewRouter|null,
  [key: string]: any
} = {}) {
  if (!key) return;
  // if (isMatchedRoute(configOrMatchedRoute)) return configOrMatchedRoute.meta[key];

  let route: ConfigRoute = isMatchedRoute(configOrMatchedRoute) ? configOrMatchedRoute.config : configOrMatchedRoute;
  let value = route.meta[key];
  if (isFunction(value)) {
    let routes = route.parent ? route.parent.children : (props.router && props.router.routes);
    value = (value as RouteMetaFunction)(
      route,
      (isFunction(routes) ? normalizeRoutes(routes(route.parent), route.parent) : routes) || [],
      props
    );
  }
  return value;
}

function getCompleteRoute(route: Route|null) {
  if (!route || route.isComplete) return route;
  while (route.redirectedFrom) {
    route = route.redirectedFrom;
    if (route.isComplete) return route;
  }
  return null;
}

function getLoactionAction(to?: Route): undefined|Action {
  if (!to) return;
  return (to.isRedirect && !to.isComplete) ? getLoactionAction(to.redirectedFrom) : to.action;
}

function reverseArray<T>(originArray: T[]) {
  let ret: T[] = [];
  for (let i = originArray.length - 1; i >= 0; i--) {
    ret.push(originArray[i]);
  }
  return ret;
}

export {
  DEFAULT_STATE_NAME,
  MatchRegxList,

  camelize,
  flatten,
  warn,
  once,
  mergeFns,
  reverseArray,
  copyOwnProperties,
  isAcceptRef,
  nextTick,
  hasOwnProp,
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
  isPromise,
  isRouteLazy,
  isRouteChildrenNormalized,
  isMatchRegxList,
  resolveRedirect,
  resolveAbort,
  resolveIndex,
  normalizePath,
  normalizeRoute,
  normalizeRoutes,
  normalizeRouteChildrenFn,
  normalizeRoutePath,
  normalizeLocation,
  normalizeProps,
  omitProps,
  walkRoutes,
  matchPath,
  matchRoutes,
  renderRoute,
  innumerable,
  readonly,
  afterInterceptors,
  getParentRoute,
  getRouteChildren,
  getHostRouterView,
  getCurrentPageHash,
  getRouterViewPath,
  getCompleteRoute,
  getLoactionAction,

  getSessionStorage,
  setSessionStorage,

  readRouteMeta,
  createLazyComponent,
};
