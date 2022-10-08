
import {
  State, History, HashType, To,
  HistoryType, HistoryOptions,
} from './types';
import { getPossibleHashType, createHref } from './utils';
import { createHistory } from './history';

/**
 * A browser history stores the current location in regular URLs in a web
 * browser environment. This is the standard for most web apps and provides the
 * cleanest URLs the browser's address bar.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#browserhistory
 */
export interface BrowserHistory<S extends State = State> extends History<S> {}

export interface BrowserHistoryOptions extends HistoryOptions {
  window?: Window,
  hashType?: HashType,
}

export function createBrowserHref(to: To, hashType?: HashType) {
  return createHref(to, hashType);
}

/**
 * Browser history stores the location in regular URLs. This is the standard for
 * most web apps, but it requires some configuration on the server to ensure you
 * serve the same app at multiple URLs.
 *
 * @see https://github.com/ReactTraining/history/tree/master/docs/api-reference.md#createbrowserhistory
 */
export function createBrowserHistory(
  options: BrowserHistoryOptions = {}
): BrowserHistory {
  const {
    window = document.defaultView!,
  } = options;
  const {
    hashType = getPossibleHashType(window)
  } = options;

  const type = HistoryType.browser;

  const history = createHistory({
    window,
    type,
    getLocationPath: () => window.location,
    createHref: (to: To) => createBrowserHref(to, hashType),
    extra: options.extra,
  }) as BrowserHistory;

  return history;
}
