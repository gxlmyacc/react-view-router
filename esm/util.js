"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es6.weak-map");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.camelize = camelize;
exports.flatten = flatten;
exports.warn = warn;
exports.once = once;
exports.mergeFns = mergeFns;
exports.isAcceptRef = isAcceptRef;
exports.nextTick = nextTick;
exports.isPlainObject = isPlainObject;
exports.isFunction = isFunction;
exports.isLocation = isLocation;
exports.isPropChanged = isPropChanged;
exports.isRouteChanged = isRouteChanged;
exports.isRoutesChanged = isRoutesChanged;
exports.isAbsoluteUrl = isAbsoluteUrl;
exports.resolveRedirect = resolveRedirect;
exports.normalizePath = normalizePath;
exports.normalizeRoute = normalizeRoute;
exports.normalizeRoutes = normalizeRoutes;
exports.normalizeRoutePath = normalizeRoutePath;
exports.normalizeLocation = normalizeLocation;
exports.normalizeProps = normalizeProps;
exports.matchRoutes = matchRoutes;
exports.renderRoute = renderRoute;
exports.innumerable = innumerable;
exports.afterInterceptors = afterInterceptors;
exports.getParentRoute = getParentRoute;
exports.getHostRouterView = getHostRouterView;
Object.defineProperty(exports, "matchPath", {
  enumerable: true,
  get: function get() {
    return _matchPath.default;
  }
});

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.find");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _react = _interopRequireDefault(require("react"));

var _config = _interopRequireDefault(require("./config"));

var _routeLazy = require("./route-lazy");

var _routeGuard = require("./route-guard");

var _matchPath = _interopRequireWildcard(require("./match-path"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
    configurable: true
  };
  Object.defineProperty(obj, key, _objectSpread({
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

function normalizeRoute(route, parent) {
  var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var force = arguments.length > 3 ? arguments[3] : undefined;
  var path = normalizePath(parent ? "".concat(parent.path, "/").concat(route.path.replace(/^(\/)/, '')) : route.path);

  var r = _objectSpread({}, route, {
    subpath: route.path,
    path: path,
    depth: depth
  });

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

  Object.keys(r.components).forEach(function (key) {
    var comp = r.components[key];

    if (comp instanceof _routeLazy.RouteLazy) {
      comp.updaters.push(function (c) {
        if (c.__children) {
          var children = c.__children || [];
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
  innumerable(r, '_pending', {
    afterEnterGuards: {},
    completeCallbacks: {}
  });
  return r;
}

function normalizeRoutes(routes, parent) {
  var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var force = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!routes) routes = [];
  if (!force && routes._normalized) return routes;
  routes = routes.map(function (route) {
    return route && normalizeRoute(route, parent, depth || 0, force);
  }).filter(Boolean);
  Object.defineProperty(routes, '_normalized', {
    value: true
  });
  return routes;
}

function normalizeRoutePath(path, route, append) {
  var basename = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  if (isAbsoluteUrl(path)) return path;
  if (route && route.matched) route = route.matched[route.matched.length - 1];
  if (!path || path[0] === '/' || !route) return basename + (path || '');
  if (route.config) route = route.config;
  var parent = append || /^\.\//.test(path) ? route : route.parent;

  while (parent && path[0] !== '/') {
    path = "".concat(parent.path, "/").concat(path);
    parent = route.parent;
  }

  if (basename && path[0] === '/') path = basename + path;
  return normalizePath(path);
}

function resloveIndex(index, routes) {
  index = isFunction(index) ? index() : index;
  var r = routes.find(function (r) {
    return r.subpath === index;
  });

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
      var match = route.path ? (0, _matchPath.default)(to.path, route) : branch.length ? branch[branch.length - 1].match // use parent match
      : (0, _matchPath.computeRootMatch)(to.path); // use default "root" match

      if (match && route.index) {
        route = resloveIndex(route.index, routes);
        if (!route) continue;else to.pathname = to.path = route.path;
      }

      if (match) {
        branch.push({
          route: route,
          match: match
        });
        if (route.children) matchRoutes(route.children, to, route, branch);
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

function normalizeLocation(to, route, append) {
  var basename = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  if (!to) return to;

  if (typeof to === 'string') {
    var _to$split = to.split('?'),
        _to$split2 = _slicedToArray(_to$split, 2),
        pathname = _to$split2[0],
        search = _to$split2[1];

    to = {
      pathname: pathname,
      path: pathname,
      search: search ? "?".concat(search) : '',
      fullPath: to
    };
  }

  if (to.query) Object.keys(to.query).forEach(function (key) {
    return to.query[key] === undefined && delete to.query[key];
  });else if (to.search) to.query = _config.default.parseQuery(to.search.substr(1));

  if (!isAbsoluteUrl(to.pathname)) {
    to.pathname = to.path = normalizeRoutePath(to.pathname || to.path, route, to.append || append, basename) || '/';
  }

  to.search = to.search || (to.query ? _config.default.stringifyQuery(to.query) : '');
  to.fullPath = "".concat(to.path).concat(to.search ? to.search : '');
  if (!to.query) to.query = {};
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
  return function _once() {
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
  from && Object.assign(to.query, from.query);
  to.isRedirect = true;
  return to;
}

function warn() {
  var _console;

  (_console = console).warn.apply(_console, arguments);
}

function afterInterceptors(interceptors) {
  var _len4,
      args,
      _key4,
      i,
      _interceptor,
      interceptor,
      _args = arguments;

  return regeneratorRuntime.async(function afterInterceptors$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          for (_len4 = _args.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            args[_key4 - 1] = _args[_key4];
          }

          i = 0;

        case 2:
          if (!(i < interceptors.length)) {
            _context.next = 19;
            break;
          }

          interceptor = interceptors[i];

        case 4:
          if (!(interceptor && interceptor.lazy)) {
            _context.next = 10;
            break;
          }

          _context.next = 7;
          return regeneratorRuntime.awrap(interceptor(interceptors, i));

        case 7:
          interceptor = _context.sent;
          _context.next = 4;
          break;

        case 10:
          if (interceptor) {
            _context.next = 12;
            break;
          }

          return _context.abrupt("return");

        case 12:
          _context.t0 = interceptor;

          if (!_context.t0) {
            _context.next = 16;
            break;
          }

          _context.next = 16;
          return regeneratorRuntime.awrap((_interceptor = interceptor).call.apply(_interceptor, [this].concat(args, [interceptor.route])));

        case 16:
          i++;
          _context.next = 2;
          break;

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
}

function renderRoute(route, routes, props, children) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  if (props === undefined) props = {};
  if (!route) return null;
  if (_react.default.isValidElement(route)) return route;
  if (route.config) route = route.config;

  function configProps(_props, configs, obj, name) {
    if (!obj) return;
    if (name && configs[name] !== undefined) configs = configs[name];
    if (configs === true) Object.assign(_props, obj);else if (isPlainObject(configs)) {
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

  function createComp(route, props, children, options) {
    var component = route.components && route.components[options.name || 'default'];
    if (!component) return null;
    var _props = {};

    if (route.defaultProps) {
      Object.assign(_props, isFunction(route.defaultProps) ? route.defaultProps(props) : route.defaultProps);
    }

    if (route.props) configProps(_props, route.props, options.params, options.name);
    if (route.paramsProps) configProps(_props, route.paramsProps, options.params, options.name);
    if (route.queryProps) configProps(_props, route.queryProps, options.query, options.name);
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
        afterEnterGuards && afterInterceptors.call(el, afterEnterGuards);
      }
    });
    _pending.completeCallbacks[options.name] = null;
    _pending.afterEnterGuards[options.name] = [];
    if (ref) ref = mergeFns(ref, function (el) {
      return el && refHandler && refHandler(el, component.__componentClass);
    });
    if (component.__component) component = (0, _routeGuard.getGuardsComponent)(component);
    var ret;

    if (component instanceof _routeLazy.RouteLazy) {
      ret = null;
      warn("route [".concat(route.path, "] component should not be RouteLazy instance!"));
    } else {
      ret = _react.default.createElement.apply(_react.default, [component, Object.assign(_props, props, _config.default.inheritProps ? {
        route: route
      } : null, {
        ref: ref
      })].concat(_toConsumableArray(Array.isArray(children) ? children : [children])));
    }

    if (!ref) nextTick(refHandler);
    return ret;
  }

  var renderRoute = route;
  if (route.redirect) return null;
  if (route.index) renderRoute = resloveIndex(route.index, routes);
  if (!renderRoute) return null;
  var result = createComp(renderRoute, props, children, options);
  if (options.container) result = options.container(result, route, props);
  return result;
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

function camelize(str) {
  var ret = str.replace(/[-|:](\w)/g, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
  if (/^[A-Z]/.test(ret)) ret = ret.charAt(0).toLowerCase() + ret.substr(1);
  return ret;
}

function isPropChanged(prev, next) {
  if ((!prev || !next) && prev !== next) return true;
  return Object.keys(next).some(function (key) {
    return next[key] !== prev[key];
  });
}

function isRouteChanged(prev, next) {
  if (prev && next) return prev.path !== next.path && prev.subpath !== next.subpath;
  if ((!prev || !next) && prev !== next) return true;
  return false;
}

function isRoutesChanged(prevs, nexts) {
  if (!prevs || !nexts) return true;
  if (prevs.length !== nexts.length) return true;
  var changed = false;
  prevs.some(function (prev, i) {
    changed = isRouteChanged(prev, nexts[i]);
    return changed;
  });
  return changed;
}

function getHostRouterView(ctx, continueCb) {
  var parent = ctx._reactInternalFiber.return;

  while (parent) {
    if (continueCb && continueCb(parent) === false) return;
    var memoizedState = parent.memoizedState; // const memoizedProps = parent.memoizedProps;

    if (memoizedState && memoizedState._routerView) return parent.stateNode;
    parent = parent.return;
  }
}

function getParentRoute(ctx) {
  var view = getHostRouterView(ctx);
  return view && view.state.currentRoute || null;
}

function isAbsoluteUrl(to) {
  return typeof to === 'string' && /^(https?:)?\/\/.+/.test(to);
}