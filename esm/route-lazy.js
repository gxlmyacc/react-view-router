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

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

var _routeGuard = require("./route-guard");

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

        if (!component) throw new Error('component should not null!');

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