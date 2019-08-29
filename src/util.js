import { matchPath, withRouter, Router, Route, Redirect, Switch } from 'react-router-dom';
import React from 'react';
import qs from './qs';
import { RouteLazy } from './route-lazy';
import { REACT_FORWARD_REF_TYPE, getGuardsComponent } from './route-guard';

function nextTick(cb, ctx) {
  if (!cb) return;
  return new Promise(function (resolve) {
    setTimeout(() => resolve(ctx ? cb.call(ctx) : cb()), 0);
  });
}

function normalizeRoute(route, parent, depth) {
  const path = parent ? `${parent.path}${route.path === '/' ? '' : `/${route.path}`}` : route.path;
  let r = { ...route, subpath: route.path, path, depth };
  if (parent) r.parent = parent;
  if (r.children && !isFunction(r.children)) r.children = normalizeRoutes(r.children, r, depth + 1);
  r.exact = r.exact === undefined
    ? Boolean(!r.children || !r.children.length)
    : r.exact;
  if (!r.components) r.components = {};
  if (r.component) {
    r.components.default = r.component;
    delete r.component;
  }
  Object.keys(r.components).forEach(key => {
    let comp = r.components[key];
    if (comp instanceof RouteLazy) {
      comp.updater = c => {
        if (c.__children) {
          let children = c.__children;
          if (isFunction(children)) children = children(r) || [];
          r.children = normalizeRoutes(children, r, depth + 1);
        }
        return r.components[key] = c;
      };
    }
  });
  if (!r.meta) r.meta = {};
  if (r.props) r.props = normalizeProps(r.props);
  if (r.paramsProps) r.paramsProps = normalizeProps(r.paramsProps);
  if (r.queryProps) r.queryProps = normalizeProps(r.queryProps);
  Object.defineProperty(r, '_pending', { value: { afterEnterGuards: {}, completeCallbacks: {} } });
  return r;
}

function normalizeRoutes(routes, parent, depth) {
  if (!routes) routes = [];
  if (routes._normalized) return routes;
  routes = routes.map(route => normalizeRoute(route, parent, depth)).filter(Boolean);
  Object.defineProperty(routes, '_normalized', { value: true });
  return routes;
}

function normalizeRoutePath(path, route) {
  if (!path || path[0] === '/' || !route) return path || '';
  if (route.config) route = route.config;
  let parent = route.parent;
  while (parent && path[0] !== '/') {
    path = `${parent.path}/${path}`;
    parent = route.parent;
  }
  return path;
}

function matchRoutes(routes, to, branch, parent) {
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
        : Router.computeRootMatch(to.path); // use default "root" match

    if (match) {
      branch.push({ route,  match });

      if (route.children) matchRoutes(route.children, to, branch, route);
    }
    if (match) break;
  }
  return branch;
}

function normalizeLocation(to, route) {
  if (!to) return to;
  if (typeof to === 'string') {
    const [pathname, search] = to.split('?');
    to = { pathname, search: search ? `?${search}` : '' };
  }
  to.pathname = to.path = normalizeRoutePath(to.pathname || to.path, route);
  to.search = to.search || (to.query ? qs.stringifyQuery(to.query) : '');
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
  return function (...args) {
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
  to = normalizeLocation(to, route);
  to.isRedirect = true;
  return to;
}

function warn(...args) {
  console.warn(...args);
}

function renderRoutes(routes, extraProps, switchProps, options = {}) {
  if (!routes) return null;

  if (extraProps === undefined) extraProps = {};
  if (switchProps === undefined) switchProps = {};

  function configProps(_props, configs, obj, name) {
    if (!obj) return;
    if (name && configs[name] !== undefined) configs = configs[name];
    if (configs === true) _props = obj ? { ...obj } : {};
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
  function renderComp(route, component, props, options) {
    if (!component) return null;
    const _props = {};
    if (route.defaultProps) {
      Object.assign(_props, isFunction(route.defaultProps) ? route.defaultProps(props) : route.defaultProps);
    }
    if (route.props) configProps(_props, route.props, options.params, options.name);
    if (route.paramsProps) configProps(_props, route.paramsProps, options.params, options.name);
    if (route.queryProps) configProps(_props, route.queryProps, options.query, options.name);
    if (route.render) return route.render(Object.assign(_props, props, extraProps, { route }));
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
        afterEnterGuards && afterEnterGuards.forEach(v => v.call(el));
      }
    });
    _pending.completeCallbacks[options.name] = null;
    _pending.afterEnterGuards[options.name] = [];
    if (ref) ref = mergeFns(ref, el => el && refHandler && refHandler(el, component.__componentClass));
    if (component.__component) component = getGuardsComponent(component);
    const ret = React.createElement(
      component,
      Object.assign(_props, props, extraProps, {
        route,
        ref
      })
    );
    if (!ref) nextTick(refHandler);
    return ret;
  }

  const currentRoute = options.router && options.router.currentRoute;
  let children = routes.map(function (route, i) {
    if (route.redirect) {
      return React.createElement(Redirect, {
        key: route.key || i,
        exact: route.exact,
        strict: route.strict,
        from: route.path,
        to: resolveRedirect(route.redirect, route, currentRoute)
      });
    }
    return React.createElement(Route, {
      key: route.key || i,
      path: route.path,
      exact: route.exact,
      strict: route.strict,
      render: props => renderComp(route, route.components[options.name || 'default'], props, options)
    });
  });
  if (options.routesContainer) children = options.routesContainer(children);
  const ret = React.createElement(Switch, switchProps, children);
  return ret;
}


export {
  warn,
  once,
  mergeFns,
  isAcceptRef,
  nextTick,
  isPlainObject,
  isFunction,
  isLocation,
  withRouter,
  resolveRedirect,
  normalizeRoute,
  normalizeRoutes,
  normalizeRoutePath,
  normalizeLocation,
  normalizeProps,
  matchPath,
  matchRoutes,
  renderRoutes
};
