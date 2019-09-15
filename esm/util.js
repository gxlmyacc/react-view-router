"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flatten = flatten;
exports.warn = warn;
exports.once = once;
exports.mergeFns = mergeFns;
exports.isAcceptRef = isAcceptRef;
exports.nextTick = nextTick;
exports.isPlainObject = isPlainObject;
exports.isFunction = isFunction;
exports.isLocation = isLocation;
exports.resolveRedirect = resolveRedirect;
exports.normalizePath = normalizePath;
exports.normalizeRoute = normalizeRoute;
exports.normalizeRoutes = normalizeRoutes;
exports.normalizeRoutePath = normalizeRoutePath;
exports.normalizeLocation = normalizeLocation;
exports.normalizeProps = normalizeProps;
exports.matchRoutes = matchRoutes;
exports.renderRoutes = renderRoutes;
exports.innumerable = innumerable;
Object.defineProperty(exports, "matchPath", {
  enumerable: true,
  get: function get() {
    return _reactRouterDom.matchPath;
  }
});
Object.defineProperty(exports, "withRouter", {
  enumerable: true,
  get: function get() {
    return _reactRouterDom.withRouter;
  }
});

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _reactRouterDom = require("react-router-dom");

var _react = _interopRequireDefault(require("react"));

var _config = _interopRequireDefault(require("./config"));

var _routeLazy = require("./route-lazy");

var _routeGuard = require("./route-guard");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function nextTick(cb, ctx) {
  if (!cb) return;
  return new Promise(function (resolve) {
    setTimeout(function () {
      return resolve(ctx ? cb.call(ctx) : cb());
    }, 0);
  });
}

function innumerable(obj, key, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    configurable: true,
    writable: true
  };
  Object.defineProperty(obj, key, Object.assign({
    value: value
  }, options));
  return obj;
}

function normalizePath(path) {
  var paths = path.split('/');
  if (paths.length > 2 && !paths[paths.length - 1]) paths.splice(paths.length - 1, 1);

  for (var i = paths.length - 1; i > -1; i--) {
    if (paths[i + 1] === '..') paths.splice(i, 2);else if (paths[i] === '.') paths.splice(i, 1);
  }

  return paths.join('/');
}

function normalizeRoute(route, parent, depth, force) {
  var path = normalizePath(parent ? "".concat(parent.path, "/").concat(route.path.replace(/^(\/)/, '')) : route.path);

  var r = _objectSpread({}, route, {
    subpath: route.path,
    path: path,
    depth: depth
  });

  if (parent) innumerable(r, 'parent', parent);
  if (r.children && !isFunction(r.children)) r.children = normalizeRoutes(r.children, r, depth + 1, force);
  r.exact = r.exact === undefined ? Boolean(!r.children || !r.children.length) : r.exact;
  if (!r.components) r.components = {};

  if (r.component) {
    r.components.default = r.component;
    delete r.component;
  }

  Object.keys(r.components).forEach(function (key) {
    var comp = r.components[key];

    if (comp instanceof _routeLazy.RouteLazy) {
      comp.updaters.push(function (c) {
        if (c.__children) {
          var children = c.__children || [];
          if (isFunction(children)) children = children(r) || [];
          r.children = normalizeRoutes(children, r, depth + 1);
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
  innumerable(r, '_pending', {
    afterEnterGuards: {},
    completeCallbacks: {}
  });
  return r;
}

function normalizeRoutes(routes, parent, depth) {
  var force = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!routes) routes = [];
  if (!force && routes._normalized) return routes;
  routes = routes.map(function (route) {
    return normalizeRoute(route, parent, depth || 0, force);
  }).filter(Boolean);
  Object.defineProperty(routes, '_normalized', {
    value: true
  });
  return routes;
}

function normalizeRoutePath(path, route) {
  if (!path || path[0] === '/' || !route) return path || '';
  if (route.config) route = route.config;
  var parent = route.parent;

  while (parent && path[0] !== '/') {
    path = "".concat(parent.path, "/").concat(path);
    parent = route.parent;
  }

  return normalizePath(path);
}

function matchRoutes(routes, to, branch, parent) {
  if (branch === undefined) branch = [];
  to = normalizeLocation(to);

  if (isFunction(routes)) {
    routes = normalizeRoutes(routes({
      location: location,
      parent: parent,
      branch: branch,
      prevChildren: parent && parent.prevChildren
    }), parent);
    if (parent) parent.prevChildren = routes;
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = routes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var route = _step.value;
      var match = route.path ? (0, _reactRouterDom.matchPath)(to.path, route) : branch.length ? branch[branch.length - 1].match // use parent match
      : _reactRouterDom.Router.computeRootMatch(to.path); // use default "root" match

      if (match) {
        branch.push({
          route: route,
          match: match
        });
        if (route.children) matchRoutes(route.children, to, branch, route);
      }

      if (match) break;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return branch;
}

function normalizeLocation(to, route) {
  if (!to) return to;

  if (typeof to === 'string') {
    var _to$split = to.split('?'),
        _to$split2 = _slicedToArray(_to$split, 2),
        pathname = _to$split2[0],
        search = _to$split2[1];

    to = {
      pathname: pathname,
      search: search ? "?".concat(search) : ''
    };
  }

  to.pathname = to.path = normalizeRoutePath(to.pathname || to.path, route);
  to.search = to.search || (to.query ? _config.default.stringifyQuery(to.query) : '');
  return to;
}

var _toString = Object.prototype.toString;

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
  var res = {};

  if (Array.isArray(props)) {
    props.forEach(function (key) {
      return res[key] = {
        type: null
      };
    });
  } else if (isPlainObject(props)) {
    Object.keys(props).forEach(function (key) {
      var val = props[key];
      res[key] = isPlainObject(val) ? val.type !== undefined ? val : normalizeProps(val) : {
        type: val
      };
    });
  } else return props;

  return res;
}

function once(fn, ctx) {
  var ret;
  return function () {
    if (!fn) return ret;
    var _fn = fn;
    fn = null;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    ret = _fn.call.apply(_fn, [ctx || this].concat(args));
    return ret;
  };
}

function isAcceptRef(v) {
  if (!v) return false;
  if (v.$$typeof === _routeGuard.REACT_FORWARD_REF_TYPE && v.__componentClass) return true;
  if (v.__component) v = (0, _routeGuard.getGuardsComponent)(v);
  var ret = false;

  if (v.prototype) {
    if (v.prototype instanceof _react.default.Component || v.prototype.componentDidMount !== undefined) ret = true;
  } else if (v.$$typeof === _routeGuard.REACT_FORWARD_REF_TYPE && !v.__guards) ret = true;

  return ret;
}

function mergeFns() {
  for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
  }

  return function () {
    var _this = this;

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var ret;
    fns.forEach(function (fn) {
      ret = fn && fn.call.apply(fn, [_this].concat(args));
    });
    return ret;
  };
}

function resolveRedirect(to, route, from) {
  if (isFunction(to)) to = to.call(route, from);
  if (!to) return '';
  to = normalizeLocation(to, route);
  to.isRedirect = true;
  return to;
}

function warn() {
  var _console;

  (_console = console).warn.apply(_console, arguments);
}

function renderRoutes(routes, extraProps, switchProps) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  if (!routes) return null;
  if (extraProps === undefined) extraProps = {};
  if (switchProps === undefined) switchProps = {};

  function configProps(_props, configs, obj, name) {
    if (!obj) return;
    if (name && configs[name] !== undefined) configs = configs[name];
    if (configs === true) _props = obj ? _objectSpread({}, obj) : {};else if (isPlainObject(configs)) {
      Object.keys(configs).forEach(function (key) {
        var prop = configs[key];
        var type = prop.type;
        var val = obj[key];

        if (val === undefined) {
          if (prop.default) {
            if (typeof prop.default === 'function' && (type === Object || type === Array)) {
              _props[key] = prop.default();
            } else _props[key] = prop.default;
          } else return;
        }

        if (type !== null) _props[key] = type(val);else _props[key] = val;
      });
    }
  }

  function renderComp(route, component, routeProps, options) {
    if (!component) return null;
    var _props = {};

    if (route.defaultProps) {
      Object.assign(_props, isFunction(route.defaultProps) ? route.defaultProps(routeProps) : route.defaultProps);
    }

    if (route.props) configProps(_props, route.props, options.params, options.name);
    if (route.paramsProps) configProps(_props, route.paramsProps, options.params, options.name);
    if (route.queryProps) configProps(_props, route.queryProps, options.query, options.name);
    if (route.render) return route.render(Object.assign(_props, _config.default.inheritProps ? routeProps : null, extraProps, _config.default.inheritProps ? {
      route: route
    } : null));
    var ref = null;

    if (component) {
      if (isAcceptRef(component)) ref = options.ref;else if (route.enableRef) {
        if (!isFunction(route.enableRef) || route.enableRef(component)) ref = options.ref;
      }
    }

    var _pending = route._pending;
    var afterEnterGuards = _pending.afterEnterGuards[options.name] || [];
    var completeCallback = _pending.completeCallbacks[options.name];
    var refHandler = once(function (el, componentClass) {
      if (el || !ref) {
        // if (isFunction(componentClass)) componentClass = componentClass(el, route);
        if (componentClass && el && el._reactInternalFiber) {
          var refComp = null;
          var comp = el._reactInternalFiber;

          while (comp && !refComp) {
            if (comp.type === componentClass) {
              refComp = comp;
              break;
            }

            comp = comp.child;
          }

          if (refComp && refComp.stateNode instanceof componentClass) el = refComp.stateNode;else warn('componentClass', componentClass, 'not found in route component: ', el);
        }

        completeCallback && completeCallback(el);
        afterEnterGuards && afterEnterGuards.forEach(function (v) {
          return v.call(el);
        });
      }
    });
    _pending.completeCallbacks[options.name] = null;
    _pending.afterEnterGuards[options.name] = [];
    if (ref) ref = mergeFns(ref, function (el) {
      return el && refHandler && refHandler(el, component.__componentClass);
    });
    if (component.__component) component = (0, _routeGuard.getGuardsComponent)(component);

    var ret = _react.default.createElement(component, Object.assign(_props, _config.default.inheritProps ? routeProps : null, extraProps, _config.default.inheritProps ? {
      route: route
    } : null, {
      ref: ref
    }));

    if (!ref) nextTick(refHandler);
    return ret;
  } // const currentRoute = options.router && options.router.currentRoute;


  var children = routes.map(function (route, i) {
    if (route.redirect) {
      return; // return React.createElement(Redirect, {
      //   key: route.key || i,
      //   exact: route.exact,
      //   strict: route.strict,
      //   from: route.path,
      //   to: resolveRedirect(route.redirect, route, currentRoute)
      // });
    }

    return _react.default.createElement(_reactRouterDom.Route, {
      key: route.key || i,
      path: route.path,
      exact: route.exact,
      strict: route.strict,
      render: function render(props) {
        return renderComp(route, route.components[options.name || 'default'], props, options);
      }
    });
  }).filter(Boolean);
  if (options.routesContainer) children = options.routesContainer(children);

  var ret = _react.default.createElement(_reactRouterDom.Switch, switchProps, children);

  return ret;
}

function flatten(array) {
  var flattend = [];

  (function flat(array) {
    array.forEach(function (el) {
      if (Array.isArray(el)) flat(el);else flattend.push(el);
    });
  })(array);

  return flattend;
}