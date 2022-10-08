import { State, History, HashType, To, HistoryOptions } from './types';
/**
 * A browser history stores the current location in regular URLs in a web
 * browser environment. This is the standard for most web apps and provides the
 * cleanest URLs the browser's address bar.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#browserhistory
 */
export interface BrowserHistory<S extends State = State> extends History<S> {
}
export interface BrowserHistoryOptions extends HistoryOptions {
    window?: Window;
    hashType?: HashType;
}
export declare function createBrowserHref(to: To, hashType?: HashType): string;
/**
 * Browser history stores the location in regular URLs. This is the standard for
 * most web apps, but it requires some configuration on the server to ensure you
 * serve the same app at multiple URLs.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#createbrowserhistory
 */
export declare function createBrowserHistory(options?: BrowserHistoryOptions): BrowserHistory;
