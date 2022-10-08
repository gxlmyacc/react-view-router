import { HashHistoryOptions, BrowserHistoryOptions, getBaseHref, History } from './history';
import { HistoryFix, RouteHistoryLocation, RouteInterceptorItem, History4, ReactViewRouterMoreOptions } from './types';
import ReactViewRouter from './router';
import { REACT_VIEW_ROUTER_GLOBAL } from './global';
declare function confirmInterceptors(interceptors: RouteInterceptorItem[], location: RouteHistoryLocation, callback: (ok: boolean, payload: RouteInterceptorItem[]) => void): void;
declare function isHistory4(history: any): history is History4;
declare function createHashHistoryNew(options: HashHistoryOptions & {
    history?: HistoryFix;
}, router: ReactViewRouter): HistoryFix;
declare function createBrowserHistoryNew(options: BrowserHistoryOptions & {
    history?: HistoryFix;
}, router: ReactViewRouter): HistoryFix;
declare function createMemoryHistoryNew(options: {
    history?: HistoryFix;
    pathname?: string;
}, router: ReactViewRouter): HistoryFix;
declare function getPossibleHistory(options?: ReactViewRouterMoreOptions): HistoryFix | null;
export { createHashHistoryNew as createHashHistory, createBrowserHistoryNew as createBrowserHistory, createMemoryHistoryNew as createMemoryHistory, getBaseHref, getPossibleHistory, History, HistoryFix, confirmInterceptors, REACT_VIEW_ROUTER_GLOBAL, isHistory4 };
