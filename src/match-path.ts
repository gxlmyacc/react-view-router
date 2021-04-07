import { pathToRegexp, TokensToRegexpOptions, ParseOptions, Key } from 'path-to-regexp';
import { matchPathResult } from './types';

const cache: { [key: string]: any } = {};
const cacheLimit = 10000;
let cacheCount = 0;

function compilePath(path: string, options: (TokensToRegexpOptions & ParseOptions)) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache: { [key: string]: any } = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) return pathCache[path];

  const keys: Key[] = [];
  const regx = pathToRegexp(path, keys, options);
  const result = { regx, keys };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}

interface matchPathOptions {
  path?: string,
  exact?: boolean
}

/**
 * Public API for matching a URL pathname to a path.
 */
function matchPath(pathname: string, options: (
  TokensToRegexpOptions
  & ParseOptions
  & matchPathOptions
  & { subpath?: string }
  ) = {}): matchPathResult {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = { path: options as any } as TokensToRegexpOptions;
  }

  let { path = '', subpath, exact = false, strict = false, sensitive = false } = options;
  if (subpath === '*') path = path.replace(/\*$/, ':fallback([^\\/]*)');

  const paths = ([] as string[]).concat(path || []);

  return paths.reduce((matched: any, path: string) => {
    if (!path && path !== '') return null;
    if (matched) return matched;

    const { regx, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    const match = regx.exec(pathname);

    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      path, // the path used to match
      url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      regx,
      params: keys.reduce((memo: any, key: any, index: number) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}

export function computeRootMatch(pathname: string = '/'): matchPathResult {
  return { path: '/', url: '/', params: {}, regx: compilePath('/', {}), isExact: pathname === '/' };
}

export default matchPath;
