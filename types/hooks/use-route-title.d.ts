/// <reference types="react" />
import ReactViewRouter from '../router';
import { ConfigRoute, ConfigRouteArray, MatchedRoute, RouteChildrenFn } from '../types';
import { isCommonPage } from './base';
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
    route: ConfigRoute;
    level: number;
    children?: RouteTitleInfo[];
};
declare function readRouteTitle(route: ConfigRoute, options?: {
    titleName?: string;
    router?: ReactViewRouter;
    level?: number;
    maxLevel?: number;
    refresh?: () => void;
}): {
    visible: boolean;
    title: string;
};
declare function walkRouteTitle(router: ReactViewRouter, routes: ConfigRouteArray | RouteChildrenFn, refresh: () => void, filter?: filterCallback, titleName?: string, maxLevel?: number, level?: number): RouteTitleInfo[];
declare function isTitleRoute(route?: ConfigRoute | MatchedRoute | null, titleName?: string): boolean | null | undefined;
declare type OnNoMatchedPathCallback = (matchedPath: string, titles: RouteTitleInfo[], fallback: (fallbackPath: Parameters<ReactViewRouter['replace']>[0]) => void) => void | Promise<void>;
declare type UseRouteTitleProps = {
    maxLevel?: number;
    filter?: filterCallback;
    filterMetas?: string[];
    manual?: boolean;
    matchedOffset?: number;
    commonPageName?: string;
    titleName?: string;
    onNoMatchedPath?: ':first' | string | OnNoMatchedPathCallback;
};
declare type RefreshTitlesFn = () => void;
declare function useRouteTitle(props?: UseRouteTitleProps, defaultRouter?: ReactViewRouter, deps?: React.DependencyList[]): {
    parsed: boolean;
    titles: RouteTitleInfo[];
    setTitles: import("react").Dispatch<import("react").SetStateAction<RouteTitleInfo[]>>;
    refreshTitles: RefreshTitlesFn;
    matchedRoutes: MatchedRoute[];
    matchedTitles: RouteTitleInfo[];
    currentPaths: string[];
};
export { isTitleRoute, isCommonPage, readRouteTitle, walkRouteTitle, filterCallback, RouteTitleInfo, };
export default useRouteTitle;
