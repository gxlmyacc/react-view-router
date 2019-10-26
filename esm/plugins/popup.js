"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

var _react = _interopRequireDefault(require("react"));

var _rmcDialog = _interopRequireDefault(require("rmc-dialog"));

require("./popup.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = {
  name: 'react-view-router-modal-plugin',
  install: function install(router) {
    router.pupup = function pupup(to) {
      return this._go(to);
    };
  },
  onResolveComponent: function onResolveComponent(comp, route, prevRet) {
    comp = prevRet || comp;

    var newComp = _react.default.forwardRef(function (props, _ref) {
      props = props || {};
      return _react.default.createElement(_rmcDialog.default, _objectSpread({
        prefixCls: 'rvr-route-pupup',
        transitionName: 'rvr-slide-right',
        closable: false
      }, props, {
        ref: function ref(vm) {
          _ref && _ref(vm);
        }
      }), props.children);
    });

    Object.defineProperty(newComp, '__popup', {
      value: true
    });
    Object.defineProperty(newComp, '__component', {
      value: comp
    });
    return newComp;
  },
  onRouteEnterNext: function onRouteEnterNext(route, instance, nextRes, prevRet) {},
  onRouteLeaveNext: function onRouteLeaveNext(route, instance, nextRes, prevRet) {}
};
exports.default = _default;