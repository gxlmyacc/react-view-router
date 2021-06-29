/// <reference types="react" />
import RainbowRouter from '../router';
import { ConfigRoute, ConfigRouteArray } from '../types';
declare type filterCallback = (r: ConfigRoute, routes: ConfigRouteArray, props: {
    router: RainbowRouter;
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
    router?: RainbowRouter | null;
    [key: string]: any;
}): any;
declare function walkRouteTitle(router: RainbowRouter, routes: ConfigRouteArray | undefined, refresh: () => void, filter?: filterCallback, maxLevel?: number, level?: number): (RouteTitleInfo | undefined)[];
declare function useRouteTitle(props?: {
    maxLevel?: number;
    filter?: filterCallback;
    filterMetas?: string[];
    manual?: boolean;
}, defaultRouter?: RainbowRouter, deps?: any[]): {
    titles: (RouteTitleInfo | undefined)[];
    setTitles: import("react").Dispatch<import("react").SetStateAction<(RouteTitleInfo | undefined)[]>>;
    refreshTitles: () => void;
    currentPaths: string[];
    setCurrentPaths: import("react").Dispatch<import("react").SetStateAction<string[]>>;
};
export { readRouteMeta, walkRouteTitle, };
export default useRouteTitle;
