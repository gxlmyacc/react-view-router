"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGuardsComponent = getGuardsComponent;
exports.useRouteGuards = useRouteGuards;
exports.RouteComponentGuards = exports.REACT_LAZY_TYPE = exports.REACT_FORWARD_REF_TYPE = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
exports.REACT_FORWARD_REF_TYPE = REACT_FORWARD_REF_TYPE;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
exports.REACT_LAZY_TYPE = REACT_LAZY_TYPE;

var RouteComponentGuards = function RouteComponentGuards() {
  _classCallCheck(this, RouteComponentGuards);

  _defineProperty(this, "$$typeof", void 0);

  _defineProperty(this, "render", void 0);

  _defineProperty(this, "__guards", void 0);

  _defineProperty(this, "__component", void 0);

  _defineProperty(this, "__componentClass", void 0);

  _defineProperty(this, "__children", void 0);

  this.$$typeof = REACT_FORWARD_REF_TYPE;
  this.render = null;
};

exports.RouteComponentGuards = RouteComponentGuards;

function getGuardsComponent(v) {
  var useComponentClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (useComponentClass && v.__componentClass) return v.__componentClass;

  while (v.__component) {
    v = v.__component;
  }

  return v;
}

function useRouteGuards(component) {
  var guards = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var componentClass = arguments.length > 2 ? arguments[2] : undefined;
  var children = arguments.length > 3 ? arguments[3] : undefined;
  var ret = new RouteComponentGuards();

  ret.render = function (props, ref) {
    return _react.default.createElement(component, _objectSpread({}, props, {
      ref: ref
    }));
  };

  Object.defineProperty(ret, '__guards', {
    value: guards
  });
  Object.defineProperty(ret, '__component', {
    value: component
  });
  if (guards.componentClass) componentClass = guards.componentClass;
  if (guards.children) children = guards.children;

  if (Array.isArray(componentClass)) {
    children = componentClass;
    componentClass = null;
  }

  if (componentClass) Object.defineProperty(ret, '__componentClass', {
    value: componentClass
  });
  if (children) Object.defineProperty(ret, '__children', {
    value: children
  });
  return ret;
}
//# sourceMappingURL=route-guard.js.map