import { HistoryStackInfo, RouteHistoryLocation, MatchedRouteArray } from './types';
type RouterBasenameContext = {
    basenameNoSlash: string;
    history: {
        stacks: HistoryStackInfo[];
    };
    stacks: HistoryStackInfo[];
};
type RouterParentResolveContext = {
    parent: {
        basename: string;
        getMatched(pathname: string): MatchedRouteArray;
        parent: RouterParentResolveContext['parent'] | null;
    } | null;
};
type RouterBrowserQueryContext = {
    isMemoryMode: boolean;
    isHashMode: boolean;
    isBrowserMode: boolean;
    parseQuery(search: string, queryProps?: any): Record<string, any>;
    queryProps?: any;
};
type RouterNestedInitContext = {
    parent: {
        basename: string;
        currentRoute: {
            url: string;
            query: Record<string, any>;
            search: string;
        } | null;
    } | null;
};
/**
 * 在 rememberInitialRoute 场景下，从 history 栈中选取 basename 对应的初始栈项。
 * @param stacks history 栈列表（含当前 location）
 * @param basenameNoSlash 无尾斜杠的 basename
 * @returns 匹配的栈项，无则 undefined
 */
export declare function pickRememberInitialBasenameStack(stacks: HistoryStackInfo[], basenameNoSlash: string): HistoryStackInfo | undefined;
/**
 * 将浏览器地址栏 query 合并到初始路由 location（hash/browser 模式）。
 * @param router 路由器实例
 * @param historyLocation 待合并的 history location
 */
export declare function mergeInitialRouteBrowserQuery(router: RouterBrowserQueryContext, historyLocation: RouteHistoryLocation): void;
/**
 * 从 history 栈同步 basename 子路径到 router.stacks。
 * @param router 路由器实例
 */
export declare function syncBasenameRouterStacks(router: RouterBasenameContext): void;
/**
 * 短 pathname 沿父级 router 解析为完整路径。
 * @param router 当前路由器
 * @param pathname 待解析路径
 * @returns 解析后的 pathname
 */
export declare function resolveShortPathnameViaParent(router: RouterParentResolveContext, pathname: string): string;
/**
 * 嵌套子 router 初始化时从父级同步 URL 到 location。
 * @param router 子路由器
 * @param location 待修正的 location
 * @param pathname 当前 pathname
 */
export declare function applyNestedChildInitLocation(router: RouterNestedInitContext, location: RouteHistoryLocation | Record<string, any>, pathname: string): void;
export {};
