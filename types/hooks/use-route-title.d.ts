/// <reference types="react" />
import ReactViewRouter from '../router';
import { ConfigRoute, ConfigRouteArray, MatchedRoute, Route } from '../types';
declare type filterCallback = (r: ConfigRoute, routes: ConfigRouteArray, props: {
    router: ReactViewRouter;
    level: number;
    maxLevel: number;
    refresh: () => void;
    title?: string;
    visible?: boolean;
}) => boolean;
declare type RouteTitleInfo = {
    title: string;
    path: string;
    meta: Partial<any>;
    children?: RouteTitleInfo[];
};
declare function readRouteMeta(route: ConfigRoute, key?: string, props?: {
    router?: ReactViewRouter | null;
    [key: string]: any;
}): any;
declare function walkRouteTitle(router: ReactViewRouter, routes: ConfigRouteArray | undefined, refresh: () => void, filter?: filterCallback, maxLevel?: number, level?: number): (RouteTitleInfo | undefined)[];
declare function isCommonPage(matched: MatchedRoute[]): boolean;
declare function getMatched(router: ReactViewRouter, currentRoute: Route): MatchedRoute[];
declare function useRouteTitle(props?: {
    maxLevel?: number;
    filter?: filterCallback;
    filterMetas?: string[];
    manual?: boolean;
    matchedOffset?: number;
}, defaultRouter?: ReactViewRouter, deps?: any[]): {
    titles: (RouteTitleInfo | undefined)[];
    setTitles: import("react").Dispatch<import("react").SetStateAction<(RouteTitleInfo | undefined)[]>>;
    refreshTitles: () => void;
    currentPaths: string[];
    setCurrentPaths: import("react").Dispatch<import("react").SetStateAction<string[]>>;
};
export { isCommonPage, readRouteMeta, walkRouteTitle, getMatched, filterCallback, RouteTitleInfo, };
export default useRouteTitle;
