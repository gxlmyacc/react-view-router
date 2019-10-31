import React from 'react';
import config from './config';
import { RouteLazy } from './route-lazy';
import { REACT_FORWARD_REF_TYPE, getGuardsComponent } from './route-guard';
import matchPath, { computeRootMatch } from './match-path';

function nextTick(cb, ctx) {
  if (!cb) return;
  return new Promise(function (resolve) {
    setTimeout(() => resolve(ctx ? cb.call(ctx) : cb()), 0);
  });
}

function innumerable(obj, key, value, options = { configurable: true }) {
  Object.defineProperty(obj, key, { value, ...options });
  return obj;
}

function normalizePath(path) {
  const paths = path.split('/');
  if (paths.length > 2 && !paths[paths.length - 1]) paths.splice(paths.length - 1, 1);
  for (let i = paths.length - 1; i > -1; i--) {
    if (paths[i + 1] === '..') paths.splice(i, 2);
    else if (paths[i] === '.') paths.splice(i, 1);
  }
  return paths.join('/');
}

function normalizeRoute(route, parent, depth = 0, force) {
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
      comp.updaters.push(c => {
        if (c.__children) {
          let children = c.__children || [];
          if (isFunction(children)) children = children(r) || [];
          innumerable(r, 'children', normalizeRoutes(children, r, depth + 1));
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
  innumerable(r, '_pending', { afterEnterGuards: {}, completeCallbacks: {} });
  return r;
}

function normalizeRoutes(routes, parent, depth = 0, force = false) {
  if (!routes) routes = [];
  if (!force && routes._normalized) return routes;
  routes = routes.map(route => normalizeRoute(route, parent, depth || 0, force)).filter(Boolean);
  Object.defineProperty(routes, '_normalized', { value: true });
  return routes;
}

function normalizeRoutePath(path, route, append) {
  if (route && route.matched) route = route.matched[route.matched.length - 1];
  if (!path || path[0] === '/' || !route) return path || '';
  if (route.config) route = route.config;
  let parent = (append || /^\.\//.test(path)) ? route : route.parent;
  while (parent && path[0] !== '/') {
    path = `${parent.path}/${path}`;
    parent = route.parent;
  }
  return normalizePath(path);
}

function resloveIndex(index, routes) {
  index = isFunction(index) ? index() : index;
  let r = routes.find(r => r.subpath === index);
  if (r && r.index) {
    if (r.index === index) return null;
    return resloveIndex(r.index, routes);
  }
  return r;
}

function matchRoutes(routes, to, parent, branch) {
  if (branch === undefined) branch = [];
  to = normalizeLocation(to);

  if (isFunction(routes)) {
    routes = normalizeRoutes(routes({
      location,
      parent,
      branch,
      prevChildren: parent && parent.prevChildren
    }), parent);
    if (parent) parent.prevChildren = routes;
  }

  for (let route of routes) {
    let match = route.path
      ? matchPath(to.path, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        : computeRootMatch(to.path); // use default "root" match

    if (match && route.index) {
      route = resloveIndex(route.index, routes);
      if (!route) continue;
      else to.pathname = to.path = route.path;
    }

    if (match) {
      branch.push({ route,  match });

      if (route.children) matchRoutes(route.children, to, route, branch);
    }
    if (match) break;
  }
  return branch;
}

function normalizeLocation(to, route, append) {
  if (!to) return to;
  if (typeof to === 'string') {
    const [pathname, search] = to.split('?');
    to = { pathname, search: search ? `?${search}` : '', fullPath: to };
  }
  if (to.query) Object.keys(to.query).forEach(key => (to.query[key] === undefined) && (delete to.query[key]));
  else if (to.search) to.query = config.parseQuery(to.search.substr(1));

  to.pathname = to.path = normalizeRoutePath(to.pathname || to.path, route, to.append || append);
  to.search = to.search || (to.query ? config.stringifyQuery(to.query) : '');
  if (!to.query) to.query = {};
  return to;
}

const _toString = Object.prototype.toString;
function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}
function isFunction(value) {
  return typeof value === 'function';
}

function isLocation(v) {
  return isPlainObject(v) && (v.path || v.pathname);
}

function normalizeProps(props) {
  let res = {};
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

function once(fn, ctx) {
  let ret;
  return function _once(...args) {
    if (!fn) return ret;
    const _fn = fn;
    fn = null;
    ret = _fn.call(ctx || this, ...args);
    return ret;
  };
}


function isAcceptRef(v) {
  if (!v) return false;
  if (v.$$typeof === REACT_FORWARD_REF_TYPE && v.__componentClass) return true;
  if (v.__component) v = getGuardsComponent(v);

  let ret = false;
  if (v.prototype) {
    if (v.prototype instanceof React.Component || v.prototype.componentDidMount !== undefined) ret = true;
  } else if (v.$$typeof === REACT_FORWARD_REF_TYPE && !v.__guards) ret = true;
  return ret;
}

function mergeFns(...fns) {
  return function (...args) {
    let ret;
    fns.forEach(fn => {
      ret = fn && fn.call(this, ...args);
    });
    return ret;
  };
}

function resolveRedirect(to, route, from) {
  if (isFunction(to)) to = to.call(route, from);
  if (!to) return '';
  to = normalizeLocation(to, route);
  from && Object.assign(to.query, from.query);
  to.isRedirect = true;
  return to;
}

function warn(...args) {
  console.warn(...args);
}

async function afterInterceptors(interceptors, ...args) {
  for (let i = 0; i < interceptors.length; i++) {
    let interceptor = interceptors[i];
    while (interceptor && interceptor.lazy) interceptor = await interceptor(interceptors, i);
    if (!interceptor) return;

    interceptor && await interceptor.call(this, ...args);
  }
}

function renderRoute(route, routes, props, children, options = {}) {
  if (props === undefined) props = {};
  if (!route) return null;
  if (React.isValidElement(route)) return route;
  if (route.config) route = route.config;

  function configProps(_props, configs, obj, name) {
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
  function createComp(route, props, children, options) {
    let component = route.components && route.components[options.name || 'default'];
    if (!component) return null;

    const _props = {};
    if (route.defaultProps) {
      Object.assign(_props, isFunction(route.defaultProps) ? route.defaultProps(props) : route.defaultProps);
    }
    if (route.props) configProps(_props, route.props, options.params, options.name);
    if (route.paramsProps) configProps(_props, route.paramsProps, options.params, options.name);
    if (route.queryProps) configProps(_props, route.queryProps, options.query, options.name);

    let ref = null;
    if (component) {
      if (isAcceptRef(component)) ref = options.ref;
      else if (route.enableRef) {
        if (!isFunction(route.enableRef) || route.enableRef(component)) ref = options.ref;
      }
    }
    const _pending = route._pending;
    const afterEnterGuards = _pending.afterEnterGuards[options.name] || [];
    const completeCallback = _pending.completeCallbacks[options.name];
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
        afterEnterGuards && afterInterceptors.call(el, afterEnterGuards);
      }
    });
    _pending.completeCallbacks[options.name] = null;
    _pending.afterEnterGuards[options.name] = [];
    if (ref) ref = mergeFns(ref, el => el && refHandler && refHandler(el, component.__componentClass));
    if (component.__component) component = getGuardsComponent(component);
    const ret = React.createElement(
      component,
      Object.assign(
        _props,
        props,
        config.inheritProps ? { route } : null,
        { ref }
      ),
      ...(Array.isArray(children) ? children : [children])
    );
    if (!ref) nextTick(refHandler);
    return ret;
  }

  let renderRoute = route;
  if (route.redirect) return null;
  if (route.index) renderRoute = resloveIndex(route.index, routes);
  if (!renderRoute) return null;

  let result = createComp(renderRoute, props, children, options);
  if (options.container) result = options.container(result, route, props);
  return result;
}

function flatten(array) {
  let flattend = [];
  (function flat(array) {
    array.forEach(function (el) {
      if (Array.isArray(el)) flat(el);
      else flattend.push(el);
    });
  })(array);
  return flattend;
}

function camelize(str) {
  let ret = str.replace(/[-|:](\w)/g, function (_, c) { return c ? c.toUpperCase() : ''; });
  if (/^[A-Z]/.test(ret)) ret = ret.charAt(0).toLowerCase() + ret.substr(1);
  return ret;
}

function isRouteChanged(prev, next) {
  if (prev && next) return prev.path !== next.path && prev.subpath !== next.subpath;
  if ((!prev || !next) && prev !== next) return true;
  return false;
}

function isRoutesChanged(prevs, nexts) {
  if (!prevs || !nexts) return true;
  if (prevs.length !== nexts.length) return true;
  let changed = false;
  prevs.some((prev, i) => {
    changed = isRouteChanged(prev, nexts[i]);
    return changed;
  });
  return changed;
}

function getParentRouterView(ctx) {
  let parent = ctx._reactInternalFiber.return;
  while (parent) {
    const memoizedState = parent.memoizedState;
    // const memoizedProps = parent.memoizedProps;
    if (memoizedState && memoizedState._routerView) return parent.stateNode;
    parent = parent.return;
  }
}

function getParentRoute(ctx) {
  const view = getParentRouterView(ctx);
  return (view && view.state.currentRoute) || null;
}

function isAbsoluteUrl(to) {
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
  isPlainObject,
  isFunction,
  isLocation,
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
  getParentRouterView
};
