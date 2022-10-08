import { History, HistoryType, To, PartialPath } from './types';
export declare const HashChangeEventType = "hashchange";
export declare const PopStateEventType = "popstate";
export declare function createHistory(options: {
    window: Window;
    type: HistoryType;
    getLocationPath: () => PartialPath;
    createHref: (to: To) => string;
    extra?: any;
}): History;
