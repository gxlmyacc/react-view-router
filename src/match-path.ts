import pathToRegexp from 'path-to-regexp';

const cache: { [key: string]: any } = {};
const cacheLimit = 10000;
let cacheCount = 0;

function compilePath(path: string, options: (pathToRegexp.RegExpOptions & pathToRegexp.ParseOptions)) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache: { [key: string]: any } = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) return pathCache[path];

  const keys: pathToRegexp.Key[] = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

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
  pathToRegexp.RegExpOptions
  & pathToRegexp.ParseOptions
  & matchPathOptions
  ) = {}) {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = { path: options as any } as pathToRegexp.RegExpOptions;
  }

  const { path, exact = false, strict = false, sensitive = false } = options;

  const paths = ([] as string[]).concat(path || []);

  return paths.reduce((matched: any, path: string) => {
    if (!path && path !== '') return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    const match = regexp.exec(pathname);

    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      path, // the path used to match
      url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo: any, key: any, index: number) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}

export function computeRootMatch(pathname: string) {
  return { path: '/', url: '/', params: {}, isExact: pathname === '/' };
}

export default matchPath;
