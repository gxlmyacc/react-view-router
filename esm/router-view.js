"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.RouterViewComponent = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.array.find-index");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.number.constructor");

var _react = _interopRequireDefault(require("react"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RouterView =
/*#__PURE__*/
function (_React$Component) {
  _inherits(RouterView, _React$Component);

  function RouterView(props) {
    var _this;

    _classCallCheck(this, RouterView);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RouterView).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_isMounted", void 0);

    _defineProperty(_assertThisInitialized(_this), "target", void 0);

    _defineProperty(_assertThisInitialized(_this), "_reactInternalFiber", void 0);

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
    _this._isMounted = false;
    _this.state = state;
    _this.target = this instanceof RouterView ? this.constructor : void 0;
    _this._updateRef = _this._updateRef.bind(_assertThisInitialized(_this));
    _this._filterRoutes = _this._filterRoutes.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(RouterView, [{
    key: "_updateRef",
    value: function _updateRef(ref) {
      var currentRoute = this.state.currentRoute;
      if (currentRoute) currentRoute.componentInstances[this.name] = ref;
      if (this.props && this.props._updateRef) this.props._updateRef(ref);
      if (this._isMounted) this.setState({
        currentRoute: currentRoute
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
        if (r.redirect || r.index) return hasName ? name === r.name : !r.name;
        return hasName ? r.components && r.components[name] : r.component || r.components && r.components.default;
      });
      if (filter) ret = filter(ret, state || this.state);
      return ret;
    }
  }, {
    key: "_getRouteMatch",
    value: function _getRouteMatch(state) {
      var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      if (!state) state = this.state;
      var matched = state.router && state.router.currentRoute && state.router.currentRoute.matched || [];
      var route = matched.length > depth ? matched[depth] : null;
      return route;
    }
  }, {
    key: "_refreshCurrentRoute",
    value: function _refreshCurrentRoute(state, newState) {
      if (!state) state = this.state;
      if (!state.router) throw new Error('state.router is null!');

      var currentRoute = this._getRouteMatch(state, state._routerDepth);

      if (!currentRoute) {
        currentRoute = state.router.createMatchedRoute((0, _util.normalizeRoute)({
          path: ''
        }, state.parentRoute, state._routerDepth), state.parentRoute);
        state.router.currentRoute && state.router.currentRoute.matched.push(currentRoute);
      } else if (!currentRoute || currentRoute.redirect) currentRoute = null;

      if (currentRoute) currentRoute.viewInstances[this.name] = this;

      if (this.state && this.state._routerInited) {
        if (newState) Object.assign(newState, {
          currentRoute: currentRoute
        });else if (this._isMounted) this.setState({
          currentRoute: currentRoute ? currentRoute.config : null
        });
      }

      return currentRoute ? currentRoute.config : null;
    }
  }, {
    key: "_updateResolving",
    value: function _updateResolving(resolving) {
      if (this._isMounted) this.setState({
        _routerResolving: Boolean(resolving)
      });
    }
  }, {
    key: "_resolveFallback",
    value: function _resolveFallback() {
      var ret = null;
      var fallback = this.props.fallback;

      if ((0, _util.isFunction)(fallback)) {
        ret = fallback({
          parentRoute: this.state.parentRoute,
          currentRoute: this.state.currentRoute,
          inited: this.state._routerInited,
          resolving: this.state._routerResolving,
          depth: this.state._routerDepth
        });
      }

      return ret || null;
    }
  }, {
    key: "isNull",
    value: function isNull(route) {
      return !route || !route.path || route.subpath === '';
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var state, parent, parentMatchRoute;
      return regeneratorRuntime.async(function componentDidMount$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this._isMounted = true;

              if (!this.state._routerInited) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return");

            case 3:
              state = _objectSpread({}, this.state);

              if (!(state._routerRoot && state.router)) {
                _context.next = 8;
                break;
              }

              state.router.viewRoot = this;

              state.router._handleRouteInterceptor(state.router.history.location, function (ok, to) {
                if (!ok) return; // this.state.router && (this.state.router.currentRoute = to);

                state.currentRoute = _this2._refreshCurrentRoute();
                if (_this2._isMounted) _this2.setState(Object.assign(state, {
                  _routerInited: true
                }));
              }, true);

              return _context.abrupt("return");

            case 8:
              if (this._reactInternalFiber) {
                _context.next = 10;
                break;
              }

              return _context.abrupt("return");

            case 10:
              parent = (0, _util.getHostRouterView)(this);

              if (parent) {
                state._routerRoot = false;
                state._routerParent = parent.state._routerView;
                if (!state.router) state.router = parent.state.router;
                state._routerDepth = parent.state._routerDepth + 1;
              }

              if (state._routerDepth) {
                parentMatchRoute = this._getRouteMatch(state, state._routerDepth - 1);
                state.parentRoute = parentMatchRoute ? parentMatchRoute.config : null;
                state.routes = state.parentRoute ? this._filterRoutes(state.parentRoute.config.children) : [];
                state.currentRoute = this._refreshCurrentRoute(state);
              } else console.error('[RouterView] cannot find root RouterView instance!', this);

              if (this._isMounted) this.setState(Object.assign(state, {
                _routerInited: true
              }));

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this._isMounted = false;
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (!this._isMounted) return false;
      if (this.state._routerResolving !== nextState._routerResolving) return true;
      if (this.state._routerInited !== nextState._routerInited) return true;
      if (this.state._routerDepth !== nextState._routerDepth) return true;
      if (this.state.router !== nextState.router) return true;
      if ((0, _util.isPropChanged)(this.props, nextProps)) return true;
      if ((0, _util.isRouteChanged)(this.state.currentRoute, nextState.currentRoute)) return true;
      if ((0, _util.isRoutesChanged)(this.state.routes, nextState.routes)) return true;
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

      if (this._isMounted) this.setState(state);
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

      if (this._isMounted) this.setState(state);
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
      if (this._isMounted) this.setState({
        routes: routes
      });
      return ~index ? route : undefined;
    }
  }, {
    key: "getComponent",
    value: function getComponent(currentRoute, excludeProps) {
      if (!currentRoute) return null;
      var _this$state = this.state,
          routes = _this$state.routes,
          router = _this$state.router;

      var _this$props2 = this.props,
          container = _this$props2.container,
          children = _this$props2.children,
          props = _objectWithoutProperties(_this$props2, ["container", "children"]);

      var _ref = router && router.currentRoute || {},
          _ref$query = _ref.query,
          query = _ref$query === void 0 ? {} : _ref$query,
          params = _ref.params;

      var targetExcludeProps = this.target.defaultProps.excludeProps || RouterView.defaultProps.excludeProps || [];
      (excludeProps || targetExcludeProps).forEach(function (key) {
        return delete props[key];
      });
      return (0, _util.renderRoute)(currentRoute, routes, props, children, {
        name: this.name,
        query: query,
        params: params,
        container: container,
        ref: this._updateRef
      });
    }
  }, {
    key: "renderCurrent",
    value: function renderCurrent(currentRoute) {
      if (this.isNull(currentRoute)) return this.props.children || null;
      return this.getComponent(currentRoute);
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.state._routerInited) return this._resolveFallback();
      var ret = this.renderCurrent(this.state.currentRoute);

      if (this.state._routerResolving) {
        ret = _react.default.createElement(_react.default.Fragment, {}, ret, this._resolveFallback());
      }

      return ret;
    }
  }, {
    key: "name",
    get: function get() {
      var name = this.props.name;
      if (!name) return 'default';
      return name;
    }
  }]);

  return RouterView;
}(_react.default.Component);

exports.RouterViewComponent = RouterView;

_defineProperty(RouterView, "defaultProps", void 0);

RouterView.defaultProps = {
  excludeProps: ['_updateRef', 'router', 'excludeProps']
};

var _default = _react.default.forwardRef(function (props, ref) {
  return _react.default.createElement(RouterView, _objectSpread({}, props, {
    _updateRef: ref
  }));
});

exports.default = _default;
//# sourceMappingURL=router-view.js.map