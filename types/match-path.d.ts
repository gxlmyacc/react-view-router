/**
 * Public API for matching a URL pathname to a path.
 */
declare function matchPath(pathname: any, options?: {}): any;
export declare function computeRootMatch(pathname: any): {
    path: string;
    url: string;
    params: {};
    isExact: boolean;
};
export default matchPath;
