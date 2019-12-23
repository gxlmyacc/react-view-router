"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.object.to-string");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var encodeReserveRE = /[!'()*]/g;

var encodeReserveReplacer = function encodeReserveReplacer(c) {
  return '%' + c.charCodeAt(0).toString(16);
};

var commaRE = /%2C/g; // fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas

var encode = function encode(str) {
  return encodeURIComponent(str).replace(encodeReserveRE, encodeReserveReplacer).replace(commaRE, ',');
};

var decode = decodeURIComponent;

function _parseQuery(query) {
  var res = {};
  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res;
  }

  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = decode(parts.shift() || '');
    var val = parts.length > 0 ? decode(parts.join('=')) : null;
    if (val === 'true') val = true;else if (val === 'false') val = false;else if (val === 'null') val = null;else if (val === 'undefined') val = undefined;else if (val === 'NaN') val = NaN;else if (val.indexOf('[object ') !== 0 && /^(\{.*\})|(\[.*\])$/.test(val)) {
      try {
        val = JSON.parse(val);
      } catch (e) {
        /* empty */
      }
    }

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });
  return res;
}

function _stringifyQuery(obj) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '?';
  var res = obj ? Object.keys(obj).map(function (key) {
    var val = obj[key];
    if (val === undefined) return '';
    if (val === null || val === undefined) return encode(key);

    if (Array.isArray(val)) {
      var result = [];
      val.forEach(function (val2) {
        if (val2 === undefined) return;

        if (val2 === null) {
          result.push(encode(key));
        } else {
          if (_typeof(val2) === 'object') val2 = JSON.stringify(val2);
          result.push(encode(key) + '=' + encode(val2));
        }
      });
      return result.join('&');
    }

    if (_typeof(val) === 'object') val = JSON.stringify(val);
    return encode(key) + '=' + encode(val);
  }).filter(function (x) {
    return x.length > 0;
  }).join('&') : null;
  return res ? "".concat(prefix).concat(res) : '';
}

var _default = {
  _parseQuery: _parseQuery,
  _stringifyQuery: _stringifyQuery,
  inheritProps: true,
  zIndexStart: 0,
  zIndexStep: 1,

  get parseQuery() {
    return this._parseQuery;
  },

  get stringifyQuery() {
    return this._stringifyQuery;
  },

  routeMergeStrategie: function routeMergeStrategie(parent, child, vm) {
    var router = vm.$router || vm._inherits.$router;

    if (vm._isVueLikeRoot) {
      if (router) {
        if (!router.App || vm instanceof router.App) router.app = vm;
      }

      return parent;
    }

    vm.$computed(vm, '$route', function () {
      return this.$root ? this.$root.$route : null;
    });
    vm.$computed(vm, '$routeIndex', function () {
      if (this._routeIndex !== undefined) return this._routeIndex;
      var routeView = router.getHostRouterView(this, function (v) {
        return !v._isVueLikeRoot;
      });
      return this._routeIndex = routeView ? routeView.state._routerDepth : -1;
    });
    vm.$computed(vm, '$matchedRoute', function () {
      return this.$route && this.$route.matched[this.$routeIndex] || null;
    });
  }
};
exports.default = _default;