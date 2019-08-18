import { matchPath, withRouter, Router, Route, Redirect, Switch } from 'react-router-dom';
import React from 'react';
import qs from './qs';
import { RouteLazy } from './route-lazy';
import { REACT_FORWARD_REF_TYPE } from './route-guard';

function resolveRouteGuards(c, route) {
  if (c && c.__guards) {
    if (route) {
      if (route.guards) route.guards.merge(c.__guards);
      else route.guards = c.__guards;
    }
    c = c.__component;
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
  if (r.props) r.props = normalizeProps(r.props);
  if (r.paramsProps) r.paramsProps = normalizeProps(r.paramsProps);
  if (r.queryProps) r.queryProps = normalizeProps(r.queryProps);
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

function normalizeLocation(to, parent) {
  if (!to) return to;
  if (typeof to === 'string') to = { pathname: to };
  to.pathname = to.path = normalizeRoutePath(to.pathname || to.path, parent);
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

function renderRoutes(routes, extraProps, switchProps, options = {}) {
  if (extraProps === undefined) extraProps = {};
  if (switchProps === undefined) switchProps = {};

  function getRouteComp(route) {
    if (options.name) return route.components && route.renderComponent[options.name];
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
      if (component.prototype) {
        if (component.prototype instanceof React.Component
          || component.prototype.componentDidMount !== undefined) ref = options.ref;
      } else if (component.$$typeof === REACT_FORWARD_REF_TYPE) ref = options.ref;
    }
    const ret = React.createElement(
      component,
      Object.assign(_props, props, extraProps, {
        route,
        ref
      })
    );
    // console.log('renderComp', route, ret);
    return ret;
  }
  const ret = routes ? React.createElement(Switch, switchProps, routes.map(function (route, i) {
    if (route.redirect) {
      let to = route.redirect;
      if (isFunction(to)) to = to({ ...extraProps, route });
      to = normalizeLocation(to, route);
      return React.createElement(Redirect, {
        key: route.key || i,
        exact: route.exact,
        strict: route.strict,
        from: route.path,
        to,
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
  isPlainObject,
  isFunction,
  isLocation,
  withRouter,
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
