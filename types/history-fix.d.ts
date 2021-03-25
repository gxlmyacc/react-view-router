import { MemoryHistoryOptions, HashHistoryOptions, BrowserHistoryOptions, getBaseHref, History } from './history';
import { HistoryFix, RouteHistoryLocation, RouteInterceptorItem } from './types';
export declare enum HistoryType {
    hash = "hash",
    browser = "browser",
    memory = "memory"
}
declare function confirmInterceptors(interceptors: HistoryFix | RouteInterceptorItem[], location: string | RouteHistoryLocation, callback: (ok: boolean) => void): void;
declare function createHashHistoryNew(options: HashHistoryOptions): HistoryFix;
declare function createBrowserHistoryNew(options: BrowserHistoryOptions): HistoryFix;
declare function createMemoryHistoryNew(options: MemoryHistoryOptions): HistoryFix;
declare function getPossibleRouterMode(): "" | "browser" | "hash";
export { createHashHistoryNew as createHashHistory, createBrowserHistoryNew as createBrowserHistory, createMemoryHistoryNew as createMemoryHistory, getBaseHref, getPossibleRouterMode, History, HistoryFix, confirmInterceptors };
