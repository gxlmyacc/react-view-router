"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RouterCache =
/*#__PURE__*/
function () {
  function RouterCache() {
    _classCallCheck(this, RouterCache);

    this.cached = {};
    this.seed = 0;
  }

  _createClass(RouterCache, [{
    key: "create",
    value: function create(data) {
      var key = "[route_cache_id:".concat(++this.seed, "]");
      this.cached[key] = data;
      return key;
    }
  }, {
    key: "flush",
    value: function flush(seed) {
      if (!seed) return;
      var ret = this.cached[seed];
      delete this.cached[seed];
      return ret;
    }
  }]);

  return RouterCache;
}();

var routeCache = new RouterCache();
var _default = routeCache;
exports.default = _default;