"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasRouteLazy = hasRouteLazy;
exports.hasMatchedRouteLazy = hasMatchedRouteLazy;
exports.lazyImport = lazyImport;
exports.RouteLazy = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _react = _interopRequireDefault(require("react"));

var _routeGuard = require("./route-guard");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RouteLazy =
/*#__PURE__*/
function () {
  function RouteLazy(ctor, options) {
    _classCallCheck(this, RouteLazy);

    this.$$typeof = _routeGuard.REACT_LAZY_TYPE;
    this._ctor = ctor;
    this._result = null;
    this.options = options;
    this.render = this.render.bind(this);
    this.resolved = false;
    this.updaters = [];
  }

  _createClass(RouteLazy, [{
    key: "toResolve",
    value: function toResolve() {
      var _this = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new Promise(function _callee(resolve, reject) {
        var _resolve, component;

        return regeneratorRuntime.async(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!_this.resolved) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", resolve(_this._result));

              case 2:
                _resolve = function _resolve(v) {
                  v = v && v.__esModule ? v.default : v;

                  _this.updaters.forEach(function (updater) {
                    return v = updater(v) || v;
                  });

                  _this._result = v;
                  _this.resolved = true;
                  resolve(v);
                };

                if (!(_this._ctor.prototype instanceof _react.default.Component)) {
                  _context.next = 7;
                  break;
                }

                _context.t0 = _this._ctor;
                _context.next = 15;
                break;

              case 7:
                if (!(_this._ctor instanceof Promise)) {
                  _context.next = 13;
                  break;
                }

                _context.next = 10;
                return regeneratorRuntime.awrap(_this._ctor);

              case 10:
                _context.t1 = _context.sent;
                _context.next = 14;
                break;

              case 13:
                _context.t1 = _this._ctor.apply(_this, args);

              case 14:
                _context.t0 = _context.t1;

              case 15:
                component = _context.t0;

                if (component) {
                  _context.next = 18;
                  break;
                }

                throw new Error('component should not null!');

              case 18:
                if (component instanceof Promise) {
                  component.then(_resolve).catch(function () {
                    return reject.apply(void 0, arguments);
                  });
                } else _resolve(component);

              case 19:
              case "end":
                return _context.stop();
            }
          }
        });
      });
    }
  }, {
    key: "render",
    value: function render(props, ref) {
      if (!this.resolved || !this._result) return null;
      return _react.default.createElement(this._result, _objectSpread({}, props, {
        ref: ref
      }));
    }
  }]);

  return RouteLazy;
}();

exports.RouteLazy = RouteLazy;

function hasRouteLazy(route) {
  var config = route.config || route;
  if (config.components instanceof RouteLazy) return true;

  if (config.components) {
    for (var _i = 0, _Object$keys = Object.keys(config.components); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      if (config.components[key] instanceof RouteLazy) return true;
    }
  }

  return false;
}

function hasMatchedRouteLazy(matched) {
  return matched && matched.some(function (r) {
    return hasRouteLazy(r);
  });
}

function lazyImport(importMethod, options) {
  return new RouteLazy(importMethod, options || {});
}