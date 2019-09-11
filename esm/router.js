"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routetInterceptors = routetInterceptors;
exports.default = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.regexp.search");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.regexp.replace");

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function routetInterceptors(_x, _x2, _x3, _x4) {
  return _routetInterceptors.apply(this, arguments);
}

function _routetInterceptors() {
  _routetInterceptors = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(interceptors, to, from, next) {
    var isBlock, routetInterceptor, _routetInterceptor, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, interceptor;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _routetInterceptor = function _ref6() {
              _routetInterceptor = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee3(interceptor, index, to, from, next) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        if (interceptor) {
                          _context3.next = 2;
                          break;
                        }

                        return _context3.abrupt("return", next());

                      case 2:
                        _context3.next = 4;
                        return interceptor(to, from,
                        /*#__PURE__*/
                        function () {
                          var _ref3 = _asyncToGenerator(
                          /*#__PURE__*/
                          regeneratorRuntime.mark(function _callee2(f1) {
                            var nextInterceptor;
                            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                              while (1) {
                                switch (_context2.prev = _context2.next) {
                                  case 0:
                                    nextInterceptor = interceptors[++index];

                                    if (!(isBlock(f1) || !nextInterceptor)) {
                                      _context2.next = 3;
                                      break;
                                    }

                                    return _context2.abrupt("return", next(f1));

                                  case 3:
                                    if (typeof f1 === 'boolean') f1 = undefined;
                                    _context2.prev = 4;

                                    if (!nextInterceptor) {
                                      _context2.next = 11;
                                      break;
                                    }

                                    _context2.next = 8;
                                    return routetInterceptor(nextInterceptor, index, to, from, next);

                                  case 8:
                                    _context2.t0 = _context2.sent;
                                    _context2.next = 12;
                                    break;

                                  case 11:
                                    _context2.t0 = next(function (res) {
                                      return (0, _util.isFunction)(f1) && f1(res);
                                    });

                                  case 12:
                                    return _context2.abrupt("return", _context2.t0);

                                  case 15:
                                    _context2.prev = 15;
                                    _context2.t1 = _context2["catch"](4);
                                    next(_context2.t1);

                                  case 18:
                                  case "end":
                                    return _context2.stop();
                                }
                              }
                            }, _callee2, null, [[4, 15]]);
                          }));

                          return function (_x12) {
                            return _ref3.apply(this, arguments);
                          };
                        }());

                      case 4:
                        return _context3.abrupt("return", _context3.sent);

                      case 5:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));
              return _routetInterceptor.apply(this, arguments);
            };

            routetInterceptor = function _ref5(_x7, _x8, _x9, _x10, _x11) {
              return _routetInterceptor.apply(this, arguments);
            };

            isBlock = function _ref4(v) {
              return v === false || typeof v === 'string' || (0, _util.isLocation)(v) || v instanceof Error;
            };

            if (!next) {
              _context4.next = 7;
              break;
            }

            _context4.next = 6;
            return routetInterceptor(interceptors[0], 0, to, from, next);

          case 6:
            return _context4.abrupt("return", _context4.sent);

          case 7:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context4.prev = 10;
            _iterator = interceptors[Symbol.iterator]();

          case 12:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context4.next = 21;
              break;
            }

            interceptor = _step.value;
            _context4.t0 = interceptor;

            if (!_context4.t0) {
              _context4.next = 18;
              break;
            }

            _context4.next = 18;
            return interceptor(to, from);

          case 18:
            _iteratorNormalCompletion = true;
            _context4.next = 12;
            break;

          case 21:
            _context4.next = 27;
            break;

          case 23:
            _context4.prev = 23;
            _context4.t1 = _context4["catch"](10);
            _didIteratorError = true;
            _iteratorError = _context4.t1;

          case 27:
            _context4.prev = 27;
            _context4.prev = 28;

            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }

          case 30:
            _context4.prev = 30;

            if (!_didIteratorError) {
              _context4.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context4.finish(30);

          case 34:
            return _context4.finish(27);

          case 35:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[10, 23, 27, 35], [28,, 30, 34]]);
  }));
  return _routetInterceptors.apply(this, arguments);
}

var HISTORY_METHODS = ['push', 'replace', 'go', 'back', 'goBack', 'forward', 'goForward', 'block'];

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
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.currentRoute = null;
    this.viewRoot = null;
    this.routeChangeListener = [];
    this._unlisten = this.history.listen(function (location) {
      return _this.updateRoute(location);
    });
    this.history.block(function (location) {
      return _routeCache.default.create(location);
    });
    Object.keys(this.history).forEach(function (key) {
      return !HISTORY_METHODS.includes(key) && (_this[key] = _this.history[key]);
    });
    HISTORY_METHODS.forEach(function (key) {
      return _this[key] && (_this[key] = _this[key].bind(_this));
    });
    this.nextTick = _util.nextTick.bind(this);
    this.use(options);
  }

  _createClass(ReactViewRouter, [{
    key: "use",
    value: function use(_ref) {
      var routes = _ref.routes,
          parseQuery = _ref.parseQuery,
          stringifyQuery = _ref.stringifyQuery,
          inheritProps = _ref.inheritProps,
          install = _ref.install;

      if (routes) {
        this.routes = routes ? (0, _util.normalizeRoutes)(routes) : [];
        this.updateRoute(this.history.location);
      }

      if (inheritProps !== undefined) _config.default.inheritProps = inheritProps;
      if (parseQuery) _config.default.parseQuery = parseQuery;
      if (stringifyQuery) _config.default.stringifyQuery = stringifyQuery;
      if (install) this.install = install.bind(this);
    }
  }, {
    key: "_getComponentGurads",
    value: function _getComponentGurads(r, guardName) {
      var bindInstance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var ret = [];
      var componentInstances = r.componentInstances; // route config

      var routeGuardName = guardName.replace('Route', '');
      if (r.config) r = r.config;
      var guards = r[routeGuardName];
      if (guards) ret.push(guards); // route component

      Object.keys(r.components).forEach(function (key) {
        var g = [];
        var c = r.components[key];
        if (!c) return;
        var cc = c.__component ? (0, _routeGuard.getGuardsComponent)(c, true) : c;
        var cg = c.__guards && c.__guards[guardName];
        if (cc && cc.prototype && cc.prototype[guardName]) g.push(cc.prototype[guardName]);
        if (cg) g.push(cg);
        var ci = componentInstances[key];

        if (bindInstance) {
          if ((0, _util.isFunction)(bindInstance)) g = g.map(function (v) {
            return bindInstance(v, key, ci, r);
          }).filter(Boolean);else if (ci) g = g.map(function (v) {
            return v.bind(ci);
          });
        }

        ret.push.apply(ret, _toConsumableArray(g));
      });
      return (0, _util.flatten)(ret);
    }
  }, {
    key: "_getRouteComponentGurads",
    value: function _getRouteComponentGurads(matched, guardName) {
      var _this2 = this;

      var reverse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var bindInstance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var ret = [];
      if (reverse) matched = matched.reverse();
      matched.forEach(function (r) {
        var guards = _this2._getComponentGurads(r, guardName, bindInstance);

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
      return ret;
    }
  }, {
    key: "_getChangeMatched",
    value: function _getChangeMatched(route, compare) {
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
      });
      return ret;
    }
  }, {
    key: "_getBeforeEachGuards",
    value: function _getBeforeEachGuards(to, from) {
      var _this3 = this;

      var ret = _toConsumableArray(this.beforeEachGuards);

      if (from) {
        var fm = this._getChangeMatched(from, to);

        ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(fm, 'beforeRouteLeave', true)));
      }

      if (to) {
        var tm = this._getChangeMatched(to, from);

        tm.forEach(function (r) {
          var guards = _this3._getComponentGurads(r, 'beforeRouteEnter', function (fn, name) {
            return function (to, from, next) {
              return fn(to, from, function (cb) {
                if ((0, _util.isFunction)(cb)) {
                  var _cb = cb;

                  r.config._pending.completeCallbacks[name] = function (el) {
                    return _cb(el);
                  };

                  cb = undefined;
                }

                return next(cb);
              });
            };
          });

          ret.push.apply(ret, _toConsumableArray(guards));
        });
        tm.forEach(function (r) {
          var compGuards = {};

          var allGuards = _this3._getComponentGurads(r, 'afterRouteEnter', function (fn, name) {
            if (!compGuards[name]) compGuards[name] = [];
            compGuards[name].push(function () {
              return fn.call(this, to, from);
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
      ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(fm, 'beforeRouteUpdate', true)));
      return ret;
    }
  }, {
    key: "_getAfterEachGuards",
    value: function _getAfterEachGuards(to, from) {
      var ret = [];

      if (from) {
        var fm = this._getChangeMatched(from, to);

        ret.push.apply(ret, _toConsumableArray(this._getRouteComponentGurads(fm, 'afterRouteLeave', true)));
      } // if (to) {
      //   const tm = this._getChangeMatched(to, from);
      // }


      ret.push.apply(ret, _toConsumableArray(this.afterEachGuards));
      return (0, _util.flatten)(ret);
    }
  }, {
    key: "_handleRouteInterceptor",
    value: function () {
      var _handleRouteInterceptor2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(location, callback) {
        var _this4 = this;

        var isInit,
            isContinue,
            to,
            from,
            fallbackView,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                isInit = _args.length > 2 && _args[2] !== undefined ? _args[2] : false;
                if (typeof location === 'string') location = _routeCache.default.flush(location);

                if (location) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return", callback(true));

              case 4:
                isContinue = false;
                _context.prev = 5;
                to = this.createRoute(location);
                from = isInit ? null : this.currentRoute;

                if ((0, _routeLazy.hasRouteLazy)(to.matched)) {
                  this._getSameMatched(from, to).reverse().some(function (m) {
                    if (m.viewInstance && m.viewInstance.props.fallback) fallbackView = m.viewInstance;
                    return fallbackView;
                  });
                }

                fallbackView && fallbackView._updateResolving(true);
                _context.prev = 10;
                _context.next = 13;
                return (0, _routeLazy.resolveRouteLazyList)(to.matched);

              case 13:
                if (!_context.sent) {
                  _context.next = 15;
                  break;
                }

                to = this.createRoute(location);

              case 15:
                _context.prev = 15;
                fallbackView && setTimeout(function () {
                  return fallbackView._updateResolving(false);
                }, 0);
                return _context.finish(15);

              case 18:
                routetInterceptors(this._getBeforeEachGuards(to, from), to, from, function (ok) {
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
                      return _this4.redirect(ok, null, null, to.onInit || (isInit ? callback : null));
                    }

                    if (to && (0, _util.isFunction)(to.onAbort)) to.onAbort(ok);
                    return;
                  }

                  if (to.onInit) to.onInit(to);

                  _this4.nextTick(function () {
                    if ((0, _util.isFunction)(ok)) ok(to);
                    if (!isInit && from.fullPath !== to.fullPath) routetInterceptors(_this4._getRouteUpdateGuards(to, from), to, from);
                    if (to && (0, _util.isFunction)(to.onComplete)) to.onComplete();
                    routetInterceptors(_this4._getAfterEachGuards(to, from), to, from);
                  });
                });
                _context.next = 25;
                break;

              case 21:
                _context.prev = 21;
                _context.t0 = _context["catch"](5);
                console.error(_context.t0);
                if (!isContinue) callback(isContinue);

              case 25:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 21], [10,, 15, 18]]);
      }));

      function _handleRouteInterceptor(_x5, _x6) {
        return _handleRouteInterceptor2.apply(this, arguments);
      }

      return _handleRouteInterceptor;
    }()
  }, {
    key: "_replace",
    value: function _replace(to, onComplete, onAbort, onInit) {
      to = (0, _util.normalizeLocation)(to);
      if ((0, _util.isFunction)(onComplete)) to.onComplete = (0, _util.once)(onComplete);
      if ((0, _util.isFunction)(onAbort)) to.onAbort = (0, _util.once)(onAbort);
      if (onInit) to.onInit = onInit;
      this.history.replace(to);
    }
  }, {
    key: "createRoute",
    value: function createRoute(to, from) {
      var matched = (0, _util.matchRoutes)(this.routes, to);
      var last = matched.length ? matched[matched.length - 1] : null;
      if (!from) from = this.currentRoute;

      function copyInstance(to, from) {
        if (!from) return;
        if (from.componentInstances) to.componentInstances = from.componentInstances;
        if (from.viewInstance) to.viewInstance = from.viewInstance;
      }

      var search = to.search,
          query = to.query,
          path = to.path,
          onAbort = to.onAbort,
          onComplete = to.onComplete;
      var ret = Object.assign({}, last ? last.match : null, {
        basename: this.basename,
        query: query || (search ? _config.default.parseQuery(to.search.substr(1)) : {}),
        path: path,
        fullPath: "".concat(path).concat(search),
        matched: matched.map(function (_ref2, i) {
          var route = _ref2.route;
          var ret = {
            componentInstances: {}
          };
          Object.keys(route).forEach(function (key) {
            return ['path', 'name', 'subpath', 'meta', 'redirect', 'alias'].includes(key) && (ret[key] = route[key]);
          });
          ret.config = route;

          if (from) {
            var fr = from.matched[i];
            if (!i) copyInstance(ret, fr);else {
              var pfr = from.matched[i - 1];
              var ptr = matched[i - 1];
              if (pfr && ptr && pfr.path === ptr.route.path) copyInstance(ret, fr);
            }
          }

          return ret;
        }),
        meta: last && last.route.meta || {},
        onAbort: onAbort,
        onComplete: onComplete
      });

      if (to.isRedirect && from) {
        ret.redirectedFrom = from.redirectedFrom || from;
        if (!ret.onAbort && from.onAbort) ret.onAbort = from.onAbort;
        if (!ret.onComplete && from.onComplete) ret.onComplete = from.onComplete;
        if (!ret.onInit && to.onInit) ret.onInit = to.onInit;
      }

      return ret;
    }
  }, {
    key: "updateRoute",
    value: function updateRoute(to) {
      var _this5 = this;

      if (!to) to = this.history.location;
      this.currentRoute = this.createRoute(to);
      this.routeChangeListener.forEach(function (handler) {
        return handler(_this5.currentRoute, _this5);
      });
    }
  }, {
    key: "push",
    value: function push(to, onComplete, onAbort) {
      to = (0, _util.normalizeLocation)(to);
      if ((0, _util.isFunction)(onComplete)) to.onComplete = (0, _util.once)(onComplete);
      if ((0, _util.isFunction)(onAbort)) to.onAbort = (0, _util.once)(onAbort);
      this.history.push(to);
    }
  }, {
    key: "replace",
    value: function replace(to, onComplete, onAbort) {
      return this._replace(to, onComplete, onAbort);
    }
  }, {
    key: "redirect",
    value: function redirect(to, onComplete, onAbort, onInit) {
      to = (0, _util.normalizeLocation)(to);
      to.isRedirect = true;
      return this._replace(to, onComplete, onAbort, onInit);
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
      if (parentRoute && parentRoute.viewInstance) parentRoute.viewInstance.setState({
        routes: routes
      });else if (this.state.viewRoot) this.state.viewRoot.setState({
        routes: routes
      });
    }
  }, {
    key: "onRouteChange",
    value: function onRouteChange(handler) {
      if (this.routeChangeListener.indexOf(handler) < 0) this.routeChangeListener.push(handler);
      return function () {
        var idx = this.routeChangeListener.indexOf(handler);
        if (~idx) this.routeChangeListener.splice(idx, 1);
      };
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
  }]);

  return ReactViewRouter;
}();

exports.default = ReactViewRouter;