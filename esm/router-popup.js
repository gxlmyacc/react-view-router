"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.reflect.get");

require("core-js/modules/es6.object.set-prototype-of");

var _react = _interopRequireDefault(require("react"));

var _rmcDialog = _interopRequireDefault(require("rmc-dialog"));

var _routerView = _interopRequireDefault(require("./router-view"));

var _util = require("./util");

require("../style/router-popup.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    return _this;
  }

  _createClass(RouterPopup, [{
    key: "_refreshCurrentRoute",
    value: function _refreshCurrentRoute(state) {
      if (!state) state = this.state;
      var prevRoute = state.currentRoute;

      var currentRoute = _get(_getPrototypeOf(RouterPopup.prototype), "_refreshCurrentRoute", this).call(this, state);

      if (this.isNull(prevRoute) && !this.isNull(currentRoute)) {
        if (this.state) this.setState({
          popup: true
        });else state.popup = true;
      }

      if (!this.isNull(prevRoute) && this.isNull(currentRoute)) {
        if (this.state) this.setState({
          popup: false
        });else state.popup = false;
      }
    }
  }, {
    key: "renderCurrent",
    value: function renderCurrent(currentRoute) {
      if (!currentRoute || !currentRoute.subpath) return this.props.children || null;
      var routes = this.state.routes; // eslint-disable-next-line

      var _this$props = this.props,
          _updateRef = _this$props._updateRef,
          oldContainer = _this$props.container,
          router = _this$props.router,
          popup = _this$props.popup,
          children = _this$props.children,
          props = _objectWithoutProperties(_this$props, ["_updateRef", "container", "router", "popup", "children"]);

      var _this$state$router$cu = this.state.router.currentRoute,
          query = _this$state$router$cu.query,
          params = _this$state$router$cu.params;
      var ret = (0, _util.renderRoute)(currentRoute, routes, props, children, {
        name: this.name,
        query: query,
        params: params,
        container: function container(comp) {
          if (oldContainer) comp = oldContainer(comp);
          if (!comp) return comp;
          return _react.default.createElement(_rmcDialog.default, {
            prefixCls: 'rvr-route-pupup',
            transitionName: 'rvr-slide-right',
            closable: false,
            visible: popup
          }, comp);
        },
        ref: this._updateRef
      });
      return ret;
    }
  }]);

  return RouterPopup;
}(_routerView.default);

var _default = RouterPopup;
exports.default = _default;