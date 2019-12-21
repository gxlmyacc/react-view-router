"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.keys");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.weak-map");

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  RouterView: true,
  RouterViewComponent: true,
  withRouter: true,
  createRouterLink: true,
  config: true,
  useRouteGuards: true,
  REACT_FORWARD_REF_TYPE: true,
  lazyImport: true
};
Object.defineProperty(exports, "RouterView", {
  enumerable: true,
  get: function get() {
    return _routerView.default;
  }
});
Object.defineProperty(exports, "RouterViewComponent", {
  enumerable: true,
  get: function get() {
    return _routerView.RouterViewComponent;
  }
});
Object.defineProperty(exports, "withRouter", {
  enumerable: true,
  get: function get() {
    return _withRouter.default;
  }
});
Object.defineProperty(exports, "createRouterLink", {
  enumerable: true,
  get: function get() {
    return _routerLink.default;
  }
});
Object.defineProperty(exports, "config", {
  enumerable: true,
  get: function get() {
    return _config.default;
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

var _routerView = _interopRequireWildcard(require("./router-view"));

var _withRouter = _interopRequireDefault(require("./with-router"));

var _routerLink = _interopRequireDefault(require("./router-link"));

var _config = _interopRequireDefault(require("./config"));

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

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _router.default;
exports.default = _default;
//# sourceMappingURL=index.js.map