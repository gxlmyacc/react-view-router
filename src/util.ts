import React, { useState, useEffect, ReactNode } from 'react';
import config from './config';
import { RouteLazy, isPromise, isRouteLazy } from './route-lazy';
import { REACT_FORWARD_REF_TYPE, getGuardsComponent } from './route-guard';
import matchPath, { computeRootMatch } from './match-path';
import {
  NormalizedConfigRouteArray, RouteIndexFn, ConfigRoute, MatchedRoute, RouteHistoryLocation, Route,
  RouteAfterGuardFn, RouteGuardInterceptor, LazyResolveFn, RouteRedirectFn, RouteAbortFn, RouteLocation,
  NormalizeRouteOptions, RouteGuardsInfoHooks, UserConfigRoute, RouteBranchArray, ReactAllComponentType,
  RouteChildrenFn, NormalizedRouteChildrenFn, ParseQueryProps, RouteMetaFunction,
  UserConfigRouteProps, UserConfigRoutePropsNormal, UserConfigRoutePropsNormalMap, UserConfigRoutePropsNormalItem
} from './types';
import { RouterViewComponent as RouterView, RouterViewWrapper  } from './router-view';
import ReactViewRouter from './router';
import { HistoryFix } from './history-fix';
import { HistoryType, Action, readonly } from './history';

const DEFAULT_STATE_NAME = '[root]';

function nextTick(cb: () => void, ctx?: object) {
  // @ts-ignore
  // eslint-disable-next-line no-promise-executor-return
  return cb && new Promise<any>(r => r()).then(() => (ctx ? cb.call(ctx) : cb()));
}

function ignoreCatch<
  T extends(
    (...args: any) => any
  )
>(
  fn: T,
  onCatch?: (ex: any) => void
) {
  return function (...args: Parameters<T>): void|ReturnType<T> {
    try {
      // eslint-disable-next-line prefer-spread
      return (fn as any).apply(this, args);
    } catch (ex) { onCatch ? onCatch(ex) : warn(ex); }
  };
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

function concatConfigRoutePath(routePath?: string|null, parentPath?: string|null) {
  if (routePath == null || routePath === '/') routePath = '';
  else if (routePath[0] !== '/') routePath = '/' + routePath;
  if (parentPath == null || parentPath === '/') parentPath = '';
  return (parentPath + routePath) || '/';
}

function getRoutePath(route?: ConfigRoute|UserConfigRoute|null) {
  if (!route || !route.path) return '/';
  return route.path;
}

function normalizeRoute(
  route: UserConfigRoute|ConfigRoute,
  parent?: ConfigRoute | null,
  options: NormalizeRouteOptions = {}
): ConfigRoute {
  if (route._normalized) route = route._normalized;
  const subpath = getRoutePath(route);
  const path = concatConfigRoutePath(subpath, parent && parent.path);
  const r: ConfigRoute = ({
    path,
    subpath,
    depth: parent ? (parent.depth + 1) : 0,
    components: {},
  }) as any;
  if (parent) innumerable(r, 'parent', parent);
  if (isFunction(route.children)) {
    r.children = isRouteChildrenNormalized(route.children)
      ? route.children
      : normalizeRouteChildrenFn(route.children);
  } else {
    innumerable(r, 'children', normalizeRoutes(route.children || [], r, options));
  }
  r.exact = route.exact !== undefined ? (route.exact || false) : Boolean(route.redirect || route.index);
  r.components = { ...route.components, default: route.component };
  Object.keys(r.components).forEach(key => {
    const comp = r.components[key];
    if (comp instanceof RouteLazy) {
      (comp as RouteLazy).updaters.push(c => {
        if (c && c.__children) {
          let children = c.__children || [];
          if (isFunction(children)) children = (children as ((r: any) => any[]))(r) || [];
          innumerable(r, 'children', normalizeRoutes(children, r, options));
          // r.exact = !(r as ConfigRoute).children.length;
        }
        return r.components[key] = c;
      });
    }
  });
  const meta = route.meta || {};
  readonly(r, 'meta', () => meta);
  if (route.props) innumerable(r, 'props', normalizeProps(route.props));
  if (route.paramsProps) innumerable(r, 'paramsProps', normalizeProps(route.paramsProps));
  if (route.queryProps) innumerable(r, 'queryProps', normalizeProps(route.queryProps));
  innumerable(r, '_pending', { completeCallbacks: {} });
  innumerable(r, '_normalized', route);

  copyOwnProperties(r, route);
  return r;
}

function normalizeRoutes(
  routes: UserConfigRoute[]|NormalizedConfigRouteArray|ConfigRoute[]|null|undefined,
  parent?: ConfigRoute | null,
  options: NormalizeRouteOptions = {}
) {
  const _normalized = getRoutePath(parent);
  if (!options.force && (isNormalizedConfigRouteArray(routes) && routes._normalized === _normalized)) {
    return routes;
  }
  if (routes) {
    routes = routes.map((route: any) => route && normalizeRoute(route, parent, options)).filter(Boolean) as any;
  } else {
    routes = [] as any;
  }
  innumerable(routes as any, '_normalized', _normalized);
  return routes as NormalizedConfigRouteArray;
}

function walkRoutes(
  routes: ConfigRoute[]|RouteChildrenFn,
  walkFn: (route: ConfigRoute, routeIndex: number, routes: ConfigRoute[]) => boolean|void,
  parent?: ConfigRoute
): boolean {
  if (isFunction(routes)) routes = normalizeRoutes(routes(parent), parent);
  return routes.some((route, routeIndex) => {
    if (walkFn(route, routeIndex, routes as ConfigRoute[])) return true;
    if (!route.children || !Array.isArray(route.children)) return;
    return walkRoutes(route.children, walkFn, route);
  });
}


function normalizePath(path: string) {
  const paths = path.split('/');
  if (paths.length > 2 && !paths[paths.length - 1]) paths.splice(paths.length - 1, 1);
  for (let i = paths.length - 1; i > -1; i--) {
    if (paths[i + 1] === '..') paths.splice(i, 2);
    else if (paths[i] === '.') paths.splice(i, 1);
  }
  return paths.join('/').replace(/\/{2,}/g, '/');
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
  routes: ConfigRoute[] | RouteChildrenFn,
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
      route = resolveIndex(route.index, routes as ConfigRoute[]) as ConfigRoute;
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
  options: {
    route?: Route|MatchedRoute|ConfigRoute|RouteHistoryLocation|RouteLocation|null,
    append?: boolean,
    basename?: string,
    mode?: string,
    resolvePathCb?: (path: string, to: RouteHistoryLocation) => string,
    queryProps?: ParseQueryProps
  } = {}
): RouteHistoryLocation | null {
  const {
    route,
    append = false,
    basename = '',
    mode = '',
    resolvePathCb,
    queryProps
  } = options;
  if (!to || (isPlainObject(to) && !to.path && !to.pathname)) return null;
  if (to._routeNormalized) return to;
  if (isString(to)) {
    const searchs = to.match(/\?[^#]+/g) || ([] as string[]);
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
    const hash = getCurrentPageHash(to.pathname);
    if (hash) {
      to.pathname = hash;
      isAbsolute = false;
    }
  }

  if (!isAbsolute) {
    let path = to.pathname || to.path;
    if (resolvePathCb) path = resolvePathCb(path, to);
    path = normalizeRoutePath(
      path,
      route,
      to.append || append,
      (to.absolute || to.basename) ? '' : basename
    ) || '/';
    to.pathname = to.path = path;
  }

  if (to.basename == null && basename != null) to.basename = to.absolute ? '' : basename;

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
  innumerable(to, '_routeNormalized', true);
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

function isBoolean(v: any): v is boolean {
  return typeof v === 'boolean';
}

function normalizeProps(props: UserConfigRouteProps) {
  const res: UserConfigRoutePropsNormal|UserConfigRoutePropsNormalMap = {};
  if (isBoolean(props)) return props;
  if (Array.isArray(props)) {
    props.forEach(key => res[key] = { type: null });
  } else if (isPlainObject(props)) {
    Object.keys(props).forEach(key => {
      const val = props[key];
      res[key] = isPlainObject(val)
        ? (val as any).type !== undefined
          ? val as UserConfigRoutePropsNormalItem
          : normalizeProps(val as any) as Record<string, UserConfigRoutePropsNormalItem>
        : { type: val };
    });
  } else return false;
  return res;
}

function copyOwnProperty(target: any, key: string, source: any): PropertyDescriptor | undefined {
  if (!target || !source) return;
  const d = Object.getOwnPropertyDescriptor(source, key);
  d && Object.defineProperty(target, key, d);
  return d;
}
function copyOwnProperties<T>(target: T, source: any, overwrite?: boolean): T {
  if (!target || !source) return target;
  Object.getOwnPropertyNames(source).forEach(key => {
    if (!overwrite && hasOwnProp(target, key)) return;
    copyOwnProperty(target, key, source);
  });
  return target;
}

type MatchRegxList =RegExp|string|(RegExp|string)[];
function isMatchRegxList(key: string, regx: MatchRegxList): boolean {
  if (Array.isArray(regx)) return regx.some(v => isMatchRegxList(key, v));
  return regx instanceof RegExp ? regx.test(key) : regx === key;
}

function omitProps<T extends Record<string, any>>(props: T, excludes: RegExp|string|(string|RegExp)[]) {
  if (!excludes) return props;
  const ret: Record<string, any> = {};
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

function resolveIndex(originIndex: string | RouteIndexFn, routes: ConfigRoute[]): ConfigRoute | null {
  const index = isFunction(originIndex) ? (originIndex as RouteIndexFn)(routes) : originIndex;
  if (!index) return null;

  const r = routes.find((r: ConfigRoute) => {
    if (index === ':first' && !r.index) {
      const visible = readRouteMeta(r, 'visible');
      if (visible !== false) return true;
    }

    const path1 = r.subpath[0] === '/' ? r.subpath : `/${r.subpath}`;
    const path2 = (index as string)[0] === '/' ? index : `/${index}`;
    return path1 === path2;
  }) || null;
  if (r && r.index) {
    if (r.index === originIndex) return null;
    return resolveIndex(r.index, routes);
  }
  return r;
}

function resolveRedirect(to: string | RouteLocation | RouteRedirectFn | undefined, route: MatchedRoute, options: {
  isInit?: boolean,
  from?: Route,
  queryProps?: ParseQueryProps,
} = {}) {
  if (isFunction(to)) to = (to as RouteRedirectFn).call(route.config, options.from, options.isInit);
  if (!to) return '';
  const ret = normalizeLocation(to, { route, queryProps: options.queryProps });
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
  // getComponent?: (name: string, route: ConfigRoute) => React.ComponentType|null
}

function getConfigRouteProps(configs: UserConfigRouteProps, name?: string) {
  if (configs === false) return;
  if (name && (configs as UserConfigRoutePropsNormalMap)[name] !== undefined) configs = (configs as UserConfigRoutePropsNormalMap)[name];
  if (configs === true) return true;
  else if (isPlainObject(configs)) return Object.keys(configs);
  else if (Array.isArray(configs)) return configs;
  return [];
}

function configRouteProps(_props: Record<string, any>, configs: UserConfigRouteProps, obj: any, name?: string) {
  if (!obj || configs === false) return;
  if (name && (configs as UserConfigRoutePropsNormalMap)[name] !== undefined) configs = (configs as UserConfigRoutePropsNormalMap)[name];
  if (configs === true) Object.assign(_props, obj);
  else if (isPlainObject(configs)) {
    Object.keys(configs).forEach(key => {
      const prop = (configs as UserConfigRoutePropsNormalMap)[key];
      const type = prop.type;
      const val = obj[key];
      if (val === undefined) {
        if (prop.default) {
          if (isFunction(prop.default) && (type === Object || type === Array)) {
            _props[key] = (prop as any).default();
          } else _props[key] = prop.default;
        } else return;
      }
      if (type != null && !isBoolean(type)) _props[key] = (type as Function)(val);
      else _props[key] = val;
    });
  }
}

function renderRoute(
  route: ConfigRoute | MatchedRoute | null | undefined,
  routes: ConfigRoute[],
  props: any,
  children: React.ReactNode | null,
  options: RenderRouteOption = {}
): ReactNode|null {
  if (props === undefined) props = {};
  if (!route) return null;
  if (React.isValidElement(route)) return route;
  if (isMatchedRoute(route)) route = route.config;


  function createComp(route: ConfigRoute, props: any, children: React.ReactNode, options: RenderRouteOption) {
    let component = route.components && route.components[options.name || 'default'];
    if (!component) {
      if (route.children && route.children.length && options.router) {
        component = RouterViewWrapper;
      } else return null;
    }

    const _props = { key: route.path };
    if (route.defaultProps) {
      Object.assign(_props, isFunction(route.defaultProps) ? route.defaultProps(props) : route.defaultProps);
    }
    if (route.props) configRouteProps(_props, route.props, options.params, options.name);
    if (route.paramsProps) configRouteProps(_props, route.paramsProps, options.params, options.name);
    if (route.queryProps) configRouteProps(_props, route.queryProps, options.query, options.name);

    let ref: any = null;
    if (component) {
      if (isAcceptRef(component)) ref = options.ref;
      else if (route.enableRef) {
        if (!isFunction(route.enableRef) || route.enableRef(component)) ref = options.ref;
      }
    }
    const _pending = route._pending;
    const completeCallback = _pending && _pending.completeCallbacks[options.name || 'default'];
    const refHandler = once((el?: any, componentClass?: any) => {
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
    if (isRouteLazy(component)) {
      const routeLazy = component;
      component = createLazyComponent(() => routeLazy.toResolve(
        options.router as any,
        isMatchedRoute(route) ? route.config : route,
        options.name as string
      ));
      warn(`route [${route.path}] component should not be RouteLazy instance!`);
    }
    const ret = React.createElement(
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

  let renderRoute: ConfigRoute|null = route;
  if (route && route.redirect) return null;
  if (route && route.index) renderRoute = resolveIndex(route.index, routes);
  if (!renderRoute) return null;

  const result = createComp(renderRoute, props, children, options) as any;
  return result;
}

function flatten(array: any[]) {
  const flattend: any[] = [];
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
  prev: Record<string, any>|null,
  next: Record<string, any>|null,
  onChanged?: ((key: string, newVal: any, oldVal: any) => boolean)|null,
  keys?: string[]
) {
  if (!prev || !next) return prev !== next;
  return (keys || Object.keys(next)) .some(key => {
    const newVal = next[key];
    const oldVal = prev[key];
    let changed = newVal !== oldVal;
    if (changed && onChanged) changed = onChanged(key, newVal, oldVal);
    return changed;
  });
}

function isRouteChanged(prev: ConfigRoute | MatchedRoute | null, next: ConfigRoute | MatchedRoute | null) {
  if (!prev || !next) return prev !== next;
  return prev.path !== next.path || prev.subpath !== next.subpath;
}

function isMatchedRoutePropsChanged(matchedRoute: MatchedRoute|null, router: ReactViewRouter, name?: string) {
  if (!matchedRoute) return false;
  return router && ['query', 'params'].some(key => {
    let configs = key === 'params'
      ? matchedRoute.config.paramsProps || matchedRoute.config.props
      : matchedRoute.config.queryProps;
    let keys = configs && getConfigRouteProps(configs, name);
    if (!keys) return false;
    if (keys === true) {
      if (!router.currentRoute) return false;
      keys = Object.keys((router.currentRoute as any)[key]);
    }
    return isPropChanged(
      router.currentRoute && ((router as any).currentRoute as any)[key],
      router.prevRoute && ((router as any).prevRoute as any)[key],
      null,
      keys as string[]
    );
  })
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
    if (memoizedState && hasOwnProp(memoizedState, '_routerRoot')) {
      return parent.stateNode as RouterView;
    }
    parent = parent.return;
  }
  return null;
}

function getParentRoute(ctx: any): MatchedRoute | null {
  const view = getHostRouterView(ctx);
  return (view && view.state.currentRoute) || null;
}

function isConfigRoute(value: any): value is ConfigRoute {
  return value && value._normalized && value._pending;
}

function isNormalizedConfigRouteArray(value: any): value is NormalizedConfigRouteArray {
  return Array.isArray(value) && (value as any)._normalized;
}

function isString(value: any): value is string {
  return typeof value === 'string';
}

function isNumber(value: any): value is number {
  return typeof value === 'number';
}

function isAbsoluteUrl(to: any) {
  return isString(to) && /^(https?:)?\/\/.+/.test(to);
}

function getCurrentPageHash(to: string) {
  if (!to || !global.location) return '';
  const [, host = '', hash = ''] = to.match(/(.+)#(.+)$/) || [];
  return global.location.href.startsWith(host) ? hash : '';
}

function getSessionStorage(key: string, json: boolean = false) {
  if (!global.sessionStorage) return null;

  const v = global.sessionStorage[key];
  if (v === undefined) return json ? null : '';
  return json ? JSON.parse(v) : v;
}

function setSessionStorage(key: string, value?: any, replacer?: (number | string)[]|((this: any, key: string, value: any) => any)) {
  if (!global.sessionStorage) return;

  const isNull = value === undefined || value === null;
  const v = isString(value) ? value : JSON.stringify(value, replacer as any);
  if (!v || isNull) global.sessionStorage.removeItem(key);
  else global.sessionStorage[key] = v;
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
  const d = obj && Object.getOwnPropertyDescriptor(obj, key);
  return Boolean(!obj || (d && !d.writable));
}

function isRouteChildrenNormalized(fn: any): fn is NormalizedRouteChildrenFn {
  return fn && fn._normalized;
}

function normalizeRouteChildrenFn(
  childrenFn: RouteChildrenFn | NormalizedRouteChildrenFn,
  checkDirty?: (oldRoutes?: NormalizedConfigRouteArray) => boolean
): NormalizedRouteChildrenFn {
  if (!childrenFn || isRouteChildrenNormalized(childrenFn)) return childrenFn;

  const cache: NormalizedRouteChildrenFn['cache'] = {};
  const ret: RouteChildrenFn = function (parent) {
    const isDirty = checkDirty && checkDirty(cache.routes);
    if (!isDirty && cache.routes) return cache.routes || normalizeRoutes([], parent);
    return cache.routes = normalizeRoutes(childrenFn(parent), parent);
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

function getRouteChildren(children: ConfigRoute[]|RouteChildrenFn, parent?: ConfigRoute|null) {
  if (isFunction(children)) children = children(parent);
  return children || [];
}

function readRouteMeta(configOrMatchedRoute: ConfigRoute|MatchedRoute, key: string = '', props: {
  router?: ReactViewRouter|null,
  [key: string]: any
} = {}) {
  if (!key) return;
  // if (isMatchedRoute(configOrMatchedRoute)) return configOrMatchedRoute.meta[key];

  const route: ConfigRoute = isMatchedRoute(configOrMatchedRoute) ? configOrMatchedRoute.config : configOrMatchedRoute;
  let value = route.meta[key];
  if (isFunction(value)) {
    const routes = route.parent ? route.parent.children : (props.router && props.router.routes);
    value = (value as RouteMetaFunction)(
      route,
      (isFunction(routes) ? normalizeRoutes(routes(route.parent), route.parent) : routes) || normalizeRoutes([], route.parent),
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
  const ret: T[] = [];
  for (let i = originArray.length - 1; i >= 0; i--) {
    ret.push(originArray[i]);
  }
  return ret;
}

function createUserConfigRoute(route: UserConfigRoute): UserConfigRoute {
  return route;
}

function createUserConfigRoutes<T extends RouteChildrenFn | NormalizedRouteChildrenFn>(routes: T): T
function createUserConfigRoutes(routes: Array<UserConfigRoute|ConfigRoute>) {
  return routes;
}

const EMPTY_ROTUE_STATE_NAME = 'empty-state';
function createEmptyRouteState() {
  return innumerable({}, EMPTY_ROTUE_STATE_NAME, true);
}

function isEmptyRouteState(state: any) {
  return !state || state[EMPTY_ROTUE_STATE_NAME];
}

export {
  DEFAULT_STATE_NAME,
  MatchRegxList,

  camelize,
  flatten,
  warn,
  once,
  ignoreCatch,
  mergeFns,
  reverseArray,
  copyOwnProperty,
  copyOwnProperties,
  isAcceptRef,
  nextTick,
  hasOwnProp,
  isNull,
  isBoolean,
  isString,
  isNumber,
  isPlainObject,
  isFunction,
  isMatchedRoute,
  isLocation,
  isConfigRoute,
  isNormalizedConfigRouteArray,
  isHistoryLocation,
  isPropChanged,
  isRouteChanged,
  isRoutesChanged,
  isMatchedRoutePropsChanged,
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
  configRouteProps,
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

  createUserConfigRoute,
  createUserConfigRoutes,

  createEmptyRouteState,
  isEmptyRouteState
};
