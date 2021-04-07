import { TokensToRegexpOptions, ParseOptions } from 'path-to-regexp';
import { matchPathResult } from './types';
interface matchPathOptions {
    path?: string;
    exact?: boolean;
}
/**
 * Public API for matching a URL pathname to a path.
 */
declare function matchPath(pathname: string, options?: (TokensToRegexpOptions & ParseOptions & matchPathOptions & {
    subpath?: string;
})): matchPathResult;
export declare function computeRootMatch(pathname?: string): matchPathResult;
export default matchPath;
