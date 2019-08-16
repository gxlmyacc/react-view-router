import { matchPath, withRouter, Router, Route, Redirect, Switch } from 'react-router-dom';
import React from 'react';
import qs from './qs';

class RouterCache {
  constructor() {
    this.cached = {};
    this.seed = 0;
  }

  create(data) {
    const key = `[route_cache_id:${++this.seed}]`;
    this.cached[key] = data;
    return key;
  }

  flush(seed) {
    if (!seed) return;
    let ret = this.cached[seed];
    delete this.cached[seed];
    return ret;
  }
}

export const routeCache = new RouterCache();

export class RouteLazy {
  constructor(importMethod) {
    this.importMethod = importMethod;
    this.resolved = false;
    this.updater = null;
  }

  toResolve() {
    return new Promise((resolve, reject) => {
      let _resolve = v => {
        if (this.updater) v = this.updater(v) || v;
        this.resolved = true;
        resolve(v);
      };
      let component = this.importMethod();
      if (component instanceof Promise) {
        component.then(c => {
          component = c.__esModule ? c.default : c;
          return _resolve(component);
        }).catch(function () { return reject(arguments); });
      } else _resolve(component);
    });
  }
}

export async function resolveRouteLazyList(matched) {
  if (!matched) return;
  const toResolve = function (routeLazy) {
    if (!routeLazy || !(routeLazy instanceof RouteLazy)) return;
    return routeLazy.toResolve();
  };
  for (let r of matched) {
    const config = r.config;
    await toResolve(config.component, config);
    if (config.components) {
      for (let key of config.components) await toResolve(config.components[key], config);
    }
  }
}

export function lazyImport(importMethod) {
  return new RouteLazy(importMethod);
}

export function resolveRouteGuards(c, route) {
  if (c && c.__guards) {
    if (route) {
      if (route.routeGuards) route.routeGuards.merge(c.__guardss);
      else route.routeGuards = c.__guards;
    }
    c = c.__component;
  }
  return c;
}

function normalizeRoutes(routes, parent) {
  if (!routes) routes = [];
  if (routes._normalized) return routes;
  let ret = routes.map((route, routeIndex) => {
    if (route instanceof RouteLazy) {
      route.updater = r => routes[routeIndex] = r;
      return;
    }
    let r = { ...route, subpath: route.path };
    r.path = parent ? `${parent.path}${r.path === '/' ? '' : `/${r.path}`}` : r.path;
    if (parent) r.parent = parent;
    if (r.children && !isFunction(r.children)) r.children = normalizeRoutes(r.children, r);
    if (r.exact === undefined && r.redirect) r.exact = true;
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
  });
  Object.defineProperty(ret, '_normalized', {
    enumerable: false,
    configurable: false,
    value: true
  });
  return ret;
}

function normalizeRoutePath(route, path) {
  if (!path || path[0] === '/') return path;
  let parent = route.parent;
  while (parent && path[0] !== '/') {
    path = `${parent.path}/${path}`;
    parent = route.parent;
  }
  return path;
}

function matchRoutes(routes, pathname, branch, parent) {
  if (branch === undefined) branch = [];

  if (isFunction(routes)) routes = routes(pathname, parent, branch);

  for (let route of routes) {
    let match = route.path
      ? matchPath(pathname, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        : Router.computeRootMatch(pathname); // use default "root" match

    if (match) {
      branch.push({ route,  match });

      if (route.children) matchRoutes(route.children, pathname, branch, route);
    }
    if (match) break;
  }
  return branch;
}

function normalizeLocation(location) {
  if (typeof location === 'string') location = { path: location };
  const { path, pathname, query, search, ...others } = location;
  return {
    pathname: path || pathname,
    search: query ? qs.stringifyQuery(query) : (search || ''),
    ...others
  };
}

const _toString = Object.prototype.toString;
export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}
export function isFunction(value) {
  return typeof value === 'function';
}

export function isLocation(v) {
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

    const ret = React.createElement(
      component,
      Object.assign(_props, props, extraProps, {
        route
      })
    );
    // console.log('renderComp', route, ret);
    return ret;
  }
  const ret = routes ? React.createElement(Switch, switchProps, routes.map(function (route, i) {
    const exact = route.exact === undefined
      ? Boolean(!route.children || !route.children.length)
      : route.exact;
    if (route.redirect) {
      let to = route.redirect;
      if (typeof to === 'function') to = to(Object.assign({}, extraProps, { route }));
      to = normalizeLocation(to);
      to.pathname = normalizeRoutePath(route, to.pathname);
      return React.createElement(Redirect, {
        key: route.key || i,
        exact,
        strict: route.strict,
        from: route.path,
        to,
      });
    }
    const component = getRouteComp(route);
    return React.createElement(Route, {
      key: route.key || i,
      path: route.path,
      exact,
      strict: route.strict,
      render: props => renderComp(route, component, props, options)
    });
  })) : null;
  return ret;
}


export {
  withRouter,
  normalizeRoutes,
  normalizeRoutePath,
  normalizeLocation,
  normalizeProps,
  matchPath,
  matchRoutes,
  renderRoutes
};
