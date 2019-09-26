"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/es6.object.assign");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.number.constructor");

var _react = _interopRequireDefault(require("react"));

var _reactRouterDom = require("react-router-dom");

var _util = require("./util");

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var RouterView =
/*#__PURE__*/
function (_React$Component) {
  _inherits(RouterView, _React$Component);

  function RouterView(props) {
    var _this;

    _classCallCheck(this, RouterView);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RouterView).call(this, props));
    var router = props && props.router;
    var depth = props && props.depth ? Number(props.depth) : 0;
    var state = {
      _routerView: _assertThisInitialized(_this),
      _routerRoot: true,
      _routerParent: null,
      _routerDepth: depth,
      _routerInited: false,
      _routerResolving: false,
      router: router,
      parentRoute: null,
      currentRoute: null,
      routes: router ? _this._filterRoutes(router.routes) : []
    };
    _this.state = state;
    _this._updateRef = _this._updateRef.bind(_assertThisInitialized(_this));
    _this._filterRoutes = _this._filterRoutes.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(RouterView, [{
    key: "_updateRef",
    value: function _updateRef(ref) {
      var newRoute = this._refreshCurrentRoute();

      var oldRoute = this.state.currentRoute;

      if (newRoute) {
        newRoute.componentInstances[this.name] = ref;
      }

      if (this.props && this.props._updateRef) this.props._updateRef(ref);
      if (oldRoute !== newRoute) this.setState({
        currentRoute: newRoute
      });
    }
  }, {
    key: "_filterRoutes",
    value: function _filterRoutes(routes, state) {
      var _this$props = this.props,
          name = _this$props.name,
          filter = _this$props.filter;
      var ret = routes && routes.filter(function (r) {
        if (r.config) r = r.config;
        var hasName = name && name !== 'default';
        if (r.redirect) return hasName ? name === r.name : !r.name;
        return hasName ? r.components && r.components[name] : r.component || r.components && r.components.default;
      });
      if (filter) ret = filter(ret);
      return ret;
    }
  }, {
    key: "_refreshCurrentRoute",
    value: function _refreshCurrentRoute(state) {
      if (!state) state = this.state;
      var matched = state.router.currentRoute && state.router.currentRoute.matched || [];
      var ret = matched.length > state._routerDepth ? matched[state._routerDepth] : null;
      if (ret) ret.viewInstance = this;
      return ret;
    }
  }, {
    key: "_updateResolving",
    value: function _updateResolving(resolving) {
      this.setState({
        _routerResolving: Boolean(resolving)
      });
    }
  }, {
    key: "_resolveFallback",
    value: function _resolveFallback() {
      var fallback = this.props.fallback;

      if ((0, _util.isFunction)(fallback)) {
        fallback = fallback({
          parentRoute: this.state.parentRoute,
          currentRoute: this.state.currentRoute,
          inited: this.state._routerInited,
          resolving: this.state._routerResolving,
          depth: this.state._routerDepth
        });
      }

      return fallback || null;
    }
  }, {
    key: "componentDidMount",
    value: function () {
      var _componentDidMount = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        var state, props, parent, memoizedState, memoizedProps, matched;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.state._routerInited) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                state = _objectSpread({}, this.state);
                props = this.props || {};

                if (!(props.depth === undefined && this._reactInternalFiber)) {
                  _context.next = 19;
                  break;
                }

                parent = this._reactInternalFiber.return;

              case 6:
                if (!(parent && parent.type !== _reactRouterDom.Router)) {
                  _context.next = 19;
                  break;
                }

                memoizedState = parent.memoizedState;
                memoizedProps = parent.memoizedProps;

                if (!(memoizedState && memoizedState._routerView)) {
                  _context.next = 15;
                  break;
                }

                state._routerRoot = false;
                state._routerParent = memoizedState._routerView;
                if (!state.router) state.router = memoizedState.router;
                state._routerDepth = memoizedState._routerDepth + 1;
                return _context.abrupt("break", 19);

              case 15:
                if (!state.router && parent.type === _reactRouterDom.Router && memoizedProps && memoizedProps.history) state.router = memoizedProps.history;
                parent = parent.return;
                _context.next = 6;
                break;

              case 19:
                if (!state.routes.length) {
                  matched = state.router.currentRoute && state.router.currentRoute.matched || [];
                  state.currentRoute = this._refreshCurrentRoute(state);

                  if (state._routerDepth) {
                    // state.router.updateRoute();
                    state.parentRoute = matched.length >= state._routerDepth ? matched[state._routerDepth - 1] : null;
                    state.routes = state.parentRoute ? this._filterRoutes(state.parentRoute.config.children) : [];
                  }
                }

                if (state._routerRoot && state.router) {
                  state.router.viewRoot = this;

                  state.router._handleRouteInterceptor(state.router.history.location, function (ok) {
                    return ok && _this2.setState(Object.assign(state, {
                      _routerInited: true
                    }));
                  }, true);
                } else {
                  this.setState(Object.assign(state, {
                    _routerInited: true
                  }));
                }

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function componentDidMount() {
        return _componentDidMount.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: "isRouteChanged",
    value: function isRouteChanged(prev, next) {
      if (prev && next) return prev.path !== next.path;
      if ((!prev || !next) && prev !== next) return true;
      return false;
    }
  }, {
    key: "isRoutesChanged",
    value: function isRoutesChanged(prevs, nexts) {
      var _this3 = this;

      if (!prevs || !nexts) return true;
      if (prevs.length !== nexts.length) return true;
      var changed = false;
      prevs.some(function (prev, i) {
        changed = _this3.isRouteChanged(prev, nexts[i]);
        return changed;
      });
      return changed;
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (this.state._routerResolving !== nextState._routerResolving) return true;
      if (this.state._routerInited !== nextState._routerInited) return true;
      if (this.state._routerDepth !== nextState._routerDepth) return true;
      if (this.state.router !== nextState.router) return true;
      if (this.isRouteChanged(this.state.currentRoute, nextState.currentRoute)) return true;
      if (this.isRoutesChanged(this.state.routes, nextState.routes)) return true;
      return false;
    }
  }, {
    key: "push",
    value: function push() {
      var _state$routes;

      var state = _objectSpread({}, this.state);

      for (var _len = arguments.length, routes = new Array(_len), _key = 0; _key < _len; _key++) {
        routes[_key] = arguments[_key];
      }

      (_state$routes = state.routes).push.apply(_state$routes, _toConsumableArray((0, _util.normalizeRoutes)(routes, state.parentRoute)));

      this.setState(state);
      return state.routes;
    }
  }, {
    key: "splice",
    value: function splice(idx, len) {
      var _state$routes2;

      var state = _objectSpread({}, this.state);

      for (var _len2 = arguments.length, routes = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        routes[_key2 - 2] = arguments[_key2];
      }

      (_state$routes2 = state.routes).splice.apply(_state$routes2, [idx, len].concat(_toConsumableArray((0, _util.normalizeRoutes)(routes, state.parentRoute))));

      this.setState(state);
      return state.routes;
    }
  }, {
    key: "indexOf",
    value: function indexOf(route) {
      if (typeof route === 'string') route = {
        path: route
      };
      var routes = this.state.routes;
      return routes.findIndex(function (r) {
        return r.path === route.path;
      });
    }
  }, {
    key: "remove",
    value: function remove(route) {
      if (typeof route === 'string') route = {
        path: route
      };
      var routes = this.state.routes;
      var index = this.indexOf(route);
      if (~index) routes.splice(index, 1);
      this.setState({
        routes: routes
      });
      return ~index ? route : undefined;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state = this.state,
          routes = _this$state.routes,
          _routerResolving = _this$state._routerResolving,
          _routerInited = _this$state._routerInited; // eslint-disable-next-line

      var _ref = this.props || {},
          _updateRef = _ref._updateRef,
          container = _ref.container,
          router = _ref.router,
          props = _objectWithoutProperties(_ref, ["_updateRef", "container", "router"]);

      if (!_routerInited) return this._resolveFallback();
      var _this$state$router$cu = this.state.router.currentRoute,
          query = _this$state$router$cu.query,
          params = _this$state$router$cu.params;
      var ret = (0, _util.renderRoutes)(routes, _config.default.inheritProps ? _objectSpread({}, props, {
        parent: this
      }) : props, {}, {
        name: this.name,
        query: query,
        params: params,
        container: container,
        ref: this._updateRef
      });
      if (_routerResolving) ret = _react.default.createElement(_react.default.Fragment, {}, ret, this._resolveFallback());else if (!ret) ret = this._resolveFallback();
      return ret;
    }
  }, {
    key: "name",
    get: function get() {
      var name = this.props.name;
      return name || 'default';
    }
  }]);

  return RouterView;
}(_react.default.Component);

var _default = _react.default.forwardRef(function (props, ref) {
  var ret = _react.default.createElement(RouterView, _objectSpread({}, props, {
    _updateRef: ref
  }));

  if (props.router) {
    ret = _react.default.createElement(_reactRouterDom.Router, {
      history: props.router
    }, ret);
  }

  return ret;
});

exports.default = _default;