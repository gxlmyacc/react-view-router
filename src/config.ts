const encodeReserveRE = /[!'()*]/g;
const encodeReserveReplacer = (c: string) => '%' + c.charCodeAt(0).toString(16);
const commaRE = /%2C/g;

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
const encode = (str: string) => encodeURIComponent(str)
  .replace(encodeReserveRE, encodeReserveReplacer)
  .replace(commaRE, ',');

const decode = decodeURIComponent;

function _parseQuery(query: string) {
  const res: any = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res;
  }

  query.split('&').forEach((param: string) => {
    const parts: string[] = param.replace(/\+/g, ' ').split('=');
    const key: string = decode(parts.shift() || '');
    const val: any = parts.length > 0
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

function _stringifyQuery(obj: { [key: string]: any }) {
  const res = obj ? Object.keys(obj).map((key: string) => {
    const val: any = obj[key];

    if (val === undefined) {
      return '';
    }

    if (val === null) {
      return encode(key);
    }

    if (Array.isArray(val)) {
      const result: string[] = [];
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
  }).filter((x: string) => x.length > 0).join('&') : null;
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

  routeMergeStrategie(parent: any, child: any, vm: any) {
    const router = vm.$router || vm._inherits.$router;
    if (vm._isVueLikeRoot) {
      if (router) {
        if (!router.App || (vm instanceof router.App)) router.app = vm;
      }
      return parent;
    }
    vm.$computed(vm, '$route', function () {
      return this.$root ? this.$root.$route : null;
    });
    vm.$computed(vm, '$routeIndex', function () {
      if (this._routeIndex !== undefined) return this._routeIndex;
      let routeView = router.getHostRouterView(this, (v: any) => !v._isVueLikeRoot);
      return this._routeIndex = routeView ? routeView.state._routerDepth : -1;
    });
    vm.$computed(vm, '$matchedRoute', function () {
      return (this.$route && this.$route.matched[this.$routeIndex]) || null;
    });
  },

};