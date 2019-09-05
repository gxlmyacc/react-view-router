"use strict";

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  RouterLink: true,
  RouterView: true,
  useRouteGuards: true,
  REACT_FORWARD_REF_TYPE: true,
  lazyImport: true
};
Object.defineProperty(exports, "RouterLink", {
  enumerable: true,
  get: function get() {
    return _reactRouterDom.NavLink;
  }
});
Object.defineProperty(exports, "RouterView", {
  enumerable: true,
  get: function get() {
    return _routerView.default;
  }
});
Object.defineProperty(exports, "useRouteGuards", {
  enumerable: true,
  get: function get() {
    return _routeGuard.useRouteGuards;
  }
});
Object.defineProperty(exports, "REACT_FORWARD_REF_TYPE", {
  enumerable: true,
  get: function get() {
    return _routeGuard.REACT_FORWARD_REF_TYPE;
  }
});
Object.defineProperty(exports, "lazyImport", {
  enumerable: true,
  get: function get() {
    return _routeLazy.lazyImport;
  }
});
exports.default = void 0;

var _router = _interopRequireDefault(require("./router"));

var _reactRouterDom = require("react-router-dom");

var _routerView = _interopRequireDefault(require("./router-view"));

var _routeGuard = require("./route-guard");

var _routeLazy = require("./route-lazy");

var _util = require("./util");

Object.keys(_util).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _util[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _router.default;
exports.default = _default;