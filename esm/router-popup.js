"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.reflect.get");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.object.assign");

var _react = _interopRequireDefault(require("react"));

var _rmcDialog = _interopRequireDefault(require("rmc-dialog"));

var _routerView = require("./router-view");

var _util = require("./util");

var _config = _interopRequireDefault(require("./config"));

var _reactSwipeable = require("react-swipeable");

require("../style/router-popup.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var RouterPopup =
/*#__PURE__*/
function (_RouterView) {
  _inherits(RouterPopup, _RouterView);

  function RouterPopup(props) {
    var _this;

    _classCallCheck(this, RouterPopup);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RouterPopup).call(this, props));
    _this.state.popup = false;
    _this.state.prevRoute = null;
    _this._handleAnimationEnd = _this._handleAnimationEnd.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(RouterPopup, [{
    key: "_refreshCurrentRoute",
    value: function _refreshCurrentRoute(state) {
      if (!state) state = this.state;
      var prevRoute = state.currentRoute;
      var newState = {};

      var currentRoute = _get(_getPrototypeOf(RouterPopup.prototype), "_refreshCurrentRoute", this).call(this, state, newState);

      var popup;
      if (this.isNull(prevRoute) && !this.isNull(currentRoute)) popup = true;
      if (!this.isNull(prevRoute) && this.isNull(currentRoute)) popup = false;

      if (popup !== undefined && this.state.popup !== popup) {
        newState.popup = popup;
        if (!popup && this.props.transitionName) newState.prevRoute = prevRoute;
      }

      if (this.state && this.state._routerInited) this.setState(newState);else Object.assign(state, newState);
      return currentRoute;
    }
  }, {
    key: "_handleAnimationEnd",
    value: function _handleAnimationEnd() {
      if (!this.state.popup) this.setState({
        prevRoute: null
      });
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (this.state.popup !== nextState.popup) return true;
      if (this.state.prevRoute !== nextState.prevRoute) return true;
      return _get(_getPrototypeOf(RouterPopup.prototype), "shouldComponentUpdate", this).call(this, nextProps, nextState);
    }
  }, {
    key: "renderCurrent",
    value: function renderCurrent(currentRoute) {
      var _this2 = this;

      var routes = this.state.routes; // eslint-disable-next-line

      var _this$props = this.props,
          _updateRef = _this$props._updateRef,
          router = _this$props.router,
          oldContainer = _this$props.container,
          prefixCls = _this$props.prefixCls,
          transitionName = _this$props.transitionName,
          zIndexStart = _this$props.zIndexStart,
          children = _this$props.children,
          props = _objectWithoutProperties(_this$props, ["_updateRef", "router", "container", "prefixCls", "transitionName", "zIndexStart", "children"]);

      var _this$state = this.state,
          popup = _this$state.popup,
          prevRoute = _this$state.prevRoute;

      var _ref = this.state.router.currentRoute || {},
          query = _ref.query,
          params = _ref.params;

      var ret = (0, _util.renderRoute)(!popup ? prevRoute : currentRoute, routes, props, children, {
        name: this.name,
        query: query,
        params: params,
        container: function container(comp) {
          if (oldContainer) comp = oldContainer(comp);
          return _react.default.createElement(_reactSwipeable.Swipeable, {}, _react.default.createElement(_rmcDialog.default, {
            prefixCls: prefixCls,
            transitionName: transitionName,
            closable: false,
            visible: Boolean(popup && comp),
            zIndex: _config.default.zIndexStart + currentRoute.depth * _config.default.zIndexStep,
            onClose: function onClose() {
              return transitionName && setTimeout(_this2._handleAnimationEnd, _this2.delay);
            }
          }, comp));
        },
        ref: this._updateRef
      });
      return ret;
    }
  }]);

  return RouterPopup;
}(_routerView.RouterView);

RouterPopup.defaultProps = {
  prefixCls: 'rvr-route-popup',
  transitionName: 'rvr-slide-right',
  delay: 200
};

var _default = _react.default.forwardRef(function (props, ref) {
  return _react.default.createElement(RouterPopup, _objectSpread({}, props, {
    _updateRef: ref
  }));
});

exports.default = _default;