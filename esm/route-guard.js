"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGuardsComponent = getGuardsComponent;
exports.useRouteGuards = useRouteGuards;
exports.REACT_LAZY_TYPE = exports.REACT_FORWARD_REF_TYPE = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

var _react = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ForwardRefMeth = _react.default.forwardRef(function () {
  return null;
});

var REACT_FORWARD_REF_TYPE = ForwardRefMeth.$$typeof;
exports.REACT_FORWARD_REF_TYPE = REACT_FORWARD_REF_TYPE;
var LazyMeth = (0, _react.lazy)(function () {});
var REACT_LAZY_TYPE = LazyMeth.$$typeof;
exports.REACT_LAZY_TYPE = REACT_LAZY_TYPE;

var RouteComponentGuards = function RouteComponentGuards() {
  _classCallCheck(this, RouteComponentGuards);

  this.$$typeof = REACT_FORWARD_REF_TYPE;
};

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