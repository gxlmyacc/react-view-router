"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.promise");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es7.array.includes");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

var _historyFix = require("history-fix");

var _config = _interopRequireDefault(require("./config"));

var _util = require("./util");

var _routeCache = _interopRequireDefault(require("./route-cache"));

var _routeLazy = require("./route-lazy");

var _routeGuard = require("./route-guard");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var ReactVueLike;
var nexting = null;

function routetInterceptors(_x, _x2, _x3, _x4) {
  return _routetInterceptors.apply(this, arguments);
}

function _routetInterceptors() {
  _routetInterceptors = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(interceptors, to, from, next) {
    var isBlock, beforeInterceptor, _beforeInterceptor;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _beforeInterceptor = function _ref8() {
              _beforeInterceptor = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee5(interceptor, index, to, from, next) {
                var nextWrapper;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        if (!(interceptor && interceptor.lazy)) {
                          _context5.next = 6;
                          break;
                        }

                        _context5.next = 3;
                        return interceptor(interceptors, index);

                      case 3:
                        interceptor = _context5.sent;
                        _context5.next = 0;
                        break;

                      case 6:
                        if (interceptor) {
                          _context5.next = 8;
                          break;
                        }

                        return _context5.abrupt("return", next());

                      case 8:
                        nextWrapper = nexting = (0, _util.once)(
                        /*#__PURE__*/
                        function () {
                          var _ref5 = _asyncToGenerator(
                          /*#__PURE__*/
                          regeneratorRuntime.mark(function _callee4(f1) {
                            var nextInterceptor;
                            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                              while (1) {
                                switch (_context4.prev = _context4.next) {
                                  case 0:
                                    nextInterceptor = interceptors[++index];

                                    if (!isBlock(f1, interceptor)) {
                                      _context4.next = 3;
                                      break;
                                    }

                                    return _context4.abrupt("return", next(f1));

                                  case 3:
                                    if (f1 === true) f1 = undefined;

                                    if (nextInterceptor) {
                                      _context4.next = 6;
                                      break;
                                    }

                                    return _context4.abrupt("return", next(function (res) {
                                      return (0, _util.isFunction)(f1) && f1(res);
                                    }));

                                  case 6:
                                    _context4.prev = 6;
                                    _context4.next = 9;
                                    return beforeInterceptor(nextInterceptor, index, to, from, next);

                                  case 9:
                                    return _context4.abrupt("return", _context4.sent);

                                  case 12:
                                    _context4.prev = 12;
                                    _context4.t0 = _context4["catch"](6);
                                    console.error(_context4.t0);
                                    next(typeof _context4.t0 === 'string' ? new Error(_context4.t0) : _context4.t0);

                                  case 16:
                                  case "end":
                                    return _context4.stop();
                                }
                              }
                            }, _callee4, null, [[6, 12]]);
                          }));

                          return function (_x14) {
                            return _ref5.apply(this, arguments);
                          };
                        }());
                        _context5.next = 11;
                        return interceptor(to, from, nextWrapper, interceptor.route);

                      case 11:
                        return _context5.abrupt("return", _context5.sent);

                      case 12:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5);
              }));
              return _beforeInterceptor.apply(this, arguments);
            };

            beforeInterceptor = function _ref7(_x9, _x10, _x11, _x12, _x13) {
              return _beforeInterceptor.apply(this, arguments);
            };

            isBlock = function _ref6(v, interceptor) {
              var _isLocation = typeof v === 'string' || (0, _util.isLocation)(v);

              if (_isLocation && interceptor) {
                v = (0, _util.normalizeLocation)(v, interceptor.route);

                if (v.fullPath === to.fullPath) {
                  v = undefined;
                  _isLocation = false;
                }
              }

              return v === false || _isLocation || v instanceof Error;
            };

            if (!next) {
              _context6.next = 8;
              break;
            }

            _context6.next = 6;
            return beforeInterceptor(interceptors[0], 0, to, from, next);

          case 6:
            _context6.next = 9;
            break;

          case 8:
            (0, _util.afterInterceptors)(interceptors, to, from);

          case 9:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _routetInterceptors.apply(this, arguments);
}

var HISTORY_METHS = ['push', 'replace', 'go', 'back', 'goBack', 'forward', 'goForward', 'block'];

var ReactViewRouter =
/*#__PURE__*/
function () {
  function ReactViewRouter() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ReactViewRouter);

    if (!options.mode) options.mode = 'hash';
    options.getUserConfirmation = this._handleRouteInterceptor.bind(this);
    if (options.base) options.basename = options.base;

    if (options.history) {
      if (options.history instanceof ReactViewRouter) {
        this.history = options.history.history;
        this.mode = options.history.mode;
      } else this.history = options.history;
    } else {
      switch (options.mode) {
        case 'browser':
        case 'history':
          this.history = (0, _historyFix.createBrowserHistory)(options);
          break;

        case 'memory':
        case 'abstract':
          this.history = (0, _historyFix.createMemoryHistory)(options);
          break;

        default:
          this.history = (0, _historyFix.createHashHistory)(options);
      }
    }

    this.mode = options.mode;
    this.basename = options.basename || '';
    this.routes = [];
    this.plugins = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.prevRoute = null;
    this.currentRoute = null;
    this.viewRoot = null;
    this.errorCallback = null; // this.states = [];
    // this.stateOrigin = this.history.length;

    this._unlisten = this.history.listen(function (location) {
      return _this.updateRoute(location);
    });
    this.history.block(function (location) {
      return _routeCache.default.create(location);
    });
    Object.keys(this.history).forEach(function (key) {
      return !HISTORY_METHS.includes(key) && (_this[key] = _this.history[key]);
    });
    HISTORY_METHS.forEach(function (key) {
      return _this[key] && (_this[key] = _this[key].bind(_this));
    });
    this.nextTick = _util.nextTick.bind(this);
    this.use(options);
  }

  _createClass(ReactViewRouter, [{
    key: "use",
    value: function use(_ref) {
      var routes = _ref.routes,
          inheritProps = _ref.inheritProps,
          install = _ref.install,
          restOptions = _objectWithoutProperties(_ref, ["routes", "inheritProps", "install"]);

      if (routes) {
        this.routes = routes ? (0, _util.normalizeRoutes)(routes) : [];
        this.updateRoute(this.history.location);
      }

      if (inheritProps !== undefined) _config.default.inheritProps = inheritProps;
      Object.assign(_config.default, restOptions);
      if (install) this.install = install.bind(this);
    }
  }, {
    key: "plugin",
    value: function plugin(_plugin) {
      if (~this.plugins.indexOf(_plugin)) return;
      this.plugins.push(_plugin);
      if (_plugin.install) _plugin.install(this);
      return function () {
        var idx = this.plugins.indexOf(_plugin);

        if (~idx) {
          this.plugins.splice(idx, 1);
          if (_plugin.uninstall) _plugin.uninstall(this);
        }
      };
    }
  }, {
    key: "_callEvent",
    value: function _callEvent(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var plugin;

      try {
        var ret;
        this.plugins.forEach(function (p) {
          var _p$event;

          plugin = p;

          var newRet = p[event] && (_p$event = p[event]).call.apply(_p$event, [p].concat(args, [ret]));

          if (newRet !== undefined) ret = newRet;
        });
        return ret;
      } catch (ex) {
        if (plugin && plugin.name && ex && ex.message) ex.message = "[".concat(plugin.name, ":").concat(event, "]").concat(ex.message);
        throw ex;
      }
    }
  }, {
    key: "_getComponentGurads",
    value: function _getComponentGurads(r, guardName) {
      var _this2 = this;

      var bindInstance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var ret = [];
      var componentInstances = r.componentInstances; // route config

      var routeGuardName = guardName.replace('Route', '');
      if (r.config) r = r.config;
      var guards = r[routeGuardName];
      if (guards) ret.push(guards);

      var toResovle = function toResovle(c, key) {
        var ret = [];
        var cc = c.__component ? (0, _routeGuard.getGuardsComponent)(c, true) : c;
        var cg = c.__guards && c.__guards[guardName];
        if (cg) ret.push(cg);
        var ccg = cc && cc.prototype && cc.prototype[guardName];

        if (ccg) {
          if (ReactVueLike && !ccg.isMobxFlow && cc.__flows && cc.__flows.includes(guardName)) ccg = ReactVueLike.flow(ccg);
          ret.push(ccg);
        }

        if (cc && ReactVueLike && cc.prototype instanceof ReactVueLike && Array.isArray(cc.mixins)) {
          cc.mixins.forEach(function (m) {
            var ccg = m[guardName] || m.prototype && m.prototype[guardName];
            if (!ccg) return;
            if (!ccg.isMobxFlow && m.__flows && m.__flows.includes(guardName)) ccg = ReactVueLike.flow(ccg);
            ret.push(ccg);
          });
        }

        var ci = componentInstances[key];

        if (bindInstance) {
          if ((0, _util.isFunction)(bindInstance)) ret = ret.map(function (v) {
            return bindInstance(v, key, ci, r);
          }).filter(Boolean);else if (ci) ret = ret.map(function (v) {
            return v.bind(ci);
          });
        }

        ret = (0, _util.flatten)(ret);
        ret.forEach(function (v) {
          return v.route = r;
        });
        return ret;
      }; // route component


      r.components && Object.keys(r.components).forEach(function (key) {
        var c = r.components[key];
        if (!c) return;

        if (c instanceof _routeLazy.RouteLazy) {
          var lazyResovle =
          /*#__PURE__*/
          function () {
            var _ref2 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee(interceptors, index) {
              var nc, ret;
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return c.toResolve(r, key);

                    case 2:
                      nc = _context.sent;
                      nc = _this2._callEvent('onResolveComponent', nc, r) || nc;
                      ret = toResovle(nc, key);
                      interceptors.splice.apply(interceptors, [index, 1].concat(_toConsumableArray(ret)));
                      return _context.abrupt("return", interceptors[index]);

                    case 7:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            }));

            return function lazyResovle(_x5, _x6) {
              return _ref2.apply(this, arguments);
            };
          }();

          lazyResovle.lazy = true;
          lazyResovle.route = r;
          ret.push(lazyResovle);
        } else ret.push.apply(ret, _toConsumableArray(toResovle(c, key)));
      });
      return ret;
    }
  }, {
    key: "_getRouteComponentGurads",
    value: function _getRouteComponentGurads(matched, guardName) {
      var _this3 = this;

      var reverse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var bindInstance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var ret = [];
      if (reverse) matched = matched.reverse();
      matched.forEach(function (r) {
        var guards = _this3._getComponentGurads(r, guardName, bindInstance);

        ret.push.apply(ret, _toConsumableArray(guards));
      });
      return ret;
    }
  }, {
    key: "_getSameMatched",
    value: function _getSameMatched(route, compare) {
      var ret = [];
      if (!compare) return [];
      route && route.matched.some(function (tr, i) {
        var fr = compare.matched[i];
        if (tr.path !== fr.path) return true;
        ret.push(tr);
      });
      return ret.filter(function (r) {
        return !r.redirect;
      });
    }
  }, {
    key: "_getChangeMatched",
    value: function _getChangeMatched(route, compare, count) {
      var ret = [];
      if (!compare) return _toConsumableArray(route.matched);
      var start = false;
      route && route.matched.some(function (tr, i) {
        var fr = compare.matched[i];

        if (!start) {
          start = !fr || fr.path !== tr.path;
          if (!start) return;
        }

        ret.push(tr);
        return count !== undefined && ret.length === count;
      });
      return ret.filter(function (r) {
        return !r.redirect;
      });
    }
  }, {
    key: "_getBeforeEachGuards",
    value: function _getBeforeEachGuards(to, from, current) {
      var _this4 = this;

      var ret = _toConsumableArray(this.beforeEachGuards);

      var view = this;

      if (from) {
        var fm = this._getChangeMatched(from, to).filter(function (r) {
          return Object.keys(r.componentInstances).some(function (key) {
            return r.componentInstances[key];
          });
        });

        ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(fm, 'beforeRouteLeave', function (fn, name, ci, r) {
          return function beforeRouteLeaveWraper(to, from, next) {
            return fn(to, from, function (cb) {
              if ((0, _util.isFunction)(cb)) {
                var _cb = cb;

                cb = function cb() {
                  var res = _cb.apply(void 0, arguments);

                  view._callEvent('onRouteLeaveNext', r, ci, res);

                  return res;
                };
              }

              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }

              return next.apply(void 0, [cb].concat(args));
            });
          };
        })));
      }

      if (to) {
        var tm = this._getChangeMatched(to, from);

        tm.forEach(function (r) {
          var guards = _this4._getComponentGurads(r, 'beforeRouteEnter', function (fn, name) {
            return function beforeRouteEnterWraper(to, from, next) {
              return fn(to, from, function (cb) {
                if ((0, _util.isFunction)(cb)) {
                  var _cb = cb;

                  r.config._pending.completeCallbacks[name] = function (ci) {
                    var res = _cb(ci);

                    view._callEvent('onRouteEnterNext', r, ci, res);

                    return res;
                  };

                  cb = undefined;
                }

                for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                  args[_key3 - 1] = arguments[_key3];
                }

                return next.apply(void 0, [cb].concat(args));
              });
            };
          });

          ret.push.apply(ret, _toConsumableArray(guards));
        });
        if (from !== current) tm = this._getChangeMatched(to, current);
        tm.forEach(function (r) {
          var compGuards = {};

          var allGuards = _this4._getComponentGurads(r, 'afterRouteEnter', function (fn, name) {
            if (!compGuards[name]) compGuards[name] = [];
            compGuards[name].push(function () {
              return fn.call(this, to, current);
            });
            return null;
          });

          Object.keys(compGuards).forEach(function (name) {
            var _compGuards$name;

            return (_compGuards$name = compGuards[name]).push.apply(_compGuards$name, _toConsumableArray(allGuards));
          });
          r.config._pending.afterEnterGuards = compGuards;
        });
      }

      return (0, _util.flatten)(ret);
    }
  }, {
    key: "_getRouteUpdateGuards",
    value: function _getRouteUpdateGuards(to, from) {
      var ret = [];
      var fm = [];
      to && to.matched.some(function (tr, i) {
        var fr = from.matched[i];
        if (!fr || fr.path !== tr.path) return true;
        fm.push(fr);
      });
      ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(fm.filter(function (r) {
        return !r.redirect;
      }), 'beforeRouteUpdate', true)));
      return ret;
    }
  }, {
    key: "_getAfterEachGuards",
    value: function _getAfterEachGuards(to, from) {
      var ret = [];

      if (from) {
        var fm = this._getChangeMatched(from, to).filter(function (r) {
          return Object.keys(r.componentInstances).some(function (key) {
            return r.componentInstances[key];
          });
        });

        ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(fm, 'afterRouteLeave', true)));
      }

      ret.push.apply(ret, _toConsumableArray(this.afterEachGuards));
      return (0, _util.flatten)(ret);
    }
  }, {
    key: "_handleRouteInterceptor",
    value: function () {
      var _handleRouteInterceptor2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this._callEvent('onRouteing', true);

                _context2.prev = 1;
                _context2.next = 4;
                return this._internalHandleRouteInterceptor.apply(this, _args2);

              case 4:
                return _context2.abrupt("return", _context2.sent);

              case 5:
                _context2.prev = 5;

                this._callEvent('onRouteing', false);

                return _context2.finish(5);

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1,, 5, 8]]);
      }));

      function _handleRouteInterceptor() {
        return _handleRouteInterceptor2.apply(this, arguments);
      }

      return _handleRouteInterceptor;
    }()
  }, {
    key: "_internalHandleRouteInterceptor",
    value: function () {
      var _internalHandleRouteInterceptor2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(location, callback) {
        var _this5 = this;

        var isInit,
            isContinue,
            to,
            from,
            current,
            fallbackView,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                isInit = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : false;
                if (typeof location === 'string') location = _routeCache.default.flush(location);

                if (location) {
                  _context3.next = 4;
                  break;
                }

                return _context3.abrupt("return", callback(true));

              case 4:
                isContinue = false;
                _context3.prev = 5;
                to = this.createRoute(location);
                from = isInit ? null : to.redirectedFrom || this.currentRoute;
                current = this.currentRoute;

                if (!(to && from && to.fullPath === from.fullPath)) {
                  _context3.next = 13;
                  break;
                }

                callback(true);
                if (to.onInit) to.onInit(to);
                return _context3.abrupt("return");

              case 13:
                if ((0, _routeLazy.hasMatchedRouteLazy)(to.matched)) {
                  fallbackView = this.viewRoot;

                  this._getSameMatched(isInit ? null : this.currentRoute, to).reverse().some(function (m) {
                    if (!m.viewInstances.default || !m.viewInstances.default.props.fallback) return;
                    return fallbackView = m.viewInstances.default;
                  });
                }

                fallbackView && fallbackView._updateResolving(true);
                routetInterceptors(this._getBeforeEachGuards(to, from, current), to, from, function (ok) {
                  nexting = null;
                  fallbackView && setTimeout(function () {
                    return fallbackView._isMounted && fallbackView._updateResolving(false);
                  }, 0);
                  if (ok && typeof ok === 'string') ok = {
                    path: ok
                  };
                  isContinue = Boolean(ok === undefined || ok && !(ok instanceof Error) && !(0, _util.isLocation)(ok));
                  var toLast = to.matched[to.matched.length - 1];

                  if (isContinue && toLast && toLast.config.exact && toLast.redirect) {
                    ok = (0, _util.resolveRedirect)(toLast.redirect, toLast, to);
                    if (ok) isContinue = false;
                  }

                  callback(isContinue);

                  if (!isContinue) {
                    if ((0, _util.isLocation)(ok)) {
                      if (to.onAbort) ok.onAbort = to.onAbort;
                      if (to.onComplete) ok.onComplete = to.onComplete;
                      return _this5.redirect(ok, null, null, to.onInit || (isInit ? callback : null), to);
                    }

                    if (to && (0, _util.isFunction)(to.onAbort)) to.onAbort(ok, to);
                    if (ok instanceof Error) _this5.errorCallback && _this5.errorCallback(ok);
                    return;
                  }

                  if (to.onInit) to.onInit(to);

                  _this5.nextTick(function () {
                    if ((0, _util.isFunction)(ok)) ok = ok(to);
                    if (!isInit && current.fullPath !== to.fullPath) routetInterceptors(_this5._getRouteUpdateGuards(to, current), to, current);
                    if (to && (0, _util.isFunction)(to.onComplete)) to.onComplete(ok, to);
                    routetInterceptors(_this5._getAfterEachGuards(to, current), to, current);
                  });
                });
                _context3.next = 22;
                break;

              case 18:
                _context3.prev = 18;
                _context3.t0 = _context3["catch"](5);
                console.error(_context3.t0);
                if (!isContinue) callback(isContinue);

              case 22:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[5, 18]]);
      }));

      function _internalHandleRouteInterceptor(_x7, _x8) {
        return _internalHandleRouteInterceptor2.apply(this, arguments);
      }

      return _internalHandleRouteInterceptor;
    }()
  }, {
    key: "_go",
    value: function _go(to, onComplete, onAbort, onInit, replace) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        to = (0, _util.normalizeLocation)(to, _this6.currentRoute);

        function doComplete(res, _to) {
          onComplete && onComplete(res, _to);
          resolve(res);
        }

        function doAbort(res, _to) {
          onAbort && onAbort(res, _to);
          reject(res);
        }

        if ((0, _util.isFunction)(onComplete)) to.onComplete = (0, _util.once)(doComplete);
        if ((0, _util.isFunction)(onAbort)) to.onAbort = (0, _util.once)(doAbort);
        if (onInit) to.onInit = onInit;
        if (nexting) return nexting(to);

        if (replace) {
          to.isReplace = true;
          if (to.fullPath && (0, _util.isAbsoluteUrl)(to.fullPath)) location.replace(to.fullPath);else _this6.history.replace(to);
        } else {
          if (to.fullPath && (0, _util.isAbsoluteUrl)(to.fullPath)) location.href = to.fullPath;else _this6.history.push(to);
        }
      });
    }
  }, {
    key: "_replace",
    value: function _replace(to, onComplete, onAbort, onInit) {
      return this._go(to, onComplete, onAbort, onInit, true);
    }
  }, {
    key: "_push",
    value: function _push(to, onComplete, onAbort, onInit) {
      return this._go(to, onComplete, onAbort, onInit);
    }
  }, {
    key: "createMatchedRoute",
    value: function createMatchedRoute(route, match) {
      var ret = {
        componentInstances: {},
        viewInstances: {}
      };
      Object.keys(route).forEach(function (key) {
        return ['path', 'name', 'subpath', 'meta', 'redirect', 'depth'].includes(key) && (ret[key] = route[key]);
      });
      ret.config = route;
      if (!match) match = {};
      ret.url = match.url || '';
      ret.params = match.params || {};
      return ret;
    }
  }, {
    key: "getMatched",
    value: function getMatched(to, from, parent) {
      var _this7 = this;

      if (!from) from = this.currentRoute;

      function copyInstance(to, from) {
        if (!from) return;
        if (from.componentInstances) to.componentInstances = from.componentInstances;
        if (from.viewInstances) to.viewInstances = from.viewInstances;
      }

      var matched = (0, _util.matchRoutes)(this.routes, to, parent);
      return matched.map(function (_ref3, i) {
        var route = _ref3.route,
            match = _ref3.match;

        var ret = _this7.createMatchedRoute(route, match);

        if (from) {
          var fr = from.matched[i];
          var tr = matched[i];
          if (fr && tr && fr.path === tr.route.path) copyInstance(ret, fr);
        }

        return ret;
      });
    }
  }, {
    key: "getMatchedComponents",
    value: function getMatchedComponents(to, from, parent) {
      return this.getMatched(to, from, parent).map(function (r) {
        return r.componentInstances.default;
      }).filter(Boolean);
    }
  }, {
    key: "getMatchedViews",
    value: function getMatchedViews(to, from, parent) {
      return this.getMatched(to, from, parent).map(function (r) {
        return r.viewInstances.default;
      }).filter(Boolean);
    }
  }, {
    key: "createRoute",
    value: function createRoute(to, from) {
      if (!from) from = to.redirectedFrom || this.currentRoute;
      var matched = this.getMatched(to, from);
      var last = matched.length ? matched[matched.length - 1] : {
        url: '',
        params: {},
        meta: {}
      };
      var search = to.search,
          query = to.query,
          path = to.path,
          onAbort = to.onAbort,
          onComplete = to.onComplete;
      var ret = {
        action: this.history.action,
        url: last.url,
        basename: this.basename,
        path: path,
        fullPath: "".concat(path).concat(search),
        query: query || (search ? _config.default.parseQuery(to.search.substr(1)) : {}),
        params: last.params || {},
        matched: matched,
        meta: last.meta || {},
        onAbort: onAbort,
        onComplete: onComplete
      };

      if (to.isRedirect && from) {
        ret.redirectedFrom = from;
        if (!ret.onAbort && from.onAbort) ret.onAbort = from.onAbort;
        if (!ret.onComplete && from.onComplete) ret.onComplete = from.onComplete;
        if (!ret.onInit && to.onInit) ret.onInit = to.onInit;
      }

      return ret;
    }
  }, {
    key: "updateRoute",
    value: function updateRoute(to) {
      if (!to) to = this.history.location;
      this.prevRoute = this.currentRoute;
      this.currentRoute = this.createRoute(to, this.prevRoute); // const statesLen = this.states.length + this.stateOrigin;
      // const historyLen = this.history.length - this.stateOrigin;
      // if (this.history.action === 'POP') {
      //   this.currentRoute.state = this.states[historyLen];
      //   if (statesLen > this.history.length) this.states.splice(historyLen);
      // } else {
      //   if (statesLen > this.history.length) this.states.splice(historyLen - 1);
      //   this.states.push(this.currentRoute.state);
      // }

      var tm = this.prevRoute && this._getChangeMatched(this.prevRoute, this.currentRoute, 1)[0];

      if (tm) {
        Object.keys(tm.viewInstances).forEach(function (key) {
          return tm.viewInstances[key]._refreshCurrentRoute();
        });
      } else if (this.viewRoot) this.viewRoot._refreshCurrentRoute();

      this._callEvent('onRouteChange', this.currentRoute, this);
    }
  }, {
    key: "push",
    value: function push(to, onComplete, onAbort) {
      return this._push(to, onComplete, onAbort);
    }
  }, {
    key: "replace",
    value: function replace(to, onComplete, onAbort) {
      return this._replace(to, onComplete, onAbort);
    }
  }, {
    key: "redirect",
    value: function redirect(to, onComplete, onAbort, onInit, from) {
      to = (0, _util.normalizeLocation)(to);
      to.isRedirect = true;
      to.redirectedFrom = from || this.currentRoute;
      return to.isReplace ? this._replace(to, onComplete, onAbort, onInit) : this._push(to, onComplete, onAbort, onInit);
    }
  }, {
    key: "go",
    value: function go(n) {
      return this.history.go(n);
    }
  }, {
    key: "back",
    value: function back() {
      return this.history.goBack();
    }
  }, {
    key: "goBack",
    value: function goBack() {
      return this.history.goBack();
    }
  }, {
    key: "forward",
    value: function forward() {
      return this.history.goForward();
    }
  }, {
    key: "goForward",
    value: function goForward() {
      return this.history.goForward();
    }
  }, {
    key: "beforeEach",
    value: function beforeEach(guard) {
      if (!guard || typeof guard !== 'function') return;
      var i = this.beforeEachGuards.indexOf(guard);
      if (~i) this.beforeEachGuards.splice(i, 1);
      this.beforeEachGuards.push(guard);
    }
  }, {
    key: "afterEach",
    value: function afterEach(guard) {
      if (!guard || typeof guard !== 'function') return;
      var i = this.afterEachGuards.indexOf(guard);
      if (~i) this.afterEachGuards.splice(i, 1);
      this.afterEachGuards.push(guard);
    }
  }, {
    key: "addRoutes",
    value: function addRoutes(routes, parentRoute) {
      var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'default';
      if (!routes) return;
      if (!Array.isArray(routes)) routes = [routes];
      routes = (0, _util.normalizeRoutes)(routes, parentRoute);
      var children = parentRoute ? parentRoute.children : this.routes;
      if (!children) return;
      routes.forEach(function (r) {
        var i = children.findIndex(function (v) {
          return v.path === r.path;
        });
        if (~i) children.splice(i, 1, r);else children.push(r);
      });
      if (parentRoute && parentRoute.viewInstances[name]) parentRoute.viewInstances[name].setState({
        routes: routes
      });else if (this.state.viewRoot) this.state.viewRoot.setState({
        routes: routes
      });
    }
  }, {
    key: "parseQuery",
    value: function parseQuery(query) {
      return _config.default.parseQuery(query);
    }
  }, {
    key: "stringifyQuery",
    value: function stringifyQuery(obj) {
      return _config.default.stringifyQuery(obj);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.errorCallback = callback;
    }
  }, {
    key: "install",
    value: function install(_ReactVueLike, _ref4) {
      var App = _ref4.App;
      ReactVueLike = _ReactVueLike;
      if (!App.inherits) App.inherits = {};
      App.inherits.$router = this;
      App.inherits.$route = ReactVueLike.observable(this.currentRoute || {});
      _config.default.inheritProps = false;
      var app;

      ReactVueLike.config.inheritMergeStrategies.$route = function (parent, child, vm) {
        if (vm._isVueLikeRoot) {
          vm.$set(vm, '$route', parent);
          app = vm;
        } else {
          vm.$computed(vm, '$route', function () {
            return this.$root ? this.$root.$route : null;
          });
        }
      };

      this.plugin({
        name: 'react-view-router-vue-like-plugin',
        onRouteChange: ReactVueLike.action('[react-view-router]onRouteChange', function (newVal) {
          if (app) app.$route = ReactVueLike.observable(newVal, {}, {
            deep: false
          });else Object.assign(App.inherits.$route, ReactVueLike.observable(newVal, {}, {
            deep: false
          }));
        })
      });
    }
  }]);

  return ReactViewRouter;
}();

exports.default = ReactViewRouter;