import ReactViewRouter from './router';
import { ParseQueryProps } from './types';

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

function parseQuery(query: string, props: ParseQueryProps = {}) {
  const res: Partial<any> = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res;
  }

  query.split('&').forEach((param: string) => {
    const parts: string[] = param.replace(/\+/g, ' ').split('=');
    const key: string = decode(parts.shift() || '');
    let val: any = parts.length > 0
      ? decode(parts.join('='))
      : null;
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (val === 'null') val = null;
    else if (val === 'undefined') val = undefined;
    else if (val === 'NaN') val = NaN;
    else if ((val || '').indexOf('[object ') !== 0 && /^(\{.*\})|(\[.*\])$/.test(val)) {
      try { val = JSON.parse(val); } catch (e) { /* empty */ }
    } else if (props[key]) {
      try { val = props[key](val, key, query); } catch (e) { console.error(e); }
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

function stringifyQuery(obj: Partial<any> | null | undefined, prefix = '?') {
  const res = obj ? Object.keys(obj).map((key: string) => {
    let val: any = obj[key];

    if (val === undefined) return '';

    if (val === null || val === undefined) return encode(key);

    if (Array.isArray(val)) {
      const result: string[] = [];
      val.forEach(val2 => {
        if (val2 === undefined) return;
        if (val2 === null) {
          result.push(encode(key));
        } else {
          if (typeof val2 === 'object') val2 = JSON.stringify(val2);
          result.push(encode(key) + '=' + encode(val2));
        }
      });
      return result.join('&');
    }

    if (typeof val === 'object') val = JSON.stringify(val);
    return encode(key) + '=' + encode(val);
  }).filter((x: string) => x.length > 0).join('&') : null;
  return res ? `${prefix}${res}` : '';
}

export {
  parseQuery,
  stringifyQuery
};

export default {
  _parseQuery: parseQuery,
  _stringifyQuery: stringifyQuery,

  inheritProps: true,

  zIndexStart: 0,
  zIndexStep: 1,

  get parseQuery() {
    return this._parseQuery;
  },
  get stringifyQuery() {
    return this._stringifyQuery;
  },

  createMergeStrategie(router: ReactViewRouter) {
    return function routeMergeStrategie(parent: any, child: any, vm: any) {
      if (vm._isVuelikeRoot) {
        if (router.Apps.some(App => vm instanceof App)) {
          router.apps.push(vm);
          vm.$on('componentDidUnmount', () => {
            const idx = router.apps.indexOf(vm);
            if (~idx) router.apps.splice(idx, 1);
          });
        }
        return parent;
      }
      vm.$computed(vm, '$route', function () {
        return this.$root ? this.$root.$route : null;
      });
      vm.$computed(vm, '$routeIndex', function () {
        if (this._routeIndex !== undefined) return this._routeIndex;
        let routeView = router.getHostRouterView(this, (v: any) => !v._isVuelikeRoot);
        return this._routeIndex = routeView ? routeView.state._routerDepth : -1;
      });
      vm.$computed(vm, '$matchedRoute', function () {
        return (this.$route && this.$route.matched[this.$routeIndex]) || null;
      });
    };
  },

};
