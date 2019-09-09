"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveRouteLazyList = resolveRouteLazyList;
exports.lazyImport = lazyImport;
exports.RouteLazy = void 0;

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

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

      return new Promise(function (resolve, reject) {
        var _resolve = function _resolve(v) {
          _this.updaters.forEach(function (updater) {
            return v = updater(v) || v;
          });

          _this.resolved = true;
          resolve(v);
        };

        var component = _this._ctor.apply(_this, args);

        if (component instanceof Promise) {
          component.then(function (c) {
            component = c.__esModule ? c.default : c;
            return _resolve(component);
          }).catch(function () {
            return reject.apply(void 0, arguments);
          });
        } else _resolve(component);
      });
    }
  }]);

  return RouteLazy;
}();

exports.RouteLazy = RouteLazy;

function resolveRouteLazyList(_x) {
  return _resolveRouteLazyList.apply(this, arguments);
}

function _resolveRouteLazyList() {
  _resolveRouteLazyList = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(matched) {
    var changed, toResolve, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, r, config, _i, _Object$keys, key;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            changed = false;

            if (matched) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", changed);

          case 3:
            toResolve =
            /*#__PURE__*/
            function () {
              var _ref = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee(routeLazy, route) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!(!routeLazy || !(routeLazy instanceof RouteLazy))) {
                          _context.next = 2;
                          break;
                        }

                        return _context.abrupt("return");

                      case 2:
                        changed = true;
                        return _context.abrupt("return", routeLazy.toResolve(route));

                      case 4:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function toResolve(_x2, _x3) {
                return _ref.apply(this, arguments);
              };
            }();

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 7;
            _iterator = matched[Symbol.iterator]();

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 26;
              break;
            }

            r = _step.value;
            config = r.config;
            _context2.next = 14;
            return toResolve(config.component, config);

          case 14:
            if (!config.components) {
              _context2.next = 23;
              break;
            }

            _i = 0, _Object$keys = Object.keys(config.components);

          case 16:
            if (!(_i < _Object$keys.length)) {
              _context2.next = 23;
              break;
            }

            key = _Object$keys[_i];
            _context2.next = 20;
            return toResolve(config.components[key], config);

          case 20:
            _i++;
            _context2.next = 16;
            break;

          case 23:
            _iteratorNormalCompletion = true;
            _context2.next = 9;
            break;

          case 26:
            _context2.next = 32;
            break;

          case 28:
            _context2.prev = 28;
            _context2.t0 = _context2["catch"](7);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 32:
            _context2.prev = 32;
            _context2.prev = 33;

            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }

          case 35:
            _context2.prev = 35;

            if (!_didIteratorError) {
              _context2.next = 38;
              break;
            }

            throw _iteratorError;

          case 38:
            return _context2.finish(35);

          case 39:
            return _context2.finish(32);

          case 40:
            return _context2.abrupt("return", changed);

          case 41:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[7, 28, 32, 40], [33,, 35, 39]]);
  }));
  return _resolveRouteLazyList.apply(this, arguments);
}

function lazyImport(importMethod) {
  return new RouteLazy(importMethod);
}