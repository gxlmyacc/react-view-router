"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasRouteLazy = hasRouteLazy;
exports.hasMatchedRouteLazy = hasMatchedRouteLazy;
exports.lazyImport = lazyImport;
exports.RouteLazy = void 0;

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _routeGuard = require("./route-guard");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RouteLazy =
/*#__PURE__*/
function () {
  function RouteLazy(ctor) {
    _classCallCheck(this, RouteLazy);

    this.$$typeof = _routeGuard.REACT_LAZY_TYPE;
    this._ctor = ctor;
    this._status = -1;
    this._result = null;
    this.defaultProps = undefined;
    this.propTypes = undefined;
    Object.defineProperty(this, 'resolved', {
      writable: true,
      value: false
    });
    Object.defineProperty(this, 'updaters', {
      writable: true,
      value: []
    });
    Object.defineProperty(this, 'toResolve', {
      value: this.toResolve
    });
  }

  _createClass(RouteLazy, [{
    key: "toResolve",
    value: function toResolve() {
      var _this = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(resolve, reject) {
          var _resolve, component;

          return regeneratorRuntime.wrap(function _callee$(_context) {
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

                  if (!(_this._ctor instanceof Promise)) {
                    _context.next = 9;
                    break;
                  }

                  _context.next = 6;
                  return _this._ctor;

                case 6:
                  _context.t0 = _context.sent;
                  _context.next = 10;
                  break;

                case 9:
                  _context.t0 = _this._ctor.apply(_this, args);

                case 10:
                  component = _context.t0;

                  if (component) {
                    _context.next = 13;
                    break;
                  }

                  throw new Error('component should not null!');

                case 13:
                  if (component instanceof Promise) {
                    component.then(_resolve).catch(function () {
                      return reject.apply(void 0, arguments);
                    });
                  } else _resolve(component);

                case 14:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
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

function lazyImport(importMethod) {
  return new RouteLazy(importMethod);
}