const encodeReserveRE = /[!'()*]/g;
const encodeReserveReplacer = c => '%' + c.charCodeAt(0).toString(16);
const commaRE = /%2C/g;

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
const encode = str => encodeURIComponent(str)
  .replace(encodeReserveRE, encodeReserveReplacer)
  .replace(commaRE, ',');

const decode = decodeURIComponent;

function _parseQuery(query) {
  const res = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res;
  }

  query.split('&').forEach(param => {
    const parts = param.replace(/\+/g, ' ').split('=');
    const key = decode(parts.shift());
    const val = parts.length > 0
      ? decode(parts.join('='))
      : null;

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
  const res = obj ? Object.keys(obj).map(key => {
    const val = obj[key];

    if (val === undefined) {
      return '';
    }

    if (val === null) {
      return encode(key);
    }

    if (Array.isArray(val)) {
      const result = [];
      val.forEach(val2 => {
        if (val2 === undefined) {
          return;
        }
        if (val2 === null) {
          result.push(encode(key));
        } else {
          result.push(encode(key) + '=' + encode(val2));
        }
      });
      return result.join('&');
    }

    return encode(key) + '=' + encode(val);
  }).filter(x => x.length > 0).join('&') : null;
  return res ? `?${res}` : '';
}

export default {
  _parseQuery,
  _stringifyQuery,

  inheritProps: true,

  zIndexStart: 0,
  zIndexStep: 1,

  get parseQuery() {
    return this._parseQuery;
  },
  get stringifyQuery() {
    return this._stringifyQuery;
  },

  routeMergeStrategie(parent, child, vm) {
    if (vm._isVueLikeRoot) {
      vm.$set(vm, '$route', parent);
      vm.$router && (vm.$router.app = vm);
    } else {
      vm.$computed(vm, '$route', function () {
        return this.$root ? this.$root.$route : null;
      });
    }
  },

};
