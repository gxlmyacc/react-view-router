import pathToRegexp from 'path-to-regexp';
import { matchPathResult } from './globals';
interface matchPathOptions {
    path?: string;
    exact?: boolean;
}
/**
 * Public API for matching a URL pathname to a path.
 */
declare function matchPath(pathname: string, options?: (pathToRegexp.RegExpOptions & pathToRegexp.ParseOptions & matchPathOptions)): matchPathResult;
export declare function computeRootMatch(pathname: string): {
    path: string;
    url: string;
    params: {};
    isExact: boolean;
};
export default matchPath;
