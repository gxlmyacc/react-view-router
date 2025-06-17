import {
  PartialPath, To, HashType, Blocker, State, Action, Location
} from './types';

const CAN_USE_DOM = !!(
  typeof window !== 'undefined'
  && window.document
  && window.document.createElement
);

// eslint-disable-next-line no-constant-condition
const freeze: <T extends unknown>(obj: T) => T = false /** __DEV__* */
  ? obj => Object.freeze(obj)
  : obj => obj;


function getPossibleHashType(_window: Window = document.defaultView!, hash: string = '') {
  if (!hash || !hash.startsWith('#')) hash = _window.location.hash;
  let locationHash = hash.substr(1, 1);
  return (!locationHash || locationHash === '/') ? 'slash' : 'noslash';
}

function clamp(n: number, lowerBound: number, upperBound: number) {
  return Math.min(Math.max(n, lowerBound), upperBound);
}

// function promptBeforeUnload(event: BeforeUnloadEvent) {
//   // Cancel the event.
//   event.preventDefault();
//   // Chrome (and legacy IE) requires returnValue to be set.
//   event.returnValue = '';
// }

 type Events<F> = {
  length: number;
  push: (fn: F) => () => void;
  call: (arg: any, payload?: any) => void;
};

function createEvents<F extends Function>(): Events<F> {
  let handlers: F[] = [];

  return {
    get length() {
      return handlers.length;
    },
    push(fn: F) {
      handlers.push(fn);
      return function () {
        handlers = handlers.filter(handler => handler !== fn);
      };
    },
    call(arg: any, payload?: any) {
      handlers.forEach(fn => fn && fn(arg, payload));
    }
  };
}

function createKey() {
  return Math.random()
    .toString(36)
    .substr(2, 8);
}

function getBaseHref() {
  if (!CAN_USE_DOM) return '';
  let base = globalThis.document.querySelector('base');
  let href = '';

  if (base && base.getAttribute('href')) {
    let url = globalThis.location.href;
    let hashIndex = url.indexOf('#');
    href = hashIndex === -1 ? url : url.slice(0, hashIndex);
  }

  return href;
}


/**
 * Creates a string URL path from the given pathname, search, and hash components.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#createpath
 */
function createPath({
  pathname = '/',
  search = '',
  hash = '',
}: PartialPath) {
  return pathname + search + hash;
}

/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#parsepath
 */
function parsePath(path: string) {
  let partialPath: PartialPath = {};

  if (path) {
    let hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      partialPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
      if (path && !path.startsWith('/')) path = '/' + path;
    }

    let searchIndex = path.indexOf('?');
    if (searchIndex >= 0) {
      partialPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
      if (path && !path.startsWith('/')) path = '/' + path;
    }

    if (path) {
      partialPath.pathname = path;
    }
  }

  return partialPath;
}

function createHref(to: To, hashType?: HashType, _window: any = globalThis) {
  let path = typeof to === 'string' ? to : createPath(to);

  if (!hashType) hashType = getPossibleHashType(_window, path);

  if (hashType != null) {
    let pathPrefix =  '';
    if (path.startsWith('#')) {
      pathPrefix = '#';
      path = path.substr(1, path.length);
    }

    let slashChar = path.substr(0, 1);
    if (hashType === 'slash') {
      if (slashChar !== '/') path = '/' + path;
    } else  if (hashType === 'noslash') {
      if (slashChar === '/') path = path.substr(1);
    }

    path = pathPrefix + path;
  }

  return path;
}

function allowTxWithParams(
  blockers: Events<Blocker<State>>,
  params: {
    action: Action,
    location: Location,
    index: number,
    nextIndex: number,
    callback: ((ok: boolean, payload?: any) => void)|null
  }
) {
  let resultPayload: any;
  let count = blockers.length;
  let cb = params.callback;
  function callback(ok: boolean, payload?: any) {
    if (!cb) return;
    if (!ok) {
      cb(ok);
      cb = null;
      return;
    }
    if (arguments.length > 1) resultPayload = payload;
    if (!(--count)) {
      cb(ok, resultPayload);
      cb = null;
    }
  }
  return (
    !blockers.length || (blockers.call({
      ...params,
      callback
    }), false)
  );
}

function allowTx(
  blockers: Events<Blocker<State>>,
  action: Action,
  location: Location,
  index: number,
  nextIndex: number,
  callback: ((ok: boolean, payload?: any) => void)|null
) {
  return allowTxWithParams(blockers, {
    action,
    location,
    index,
    nextIndex,
    callback
  });
}

function readonly<T extends object>(
  obj: T,
  key: string,
  get: () => any,
  options?: PropertyDescriptor
) {
  const { configurable = true, enumerable = true, ...restOptions } = options || {};
  Object.defineProperty(obj, key, { get, configurable, enumerable, ...restOptions });
  return obj;
}

const _hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwnProp(obj: any, key: PropertyKey) {
  return Boolean(obj) && _hasOwnProperty.call(obj, key);
}

function copyOwnProperty(target: any, key: string, source: any): PropertyDescriptor | undefined {
  if (!target || !source) return;
  const d = Object.getOwnPropertyDescriptor(source, key);
  d && Object.defineProperty(target, key, d);
  return d;
}
function copyOwnProperties<
 T extends Record<string, any>,
 S extends Record<string, any>
>(target: T|null, source: S|null, overwrite?: boolean): T & S {
  if (!target || !source) {
    return target as any;
  }
  Object.getOwnPropertyNames(source).forEach(key => {
    if (!overwrite && hasOwnProp(target, key)) return;
    copyOwnProperty(target, key, source);
  });
  return target as any;
}

export type {
  Events
}

export {
  CAN_USE_DOM,
  freeze,
  getPossibleHashType,
  clamp,
  createEvents,
  createKey,
  getBaseHref,
  createPath,
  parsePath,
  createHref,
  allowTxWithParams,
  allowTx,
  readonly,
  hasOwnProp,
  copyOwnProperty,
  copyOwnProperties,
}
