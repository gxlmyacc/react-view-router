"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.object.get-own-property-descriptors");

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

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.object.assign");

var _historyFix = require("history-fix");

var _config = _interopRequireDefault(require("./config"));

var _util = require("./util");

var _routeCache = _interopRequireDefault(require("./route-cache"));

var _routeLazy = require("./route-lazy");

var _routeGuard = require("./route-guard");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HISTORY_METHS = ['push', 'replace', 'go', 'back', 'goBack', 'forward', 'goForward', 'block'];
var idSeed = 1;

var ReactViewRouter =
/*#__PURE__*/
function () {
  function ReactViewRouter() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$mode = _ref.mode,
        mode = _ref$mode === void 0 ? 'hash' : _ref$mode,
        _ref$basename = _ref.basename,
        basename = _ref$basename === void 0 ? '' : _ref$basename,
        _ref$base = _ref.base,
        base = _ref$base === void 0 ? '' : _ref$base,
        options = _objectWithoutProperties(_ref, ["mode", "basename", "base"]);

    _classCallCheck(this, ReactViewRouter);

    options.getUserConfirmation = this._handleRouteInterceptor.bind(this);
    this.id = idSeed++;
    this.options = options;
    this.mode = mode;
    this.basename = basename || base;
    this.routes = [];
    this.plugins = [];
    this.beforeEachGuards = [];
    this.afterEachGuards = [];
    this.prevRoute = null;
    this.currentRoute = null;
    this.viewRoot = null;
    this.errorCallback = null;
    this.app = null;
    this.getHostRouterView = _util.getHostRouterView; // this.states = [];
    // this.stateOrigin = this.history.length;

    this.use(options);
    this.nextTick = _util.nextTick.bind(this);
    if (!options.manual) this.start();
  }

  _createClass(ReactViewRouter, [{
    key: "start",
    value: function start() {
      var _this = this;

      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          mode = _ref2.mode,
          basename = _ref2.basename,
          base = _ref2.base,
          options = _objectWithoutProperties(_ref2, ["mode", "basename", "base"]);

      this.stop();
      Object.assign(this.options, options);
      if (basename !== undefined) this.basename = basename;
      if (base !== undefined) this.basename = base;
      if (mode !== undefined) this.mode = mode;
      this._unlisten = this.history.listen(function (location) {
        return _this.updateRoute(location);
      });
      this._unblock = this.history.block(function (location) {
        return _routeCache.default.create(location, _this.id);
      });
      if (this.routes.length) this.updateRoute(this.history.location);
    }
  }, {
    key: "stop",
    value: function stop() {
      if (this._unlisten) this._unlisten();
      if (this._unblock) this._unblock();
      this._history = null;
      this.app = null;
    }
  }, {
    key: "use",
    value: function use(_ref3) {
      var routes = _ref3.routes,
          inheritProps = _ref3.inheritProps,
          install = _ref3.install,
          restOptions = _objectWithoutProperties(_ref3, ["routes", "inheritProps", "install"]);

      if (routes) {
        this.routes = routes ? (0, _util.normalizeRoutes)(routes) : [];
        this._history && this.updateRoute(this._history.location);
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
          if (_this2.ReactVueLike && !ccg.isMobxFlow && cc.__flows && ~cc.__flows.indexOf(guardName)) ccg = _this2.ReactVueLike.flow(ccg);
          ret.push(ccg);
        }

        if (cc && _this2.ReactVueLike && cc.prototype instanceof _this2.ReactVueLike && Array.isArray(cc.mixins)) {
          cc.mixins.forEach(function (m) {
            var ccg = m[guardName] || m.prototype && m.prototype[guardName];
            if (!ccg) return;
            if (!ccg.isMobxFlow && m.__flows && ~m.__flows.indexOf(guardName)) ccg = _this2.ReactVueLike.flow(ccg);
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
            var _ref4 = _asyncToGenerator(
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

            return function lazyResovle(_x, _x2) {
              return _ref4.apply(this, arguments);
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
    value: function _getChangeMatched(route, compare) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var ret = [];
      if (!compare) return _toConsumableArray(route.matched);
      var start = false;
      route && route.matched.some(function (tr, i) {
        var fr = compare.matched[i];

        if (!start) {
          start = (0, _routeLazy.hasRouteLazy)(tr) || !fr || fr.path !== tr.path;
          if (!start) return;
        }

        ret.push(tr);
        return typeof options.count === 'number' && ret.length === options.count;
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
            }, r);
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
              }, r);
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
              return fn.call(this, to, current, r);
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
    key: "_transformLocation",
    value: function _transformLocation(location) {
      if (!location) return location;

      if (this.basename) {
        if (location.pathname.indexOf(this.basename) !== 0) return null;
        location = _objectSpread({}, location);
        location.pathname = location.pathname.substr(this.basename.length) || '/';
        if (location.fullPath) location.fullPath = location.fullPath.substr(this.basename.length) || '/';
        if (location.path !== undefined) location.path = location.pathname;
      }

      return location;
    }
  }, {
    key: "_handleRouteInterceptor",
    value: function () {
      var _handleRouteInterceptor2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(location, callback) {
        var _len4,
            args,
            _key4,
            _args2 = arguments;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (typeof location === 'string') location = _routeCache.default.flush(location);
                location = this._transformLocation(location);

                if (location) {
                  _context2.next = 4;
                  break;
                }

                return _context2.abrupt("return", callback(true));

              case 4:
                this._callEvent('onRouteing', true);

                _context2.prev = 5;

                for (_len4 = _args2.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
                  args[_key4 - 2] = _args2[_key4];
                }

                _context2.next = 9;
                return this._internalHandleRouteInterceptor.apply(this, [location, callback].concat(args));

              case 9:
                return _context2.abrupt("return", _context2.sent);

              case 10:
                _context2.prev = 10;

                this._callEvent('onRouteing', false);

                return _context2.finish(10);

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5,, 10, 13]]);
      }));

      function _handleRouteInterceptor(_x3, _x4) {
        return _handleRouteInterceptor2.apply(this, arguments);
      }

      return _handleRouteInterceptor;
    }()
  }, {
    key: "_routetInterceptors",
    value: function () {
      var _routetInterceptors2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(interceptors, to, from, next) {
        var _this5 = this;

        var isBlock, beforeInterceptor, _beforeInterceptor;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _beforeInterceptor = function _ref7() {
                  _beforeInterceptor = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee4(interceptor, index, to, from, next) {
                    var _this6 = this;

                    var nextWrapper;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            if (!(interceptor && interceptor.lazy)) {
                              _context4.next = 6;
                              break;
                            }

                            _context4.next = 3;
                            return interceptor(interceptors, index);

                          case 3:
                            interceptor = _context4.sent;
                            _context4.next = 0;
                            break;

                          case 6:
                            if (interceptor) {
                              _context4.next = 8;
                              break;
                            }

                            return _context4.abrupt("return", next());

                          case 8:
                            nextWrapper = this._nexting = (0, _util.once)(
                            /*#__PURE__*/
                            function () {
                              var _ref5 = _asyncToGenerator(
                              /*#__PURE__*/
                              regeneratorRuntime.mark(function _callee3(f1) {
                                var nextInterceptor;
                                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                  while (1) {
                                    switch (_context3.prev = _context3.next) {
                                      case 0:
                                        nextInterceptor = interceptors[++index];

                                        if (!isBlock.call(_this6, f1, interceptor)) {
                                          _context3.next = 3;
                                          break;
                                        }

                                        return _context3.abrupt("return", next(f1));

                                      case 3:
                                        if (f1 === true) f1 = undefined;

                                        if (nextInterceptor) {
                                          _context3.next = 6;
                                          break;
                                        }

                                        return _context3.abrupt("return", next(function (res) {
                                          return (0, _util.isFunction)(f1) && f1(res);
                                        }));

                                      case 6:
                                        _context3.prev = 6;
                                        _context3.next = 9;
                                        return beforeInterceptor.call(_this6, nextInterceptor, index, to, from, next);

                                      case 9:
                                        return _context3.abrupt("return", _context3.sent);

                                      case 12:
                                        _context3.prev = 12;
                                        _context3.t0 = _context3["catch"](6);
                                        console.error(_context3.t0);
                                        next(typeof _context3.t0 === 'string' ? new Error(_context3.t0) : _context3.t0);

                                      case 16:
                                      case "end":
                                        return _context3.stop();
                                    }
                                  }
                                }, _callee3, null, [[6, 12]]);
                              }));

                              return function (_x14) {
                                return _ref5.apply(this, arguments);
                              };
                            }());
                            _context4.next = 11;
                            return interceptor(to, from, nextWrapper, interceptor.route);

                          case 11:
                            return _context4.abrupt("return", _context4.sent);

                          case 12:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4, this);
                  }));
                  return _beforeInterceptor.apply(this, arguments);
                };

                beforeInterceptor = function _ref6(_x9, _x10, _x11, _x12, _x13) {
                  return _beforeInterceptor.apply(this, arguments);
                };

                isBlock = function isBlock(v, interceptor) {
                  var _isLocation = typeof v === 'string' || (0, _util.isLocation)(v);

                  if (_isLocation && interceptor) {
                    v = _this5.createRoute((0, _util.normalizeLocation)(v, interceptor.route));

                    if (v.fullPath === to.fullPath) {
                      v = undefined;
                      _isLocation = false;
                    }
                  }

                  return !_this5._history || v === false || _isLocation || v instanceof Error;
                };

                if (!next) {
                  _context5.next = 8;
                  break;
                }

                _context5.next = 6;
                return beforeInterceptor.call(this, interceptors[0], 0, to, from, next);

              case 6:
                _context5.next = 9;
                break;

              case 8:
                _util.afterInterceptors.call(this, interceptors, to, from);

              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _routetInterceptors(_x5, _x6, _x7, _x8) {
        return _routetInterceptors2.apply(this, arguments);
      }

      return _routetInterceptors;
    }()
  }, {
    key: "_internalHandleRouteInterceptor",
    value: function () {
      var _internalHandleRouteInterceptor2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(location, callback) {
        var _this7 = this;

        var isInit,
            isContinue,
            to,
            from,
            current,
            fallbackView,
            _args6 = arguments;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                isInit = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : false;
                isContinue = false;
                _context6.prev = 2;
                to = this.createRoute(location);
                from = isInit ? null : to.redirectedFrom || this.currentRoute;
                current = this.currentRoute;

                if (!(to && from && to.fullPath === from.fullPath)) {
                  _context6.next = 10;
                  break;
                }

                callback(true);
                if (to.onInit) to.onInit(Boolean(to), to);
                return _context6.abrupt("return");

              case 10:
                if ((0, _routeLazy.hasMatchedRouteLazy)(to.matched)) {
                  fallbackView = this.viewRoot;

                  this._getSameMatched(isInit ? null : this.currentRoute, to).reverse().some(function (m) {
                    if (!m.viewInstances.default || !m.viewInstances.default.props.fallback) return;
                    return fallbackView = m.viewInstances.default;
                  });
                }

                fallbackView && fallbackView._updateResolving(true);

                this._routetInterceptors(this._getBeforeEachGuards(to, from, current), to, from, function (ok) {
                  _this7._nexting = null;
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

                  callback(isContinue, to);

                  if (!isContinue) {
                    if ((0, _util.isLocation)(ok)) {
                      if (to.onAbort) ok.onAbort = to.onAbort;
                      if (to.onComplete) ok.onComplete = to.onComplete;
                      return _this7.redirect(ok, null, null, to.onInit || (isInit ? callback : null), to);
                    }

                    if (to && (0, _util.isFunction)(to.onAbort)) to.onAbort(ok, to);
                    if (ok instanceof Error) _this7.errorCallback && _this7.errorCallback(ok);
                    return;
                  }

                  if (to.onInit) to.onInit(Boolean(to), to);

                  _this7.nextTick(function () {
                    if ((0, _util.isFunction)(ok)) ok = ok(to);

                    if (!isInit && (!current || current.fullPath !== to.fullPath)) {
                      _this7._routetInterceptors(_this7._getRouteUpdateGuards(to, current), to, current);
                    }

                    if (to && (0, _util.isFunction)(to.onComplete)) to.onComplete(ok, to);

                    _this7._routetInterceptors(_this7._getAfterEachGuards(to, current), to, current);
                  });
                });

                _context6.next = 19;
                break;

              case 15:
                _context6.prev = 15;
                _context6.t0 = _context6["catch"](2);
                console.error(_context6.t0);
                if (!isContinue) callback(isContinue);

              case 19:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[2, 15]]);
      }));

      function _internalHandleRouteInterceptor(_x15, _x16) {
        return _internalHandleRouteInterceptor2.apply(this, arguments);
      }

      return _internalHandleRouteInterceptor;
    }()
  }, {
    key: "_go",
    value: function _go(to, onComplete, onAbort, onInit, replace) {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        to = (0, _util.normalizeLocation)(to, _this8.currentRoute, false, _this8.basename);

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
        if (_this8._nexting) return _this8._nexting(to);

        if (replace) {
          to.isReplace = true;
          if (to.fullPath && (0, _util.isAbsoluteUrl)(to.fullPath)) location.replace(to.fullPath);else _this8.history.replace(to);
        } else {
          if (to.fullPath && (0, _util.isAbsoluteUrl)(to.fullPath)) location.href = to.fullPath;else _this8.history.push(to);
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
        return ~['path', 'name', 'subpath', 'meta', 'redirect', 'depth'].indexOf(key) && (ret[key] = route[key]);
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
      var _this9 = this;

      if (!from) from = this.currentRoute;

      function copyInstance(to, from) {
        if (!from) return;
        if (from.componentInstances) to.componentInstances = from.componentInstances;
        if (from.viewInstances) to.viewInstances = from.viewInstances;
      }

      var matched = (0, _util.matchRoutes)(this.routes, to, parent);
      return matched.map(function (_ref8, i) {
        var route = _ref8.route,
            match = _ref8.match;

        var ret = _this9.createMatchedRoute(route, match);

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
    value: function updateRoute(location) {
      location = location && this._transformLocation(location);
      if (!location) return;
      this.prevRoute = this.currentRoute;
      this.currentRoute = this.createRoute(location, this.prevRoute); // const statesLen = this.states.length + this.stateOrigin;
      // const historyLen = this.history.length - this.stateOrigin;
      // if (this.history.action === 'POP') {
      //   this.currentRoute.state = this.states[historyLen];
      //   if (statesLen > this.history.length) this.states.splice(historyLen);
      // } else {
      //   if (statesLen > this.history.length) this.states.splice(historyLen - 1);
      //   this.states.push(this.currentRoute.state);
      // }

      var tm = this.prevRoute && this._getChangeMatched(this.prevRoute, this.currentRoute, {
        count: 1
      })[0];

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
    value: function install(ReactVueLike, _ref9) {
      var App = _ref9.App;
      this.ReactVueLike = ReactVueLike;
      this.App = App;
      if (!App.inherits) App.inherits = {};
      App.inherits.$router = this;
      App.inherits.$route = ReactVueLike.observable(this.currentRoute || {});
      _config.default.inheritProps = false;

      if (!ReactVueLike.config.inheritMergeStrategies.$route) {
        ReactVueLike.config.inheritMergeStrategies.$route = _config.default.routeMergeStrategie;
      }

      var router = this;
      this.plugin({
        name: 'react-view-router-vue-like-plugin',
        onRouteChange: ReactVueLike.action("[react-view-router][".concat(this.id, "]onRouteChange"), function (newVal) {
          if (router.app) {
            router.app.$route = ReactVueLike.observable(newVal, {}, {
              deep: false
            });
          } else {
            App.inherits.$route = ReactVueLike.observable(newVal, {}, {
              deep: false
            });
            if (App.inherits.$router !== router) App.inherits.$router = router;
          }
        })
      });
    }
  }, {
    key: "history",
    get: function get() {
      var _this10 = this;

      if (this._history) return this._history;
      var options = this.options;

      if (options.history) {
        if (options.history instanceof ReactViewRouter) {
          this._history = options.history.history;
          this.mode = options.history.mode;
        } else this._history = options.history;
      } else {
        switch (this.mode) {
          case 'browser':
          case 'history':
            this._history = (0, _historyFix.createBrowserHistory)(this.options);
            break;

          case 'memory':
          case 'abstract':
            this._history = (0, _historyFix.createMemoryHistory)(this.options);
            break;

          default:
            this._history = (0, _historyFix.createHashHistory)(this.options);
        }
      }

      Object.keys(this._history).forEach(function (key) {
        return !~HISTORY_METHS.indexOf(key) && (_this10[key] = _this10._history[key]);
      });
      HISTORY_METHS.forEach(function (key) {
        return _this10[key] && (_this10[key] = _this10[key].bind(_this10));
      });
      return this._history;
    }
  }]);

  return ReactViewRouter;
}();

exports.default = ReactViewRouter;