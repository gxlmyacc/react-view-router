import { matchPath, withRouter, Router, Route, Redirect, Switch } from 'react-router-dom';
import React from 'react';
import qs from './qs';
import { RouteLazy } from './route-lazy';
import { REACT_FORWARD_REF_TYPE, RouteCuards } from './route-guard';

function nextTick(cb, ctx) {
  if (!cb) return;
  return new Promise(function (resolve) {
    setTimeout(() => resolve(ctx ? cb.call(ctx) : cb()), 0);
  });
}

function resolveRouteGuards(c, route) {
  if (c && c.__guards && !c.__resolved) {
    if (route) {
      if (route.guards) route.guards.merge(c.__guards);
      else route.guards = c.__guards;
    }
    c.__resolved = true;
    // c = c.__component;
  }
  return c;
}

function normalizeRoute(route, parent) {
  const path = parent ? `${parent.path}${route.path === '/' ? '' : `/${route.path}`}` : route.path;
  let r = { ...route, subpath: route.path, path };
  if (parent) r.parent = parent;
  if (r.children && !isFunction(r.children)) r.children = normalizeRoutes(r.children, r);
  r.exact = r.exact === undefined
    ? Boolean(!r.children || !r.children.length)
    : r.exact;
  if (r.component instanceof RouteLazy) {
    r.component.updater = c => r.component = resolveRouteGuards(c, r);
  }
  if (r.components) {
    Object.keys(r.components).forEach(key => {
      let comp = r.components[key];
      if (comp instanceof RouteLazy) {
        comp.updater = c => r.components[key] = resolveRouteGuards(c, r);
      }
    });
  }
  if (!r.meta) r.meta = {};
  if (r.props) r.props = normalizeProps(r.props);
  if (r.paramsProps) r.paramsProps = normalizeProps(r.paramsProps);
  if (r.queryProps) r.queryProps = normalizeProps(r.queryProps);
  if (r.guards && !(r.guards instanceof RouteCuards)) r.guards = new RouteCuards(r.guards);
  Object.defineProperty(r, '_pending', { value: { afterEnterGuards: [] } });
  return r;
}

function normalizeRoutes(routes, parent) {
  if (!routes) routes = [];
  if (routes._normalized) return routes;
  routes = routes.filter(Boolean).map(route => normalizeRoute(route, parent));
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

function matchRoutes(routes, location, branch, parent) {
  if (branch === undefined) branch = [];
  location = normalizeLocation(location);

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
      ? matchPath(location.path, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        : Router.computeRootMatch(location.path); // use default "root" match

    if (match) {
      branch.push({ route,  match });

      if (route.children) matchRoutes(route.children, location, branch, route);
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
  let ret = false;
  if (!v) return;
  if (v.prototype) {
    if (v.prototype instanceof React.Component || v.prototype.componentDidMount !== undefined) ret = true;
  } else if (v.$$typeof === REACT_FORWARD_REF_TYPE && (!v.__guards || v.__componentClass)) ret = true;
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

function renderRoutes(routes, extraProps, switchProps, options = {}) {
  if (extraProps === undefined) extraProps = {};
  if (switchProps === undefined) switchProps = {};

  function getRouteComp(route) {
    if (options.name) return route.components && route.components[options.name];
    return route.component || (route.components && route.components.default);
  }
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
    if (route.props) configProps(_props, route.props, options.params, options.name);
    if (route.paramsProps) configProps(_props, route.paramsProps, options.params, options.name);
    if (route.queryProps) configProps(_props, route.queryProps, options.query, options.name);
    if (route.render) return route.render(Object.assign(_props, props, extraProps, { route }));
    component = resolveRouteGuards(component, route);
    let ref = null;
    if (component) {
      if (isAcceptRef(component)) ref = options.ref;
      else if (route.enableRef) {
        if (!isFunction(route.enableRef) || route.enableRef(component)) ref = options.ref;
      }
    }
    const afterEnterGuards = route._pending.afterEnterGuards || [];
    const completeCallback = route._pending.completeCallback;
    let refHandler = once((el, componentClass) => {
      if (el) {
        // if (isFunction(componentClass)) componentClass = componentClass(el, route);
        if (componentClass && el._reactInternalFiber) {
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
        }
        completeCallback && completeCallback(el);
        afterEnterGuards && afterEnterGuards.forEach(v => v.call(el));
      }
    });
    route._pending.completeCallback = null;
    route._pending.afterEnterGuards = [];
    if (ref) ref = mergeFns(ref, el => el && refHandler && refHandler(el, component.__componentClass));
    const ret = React.createElement(
      component.__component || component,
      Object.assign(_props, props, extraProps, {
        route,
        ref
      })
    );
    if (!ref) nextTick(refHandler);
    return ret;
  }
  const currentRoute = options.router && options.router.currentRoute;
  const ret = routes ? React.createElement(Switch, switchProps, routes.map(function (route, i) {
    if (route.redirect) {
      return React.createElement(Redirect, {
        key: route.key || i,
        exact: route.exact,
        strict: route.strict,
        from: route.path,
        to: resolveRedirect(route.redirect, route, currentRoute)
      });
    }
    const component = getRouteComp(route);
    return React.createElement(Route, {
      key: route.key || i,
      path: route.path,
      exact: route.exact,
      strict: route.strict,
      render: props => renderComp(route, component, props, options)
    });
  })) : null;
  return ret;
}


export {
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
  renderRoutes,
  resolveRouteGuards
};
